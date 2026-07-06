# AGENTS.md

<!-- BEGIN:nextjs-agent-rules -->
## Next.js 版本注意

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## 项目目标
- 建设 FAN JUN JIE 个人作品站，突出 AI 产品、数据分析、自动化工具与创意开发能力。
- 首页需要提供沉浸式视觉体验：Hero 粒子、个人简介、项目 DNA 螺旋浏览、右侧项目说明与数据叙事。
- 项目展示必须兼顾视觉冲击与可读性，不能出现文字重叠、空白失衡、纯黑无信息详情页或 3D 粒子遮挡主要内容。
- Data Analysis、Experience Timeline、Contact 需要作为完整作品集闭环展示，不做营销落地页式空段。
- 当前交互目标：Hero 主标题 `FAN JUN JIE` 必须直接渲染为静态渐变文本，不用 `AnimatedText` 子字形，避免透明填充导致首屏姓名不可见；Projects 使用 0 号起始空槽 + 10 个真实项目 + 11 号末端空槽的加长 DNA 键位浏览，进入时粒子从上方聚合成 DNA，回滚到 About 时反向消散，右侧项目说明必须等键位居中后再切换；Data Analysis 使用固定横向滚动的正态分布 `fluid-glass` 柱状图、常规坐标轴 + 音频波形式短彩色竖线和方法星云，详情文案可保留进入视口后的乱码成字 + 逐字错峰上滑；Experience 使用固定 pin 的 R3F 太阳系穿梭时间线，标题与详情可保留文字动效，底部星球导航必须静态可读，不使用乱码占位；Projects 后续统一背景保留可见流动渐变与 5 个漂浮光晕；Contact 文字进入视口后可使用乱码成字 + 逐字错峰上滑；全站鼠标视觉统一为淡彩虹折射环，粒子系统保留实时鼠标驱散与复原。

## 技术栈与关键依赖
- Next.js 16 App Router，入口为 `src/app/layout.tsx` 与 `src/app/page.tsx`。
- React 19，页面主体为 Client Components。
- Three.js、`@react-three/fiber`、`@react-three/drei`、`@react-three/postprocessing` 负责 3D 场景。
- GSAP、Lenis 负责滚动与动效节奏。
- `maath` 作为 ReactBits `fluid-glass` 改造实现的缓动依赖。
- `playwright` 作为本地视觉验收脚本的开发依赖，验收证据放在 `try/`。
- Tailwind CSS 4 与全局样式位于 `src/app/globals.css`。
- 标题字体栈优先使用 `Bahnschrift`、`Agency FB`、`DIN Alternate` 等棱角分明的系统字体候选；不依赖远程字体加载。
- GitHub Pages 部署使用 Next.js 静态导出，CI 通过 `GITHUB_PAGES=true` 启用 `/personal-web` 子路径。

## 目录结构与职责
- `src/app/`：Next.js 根布局、页面入口、全局样式与站点元数据。
- `src/components/layout/`：导航、平滑滚动等全局布局组件。
- `src/components/sections/`：页面分区，包括 Hero、About、Projects、Data Analysis、Timeline、Contact。
- `src/components/three/`：全局 Canvas、粒子场、项目 3D 主题场景、后处理。
- `src/components/three/dna/`：DNA 项目螺旋、几何数据、专用 shader。
- `src/components/three/timeline/`：Experience 太阳系时间线 3D 场景。
- `src/components/ui/`：流体玻璃、全站鼠标、连续星空背景、动画文字、技能网格等可复用 UI。
- `src/data/`：个人资料、项目、技能、精选数据分析案例、经历时间线等可展示数据。
- `src/hooks/`：鼠标、滚动等交互 hooks。
- `src/lib/`：通用工具函数。
- `src/types/`：共享 TypeScript 类型。
- `public/`：静态资源。
- `../.github/workflows/deploy-pages.yml`：GitHub Pages 自动构建与发布流程。
- `.env.example`：环境变量假账本，只记录占位值与说明。
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
- GitHub Pages 静态导出复现：PowerShell 中执行 `$env:GITHUB_PAGES="true"; npm run build; Remove-Item Env:\GITHUB_PAGES`

## 运行与部署
- 本地开发默认不设置 `GITHUB_PAGES`，页面运行在根路径 `/`。
- GitHub Pages CI 设置 `GITHUB_PAGES=true`，`next.config.ts` 会启用 `output: "export"`、`trailingSlash`、`basePath: "/personal-web"` 与 `assetPrefix: "/personal-web/"`。
- GitHub Actions 从 `personal-site/out` 上传 Pages artifact，并额外生成 `.nojekyll`，避免 `_next` 静态资源被 Jekyll 忽略。
- 公开访问地址：`https://q2955161835-debug.github.io/personal-web/`。

