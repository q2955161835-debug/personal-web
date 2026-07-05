"use client";

import { createContext, useContext, useState, useCallback } from "react";

interface SceneContextValue {
  activeProjectScene: string | null;
  setActiveProjectScene: (scene: string | null) => void;
}

const SceneContext = createContext<SceneContextValue>({
  activeProjectScene: null,
  setActiveProjectScene: () => {},
});

export function SceneProvider({ children }: { children: React.ReactNode }) {
  const [activeProjectScene, setActiveProjectScene] = useState<string | null>(null);

  return (
    <SceneContext.Provider value={{ activeProjectScene, setActiveProjectScene }}>
      {children}
    </SceneContext.Provider>
  );
}

export function useProjectScene() {
  return useContext(SceneContext);
}
