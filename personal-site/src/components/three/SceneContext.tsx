"use client";

import { createContext, useContext, useState } from "react";

interface SceneContextValue {
  activeProjectScene: string | null;
  setActiveProjectScene: (scene: string | null) => void;
  activeSection: string | null;
  setActiveSection: (section: string | null) => void;
  carouselActiveIndex: number;
  setCarouselActiveIndex: (index: number) => void;
  projectProgress: number;
  setProjectProgress: (progress: number) => void;
  dnaDissolveProgress: number;
  setDnaDissolveProgress: (progress: number) => void;
  carouselSelectedIndex: number | null;
  setCarouselSelectedIndex: (index: number | null) => void;
  helixZoomedStation: number | null;
  setHelixZoomedStation: (index: number | null) => void;
}

const SceneContext = createContext<SceneContextValue>({
  activeProjectScene: null,
  setActiveProjectScene: () => {},
  activeSection: null,
  setActiveSection: () => {},
  carouselActiveIndex: 0,
  setCarouselActiveIndex: () => {},
  projectProgress: 0,
  setProjectProgress: () => {},
  dnaDissolveProgress: 1,
  setDnaDissolveProgress: () => {},
  carouselSelectedIndex: null,
  setCarouselSelectedIndex: () => {},
  helixZoomedStation: null,
  setHelixZoomedStation: () => {},
});

export function SceneProvider({ children }: { children: React.ReactNode }) {
  const [activeProjectScene, setActiveProjectScene] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [carouselActiveIndex, setCarouselActiveIndex] = useState(0);
  const [projectProgress, setProjectProgress] = useState(0);
  const [dnaDissolveProgress, setDnaDissolveProgress] = useState(1);
  const [carouselSelectedIndex, setCarouselSelectedIndex] = useState<number | null>(null);
  const [helixZoomedStation, setHelixZoomedStation] = useState<number | null>(null);

  return (
    <SceneContext.Provider
      value={{
        activeProjectScene,
        setActiveProjectScene,
        activeSection,
        setActiveSection,
        carouselActiveIndex,
        setCarouselActiveIndex,
        projectProgress,
        setProjectProgress,
        dnaDissolveProgress,
        setDnaDissolveProgress,
        carouselSelectedIndex,
        setCarouselSelectedIndex,
        helixZoomedStation,
        setHelixZoomedStation,
      }}
    >
      {children}
    </SceneContext.Provider>
  );
}

export function useProjectScene() {
  return useContext(SceneContext);
}
