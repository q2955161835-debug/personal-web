import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack-compatible: no custom loader rules needed
  // GLSL shaders are imported as .ts string exports
};

export default nextConfig;
