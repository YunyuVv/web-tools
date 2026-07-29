# 07 - 路由与 i18n URL 规范

> 关联文档：[06-工具页UI视觉规范.md](./06-工具页UI视觉规范.md)  
> 关联代码：`app/(en)/tools/[slug]/page.tsx`、`app/[locale]/tools/[slug]/page.tsx`、`components/tools/ToolContent.tsx`

## 1. 两条工具详情路由

项目对「工具详情页」同时存在两套平行的路由，分别对应**有无语言前缀**的访问形式：

| 路由文件 | 匹配的 URL | 语言 | 用途 |
|---|---|---|---|
| `app/(en)/tools/[slug]/page.tsx` | `/tools/{slug}/` | 默认语言（无前缀） | 用户直接访问、分享、SEO 默认入口 |
| `app/[locale]/tools/[slug]/page.tsx` | `/{locale}/tools/{slug}/` | 指定语言（`zh-CN` / `zh-TW`） | 切换语言后的本地化入口 |

要点：

- **无前缀 = 默认语言**，不需要写 `/zh-CN/` 之类的前缀。例如 `/tools/json-formatter/`、`/tools/cron-parser/`、`/tools/ip-lookup/` 都能直接打开。
- **只有其它语言才需要加前缀**：`/zh-CN/tools/.../`、`/zh-TW/tools/.../`。
- `(en)` 是 Next.js 的**路由组（route group）**，本身不出现在 URL 路径里，仅用于把「无前缀」的页面与 `[locale]` 动态段区分开。`output: 'export'`（静态导出）下没有 middleware 重写，正是靠这两个并列的 segment 实现「带/不带前缀」双形态。

## 2. 默认语言的判定

合法语言由 `lib/i18n/index.ts` 的 `PREFIXED_LOCALES` 定义（当前为 `['zh-CN', 'zh-TW']`）。

- `[locale]/layout.tsx` 中：`if (!PREFIXED_LOCALES.includes(locale)) notFound()` —— 非法语言前缀（如把 `/tools/...` 误当成 locale）直接 404。
- 无前缀的 `/tools/{slug}/` 走 `(en)` 组，**不经过** `[locale]` 的校验，天然就是默认语言形态。

> ⚠️ 历史坑：早期曾误判「无前缀 URL 全部 404」。实际并非如此——`/tools/json-formatter/` 一直可用；不可用是另一类 bug（见第 4 节）。

## 3. 工具渲染：单一真相源（强制）

两套路由页**不得各自维护 `slug → 组件` 的映射**。早期 `(en)` 页复制了一份旧的 `slug === 'x' && <X/>` switch，新增工具时只更新了 `[locale]` 页，导致无前缀路由对 `cron-parser`、`ip-lookup` 等新工具渲染出**空白页**（工具找到了、但 switch 没有对应分支，于是 `ToolPageShell` 里是空的）。

**现行约定**：`slug → 组件` 的映射收敛到唯一出处 ——

```
components/tools/ToolContent.tsx
  └─ TOOL_COMPONENTS: Record<string, ComponentType>   // 21 个启用工具的 slug→组件
       └─ <ToolContent slug={slug} />                  // 两个页面都引用它
```

两个 page 文件现在都只写：

```tsx
return (
  <ToolPageShell>
    <ToolContent slug={slug} />
  </ToolPageShell>
)
```

## 4. 新增 / 调整工具的规范动作

**新增一个工具**（必须同步两处，但映射只改一处）：

1. 在 `lib/tools-registry.ts` 的 `TOOLS` 增加一条 `slug` 元数据（`enabled: true`）。
2. 在 `components/tools/ToolContent.tsx` 的 `TOOL_COMPONENTS` 增加一行 `slug: ToolComponent`。
3. 在两套路由的 `generateStaticParams` 里，因都基于 `TOOLS.filter(t => t.enabled)`，静态路径会**自动**覆盖该 slug，无需手动加。
4. 在 `lib/i18n/*.json` 补 `tools.{slug}` 的标题/描述（用于 `generateMetadata`）。

> 只需在第 2 步加一行，无前缀与带前缀两套路由**同时生效**。切勿回到「在两个 page 里各写一份 switch」的旧写法。

**禁用动作**：

- 不要在 `app/(en)/...` 或 `app/[locale]/...` 的 page 里手写 `slug === ... && <.../>` 分支（已删除，防止再次脱节）。
- 不要为了「无前缀可用」而去新增额外的 `app/tools/[slug]` 路由——`(en)` 路由组已经承担了这一职责。

## 5. 自检清单（上线前）

- [ ] 新工具在 `ToolContent` 的映射里有且仅有一行；
- [ ] `/tools/{new-slug}/`（无前缀）能打开且正文渲染；
- [ ] `/zh-CN/tools/{new-slug}/`（带前缀）能打开且正文渲染；
- [ ] `tsc --noEmit` 通过、`next build` 静态导出包含该 slug 的两个路径。

## 6. 涉及文件

| 文件 | 职责 |
|---|---|
| `app/(en)/tools/[slug]/page.tsx` | 无前缀默认语言工具页（引用 ToolContent） |
| `app/[locale]/tools/[slug]/page.tsx` | 带语言前缀工具页（引用 ToolContent） |
| `components/tools/ToolContent.tsx` | **slug→组件 单一真相源**（新增工具只改这里） |
| `lib/tools-registry.ts` | 工具元数据与启用状态 |
| `lib/i18n/index.ts` | `PREFIXED_LOCALES` 与语言校验 |
| 本文档 | 路由/i18n 约定与新增工具流程 |
