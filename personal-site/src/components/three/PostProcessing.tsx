"use client";

import {
  EffectComposer,
  Bloom,
  Vignette,
} from "@react-three/postprocessing";

export default function PostProcessing() {
  return (
    <EffectComposer multisampling={0} enabled>
      <Bloom
        intensity={0.44}
        luminanceThreshold={0.42}
        luminanceSmoothing={0.9}
        mipmapBlur
      />
      <Vignette offset={0.3} darkness={0.5} />
    </EffectComposer>
  );
}
