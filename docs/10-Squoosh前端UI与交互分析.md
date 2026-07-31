# Squoosh 前端 UI 与交互分析（参考）

> 创建时间：2026-07-31  
> 说明：梳理 GoogleChromeLabs / Squoosh 这个标杆性「浏览器内图片压缩」项目的前端架构、UI 结构与交互机制，作为本项目 `image-compress` 工具的设计参考。  
> 资料来源：Squoosh v2 官方公告（web.dev）、官方仓库结构、社区架构解析（CSDN / tokrepo 等）。标注「官方」的为官方公告或仓库明示信息；未标注者为社区解析，供参考。

---

## 1. 它是什么

Squoosh 是 Google Chrome 团队在 2018 Chrome Dev Summit 发布的**纯前端图片压缩 PWA**：

- 所有压缩在**浏览器本地**完成，图片**不上传任何服务器**（隐私卖点，也是架构的直接后果——没有服务器可传）。
- 把业界编解码器（**MozJPEG、libwebp、libavif、OxiPNG** 等）编译成 **WebAssembly**，在标签页内以接近原生速度运行。
- 同时提供 Web 版、CLI（`@squoosh/cli`）、Node 库（`@squoosh/lib`），CLI 复用**同一份 wasm 模块**。
- 支持输出 AVIF / WebP / MozJPEG / OxiPNG(PNG) / JPEG-XL 等。

> 本项目 `image-compress` 工具即沿此思路：本地 wasm 压缩、零上传、多格式切换。下面拆解它的前端做法。

---

## 2. 技术栈

| 维度 | Squoosh 的选择 | 备注 |
|---|---|---|
| 语言 | **TypeScript** | 仓库含 `client-tsconfig.json` / `worker-tsconfig.json` 等多套 tsconfig（官方） |
| 构建 | **Rollup**（v2 起，从 Webpack 迁移） | 官方 v2 公告明确说明切换原因：Rollup 的 ESM 插件体系更简洁（官方） |
| UI 框架 | **Preact** | 轻量 React 替代；社区解析指出 UI 主要由 Preact 组件构成 |
| 图像处理 | **WebAssembly**（各 codec 编译为 wasm） | 由 Emscripten 生成 `.js + .wasm`（官方仓库 `codecs/`） |
| 计算线程 | **Web Workers** | 密集编码移出主线程，UI 不卡（官方：压缩全本地） |
| Worker RPC | **Comlink** | Comlink 即 Squoosh 团队（GoogleChromeLabs / Surma）开源的 Worker RPC 库，将 `postMessage` 封装成「类本地函数调用」；Squoosh 采用它做主线程↔Worker 通信（团队惯例 + 社区解析） |
| 应用形态 | **PWA** | 首次加载后可离线使用（官方特性） |
| 状态管理 | Preact Context / hooks | 组件间用 props、Context 共享全局状态、回调处理交互 |

**关键设计点**：UI 是 Preact 组件树，但**重活（编解码）全在 Worker 里的 wasm 上跑**，主线程只负责渲染与交互。这就是它「拖入 30MB 原图也不卡 UI」的原因。

---

## 3. 前端 UI 结构

主界面（压缩视图）自上而下 / 自左而右大致为：

```
┌──────────────────────────────────────────────────────────────┐
│  顶部：应用标识 / 重新选择图片                                    │
├──────────────────────────────┬───────────────────────────────┤
│  左侧：原图预览                │  右侧：压缩后预览               │
│  （含对比滑块，可左右拖拽分屏） │  （实时随参数更新）             │
├──────────────────────────────┴───────────────────────────────┤
│  选项面板（Options）：                                          │
│   · 输出格式选择（MozJPEG / WebP / AVIF / OxiPNG / PNG …）       │
│   · 质量滑块（quality slider，各 codec 语义不同）               │
│   · 该 codec 专属选项（resize / reduce palette / quantization） │
├──────────────────────────────────────────────────────────────┤
│  结果展示（Results）：压缩前后文件大小、节省比例、下载按钮        │
└──────────────────────────────────────────────────────────────┘
```

组件目录（社区解析，`src/client/lazy-app/Compress/`）：

- **`Options`**：各类图像处理选项的交互界面（格式、质量、codec 专属参数）。
- **`Output`**：处理前后的图片对比视图（即左右分屏 + 拖动分隔线）。
- **`Results`**：压缩结果、文件大小变化展示、下载入口。

> 注意「**懒加载**」：核心压缩 UI 放在 `lazy-app` —— 首次进入首页不加载压缩器代码，进入工具才按需加载。这与本项目用户诉求「需要使用时才加载 codec」一致。

---

## 4. 端到端交互流程

1. **进入 / 拖入图片**：首页「blob」视觉风格（官方 v2 自述是双关 data blob），拖拽或点击选择图片。
2. **解码 + 分屏展示**：原图渲染到左侧，右侧立即给出默认格式的压缩预览。
3. **选格式**：点击格式按钮（MozJPEG / WebP / AVIF / OxiPNG…），右侧切换对应编解码器。
4. **拖质量滑块**：实时重新编码，右侧预览 + 文件大小即时更新（所见即所得）。
5. **对比画质**：拖动中缝分隔线，左右滑动比较原图 vs 压缩图，确认质量损失可接受。
6. **下载**：点击下载，浏览器保存压缩后文件。

