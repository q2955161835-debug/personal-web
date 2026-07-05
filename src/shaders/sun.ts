/**
 * 增强版太阳表面 Shader
 * 多层细节：颗粒 + 超颗粒 + 黑子（本影/半影）+ 光斑 + 边缘变暗 + 日珥位移
 * 高 FBM 八阶 + 多尺度噪声 + Fresnel 多层辉光
 */

export const sunVertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  varying vec3 vViewDirection;
  varying float vDisplacement;

  uniform float uTime;

  // 3D Simplex Noise（Ashima Arts）
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  // 分形布朗运动（六阶）
  float fbm(vec3 p) {
    float total = 0.0;
    float amplitude = 1.0;
    float frequency = 1.0;
    float maxAmp = 0.0;
    for (int i = 0; i < 6; i++) {
      total += snoise(p * frequency) * amplitude;
      frequency *= 2.0;
      amplitude *= 0.5;
      maxAmp += amplitude;
    }
    return total / maxAmp;
  }

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;

    // 多尺度位移：低频大尺度湍流 + 高频颗粒
    float lowFreq = fbm(position * 0.6 + vec3(uTime * 0.12));
    float midFreq = snoise(position * 1.8 + vec3(uTime * 0.25)) * 0.4;
    float highFreq = snoise(position * 4.5 + vec3(uTime * 0.4)) * 0.15;
    float displacement = (lowFreq * 0.5 + midFreq + highFreq) * 0.18;

    // 边缘日珥：在视线切线方向增强位移（limb 处生成等离子体突起）
    vec3 viewDir = normalize(cameraPosition - (modelMatrix * vec4(position, 1.0)).xyz);
    float limb = 1.0 - max(dot(viewDir, normalize(normalMatrix * normal)), 0.0);
    limb = pow(limb, 2.0);
    float prominence = snoise(position * 2.5 + vec3(uTime * 0.35)) * limb * 0.25;
    displacement += prominence;

    vDisplacement = displacement;
    vec3 newPosition = position + normal * displacement;
    vWorldPosition = (modelMatrix * vec4(newPosition, 1.0)).xyz;
    vViewDirection = normalize(cameraPosition - vWorldPosition);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

export const sunFragmentShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPosition;
  varying vec3 vViewDirection;
  varying float vDisplacement;

  uniform float uTime;
  uniform vec3 uColorCore;    // 亮黄白
  uniform vec3 uColorMid;     // 橙
  uniform vec3 uColorEdge;    // 红橙
  uniform vec3 uColorSpot;    // 黑子本影

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  float fbm(vec3 p) {
    float total = 0.0;
    float amplitude = 1.0;
    float frequency = 1.0;
    float maxAmp = 0.0;
    for (int i = 0; i < 6; i++) {
      total += snoise(p * frequency) * amplitude;
      frequency *= 2.0;
      amplitude *= 0.5;
      maxAmp += amplitude;
    }
    return total / maxAmp;
  }

  void main() {
    // 多尺度湍流
    vec3 p1 = vPosition * 1.0 + vec3(uTime * 0.18, uTime * 0.12, uTime * 0.08);
    float granules = fbm(p1 * 3.5);               // 高频颗粒
    float supergranules = fbm(p1 * 1.4);           // 中频超颗粒
    float largeScale = fbm(p1 * 0.5);              // 低频大尺度
    float turbulence = granules * 0.5 + supergranules * 0.35 + largeScale * 0.15;
    turbulence = turbulence * 0.5 + 0.5;

    // 颜色分层（光球层）
    vec3 color = mix(uColorEdge, uColorMid, smoothstep(0.25, 0.55, turbulence));
    color = mix(color, uColorCore, smoothstep(0.6, 0.88, turbulence));

    // 黑子（低湍流区域）：本影 + 半影
    float spotMask = smoothstep(0.18, 0.08, turbulence);
    float umbra = smoothstep(0.12, 0.04, turbulence);
    color = mix(color, mix(uColorSpot, uColorEdge * 0.4, 0.5), spotMask * 0.7);
    color = mix(color, uColorSpot, umbra * 0.85);

    // 光斑（高湍流亮区，靠近边缘更明显）
    float faculae = smoothstep(0.82, 0.95, turbulence);
    float limb = 1.0 - max(dot(vViewDirection, vNormal), 0.0);
    faculae *= pow(limb, 1.5);
    color += vec3(1.0, 0.95, 0.8) * faculae * 0.6;

    // 边缘变暗（真实光球临边昏暗）
    float limbDarkening = pow(max(dot(vViewDirection, vNormal), 0.0), 0.55);
    color *= 0.45 + 0.55 * limbDarkening;

    // 位移高的地方更亮（等离子体突起）
    color += uColorCore * max(vDisplacement, 0.0) * 1.5;

    // Fresnel 多层辉光
    float fresnel = 1.0 - max(dot(vViewDirection, vNormal), 0.0);
    fresnel = pow(fresnel, 2.2);
    color += uColorEdge * fresnel * 1.5;

    // 脉动
    float pulse = 0.92 + 0.08 * sin(uTime * 1.4);
    color *= pulse;

    // 整体亮度增强
    color *= 1.6;

    gl_FragColor = vec4(color, 1.0);
  }
`;

export const coronaVertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec3 vViewDirection;
  varying vec3 vPosition;

  uniform float uTime;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    // 日冕边缘扭曲
    float wobble = snoise(position * 0.8 + vec3(uTime * 0.2)) * 0.04;
    vec3 newPosition = position + normal * wobble;
    vWorldPosition = (modelMatrix * vec4(newPosition, 1.0)).xyz;
    vViewDirection = normalize(cameraPosition - vWorldPosition);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

export const coronaFragmentShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec3 vViewDirection;
  varying vec3 vPosition;

  uniform vec3 uColor;
  uniform float uTime;

  // 日冕条纹流光（模拟太阳风径向流）
  float streamers(vec3 p, float t) {
    float a = sin(p.y * 4.0 + t * 0.6) * 0.5 + 0.5;
    float b = sin(p.z * 3.5 + t * 0.5) * 0.5 + 0.5;
    float c = sin(p.x * 4.5 + t * 0.7) * 0.5 + 0.5;
    return (a + b + c) / 3.0;
  }

  void main() {
    float fresnel = 1.0 - max(dot(vViewDirection, vNormal), 0.0);
    fresnel = pow(fresnel, 2.8);

    // 流光条纹
    float s = streamers(vPosition, uTime);
    s = pow(s, 2.0);

    // 脉动
    float pulse = 0.85 + 0.15 * sin(uTime * 1.2);
    float alpha = fresnel * (0.5 + s * 0.4) * pulse;

    vec3 color = uColor * (0.7 + s * 0.6);
    gl_FragColor = vec4(color, alpha);
  }
`;
