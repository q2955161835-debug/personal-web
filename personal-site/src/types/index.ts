/* ── Project ── */
export interface Project {
  name: string;
  description: string;
  techStack: string[];
  tags: string[];
  priority: number;
  githubUrl?: string;
  demoUrl?: string;
  imageUrl?: string;
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
