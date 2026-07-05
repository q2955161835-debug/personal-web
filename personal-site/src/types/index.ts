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
export interface DataAnalysisProject {
  name: string;
  domain: string;
  methods: string[];
  dataSize?: string;
  keyFindings?: string;
  year: number;
}

/* ── Timeline Entry ── */
export interface TimelineEntry {
  year: number;
  month: number;
  title: string;
  description: string;
}
