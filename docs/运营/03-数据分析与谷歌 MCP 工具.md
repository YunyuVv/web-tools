# 数据分析与谷歌 MCP 工具

> 创建时间：2026-07-30
> 配套：[01-流量监控方案.md](./01-流量监控方案.md) · [02-SEO与推广运营方案.md](./02-SEO与推广运营方案.md)

---

本文件记录「通过 MCP 把 AI 助手接到搜索引擎营销/搜索服务」的选型与现状（Google + Bing）。
用途：对话式查广告/流量数据、自动化提交 sitemap / 查收录状态等。

> 注意：WorkBuddy 当前环境**未预装**任何 Google Analytics / Google Ads / Search Console / Bing Webmaster 的 connector 或 skill，以下均需外接（配置 `~/.workbuddy/mcp.json`）。
> **官方口径**：Google 与 Bing/Microsoft **都没有**发布官方的收录/索引 MCP 或 skill——两者只有 REST API（Google Ads API、Bing Webmaster API），MCP 化均为社区实现。唯一例外是 **IndexNow**（微软发起的开放协议，Bing 主推），有社区 MCP 可直接用。

---

## 一、Google Ads 官方 MCP（当前活跃版）

**决策：本项目 Ads 数据分析优先用官方 MCP。**

| 项 | 内容 |
|---|---|
| 当前官方地址 | `https://github.com/googleads/google-ads-mcp` |
| 归属 | `googleads`（Google Ads 官方 GitHub 组织）直接维护，**当前活跃官方版** |
| 旧地址（已失效） | `github.com/google-marketing-solutions/google_ads_mcp` 已归档并迁移至此（连 `google-ads-mcp` 连字符版也 404） |
| 运行方式（Python） | `pipx run --spec git+https://github.com/googleads/google-ads-mcp.git google-ads-mcp` |
| 前置 | `google-ads.yaml`（OAuth + **developer token**）、Python 3.12 + pipx/uv；支持 Docker / Cloud Run |
| 工具 | `search_stream`（GAQL 查询）、`list_accounts`（列账户） |
| 写权限 | 默认**只读**；mutation 工具需 `ADS_MCP_ENABLE_MUTATIONS=true`（谨慎开启，能建预算/广告系列等） |
| 覆盖范围 | **仅 Google Ads，不含 GA4** |

> 备注：Google 官方**没有 GA4 的 MCP**（只有 Ads）。GA4 流量分析需走社区方案（见第三节）。

---

## 二、Google 收录 / 提交索引：官方 vs 社区

### 结论
- **Google 没有官方的 Search Console MCP，也没有官方的收录/索引 skill。**
- 收录、提交 sitemap、查索引状态，只能走**社区/第三方 MCP**。

### 可用的社区/第三方 Search Console MCP

| 项目 | 包 / 运行 | 特点 |
|---|---|---|
| `harisnadeem/searchconsole-mcp` | PyPI `searchconsole-mcp`（`pip install searchconsole-mcp`） | 轻量，7 工具：含 `submit_sitemap` / `list_sitemaps` / `inspect_url`；需 `GOOGLE_APPLICATION_CREDENTIALS`（服务账号） |
| `samalyxx/gsc-seo-mcp` | npm `gsc-seo-mcp`（`npx -y gsc-seo-mcp`） | 功能全：SEO 机会分析 + `submit_sitemap` + `indexing_publish_url`（Indexing API） |
| `justingluska/gluska-seo-gsc-mcp` | npm `gluska-seo-gsc-mcp` | 21 工具：含 `submit_sitemap` / `notify_url_update` / `inspect_url`（批量） |
| `mcpbundles.com` 远程版 | 远程 HTTP（`https://mcp.mcpbundles.com/bundle/google-search-console`） | 免安装，认证自动处理 |

### ⚠️ 关键澄清：Indexing API 不是通用"提交收录"
- Google **Indexing API 官方仅支持 `JobPosting` 与 `BroadcastEvent` 两类页面**的索引通知，并非普通页面的"提交收录"捷径。
- 对普通工具站，让 Google 收录的**正确做法仍然是提交 `sitemap.xml`**（`submit_sitemap` 工具），而非逐个 URL 推送 Indexing API。
- URL Inspection（`inspect_url`）只能**查索引状态**（SUBMITTED_AND_INDEXED / CRAWLED_NOT_INDEXED 等），**不能请求重新收录**——重新抓取靠 sitemap 刷新 + 自然爬取。

### 一体化方案（推荐）
社区一体版 `dongsik93/google-marketing-mcp`（见 `01` 文档末尾）**已内置 GSC 模块**：
工具含 `gsc_submit_sitemap` / `gsc_inspect_url` / `gsc_list_sitemaps` 等。
若已接该一体版，收录需求一并满足，**无需单独再接**上面的 GSC MCP。

---

## 三、Bing 收录与提交索引：MCP / skill 现状

### 结论
- **微软 / Bing 没有官方发布的 MCP，也没有官方的收录/索引 skill。** Microsoft 只提供 Bing Webmaster API（REST），未包成官方 MCP，也未在 skill 市场上发布 Bing 类 skill。
- 满足"提交索引"需求的都是**社区 MCP**；但 Bing 官方主推的收录协议是 **IndexNow**（微软发起的开放协议），而 IndexNow 有现成 MCP，**一次提交可同时送达 Bing + Yandex + Naver + Seznam**。

