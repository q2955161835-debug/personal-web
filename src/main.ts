import './style.css';
import { SceneManager } from './scene/SceneManager';
import { MeteorField } from './components/MeteorField';

/**
 * 入口 - 阶段 2 入口恒星首页
 * 启动 Three.js 场景（入口恒星 + 倒V Logo + 星空）+ 鼠标流星 + 姓名 UI
 * 后续阶段接入滚动叙事与项目展示
 */
function bootstrap(): void {
  const canvas = document.getElementById('webgl') as HTMLCanvasElement | null;
  if (!canvas) {
    console.error('[bootstrap] #webgl canvas not found');
    return;
  }

  // 检查 WebGL 支持
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  if (!gl) {
    console.error('[bootstrap] WebGL not supported');
    showUnsupported();
    return;
  }

  const manager = new SceneManager(canvas);
  manager.start();

  // 鼠标流星效果（独立 2D canvas 叠加层）
  const meteorField = new MeteorField();
  meteorField.start();

  // 隐藏 loader
  const loader = document.getElementById('loader');
  if (loader) {
    setTimeout(() => {
      loader.classList.add('hide');
      setTimeout(() => loader.remove(), 1500);
    }, 600);
  }

  // UI overlay：顶部导航 + Hero 姓名/求职方向 + 滚动提示 + HUD
  const overlay = document.getElementById('ui-overlay');
  if (overlay) {
    overlay.innerHTML = `
      <nav class="top-nav">
        <div class="brand">FAN JUNJIE · 范俊杰</div>
        <div class="links">
          <a href="https://github.com/q2955161835-debug" target="_blank" rel="noopener">GitHub</a>
          <a href="#contact">Contact</a>
        </div>
      </nav>

      <section class="hero-text" id="hero-text">
        <h1 class="hero-name">
          <span class="hero-name-en">FAN JUNJIE</span>
        </h1>
        <p class="hero-title">AI 产品 / 数据分析实习</p>
      </section>

      <div class="scroll-hint" id="scroll-hint">
        <div class="arrow"></div>
        <span>SCROLL TO EXPLORE</span>
      </div>

      <div class="hud-info">
        <div><span class="label">SCENE:</span> HOME_STAR</div>
        <div><span class="label">STATUS:</span> <span style="color:#6bff9d">READY</span></div>
      </div>
    `;
  }

  // 窗口卸载时清理
  window.addEventListener('beforeunload', () => {
    manager.dispose();
    meteorField.dispose();
  });

  // 暴露到 window 便于调试
  (window as unknown as { __sceneManager: unknown; __meteorField: unknown }).__sceneManager = manager;
  (window as unknown as { __sceneManager: unknown; __meteorField: unknown }).__meteorField = meteorField;
}

function showUnsupported(): void {
  const app = document.getElementById('app');
  if (app) {
    app.innerHTML =
      '<div style="position:fixed;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:18px;text-align:center;padding:20px;">您的浏览器不支持 WebGL，请使用现代浏览器（Chrome / Edge / Firefox / Safari 最新版）访问。</div>';
  }
  const loader = document.getElementById('loader');
  if (loader) loader.remove();
}

bootstrap();
