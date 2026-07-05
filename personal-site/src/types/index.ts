/* ── Project ── */
export interface Project {
  id: string;
  name: string;
  subtitle: string; // one-line Chinese description
  description: string; // 2-3 sentence Chinese description
  techStack: string[];
  tags: string[];
  priority: number; // 1-5, higher = shown first
  githubUrl?: string;
  demoUrl?: string;
  imageUrl?: string;
  year: number;
  category: string; // "ai-product" | "automation" | "finance" | "creative"
  scene: string; // 3D scene identifier for background animation
}

/* ── Data Analysis Project ── */
export type AnalysisCategory = "问卷调查" | "金融实证" | "医学统计" | "化学分析" | "社会科学";

export interface DataAnalysisProject {
  id: string;
  title: string;
  category: AnalysisCategory;
  method: string[];
  tools: string[];
  description: string;
  year: number;
  highlights: string[];
  impactScore: number;
  deliverables: number;
  sampleSize: string;
  valueLabel: string;
  color: string;
}

export interface AnalysisMethodNode {
  name: string;
  count: number;
  category: AnalysisCategory;
}

export interface AnalysisCategorySummary {
  category: AnalysisCategory;
  count: number;
  color: string;
}

/* ── Timeline Entry ── */
export type TimelineEntryType = "education" | "work" | "project";

export interface TimelineEntry {
  id: string;
  year: number;
  period: string;
  title: string;
  organization: string;
  description: string;
  tags: string[];
  type: TimelineEntryType;
}