## 修改边界
- 允许修改：本轮需求直接涉及的组件、数据、样式、文档与验收记录。
- 禁止顺手重构：与本轮问题无关的 section、数据结构、依赖升级、项目内容改写。
- Shader、R3F 相机、滚动同步、全局状态改动必须小步验证，避免影响 Hero、About、Projects 之间的相机与粒子状态。
- `ProjectCarousel.tsx` 目前不是项目段主路径，除非重新接入，否则不要在其中堆修复。

## 严格浏览器视觉验收规则
- 每次涉及 UI、3D、滚动、项目说明或响应式布局的改动，必须使用浏览器从首屏纵览到页面底部，再返回上方页面做全局视觉验收。
- 验收至少覆盖桌面视口与一个移动视口；桌面需检查 Hero、About、Projects、Data Analysis、Timeline、Contact、项目切换、右侧项目说明淡入淡出、从 Projects 回滚到上方页面。
- Canvas 必须非空，主要视觉对象必须在视口内；文字不能重叠、不能被 Canvas 或遮罩遮挡；关键按钮必须可点击。
- Projects 段必须验证：Hero 粒子与 DNA 粒子分离、从 About 下滑时粒子先在 0 号空槽段聚合成 DNA、从 Projects 上划回 About 时 DNA 反向消散且不残留遮挡 About、项目键固定在 DNA 对应位置，滚动切换节奏跟随滚轮速度；必须先让 DNA 上的项目键居中，再更新右侧说明；末端需保留到第 11 个空槽的下滑长度，让最后一个真实项目有完整展示段。
- Projects 段相机角度必须保持稳定；滚动只能驱动 DNA 自身旋转、向下移动、聚合与项目键缩放，不允许用相机绕场景转圈掩盖定位问题。
- 项目说明必须验证：不再打开旧项目详情弹层，不恢复 `ProjectVisualBackdrop` 或其他遮挡 DNA/转场的旧项目背景；右侧说明区直接展示项目定位、技术栈、标签与 GitHub 链接，排版清晰且随滚动淡入淡出。
- Data Analysis 必须验证：滚动到该区后页面 pin 固定，Projects DNA 在柱状图开始运动后快速消散；`fluid-glass` 柱状图随滚轮横向移动，柱高呈明显正态分布而不是近似等高；柱体按含金量从左到右排序；柱体上不显示含金量数字；点击柱体或滚动进度切换详情；坐标轴必须是正常横轴、左侧纵轴短横线和等间距短彩色竖线，竖线随当前柱体形成 audio waveform / equalizer 式波峰，不使用旧粒子坐标轴；详情不显示时间和交付文件数量，`价值点` 文案必须改为 `核心`；详情指标不得显示“方法数量”，改为核心、赛道、主工具；方法星云默认不显示文字，只有当前项目使用的方法粒子变大并显示方法名。
- Timeline 必须验证：经历以固定 pin 的 R3F 太阳系呈现，一段经历对应一颗星球；滚动时页面固定且相机穿梭星际；悬浮/点击星球或底部星球导航能切换详情；所有年份、期间、标签可读，底部星球导航不得出现乱码占位，星球不得被首屏明显裁切。
- 全站鼠标效果必须是统一的淡彩虹折射环：仅保留一个轻微彩虹环和外晕，禁止准星、实体暗圈、强涟漪、横向扫光条或放大镜式黑边；DNA/粒子仍必须按实时鼠标位置产生驱散并在离开后复原。所有主要可交互元素需要 hover/鼠标反馈。
- Contact 必须验证联系信息可读、Email 不硬拆成无意义字符、前端表单提交后出现 toast。
- 验收时记录浏览器控制台新增错误；若工具无法读取 DOM 快照，需用截图、只读页面评估和控制台日志替代，并在进展记录中说明。

## 测试与验收标准
- 功能修改后必须至少运行 `npm run lint` 与 `npm run build`。
- UI/动画修改必须按 `doc/验收标准.md` 做浏览器视觉验收。
- 新增功能需要新增或更新 `doc/验收标准.md` 中的验收项。
- 完成报告必须说明：涉及验收项、验证结果、未验证项与原因、是否引入重复实现或临时补丁。

## Git 与安全
- Git 根目录为 `D:\0文件夹\个人站`，本项目目录为 `D:\0文件夹\个人站\personal-site`。
- GitHub remote：`origin` 指向 `https://github.com/q2955161835-debug/personal-web.git`；仓库状态为公开仓库。
- `.env` 是真实敏感配置账本，禁止提交；`.env.example` 只允许占位值和说明。
- 禁止把真实密钥、token、cookie、数据库密码、私有地址写入文档、代码块、进展记录或提交历史。
- 工作区外常用备份目录：`D:\0文件夹\备份`。
