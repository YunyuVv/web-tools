# 11 · Blender 建模 → GLB 落地方案（吉祥物「Tooly」第一步）

> 配套文档：`docs/09-3D吉祥物设计.md`（概念 / 技术选型 / 10 步计划）。本文档是其中「第十步 GLB 升级」的**前置展开**——把「怎么装 Blender、怎么让 AI 辅助建模、怎么导出并接入项目」写成可直接照做的手册。
>
> 背景回顾：demo 页（`app/[locale]/demo/3d-mascot/`）目前用 three.js 程序化占位模型，已验证整套 3D 管线（R3F + 拖拽 + idle + 主题换色 + 静态导出）。本文档的目标是把最终模型换成 **Blender 手工/AI 建模导出的 `tooly.glb`**，且**交互层一行不用改**。

---

## 0. 为什么是 Blender（而不是纯代码或 AI 文生）

| 维度 | 纯代码程序化 | Blender→GLB（本文） | AI 文生 3D |
|---|---|---|---|
| 精度 / 有机造型 | 弱（只有基础体） | 强（雕模 + 材质 + 骨骼） | 中（概念快但脏） |
| 品牌一致性 | 完全可控 | 完全可控 | 弱 |
| 包体 | 极小 | 中（Draco 可控 <200KB） | 大（拓扑乱） |
| 美术工具门槛 | 无 | 需装 Blender（免费） | 无 |
| 是否适合长期品牌资产 | 是（但简陋） | ✅ 是 | 否（需返修） |

结论：Blender 是「最终模型」的正确归宿；程序化占位只用于跑通管线，**不冲突**——GLB 就绪后直接替换 `MascotModel` 里的几何体即可。

---

## 1. 安装 Blender（详细）

### 1.1 下载地址
- **官网下载页（唯一可信源）**：https://www.blender.org/download/
- **系统要求**：https://www.blender.org/download/requirements/

### 1.2 先确认你的芯片，选对安装包
- **Apple Silicon（M1/M2/M3/M4，绝大多数近几年的 Mac）**：在下载页选 **「macOS – Apple Silicon」** 包。最新版（v5.x）要求 macOS 13 Ventura 起。
- **Intel Mac（老款）**：最新版已不支持 Intel。**用 `4.5 LTS`**（最后一个支持 Intel + macOS 11.2 的版本）。
- 内存：8GB 最低，32GB 推荐；吉祥物这类小模型 8GB 完全够。

### 1.3 两种安装方式（任选）
- **方式 A（推荐，版本可控）**：官网下载 `.dmg` → 打开 → 把 Blender 拖进 `Applications`。
- **方式 B（省事）**：Homebrew 装最新稳定版
  ```bash
  brew install --cask blender
  ```

### 1.4 验证安装
```bash
# 方式 A 安装路径
/Applications/Blender.app/Contents/MacOS/Blender --version
# 方式 B（brew）通常直接在 PATH
blender --version
```
看到 `Blender 4.x.x` 或 `5.x.x` 即成功。Blender 自带 Python（3.11+），**不需要你系统装 Python**。

---

## 2. 让 AI 操作建模的三种方式

> 关键认知：**云端 WorkBuddy 沙箱连不到你本机 Blender**。所以「AI 实时驱动 Blender」必须在**你本机**完成（本机装 Claude Desktop / Cursor + Blender）。下面三种方式按「稳 → 灵活」排序。

### 2.1 方式 A：AI 写 bpy 脚本 + 本地 headless 执行 ★推荐首试
**原理**：Blender 内置完整 Python API（`bpy`）。AI 生成 `.py` 建模脚本，你本地一条命令 headless 跑出 GLB，**不开界面、不建实时连接、不需要 API key**。

**为什么最契合本项目**：吉祥物是几何体（圆角盒身 + 球眼 + 胶囊手 + 工具符号），程序化生成比手雕更精准、可复现、可进 Git。

**工作流**：
1. AI（我）写 `make_tooly.py`。
2. 你本地执行：
   ```bash
   /Applications/Blender.app/Contents/MacOS/Blender --background --python make_tooly.py -- --out public/models/tooly.glb
   ```
   （`--` 之后是传给脚本的参数；brew 版把路径换成 `blender`）
