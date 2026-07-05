import Navigation from "@/components/layout/Navigation";
import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import AnalysisSection from "@/components/sections/AnalysisSection";
import TimelineSection from "@/components/sections/TimelineSection";
import ContactSection from "@/components/sections/ContactSection";
import { SceneProvider } from "@/components/three/SceneContext";

export default function Home() {
  return (
    <main>
      <SceneProvider>
        <Navigation />
        <HeroSection />
        <AboutSection />
        <ProjectsSection />
        <AnalysisSection />
        <TimelineSection />
        <ContactSection />
      </SceneProvider>
    </main>
  );
}