交互核心体验：**实时**（参数一动就重压）、**可见**（大小数字 + 画质对比滑块）、**零等待焦虑**（不转圈上传，本地秒级）。

---

## 5. Worker 通信架构

Squoosh 把每个编解码器放在独立 Worker 中，采用分层设计（社区解析，`src/features/`）：

```
主线程 (Preact UI)
   │  Comlink.call →（类本地函数调用）
   ▼
Worker (src/features/encoders/<codec>/worker/<codec>Encode.ts)
   │  加载并实例化该 codec 的 wasm 模块
   ▼
WebAssembly 编解码（MozJPEG / libwebp / libavif / OxiPNG …）
```

- **编码/解码**在 Worker 内执行，主线程只发请求、收结果、更新 UI。
- **通信机制**：标准 `postMessage`，但经 **Comlink** 封装成「调用 Worker 里导出的异步函数」的形式，省去手写消息协议。
- **workers-in-workers（嵌套 Worker）**：官方 commit #1325「Ensure browser supports workers-in-workers」表明，部分多线程 codec（如 AVIF 编码）会在 Worker 内再起子 Worker。这**要求浏览器支持跨源隔离（COOP/COEP）**才能用多线程；否则回退单线程。
- **codec 动态加载**：各 codec 的 wasm 按需加载（进入对应格式才拉取），避免首屏加载全部 wasm。

> 这与本项目做法高度吻合：我们用**单例 Worker + 动态 `import()` 各 codec + wasm 自托管（放 `public/wasm/`）**，仅 AVIF 因多线程需隔离而**明确走单线程 factory**。

---

## 6. 关键交互设计亮点

| 设计 | 作用 |
|---|---|
| **左右分屏 + 可拖动分隔线（compare slider）** | 让用户「肉眼对比」原图与压缩图，是 Squoosh 最具辨识度的交互，直接解决「压缩到底损了多少」的焦虑。 |
| **质量滑块实时重压** | 参数即反馈，无需点「应用」。代价是每次拖动都触发一次 Worker 编码——本项目用**结果缓存**缓解（切回已压格式秒出）。 |
| **零上传 / 本地计算** | 隐私即架构（无服务器）。本项目的「100% local」徽标沿用此卖点。 |
| **PWA 离线** | 首次加载后可脱离网络使用，适合反复压缩场景。 |
| **格式→codec 映射面板** | 不同格式暴露不同参数（如 AVIF 有 speed/quality，OxiPNG 有 level），选项面板随格式动态变化。 |
| **懒加载压缩器** | 首页不含编解码代码，进入工具才加载，首屏快。 |

---

## 7. 对本项目 `image-compress` 的借鉴与差异

| 维度 | Squoosh | 本项目 `image-compress` | 借鉴点 |
|---|---|---|---|
| 框架 | Preact | Next.js App Router + React | 框架不同，交互范式一致 |
| 计算 | Worker + wasm + Comlink | 单例 Worker + 自托管 wasm（esbuild 打包） | 重活在 Worker、wasm 本地化一致 |
| 多线程 | AVIF 用 workers-in-workers（需 COOP/COEP） | AVIF **强制单线程 factory**（本站无跨源隔离） | 规避隔离要求，正确性优先 |
| 懒加载 | codec wasm 按需 import | codec 动态 `import()` + 单例 Worker 复用 | 一致 |
| 缓存 | 未强调（每次重压） | **结果缓存 + 解码缓存（LRU 12）** | 本项目增强：切回格式秒出，不重压 |
| 对比 UI | 左右分屏拖动滑块 | 当前为「原图↔结果」并排 + 大小对比 | **可补：Squoosh 式画质对比滑块** |
| 隐私 | 100% local 卖点 | 「100% local」徽标 | 一致 |
| 上传 | 拖拽 + 点击 | 拖拽 + 点击 + 粘贴（Ctrl/Cmd+V） | 本项目多一路粘贴 |

**可进一步借鉴 Squoosh 的点（待办）**：
1. **画质对比滑块（compare slider）**：原图与压缩图叠加、中缝可拖动——本项目目前只并排显示，缺「直接对比同一位置画质」的能力。
2. **选项面板随格式动态变化**：OxiPNG 暴露 level、AVIF 暴露 speed，目前本项目 PNG 仅档位封顶、其余格式参数较简。
3. **懒加载压缩器代码本身**：当前 Worker 经 esbuild 打成单文件已内联 codec 逻辑，首屏不含图片工具页以外的压缩代码；若要再极致，可按格式拆分 worker chunk。

---

## 8. 小结

Squoosh 的精髓是「**UI 轻、计算重、全本地**」：Preact 负责流畅交互，Comlink 封装的 Worker 跑 wasm 编解码，PWA 保证离线可用，分屏对比滑块解决「压没压坏」的信任问题。本项目 `image-compress` 在架构上与其同构，并在**结果缓存、单线程 AVIF 规避隔离、上传多入口**上做了适配与增强；后续可补「画质对比滑块」以追平其最具辨识度的交互。