3. 产出 `tooly.glb`。

**优点**：可复现、可版本化、CI 友好、零第三方依赖。
**缺点**：脚本要写对（但几何脚本容错高，出错也容易调）。

> 最小可跑示例（建一个圆角盒 + 两个球眼并导出 GLB）：
> ```python
> # make_tooly.py
> import bpy, sys, os
> bpy.ops.wm.read_factory_settings(use_empty=True)   # 清空默认场景
>
> # 身体：立方体 + 倒角做出圆角
> bpy.ops.mesh.primitive_cube_add(size=1.2, location=(0, 0, 0.7))
> body = bpy.context.active_object; body.name = "Tooly_Body"
> bpy.ops.object.modifier_add(type='BEVEL')
> body.modifiers["Bevel"].width = 0.12; body.modifiers["Bevel"].segments = 4
> mat = bpy.data.materials.new("BodyMat"); mat.diffuse_color = (0.36, 0.51, 0.98, 1)
> body.data.materials.append(mat)
>
> # 眼睛：两个白球
> for x in (-0.25, 0.25):
>     bpy.ops.mesh.primitive_uv_sphere_add(radius=0.16, location=(x, 0.55, 1.15))
>     em = bpy.data.materials.new("Eye"); em.diffuse_color = (1, 1, 1, 1)
>     bpy.context.active_object.data.materials.append(em)
>
> # 导出 GLB（含 Draco 压缩、+Y up、只导选中）
> out = next((a[6:] for a in sys.argv if a.startswith("--out=")), "tooly.glb")
> bpy.ops.export_scene.gltf(filepath=out, export_format='GLB',
>     export_yup=True, export_selected=True,
>     export_draco_mesh_compression_enable=True)
> print("EXPORTED", out)
> ```

### 2.2 方式 B：Blender MCP 实时联动（适合迭代微调，所见即所得）
**原理**：Blender 插件（`addon.py`）在 Blender 内部起一个本地 socket 服务（默认 `localhost:9876`）；本机 **MCP server**（`uvx blender-mcp`）做桥接，让你正在用的 AI 客户端（WorkBuddy 桌面版 / Claude Desktop / Cursor）直接用自然语言建物体、设材质、执行脚本、导出 GLB。

> 前提：AI 客户端进程必须和 Blender 跑在**同一台机器**上（都在你 Mac 本机），才能访问 `localhost:9876`。WorkBuddy 若是桌面客户端（进程在你 Mac 上），即可直接用——这正是我们前面已经在 `~/.workbuddy/mcp.json` 配好 `blender` 连接器的原因。

**资料与地址**：
- 插件原版仓库：https://github.com/ahujasid/blender-mcp
- 图文教程：https://blender-mcp.com/tutorials.html
- 桥接器 `uv`（macOS）：`brew install uv`，文档 https://docs.astral.sh/uv/
- 要求：Blender 3.0+、本机装了 `uv`。

**完全中文安装步骤（菜单均附英文原名，照着点即可）**：

**第 1 步：安装桥接器 `uv`**（只需一次）
```bash
brew install uv
```
> `uvx` 命令依赖它；装好后在终端输入 `uv --version` 能看到版本即成功。

**第 2 步：在 Blender 里安装 MCP 插件**
1. 打开插件仓库 https://github.com/ahujasid/blender-mcp ，下载里面的 `addon.py` 文件到本机（例如 `~/Downloads/addon.py`）。
2. 打开 Blender，进入菜单：**编辑（Edit） → 偏好设置（Preferences） → 插件（Add-ons） → 安装（Install…）**。
3. 在弹出的文件选择框里**选中刚下载的 `addon.py`** → 点右下角「安装」（Install）。
4. 安装完成后，在插件列表搜索框输入 `Blender MCP`，找到 **「界面: Blender MCP（Interface: Blender MCP）」** → **勾选左侧复选框**启用。
5. （可选）展开该项确认无需额外设置，然后关闭偏好设置窗口。

