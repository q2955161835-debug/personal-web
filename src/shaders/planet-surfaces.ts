/**
 * 行星表面 Shader 集合
 * 每个 surfaceType 对应一组 vertex/fragment shader
 * 所有 shader 共享 Simplex Noise 函数
 */

// ============ 共享 Simplex Noise GLSL ============
const SIMPLEX_NOISE_GLSL = /* glsl */ `
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

  // FBM 分形布朗运动
  float fbm(vec3 p, int octaves) {
    float sum = 0.0;
    float amp = 0.5;
    float freq = 1.0;
    for (int i = 0; i < 6; i++) {
      if (i >= octaves) break;
      sum += amp * snoise(p * freq);
      freq *= 2.0;
      amp *= 0.5;
    }
    return sum;
  }
`;

// ============ 通用 varying ============
const COMMON_VARYINGS = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec3 vViewDirection;
  varying vec3 vPosition;
  varying vec2 vUv;
`;

const COMMON_VERTEX_MAIN = /* glsl */ `
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    vViewDirection = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// ============ 1. 单词银河（Lang Drill）============
export const wordGalaxyVertexShader = `
  ${COMMON_VARYINGS}
  uniform float uTime;
  ${SIMPLEX_NOISE_GLSL}

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    vUv = uv;
    // 表面轻微湍流位移
    float displacement = snoise(position * 1.2 + vec3(uTime * 0.15)) * 0.08;
    vec3 newPosition = position + normal * displacement;
    vec4 worldPos = modelMatrix * vec4(newPosition, 1.0);
    vWorldPosition = worldPos.xyz;
    vViewDirection = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

export const wordGalaxyFragmentShader = `
  ${COMMON_VARYINGS}
  uniform float uTime;
  uniform vec3 uColor;
  uniform vec3 uColorEmissive;
  ${SIMPLEX_NOISE_GLSL}

  void main() {
    // 多尺度噪声形成"星云"纹理
    float large = fbm(vPosition * 0.8, 4);
    float fine = snoise(vPosition * 4.0 + vec3(uTime * 0.3)) * 0.3;
    float pattern = large + fine * 0.4;

    // 紫色星云带
    vec3 nebulaColor = mix(uColor * 0.4, uColorEmissive, smoothstep(-0.2, 0.6, pattern));
    // 高频亮点模拟"单词"星点
    float starPoints = pow(smoothstep(0.7, 0.95, snoise(vPosition * 8.0 + vec3(uTime * 0.5))), 3.0);
    nebulaColor += vec3(1.0, 0.9, 1.0) * starPoints * 1.5;

    // Fresnel 边缘辉光
    float fresnel = 1.0 - max(dot(vViewDirection, vNormal), 0.0);
    fresnel = pow(fresnel, 2.5);
    nebulaColor += uColorEmissive * fresnel * 0.8;

    // 临边昏暗
    float limb = pow(max(dot(vViewDirection, vNormal), 0.0), 0.6);
    nebulaColor *= 0.5 + 0.5 * limb;

    gl_FragColor = vec4(nebulaColor, 1.0);
  }
`;

// ============ 2. YOLO 牌面网格（异环麻将）============
export const yoloTilesVertexShader = `
  ${COMMON_VARYINGS}
  uniform float uTime;
  ${SIMPLEX_NOISE_GLSL}

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    vUv = uv;
    // 轻微位移
    float displacement = snoise(position * 1.5 + vec3(uTime * 0.2)) * 0.05;
    vec3 newPosition = position + normal * displacement;
    vec4 worldPos = modelMatrix * vec4(newPosition, 1.0);
    vWorldPosition = worldPos.xyz;
    vViewDirection = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

export const yoloTilesFragmentShader = `
  ${COMMON_VARYINGS}
  uniform float uTime;
  uniform vec3 uColor;
  uniform vec3 uColorEmissive;
  ${SIMPLEX_NOISE_GLSL}

  void main() {
    // 网格化（模拟 YOLO 检测框）
    vec2 grid = floor(vUv * 12.0);
    float gridLine = step(0.92, max(
      fract(vUv.x * 12.0),
      fract(vUv.y * 12.0)
    ));

    // 每个"格子"内的检测概率（用噪声模拟）
    float cellNoise = snoise(vec3(grid, uTime * 0.1));
    float detection = smoothstep(0.3, 0.8, cellNoise);

    // 牌面纹理
    vec3 baseColor = uColor * 0.3;
    vec3 detectedColor = uColorEmissive * detection;
    vec3 gridColor = vec3(0.0, 1.0, 0.6) * gridLine * 0.6;

    vec3 color = baseColor + detectedColor + gridColor;

    // Fresnel
    float fresnel = 1.0 - max(dot(vViewDirection, vNormal), 0.0);
    fresnel = pow(fresnel, 2.0);
    color += uColorEmissive * fresnel * 0.5;

    // 临边昏暗
    float limb = pow(max(dot(vViewDirection, vNormal), 0.0), 0.6);
    color *= 0.6 + 0.4 * limb;

    gl_FragColor = vec4(color, 1.0);
  }
`;

