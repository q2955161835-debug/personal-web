/**
 * 鼠标流星效果
 * 在独立的 2D canvas 上绘制，鼠标移动时生成流星粒子拖尾
 * 替代 activetheory.net 的飞出效果
 */

interface MeteorParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
  trail: { x: number; y: number }[];
}

export class MeteorField {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: MeteorParticle[] = [];
  private lastMouseX = -1;
  private lastMouseY = -1;
  private lastSpawnTime = 0;
  private rafId = 0;
  private running = false;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'meteor-canvas';
    this.canvas.style.cssText =
      'position:fixed;inset:0;z-index:5;pointer-events:none;mix-blend-mode:screen;';
    document.body.appendChild(this.canvas);

    this.ctx = this.canvas.getContext('2d')!;
    this.resize();

    window.addEventListener('resize', this.resize);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('touchmove', this.onTouchMove, { passive: true });
  }

  private resize = (): void => {
    this.canvas.width = window.innerWidth * window.devicePixelRatio;
    this.canvas.height = window.innerHeight * window.devicePixelRatio;
    this.canvas.style.width = `${window.innerWidth}px`;
    this.canvas.style.height = `${window.innerHeight}px`;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  };

  private onMouseMove = (e: MouseEvent): void => {
    this.spawn(e.clientX, e.clientY);
  };

  private onTouchMove = (e: TouchEvent): void => {
    if (e.touches.length > 0) {
      this.spawn(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  private spawn(x: number, y: number): void {
    const now = performance.now();
    if (this.lastMouseX < 0) {
      this.lastMouseX = x;
      this.lastMouseY = y;
      return;
    }

    const dx = x - this.lastMouseX;
    const dy = y - this.lastMouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // 根据移动距离决定生成数量
    if (dist < 2 || now - this.lastSpawnTime < 16) return;
    this.lastSpawnTime = now;

    // 生成流星粒子（沿移动反方向喷射，模拟拖尾）
    const count = Math.min(3, Math.floor(dist / 8) + 1);
    for (let i = 0; i < count; i++) {
      const angle = Math.atan2(dy, dx) + Math.PI + (Math.random() - 0.5) * 0.6;
      const speed = 1.5 + Math.random() * 3;
      const hue = 200 + Math.random() * 120; // 蓝-紫-粉范围
      this.particles.push({
        x: x + (Math.random() - 0.5) * 4,
        y: y + (Math.random() - 0.5) * 4,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 0.8 + Math.random() * 0.6,
        size: 1.2 + Math.random() * 1.8,
        hue,
        trail: [],
      });
    }

    this.lastMouseX = x;
    this.lastMouseY = y;

    // 限制粒子数
    if (this.particles.length > 180) {
      this.particles.splice(0, this.particles.length - 180);
    }
  }

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

    // 渐隐背景（拖尾效果）
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    this.ctx.fillRect(0, 0, w, h);

    this.ctx.globalCompositeOperation = 'lighter';

    const dt = 0.016;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += dt;

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }

      // 更新位置
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.04; // 轻微重力
      p.vx *= 0.985;
      p.vy *= 0.985;

      // 记录拖尾
      p.trail.push({ x: p.x, y: p.y });
      if (p.trail.length > 14) p.trail.shift();

      const lifeRatio = p.life / p.maxLife;
      const alpha = 1 - lifeRatio;
      const size = p.size * (1 - lifeRatio * 0.5);

      // 绘制拖尾
      if (p.trail.length > 1) {
        const grad = this.ctx.createLinearGradient(
          p.trail[0].x,
          p.trail[0].y,
          p.x,
          p.y
        );
        grad.addColorStop(0, `hsla(${p.hue}, 90%, 70%, 0)`);
        grad.addColorStop(1, `hsla(${p.hue}, 90%, 75%, ${alpha * 0.8})`);
        this.ctx.strokeStyle = grad;
        this.ctx.lineWidth = size * 0.9;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(p.trail[0].x, p.trail[0].y);
        for (let j = 1; j < p.trail.length; j++) {
          this.ctx.lineTo(p.trail[j].x, p.trail[j].y);
        }
        this.ctx.lineTo(p.x, p.y);
        this.ctx.stroke();
      }

      // 绘制粒子头部（光点）
      const headGrad = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 3);
      headGrad.addColorStop(0, `hsla(${p.hue}, 100%, 90%, ${alpha})`);
      headGrad.addColorStop(0.4, `hsla(${p.hue}, 90%, 70%, ${alpha * 0.6})`);
      headGrad.addColorStop(1, `hsla(${p.hue}, 80%, 60%, 0)`);
      this.ctx.fillStyle = headGrad;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, size * 3, 0, Math.PI * 2);
      this.ctx.fill();
    }
  };

  dispose(): void {
    this.stop();
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('touchmove', this.onTouchMove);
    this.canvas.remove();
  }
}