**第 3 步：在 Blender 内启动 MCP 服务器**
1. 回到 Blender 主界面，在任意 3D 视图里按下键盘 **`N` 键**，打开右侧属性栏。
2. 在右侧栏顶部找到并点击 **「BlenderMCP」** 标签页。
3. 点击 **「启动 MCP 服务器（Start MCP Server）」** 按钮。
4. 看到状态变成「已连接 / Connected」或提示 `Listening on port 9876` 即成功。
> ⚠️ 这一步完成后**保持 Blender 一直开着**，关掉 Blender 连接就断了。

**第 4 步：在 AI 客户端启用 blender MCP 连接器**
- **用 WorkBuddy（推荐，我们已配好）**：
  1. 打开 WorkBuddy 连接器管理页（界面右上角的自定义连接器入口）。
  2. 找到列表里的 **`blender`** 连接器 → 点击 **信任（Trust）** 启用。
  3. 启用后 WorkBuddy 会按 `~/.workbuddy/mcp.json` 里的 `uvx blender-mcp` 启动桥接进程，直连你本机 Blender 的 9876 端口。
- 用 Claude Desktop 备选：编辑 `~/Library/Application Support/Claude/claude_desktop_config.json`，加入
  ```json
  { "mcpServers": { "blender": { "command": "uvx", "args": ["blender-mcp"] } } }
  ```
- 用 Cursor 备选：`Cursor Settings → MCP` 粘贴 `uvx blender-mcp` 添加。

**第 5 步：实测连通（由我发起）**
你完成上面 1–4 步、且 Blender 处于「已启动 MCP 服务器」状态后，告诉我「已 Trust + Blender 已 Start」，我会直接调用 Blender 工具（如 `get_scene_info` 查询场景）做一次连通性验证：
- ✅ 能返回 Blender 当前场景信息 → 说明链路通，之后就能用自然语言让我直接驱动 Blender 捏出 Tooly。
- ❌ 报连接拒绝 / 超时 → 说明 AI 客户端被隔离在沙箱里、够不到宿主机 localhost；退回 Claude Desktop / Cursor 本机方案即可（配置同上）。

**可用工具（自然语言即可调用）**：`get_scene_info`（查场景）、`create_primitive`（建基础体）、`set_material`（设材质）、`execute_blender_code`（执行 bpy 脚本）、`export_gltf`（导出 GLB）等。

**优点**：所见即所得、迭代快、不用写代码，适合前期摸索 Tooly 造型。
**缺点**：需本机 AI 客户端就绪；实时 socket 偶尔超时（复杂请求拆小步）；仅当使用外部素材库（Hyper3D / Poly Haven）才需要 API key，纯本地建模控制不需要。

> ⚠️ 只能同时跑一个 MCP 实例：别在 WorkBuddy 和 Claude Desktop / Cursor 同时启用 `blender-mcp`，否则 9876 端口冲突。

### 2.3 方式 C：外部 AI 文生 3D → 导入 Blender 清理（可选）
- Meshy：https://www.meshy.ai ｜ Tripo：https://www.tripo3d.ai ｜ Luma：https://lumalabs.ai
- 文 / 图 → GLB/OBJ，再用 Blender 重拓扑、减面、绑材质。
- 评价：出概念快，但**拓扑脏、包体大、品牌一致性差**，多数要回 Blender 修。**不推荐作长期品牌资产，仅抢时间用**。

---

## 3. 给 AI / Blender 的建模 Brief（Tooly 规格）

> 下面这份规格同时适用于「方式 A 写脚本」和「方式 B 自然语言」，保证产出一致。

- **几何构成（程序化，3 色以内，克制可爱）**：
  - 身体：圆角立方体，约 `1.2 × 1.4 × 1.0`，主色 = 站点强调蓝 `(0.36,0.51,0.98)`。
  - 眼睛：两个白球（半径 0.16）+ 深色瞳孔（半径 0.07），位于前脸上方。
  - 手臂：两根短粗胶囊（或圆柱近似），两侧。
  - 头顶工具符号：用简单几何体拼一个扳手 / 齿轮，或贴一个平面图标（建议单独命名 `Tooly_Icon`，方便以后换符号）。
  - 脚：两个小圆角盒。
