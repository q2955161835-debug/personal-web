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
    "具备 AI 产品全链路独立交付能力——从产品定位、架构设计、前后端开发到打包发布与线上部署，均能以个人为单位完成闭环。目前已独立落地 6 款 AI 驱动的产品，涵盖语言学习、游戏 AI、自动化工具与金融量化等方向。",
    "一年内累计交付 93 个数据分析项目、619 份过程与交付文件，覆盖 Logistic 回归、面板双向固定效应、GARCH-MIDAS 混频模型、K-means 聚类、灰色关联分析等主流方法。横跨问卷调查、金融实证、医学统计、化学仪器分析等 7 个领域，单项目交付成功率 90%。",
    "深度使用 Claude Code、Codex、Cursor 等 AI Agent 工具链驱动开发，历史消耗超 6B+ token，代码产出 3M+。统计学本科背景赋予扎实的数据建模直觉，全栈工程能力保障产品从分析到上线的完整落地——严谨与工程，两者兼得。",
  ],
};
