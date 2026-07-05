/**
 * 个人站项目数据 - 主行星
 * 来源：简历 + 数据分析作品集 + 本地项目探索
 */
export interface ProjectPlanetData {
  id: string;
  name: string;
  nameEn: string;
  subtitle: string;
  category: 'product' | 'data-analysis' | 'ai';
  color: number;
  emissive: number;
  surfaceType: 'word-galaxy' | 'yolo-tiles' | 'gomoku-grid' | 'video-frames' | 'time-series' | 'multi-model' | 'map-grid' | 'chromatogram';
  brief: string;
  highlights: string[];
  tags: string[];
  detail: {
    overview: string;
    techStack: string[];
    keyFeatures: string[];
    outcomes?: string[];
    links?: { label: string; url: string }[];
  };
}

export const PROJECT_PLANETS: ProjectPlanetData[] = [
  {
    id: 'lang-drill',
    name: 'Lang Drill Agent',
    nameEn: 'Language Learning Agent',
    subtitle: '语言学习智能体工作台',
    category: 'product',
    color: 0x9d6bff,
    emissive: 0x4a2a8a,
    surfaceType: 'word-galaxy',
    brief: '0 到 1 独立全栈的 AI 语言考试备考工作台，覆盖英语四六级、法语/日语等级考试。',
    highlights: [
      '约 2.5 万行代码，31 个测试文件',
      'Orchestrator / Question Author / Evaluator Tutor 三类 Agent',
      'React + Vite + FastAPI + SQLite + Tauri/NSIS',
      'GitHub Actions CI + Windows VM 安装验收 + v0.1.2 Release',
    ],
    tags: ['React', 'TypeScript', 'FastAPI', 'SQLite', 'Tauri', 'AI Agent', 'GitHub Actions'],
    detail: {
      overview:
        '面向语言考试备考的本地学习工作台，把导入词表、生成题组、逐题作答、判题讲解、错题回流和学习统计串成闭环。重点服务英语四级/六级、法语四级、日语四级/六级等语言考试。正式学习状态统一写入 SQLite，模型负责生成题目和讲解，程序负责题目落库、判分、进度推进和统计。',
      techStack: ['React + TypeScript + Vite', 'FastAPI + SQLite + Pydantic', 'Tauri + NSIS 桌面打包', 'MinerU + RapidOCR 文档解析', 'LLMLingua 上下文压缩', 'GitHub Actions CI', 'pytest + ruff'],
      keyFeatures: [
        '三栏学习工作台：左侧学习状态，中间聊天与题卡，右侧分支/手机映像/截图导入',
        '词表到刷题闭环：导入词表后自动生成考试式题组，逐题展示、判分并推进',
        '截图和文件导入：支持手机背词截图 OCR、TXT、Markdown、PDF、DOCX、图片文本抽取',
        '考试式题型：英文语境句、完形空格、阅读语境问题、同义改写',
        '个性化讲解：结合当前题目、用户背景、自定义指令、会话上下文',
        '学习统计：题目完成、词汇掌握、正确率、考试倒计时、token 用量、上下文容量',
        '当日复盘：基于当日题目、作答、错题、聊天记录生成 Markdown 复盘',
        '上下文容量管理：默认上限 1,000,000 token，主动压缩',
      ],
      outcomes: [
        'Web 主应用 + Windows 桌面版安装包双形态',
        '演示站独立部署在 GitHub Pages，含动态单词银河与三栏工作台模拟器',
        '发布前完成本机构建 + 隔离后端 smoke + 安装器路径校验 + Windows VM 安装验收',
      ],
      links: [
        { label: '主仓库', url: 'https://github.com/q2955161835-debug/lang-drill-agent' },
        { label: '演示站', url: 'https://q2955161835-debug.github.io/lang-drill-agent/' },
        { label: 'Release v0.1.2', url: 'https://github.com/q2955161835-debug/lang-drill-agent/releases/tag/v0.1.2' },
      ],
    },
  },
  {
    id: 'mahjong-bot',
    name: '异环自动打麻将',
    nameEn: 'Yihuan Mahjong Bot',
    subtitle: 'YOLOv8 + RTX 5090 血流麻将机器人',
    category: 'ai',
    color: 0xff4a4a,
    emissive: 0x8a2a2a,
    surfaceType: 'yolo-tiles',
    brief: '基于深度学习的游戏自动化机器人，YOLOv8 实时识别 14 种麻将牌面并自动决策出牌。',
    highlights: [
      'YOLOv8 + PyTorch CUDA 12.4 + RTX 5090',
      '14 种牌面多分类识别 + SendInput 绝对坐标输入',
      'MiMo 大模型自动打标 + OpenCV 模板匹配双轨',
      '完整视觉-决策-输入闭环，含 UI 与热键系统',
    ],
    tags: ['YOLOv8', 'PyTorch', 'CUDA', 'OpenCV', 'SendInput', '深度学习', '游戏自动化'],
    detail: {
      overview:
        '异环游戏血流麻将自动打牌机器人。通过 YOLOv8 实时检测屏幕上的麻将牌面，结合策略引擎自动完成抓牌、理牌、决策、出牌、碰杠胡等全流程操作。支持热键控制、UI 可视化、运行时状态监控。',
      techStack: ['YOLOv8 + PyTorch CUDA 12.4', 'OpenCV 模板匹配', 'SendInput 绝对坐标输入', 'MiMo 大模型自动打标', 'PyInstaller 打包', 'pytest 测试套件'],
      keyFeatures: [
        '视觉系统：YOLOv8 实时检测 1m-9m/1p-9p/1s-9s 共 27 种牌面（含字牌扩展）',
        '决策引擎：基于规则 + 概率评估的出牌策略，支持碰/杠/胡判断',
        '输入控制：SendInput 绝对坐标点击，避免鼠标移动干扰',
        '热键系统：开始/暂停/停止/截图等全局热键',
        'UI 面板：实时显示识别结果、手牌状态、决策日志',
        '运行时监控：帧率、识别置信度、策略状态可视化',
        '自动化标注：MiMo 大模型辅助生成训练标注',
      ],
      outcomes: [
        '完整视觉-决策-输入闭环可运行',
        'GitHub 私有仓库（含训练权重与游戏截图资产）',
        '10 个测试文件覆盖几何、视觉、策略、输入、UI 等模块',
      ],
      links: [{ label: 'GitHub（私有）', url: 'https://github.com/q2955161835-debug/yihuan-majiang-auto' }],
    },
  },
  {
    id: 'gomoku-ai',
    name: 'AI 五子棋对决',
    nameEn: 'Gomoku AI Duel',
    subtitle: 'Minimax + LM Studio 大模型对战',
    category: 'ai',
    color: 0x4a9eff,
    emissive: 0x1a4a8a,
    surfaceType: 'gomoku-grid',
    brief: 'Next.js 14 + TypeScript 实现的 AI 五子棋对战，Minimax α-β 剪枝 5 层深度 + 本地大模型双引擎。',
    highlights: [
      'Minimax + α-β 剪枝 5 层搜索深度',
      '双冲四/双活三威胁检测算法',
      'LM Studio 本地大模型 + Minimax 双引擎',
      'Next.js 14 + TypeScript + Tailwind',
    ],
    tags: ['Next.js 14', 'TypeScript', 'Tailwind', 'Minimax', 'α-β 剪枝', 'LM Studio', 'AI 对战'],
    detail: {
      overview:
        'AI 五子棋对战游戏，支持人机对战与引擎对比。核心是 Minimax α-β 剪枝算法，搜索深度 5 层，含双冲四、双活三等威胁检测。同时接入 LM Studio 本地大模型作为对照引擎，对比传统搜索算法与大语言模型在博弈决策上的差异。',
      techStack: ['Next.js 14 App Router', 'TypeScript', 'Tailwind CSS', 'Minimax + α-β 剪枝', 'LM Studio 本地大模型 API', 'React Server Components'],
      keyFeatures: [
        'Minimax 算法 5 层搜索深度 + α-β 剪枝优化',
        '威胁检测：双冲四、双活三、必胜局面识别',
        '评估函数：棋型识别 + 位置权重 + 攻防平衡',
        'LM Studio 接入：本地大模型作为对照决策引擎',
        'AI 状态实时显示：思考深度、节点数、决策耗时',
        '游戏说明面板与可视化棋盘',
      ],
      outcomes: ['完整前后端可运行', 'Next.js 14 现代化栈', '传统搜索 vs 大模型决策对照'],
    },
  },
  {
    id: 'codex-video',
    name: 'codex 视频工作区',
    nameEn: 'Remotion Video Studio',
    subtitle: 'Remotion + CosyVoice TTS AI 视频生成',
    category: 'product',
    color: 0xff9d4a,
    emissive: 0x8a4a1a,
    surfaceType: 'video-frames',
    brief: '基于 Remotion 4.0 + Node.js 22 + Codex Agent + CosyVoice 3.0 CUDA TTS 的 AI 视频生成工作区。',
    highlights: [
      'Remotion 4.0.484 + Node.js 22',
      'CosyVoice 3.0 CUDA TTS 语音合成',
      'OpenMontage 旁路桥接 + Codex Agent 编排',
      '已产出 Lang Drill 抖音/横版宣传视频',
    ],
    tags: ['Remotion', 'Node.js 22', 'CosyVoice', 'CUDA', 'TTS', 'Codex Agent', 'AI 视频'],
    detail: {
      overview:
        'AI 视频生成工作区，集成 Remotion 程序化视频、CosyVoice 3.0 CUDA 语音合成、Codex Agent 编排和 OpenMontage 旁路桥接。已实际产出 Lang Drill Agent 的抖音竖版与横版宣传视频。',
      techStack: ['Remotion 4.0.484', 'Node.js 22', 'CosyVoice 3.0 CUDA TTS', 'OpenMontage 旁路桥接', 'Codex Agent 编排', 'ESLint + Prettier'],
      keyFeatures: [
        'Remotion 程序化视频：React 组件定义视频帧',
        'CosyVoice 3.0 CUDA TTS：本地 GPU 语音合成',
        'Codex Agent 编排：多步骤视频生成流程',
        'OpenMontage 旁路桥接：外部素材集成',
        '任务索引与进展记录管理',
        '已产出 Lang Drill 抖音/横版宣传视频',
      ],
      outcomes: ['实际视频产出验证工作流可用', '本地 CUDA 加速 TTS', '可复用的视频生成任务模板'],
    },
  },
  {
    id: 'garch-midas',
    name: 'GARCH-MIDAS 混频波动率',
    nameEn: 'Mixed-Frequency Volatility',
    subtitle: '全球供应链与经济不确定性视角',
    category: 'data-analysis',
    color: 0xffd966,
    emissive: 0x8a6a1a,
    surfaceType: 'time-series',
    brief: 'GARCH(1,1) + GARCH-MIDAS 混频波动率预测，Beta 多项式滞后权重，滚动窗口扩展预测。',
    highlights: [
      'R rugarch/rmgarch 混频建模',
      'Beta 多项式滞后权重 + GSCPI+GECON 宏观-日度混频',
      '滚动窗口扩展预测 + MAE/RMSE/MAPE 双层误差',
      '全球供应链压力指数与经济政策不确定性',
    ],
    tags: ['R', 'rugarch', 'rmgarch', 'GARCH-MIDAS', 'Beta多项式', '混频数据', '波动率预测'],
    detail: {
      overview:
        '金融工程深度项目。使用 GARCH-MIDAS 模型将日度金融波动率与月度宏观经济变量结合，预测全球供应链压力指数（GSCPI）与经济政策不确定性（GECON）影响下的资产波动率。采用 Beta 多项式滞后权重函数，滚动窗口扩展预测，并用 MAE/RMSE/MAPE 双层误差评估预测精度。',
      techStack: ['R 语言', 'rugarch 包', 'rmgarch 包', 'Beta 多项式滞后', '滚动窗口预测', 'MAE/RMSE/MAPE 评估'],
      keyFeatures: [
        'GARCH(1,1) 基线模型 + GARCH-MIDAS 混频模型对比',
        'Beta 多项式滞后权重函数（1-12 月衰减）',
        'GSCPI 全球供应链压力指数 + GECON 经济政策不确定性指数',
        '滚动窗口扩展预测（expanding window）',
        'MAE / RMSE / MAPE 双层误差评估',
        '波动率与宏观变量的动态相关分析',
      ],
      outcomes: ['混频模型预测精度优于单频 GARCH 基线', '宏观变量显著改善波动率预测', '完整 R 代码与报告交付'],
    },
  },
  {
    id: 'ocean-food',
    name: '烟台海洋轻食混合建模',
    nameEn: 'Marine Light Food Multi-Model',
    subtitle: 'Logistic + BP + K-means + ACSI 结构方程四模型融合',
    category: 'data-analysis',
    color: 0x6bfff0,
    emissive: 0x1a8a8a,
    surfaceType: 'multi-model',
    brief: '消费经济学 + 机器学习多模型融合典范，Logistic 回归、BP 神经网络、K-means 聚类、ACSI 结构方程四模型联合分析。',
    highlights: [
      'R nnet/neuralnet/cluster/lavaan + SPSS Amos',
      'BP 神经网络 + 肘部法则 + 轮廓系数确定最优聚类数',
      'ACSI 顾客满意度结构方程路径分析',
      '四模型融合的消费图景与市场战略',
    ],
    tags: ['R', 'SPSS Amos', 'Logistic', 'BP 神经网络', 'K-means', 'ACSI', '结构方程', '多模型融合'],
    detail: {
      overview:
        '烟台海洋轻食消费图景与市场战略实证研究。采用四模型融合方法：Logistic 回归识别消费影响因素，BP 神经网络捕捉非线性关系，K-means 聚类划分消费者群体，ACSI 结构方程测量顾客满意度路径。R 与 SPSS Amos 双工具协同，肘部法则 + 轮廓系数确定最优聚类数。',
      techStack: ['R (nnet, neuralnet, cluster, lavaan)', 'SPSS Amos', 'Logistic 回归', 'BP 神经网络', 'K-means 聚类', 'ACSI 结构方程'],
      keyFeatures: [
        'Logistic 回归：消费意愿影响因素识别',
        'BP 神经网络：非线性关系建模，含隐层节点优化',
        'K-means 聚类：肘部法则 + 轮廓系数确定最优 K',
        'ACSI 结构方程：顾客满意度路径分析（期望-感知-满意-忠诚）',
        '四模型结论交叉验证与市场战略建议',
      ],
      outcomes: ['四模型结论一致性验证', '消费者分群与精准市场策略', '完整 R 代码 + Amos 模型 + 报告交付'],
    },
  },
  {
    id: 'eco-data',
    name: '河北生态指标采集',
    nameEn: 'Hebei Eco-Data Engineering',
    subtitle: '11 市 13 项指标 P0-P5 优先级采集工程',
    category: 'data-analysis',
    color: 0x6bff9d,
    emissive: 0x1a8a4a,
    surfaceType: 'map-grid',
    brief: '河北省 11 市 2023 年 13 项生态环境指标数据采集工程，scrapling 反爬 + Tavily 智能搜索 + 计算推导引擎。',
    highlights: [
      'scrapling 反爬 + Tavily 智能搜索双引擎',
      'P0-P5 数据品质优先级体系',
      '计算推导引擎（缺失值由公式推导补全）',
      '11 市 × 13 指标多工作表审计追踪交付',
    ],
    tags: ['Python', 'scrapling', 'Tavily API', '反爬', '数据采集', '审计追踪', '环境经济'],
    detail: {
      overview:
        '河北省 11 个地级市 2023 年 13 项生态环境指标（如 PM2.5、SO2、NOx、GDP 能耗等）的数据采集工程。采用 scrapling 反爬框架 + Tavily 智能搜索双引擎，建立 P0-P5 数据品质优先级体系，缺失值通过计算推导引擎补全，最终交付多工作表 Excel 含完整审计追踪。',
      techStack: ['Python', 'scrapling 反爬框架', 'Tavily API 智能搜索', 'openpyxl 多工作表写入', 'P0-P5 优先级体系', '计算推导引擎'],
      keyFeatures: [
        '双引擎采集：scrapling 反爬 + Tavily 智能搜索 fallback',
        'P0-P5 数据品质分级：P0 官方统计、P1 政府公报、P2 新闻报道、P3 推导、P4 估算、P5 缺失',
        '计算推导引擎：由相关指标公式推导缺失值（如由 PM10 推导 PM2.5）',
        '审计追踪：每个数据点记录来源 URL、采集时间、置信度',
        '多工作表交付：按指标分 sheet，含原始数据、推导数据、审计日志',
      ],
      outcomes: ['11 市 × 13 指标完整数据集', 'P0-P5 品质分级与审计追踪', '可复用的采集-推导-审计工作流'],
    },
  },
  {
    id: 'hplc-gra',
    name: 'HPLC 灰色关联谱效关系',
    nameEn: 'HPLC-Gray Relational Analysis',
    subtitle: '青刺尖抗氧化活性成分中药学交叉',
    category: 'data-analysis',
    color: 0x9dff6b,
    emissive: 0x4a8a1a,
    surfaceType: 'chromatogram',
    brief: '基于 HPLC 指纹图谱 + 邓氏灰色关联度分析青刺尖抗氧化活性成分，中药学与仪器分析交叉。',
    highlights: [
      'HPLC 指纹图谱 + 邓氏灰色关联度 GRA',
      '分辨系数 ρ=0.5 + 精密度 RSD 方法学验证',
      '29 个 CDF 批量提取',
      '中药学 + 仪器分析 + 统计建模三学科交叉',
    ],
    tags: ['HPLC', '灰色关联度', '邓氏GRA', '中药学', '仪器分析', '抗氧化', '谱效关系'],
    detail: {
      overview:
        '基于谱-效关系的青刺尖抗氧化活性成分分析。通过 HPLC（高效液相色谱）建立指纹图谱，测定多个批次样品的抗氧化活性（DPPH/ABTS 自由基清除率），采用邓氏灰色关联度分析（GRA）建立色谱峰与活性的关联，分辨系数 ρ=0.5，识别关键活性成分。完整方法学验证含精密度 RSD。',
      techStack: ['HPLC 高效液相色谱', '邓氏灰色关联度分析 GRA', '分辨系数 ρ=0.5', '精密度 RSD 验证', 'CDF 批量提取', 'R/Python 统计计算'],
      keyFeatures: [
        'HPLC 指纹图谱建立：多个批次样品色谱峰对齐与共有峰识别',
        '抗氧化活性测定：DPPH 与 ABTS 自由基清除率双指标',
        '邓氏灰色关联度：分辨系数 ρ=0.5，计算各色谱峰与活性的关联系数',
        '方法学验证：精密度 RSD、重复性、稳定性、加样回收率',
        '29 个 CDF（累积分布函数）批量提取与可视化',
        '关键活性成分识别与排序',
      ],
      outcomes: ['识别关键抗氧化活性成分', '完整方法学验证报告', '谱-效关系模型可复用'],
    },
  },
];
