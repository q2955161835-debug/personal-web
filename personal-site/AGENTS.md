# AGENTS.md

<!-- BEGIN:nextjs-agent-rules -->
## Next.js 版本注意

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## 项目目标
- 建设范俊杰个人作品站，突出 AI 产品、数据分析、自动化工具与创意开发能力。
- 首页需要提供沉浸式视觉体验：Hero 粒子、个人简介、项目 DNA 螺旋浏览、项目详情主题视觉。
- 项目展示必须兼顾视觉冲击与可读性，不能出现文字重叠、空白失衡、纯黑无信息详情页或 3D 粒子遮挡主要内容。
- Data Analysis、Experience Timeline、Contact 需要作为完整作品集闭环展示，不做营销落地页式空段。

## 技术栈与关键依赖
- Next.js 16 App Router，入口为 `src/app/layout.tsx` 与 `src/app/page.tsx`。
- React 19，页面主体为 Client Components。
- Three.js、`@react-three/fiber`、`@react-three/drei`、`@react-three/postprocessing` 负责 3D 场景。
- GSAP、Lenis 负责滚动与动效节奏。
- Tailwind CSS 4 与全局样式位于 `src/app/globals.css`。

## 目录结构与职责
- `src/app/`：Next.js 根布局、页面入口、全局样式与站点元数据。
- `src/components/layout/`：导航、平滑滚动等全局布局组件。
- `src/components/sections/`：页面分区，包括 Hero、About、Projects、Data Analysis、Timeline、Contact。
- `src/components/three/`：全局 Canvas、粒子场、项目 3D 主题场景、后处理。
- `src/components/three/dna/`：DNA 项目螺旋、几何数据、专用 shader。
- `src/components/ui/`：项目详情、主题背景、动画文字、技能网格等可复用 UI。
- `src/data/`：个人资料、项目、技能、精选数据分析案例、经历时间线等可展示数据。
- `src/hooks/`：鼠标、滚动等交互 hooks。
- `src/lib/`：通用工具函数。
- `src/types/`：共享 TypeScript 类型。
- `public/`：静态资源。
- `doc/验收标准.md`：功能、视觉、交互与测试验收清单。
- `doc/进展记录/`：按日期记录阶段性修改、验证、异常与回退信息。
- `try/`：仅存放本地调试、测试日志、临时截图或实验文件，已加入 `.gitignore`，可清空删除。

## 读取顺序
1. 先读本文件，确认项目目标、结构与执行约束。
2. 再读 `doc/验收标准.md`，明确本轮改动要覆盖的验收项。
3. 修改 Next.js 相关代码前，读取 `node_modules/next/dist/docs/` 中对应版本文档。
4. 修改 React/R3F/动画代码前，先理解 `SceneContext`、`Scene`、目标 section、相关 3D 子组件与同类实现。
5. 修改展示数据前，先读 `src/data/` 与 `src/types/`。

## 常用命令
- 安装依赖：`npm install`
- 开发服务：`npm run dev -- -p 3000`
- 代码检查：`npm run lint`
- 生产构建：`npm run build`

## 修改边界
- 允许修改：本轮需求直接涉及的组件、数据、样式、文档与验收记录。
- 禁止顺手重构：与本轮问题无关的 section、数据结构、依赖升级、项目内容改写。
- Shader、R3F 相机、滚动同步、全局状态改动必须小步验证，避免影响 Hero、About、Projects 之间的相机与粒子状态。
- `ProjectCarousel.tsx` 目前不是项目段主路径，除非重新接入，否则不要在其中堆修复。

## 严格浏览器视觉验收规则
- 每次涉及 UI、3D、滚动、项目详情或响应式布局的改动，必须使用浏览器从首屏纵览到页面底部，再返回上方页面做全局视觉验收。
- 验收至少覆盖桌面视口与一个移动视口；桌面需检查 Hero、About、Projects、Data Analysis、Timeline、Contact、项目详情打开/关闭、项目切换、从 Projects 回滚到上方页面。
- Canvas 必须非空，主要视觉对象必须在视口内；文字不能重叠、不能被 Canvas 或遮罩遮挡；关键按钮必须可点击。
- Projects 段必须验证：Hero 粒子与 DNA 粒子分离、项目标签固定在 DNA 对应附近、滚动切换节奏跟随滚轮速度、后景粒子不干扰 DNA。
- Projects 段相机角度必须保持稳定；滚动只能驱动 DNA 自身旋转、向下移动、聚合与项目键缩放，不允许用相机绕场景转圈掩盖定位问题。
- 详情页必须验证：背景不能是纯黑空白；不同项目需要展示与 `project.scene` 匹配的主题视觉，例如数据分析主线图、量化交易 K 线图、视觉识别路径或波形。
- Data Analysis 必须验证 tab 过滤、案例卡片、方法论图谱、领域分布总览；Timeline 必须验证 sticky 年份、发光中轴与卡片展开；Contact 必须验证联系链接和前端表单 toast。
- 验收时记录浏览器控制台新增错误；若工具无法读取 DOM 快照，需用截图、只读页面评估和控制台日志替代，并在进展记录中说明。

## 测试与验收标准
- 功能修改后必须至少运行 `npm run lint` 与 `npm run build`。
- UI/动画修改必须按 `doc/验收标准.md` 做浏览器视觉验收。
- 新增功能需要新增或更新 `doc/验收标准.md` 中的验收项。
- 完成报告必须说明：涉及验收项、验证结果、未验证项与原因、是否引入重复实现或临时补丁。

## Git 与安全
- Git 根目录为 `D:\0文件夹\个人站`，本项目目录为 `D:\0文件夹\个人站\personal-site`。
- 用户提供的 GitHub 地址：`https://github.com/q2955161835-debug/personal-web`；仓库公开/私有状态未在本地确认。
- `.env` 是真实敏感配置账本，禁止提交；`.env.example` 只允许占位值和说明。
- 禁止把真实密钥、token、cookie、数据库密码、私有地址写入文档、代码块、进展记录或提交历史。
- 工作区外常用备份目录：`D:\0文件夹\备份`。
