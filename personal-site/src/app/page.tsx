import Navigation from "@/components/layout/Navigation";
import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";

// Phase 3: ProjectsSection - Featured projects showcase
// Phase 4: DataAnalysisSection - Data analysis portfolio
// Phase 5: TimelineSection - Experience timeline
// Phase 6: ContactSection - Contact form and info

export default function Home() {
  return (
    <main>
      <Navigation />
      <HeroSection />
      <AboutSection />
    </main>
  );
}
