import type { Project } from '@/types';

export const projects: Project[] = [
  {
    id: 'lang-drill-agent',
    name: 'Lang Drill Agent',
    subtitle: '基于 AI 的沉浸式语言学习桌面工具',
    description:
      '一款结合大语言模型的桌面端语言学习应用，支持多语种单词训练、智能例句生成与自适应复习。采用 Tauri 实现轻量跨平台桌面体验，FastAPI 后端提供高效的推理服务，前端基于 React + Vite 构建，带来流畅的交互体验。',
    techStack: ['React', 'Vite', 'FastAPI', 'Tauri', 'TypeScript'],
    tags: ['AI', '桌面应用', '语言学习', 'LLM'],
    priority: 5,
    githubUrl: 'https://github.com/q2955161835-debug/lang-drill-agent',
    year: 2025,
    category: 'ai-product',
    scene: 'particles',
  },
  {
    id: 'ai-gomoku',
    name: 'AI 五子棋对决',
    subtitle: '融合传统算法与大语言模型的五子棋对弈平台',
    description:
      '基于 Next.js 构建的在线五子棋游戏平台，集成了经典 Minimax 博弈算法与大语言模型辅助分析功能。支持人机对战和双人对弈模式，通过 Canvas 渲染棋盘并提供实时棋局分析，让玩家在对弈中感受 AI 策略的演变。',
    techStack: ['Next.js', 'Canvas', 'Minimax', 'LLM', 'TypeScript'],
    tags: ['AI', '游戏', '博弈算法', 'Web'],
    priority: 4,
    githubUrl: 'https://github.com/q2955161835-debug/ai-gomoku',
    year: 2024,
    category: 'ai-product',
    scene: 'grid',
  },
  {
    id: 'auto-mahjong',
    name: '异环自动打麻将',
    subtitle: '基于视觉识别的游戏自动化麻将系统',
    description:
      '为游戏《异环》开发的麻将自动化辅助工具，利用 YOLOv8 进行实时牌面识别，结合 PyTorch 深度学习模型实现策略决策。系统能够自动完成从识牌、出牌到听牌判定的全流程，展现了计算机视觉在游戏场景中的应用潜力。',
    techStack: ['Python', 'YOLOv8', 'PyTorch', 'OpenCV'],
    tags: ['游戏自动化', '计算机视觉', '深度学习'],
    priority: 4,
    githubUrl: 'https://github.com/q2955161835-debug/auto-mahjong',
    year: 2025,
    category: 'automation',
    scene: 'flow',
  },
  {
    id: 'delta-force-diagnostics',
    name: '三角洲卡顿诊断工具',
    subtitle: '基于系统追踪的性能瓶颈诊断与可视化分析工具',
    description:
      '面向《三角洲行动》玩家开发的帧率诊断工具，利用 Windows ETW（Event Tracing for Windows）和 WPR（Windows Performance Recorder）采集系统级性能数据。通过 Python 分析采集的追踪日志，精确定位 CPU 瓶颈、GPU 占用异常和内存泄漏等问题，帮助玩家优化游戏体验。',
    techStack: ['Python', 'ETW', 'WPR', 'Data Analysis'],
    tags: ['性能诊断', '系统追踪', '数据分析'],
    priority: 3,
    year: 2025,
    category: 'automation',
    scene: 'pulse',
  },
  {
    id: 'codex-video',
    name: 'Codex 视频制作',
    subtitle: '基于 Remotion 框架的程序化 AI 视频生成工具',
    description:
      '利用 Remotion 框架以编程方式生成高质量视频内容，结合 React 组件化的设计思路实现灵活的视频模板系统。支持自动化批量生成、动态数据驱动的可视化内容，大幅提升视频制作效率，为内容创作提供技术赋能。',
    techStack: ['Remotion', 'React', 'TypeScript', 'FFmpeg'],
    tags: ['视频生成', '自动化', '内容创作'],
    priority: 3,
    year: 2025,
    category: 'creative',
    scene: 'wave',
  },
  {
    id: 'quant-trading',
    name: '量化交易策略库',
    subtitle: '多平台量化交易策略开发与回测框架',
    description:
      '一套完整的量化交易策略研究与实盘执行框架，支持多平台 API 对接，涵盖趋势跟踪、均值回归、统计套利等多种策略类型。提供策略回测引擎和风险评估模块，帮助验证策略有效性并优化参数配置。',
    techStack: ['Python', '多平台API', 'Pandas', 'NumPy'],
    tags: ['量化交易', '策略开发', '数据分析'],
    priority: 3,
    year: 2024,
    category: 'finance',
    scene: 'chart',
  },
];

export const categories = [
  'all',
  'ai-product',
  'automation',
  'finance',
  'creative',
] as const;

export const categoryLabels: Record<string, string> = {
  all: '全部',
  'ai-product': 'AI 产品',
  automation: '自动化工具',
  finance: '金融量化',
  creative: '创意工具',
};
