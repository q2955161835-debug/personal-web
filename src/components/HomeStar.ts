import * as THREE from 'three';
import { sunVertexShader, sunFragmentShader, coronaVertexShader, coronaFragmentShader, refractionVertexShader, refractionFragmentShader } from '../shaders/sun';

/**
 * 入口恒星 - 增强版太阳
 * 结构（由内到外）：
 *   1. 光球层内核：高多面体 IcosahedronGeometry(96) + 自定义 ShaderMaterial
 *      - 多尺度湍流（颗粒 + 超颗粒 + 大尺度）
 *      - 黑子本影/半影 + 光斑 + 临边昏暗 + 日珥位移 + 溅射喷发
 *      - Fresnel 多层辉光
 *   2. 内日冕：1.25x 半径，BackSide + 流光条纹 + Fresnel
 *   3. 外日冕：1.55x 半径，更柔和
 *   4. 远场辉光：1.95x 半径，强辉光
 *   5. 空间折射层：2.3x 半径，色散 Fresnel，模拟引力透镜
 */
export class HomeStar {
  public readonly group: THREE.Group;
  private readonly core: THREE.Mesh;
  private readonly innerCorona: THREE.Mesh;
  private readonly outerCorona: THREE.Mesh;
  private readonly farGlow: THREE.Mesh;
  private readonly refractionLayer: THREE.Mesh;
  private readonly coreMaterial: THREE.ShaderMaterial;
  private readonly innerCoronaMaterial: THREE.ShaderMaterial;
  private readonly outerCoronaMaterial: THREE.ShaderMaterial;
  private readonly farGlowMaterial: THREE.ShaderMaterial;
  private readonly refractionMaterial: THREE.ShaderMaterial;

  constructor(radius = 8) {
    this.group = new THREE.Group();

    // 1. 光球层内核（高多面体，细节 96）
    const coreGeometry = new THREE.IcosahedronGeometry(radius, 96);
    this.coreMaterial = new THREE.ShaderMaterial({
      vertexShader: sunVertexShader,
      fragmentShader: sunFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColorCore: { value: new THREE.Color(0xfff8d6) }, // 亮黄白
        uColorMid: { value: new THREE.Color(0xff9a3c) },  // 橙
        uColorEdge: { value: new THREE.Color(0xff4a1a) }, // 红橙
        uColorSpot: { value: new THREE.Color(0x2a0a04) }, // 黑子本影深红棕
      },
    });
    this.core = new THREE.Mesh(coreGeometry, this.coreMaterial);
    this.group.add(this.core);

    // 2. 内日冕（1.25x）
    const innerCoronaGeo = new THREE.IcosahedronGeometry(radius * 1.25, 32);
    this.innerCoronaMaterial = new THREE.ShaderMaterial({
      vertexShader: coronaVertexShader,
      fragmentShader: coronaFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0xffb060) },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
    });
    this.innerCorona = new THREE.Mesh(innerCoronaGeo, this.innerCoronaMaterial);
    this.group.add(this.innerCorona);

    // 3. 外日冕（1.55x）
    const outerCoronaGeo = new THREE.IcosahedronGeometry(radius * 1.55, 24);
    this.outerCoronaMaterial = new THREE.ShaderMaterial({
      vertexShader: coronaVertexShader,
      fragmentShader: coronaFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0xff7030) },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
    });
    this.outerCorona = new THREE.Mesh(outerCoronaGeo, this.outerCoronaMaterial);
    this.group.add(this.outerCorona);

    // 4. 远场辉光（1.95x，强辉光）
    const farGlowGeo = new THREE.IcosahedronGeometry(radius * 1.95, 16);
    this.farGlowMaterial = new THREE.ShaderMaterial({
      vertexShader: coronaVertexShader,
      fragmentShader: coronaFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0xff4818) },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
    });
    this.farGlow = new THREE.Mesh(farGlowGeo, this.farGlowMaterial);
    this.group.add(this.farGlow);

    // 5. 空间折射层（2.3x，色散引力透镜）
    const refractionGeo = new THREE.IcosahedronGeometry(radius * 2.3, 20);
    this.refractionMaterial = new THREE.ShaderMaterial({
      vertexShader: refractionVertexShader,
      fragmentShader: refractionFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColorA: { value: new THREE.Color(0xff6a3a) }, // 暖红橙
        uColorB: { value: new THREE.Color(0x4af0ff) }, // 冷青
        uColorC: { value: new THREE.Color(0x9d6bff) }, // 紫
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
    });
    this.refractionLayer = new THREE.Mesh(refractionGeo, this.refractionMaterial);
    this.group.add(this.refractionLayer);
  }

  update(elapsed: number, delta: number): void {
    // 更新所有 shader 的 uTime
    this.coreMaterial.uniforms.uTime.value = elapsed;
    this.innerCoronaMaterial.uniforms.uTime.value = elapsed;
    this.outerCoronaMaterial.uniforms.uTime.value = elapsed;
    this.farGlowMaterial.uniforms.uTime.value = elapsed;
    this.refractionMaterial.uniforms.uTime.value = elapsed;

    // 光球层缓慢自转（不同轴轻微倾斜，更生动）
    this.core.rotation.y += delta * 0.06;
    this.core.rotation.x += delta * 0.015;

    // 日冕反向极慢旋转
    this.innerCorona.rotation.y -= delta * 0.02;
    this.outerCorona.rotation.z += delta * 0.015;

    // 折射层反向旋转
    this.refractionLayer.rotation.y -= delta * 0.01;
    this.refractionLayer.rotation.x += delta * 0.008;
  }

  dispose(): void {
    this.core.geometry.dispose();
    this.coreMaterial.dispose();
    this.innerCorona.geometry.dispose();
    this.innerCoronaMaterial.dispose();
    this.outerCorona.geometry.dispose();
    this.outerCoronaMaterial.dispose();
    this.farGlow.geometry.dispose();
    this.farGlowMaterial.dispose();
    this.refractionLayer.geometry.dispose();
    this.refractionMaterial.dispose();
  }
}
