import Navigation from "@/components/layout/Navigation";
import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import AnalysisSection from "@/components/sections/AnalysisSection";
import TimelineSection from "@/components/sections/TimelineSection";
import ContactSection from "@/components/sections/ContactSection";
import { SceneProvider } from "@/components/three/SceneContext";
import CosmicBackdrop from "@/components/ui/CosmicBackdrop";
import SectionCursor from "@/components/ui/SectionCursor";

export default function Home() {
  return (
    <main>
      <SceneProvider>
        <Navigation />
        <SectionCursor />
        <HeroSection />
        <AboutSection />
        <div className="relative overflow-hidden">
          <CosmicBackdrop />
          <ProjectsSection />
          <AnalysisSection />
          <TimelineSection />
          <ContactSection />
        </div>
      </SceneProvider>
    </main>
  );
}
