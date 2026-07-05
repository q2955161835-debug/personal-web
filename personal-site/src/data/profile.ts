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
  name: "范俊杰",
  tagline: "AI Product & Data Analysis",
  subtitle: "Turning Data into Decisions, Ideas into Products",
  email: "fanjunjie@example.com",
  github: "https://github.com/fanjunjie",
  wechat: "fanjunjie_wx",
  phone: "+86 138-xxxx-xxxx",
  location: "China",
  bio: [
    "Passionate about bridging the gap between data science and product development. With a strong foundation in statistical analysis and machine learning, I specialize in transforming complex datasets into actionable insights that drive product strategy and user experience improvements.",
    "Experienced in AI product management, from prompt engineering and AI agent design to full-stack development with React and TypeScript. I thrive at the intersection of analytical rigor and creative problem-solving, building tools and products that leverage cutting-edge AI capabilities.",
    "Committed to continuous learning and open-source contribution, with research interests spanning natural language processing, computer vision, and intelligent automation. I believe in the power of data-driven decision making to create products that genuinely improve people's lives.",
  ],
};
