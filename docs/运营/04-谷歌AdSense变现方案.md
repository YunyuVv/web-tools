# 04 · 谷歌 AdSense 变现方案

> 适用项目：Next.js 16（App Router，`output:'export'` 纯静态导出）+ Cloudflare Pages + 三语言 i18n（`(en)` 无前缀默认语言 / `[locale]` 带 `zh-CN`、`zh-TW` 前缀）。
> 状态：**已落地（2026-07-30 实施）**。下列二/三/四节标注了实际新建/改动的代码文件，环境变量名与组件名即线上在用版本。

---

## 0. 总览：哪些要人工、哪些能代劳

| 环节 | 谁做 | 说明 |
| --- | --- | --- |
| 申请并通过 AdSense 账号 | 人工 | adsense.google.com，站点需原创内容 + 隐私政策 + 合规，审核几天到几周 |
| 拿到发布商 ID `ca-pub-XXX` | 人工 | 通过后后台显示，后续代码唯一需要的凭证 |
| 全局脚本 + 广告位 + 隐私页 + GDPR 同意条 | 代码（已落地） | 见下文二、三、四 |
| Cloudflare 填环境变量 / 重试部署 | 人工或代劳 | 见五 |

**结论**：账号申请与拿 ID 必须由你本人完成（人工审核）；代码部分可一次性落地并部署，之后你只需在 CF 环境变量填 `ca-pub-XXX`。

---

## 一、前置：申请 AdSense（人工）

1. 用目标 Google 账号登录 <https://www.google.com/adsense/>，点「开始使用」。
2. 填站点地址 `https://tools.ideaflow.top`、选「内容型网站」。
3. **先确保本站已有隐私政策页**（AdSense 审核必查；落地步骤见第四节）。如审核时还没有，会直接拒。
4. 提交后把给出的 **Ads 代码 / 发布商 ID** 记下来（`ca-pub-` 开头的 16~20 位）。
5. 等待审核（常邮件通知）。期间不要频繁改站点结构。

> 提示：工具站一般能通过，但广告单价与相关性取决于页面内容质量与流量地域。开发者工具站以中文/技术流量为主，通常可正常展示。

---

## 二、代码落地：全局脚本（已落地）

> 实际改动：`app/layout.tsx` 的 `<head>` 内，按 `NEXT_PUBLIC_ADSENSE_CLIENT_ID` 注入 `adsbygoogle.js`（`lazyOnload`，严格等页面 `load` 事件后才拉，绝不拖慢首屏/国内访问），按 `NEXT_PUBLIC_ADSENSE_FC_ID` 注入 Funding Choices 同意脚本（同样 `lazyOnload`）。下方 2.2 代码即线上在用版本。

### 2.1 用环境变量控制，本地/预览零广告

约定开关变量：`NEXT_PUBLIC_ADSENSE_CLIENT_ID`。**值为空时不注入任何广告脚本**，避免本地、Preview 部署乱展示。

### 2.2 在根布局注入加载器

⚠️ **静态导出坑（已踩过）**：`next/script` 的 `strategy="beforeInteractive"` 在 `output:'export'` 下会被序列化为 `self.__next_s.push(...)`、延迟到注水后才执行，不能用于首屏。

✅ **加载策略选用 `lazyOnload`（非 `afterInteractive`）**：本项目主要流量在国内，Google 域名（`pagead2.googlesyndication.com` 等）被墙。若用 `afterInteractive`，`async` 脚本在抓取完成/失败前会拖住浏览器 `window.load` 事件，国内请求"黑盒挂起"可达数十秒，标签页转圈晚停。改用 `lazyOnload` 后，广告脚本严格等 `window.load` 之后才拉，无论 Google 是否可达都**绝不拖慢页面加载**；AdSense 的 `adsbygoogle.push({})` 队列机制兼容晚到脚本，广告仍正常展示。

根布局 `app/layout.tsx` 的 `<head>` 内（与现有 CF beacon 并列）：

```tsx
{process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID ? (
  <Script
    id="adsbygoogle-loader"
    strategy="lazyOnload"
    src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
    crossOrigin="anonymous"
  />
) : null}
```

> 注：`<Script>` 来自 `next/script`。若想零依赖，也可裸 `<script async src=... dangerouslySetInnerHTML>`，效果一致。

### 2.3 GDPR 同意条（EEA / UK 流量强制）

