import * as THREE from 'three';
import { sunVertexShader, sunFragmentShader, coronaVertexShader, coronaFragmentShader } from '../shaders/sun';

/**
 * 入口恒星 - 首页中心太阳
 * - 内核：自定义 ShaderMaterial（Simplex Noise 湍流 + 黑子 + Fresnel 辉光）
 * - 日冕：外层半透明球体（Fresnel 边缘发光）
 * - 整体缓慢自转
 */
export class HomeStar {
  public readonly group: THREE.Group;
  private readonly core: THREE.Mesh;
  private readonly corona: THREE.Mesh;
  private readonly coreMaterial: THREE.ShaderMaterial;
  private readonly coronaMaterial: THREE.ShaderMaterial;

  constructor(radius = 8) {
    this.group = new THREE.Group();

    // 内核：湍流表面
    const coreGeometry = new THREE.IcosahedronGeometry(radius, 64);
    this.coreMaterial = new THREE.ShaderMaterial({
      vertexShader: sunVertexShader,
      fragmentShader: sunFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColorCore: { value: new THREE.Color(0xfff4cc) }, // 亮黄白
        uColorMid: { value: new THREE.Color(0xff9d4a) }, // 橙
        uColorEdge: { value: new THREE.Color(0xff4a2a) }, // 红橙
      },
    });
    this.core = new THREE.Mesh(coreGeometry, this.coreMaterial);
    this.group.add(this.core);

    // 日冕：外层半透明
    const coronaGeometry = new THREE.IcosahedronGeometry(radius * 1.35, 32);
    this.coronaMaterial = new THREE.ShaderMaterial({
      vertexShader: coronaVertexShader,
      fragmentShader: coronaFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0xffaa55) },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
    });
    this.corona = new THREE.Mesh(coronaGeometry, this.coronaMaterial);
    this.group.add(this.corona);

    // 远场辉光（更大的半透明球）
    const glowGeometry = new THREE.IcosahedronGeometry(radius * 1.8, 24);
    const glowMaterial = new THREE.ShaderMaterial({
      vertexShader: coronaVertexShader,
      fragmentShader: coronaFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(0xff6633) },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    this.group.add(glow);
    // glow 不需要单独更新 uniform，共用 corona 的 uTime
    (glow as THREE.Mesh & { __glowMaterial?: THREE.ShaderMaterial }).__glowMaterial = glowMaterial;
    this.group.userData.glowMaterial = glowMaterial;
  }

  update(elapsed: number, delta: number): void {
    this.coreMaterial.uniforms.uTime.value = elapsed;
    this.coronaMaterial.uniforms.uTime.value = elapsed;
    (this.group.userData.glowMaterial as THREE.ShaderMaterial).uniforms.uTime.value = elapsed;

    // 缓慢自转
    this.core.rotation.y += delta * 0.08;
    this.core.rotation.x += delta * 0.02;
  }

  dispose(): void {
    this.core.geometry.dispose();
    this.coreMaterial.dispose();
    this.corona.geometry.dispose();
    this.coronaMaterial.dispose();
    (this.group.userData.glowMaterial as THREE.ShaderMaterial)?.dispose();
  }
}
