import Navigation from "@/components/layout/Navigation";
import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import { SceneProvider } from "@/components/three/SceneContext";

// Phase 4: DataAnalysisSection - Data analysis portfolio
// Phase 5: TimelineSection - Experience timeline
// Phase 6: ContactSection - Contact form and info

export default function Home() {
  return (
    <main>
      <SceneProvider>
        <Navigation />
        <HeroSection />
        <AboutSection />
        <ProjectsSection />
      </SceneProvider>
    </main>
  );
}
