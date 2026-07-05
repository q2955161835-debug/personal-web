import * as THREE from 'three';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * 滚动叙事控制器
 * - Lenis 平滑滚动
 * - GSAP ScrollTrigger 驱动
 * - 相机沿贝塞尔曲线路径移动
 * - 暴露 scrollProgress 回调供 SceneManager 使用
 */
export class ScrollController {
  private lenis: Lenis;
  private cameraPath: THREE.CatmullRomCurve3;
  private camera: THREE.PerspectiveCamera;
  private scrollProgress = 0;
  private onProgress: (p: number) => void;
  private lookAtTarget = new THREE.Vector3(0, 0, 0);

  /** 路径关键点：首页太阳 → 8 个行星 → 空间站 */
  private static readonly PATH_POINTS: THREE.Vector3[] = [
    // 首页太阳（z=-15）
    new THREE.Vector3(0, 0, 38),
    // 过渡到第一颗行星
    new THREE.Vector3(0, 5, 20),
    // Lang Drill（左前）
    new THREE.Vector3(-18, 2, 0),
    // 异环麻将（右前）
    new THREE.Vector3(18, -3, -10),
    // AI 五子棋（左中）
    new THREE.Vector3(-22, 4, -25),
    // codex 视频（右中）
    new THREE.Vector3(20, -2, -40),
    // GARCH-MIDAS（左后）
    new THREE.Vector3(-18, 5, -55),
    // 烟台海洋（右后）
    new THREE.Vector3(22, -4, -70),
    // 河北生态（左远）
    new THREE.Vector3(-20, 3, -85),
    // HPLC 灰色（右远）
    new THREE.Vector3(18, -3, -100),
    // 空间站（终点）
    new THREE.Vector3(0, 0, -120),
  ];

  constructor(camera: THREE.PerspectiveCamera, onProgress: (p: number) => void) {
    this.camera = camera;
    this.onProgress = onProgress;

    // 创建相机路径曲线
    this.cameraPath = new THREE.CatmullRomCurve3(
      ScrollController.PATH_POINTS,
      false,
      'catmullrom',
      0.5
    );

    // Lenis 平滑滚动
    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    // 创建滚动容器（高度对应路径长度）
    this.setupScrollContainer();

    // GSAP ScrollTrigger 驱动
    this.setupScrollTrigger();

    // 启动 Lenis RAF
    this.startLenisRaf();

    // 暴露 progress 到 window 供 main.ts 读取
    (window as unknown as { __scrollProgress: number }).__scrollProgress = 0;
  }

  private setupScrollContainer(): void {
    // 创建一个占位 div 撑出滚动高度
    let scrollEl = document.getElementById('scroll-container');
    if (!scrollEl) {
      scrollEl = document.createElement('div');
      scrollEl.id = 'scroll-container';
      scrollEl.style.cssText = 'position:absolute;top:0;left:0;width:1px;pointer-events:none;';
      document.body.appendChild(scrollEl);
    }
    // 滚动总高度 = 视口高度 * 段数（10 段过渡）
    scrollEl.style.height = `${window.innerHeight * 10}px`;
  }

  private setupScrollTrigger(): void {
    ScrollTrigger.create({
      trigger: document.body,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1,
      onUpdate: (self) => {
        this.scrollProgress = self.progress;
        this.onProgress(self.progress);
        this.updateCamera(self.progress);
        // 暴露到 window
        (window as unknown as { __scrollProgress: number }).__scrollProgress = self.progress;
      },
    });
  }

  private updateCamera(progress: number): void {
    // 相机沿路径移动
    const point = this.cameraPath.getPointAt(progress);
    this.camera.position.copy(point);

    // 相机朝向：略微前瞻，形成"飞行"感
    const lookAhead = this.cameraPath.getPointAt(Math.min(progress + 0.05, 1));
    this.lookAtTarget.lerp(lookAhead, 0.1);
    this.camera.lookAt(this.lookAtTarget);
  }

  private startLenisRaf(): void {
    const raf = (time: number) => {
      this.lenis.raf(time);
      ScrollTrigger.update();
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }

  /** 获取路径点（供行星定位使用） */
  getPathPoint(t: number): THREE.Vector3 {
    return this.cameraPath.getPointAt(THREE.MathUtils.clamp(t, 0, 1));
  }

  /** 获取路径切线方向（供行星朝向使用） */
  getPathTangent(t: number): THREE.Vector3 {
    return this.cameraPath.getTangentAt(THREE.MathUtils.clamp(t, 0, 1));
  }

  getProgress(): number {
    return this.scrollProgress;
  }

  /** 滚动到指定进度（0-1） */
  scrollTo(progress: number): void {
    const targetY = progress * (document.body.scrollHeight - window.innerHeight);
    this.lenis.scrollTo(targetY, { duration: 1.5 });
  }

  dispose(): void {
    ScrollTrigger.killAll();
    this.lenis.destroy();
  }
}