Google 要求对欧洲经济区及英国用户接入**经认证的 CMP（同意管理平台）**，否则这部分流量不展示广告，甚至触发政策问题。最省事的是用 AdSense 后台自带的 **Privacy & messaging（Funding Choices）**：

1. AdSense 后台 → 「隐私权和消息」→ 按地区创建消息（默认覆盖 EEA + UK）。
2. 生成一段脚本，把它的 `<script>` 同样放进根布局 `<head>`（与 2.2 并列，无需 client ID，Google 按发布商自动关联）。
3. 该横幅会先征求同意，用户同意后才加载广告——自动满足合规。

> 若不想用 Google 自带，也可接第三方 CMP（如 Cookiebot、开源 `react-cookie-consent` 配合 IAB TCF），但需自行配置 TC 字符串，复杂度更高，本方案不展开。

---

## 三、代码落地：广告位组件（已落地）

> 实际改动：新建 `components/ads/AdsenseUnit.tsx`（客户端组件，渲染 `<ins class="adsbygoogle">` 并在挂载后 `adsbygoogle.push()`）；`slot` 缺省取环境变量 `NEXT_PUBLIC_ADSENSE_SLOT`。已挂到 `components/layout/ToolPageShell.tsx` 工具页底部（居中、响应式、保持克制）。下方代码即线上在用版本（slot 为可选，缺省走环境变量）。

为契合本站「克制、少装饰、首屏直接给功能」的视觉偏好，**推荐手动广告单元**，放在非干扰位置（如工具页顶部一条通栏、或侧栏底部），而非全站自动广告。

新建 `components/ads/AdsenseUnit.tsx`（客户端组件）：

```tsx
'use client';
import { useEffect, useRef } from 'react';

declare global {
  interface Window { adsbygoogle?: unknown[] }
}

export function AdsenseUnit({
  slot,
  format = 'auto',
  className,
}: {
  slot: string;            // 后台「广告单元」给出的 data-ad-slot
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  className?: string;
}) {
  const ref = useRef<HTMLModElement>(null);
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID) return;
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch {}
  }, []);

  if (!process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID) return null;

  return (
    <ins
      ref={ref}
      className={`adsbygoogle block ${className ?? ''}`}
      style={{ display: 'block' }}
      data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}
```

**用法**：在工具页正文区（如 `components/tools/ToolContent.tsx` 顶部，或各工具壳层）按需渲染 `<AdsenseUnit slot="1234567890" />`。`slot` 在 AdSense 后台「按广告单元」创建后取得。

> 想偷懒也可开**自动广告**：只在 2.2 的脚本加 `data-adbreak`/账户里开启「自动广告」，无需本组件。但自动广告会全站插位，可能破坏工具页简洁度，**默认不推荐**。

---

## 四、代码落地：隐私政策页（已落地，AdSense 强制）

> 实际改动：新建 `components/privacy/PrivacyContent.tsx`（客户端，`useI18n` 取 `privacy.*`）+ `app/(en)/privacy/page.tsx`（→ `/privacy/`）+ `app/[locale]/privacy/page.tsx`（→ `/zh-CN/privacy/`、`/zh-TW/privacy/`）。三语言 `lib/i18n/{en,zh-CN,zh-TW}.json` 新增 `footer.privacy` 与 `privacy.*` 命名空间。全局 `components/layout/Footer.tsx` 已挂入两个布局，含本地化隐私页链接（en → `/privacy/`、locale → `/{locale}/privacy/`）。

需三语言，对应两套路由：

- `app/(en)/privacy/page.tsx` → `/privacy`（默认语言）
- `app/[locale]/privacy/page.tsx` → `/zh-CN/privacy`、`/zh-TW/privacy`

页面内容须说明：使用 Google AdSense、Cookie 与广告追踪、第三方广告如何收集数据、用户如何退出（如 Google 广告设置 / YourOnlineChoices）。文案走现有 i18n 体系（`useI18n().t()`，键名如 `privacy.*`），三语言 `lib/i18n/{en,zh-CN,zh-TW}.json` 同步新增，保持 369 键结构一致。

> 导航里也建议加「隐私政策」入口（页脚即可），既是 AdSense 要求，也利于合规。

---

## 五、部署：在 Cloudflare Pages 配置三个环境变量

