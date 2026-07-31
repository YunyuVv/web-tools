# 本地 Clash 代理拦截导致广告不显示

> 记录时间：2026-07-31
> 相关域名：`pagead2.googlesyndication.com`（Google AdSense 广告脚本主域）

## 现象

在本地浏览器访问站点时，控制台 Network 面板里：

- `adsbygoogle.js?client=ca-pub-1870872898412136` **加载失败**（红色）
- `fundingchoicesmessages.google.com/i/1870872898412136.js` **加载成功**（200）

一开始怀疑是 GFW 对广告域名的拦截，但进一步排查后发现是**本地 Clash Verge 规则主动拦截**。

## 根因

Clash Verge 的规则列表里存在一条针对 `pagead2.googlesyndication.com` 的 **「全球拦截」** 规则：

- 规则类型：`DOMAIN-SUFFIX` / `DOMAIN`
- 匹配域名：`pagead2.googlesyndication.com`
- 策略：**全球拦截**（即 REJECT / BLOCK）

当你在规则编辑器里输入 `pagead2.googlesyndication.co` 时，右侧会提示匹配到 `pagead2.googlesyndication.com`，并显示「全球拦截」标识。

这意味着：**不是网站代码问题，也不是 GFW 问题，而是本地代理工具把广告脚本直接拦截了。**

## 验证方法

1. 打开 Clash Verge →「连接」或「规则」面板。
2. 搜索 `pagead2.googlesyndication.com`。
3. 观察命中的是「REJECT / 拦截」还是「PROXY / DIRECT」。
4. 若命中 REJECT，即为本问题。

也可以通过以下命令验证（在已配置代理的终端里）：

```bash
# 走代理时失败或被拦截
curl -I "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1870872898412136"

# 不走代理时可能正常（取决于网络环境）
```

## 影响范围

| 场景 | 是否显示广告 | 原因 |
|------|------------|------|
| 本地开发/测试（开启 Clash 并命中拦截规则） | ❌ 不显示 | 代理工具直接拦截广告脚本 |
| 普通海外用户 | ✅ 正常显示 | 无本地拦截规则，脚本可正常加载 |
| 大陆未翻墙用户 | ❌ 不显示 | GFW 拦截 `pagead2.googlesyndication.com`，但页面本身不受影响 |
| 使用广告拦截插件的用户 | ❌ 不显示 | uBlock Origin、AdGuard 等也会拦截该域名 |

**结论：网站代码和 AdSense 配置是正确的。** 本地看不到广告是因为代理/浏览器插件层面的广告拦截。

## 临时解决方案（仅用于本地测试）

如果需要在本地确认广告位是否能正常渲染，可以临时放行该域名：

### 方案 A：在 Clash Verge 中添加前置规则

1. 进入「规则」→「编辑规则」。
2. 添加一条前置规则：
   - 规则类型：`DOMAIN-SUFFIX`
   - 规则内容：`pagead2.googlesyndication.com`
   - 代理策略：选择一个可访问 Google 的代理节点（如 `PROXY`）
3. 保存并刷新页面。

> 注意：不要把策略设为「直接连接（DIRECT）」，因为该域名在大陆通常被 GFW 拦截，直接连接仍然会失败。

### 方案 B：临时关闭广告拦截

- 在 Clash Verge 中临时切换为不使用广告拦截规则集。
- 或关闭浏览器中的广告拦截插件（uBlock Origin、AdGuard 等）。

### 方案 C：使用全局代理模式

切换为「全局模式」有时可以绕过基于规则的分流拦截，但前提是代理节点能访问 Google 广告域。

## 生产环境注意事项

- 代码中已通过 `try/catch` 包裹广告加载逻辑，`adsbygoogle.js` 加载失败不会导致页面白屏或报错。
- `Script` 组件使用 `lazyOnload` 策略，广告脚本不会阻塞首屏渲染。
- 不需要为本地代理拦截问题修改生产代码。

## 相关文件

- `app/layout.tsx`：注入 `adsbygoogle.js` 和 Funding Choices 脚本
- `components/ads/AdsenseUnit.tsx`：广告单元组件
- `docs/运营/04-谷歌AdSense变现方案.md`：AdSense 整体配置文档
