/**
 * 光标拖尾效果 - activetheory 风格
 * 优雅的物理跟随：主光球 + 多层滞后粒子 + 柔光叠加
 * 不再是激进的流星爆裂，而是丝滑流畅的能量拖尾
 */

interface Follower {
  x: number;
  y: number;
  /** 跟随缓动系数（越小越滞后） */
  ease: number;
  /** 半径 */
  radius: number;
  /** 历史轨迹（用于绘制丝带） */
  trail: { x: number; y: number }[];
  /** 颜色色相（0-360） */
  hue: number;
}

export class MeteorField {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private targetX = window.innerWidth / 2;
  private targetY = window.innerHeight / 2;
  private followers: Follower[] = [];
  private rafId = 0;
  private running = false;
  private visible = false;
  private hideTimer = 0;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'meteor-canvas';
    this.canvas.style.cssText =
      'position:fixed;inset:0;z-index:5;pointer-events:none;mix-blend-mode:screen;';
    document.body.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d')!;
    this.resize();

    // 主光球 + 多层滞后粒子，ease 越小越滞后
    const config = [
      { ease: 0.18, radius: 14, hue: 190 }, // 主光球（青）
      { ease: 0.14, radius: 10, hue: 200 },
      { ease: 0.11, radius: 8, hue: 215 },
      { ease: 0.085, radius: 6, hue: 230 },
      { ease: 0.065, radius: 5, hue: 250 },
      { ease: 0.05, radius: 4, hue: 270 }, // 尾端（紫）
      { ease: 0.038, radius: 3, hue: 290 },
      { ease: 0.028, radius: 2.5, hue: 310 },
    ];
    for (const c of config) {
      this.followers.push({
        x: this.targetX,
        y: this.targetY,
        ease: c.ease,
        radius: c.radius,
        trail: [],
        hue: c.hue,
      });
    }

    window.addEventListener('resize', this.resize);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('touchmove', this.onTouchMove, { passive: true });
    window.addEventListener('mouseleave', this.onMouseLeave);
  }

  private resize = (): void => {
    const dpr = window.devicePixelRatio;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.canvas.style.width = `${window.innerWidth}px`;
    this.canvas.style.height = `${window.innerHeight}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  private onMouseMove = (e: MouseEvent): void => {
    this.targetX = e.clientX;
    this.targetY = e.clientY;
    this.visible = true;
    this.hideTimer = 0;
  };

  private onTouchMove = (e: TouchEvent): void => {
    if (e.touches.length > 0) {
      this.targetX = e.touches[0].clientX;
      this.targetY = e.touches[0].clientY;
      this.visible = true;
      this.hideTimer = 0;
    }
  };

  private onMouseLeave = (): void => {
    // 鼠标离开窗口时淡出
  };

  start(): void {
    if (this.running) return;
    this.running = true;
    this.loop();
  }

  stop(): void {
    this.running = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }

  private loop = (): void => {
    if (!this.running) return;
    this.rafId = requestAnimationFrame(this.loop);

    const w = window.innerWidth;
    const h = window.innerHeight;

    // 渐隐背景（轻拖尾）
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    this.ctx.fillRect(0, 0, w, h);

    this.ctx.globalCompositeOperation = 'lighter';

    // 更新跟随粒子位置（lerp 缓动）
    for (const f of this.followers) {
      f.x += (this.targetX - f.x) * f.ease;
      f.y += (this.targetY - f.y) * f.ease;

      // 记录轨迹
      f.trail.push({ x: f.x, y: f.y });
      if (f.trail.length > 18) f.trail.shift();
    }

    // 闲置淡出
    if (!this.visible) {
      this.hideTimer++;
    }
    const globalAlpha = this.visible ? 1 : Math.max(0, 1 - this.hideTimer / 60);

    // 绘制丝带连接（从尾端到主光球的平滑曲线）
    if (globalAlpha > 0.01) {
      this.drawRibbon(globalAlpha);

      // 绘制每个跟随粒子的柔光
      for (const f of this.followers) {
        this.drawSoftGlow(f.x, f.y, f.radius, f.hue, globalAlpha);
      }
    }

    // 鼠标停止移动一段时间后重新进入可见状态
    if (this.hideTimer > 60) this.visible = false;
  };

  /** 绘制柔光圆点（径向渐变） */
  private drawSoftGlow(x: number, y: number, radius: number, hue: number, alpha: number): void {
    const grad = this.ctx.createRadialGradient(x, y, 0, x, y, radius * 2.5);
    grad.addColorStop(0, `hsla(${hue}, 100%, 92%, ${alpha * 0.95})`);
    grad.addColorStop(0.35, `hsla(${hue}, 90%, 75%, ${alpha * 0.5})`);
    grad.addColorStop(1, `hsla(${hue}, 80%, 60%, 0)`);
    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius * 2.5, 0, Math.PI * 2);
    this.ctx.fill();
  }

  /** 绘制丝带：用二次贝塞尔连接主光球的轨迹 */
  private drawRibbon(alpha: number): void {
    const main = this.followers[0];
    if (main.trail.length < 2) return;

    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    // 多层叠加，从外到内变细变亮
    const layers = [
      { width: 8, alpha: 0.08, hue: 220 },
      { width: 4, alpha: 0.18, hue: 210 },
      { width: 2, alpha: 0.35, hue: 200 },
      { width: 1, alpha: 0.6, hue: 190 },
    ];

    for (const layer of layers) {
      this.ctx.beginPath();
      this.ctx.strokeStyle = `hsla(${layer.hue}, 100%, 85%, ${alpha * layer.alpha})`;
      this.ctx.lineWidth = layer.width;

      const trail = main.trail;
      this.ctx.moveTo(trail[0].x, trail[0].y);
      for (let i = 1; i < trail.length - 1; i++) {
        const xc = (trail[i].x + trail[i + 1].x) / 2;
        const yc = (trail[i].y + trail[i + 1].y) / 2;
        this.ctx.quadraticCurveTo(trail[i].x, trail[i].y, xc, yc);
      }
      this.ctx.lineTo(trail[trail.length - 1].x, trail[trail.length - 1].y);
      this.ctx.stroke();
    }
  }

  dispose(): void {
    this.stop();
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('touchmove', this.onTouchMove);
    window.removeEventListener('mouseleave', this.onMouseLeave);
    this.canvas.remove();
  }
}
