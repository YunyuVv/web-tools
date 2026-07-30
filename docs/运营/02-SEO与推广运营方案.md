# SEO 与推广运营方案

> 创建时间：2026-07-30
> 配套：[01-流量监控方案.md](./01-流量监控方案.md)

---

## 一、已落地的 SEO 基建

### 1. JSON-LD 结构化数据（工具页）
- 文件：`components/seo/ToolJsonLd.tsx` + `lib/site.ts`（`buildToolJsonLd`）
- 类型：schema.org `SoftwareApplication`（名称 / 描述 / URL / 价格 / 语言 / publisher）
- 注入：`app/(en)/tools/[slug]/page.tsx` 与 `app/[locale]/tools/[slug]/page.tsx`
- 效果：SSG 阶段直接写进每个工具页静态 HTML，搜索引擎读取完整结构化数据，提升结果富媒体展示与点击率。
- 多语言：标题/描述取自 i18n，URL 按语言前缀正确生成（en 无前缀、zh-CN/zh-TW 带前缀）。

### 2. sitemap.xml + robots.txt
- 文件：`scripts/generate-sitemap.mjs`；`package.json` 的 `build` 改为 `next build && node scripts/generate-sitemap.mjs`
- 做法：扫描 `out/` 构建产物，覆盖全部 21 工具 × 3 语言 + 首页等（共 74 个 URL），含 `changefreq`、`priority`（首页 1.0 / 其余 0.8）
- robots.txt：`Allow: /` + `Sitemap:` 指引
- 域名：`SITE_URL` 由 `lib/site.ts` 按 `NODE_ENV` 自动判定（dev=localhost，prod=线上域名），无需手动设环境变量

### 3. 动态 metadata
- 每个工具页有独立 `generateMetadata()`（`<title>`/`<description>` 按工具 + 语言），非全局写死。

---

## 二、收录入口（需手动提交）

| 平台 | 用途 |
|---|---|
| Google Search Console | 提交 sitemap.xml，看关键词曝光/点击（最核心） |
| Bing Webmaster | 覆盖 Bing/雅虎，同样提交 sitemap（见 [03-数据分析与谷歌 MCP 工具.md](./03-数据分析与谷歌 MCP 工具.md) 的 IndexNow 章节） |
| 百度站长平台 | 覆盖国内搜索（可选） |

### Google Search Console 提交 sitemap 详细步骤

> 目标：让 Google 发现并收录 `https://tools.ideaflow.top` 下的全部页面（含 21 工具 × 3 语言 + demo + 首页，共 74 个 URL）。