// ============ 3. 棋子矩阵（AI 五子棋）============
export const gomokuGridVertexShader = `
  ${COMMON_VARYINGS}
  uniform float uTime;
  ${SIMPLEX_NOISE_GLSL}

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    vUv = uv;
    float displacement = snoise(position * 1.3 + vec3(uTime * 0.18)) * 0.06;
    vec3 newPosition = position + normal * displacement;
    vec4 worldPos = modelMatrix * vec4(newPosition, 1.0);
    vWorldPosition = worldPos.xyz;
    vViewDirection = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

export const gomokuGridFragmentShader = `
  ${COMMON_VARYINGS}
  uniform float uTime;
  uniform vec3 uColor;
  uniform vec3 uColorEmissive;
  ${SIMPLEX_NOISE_GLSL}

  void main() {
    // 棋盘网格
    vec2 board = vUv * 15.0;
    vec2 cellFract = fract(board);
    float gridLine = step(0.94, max(cellFract.x, cellFract.y)) * 0.4;

    // 棋子（黑白点）
    vec2 cellCenter = floor(board) + 0.5;
    float dist = length(cellFract - 0.5);
    float stoneBlack = smoothstep(0.35, 0.30, dist) * step(snoise(vec3(cellCenter, 0.0)), -0.2);
    float stoneWhite = smoothstep(0.35, 0.30, dist) * step(0.2, snoise(vec3(cellCenter, 0.0)));

    vec3 color = uColor * 0.4;
    color += vec3(0.05, 0.05, 0.1) * gridLine;
    color += vec3(0.1, 0.1, 0.15) * stoneBlack;
    color += vec3(0.9, 0.95, 1.0) * stoneWhite * 0.8;

    // Fresnel
    float fresnel = 1.0 - max(dot(vViewDirection, vNormal), 0.0);
    fresnel = pow(fresnel, 2.0);
    color += uColorEmissive * fresnel * 0.5;

    float limb = pow(max(dot(vViewDirection, vNormal), 0.0), 0.6);
    color *= 0.6 + 0.4 * limb;

    gl_FragColor = vec4(color, 1.0);
  }
`;

// ============ 4. 帧粒子（codex 视频）============
export const videoFramesVertexShader = `
  ${COMMON_VARYINGS}
  uniform float uTime;
  ${SIMPLEX_NOISE_GLSL}

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    vUv = uv;
    // 较大位移，模拟视频帧跳动
    float displacement = snoise(position * 1.0 + vec3(uTime * 0.4)) * 0.12;
    vec3 newPosition = position + normal * displacement;
    vec4 worldPos = modelMatrix * vec4(newPosition, 1.0);
    vWorldPosition = worldPos.xyz;
    vViewDirection = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

export const videoFramesFragmentShader = `
  ${COMMON_VARYINGS}
  uniform float uTime;
  uniform vec3 uColor;
  uniform vec3 uColorEmissive;
  ${SIMPLEX_NOISE_GLSL}

  void main() {
    // 扫描线（模拟视频帧）
    float scanline = step(0.7, fract(vUv.y * 30.0 - uTime * 0.5));
    // 噪点
    float noise = snoise(vPosition * 15.0 + vec3(uTime * 2.0)) * 0.2 + 0.5;
    // 色彩偏移（RGB 分离感）
    float r = snoise(vPosition * 3.0 + vec3(uTime * 0.3)) * 0.3 + 0.7;
    float g = snoise(vPosition * 3.0 + vec3(uTime * 0.3, 0.0, 0.0)) * 0.3 + 0.7;
    float b = snoise(vPosition * 3.0 + vec3(0.0, 0.0, uTime * 0.3)) * 0.3 + 0.7;

    vec3 color = uColor * 0.4;
    color.r *= r;
    color.g *= g;
    color.b *= b;
    color += uColorEmissive * scanline * 0.3;
    color *= noise * 0.6 + 0.4;

    // Fresnel
    float fresnel = 1.0 - max(dot(vViewDirection, vNormal), 0.0);
    fresnel = pow(fresnel, 2.0);
    color += uColorEmissive * fresnel * 0.6;

    float limb = pow(max(dot(vViewDirection, vNormal), 0.0), 0.6);
    color *= 0.5 + 0.5 * limb;

    gl_FragColor = vec4(color, 1.0);
  }
`;

