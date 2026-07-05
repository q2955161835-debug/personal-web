import type { TimelineEntry } from "@/types";

export const timelineEntries: TimelineEntry[] = [
  {
    id: "statistics-major",
    year: 2023,
    period: "2023.09-至今",
    title: "统计学本科训练",
    organization: "统计学专业",
    description:
      "系统学习概率论、数理统计、回归分析、多元统计和时间序列，为后续数据分析与建模交付建立方法论基础。",
    tags: ["统计学", "回归分析", "时间序列"],
    type: "education",
  },
  {
    id: "analysis-delivery",
    year: 2025,
    period: "2025.06-至今",
    title: "数据分析项目交付",
    organization: "独立项目制",
    description:
      "累计完成 93 个数据分析项目与 619 份过程/交付文件，覆盖问卷、金融、医学、化学和社会科学场景。",
    tags: ["SPSS", "R", "Python", "交付体系"],
    type: "work",
  },
  {
    id: "ai-products",
    year: 2026,
    period: "2026.01-至今",
    title: "AI 产品独立开发",
    organization: "个人产品线",
    description:
      "围绕语言学习、游戏 AI、自动化工具和金融量化开发完整应用，从产品定位、架构到前后端实现形成闭环。",
    tags: ["Next.js", "FastAPI", "Tauri", "LLM"],
    type: "project",
  },
  {
    id: "agent-workflow",
    year: 2026,
    period: "2026.03-至今",
    title: "AI Agent 工程工作流",
    organization: "Claude Code / Codex / Cursor",
    description:
      "深度使用 Agent 工具链完成需求拆解、代码实现、调试验证和文档沉淀，形成高频迭代的个人工程系统。",
    tags: ["AI Agent", "全栈工程", "自动化"],
    type: "work",
  },
];
