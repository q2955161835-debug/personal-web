import * as THREE from 'three';

/**
 * 倒V Logo - 中间隔断的倒置 V 形
 * 形如 "Λ" 但两臂顶端不相连，留有间隙
 *
 * 实现：两条 ExtrudeGeometry 楔形臂 + 发光金属材质
 * - 左臂：从左下到中上偏左
 * - 右臂：从右下到中上偏右
 * - 顶端间隙：0.8 单位
 */
export class InvertedVLogo {
  public readonly group: THREE.Group;
  private readonly leftMaterial: THREE.MeshStandardMaterial;
  private readonly rightMaterial: THREE.MeshStandardMaterial;
  private readonly edgeMaterial: THREE.LineBasicMaterial;

  constructor(scale = 1) {
    this.group = new THREE.Group();

    // 创建单臂 Shape
    const createArmShape = (dir: 1 | -1): THREE.Shape => {
      const shape = new THREE.Shape();
      // 底部外、底部内、顶部内、顶部外（顺时针）
      shape.moveTo(dir * 3.0, -3.0); // 底外
      shape.lineTo(dir * 2.45, -3.0); // 底内
      shape.lineTo(dir * 0.4, 2.0); // 顶内（间隙 0.8）
      shape.lineTo(dir * 0.95, 2.0); // 顶外
      shape.closePath();
      return shape;
    };

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth: 0.5,
      bevelEnabled: true,
      bevelThickness: 0.12,
      bevelSize: 0.12,
      bevelSegments: 4,
      curveSegments: 8,
    };

    const leftGeometry = new THREE.ExtrudeGeometry(createArmShape(-1), extrudeSettings);
    leftGeometry.center();
    const rightGeometry = new THREE.ExtrudeGeometry(createArmShape(1), extrudeSettings);
    rightGeometry.center();

    // 发光金属材质
    this.leftMaterial = new THREE.MeshStandardMaterial({
      color: 0x9d6bff,
      emissive: 0x4a2a8a,
      emissiveIntensity: 0.6,
      metalness: 0.85,
      roughness: 0.18,
    });
    this.rightMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a9eff,
      emissive: 0x1a4a8a,
      emissiveIntensity: 0.6,
      metalness: 0.85,
      roughness: 0.18,
    });

    const leftArm = new THREE.Mesh(leftGeometry, this.leftMaterial);
    const rightArm = new THREE.Mesh(rightGeometry, this.rightMaterial);
    this.group.add(leftArm, rightArm);

    // 边缘描边（发光线条）
    const createEdge = (dir: 1 | -1): THREE.BufferGeometry => {
      const points = [
        new THREE.Vector3(dir * 3.0, -3.0, 0.26),
        new THREE.Vector3(dir * 0.95, 2.0, 0.26),
      ];
      return new THREE.BufferGeometry().setFromPoints(points);
    };
    this.edgeMaterial = new THREE.LineBasicMaterial({
      color: 0xd4c2ff,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const leftEdge = new THREE.Line(createEdge(-1), this.edgeMaterial);
    const rightEdge = new THREE.Line(createEdge(1), this.edgeMaterial);
    this.group.add(leftEdge, rightEdge);

    // 整体缩放
    this.group.scale.setScalar(scale);

    // 初始旋转：面向相机
    this.group.rotation.y = 0;
  }

  update(elapsed: number, _delta: number): void {
    // 轻微悬浮旋转
    this.group.rotation.y = Math.sin(elapsed * 0.4) * 0.15;
    this.group.position.y = Math.sin(elapsed * 0.8) * 0.15;

    // 发光强度脉动
    const pulse = 0.5 + 0.25 * Math.sin(elapsed * 1.8);
    this.leftMaterial.emissiveIntensity = pulse + 0.3;
    this.rightMaterial.emissiveIntensity = pulse + 0.3;
  }

  dispose(): void {
    this.group.children.forEach((c) => {
      if (c instanceof THREE.Mesh) c.geometry.dispose();
      if (c instanceof THREE.Line) c.geometry.dispose();
    });
    this.leftMaterial.dispose();
    this.rightMaterial.dispose();
    this.edgeMaterial.dispose();
  }
}
