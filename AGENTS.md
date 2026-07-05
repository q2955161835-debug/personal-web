# 个人站 Agent 入口

## 项目目标
- 建设范俊杰个人作品集网站，采用星空叙事 + Three.js 3D 交互风格，参考 activetheory.net 但做成星空主题。
- 首页在恒星处，下滑滚动星球并转场，一个项目一个行星，数据分析项目做成星环里面的星体。
- 每个星球都要有丰富的表面场景建模和粒子大气效果，项目之间飞跃转场点缀陨石、星云、彗星、星团。
- 项目用 3D 玻璃面板展示简介和含金量高的内容，点击后显示详情。
- 技能证书用空间站模型承载，整体风格参考 activetheory.net 与高科技风格混搭。
- Logo 设计为倒着的 V（中间隔断），优先用 Three.js Shape 几何体 + SVG 实现。

## 技术栈
- 构建：Vite 6 + TypeScript 5.7
- 3D：Three.js 0.170（原生，非 R3F）
- 动效：GSAP 3.13 + ScrollTrigger + Lenis 平滑滚动
- 样式：Tailwind CSS 3.4
- 目标浏览器：Chrome / Edge / Firefox / Safari 最新版（WebGL2）

## 目录结构与职责
- `AGENTS.md`：本文件，长期规则与执行约束。
- `.env.example`：环境变量假账本，公开链接与联系方式。
- `package.json` / `vite.config.ts` / `tsconfig.json` / `tailwind.config.js` / `postcss.config.js`：构建与类型配置。
- `index.html`：HTML 入口，含 loader、canvas、UI overlay。
- `src/main.ts`：应用入口，启动 SceneManager 并隐藏 loader。
- `src/style.css`：全局样式与 Tailwind 入口，含玻璃面板、模态框、HUD、滚动提示等组件样式。
- `src/scene/SceneManager.ts`：场景管理器，管理 Three.js scene/camera/renderer 与渲染循环。
- `src/scene/Renderer.ts`：WebGL2 渲染器封装，含 ACES 色调映射与 SRGB 输出。
- `src/components/Starfield.ts`：星空背景，三层 Points（远景 5000 + 中景 1500 + 近景 300 闪烁星）。
- `src/data/projects.ts`：8 个主行星项目数据（Lang Drill / 异环麻将 / AI 五子棋 / codex 视频 / GARCH-MIDAS / 烟台海洋 / 河北生态 / HPLC 灰色）。
- `doc/进展记录/`：按本地完成日期归档的进展记录。
- `doc/验收标准.md`：功能、交互、测试和人工验收清单。
- `public/assets/`：静态资源（贴图、模型、字体），按需添加。
- `try/`：临时测试与调试产物，可清空。

## 核心入口
- 开发服务器：`npm run dev`（默认 http://127.0.0.1:5173）
- 类型检查：`npm run typecheck`
- 生产构建：`npm run build`
- 预览构建：`npm run preview`（默认 http://127.0.0.1:4173）

## 读取顺序
1. 读取本文件，确认项目目标、技术栈与约束。
2. 读取 `doc/验收标准.md`，确认本轮涉及验收项。
3. 读取当天 `doc/进展记录/YYYY-M-D.md`，了解最近阶段进展。
4. 修改 3D 场景前读取 `src/scene/SceneManager.ts` 和相关组件。

## 允许修改范围
- 可修改 `src/`、`public/`、`index.html`、构建配置、`doc/`、`AGENTS.md`、`.env.example`。
- 可在 `try/` 下生成测试产物。

## 禁止修改范围
- 禁止读取或写入真实密钥、token、cookie 到可提交文件。
- 禁止把客户原始材料、未脱敏截图写入本工作区。
- 禁止直接修改 `D:\1Folder\数据分析工作区` 客户材料；只读引用或复制脱敏摘要。
- 禁止无 Git 检查点的大规模移动、删除或覆盖文件。

## 模块化实施阶段
1. **阶段1 项目骨架**：Git 初始化、Vite+TS+Three.js+GSAP+Lenis+Tailwind、基础场景、本地启动 ✅
2. **阶段2 入口恒星首页**：太阳 shader、倒 V Logo、姓名求职方向、鼠标流星
3. **阶段3 滚动叙事系统**：GSAP ScrollTrigger + Lenis、相机贝塞尔曲线、行星定位
4. **阶段4 4个核心项目行星**：Lang Drill / 异环麻将 / AI 五子棋 / codex 视频
5. **阶段5 4个数据分析代表行星**：GARCH-MIDAS / 烟台海洋 / 河北生态 / HPLC 灰色
6. **阶段6 数据分析星环**：90+ 小星体按 8 领域分组旋转、悬停/点击交互
7. **阶段7 转场动效**：陨石带、星云、彗星、星团、相机飞行曲线
8. **阶段8 技能证书空间站**：高科技风格空间站、技能矩阵、证书、联系方式
9. **阶段9 玻璃面板与详情交互**：MeshTransmissionMaterial 玻璃面板、点击行星弹详情
10. **阶段10 性能优化与验收**：LOD/instancing/纹理压缩、reduced motion、跨浏览器测试、60fps

## 资源引用
- 简历源文本：`d:\0文件夹\简历+个人站\scripts\build_resume.py`
- 简历头像：`d:\0文件夹\简历+个人站\output\assets\resume-headshot-formal-tie.png`
- 数据分析作品集：`d:\1Folder\数据分析工作区\tasks\20260702-数据分析作品集\output\数据分析作品集.md`
- Lang Drill Agent 演示站源码：`D:\1Folder\语言学习-lang-drill\语言学习-lang-drill-agent\演示web2\`
- Active Theory 复刻参考：`d:\0文件夹\简历+个人站\web\`（UI 可见，3D 未成功，仅作灵感参考）
- Active Theory 资源镜像：`d:\0文件夹\简历+个人站\activetheory-mirror\`（fonts/geometry/images 可复用）

## GitHub 状态
- 当前工作区 GitHub 仓库：待创建（建议 `q2955161835-debug/personal-site`，公开）。
- 简历引用的公开项目仓库：`https://github.com/q2955161835-debug/lang-drill-agent`
- 数据分析工作区为私有仓库，只可在个人站概括方法和规模，不公开客户材料。

## 常用命令
```powershell
# 安装依赖
npm install

# 开发服务器（http://127.0.0.1:5173）
npm run dev

# 类型检查
npm run typecheck

# 生产构建
npm run build

# 预览构建（http://127.0.0.1:4173）
npm run preview

# Git 状态
git status --short --branch
```

## 安全约束
- `.env` 是真账本，必须被 `.gitignore` 忽略。
- `.env.example` 只能放变量名、占位值和说明。
- 外部文件读取行为需记录到进展文档；工作区外文件地址必须写明。
- 任务完成后需报告涉及验收项、验证结果、未通过项和原因。
- 完成后报告是否引入重复实现、临时补丁或技术债。
