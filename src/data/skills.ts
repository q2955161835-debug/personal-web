/**
 * 技能矩阵 + 证书展示数据
 */

export interface SkillCategory {
  name: string;
  nameEn: string;
  color: string;
  skills: { name: string; level: number }[];
}

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    name: '编程开发',
    nameEn: 'Programming',
    color: '#9d6bff',
    skills: [
      { name: 'Python', level: 90 },
      { name: 'TypeScript/JavaScript', level: 85 },
      { name: 'React/Vite', level: 80 },
      { name: 'FastAPI/Flask', level: 75 },
      { name: 'SQL/SQLite', level: 80 },
    ],
  },
  {
    name: '数据分析',
    nameEn: 'Data Analysis',
    color: '#4a9eff',
    skills: [
      { name: '统计建模', level: 88 },
      { name: '计量经济', level: 82 },
      { name: '机器学习', level: 75 },
      { name: '数据可视化', level: 85 },
      { name: 'SPSS/Stata', level: 80 },
    ],
  },
  {
    name: 'AI/Agent',
    nameEn: 'AI Agent',
    color: '#ff6b9d',
    skills: [
      { name: 'LLM 应用', level: 82 },
      { name: 'Agent 编排', level: 78 },
      { name: 'Prompt 工程', level: 85 },
      { name: 'RAG 系统', level: 75 },
      { name: 'Tauri/桌面端', level: 70 },
    ],
  },
  {
    name: '产品工具',
    nameEn: 'Product Tools',
    color: '#6bff9d',
    skills: [
      { name: 'Git/CI/CD', level: 80 },
      { name: 'Docker', level: 65 },
      { name: 'Figma', level: 60 },
      { name: 'Notion/飞书', level: 85 },
      { name: 'Office 全家桶', level: 90 },
    ],
  },
  {
    name: '语言',
    nameEn: 'Language',
    color: '#ffdc6b',
    skills: [
      { name: '中文（母语）', level: 100 },
      { name: '英语 CET-6', level: 75 },
      { name: '日语 N3', level: 50 },
      { name: '法语 B1', level: 40 },
    ],
  },
  {
    name: '证书荣誉',
    nameEn: 'Certificates',
    color: '#ff8a4a',
    skills: [
      { name: 'CET-6', level: 100 },
      { name: '计算机二级', level: 100 },
      { name: '盐城师范学院', level: 100 },
      { name: '校级奖学金', level: 100 },
    ],
  },
];

export interface ContactInfo {
  label: string;
  value: string;
  href?: string;
}

export const CONTACT_INFO: ContactInfo[] = [
  { label: 'GitHub', value: 'q2955161835-debug', href: 'https://github.com/q2955161835-debug' },
  { label: 'Email', value: '2955161835@qq.com', href: 'mailto:2955161835@qq.com' },
  { label: 'Location', value: '苏州 · 求职中' },
  { label: 'University', value: '盐城师范学院' },
];