// ============ 5. 时间序列（GARCH-MIDAS）============
export const timeSeriesVertexShader = `
  ${COMMON_VARYINGS}
  uniform float uTime;
  ${SIMPLEX_NOISE_GLSL}

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    vUv = uv;
    float displacement = snoise(position * 1.4 + vec3(uTime * 0.2)) * 0.07;
    vec3 newPosition = position + normal * displacement;
    vec4 worldPos = modelMatrix * vec4(newPosition, 1.0);
    vWorldPosition = worldPos.xyz;
    vViewDirection = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

export const timeSeriesFragmentShader = `
  ${COMMON_VARYINGS}
  uniform float uTime;
  uniform vec3 uColor;
  uniform vec3 uColorEmissive;
  ${SIMPLEX_NOISE_GLSL}

  void main() {
    // 时间序列波形
    float wave1 = sin(vUv.x * 20.0 + uTime * 1.0) * 0.5 + 0.5;
    float wave2 = sin(vUv.x * 35.0 - uTime * 0.7) * 0.5 + 0.5;
    float wave = (wave1 + wave2) * 0.5;

    // 波动率带（GARCH 风格）
    float volatility = smoothstep(0.4, 0.8, fbm(vec3(vUv * 5.0, uTime * 0.1), 4));

    vec3 color = mix(uColor * 0.3, uColorEmissive, wave * 0.5);
    color += uColorEmissive * volatility * 0.6;

    // Fresnel
    float fresnel = 1.0 - max(dot(vViewDirection, vNormal), 0.0);
    fresnel = pow(fresnel, 2.0);
    color += uColorEmissive * fresnel * 0.5;

    float limb = pow(max(dot(vViewDirection, vNormal), 0.0), 0.6);
    color *= 0.6 + 0.4 * limb;

    gl_FragColor = vec4(color, 1.0);
  }
`;

// ============ 6. 多模型融合（烟台海洋）============
export const multiModelVertexShader = `
  ${COMMON_VARYINGS}
  uniform float uTime;
  ${SIMPLEX_NOISE_GLSL}

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    vUv = uv;
    float displacement = snoise(position * 1.1 + vec3(uTime * 0.25)) * 0.08;
    vec3 newPosition = position + normal * displacement;
    vec4 worldPos = modelMatrix * vec4(newPosition, 1.0);
    vWorldPosition = worldPos.xyz;
    vViewDirection = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

export const multiModelFragmentShader = `
  ${COMMON_VARYINGS}
  uniform float uTime;
  uniform vec3 uColor;
  uniform vec3 uColorEmissive;
  ${SIMPLEX_NOISE_GLSL}

  void main() {
    // 海洋波纹（多频叠加）
    float wave1 = sin(vUv.x * 8.0 + uTime * 0.8) * cos(vUv.y * 6.0 + uTime * 0.6);
    float wave2 = sin(vUv.x * 15.0 - uTime * 0.4) * sin(vUv.y * 12.0 + uTime * 0.5);
    float wave = (wave1 + wave2 * 0.5) * 0.5;

    // 多模型融合带（4 条彩色带）
    float band = step(0.25, fract(vUv.y * 4.0 + uTime * 0.05));
    vec3 bandColor = mix(uColor, uColorEmissive, band);

    vec3 color = bandColor * 0.5;
    color += uColorEmissive * (wave * 0.4 + 0.3);

    // Fresnel
    float fresnel = 1.0 - max(dot(vViewDirection, vNormal), 0.0);
    fresnel = pow(fresnel, 2.0);
    color += uColorEmissive * fresnel * 0.6;

    float limb = pow(max(dot(vViewDirection, vNormal), 0.0), 0.6);
    color *= 0.5 + 0.5 * limb;

    gl_FragColor = vec4(color, 1.0);
  }
`;