- **风格**：低多边形 / 圆润，不要写实贴图。
- **朝向**：正面朝 +Z；导出统一 **+Y up**（glTF 默认）。
- **尺寸**：包围盒控制在 ~2 单位，R3F 里直接放下，不必再缩放。
- **（可选）骨骼动画**：若想让挥手 / 眨眼用骨骼驱动，在 Blender 里建简单 armature；占位阶段用代码动画，升级后 `useAnimations` 无缝接。

---

## 4. 导出 GLB（关键设置）

Blender：`File → Export → glTF 2.0 (.glb)`
- ✅ **+Y Up**
- ✅ **Apply Modifiers**（倒角等生效）
- ✅ **Include → Selected Objects**（只导吉祥物，别带灯光/相机）
- ✅ **Compression → Draco**（Blender 内置；或导出后用 gltf-transform 压，见第 5 节）
- 命名：`tooly.glb`

---

## 5. 优化（控制包体，静态站关键）

- **Draco 压缩**：Blender 导出勾选即可；或导出后用命令行二次压缩：
  ```bash
  npx gltf-transform optimize public/models/tooly.glb public/models/tooly-opt.glb
  # 默认做 draco + dedup + prune，通常能压到 < 200KB
  ```
- 目标体积：**< 200KB**（几何体简单很容易）。
- 材质：尽量用**顶点色 / 纯色 PBR**，避免大贴图（贴图会显著增重且需处理跨域）。

---

## 6. 接入本项目（替换占位模型）

1. 把 `tooly.glb` 放进 **`public/models/tooly.glb`**（自托管，不走外部 CDN；静态导出自动拷入 `out/`）。
2. 改 `components/three/MascotModel.tsx`，把程序化 `<mesh>` 换成 drei 加载：
   ```tsx
   import { useGLTF } from '@react-three/drei'

   export function MascotModel(props: JSX.IntrinsicElements['group']) {
     const { scene } = useGLTF('/models/tooly.glb')
     return <primitive object={scene} {...props} />
   }
   useGLTF.preload('/models/tooly.glb')
   ```
3. **交互层不动**：`Mascot.tsx` 里的 `OrbitControls` 拖拽、idle 微动、点击挥手、主题换色逻辑全部保留。若 GLB 带骨骼动画，在 `Mascot.tsx` 用 `useAnimations` 接 `scene.animations`，占位阶段的代码动画删掉即可。
4. 静态导出天然兼容：`public/` 下的 GLB 会被 `next build` 拷进 `out/`，无需额外配置。

---

## 7. 验证

- `NODE_OPTIONS= npm run build` 通过（确认 GLB 进了 `out/models/tooly.glb`）。
- 本地 `npm run dev` 打开 demo 页 `/{locale}/demo/3d-mascot/`（或后续首页）能看到吉祥物。
- **降级仍生效**：无 WebGL / `prefers-reduced-motion` 时回退到静态占位（该逻辑在 `MascotCanvas.tsx`，与模型来源无关）。

---

## 8. 风险与回滚

| 风险 | 处理 |
|---|---|
| GLB 过大拖慢 LCP | Draco / 减面 / 降顶点；目标 <200KB |
| 模型未就绪 | demo 继续用程序化占位，不影响任何功能 |
| Blender MCP 连接超时 | 退回方式 A（脚本 headless 导出） |
| 想整体撤掉 3D | 删 `components/three/` + demo 路由 + 卸 `three @react-three/fiber @react-three/drei`，i18n 键可留可删 |

---

## 9. 现在就能做的「第一步」

1. **装 Blender**：方式 A（官网 dmg）或 B（brew），按芯片选包（Apple Silicon 用最新 / Intel 用 4.5 LTS）。
2. **选 AI 控制方式**：推荐先试**方式 A**——我直接给你写完整的 `make_tooly.py`，你本地一条命令出 GLB，零实时连接、零 API key。
3. **跑通最小验证**：先用上面的「最小示例脚本」建一个圆角盒导出 GLB，确认你本机 headless 导出链路通，再让我补全眼睛 / 手 / 工具符号的完整脚本。

> 下一步衔接：GLB 就绪后回到 `docs/09` 第十步，替换 `MascotModel`，交互层零改动。
