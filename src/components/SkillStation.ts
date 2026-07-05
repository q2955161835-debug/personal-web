import * as THREE from 'three';

/**
 * 技能证书空间站
 * 程序化建模高科技风格空间站
 * - 中央环（核心舱）
 * - 6 个模块舱（技能矩阵）
 * - 4 块太阳能板
 * - 通信天线
 * - 整体缓慢自转
 */
export class SkillStation {
  public readonly group: THREE.Group;
  private readonly coreRing: THREE.Mesh;
  private readonly modules: THREE.Mesh[] = [];
  private readonly solarPanels: THREE.Mesh[] = [];
  private readonly antennas: THREE.Mesh[] = [];
  private readonly coreMaterial: THREE.MeshStandardMaterial;
  private readonly moduleMaterial: THREE.MeshStandardMaterial;
  private readonly panelMaterial: THREE.MeshStandardMaterial;
  private readonly antennaMaterial: THREE.MeshBasicMaterial;
  private readonly beaconMaterial: THREE.MeshBasicMaterial;
  private readonly beacons: THREE.Mesh[] = [];

  constructor(coreRadius = 2) {
    this.group = new THREE.Group();

    // 材质
    this.coreMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a5a7a,
      emissive: 0x1a2a4a,
      emissiveIntensity: 0.5,
      metalness: 0.8,
      roughness: 0.3,
    });
    this.moduleMaterial = new THREE.MeshStandardMaterial({
      color: 0x6a7a9a,
      emissive: 0x2a3a5a,
      emissiveIntensity: 0.4,
      metalness: 0.7,
      roughness: 0.4,
    });
    this.panelMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a2a5a,
      emissive: 0x0a1a3a,
      emissiveIntensity: 0.3,
      metalness: 0.6,
      roughness: 0.6,
    });
    this.antennaMaterial = new THREE.MeshBasicMaterial({
      color: 0xa0c0ff,
      transparent: true,
      opacity: 0.8,
    });
    this.beaconMaterial = new THREE.MeshBasicMaterial({
      color: 0xff6b9d,
    });

    // 1. 中央环（核心舱）
    const ringGeo = new THREE.TorusGeometry(coreRadius, 0.3, 16, 64);
    this.coreRing = new THREE.Mesh(ringGeo, this.coreMaterial);
    this.group.add(this.coreRing);

    // 中心球体（控制舱）
    const centerGeo = new THREE.IcosahedronGeometry(0.6, 8);
    const center = new THREE.Mesh(centerGeo, this.moduleMaterial);
    this.group.add(center);

    // 2. 6 个模块舱（技能矩阵：编程/数据/AI/产品/工具/语言）
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const moduleGeo = new THREE.BoxGeometry(0.8, 0.5, 0.5);
      const mod = new THREE.Mesh(moduleGeo, this.moduleMaterial);
      mod.position.set(
        Math.cos(angle) * coreRadius,
        0,
        Math.sin(angle) * coreRadius
      );
      mod.lookAt(0, 0, 0);
      this.group.add(mod);
      this.modules.push(mod);

      // 模块上的指示灯（beacon）
      const beaconGeo = new THREE.SphereGeometry(0.08, 8, 8);
      const beaconColors = [0xff6b9d, 0x6bff9d, 0x6bdaff, 0xffdc6b, 0x9d6bff, 0xff8a4a];
      const beaconMat = this.beaconMaterial.clone();
      beaconMat.color = new THREE.Color(beaconColors[i]);
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.copy(mod.position);
      beacon.position.y += 0.35;
      this.group.add(beacon);
      this.beacons.push(beacon);
    }

    // 3. 4 块太阳能板
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 8;
      const panelGeo = new THREE.BoxGeometry(2.5, 0.05, 1.0);
      const panel = new THREE.Mesh(panelGeo, this.panelMaterial);
      panel.position.set(
        Math.cos(angle) * (coreRadius + 1.8),
        0,
        Math.sin(angle) * (coreRadius + 1.8)
      );
      panel.lookAt(0, 0, 0);
      panel.rotateX(Math.PI / 2);
      this.group.add(panel);
      this.solarPanels.push(panel);

      // 太阳能板网格纹理（用线模拟）
      const gridLines = new THREE.Group();
      for (let j = 0; j < 5; j++) {
        const lineGeo = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-1.25 + j * 0.625, 0, -0.5),
          new THREE.Vector3(-1.25 + j * 0.625, 0, 0.5),
        ]);
        const line = new THREE.Line(lineGeo, new THREE.LineBasicMaterial({
          color: 0x4a6a9a,
          transparent: true,
          opacity: 0.6,
        }));
        gridLines.add(line);
      }
      gridLines.position.copy(panel.position);
      gridLines.rotation.copy(panel.rotation);
      this.group.add(gridLines);
    }

    // 4. 通信天线（3 根）
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const antennaGroup = new THREE.Group();

      // 天线杆
      const poleGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.2, 8);
      const pole = new THREE.Mesh(poleGeo, this.antennaMaterial);
      pole.position.y = 0.6;
      antennaGroup.add(pole);

      // 天线碟
      const dishGeo = new THREE.ConeGeometry(0.25, 0.2, 16, 1, true);
      const dish = new THREE.Mesh(dishGeo, this.antennaMaterial);
      dish.position.y = 1.2;
      dish.rotation.x = Math.PI;
      antennaGroup.add(dish);

      antennaGroup.position.set(
        Math.cos(angle) * coreRadius * 0.7,
        0.4,
        Math.sin(angle) * coreRadius * 0.7
      );
      this.group.add(antennaGroup);
      // 用第一根 mesh 作为引用（dispose 用）
      if (i === 0) this.antennas.push(pole, dish);
    }
  }

  update(elapsed: number, delta: number): void {
    // 整体缓慢自转
    this.group.rotation.y += delta * 0.1;
    this.group.rotation.z = Math.sin(elapsed * 0.3) * 0.05;

    // 模块舱指示灯闪烁
    for (let i = 0; i < this.beacons.length; i++) {
      const phase = i * 0.5;
      const blink = 0.5 + 0.5 * Math.sin(elapsed * 2.0 + phase);
      const mat = this.beacons[i].material as THREE.MeshBasicMaterial;
      mat.opacity = blink;
      mat.transparent = true;
    }
  }

  dispose(): void {
    this.coreRing.geometry.dispose();
    this.coreMaterial.dispose();
    for (const mod of this.modules) {
      mod.geometry.dispose();
    }
    this.moduleMaterial.dispose();
    for (const panel of this.solarPanels) {
      panel.geometry.dispose();
    }
    this.panelMaterial.dispose();
    for (const antenna of this.antennas) {
      antenna.geometry.dispose();
    }
    this.antennaMaterial.dispose();
    for (const beacon of this.beacons) {
      beacon.geometry.dispose();
      (beacon.material as THREE.Material).dispose();
    }
    this.beaconMaterial.dispose();
  }
}
