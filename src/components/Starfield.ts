import * as THREE from 'three';

/**
 * 星空背景 - 多层 Points 实现
 * - 远景：5000 颗细小白色星点
 * - 中景：1500 颗带颜色（蓝/紫/粉）的稍大星点
 * - 近景：300 颗明亮闪烁星
 * 整体缓慢自转，营造深空感
 */
export class Starfield {
  public readonly group: THREE.Group;
  private readonly farStars: THREE.Points;
  private readonly midStars: THREE.Points;
  private readonly brightStars: THREE.Points;
  private readonly brightMaterial: THREE.PointsMaterial;

  constructor() {
    this.group = new THREE.Group();

    this.farStars = this.createLayer(5000, 800, 1200, 0.6, 0xffffff, 0.8);
    this.midStars = this.createLayer(1500, 400, 700, 1.2, null, 0.9);
    this.brightStars = this.createLayer(300, 200, 500, 2.0, 0xffffff, 1.0);

    // 明亮星用自定义材质支持闪烁
    this.brightMaterial = this.brightStars.material as THREE.PointsMaterial;

    this.group.add(this.farStars, this.midStars, this.brightStars);
  }

  private createLayer(
    count: number,
    minRadius: number,
    maxRadius: number,
    size: number,
    color: THREE.ColorRepresentation | null,
    opacity: number
  ): THREE.Points {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const palette = [
      new THREE.Color(0xffffff),
      new THREE.Color(0xaaccff),
      new THREE.Color(0xffccaa),
      new THREE.Color(0xc4a6ff),
      new THREE.Color(0xffaad4),
    ];

    for (let i = 0; i < count; i++) {
      const r = minRadius + Math.random() * (maxRadius - minRadius);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const c = color !== null ? new THREE.Color(color) : palette[Math.floor(Math.random() * palette.length)];
      const brightness = 0.6 + Math.random() * 0.4;
      colors[i * 3] = c.r * brightness;
      colors[i * 3 + 1] = c.g * brightness;
      colors[i * 3 + 2] = c.b * brightness;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size,
      sizeAttenuation: true,
      transparent: true,
      opacity,
      vertexColors: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return new THREE.Points(geometry, material);
  }

  update(elapsed: number, delta: number): void {
    // 整体缓慢自转
    this.group.rotation.y += delta * 0.005;
    this.group.rotation.x += delta * 0.001;

    // 明亮星闪烁
    const twinkle = 0.7 + 0.3 * Math.sin(elapsed * 2.0);
    this.brightMaterial.opacity = twinkle;
  }

  dispose(): void {
    [this.farStars, this.midStars, this.brightStars].forEach((p) => {
      p.geometry.dispose();
      (p.material as THREE.Material).dispose();
    });
  }
}