### 5.1 为什么必须配置（原理）
本站是 `output:'export'` 纯静态导出，**没有运行时服务器**。所有 `NEXT_PUBLIC_*` 变量在 `next build` 时就被**内联进静态 HTML/JS**，不是页面运行时去读。因此：

- **改了环境变量 → 必须 Retry deployment 重新构建才生效**；只改变量不重试等于没改。
- 变量为空时，代码里对应脚本/广告位**自动不渲染**（本地、Preview 零广告）——这是设计上的安全闸门，详见 5.3 的"空值行为"。

### 5.2 Cloudflare Pages 控制台操作步骤

1. 打开 Cloudflare 控制台 → 左侧 **Workers 和 Pages** → 选站点 **`web-tools-9jh`**。
2. 进入 **Settings → Environment variables（环境变量）**。
3. 在 **Production（生产）** 环境那一栏点 **Add variable**，逐个添加 5.3 里的三个变量（值见下）。
4. **Preview 环境保持为空**（避免预览/测试页展示真实广告，造成政策风险与误点）。
5. 保存后，进入 **Deployments → 最新一次构建 → Retry deployment**，让 `next build` 重新内联变量。

> 也可把值直接写死进 `app/layout.tsx`（不读环境变量）。缺点：换号/停用要改代码重部署，故不推荐；但实现最简单。

### 5.3 三个变量逐个说明（含义 / 格式 / 去哪取 / 示例）

| 变量名 | 必填 | 含义 | 取值格式 | 在 AdSense 后台哪取 |
| --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | **必填** | 你的 AdSense **发布商账号 ID**，决定广告收益归谁 | `ca-pub-` + 16 位数字 | 右上角头像 → 账号信息 →「发布商 ID」；或任意广告单元代码里的 `data-ad-client` |
| `NEXT_PUBLIC_ADSENSE_SLOT` | **必填** | 单个**广告单元**的 ID，对应页面上那「一个」广告位 | 一串数字（通常 10 位） | 「广告」→「按广告单元」→ 新建「展示广告」→ 代码里的 `data-ad-slot` |
| `NEXT_PUBLIC_ADSENSE_FC_ID` | 选填 | **Funding Choices** 发布商 ID，用于欧盟/英国 GDPR 同意横幅 | 纯数字 | 「隐私权和消息」→ 创建消息（覆盖 EEA+UK）→ 生成的发布商 ID |

**逐一要点与示例：**

- **`NEXT_PUBLIC_ADSENSE_CLIENT_ID`**（例：`ca-pub-1234567890123456`）
  - 会被拼进广告脚本 URL（`.../adsbygoogle.js?client=ca-pub-...`，见 `app/layout.tsx`）。**没有它，整个站不显示任何广告。**
  - **空值行为**：为空时根布局不注入 `adsbygoogle.js`，全站零广告。

- **`NEXT_PUBLIC_ADSENSE_SLOT`**（例：`1234567890`）
  - 对应 `<ins data-ad-slot="...">`（见 `components/ads/AdsenseUnit.tsx`）。一个 slot = 页面上一个广告位；当前只在工具页底部放了一个，填**一个**即可。
  - 想换位置/放多个广告再新增 slot 并改代码。
  - **空值行为**：`AdsenseUnit` 组件检测到 `clientId` 或 `slot` 任一为空就返回 `null`，广告位不渲染。
  - 注意：新单元刚建可能几小时「无填充」（Google 审核/学习期），属正常。

- **`NEXT_PUBLIC_ADSENSE_FC_ID`**（例：`1234567890`）
  - 留空则**非欧盟流量照常、欧盟流量不弹横幅也不展示广告**（不违规，只是那部分零收益）；流量基本在中国可安全留空。
  - 有欧盟/英国访客时才建议填：根布局会按此 ID 注入 `fundingchoicesmessages.google.com` 脚本，自动弹「接受/拒绝 Cookie 与广告追踪」横幅，满足 GDPR。

### 5.3.1 本站已配置的实际值（2026-07-30 经 Cloudflare MCP 写入）

> 已通过 Cloudflare MCP 向 `web-tools` 项目的 **Production** 环境写入以下变量，并触发重新部署使 `NEXT_PUBLIC_*` 内联生效（Preview 环境保持为空）。`FC_ID` 因流量以中国为主暂留空。

| 变量 | 实际值 |
| --- | --- |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | `ca-pub-1870872898412136` |
| `NEXT_PUBLIC_ADSENSE_SLOT` | `3267462591` |
| `NEXT_PUBLIC_ADSENSE_FC_ID` | （未填，留空） |