// ============ 7. 地图网格（河北生态）============
export const mapGridVertexShader = `
  ${COMMON_VARYINGS}
  uniform float uTime;
  ${SIMPLEX_NOISE_GLSL}

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    vUv = uv;
    float displacement = snoise(position * 1.6 + vec3(uTime * 0.15)) * 0.06;
    vec3 newPosition = position + normal * displacement;
    vec4 worldPos = modelMatrix * vec4(newPosition, 1.0);
    vWorldPosition = worldPos.xyz;
    vViewDirection = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

export const mapGridFragmentShader = `
  ${COMMON_VARYINGS}
  uniform float uTime;
  uniform vec3 uColor;
  uniform vec3 uColorEmissive;
  ${SIMPLEX_NOISE_GLSL}

  void main() {
    // 地形网格
    vec2 grid = floor(vUv * 10.0);
    float gridLine = step(0.92, max(fract(vUv.x * 10.0), fract(vUv.y * 10.0))) * 0.3;

    // 地形高度（噪声）
    float terrain = fbm(vec3(grid * 0.3, 0.0), 4);
    float height = smoothstep(-0.3, 0.5, terrain);

    // 生态色彩（绿色到蓝色）
    vec3 lowColor = uColor * 0.4;
    vec3 highColor = uColorEmissive;
    vec3 color = mix(lowColor, highColor, height);
    color += vec3(0.0, 0.3, 0.1) * gridLine;

    // 热点标记
    float hotspot = pow(smoothstep(0.7, 0.95, snoise(vec3(grid, uTime * 0.2))), 2.0);
    color += vec3(1.0, 0.6, 0.2) * hotspot * 0.8;

    // Fresnel
    float fresnel = 1.0 - max(dot(vViewDirection, vNormal), 0.0);
    fresnel = pow(fresnel, 2.0);
    color += uColorEmissive * fresnel * 0.5;

    float limb = pow(max(dot(vViewDirection, vNormal), 0.0), 0.6);
    color *= 0.6 + 0.4 * limb;

    gl_FragColor = vec4(color, 1.0);
  }
`;

// ============ 8. 色谱峰（HPLC 灰色）============
export const chromatogramVertexShader = `
  ${COMMON_VARYINGS}
  uniform float uTime;
  ${SIMPLEX_NOISE_GLSL}

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vPosition = position;
    vUv = uv;
    float displacement = snoise(position * 1.3 + vec3(uTime * 0.2)) * 0.06;
    vec3 newPosition = position + normal * displacement;
    vec4 worldPos = modelMatrix * vec4(newPosition, 1.0);
    vWorldPosition = worldPos.xyz;
    vViewDirection = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

export const chromatogramFragmentShader = `
  ${COMMON_VARYINGS}
  uniform float uTime;
  uniform vec3 uColor;
  uniform vec3 uColorEmissive;
  ${SIMPLEX_NOISE_GLSL}

  void main() {
    // 色谱峰（多个高斯峰）
    float peaks = 0.0;
    for (int i = 0; i < 5; i++) {
      float fi = float(i);
      float peakX = 0.1 + fi * 0.2;
      float peakWidth = 0.04 + snoise(vec3(fi, uTime * 0.3, 0.0)) * 0.01;
      float peak = exp(-pow((vUv.x - peakX) / peakWidth, 2.0));
      peaks += peak;
    }
    peaks = clamp(peaks, 0.0, 1.0);

    // 灰度关联条带
    float band = step(0.5, fract(vUv.y * 3.0));

    vec3 color = uColor * 0.3;
    color += uColorEmissive * peaks * 1.2;
    color += vec3(0.4) * band * 0.2;

    // Fresnel
    float fresnel = 1.0 - max(dot(vViewDirection, vNormal), 0.0);
    fresnel = pow(fresnel, 2.0);
    color += uColorEmissive * fresnel * 0.5;

    float limb = pow(max(dot(vViewDirection, vNormal), 0.0), 0.6);
    color *= 0.5 + 0.5 * limb;

    gl_FragColor = vec4(color, 1.0);
  }
`;

// ============ Shader 选择器 ============
export interface PlanetShaderSet {
  vertexShader: string;
  fragmentShader: string;
}

export function getPlanetShader(surfaceType: string): PlanetShaderSet {
  switch (surfaceType) {
    case 'word-galaxy':
      return { vertexShader: wordGalaxyVertexShader, fragmentShader: wordGalaxyFragmentShader };
    case 'yolo-tiles':
      return { vertexShader: yoloTilesVertexShader, fragmentShader: yoloTilesFragmentShader };
    case 'gomoku-grid':
      return { vertexShader: gomokuGridVertexShader, fragmentShader: gomokuGridFragmentShader };
    case 'video-frames':
      return { vertexShader: videoFramesVertexShader, fragmentShader: videoFramesFragmentShader };
    case 'time-series':
      return { vertexShader: timeSeriesVertexShader, fragmentShader: timeSeriesFragmentShader };
    case 'multi-model':
      return { vertexShader: multiModelVertexShader, fragmentShader: multiModelFragmentShader };
    case 'map-grid':
      return { vertexShader: mapGridVertexShader, fragmentShader: mapGridFragmentShader };
    case 'chromatogram':
      return { vertexShader: chromatogramVertexShader, fragmentShader: chromatogramFragmentShader };
    default:
      return { vertexShader: wordGalaxyVertexShader, fragmentShader: wordGalaxyFragmentShader };
  }
}
