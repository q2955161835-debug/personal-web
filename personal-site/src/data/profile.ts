export interface Profile {
  name: string;
  tagline: string;
  subtitle: string;
  email: string;
  github: string;
  wechat: string;
  phone: string;
  location: string;
  bio: string[];
}

export const profile: Profile = {
  name: "FAN JUN JIE",
  tagline: "AI Product & Data Analysis",
  subtitle: "统计学 × AI × 数据分析",
  email: "q2955161835@gmail.com",
  github: "https://github.com/q2955161835-debug",
  wechat: "Y2955161835",
  phone: "19905127585",
  location: "",
  bio: [
    "具备跨数据、AI 产品与自动化工程的复合交付能力：以统计建模为底层方法，叠加 AI Agent、全栈工程、数据交付和自动化部署，能从一句需求推进到可体验 Demo、可安装桌面端、可复盘文档和上线后的迭代闭环。已公开落地 6 款 AI 驱动产品，公开展示之外还沉淀了多条未开放的内部工具线、比赛原型和效率系统。",
    "过去一年累计交付 93 个数据分析项目、619 份过程与交付文件，覆盖 Logistic 回归、面板双向固定效应、GARCH-MIDAS 混频模型、K-means 聚类、灰色关联分析等方法栈。交付场景横跨问卷调查、金融实证、医学统计、化学仪器分析、数据工程、论文辅助和“遗漏类”补齐复核等多个领域，单项目交付成功率 90%。",
    "深度使用 Claude Code、Codex、Cursor 等 AI Agent 工具链驱动开发，历史消耗超 16B+ token，累计代码行数 30M+。统计学本科背景提供建模直觉，工程能力负责把分析、产品、部署和验收压进同一条交付链——既能讲清逻辑，也能把系统跑起来。",
  ],
};
