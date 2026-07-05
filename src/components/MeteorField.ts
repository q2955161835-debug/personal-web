/**
 * 鼠标彗星效果
 * 向鼠标移动方向发射有拖尾的彗星粒子
 * - 每次鼠标移动生成一颗彗星，沿移动方向喷射
 * - 彗星含头部光球 + 锥形拖尾 + 柔光
 * - 多层叠加 + 加色混合，形成能量感
 */

interface Comet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
  trail: { x: number; y: number; alpha: number }[];
}

export class MeteorField {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private comets: Comet[] = [];
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

    // 移动距离阈值 + 时间节流
    if (dist < 6 || now - this.lastSpawnTime < 28) {
      this.lastX = x;
      this.lastY = y;
      return;
    }
    this.lastSpawnTime = now;

    // 沿移动方向发射彗星（速度叠加移动方向）
    const moveAngle = Math.atan2(dy, dx);
    const count = Math.min(2, Math.floor(dist / 40) + 1);

    for (let i = 0; i < count; i++) {
      // 在移动方向附近散布
      const angle = moveAngle + (Math.random() - 0.5) * 0.4;
      const speed = 2.0 + Math.random() * 3 + dist * 0.04;
      // 色相：以蓝紫为主，匹配星空冷色调；少量暖白点缀
      const r = Math.random();
      const hue = r < 0.55
        ? 200 + Math.random() * 60   // 蓝-紫
        : r < 0.85
          ? 280 + Math.random() * 40  // 紫-品红
          : 30 + Math.random() * 25;  // 偶尔暖金点缀

      this.comets.push({
        x: x + (Math.random() - 0.5) * 6,
        y: y + (Math.random() - 0.5) * 6,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        maxLife: 1.2 + Math.random() * 0.9,
        size: 1.5 + Math.random() * 1.8,
        hue,
        trail: [],
      });
    }

    this.lastX = x;
    this.lastY = y;

    // 限流
    if (this.comets.length > 80) {
      this.comets.splice(0, this.comets.length - 80);
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
    for (let i = this.comets.length - 1; i >= 0; i--) {
      const c = this.comets[i];
      c.life += dt;

      if (c.life >= c.maxLife) {
        this.comets.splice(i, 1);
        continue;
      }

      // 更新位置
      c.x += c.vx;
      c.y += c.vy;
      // 轻微减速
      c.vx *= 0.985;
      c.vy *= 0.985;
      // 轻微重力（向下飘）
      c.vy += 0.02;

      // 记录拖尾
      c.trail.push({ x: c.x, y: c.y, alpha: 1 - c.life / c.maxLife });
      if (c.trail.length > 22) c.trail.shift();

      const lifeRatio = c.life / c.maxLife;
      const alpha = (1 - lifeRatio) * 0.95;

      // 绘制拖尾（多层渐变锥形）
      this.drawTrail(c, alpha);

      // 绘制头部光球
      this.drawHead(c.x, c.y, c.size, c.hue, alpha);
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

    // 最亮中心点（接近白）
    this.ctx.fillStyle = `hsla(${hue}, 50%, 95%, ${alpha * 0.9})`;
    this.ctx.beginPath();
    this.ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
    this.ctx.fill();
  }

  /** 绘制拖尾：从尾端到头部的渐变粗细曲线 */
  private drawTrail(c: Comet, alpha: number): void {
    if (c.trail.length < 2) return;

    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    // 三层叠加：外光晕 + 中层 + 内亮线（降低饱和度与亮度融入星空）
    const layers = [
      { widthMul: 4.0, alphaMul: 0.08, hueOffset: 0, sat: 50, light: 65 },
      { widthMul: 2.0, alphaMul: 0.22, hueOffset: 0, sat: 65, light: 75 },
      { widthMul: 0.8, alphaMul: 0.55, hueOffset: -5, sat: 75, light: 88 },
    ];

    for (const layer of layers) {
      this.ctx.beginPath();
      const trail = c.trail;
      const start = trail[0];
      this.ctx.moveTo(start.x, start.y);

      for (let i = 1; i < trail.length - 1; i++) {
        const xc = (trail[i].x + trail[i + 1].x) / 2;
        const yc = (trail[i].y + trail[i + 1].y) / 2;
        this.ctx.quadraticCurveTo(trail[i].x, trail[i].y, xc, yc);
      }
      this.ctx.lineTo(trail[trail.length - 1].x, trail[trail.length - 1].y);

      // 沿拖尾渐变粗细：用多段绘制实现锥形
      const grad = this.ctx.createLinearGradient(
        trail[0].x,
        trail[0].y,
        c.x,
        c.y
      );
      grad.addColorStop(0, `hsla(${c.hue + layer.hueOffset}, ${layer.sat}%, ${layer.light}%, 0)`);
      grad.addColorStop(0.6, `hsla(${c.hue + layer.hueOffset}, ${layer.sat}%, ${layer.light}%, ${alpha * layer.alphaMul * 0.5})`);
      grad.addColorStop(1, `hsla(${c.hue + layer.hueOffset}, ${layer.sat}%, ${layer.light + 5}%, ${alpha * layer.alphaMul})`);

      this.ctx.strokeStyle = grad;
      this.ctx.lineWidth = c.size * layer.widthMul;
      this.ctx.stroke();
    }
  }

  dispose(): void {
    this.stop();
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('touchmove', this.onTouchMove);
    this.canvas.remove();
  }
}
