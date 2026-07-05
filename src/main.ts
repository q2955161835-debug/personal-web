import './style.css';
import { SceneManager } from './scene/SceneManager';
import { MeteorField } from './components/MeteorField';
import { SKILL_CATEGORIES, CONTACT_INFO } from './data/skills';
import { ProjectPlanetData } from './data/projects';

/**
 * 入口 - 阶段 3 滚动叙事系统
 * 启动 Three.js 场景（入口恒星 + 8 占位行星 + 星空）
 * + 鼠标流星 + Hero UI + Lenis 平滑滚动 + GSAP ScrollTrigger
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

  // UI overlay：顶部导航 + Hero 姓名 + 滚动提示 + HUD
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
      </section>

      <div class="scroll-hint" id="scroll-hint">
        <div class="arrow"></div>
        <span>SCROLL TO EXPLORE</span>
      </div>

      <div class="hud-info">
        <div><span class="label">SCENE:</span> <span id="scene-name">HOME_STAR</span></div>
        <div><span class="label">PROGRESS:</span> <span id="scene-progress">0%</span></div>
        <div><span class="label">STATUS:</span> <span style="color:#6bff9d">FLYING</span></div>
      </div>

      <section class="skill-station-ui" id="skill-station-ui">
        <h2 class="station-title">SKILL STATION · 技能空间站</h2>
        <div class="skill-grid">
          ${SKILL_CATEGORIES.map(cat => `
            <div class="skill-card" style="border-color:${cat.color}40;">
              <h3 style="color:${cat.color};">${cat.name}</h3>
              <p class="skill-name-en">${cat.nameEn}</p>
              <ul class="skill-list">
                ${cat.skills.map(s => `
                  <li>
                    <span class="skill-name">${s.name}</span>
                    <div class="skill-bar">
                      <div class="skill-bar-fill" style="width:${s.level}%;background:${cat.color};"></div>
                    </div>
                  </li>
                `).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
        <div class="contact-section">
          <h3>CONTACT · 联系方式</h3>
          <div class="contact-grid">
            ${CONTACT_INFO.map(c => `
              <div class="contact-item">
                <span class="contact-label">${c.label}</span>
                ${c.href
                  ? `<a class="contact-value" href="${c.href}" target="_blank" rel="noopener">${c.value}</a>`
                  : `<span class="contact-value">${c.value}</span>`}
              </div>
            `).join('')}
          </div>
        </div>
      </section>
    `;
  }

  // 监听滚动进度，更新 HUD 和 Hero 文字隐藏
  let lastProgress = 0;
  const handleScroll = (): void => {
    const progress = (window as unknown as { __scrollProgress?: number }).__scrollProgress ?? 0;
    if (Math.abs(progress - lastProgress) < 0.005) return;
    lastProgress = progress;

    // Hero 文字：滚动 5% 后开始淡出
    const heroText = document.getElementById('hero-text');
    if (heroText) {
      const heroOpacity = Math.max(0, 1 - progress * 8);
      heroText.style.opacity = `${heroOpacity}`;
      heroText.style.transform = `translateY(${-progress * 200}px)`;
    }

    // 滚动提示：滚动 3% 后淡出
    const scrollHint = document.getElementById('scroll-hint');
    if (scrollHint) {
      scrollHint.style.opacity = `${Math.max(0, 1 - progress * 15)}`;
    }

    // HUD 更新
    const sceneName = document.getElementById('scene-name');
    const sceneProgress = document.getElementById('scene-progress');
    if (sceneProgress) sceneProgress.textContent = `${Math.round(progress * 100)}%`;
    if (sceneName) {
      if (progress < 0.05) sceneName.textContent = 'HOME_STAR';
      else if (progress < 0.85) {
        const planetIdx = Math.min(7, Math.floor((progress - 0.05) / 0.1));
        const planetNames = ['LANG_DRILL', 'MAHJONG_AI', 'GOMOKU_AI', 'CODEX_VIDEO', 'GARCH_MIDAS', 'MARINE_FUSION', 'ECO_MAP', 'HPLC_GREY'];
        sceneName.textContent = planetNames[planetIdx] ?? 'SPACE_TRAVEL';
      } else sceneName.textContent = 'SPACE_STATION';
    }

    // 技能空间站 UI：滚动 85% 后淡入
    const skillUi = document.getElementById('skill-station-ui');
    if (skillUi) {
      const skillOpacity = Math.max(0, Math.min(1, (progress - 0.85) / 0.1));
      skillUi.style.opacity = `${skillOpacity}`;
      skillUi.style.pointerEvents = skillOpacity > 0.5 ? 'auto' : 'none';
    }

    // 滚动到空间站区域（>=88%）禁用行星交互，避免误触
    manager.setInteractionEnabled(progress < 0.88);
  };
  window.addEventListener('scroll', handleScroll, { passive: true });

  // 行星点击模态框
  const openProjectModal = (data: ProjectPlanetData): void => {
    let modal = document.getElementById('project-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'project-modal';
      modal.className = 'project-modal';
      document.body.appendChild(modal);
    }
    modal.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content glass-panel">
        <button class="modal-close" aria-label="Close">×</button>
        <div class="modal-header">
          <h2 class="modal-title">${data.name}</h2>
          <p class="modal-subtitle">${data.nameEn} · ${data.subtitle}</p>
        </div>
        <div class="modal-body">
          <section class="modal-section">
            <h3>项目简介</h3>
            <p>${data.brief}</p>
          </section>
          <section class="modal-section">
            <h3>含金量亮点</h3>
            <ul class="highlights-list">
              ${data.highlights.map(h => `<li>${h}</li>`).join('')}
            </ul>
          </section>
          <section class="modal-section">
            <h3>项目详情</h3>
            <p>${data.detail.overview}</p>
          </section>
          <section class="modal-section">
            <h3>技术栈</h3>
            <div class="tags-row">
              ${data.detail.techStack.map(t => `<span class="tag">${t}</span>`).join('')}
              ${data.tags.map(t => `<span class="tag tag-alt">${t}</span>`).join('')}
            </div>
          </section>
          ${data.detail.keyFeatures.length > 0 ? `
          <section class="modal-section">
            <h3>核心特性</h3>
            <ul class="features-list">
              ${data.detail.keyFeatures.map(f => `<li>${f}</li>`).join('')}
            </ul>
          </section>` : ''}
          ${data.detail.outcomes && data.detail.outcomes.length > 0 ? `
          <section class="modal-section">
            <h3>成果</h3>
            <ul class="outcomes-list">
              ${data.detail.outcomes.map(o => `<li>${o}</li>`).join('')}
            </ul>
          </section>` : ''}
          ${data.detail.links && data.detail.links.length > 0 ? `
          <section class="modal-section">
            <h3>相关链接</h3>
            <div class="links-row">
              ${data.detail.links.map(l => `<a href="${l.url}" target="_blank" rel="noopener" class="project-link">${l.label} →</a>`).join('')}
            </div>
          </section>` : ''}
        </div>
      </div>
    `;
    modal.classList.add('open');
    // 关闭逻辑
    const close = () => {
      modal!.classList.remove('open');
      setTimeout(() => modal!.remove(), 400);
    };
    modal.querySelector('.modal-close')?.addEventListener('click', close);
    modal.querySelector('.modal-backdrop')?.addEventListener('click', close);
    // ESC 关闭
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close();
        window.removeEventListener('keydown', onEsc);
      }
    };
    window.addEventListener('keydown', onEsc);
  };

  manager.setModalOpenCallback(openProjectModal);

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
