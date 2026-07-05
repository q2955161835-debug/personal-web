/**
 * 鼠标彗星效果 - 头尾分离版
 * - 彗星头部：独立运动的光球，沿鼠标移动方向喷射
 * - 拖尾粒子：从头部脱落，留在路径上独立消散
 * 头部和拖尾物理分离，拖尾更自然柔和
 */

interface TrailParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
}

interface Comet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
  /** 累计位移用于触发拖尾脱落 */
  distAccum: number;
}

export class MeteorField {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private comets: Comet[] = [];
  private trails: TrailParticle[] = [];
  private lastX = -1;
  private lastY = -1;
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
    const dpr = window.devicePixelRatio;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.canvas.style.width = `${window.innerWidth}px`;
    this.canvas.style.height = `${window.innerHeight}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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
    if (this.lastX < 0) {
      this.lastX = x;
      this.lastY = y;
      return;
    }

    const dx = x - this.lastX;
    const dy = y - this.lastY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 6 || now - this.lastSpawnTime < 28) {
      this.lastX = x;
      this.lastY = y;
      return;
    }
    this.lastSpawnTime = now;

    const moveAngle = Math.atan2(dy, dx);

    // 每次发射 1-2 颗彗星
    const count = Math.min(2, Math.floor(dist / 40) + 1);
    for (let i = 0; i < count; i++) {
      const angle = moveAngle + (Math.random() - 0.5) * 0.4;
      const speed = 2.0 + Math.random() * 3 + dist * 0.04;
      const r = Math.random();
      const hue = r < 0.55
        ? 200 + Math.random() * 60
        : r < 0.85
          ? 280 + Math.random() * 40
          : 30 + Math.random() * 25;

      this.comets.push({
        x: x + (Math.random() - 0.5) * 6,
        y: y + (Math.random() - 0.5) * 6,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 1.2 + Math.random() * 0.9,
        size: 1.5 + Math.random() * 1.8,
        hue,
        distAccum: 0,
      });
    }

    this.lastX = x;
    this.lastY = y;

    if (this.comets.length > 60) {
      this.comets.splice(0, this.comets.length - 60);
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

    // 渐隐背景（拖尾余晖）
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
    this.ctx.fillRect(0, 0, w, h);

    this.ctx.globalCompositeOperation = 'lighter';

    const dt = 0.016;

    // 先更新拖尾粒子（独立消散）
    for (let i = this.trails.length - 1; i >= 0; i--) {
      const t = this.trails[i];
      t.life += dt;
      if (t.life >= t.maxLife) {
        this.trails.splice(i, 1);
        continue;
      }
      // 拖尾粒子缓慢飘移 + 减速
      t.x += t.vx;
      t.y += t.vy;
      t.vx *= 0.96;
      t.vy *= 0.96;
      t.vy += 0.008; // 轻微下飘

      const alpha = (1 - t.life / t.maxLife) * 0.7;
      this.drawTrailDot(t.x, t.y, t.size, t.hue, alpha);
    }

    // 再更新彗星头部
    for (let i = this.comets.length - 1; i >= 0; i--) {
      const c = this.comets[i];
      c.life += dt;

      if (c.life >= c.maxLife) {
        this.comets.splice(i, 1);
        continue;
      }

      // 头部运动
      const prevX = c.x;
      const prevY = c.y;
      c.x += c.vx;
      c.y += c.vy;
      c.vx *= 0.985;
      c.vy *= 0.985;
      c.vy += 0.015;

      // 头部沿路径脱落拖尾粒子（与头部物理分离）
      const moveDist = Math.hypot(c.x - prevX, c.y - prevY);
      c.distAccum += moveDist;
      // 每移动 4-7 像素脱落一颗拖尾粒子
      const dropInterval = 4 + Math.random() * 3;
      while (c.distAccum >= dropInterval) {
        c.distAccum -= dropInterval;
        // 拖尾粒子从头部位置脱落，速度远小于头部（飘逸感）
        const trailSpeed = 0.15 + Math.random() * 0.25;
        const trailAngle = Math.atan2(c.vy, c.vx) + Math.PI + (Math.random() - 0.5) * 0.8;
        this.trails.push({
          x: c.x + (Math.random() - 0.5) * 3,
          y: c.y + (Math.random() - 0.5) * 3,
          vx: Math.cos(trailAngle) * trailSpeed,
          vy: Math.sin(trailAngle) * trailSpeed,
          life: 0,
          maxLife: 0.8 + Math.random() * 0.6,
          size: c.size * (0.5 + Math.random() * 0.5),
          hue: c.hue,
        });
      }

      const lifeRatio = c.life / c.maxLife;
      const alpha = (1 - lifeRatio) * 0.95;

      // 仅绘制头部光球（不再绘制跟随拖尾）
      this.drawHead(c.x, c.y, c.size, c.hue, alpha);
    }

    // 限流拖尾
    if (this.trails.length > 300) {
      this.trails.splice(0, this.trails.length - 300);
    }
  };

  /** 绘制彗星头部：多层径向柔光 */
  private drawHead(x: number, y: number, size: number, hue: number, alpha: number): void {
    // 外层柔光大光环
    const outer = this.ctx.createRadialGradient(x, y, 0, x, y, size * 6);
    outer.addColorStop(0, `hsla(${hue}, 70%, 80%, ${alpha * 0.35})`);
    outer.addColorStop(0.3, `hsla(${hue}, 60%, 65%, ${alpha * 0.18})`);
    outer.addColorStop(1, `hsla(${hue}, 50%, 55%, 0)`);
    this.ctx.fillStyle = outer;
    this.ctx.beginPath();
    this.ctx.arc(x, y, size * 6, 0, Math.PI * 2);
    this.ctx.fill();

    // 中层亮核
    const mid = this.ctx.createRadialGradient(x, y, 0, x, y, size * 2.5);
    mid.addColorStop(0, `hsla(${hue}, 80%, 90%, ${alpha * 0.85})`);
    mid.addColorStop(0.5, `hsla(${hue}, 70%, 75%, ${alpha * 0.45})`);
    mid.addColorStop(1, `hsla(${hue}, 60%, 60%, 0)`);
    this.ctx.fillStyle = mid;
    this.ctx.beginPath();
    this.ctx.arc(x, y, size * 2.5, 0, Math.PI * 2);
    this.ctx.fill();

    // 最亮中心点
    this.ctx.fillStyle = `hsla(${hue}, 50%, 95%, ${alpha * 0.9})`;
    this.ctx.beginPath();
    this.ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
    this.ctx.fill();
  }

  /** 绘制拖尾粒子：单个柔和光点 */
  private drawTrailDot(x: number, y: number, size: number, hue: number, alpha: number): void {
    // 柔和光晕
    const grad = this.ctx.createRadialGradient(x, y, 0, x, y, size * 4);
    grad.addColorStop(0, `hsla(${hue}, 65%, 80%, ${alpha * 0.5})`);
    grad.addColorStop(0.4, `hsla(${hue}, 55%, 65%, ${alpha * 0.2})`);
    grad.addColorStop(1, `hsla(${hue}, 50%, 55%, 0)`);
    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.arc(x, y, size * 4, 0, Math.PI * 2);
    this.ctx.fill();

    // 中心亮点
    this.ctx.fillStyle = `hsla(${hue}, 60%, 90%, ${alpha * 0.6})`;
    this.ctx.beginPath();
    this.ctx.arc(x, y, size * 0.8, 0, Math.PI * 2);
    this.ctx.fill();
  }

  dispose(): void {
    this.stop();
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('touchmove', this.onTouchMove);
    this.canvas.remove();
  }
}
