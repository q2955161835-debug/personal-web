import * as THREE from 'three';
import { Renderer } from './Renderer';
import { Starfield } from '../components/Starfield';

/**
 * 场景管理器 - 阶段 1 基础骨架
 * 当前：相机 + 灯光 + 星空背景 + 渲染循环
 * 后续阶段会接入：恒星、行星、星环、空间站、滚动叙事、后处理
 */
export class SceneManager {
  public readonly scene: THREE.Scene;
  public readonly camera: THREE.PerspectiveCamera;
  private readonly renderer: Renderer;
  private readonly starfield: Starfield;

  private clock = new THREE.Clock();
  private rafId = 0;
  private running = false;

  // 滚动进度（0-1），后续阶段由 GSAP ScrollTrigger 驱动
  private scrollProgress = 0;

  // 鼠标位置（NDC），用于流星和视差
  private mouseX = 0;
  private mouseY = 0;
  private targetCameraX = 0;
  private targetCameraY = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x03030a, 0.0008);

    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 5000);
    this.camera.position.set(0, 0, 100);

    this.renderer = new Renderer(canvas);

    // 灯光：环境光 + 远处点光模拟恒星
    const ambient = new THREE.AmbientLight(0x1a1a3a, 0.6);
    const pointLight = new THREE.PointLight(0xffd966, 2.0, 1000, 1.5);
    pointLight.position.set(0, 0, 0);
    this.scene.add(ambient, pointLight);

    // 星空背景
    this.starfield = new Starfield();
    this.scene.add(this.starfield.group);

    // 事件绑定
    this.onResize = this.onResize.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.animate = this.animate.bind(this);

    window.addEventListener('resize', this.onResize);
    window.addEventListener('mousemove', this.onMouseMove);
  }

  private onResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.resize();
  }

  private onMouseMove(e: MouseEvent): void {
    this.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouseY = -((e.clientY / window.innerHeight) * 2 - 1);
  }

  setScrollProgress(p: number): void {
    this.scrollProgress = THREE.MathUtils.clamp(p, 0, 1);
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.clock.start();
    this.animate();
  }

  stop(): void {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }

  private animate(): void {
    if (!this.running) return;
    this.rafId = requestAnimationFrame(this.animate);

    const delta = this.clock.getDelta();
    const elapsed = this.clock.getElapsedTime();

    // 星空更新
    this.starfield.update(elapsed, delta);

    // 相机视差（鼠标驱动，轻微）
    this.targetCameraX += (this.mouseX * 8 - this.targetCameraX) * 0.05;
    this.targetCameraY += (this.mouseY * 6 - this.targetCameraY) * 0.05;
    this.camera.position.x = this.targetCameraX;
    this.camera.position.y = this.targetCameraY;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    this.stop();
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('mousemove', this.onMouseMove);
    this.starfield.dispose();
    this.renderer.dispose();
  }
}
