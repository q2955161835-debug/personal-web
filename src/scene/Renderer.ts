import * as THREE from 'three';

/**
 * 渲染器封装 - WebGL2 + 后处理准备
 * 后续阶段会接入 EffectComposer + UnrealBloomPass
 */
export class Renderer {
  public readonly webgl: THREE.WebGLRenderer;
  public readonly canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.webgl = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
      stencil: false,
      depth: true,
    });
    this.canvas = canvas;
    this.webgl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.webgl.setSize(window.innerWidth, window.innerHeight);
    this.webgl.setClearColor(0x03030a, 1);
    this.webgl.outputColorSpace = THREE.SRGBColorSpace;
    this.webgl.toneMapping = THREE.ACESFilmicToneMapping;
    this.webgl.toneMappingExposure = 1.1;
  }

  resize(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.webgl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.webgl.setSize(w, h);
  }

  render(scene: THREE.Scene, camera: THREE.Camera): void {
    this.webgl.render(scene, camera);
  }

  dispose(): void {
    this.webgl.dispose();
    this.webgl.forceContextLoss();
  }
}
