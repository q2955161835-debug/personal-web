import * as THREE from 'three';

/**
 * 数据分析项目领域分组（8 领域，90+ 项目）
 */
export interface DataAnalysisGroup {
  name: string;
  nameEn: string;
  color: number;
  count: number;
  /** 领域代表项目示例 */
  samples: string[];
}

export const DATA_ANALYSIS_GROUPS: DataAnalysisGroup[] = [
  { name: '计量经济', nameEn: 'Econometrics', color: 0x9d6bff, count: 14, samples: ['GARCH-MIDAS', '面板计量', 'VAR 脉冲'] },
  { name: '海洋气象', nameEn: 'Marine Climate', color: 0x4a9eff, count: 11, samples: ['烟台海洋', '气象预报', '海温预测'] },
  { name: '生态环境', nameEn: 'Ecology', color: 0x6bff9d, count: 12, samples: ['河北生态', '空气质量', '碳通量'] },
  { name: '化学材料', nameEn: 'Chemistry', color: 0xff6b9d, count: 10, samples: ['HPLC 灰色', '光谱分析', '材料优化'] },
  { name: '金融风险', nameEn: 'Finance', color: 0xffb060, count: 13, samples: ['波动率', 'VaR', '信用评分'] },
  { name: '社会调研', nameEn: 'Social Survey', color: 0x6bffdc, count: 11, samples: ['信效度', '中介调节', 'SEM/AMOS'] },
  { name: '制造运营', nameEn: 'Manufacturing', color: 0xffdc6b, count: 10, samples: ['南京先进制造', 'BP 神经网络', '工艺优化'] },
  { name: '生物医学', nameEn: 'Biomedical', color: 0xff8a4a, count: 11, samples: ['临床试验', '基因表达', '影像分割'] },
];

interface RingStar {
  group: number;
  angle: number;
  radius: number;
  height: number;
  size: number;
  phase: number;
  mesh: THREE.Mesh;
}

/**
 * 数据分析星环
 * - 中心恒星（数据分析工作流）
 * - 8 个领域分组，每组在独立半径的环上
 * - 90+ 小星体（按领域数量分布）
 * - 整体缓慢旋转
 */
export class DataAnalysisRing {
  public readonly group: THREE.Group;
  private readonly centerStar: THREE.Mesh;
  private readonly centerStarMaterial: THREE.ShaderMaterial;
  private readonly ringGroups: THREE.Group[] = [];
  private readonly stars: RingStar[] = [];
  private readonly ringMaterial: THREE.LineBasicMaterial;
  private readonly rings: THREE.Line[] = [];

  constructor(centerRadius = 0.8) {
    this.group = new THREE.Group();

    // 中心恒星（数据分析工作流核心）
    const centerGeo = new THREE.IcosahedronGeometry(centerRadius, 16);
    this.centerStarMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
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
          float d = snoise(position * 2.0 + vec3(uTime * 0.3)) * 0.1;
          vec3 newPos = position + normal * d;
          vec4 worldPos = modelMatrix * vec4(newPos, 1.0);
          vViewDirection = normalize(cameraPosition - worldPos.xyz);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        varying vec3 vViewDirection;
        varying vec3 vPosition;
        uniform float uTime;
        uniform vec3 uColorA;
        uniform vec3 uColorB;

        void main() {
          float fresnel = 1.0 - max(dot(vViewDirection, vNormal), 0.0);
          fresnel = pow(fresnel, 2.0);
          // 工作流脉动
          float pulse = 0.7 + 0.3 * sin(uTime * 1.5);
          vec3 color = mix(uColorA, uColorB, fresnel) * pulse;
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
        uColorA: { value: new THREE.Color(0x4a9eff) },
        uColorB: { value: new THREE.Color(0x9d6bff) },
      },
    });
    this.centerStar = new THREE.Mesh(centerGeo, this.centerStarMaterial);
    this.group.add(this.centerStar);

    // 8 个领域分组星环
    this.ringMaterial = new THREE.LineBasicMaterial({
      color: 0x4a9eff,
      transparent: true,
      opacity: 0.15,
    });

    DATA_ANALYSIS_GROUPS.forEach((data, groupIdx) => {
      const ringGroup = new THREE.Group();
      const ringRadius = 1.8 + groupIdx * 0.6; // 每组半径递增
      const ringHeightVariation = 0.15;

      // 环线（可视化星环轨道）
      const ringPoints: THREE.Vector3[] = [];
      const segments = 64;
      for (let i = 0; i <= segments; i++) {
        const a = (i / segments) * Math.PI * 2;
        ringPoints.push(new THREE.Vector3(Math.cos(a) * ringRadius, 0, Math.sin(a) * ringRadius));
      }
      const ringGeo = new THREE.BufferGeometry().setFromPoints(ringPoints);
      const ring = new THREE.Line(ringGeo, this.ringMaterial.clone());
      (ring.material as THREE.Material).transparent = true;
      (ring.material as THREE.LineBasicMaterial).color = new THREE.Color(data.color);
      (ring.material as THREE.LineBasicMaterial).opacity = 0.2;
      ringGroup.add(ring);
      this.rings.push(ring);

      // 每组的小星体（按 count 分布）
      for (let i = 0; i < data.count; i++) {
        const angle = (i / data.count) * Math.PI * 2 + Math.random() * 0.1;
        const height = (Math.random() - 0.5) * ringHeightVariation;
        const size = 0.04 + Math.random() * 0.06;

        const starGeo = new THREE.IcosahedronGeometry(size, 4);
        const starMat = new THREE.MeshBasicMaterial({
          color: data.color,
          transparent: true,
          opacity: 0.9,
        });
        const mesh = new THREE.Mesh(starGeo, starMat);
        mesh.position.set(
          Math.cos(angle) * ringRadius,
          height,
          Math.sin(angle) * ringRadius
        );
        ringGroup.add(mesh);

        this.stars.push({
          group: groupIdx,
          angle,
          radius: ringRadius,
          height,
          size,
          phase: Math.random() * Math.PI * 2,
          mesh,
        });
      }

      // 每组缓慢自转速度不同
      ringGroup.rotation.y = groupIdx * 0.1;
      this.group.add(ringGroup);
      this.ringGroups.push(ringGroup);
    });
  }

  update(elapsed: number, delta: number): void {
    // 中心恒星
    this.centerStarMaterial.uniforms.uTime.value = elapsed;
    this.centerStar.rotation.y += delta * 0.3;

    // 每组星环自转（不同速度，正反交替）
    for (let i = 0; i < this.ringGroups.length; i++) {
      const speed = (i % 2 === 0 ? 1 : -1) * (0.05 + i * 0.01);
      this.ringGroups[i].rotation.y += delta * speed;
    }

    // 小星体闪烁
    for (const star of this.stars) {
      const twinkle = 0.6 + 0.4 * Math.sin(elapsed * 2.0 + star.phase);
      (star.mesh.material as THREE.MeshBasicMaterial).opacity = twinkle;
    }
  }

  dispose(): void {
    this.centerStar.geometry.dispose();
    this.centerStarMaterial.dispose();
    for (const ring of this.rings) {
      ring.geometry.dispose();
      (ring.material as THREE.Material).dispose();
    }
    for (const star of this.stars) {
      star.mesh.geometry.dispose();
      (star.mesh.material as THREE.Material).dispose();
    }
  }
}
