export interface Skill {
  name: string;
  category: SkillCategory;
  level: number; // 1-5
}

export type SkillCategory = "dataAnalysis" | "aiProduct" | "statistics";

export const skills: Skill[] = [
  // Data Analysis
  { name: "Python", category: "dataAnalysis", level: 5 },
  { name: "R", category: "dataAnalysis", level: 4 },
  { name: "SPSS", category: "dataAnalysis", level: 4 },
  { name: "Excel", category: "dataAnalysis", level: 5 },
  { name: "SQL", category: "dataAnalysis", level: 4 },
  { name: "Tableau", category: "dataAnalysis", level: 3 },
  { name: "Pandas", category: "dataAnalysis", level: 5 },
  { name: "NumPy", category: "dataAnalysis", level: 4 },
  { name: "Matplotlib", category: "dataAnalysis", level: 4 },
  { name: "Scikit-learn", category: "dataAnalysis", level: 4 },

  // AI Product
  { name: "Prompt Engineering", category: "aiProduct", level: 5 },
  { name: "AI Agent", category: "aiProduct", level: 4 },
  { name: "React", category: "aiProduct", level: 4 },
  { name: "TypeScript", category: "aiProduct", level: 4 },
  { name: "Next.js", category: "aiProduct", level: 4 },
  { name: "LangChain", category: "aiProduct", level: 3 },
  { name: "OpenAI API", category: "aiProduct", level: 4 },
  { name: "Figma", category: "aiProduct", level: 3 },
  { name: "Product Design", category: "aiProduct", level: 4 },
  { name: "Three.js", category: "aiProduct", level: 3 },

  // Statistics
  { name: "概率论", category: "statistics", level: 4 },
  { name: "回归分析", category: "statistics", level: 5 },
  { name: "多元统计", category: "statistics", level: 4 },
  { name: "假设检验", category: "statistics", level: 4 },
  { name: "方差分析", category: "statistics", level: 4 },
  { name: "贝叶斯统计", category: "statistics", level: 3 },
  { name: "时间序列分析", category: "statistics", level: 4 },
  { name: "聚类分析", category: "statistics", level: 4 },
  { name: "主成分分析", category: "statistics", level: 3 },
  { name: "因子分析", category: "statistics", level: 3 },
];

/** Group skills by category for display */
export const skillsByCategory = skills.reduce<
  Record<SkillCategory, Skill[]>
>(
  (acc, skill) => {
    acc[skill.category].push(skill);
    return acc;
  },
  {
    dataAnalysis: [],
    aiProduct: [],
    statistics: [],
  },
);
