// ── ACTUALIZAR ESTOS VALORES CONFORME AVANCE EL PROYECTO ──
const META_ARTICULOS_ACTUAL = 154;    // Meta: 100 artículos
const META_PERSONAS_ACTUAL  = 0;    // Meta: 150 personas
const META_ENTREGAS_ACTUAL  = 0;    // Meta: entrega
const FECHA_COLECTA = new Date('2026-06-12T19:00:00'); // fecha de colecta


// ── Configuración de metas (no editar) ──────────────────────
const METAS = [
  { key: 'articulos', actual: META_ARTICULOS_ACTUAL, goal: 100 },
  { key: 'personas',  actual: META_PERSONAS_ACTUAL,  goal: 150 },
  { key: 'entregas',  actual: META_ENTREGAS_ACTUAL,  goal: 1   },
];

function getMessage(pct) {
  if (pct === 0)   return '¡Apenas comenzamos!';
  if (pct < 50)    return '¡Vamos bien!';
  if (pct < 100)   return '¡Ya casi llegamos!';
  return '¡Meta cumplida! 🎉';
}

function renderMetas() {
  METAS.forEach(({ key, actual, goal }) => {
    const pct   = Math.min(Math.round((actual / goal) * 100), 100);
    const fill  = document.querySelector(`.progress-bar__fill[data-meta="${key}"]`);
    const bar   = fill?.closest('[role="progressbar"]');
    const numEl = document.getElementById(`num-${key}`);
    const pctEl = document.getElementById(`pct-${key}`);
    const msgEl = document.getElementById(`msg-${key}`);

    if (numEl) numEl.textContent = actual.toLocaleString('es-MX');
    if (pctEl) pctEl.textContent = `${pct}%`;
    if (msgEl) msgEl.textContent = getMessage(pct);
    if (bar)   bar.setAttribute('aria-valuenow', actual);

    if (fill) {
      const observer = new IntersectionObserver(
        (entries, obs) => {
          if (entries[0].isIntersecting) {
            fill.style.width = `${pct}%`;
            obs.unobserve(fill);
          }
        },
        { threshold: 0.4 }
      );
      observer.observe(fill);
    }
  });
}

function observeCards() {
  const cards = document.querySelectorAll('.meta-card');
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  cards.forEach(card => observer.observe(card));
}


// ── CARRUSEL ────────────────────────────────────────────────

function initCarousel() {
  const carousel = document.querySelector('.carousel');
  const track    = carousel?.querySelector('.track');
  if (!track) return;

  Array.from(track.querySelectorAll('.slide')).forEach(slide => {
    track.appendChild(slide.cloneNode(true));
  });

  const SPEED = 70;
  const halfW  = track.scrollWidth / 2;
  const dur    = halfW / SPEED;

  track.style.animation = `scroll-left ${dur}s linear infinite`;

  let isPaused       = false;
  let isDragging     = false;
  let pointerStartX  = 0;
  let touchStartY    = 0;
  let translateStart = 0;
  let lastTranslate  = 0;

  function getTranslateX() {
    return new DOMMatrix(getComputedStyle(track).transform).m41;
  }

  function resumeFrom(x) {
    const pos   = ((-x % halfW) + halfW) % halfW;
    const delay = -((pos / halfW) * dur);
    track.style.transform = '';
    track.style.animation = 'none';
    void track.offsetWidth;
    track.style.animation          = `scroll-left ${dur}s linear infinite`;
    track.style.animationDelay     = `${delay}s`;
    track.style.animationPlayState = isPaused ? 'paused' : 'running';
  }

  carousel.addEventListener('mouseenter', () => {
    isPaused = true;
    track.style.animationPlayState = 'paused';
  });
  carousel.addEventListener('mouseleave', () => {
    isPaused = false;
    if (!isDragging) track.style.animationPlayState = 'running';
  });

  function dragStart(clientX) {
    isDragging     = true;
    pointerStartX  = clientX;
    translateStart = getTranslateX();
    lastTranslate  = translateStart;
    track.style.animationPlayState = 'paused';
    track.style.transform = `translateX(${translateStart}px)`;
  }

  function dragMove(clientX) {
    if (!isDragging) return;
    lastTranslate = translateStart + (clientX - pointerStartX);
    track.style.transform = `translateX(${lastTranslate}px)`;
  }

  function dragEnd() {
    if (!isDragging) return;
    isDragging = false;
    resumeFrom(lastTranslate);
  }

  carousel.addEventListener('mousedown', e => {
    e.preventDefault();
    dragStart(e.clientX);
  });
  window.addEventListener('mousemove', e => dragMove(e.clientX));
  window.addEventListener('mouseup', dragEnd);

  carousel.addEventListener('touchstart', e => {
    touchStartY = e.touches[0].clientY;
    dragStart(e.touches[0].clientX);
  }, { passive: true });

  carousel.addEventListener('touchmove', e => {
    if (!isDragging) return;
    const dx = Math.abs(e.touches[0].clientX - pointerStartX);
    const dy = Math.abs(e.touches[0].clientY - touchStartY);
    if (dx > dy) e.preventDefault();
    dragMove(e.touches[0].clientX);
  }, { passive: false });

  carousel.addEventListener('touchend', dragEnd, { passive: true });
}


// ── COUNTDOWN ────────────────────────────────────────────────

function initCountdown() {
  const cdEl  = document.querySelector('.countdown');
  if (!cdEl) return;

  const eDias  = document.getElementById('cd-dias');
  const eHoras = document.getElementById('cd-horas');
  const eMin   = document.getElementById('cd-minutos');
  const eSeg   = document.getElementById('cd-segundos');

  function tick() {
    const diff = FECHA_COLECTA - Date.now();

    if (diff <= 0) {
      cdEl.innerHTML = '<p class="countdown__done">¡La colecta es hoy! Nos vemos en el punto de reunión. 🌾</p>';
      return;
    }

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000)  / 60000);
    const s = Math.floor((diff % 60000)    / 1000);

    if (eDias)  eDias.textContent  = String(d).padStart(2, '0');
    if (eHoras) eHoras.textContent = String(h).padStart(2, '0');
    if (eMin)   eMin.textContent   = String(m).padStart(2, '0');
    if (eSeg)   eSeg.textContent   = String(s).padStart(2, '0');

    setTimeout(tick, 1000);
  }

  tick();
}


// ── NAVBAR (hamburguesa) ────────────────────────────────────

function initNavbar() {
  const navbar  = document.querySelector('.navbar');
  const toggle  = document.querySelector('.navbar__toggle');
  const navLinks = document.querySelectorAll('.navbar__links a');
  if (!navbar || !toggle) return;

  function openMenu() {
    navbar.classList.add('navbar--open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Cerrar menú');
  }

  function closeMenu() {
    navbar.classList.remove('navbar--open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menú');
  }

  toggle.addEventListener('click', e => {
    e.stopPropagation();
    navbar.classList.contains('navbar--open') ? closeMenu() : openMenu();
  });

  // Cerrar al hacer clic en un enlace
  navLinks.forEach(link => link.addEventListener('click', closeMenu));

  // Cerrar al hacer clic fuera
  document.addEventListener('click', e => {
    if (!navbar.contains(e.target)) closeMenu();
  });

  // Cerrar con Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });
}


// ── Init ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderMetas();
  observeCards();
  initCarousel();
  initCountdown();
  initNavbar();
});