> 注：你原始给出的 ID 为 `pub-1870872898412136`，已补全 AdSense 标准前缀 `ca-` 为 `ca-pub-1870872898412136`（缺 `ca-` 会导致 `adsbygoogle.js` 加载失败、广告不出）。

### 5.4 配置完成后如何自查（命令行）

- **重试部署前**：`curl -s https://tools.ideaflow.top/ | grep adsbygoogle.js` 应**无输出**（变量未内联）。
- **重试部署后**：同样命令应**有输出**，且页面源码里能看到 `client=ca-pub-...` 与 `data-ad-slot=...`，表示脚本与广告位已正确注入。

---

## 六、验证上线

1. 部署完成后，浏览器开 `https://tools.ideaflow.top/tools/json-formatter/` 等页面，应看到广告位渲染（空白块变广告）。
2. AdSense 后台 → 「网站」→ 确认无「网站中存在违规内容」等警告。
3. 欧洲用户访问应**先弹同意横幅**、同意后广告才加载（验证 CMP 生效）。
4. 收入/展示数据在 AdSense 后台与（若已接）Cloudflare Web Analytics 分别查看。

---

## 七、注意事项

- **自动广告 vs 手动**：自动广告省事但破坏工具页简洁度，与本站视觉偏好冲突；默认用手动单元，放在非首屏位置。
- **GDPR 不可省**：只要有任意 EEA/UK 访客，就必须接 CMP，否则违规风险 + 欧盟流量零收益。
- **审核期别大改结构**：申请到通过期间保持稳定，频繁改动易触发复审或拒批。
- **隐私页是硬门槛**：没隐私页 AdSense 直接拒，第四节要先于或同步完成。
- **环境变量隔离**：生产填 ID、Preview 留空，避免预览/测试环境展示真实广告造成政策风险。

---

## 九、你这边要补的后续步骤（代码落地后）

> ✅ 进展（2026-07-30）：`NEXT_PUBLIC_ADSENSE_CLIENT_ID` 与 `NEXT_PUBLIC_ADSENSE_SLOT` 已通过 Cloudflare MCP 写入 `web-tools` 项目**生产环境**并触发重新部署（部署 ID `f4fee003`）；你提供的 `SLOT=3267462591` 说明展示广告单元已在 AdSense 后台建好。下列仅剩 **ads.txt（建议）** 与 **FC_ID（仅欧盟流量）** 待办。

代码已合并并部署，广告展示还需确认/补充：

1. ~~**创建展示广告单元**~~ ✅ 已完成：AdSense 后台「展示广告」单元已建，其 `data-ad-slot=3267462591` 已填入 Cloudflare `NEXT_PUBLIC_ADSENSE_SLOT`，且已重新部署。
2. **（建议）配置 ads.txt**：AdSense 后台 → 「网站」→ 你的站点 → 「ads.txt」处会给出一行授权记录，放到本站根目录 `public/ads.txt`（随静态导出进 `out/ads.txt`，线上 `https://tools.ideaflow.top/ads.txt` 可访问），防止 unauthorized inventory 导致收益损失。这是 AdSense 的推荐项，非强制但在账号里会提示。
3. **（欧盟流量）开启同意管理**：AdSense 后台 → 「隐私权和消息」→ 创建消息（覆盖 EEA+UK）→ 拿到发布商数字 ID 填 `NEXT_PUBLIC_ADSENSE_FC_ID`，重试部署。
4. **等广告填充**：新单元刚建好可能短暂「无广告填充」（尤其低流量页面），通常几小时到一天内开始填充，属正常。

> `CLIENT_ID` / `SLOT` 已设好并重新部署，工具页底部即会出现广告（新单元可能几小时内"无填充"，属正常）。

---

## 八、与其它文档的关系

- 监控：见 [01-流量监控方案.md](./01-流量监控方案.md)（Cloudflare Web Analytics 看广告流量外的整体访问）。
- 收录：见 [02-SEO与推广运营方案.md](./02-SEO与推广运营方案.md)（GSC / Bing / IndexNow 让页面被搜到，广告曝光才有基础）。
- 谷歌生态工具：见 [03-数据分析与谷歌 MCP 工具.md](./03-数据分析与谷歌 MCP 工具.md)。