### 方案 A：IndexNow MCP（推荐，最贴合"Bing 提交索引"）
| 项 | 内容 |
|---|---|
| 地址（已核实存在） | `https://github.com/sharozdawa/indexnow-mcp`（2026-03 活跃，MIT） |
| 运行 | `npx -y indexnow-mcp` |
| 工具 | `indexnow_submit`（URL → Bing/Yandex/Naver/Seznam）、`indexnow_submit_sitemap`（解析 sitemap 批量提交）、`indexnow_generate_key`（生成 key + 验证文件）、`google_indexing_submit`、`google_indexing_status`、`indexnow_list_engines` |
| 批量上限 | 单次最多 **10,000** 条 URL |
| 前置 | IndexNow key（`indexnow_generate_key` 一键生成）+ 把 key 文件放到站点根 `/{key}.txt` |
| 为何优于 Google | Bing 经 IndexNow 通常 **24h 内抓取**（实测 78% 在 4h 内、95% 在 24h 内）；对比 Google 被动爬取常需 2–4 周。对新站/新工具页极有价值 |

> 部署提示：本项目静态导出，把验证文件放入 `public/` 即可随构建进 `out/` 根目录，浏览器访问 `https://tools.ideaflow.top/{key}.txt` 验证可达。

### 方案 B：Bing Webmaster 完整 MCP（数据 + 收录 + 爬取诊断）
| 项 | 内容 |
|---|---|
| 推荐仓库（已核实存在） | `https://github.com/isiahw1/mcp-server-bing-webmaster`（60 工具）；备选 `zizzfizzix/mcp-server-bwt`、`TechDivar/bing-webmaster-aeo-mcp` |
| 运行 | `npx -y @isiahw1/mcp-server-bing-webmaster@latest` |
| 工具涵盖 | 站点管理、流量/关键词分析、`submit_url` / `submit_url_batch`（提交收录）、`submit_sitemap`、爬取统计 `get_crawl_stats` / `get_crawl_issues`、链接分析等 |
| 前置 | `BING_WEBMASTER_API_KEY`（Bing Webmaster Tools → Settings → API Access 生成） |

### ⚠️ Bing 收录的正确姿势（避坑）
- Bing 官方**强烈推荐 IndexNow**；旧的 **URL Submission API / Content Submission API 仍可用但未来可能弃用**（且仅提交到 Bing 一家、需 OAuth）。
- 所以"提交索引"优先用 **IndexNow MCP（方案 A）**；需要看爬取错误、关键词、流量数据时才补 **Webmaster MCP（方案 B）**。
- Bing 同样**没有"请求重新收录"的公开接口**——提交后是否收录仍由 Bing 按质量判定；IndexNow 只是"通知优先抓取"。

### 本项目建议
- 收录：**已内置零依赖脚本** `scripts/submit-indexnow.mjs`（挂进 `package.json` build，Cloudflare 部署时经 `CF_PAGES` 闸门自动把 `sitemap.xml` 推给 Bing+Yandex+Naver+Seznam；key 验证文件见 `public/601ae32ba204072a37b89b3c7a152587.txt`）。无需额外装 MCP 即可获得 IndexNow 收录提速。
- 若想对话式一键推送（不入构建链），也可接 **IndexNow MCP**（`sharozdawa/indexnow-mcp`）的 `indexnow_submit_sitemap`。
- 诊断：可选接 **Bing Webmaster MCP** 看 crawl issues / 关键词，反哺 SEO。

---

## 四、本项目推荐组合

| 需求 | 方案 | 说明 |
|---|---|---|
| Google Ads 数据分析 | **官方** `googleads/google-ads-mcp` | 用户决策：Ads 用官方 MCP（见第一节） |
| GA4 流量分析 | 社区 `dongsik93/google-marketing-mcp` 的 GA4 模块 | 官方无 GA4 MCP |
| Google 收录 / 提交 sitemap | 社区 `dongsik93/google-marketing-mcp` 的 GSC 模块（已含）或单独 `searchconsole-mcp`（最轻） | 官方无 Search Console MCP |
| **Bing / 多引擎收录** | **社区 `sharozdawa/indexnow-mcp`（推荐）** | 一次提交覆盖 Bing+Yandex+Naver+Seznam，24h 内抓取；或 `dongsik93` 一体版也含 GSC/Bing 提交 |
| Bing 爬取诊断 / 关键词 | 社区 `isiahw1/mcp-server-bing-webmaster`（可选） | 60 工具，需 `BING_WEBMASTER_API_KEY` |

### 共性前置（Google 侧，绕不过）
- **Google Cloud OAuth 客户端**（Desktop app）或**服务账号 JSON**
- 启用对应 API：**Google Ads API** / **Search Console API**（Indexing 类还需 Web Search Indexing API）
- Ads 额外需要 **Google Ads developer token**

### 共性前置（Bing 侧）
- Bing Webmaster Tools 账号 + 域名验证（可复用 Google Search Console 验证）
- 收录用 **IndexNow key**（MCP 可一键生成 + 验证文件）；诊断用 **BING_WEBMASTER_API_KEY**

---

## 五、现状与待办

- [x] 确认 Google Ads 官方 MCP 当前地址（`googleads/google-ads-mcp`）并记录
- [x] 确认 Google 无官方 Search Console MCP / skill，整理社区备选 + Indexing API 误区澄清
- [x] 确认 **Bing 无官方 MCP / skill**，整理 IndexNow MCP（推荐）+ Bing Webmaster MCP 备选 + Bing 官方主推 IndexNow 的澄清
- [ ] 决定最终接入：官方 Ads MCP + 社区一体版 GSC/GA4（推荐），或仅一体版
- [ ] 备齐 Google 前置账号（OAuth 客户端 / 服务账号 / Ads developer token）
- [ ] 决定是否接 IndexNow MCP 做 Bing/多引擎收录（新工具发布后一键推送）
- [ ] 将所选 MCP 写入 `~/.workbuddy/mcp.json` 配置骨架（密钥本地填，不进仓库）