1. **打开 GSC 并添加资源**
   - 访问 [Google Search Console](https://search.google.com/search-console/)，用与站点同主体的 Google 账号登录。
   - 左侧「搜索资源」→「添加资源」→ 选 **「网址前缀」** → 输入 `https://tools.ideaflow.top/`（务必带末尾斜杠，与 sitemap 行为一致）→ 继续。

2. **验证域名所有权**（推荐 DNS 验证，可用 Cloudflare MCP 自动加记录）
   - 在「网址前缀」方式下选 **DNS 验证**，复制 GSC 给的 `google-site-verification=XXXX` 记录值。
   - 到 Cloudflare 控制台（`tools.ideaflow.top` 域）→ **DNS** → 加一条 `TXT` 记录（主机名 `@`，内容粘贴上面的值）→ 回 GSC 点「验证」。
   - ⚡ 此步可用**已连接的 Cloudflare MCP**（有 DNS 写权限）自动完成，不用手登控制台。
   - 备选（代码方式，需重新部署）：把 GSC 给的 `<meta name="google-site-verification" content="XXXX">` 加到 `app/layout.tsx` 的 `<head>`。

3. **提交 sitemap**
   - 直达地址：[Google Search Console 站点地图页](https://search.google.com/search-console/sitemaps?resource_id=https://tools.ideaflow.top)（也可从 GSC 左侧「索引」→「站点地图」进入）。
   - 在「添加新站点地图」框输入 **`sitemap.xml`**（只填文件名，不要带域名）→ 点「提交」。
   - 提交后状态显示「成功」表示 Google 已接收；「已发现网址数」会随抓取逐步增长。

4. **查看收录状态 / 处理错误**
   - 直达地址：[Google Search Console 网址检查页](https://search.google.com/search-console/inspect?resource_id=https://tools.ideaflow.top)（也可从 GSC 顶部「网址检查」输入框进入）。
   - 粘贴任一工具页 URL（如 `https://tools.ideaflow.top/zh-CN/tools/json-formatter/`）→ 看是否被编入索引。
   - 若报告「sitemap 包含不允许的网址」等错误：先在代码侧修复 sitemap（见下方注意）→ 回站点地图页点该 sitemap 右侧「⋮」→「删除」→「重新提交 `sitemap.xml`」。

5. **部署变更后刷新**
   - 每次重新部署（尤其改了 sitemap 生成逻辑后），回 GSC 站点地图页确认已自动重新抓取；若未更新，手动「删除 + 重新提交」。

> ⚠️ **本次实践踩坑**：sitemap 旧版把域名与路径拼成 `https://tools.ideaflow.toptools/...`（缺 `/`），导致 GSC 报 73 个「不允许的网址」。修复见 `scripts/generate-sitemap.mjs`（本地提交 `0a8c174`，待 push）。**修复推送部署后，必须回 GSC 删除旧 sitemap 并重新提交**，否则旧错误记录不会自动消失。

> 自动化：提交 sitemap / 查收录状态可经 MCP 完成（Google **无官方** Search Console MCP，用社区版，详见 [03-数据分析与谷歌 MCP 工具.md](./03-数据分析与谷歌 MCP 工具.md)）。
> ⚠️ 误区：Google **Indexing API 官方仅支持 JobPosting / BroadcastEvent 页面**，不是通用"提交收录"捷径；普通工具站靠提交 `sitemap.xml` 让 Google 收录，`inspect_url` 只能查状态、不能请求重新收录。

---

### Bing Webmaster Tools 添加站点 + 提交 sitemap 详细步骤

> 目标：让 Bing（覆盖 Bing / 雅虎 / DuckDuckGo 等使用 Bing 索引的引擎）发现并收录本站全部页面（含 21 工具 × 3 语言 + demo + 首页，共 74 个 URL）。
> Bing 官方主推 **IndexNow** 协议（微软发起），收录通常 **24h 内**完成，远快于 Google 被动爬取（2–4 周）。详细 MCP 方案见 [03-数据分析与谷歌 MCP 工具.md](./03-数据分析与谷歌 MCP 工具.md) 第三节。

0. **前置：先完成 Google Search Console 验证**（见上方 GSC 步骤）→ 可直接"从 GSC 导入"，跳过手动验证（第 3 步方式 A）。

1. **打开 Bing Webmaster Tools 并登录**
   - 直达地址：[Bing Webmaster Tools](https://www.bing.com/webmasters)
   - 用 **Microsoft 账号**登录（没有就用 Outlook / Hotmail / 任意微软账号注册一个，个人站足够）。

2. **添加站点**
   - 进入后点「**添加站点**」（Add a site），在输入框填 `https://tools.ideaflow.top`（末尾斜杠有无均可，Bing 会归一化）。
   - 或更快：若已关联 GSC 账号，Bing 会列出你在 GSC 已验证的站点，点「**导入**」即可一键把 `tools.ideaflow.top` 拉进来，自动复用 GSC 的验证，**省去下面第 3 步**。
   - 确认进入该站点的「仪表板」（Dashboard）。

3. **验证域名所有权**（四种方式，任选其一）
   - **方式 A（推荐，最省事）：从 Google Search Console 导入验证**
     - 在「添加站点」时选「**导入**」/「使用 Google Search Console」，授权 Bing 读取你的 GSC 站点列表，勾选 `tools.ideaflow.top` → 验证秒过（Bing 信任 GSC 的已有验证）。
   - **方式 B（备选，最快手动）：XML 文件验证**
     - Bing 给一个 `BingSiteAuth.xml` 验证文件（含唯一内容）→ 下载 → 放进本项目 `public/` 目录 → 重新构建（随 `output:'export'` 进 `out/BingSiteAuth.xml`）→ 访问 `https://tools.ideaflow.top/BingSiteAuth.xml` 确认可达 → 回 Bing 点「验证」。
   - **方式 C（备选）：CNAME 记录验证**
     - Bing 给一条指向 `verify.bing.com` 的 CNAME 记录值 → 到 Cloudflare（本项目已接，MCP 可自动加 DNS 写记录）→ DNS 加一条 CNAME → 回 Bing 验证。
   - **方式 D（备选，代码方式需重部署）：meta 标签验证**
     - 把 `<meta name="msvalidate.01" content="XXXX">` 加到 `app/layout.tsx` 的 `<head>`（需重新部署生效）。

4. **提交 sitemap**
   - 左侧菜单「**配置我的站点**」→「**站点地图**」（Sitemaps）→ 直达地址：[Bing 站点地图页](https://www.bing.com/webmasters/sitemaps?siteUrl=https://tools.ideaflow.top)。
   - 在输入框填 **`https://tools.ideaflow.top/sitemap.xml`**（带完整域名；Bing 要完整 URL，不像 GSC 只填文件名）→ 点「添加」。
   - 提交后 Bing 读取并列出发现的 URL 数，状态栏显示处理进度。

5. **（强烈推荐）启用 IndexNow，让收录快 10 倍**
   - 普通 sitemap 提交后 Bing 仍按队列爬取；想让新工具页发布后**当天被抓取**，用 IndexNow 主动通知。
   - **本项目已代码落地（零依赖、随构建自动跑）**：
     - `public/601ae32ba204072a37b89b3c7a152587.txt`：IndexNow key 验证文件（文件名=内容=key，Bing 会来抓此文件确认域名归属），随 `output:'export'` 进 `out/` 根目录，线上 `https://tools.ideaflow.top/601ae32ba204072a37b89b3c7a152587.txt` 可达即验证通过。
     - `scripts/submit-indexnow.mjs`：构建后读 `out/sitemap.xml`，提取全部 URL，POST 到 `https://api.indexnow.org/indexnow`（统一入口，自动转发 Bing+Yandex+Naver+Seznam）。
     - 已挂进 `package.json` 的 `build`（`next build && node scripts/generate-sitemap.mjs && node scripts/submit-indexnow.mjs`）。
     - **安全闸门**：仅当环境变量 `CF_PAGES==='true'`（Cloudflare Pages 构建自动注入）或 `SUBMIT_INDEXNOW==='true'` 时才真正发送，**本地 / 预览构建不 ping**，避免无谓请求。
   - 备选 MCP 方案（[03-数据分析与谷歌 MCP 工具.md](./03-数据分析与谷歌 MCP 工具.md) 第三节）：`sharozdawa/indexnow-mcp` 的 `indexnow_submit_sitemap` 也能一键批量推。
   - 手动也可：Bing Webmaster →「**配置我的站点**」→「**通过 IndexNow 提交 URL**」，粘贴单条 URL 或上传 URL 列表。

6. **查看收录状态 / 诊断**
   - 仪表板「**索引资源管理器**」（URL Inspection 同款）：粘贴任一工具页 URL（如 `https://tools.ideaflow.top/zh-CN/tools/json-formatter/`）看索引状态、最近抓取时间。
   - 「**报表和数据**」→「**SEO 报告 / 入站链接**」：看爬取错误、SEO 问题、关键词（Bing 比 GSC 更宽松免费）。
   - 「**爬取信息**」：看 Bingbot 抓取频次与最近响应码，排查 404 / 5xx。

> ⚠️ 与 Google 同样：Bing **没有"请求重新收录"** 的公开接口。改版后让 Bing 重新抓取靠：① sitemap 刷新 + ② IndexNow 主动通知；是否收录仍由 Bing 按质量判定。

> 自动化提示：提交 sitemap / 推送 IndexNow / 看爬取诊断，可经社区 MCP 完成（Bing **无官方** MCP，用 IndexNow MCP 或 Bing Webmaster MCP，详见 [03-数据分析与谷歌 MCP 工具.md](./03-数据分析与谷歌 MCP 工具.md)）。

---

## 三、推广渠道（开发者工具站增长飞轮）

付费广告对工具站基本不划算，**核心是 SEO + 开发者社区口碑**：

| 渠道 | 动作 |
|---|---|
| Product Hunt | 发起一次 launch（开发者工具天然受众） |
| Hacker News | `Show HN: DevToolBox, a free online toolbox…` |
| Reddit | r/webdev、r/SideProject、r/selfhosted |
| 中文社区 | 掘金、V2EX、少数派、知乎（"好用的在线工具"类内容）、公众号/小红书种草 |
| GitHub | 仓库 README 放官网链接 + 演示图，靠 star 带动信任与回流 |

---

## 四、内容运营 + 数据反哺闭环

1. 用 dev.to / Hashnode 写"用 X 工具 3 步解决 Y 问题"短文，文内嵌工具链接。
2. 站内做"每周工具聚焦"更新日志，养成回访习惯（可加 RSS）。
3. **用监控数据反哺**：看 Web Analytics 的 Top 工具 → 优先打磨/做内容；冷门工具考虑合并或下架。
4. 收集用户反馈（GitHub Issue / 站内表单）决定下一个加什么工具，形成迭代闭环。

---

## 五、现状与待办

- [x] JSON-LD 结构化数据（已落地，构建验证通过）
- [x] sitemap.xml + robots.txt（已落地，74 个 URL；修复 URL 拼接缺少 `/` 的 bug，本地提交 `0a8c174`，待 push）
- [x] Cloudflare Web Analytics 接入（代码已上线，环境变量已配，待 Retry 部署生效）
- [x] SITE_URL 按环境自动判定（本地提交 `1421934`，待 push）
- [ ] 提交 sitemap 到 Google / Bing / 百度站长平台
- [ ] 首次推广（Product Hunt / 社区）
- [ ] 站内更新日志 / RSS（可选）
