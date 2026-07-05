export const carouselFragmentShader = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;

void main() {
  vec2 center = gl_PointCoord - vec2(0.5);
  float dist = length(center);

  float alpha = 1.0 - smoothstep(0.25, 0.5, dist);

  if (alpha < 0.01) {
    discard;
  }

  // Subtle glow
  float glow = exp(-dist * 5.0) * 0.3;
  vec3 finalColor = vColor + glow;

  gl_FragColor = vec4(finalColor * alpha * vAlpha, alpha * vAlpha);
}
`;
