import * as THREE from 'three';

/**
 * 转场动效组件
 * - 陨石带：InstancedMesh 实现高性能不规则岩石
 * - 星云：体积粒子云，柔和发光
 * - 彗星：拖尾彗星沿曲线路径飞行
 * - 星团：Points 闪烁星团
 */
export class TransitionEffects {
  public readonly group: THREE.Group;
  private readonly asteroidBelt: THREE.InstancedMesh;
  private readonly nebula: THREE.Points;
  private readonly nebulaMaterial: THREE.ShaderMaterial;
  private readonly comets: Comet[] = [];
  private readonly starCluster: THREE.Points;
  private readonly starClusterMaterial: THREE.ShaderMaterial;
  private readonly dummy: THREE.Object3D;

  constructor() {
    this.group = new THREE.Group();
    this.dummy = new THREE.Object3D();

    // 1. 陨石带（InstancedMesh，300 个不规则岩石）
    this.asteroidBelt = this.createAsteroidBelt(300);
    this.group.add(this.asteroidBelt);

    // 2. 星云（体积粒子云）
    const nebulaResult = this.createNebula();
    this.nebula = nebulaResult.points;
    this.nebulaMaterial = nebulaResult.material;
    this.group.add(this.nebula);

    // 3. 彗星（3 颗，沿不同曲线飞行）
    for (let i = 0; i < 3; i++) {
      const comet = this.createComet(i);
      this.comets.push(comet);
      this.group.add(comet.group);
    }

    // 4. 星团（Points 闪烁）
    const clusterResult = this.createStarCluster();
    this.starCluster = clusterResult.points;
    this.starClusterMaterial = clusterResult.material;
    this.group.add(this.starCluster);
  }

