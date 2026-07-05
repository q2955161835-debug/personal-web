import * as THREE from 'three';
import { Renderer } from './Renderer';
import { Starfield } from '../components/Starfield';
import { HomeStar } from '../components/HomeStar';

/**
 * 场景管理器
 * 阶段1：相机 + 灯光 + 星空背景 + 渲染循环
 * 阶段2：入口恒星（增强版太阳）
 * 后续阶段会接入：行星、星环、空间站、滚动叙事、后处理
 */
export class SceneManager {
  public readonly scene: THREE.Scene;
  public readonly camera: THREE.PerspectiveCamera;
  private readonly renderer: Renderer;
  private readonly starfield: Starfield;
  private readonly homeStar: HomeStar;

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
    this.camera.position.set(0, 0, 38);

    this.renderer = new Renderer(canvas);

    // 灯光：环境光 + 太阳点光（暖橙）+ 补光（品红紫边缘色）
    const ambient = new THREE.AmbientLight(0x2a1a1a, 0.7);
    const sunLight = new THREE.PointLight(0xffb060, 3.0, 300, 1.4);
    sunLight.position.set(0, 0, -15);
    const fillLight = new THREE.DirectionalLight(0x9d6bff, 0.35);
    fillLight.position.set(2, 3, 5);
    this.scene.add(ambient, sunLight, fillLight);

    // 星空背景
    this.starfield = new Starfield();
    this.scene.add(this.starfield.group);

    // 入口恒星（首页中心太阳）
    this.homeStar = new HomeStar(8);
    this.homeStar.group.position.set(0, 0, -15);
    this.scene.add(this.homeStar.group);

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

    // 入口恒星更新
    this.homeStar.update(elapsed, delta);

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
    this.homeStar.dispose();
    this.renderer.dispose();
  }
}
