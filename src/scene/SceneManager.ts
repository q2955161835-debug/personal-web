import * as THREE from 'three';
import { Renderer } from './Renderer';
import { Starfield } from '../components/Starfield';
import { HomeStar } from '../components/HomeStar';
import { PlanetPlaceholder } from '../components/PlanetPlaceholder';
import { DataAnalysisRing } from '../components/DataAnalysisRing';
import { TransitionEffects } from '../components/TransitionEffects';
import { SkillStation } from '../components/SkillStation';
import { PlanetInteraction } from './PlanetInteraction';
import { ScrollController } from './ScrollController';
import { PROJECT_PLANETS, ProjectPlanetData } from '../data/projects';

/**
 * 场景管理器
 * 阶段1：相机 + 灯光 + 星空背景 + 渲染循环
 * 阶段2：入口恒星（增强版太阳）
 * 阶段3：滚动叙事系统（Lenis + GSAP ScrollTrigger + 相机贝塞尔曲线 + 行星定位）
 * 阶段4-5：8 个主行星自定义表面 shader
 * 阶段6：数据分析星环（90+ 小星体按 8 领域分组）
 */
export class SceneManager {
  public readonly scene: THREE.Scene;
  public readonly camera: THREE.PerspectiveCamera;
  private readonly renderer: Renderer;
  private readonly starfield: Starfield;
  private readonly homeStar: HomeStar;
  private readonly planets: PlanetPlaceholder[] = [];
  private dataAnalysisRing: DataAnalysisRing | null = null;
  private transitionEffects: TransitionEffects | null = null;
  private skillStation: SkillStation | null = null;
  private planetInteraction: PlanetInteraction | null = null;
  private scrollController: ScrollController | null = null;
  private onModalOpen: ((data: ProjectPlanetData) => void) | null = null;

  private clock = new THREE.Clock();
  private rafId = 0;
  private running = false;

  // 滚动进度（0-1），由 ScrollController 驱动
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

    // 滚动控制器（驱动相机沿路径移动）- 必须在 setupPlanets 和 setupRing 之前创建
    this.scrollController = new ScrollController(this.camera, (p) => {
      this.scrollProgress = p;
    });

    // 8 个主行星沿路径分布
    this.setupPlanets();

    // 数据分析星环（放在路径中段）
    this.setupDataAnalysisRing();

    // 转场动效（陨石带、星云、彗星、星团）
    this.transitionEffects = new TransitionEffects();
    this.scene.add(this.transitionEffects.group);

    // 技能证书空间站（路径终点）
    this.setupSkillStation();

    // 事件绑定
    this.onResize = this.onResize.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.animate = this.animate.bind(this);

    window.addEventListener('resize', this.onResize);
    window.addEventListener('mousemove', this.onMouseMove);

    // 行星交互（raycasting + 点击弹模态框）
    this.planetInteraction = new PlanetInteraction(this.camera, (data) => {
      this.onModalOpen?.(data);
    });
    for (let i = 0; i < this.planets.length; i++) {
      this.planetInteraction.registerPlanet(this.planets[i].mesh, PROJECT_PLANETS[i]);
    }
  }

  /** 设置模态框打开回调 */
  setModalOpenCallback(cb: (data: ProjectPlanetData) => void): void {
    this.onModalOpen = cb;
  }

  /** 设置交互是否启用（滚动到空间站时禁用） */
  setInteractionEnabled(v: boolean): void {
    this.planetInteraction?.setEnabled(v);
  }

  /** 沿相机路径布置 8 个行星 */
  private setupPlanets(): void {
    // 行星在路径上的进度位置（0.1 ~ 0.85）
    const planetProgress = [0.10, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70, 0.80];

    for (let i = 0; i < PROJECT_PLANETS.length; i++) {
      const data = PROJECT_PLANETS[i];
      const planet = new PlanetPlaceholder(data, 1.8);

      // 用 ScrollController 的路径定位行星
      const t = planetProgress[i];
      const pos = this.scrollController!.getPathPoint(t);
      // 行星偏离路径一点，放在相机视野侧
      const tangent = this.scrollController!.getPathTangent(t);
      const side = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
      const offset = i % 2 === 0 ? 6 : -6;
      planet.group.position.copy(pos).add(side.multiplyScalar(offset));

      this.scene.add(planet.group);
      this.planets.push(planet);
    }
  }

  /** 数据分析星环（路径中段） */
  private setupDataAnalysisRing(): void {
    this.dataAnalysisRing = new DataAnalysisRing(0.8);
    // 放在路径中段（约 0.45 进度处）
    const pos = this.scrollController!.getPathPoint(0.45);
    const tangent = this.scrollController!.getPathTangent(0.45);
    const side = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
    // 偏向另一侧，避免与主行星重叠
    this.dataAnalysisRing.group.position.copy(pos).add(side.multiplyScalar(-10));
    this.dataAnalysisRing.group.position.y += 2;
    this.scene.add(this.dataAnalysisRing.group);
  }

  /** 技能证书空间站（路径终点） */
  private setupSkillStation(): void {
    this.skillStation = new SkillStation(2);
    // 放在路径终点（0.92 进度处）
    const pos = this.scrollController!.getPathPoint(0.92);
    this.skillStation.group.position.copy(pos);
    this.skillStation.group.position.y += 1;
    this.scene.add(this.skillStation.group);
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

  /** 兼容旧接口，阶段3 起改由 ScrollController 驱动 */
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

    // 行星更新
    for (const planet of this.planets) {
      planet.update(elapsed, delta);
    }

    // 数据分析星环更新
    this.dataAnalysisRing?.update(elapsed, delta);

    // 转场动效更新
    this.transitionEffects?.update(elapsed, delta);

    // 空间站更新
    this.skillStation?.update(elapsed, delta);

    // 行星交互更新（raycasting）
    this.planetInteraction?.update();

    // 相机视差（鼠标驱动，轻微）- 仅在首页生效，滚动后衰减
    const parallaxStrength = Math.max(0, 1 - this.scrollProgress * 3);
    this.targetCameraX += (this.mouseX * 8 * parallaxStrength - this.targetCameraX) * 0.05;
    this.targetCameraY += (this.mouseY * 6 * parallaxStrength - this.targetCameraY) * 0.05;
    // 鼠标视差仅作为偏移叠加（ScrollController 已设置 base position）
    this.camera.position.x += this.targetCameraX * 0.02;
    this.camera.position.y += this.targetCameraY * 0.02;

    this.renderer.render(this.scene, this.camera);
  }

  dispose(): void {
    this.stop();
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('mousemove', this.onMouseMove);
    this.starfield.dispose();
    this.homeStar.dispose();
    for (const planet of this.planets) planet.dispose();
    this.dataAnalysisRing?.dispose();
    this.transitionEffects?.dispose();
    this.skillStation?.dispose();
    this.planetInteraction?.dispose();
    this.scrollController?.dispose();
    this.renderer.dispose();
  }
}