  /** 陨石带：InstancedMesh 不规则岩石 */
  private createAsteroidBelt(count: number): THREE.InstancedMesh {
    const geometry = new THREE.DodecahedronGeometry(0.15, 0);
    const material = new THREE.MeshStandardMaterial({
      color: 0x4a3a2a,
      roughness: 0.9,
      metalness: 0.2,
      flatShading: true,
    });
    const mesh = new THREE.InstancedMesh(geometry, material, count);

    // 分布在环形区域
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 8 + Math.random() * 4;
      const height = (Math.random() - 0.5) * 1.5;
      const scale = 0.5 + Math.random() * 1.5;

      this.dummy.position.set(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      );
      this.dummy.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      this.dummy.scale.setScalar(scale);
      this.dummy.updateMatrix();
      mesh.setMatrixAt(i, this.dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;

    return mesh;
  }

  /** 星云：体积粒子云 */
  private createNebula(): { points: THREE.Points; material: THREE.ShaderMaterial } {
    const count = 800;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // 球形分布 + 噪声扰动
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 3 + Math.random() * 4;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // 紫-蓝-粉色调
      const colorChoice = Math.random();
      if (colorChoice < 0.4) {
        colors[i * 3] = 0.6; colors[i * 3 + 1] = 0.3; colors[i * 3 + 2] = 1.0; // 紫
      } else if (colorChoice < 0.7) {
        colors[i * 3] = 0.2; colors[i * 3 + 1] = 0.5; colors[i * 3 + 2] = 1.0; // 蓝
      } else {
        colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.4; colors[i * 3 + 2] = 0.8; // 粉
      }

      sizes[i] = 0.5 + Math.random() * 1.5;
      phases[i] = Math.random() * Math.PI * 2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

    const material = new THREE.ShaderMaterial({
      vertexShader: `
        attribute vec3 aColor;
        attribute float aSize;
        attribute float aPhase;
        varying vec3 vColor;
        varying float vAlpha;
        uniform float uTime;
        void main() {
          vColor = aColor;
          vAlpha = 0.5 + 0.5 * sin(uTime * 0.5 + aPhase);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float alpha = (1.0 - d * 2.0) * vAlpha * 0.4;
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    return { points, material };
  }

  /** 星团：Points 闪烁 */
  private createStarCluster(): { points: THREE.Points; material: THREE.ShaderMaterial } {
    const count = 200;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // 紧密球形分布
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 1 + Math.random() * 2;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta) + 10;
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) + 5;
      positions[i * 3 + 2] = r * Math.cos(phi) - 30;

      sizes[i] = 1 + Math.random() * 2;
      phases[i] = Math.random() * Math.PI * 2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

    const material = new THREE.ShaderMaterial({
      vertexShader: `
        attribute float aSize;
        attribute float aPhase;
        varying float vAlpha;
        uniform float uTime;
        void main() {
          vAlpha = 0.6 + 0.4 * sin(uTime * 2.0 + aPhase);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * (200.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float alpha = (1.0 - d * 2.0) * vAlpha;
          vec3 color = vec3(1.0, 0.95, 0.9);
          gl_FragColor = vec4(color, alpha);
        }
      `,
      uniforms: {
        uTime: { value: 0 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const points = new THREE.Points(geometry, material);
    return { points, material };
  }

  /** 彗星：拖尾彗星沿曲线路径飞行 */
  private createComet(index: number): Comet {
    const group = new THREE.Group();

    // 彗星头部
    const headGeo = new THREE.IcosahedronGeometry(0.15, 8);
    const headMat = new THREE.MeshBasicMaterial({
      color: index === 0 ? 0xa0d0ff : index === 1 ? 0xffd0a0 : 0xe0a0ff,
      transparent: true,
      opacity: 0.9,
    });
    const head = new THREE.Mesh(headGeo, headMat);
    group.add(head);

    // 拖尾（Points，沿路径分布）
    const trailCount = 50;
    const trailPositions = new Float32Array(trailCount * 3);
    const trailSizes = new Float32Array(trailCount);
    for (let i = 0; i < trailCount; i++) {
      trailSizes[i] = (1 - i / trailCount) * 0.5;
    }
    const trailGeo = new THREE.BufferGeometry();
    trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
    trailGeo.setAttribute('aSize', new THREE.BufferAttribute(trailSizes, 1));

    const trailMat = new THREE.ShaderMaterial({
      vertexShader: `
        attribute float aSize;
        varying float vAlpha;
        void main() {
          vAlpha = aSize * 2.0;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * (200.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        uniform vec3 uColor;
        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float alpha = (1.0 - d * 2.0) * vAlpha;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
      uniforms: {
        uColor: { value: new THREE.Color(index === 0 ? 0xa0d0ff : index === 1 ? 0xffd0a0 : 0xe0a0ff) },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const trail = new THREE.Points(trailGeo, trailMat);
    group.add(trail);

    // 曲线路径
    const pathPoints: THREE.Vector3[] = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      const angle = t * Math.PI * 2 + index * (Math.PI * 2 / 3);
      const r = 12 + Math.sin(t * Math.PI * 4 + index) * 3;
      pathPoints.push(new THREE.Vector3(
        Math.cos(angle) * r,
        Math.sin(t * Math.PI * 3 + index) * 4,
        Math.sin(angle) * r - 30
      ));
    }
    const curve = new THREE.CatmullRomCurve3(pathPoints, true);

    return {
      group,
      head,
      headMaterial: headMat,
      trail,
      trailMaterial: trailMat,
      trailPositions,
      curve,
      progress: Math.random(),
      speed: 0.02 + Math.random() * 0.02,
    };
  }

  update(elapsed: number, delta: number): void {
    // 陨石带自转
    this.asteroidBelt.rotation.y += delta * 0.05;

    // 星云缓慢自转 + 时间更新
    this.nebula.rotation.y += delta * 0.02;
    this.nebulaMaterial.uniforms.uTime.value = elapsed;

    // 星团时间更新
    this.starClusterMaterial.uniforms.uTime.value = elapsed;

    // 彗星沿曲线飞行
    for (const comet of this.comets) {
      comet.progress += delta * comet.speed;
      if (comet.progress > 1) comet.progress -= 1;

      const pos = comet.curve.getPointAt(comet.progress);
      comet.head.position.copy(pos);

      // 更新拖尾（沿曲线回溯）
      const positions = comet.trailPositions;
      for (let i = 0; i < positions.length / 3; i++) {
        const t = (comet.progress - i * 0.003 + 1) % 1;
        const trailPos = comet.curve.getPointAt(t);
        positions[i * 3] = trailPos.x;
        positions[i * 3 + 1] = trailPos.y;
        positions[i * 3 + 2] = trailPos.z;
      }
      comet.trail.geometry.getAttribute('position').needsUpdate = true;
    }
  }

  dispose(): void {
    this.asteroidBelt.geometry.dispose();
    (this.asteroidBelt.material as THREE.Material).dispose();
    this.nebula.geometry.dispose();
    this.nebulaMaterial.dispose();
    this.starCluster.geometry.dispose();
    this.starClusterMaterial.dispose();
    for (const comet of this.comets) {
      comet.head.geometry.dispose();
      comet.headMaterial.dispose();
      comet.trail.geometry.dispose();
      comet.trailMaterial.dispose();
    }
  }
}

interface Comet {
  group: THREE.Group;
  head: THREE.Mesh;
  headMaterial: THREE.MeshBasicMaterial;
  trail: THREE.Points;
  trailMaterial: THREE.ShaderMaterial;
  trailPositions: Float32Array;
  curve: THREE.CatmullRomCurve3;
  progress: number;
  speed: number;
}
