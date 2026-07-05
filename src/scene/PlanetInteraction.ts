import * as THREE from 'three';
import { ProjectPlanetData } from '../data/projects';

/**
 * 行星交互管理器
 * - Raycasting 检测行星悬停/点击
 * - 悬停时高亮（缩放 + 边缘辉光）
 * - 点击弹出玻璃面板详情模态框
 */
export class PlanetInteraction {
  private camera: THREE.PerspectiveCamera;
  private planetMeshes: { mesh: THREE.Mesh; data: ProjectPlanetData }[] = [];
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2(-2, -2);
  private hovered: { mesh: THREE.Mesh; data: ProjectPlanetData } | null = null;
  private onModalOpen: (data: ProjectPlanetData) => void;
  private enabled = true;

  constructor(
    camera: THREE.PerspectiveCamera,
    onModalOpen: (data: ProjectPlanetData) => void
  ) {
    this.camera = camera;
    this.onModalOpen = onModalOpen;

    this.onMouseMove = this.onMouseMove.bind(this);
    this.onClick = this.onClick.bind(this);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('click', this.onClick);
  }

  /** 注册行星 mesh 用于 raycasting */
  registerPlanet(mesh: THREE.Mesh, data: ProjectPlanetData): void {
    this.planetMeshes.push({ mesh, data });
  }

  setEnabled(v: boolean): void {
    this.enabled = v;
    if (!v) this.hovered = null;
  }

  private onMouseMove(e: MouseEvent): void {
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
  }

  private onClick(): void {
    if (!this.enabled || !this.hovered) return;
    this.onModalOpen(this.hovered.data);
  }

  /** 每帧调用，更新悬停状态 */
  update(): void {
    if (!this.enabled) {
      document.body.style.cursor = '';
      return;
    }

    this.raycaster.setFromCamera(this.mouse, this.camera);
    const meshes = this.planetMeshes.map(p => p.mesh);
    const intersects = this.raycaster.intersectObjects(meshes, false);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const entry = this.planetMeshes.find(p => p.mesh === hit);
      if (entry) {
        // 新悬停
        if (this.hovered?.mesh !== hit) {
          this.hovered = entry;
        }
        document.body.style.cursor = 'pointer';
        return;
      }
    }

    // 失去悬停
    this.hovered = null;
    document.body.style.cursor = '';
  }

  /** 获取当前悬停的行星数据（供 UI 显示 tooltip） */
  getHovered(): ProjectPlanetData | null {
    return this.hovered?.data ?? null;
  }

  dispose(): void {
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('click', this.onClick);
  }
}
