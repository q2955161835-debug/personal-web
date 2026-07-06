import type { TimelineEntry } from "@/types";

export const timelineEntries: TimelineEntry[] = [
  {
    id: "statistics-major",
    year: 2023,
    period: "2023.09-至今",
    title: "统计学方法训练",
    organization: "统计学专业",
    description:
      "以概率论、数理统计、回归分析、多元统计和时间序列为底层训练，形成从问题定义、变量建模、结果解释到交付复盘的一套分析框架。",
    tags: ["统计建模", "回归分析", "时间序列"],
    type: "education",
  },
  {
    id: "analysis-delivery",
    year: 2025,
    period: "2025.05-至今",
    title: "数据分析交付体系",
    organization: "独立项目制",
    description:
      "将 93 个数据分析项目沉淀为可复用交付体系，覆盖问卷量表、金融实证、医学统计、化学分析、数据工程、论文辅助和遗漏类补齐复核，累计形成 619 份过程与交付文件。",
    tags: ["SPSS", "R", "Python", "交付体系"],
    type: "work",
  },
  {
    id: "agent-workflow",
    year: 2025,
    period: "2025.05-至今",
    title: "AI Agent 工程工作流",
    organization: "Claude Code / Codex / Cursor",
    description:
      "把 Agent 工具链从辅助问答推进为个人工程系统：需求拆解、代码实现、调试验证、文档沉淀、Git 回退和验收记录都进入同一套流程，用高频迭代支撑产品与数据交付。",
    tags: ["AI Agent", "全栈工程", "自动化", "验收闭环"],
    type: "work",
  },
  {
    id: "xianyu-commerce-ops",
    year: 2025,
    period: "2025.12-至今",
    title: "闲鱼商业化运营实验",
    organization: "个人商业化项目",
    description:
      "围绕闲置资产流转和轻量交易场景做项目化运营，覆盖选品判断、发布素材、沟通转化、订单跟进和复盘记录，并尝试把重复操作抽象为半自动化流程。",
    tags: ["闲鱼运营", "用户沟通", "交易复盘", "流程自动化"],
    type: "work",
  },
  {
    id: "ai-products",
    year: 2026,
    period: "2026.01-至今",
    title: "AI 产品独立交付",
    organization: "个人产品线",
    description:
      "围绕语言学习、游戏 AI、网页采集、自动化工具、金融量化和作品集系统推进产品化开发，已公开落地 6 款可展示项目，并保留多条未公开工具线作为后续迭代资产。",
    tags: ["Next.js", "FastAPI", "Tauri", "LLM"],
    type: "project",
  },
];
