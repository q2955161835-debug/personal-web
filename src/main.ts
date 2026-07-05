import './style.css';
import { SceneManager } from './scene/SceneManager';

/**
 * 入口 - 阶段 1 基础骨架
 * 启动 Three.js 场景，隐藏 loader，后续阶段接入滚动叙事与项目展示
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

  // 隐藏 loader
  const loader = document.getElementById('loader');
  if (loader) {
    setTimeout(() => {
      loader.classList.add('hide');
      setTimeout(() => loader.remove(), 1500);
    }, 600);
  }

  // 添加顶部导航（临时，后续阶段会接入完整 UI）
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
      <div class="scroll-hint" id="scroll-hint">
        <div class="arrow"></div>
        <span>SCROLL TO EXPLORE</span>
      </div>
      <div class="hud-info">
        <div><span class="label">SCENE:</span> STARFIELD_INIT</div>
        <div><span class="label">STATUS:</span> <span style="color:#6bff9d">READY</span></div>
      </div>
    `;
  }

  // 窗口卸载时清理
  window.addEventListener('beforeunload', () => {
    manager.dispose();
  });

  // 暴露到 window 便于调试
  (window as unknown as { __sceneManager: unknown }).__sceneManager = manager;
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
