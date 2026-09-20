/* ==========================================================================
   CAFÉ AURORA — Scripts
   Menu mobile, rolagem com destaque de link ativo, status de horário,
   galeria com lightbox, animação de entrada por seção e ano do rodapé.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavToggle();
  initActiveNavOnScroll();
  initTopAnchorFix();
  initHorario();
  initGalleryLightbox();
  initRevealOnScroll();
  document.getElementById('anoAtual').textContent = new Date().getFullYear();
});

/* ---------- Correção: "Início" e "Voltar ao topo" ----------
   O cabeçalho (#topo) usa position: sticky, então ele já fica visualmente
   "no topo" e o navegador não realiza a rolagem padrão da âncora (a URL
   muda para #topo, mas a página não se move). Forçamos a rolagem aqui. */
function initTopAnchorFix(){
  const topLinks = document.querySelectorAll('a[href="#topo"]');
  if (!topLinks.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  topLinks.forEach(link => {
    link.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  });
}

/* ---------- Menu mobile ---------- */
function initNavToggle(){
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('navMenu');
  if (!toggle || !nav) return;

  const closeNav = () => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu de navegação');
  };

  const openNav = () => {
    nav.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Fechar menu de navegação');
  };

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.contains('is-open');
    isOpen ? closeNav() : openNav();
  });

  // Fecha o menu ao clicar em um link (útil no celular)
  nav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', closeNav);
  });

  // Fecha com a tecla Esc
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeNav();
  });
}

/* ---------- Destaque do link ativo conforme a rolagem ---------- */
function initActiveNavOnScroll(){
  const sections = document.querySelectorAll('main section[id], header#topo');
  const links = document.querySelectorAll('.nav-link');
  if (!sections.length || !links.length) return;

  const setActive = (id) => {
    links.forEach(link => {
      const match = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('is-active', match);
      if (match) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        setActive(entry.target.id);
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  sections.forEach(section => observer.observe(section));
}

/* ---------- Status de horário de funcionamento ---------- */
function initHorario(){
  const statusEl = document.getElementById('horarioStatus');
  const rows = document.querySelectorAll('.horario-row');
  if (!statusEl || !rows.length) return;

  const now = new Date();
  const day = now.getDay(); // 0 = domingo ... 6 = sábado
  const minutesNow = now.getHours() * 60 + now.getMinutes();

  const schedule = {
    0: [9 * 60, 18 * 60],
    1: [8 * 60, 20 * 60],
    2: [8 * 60, 20 * 60],
    3: [8 * 60, 20 * 60],
    4: [8 * 60, 20 * 60],
    5: [8 * 60, 20 * 60],
    6: [9 * 60, 21 * 60],
  };

  const [abre, fecha] = schedule[day];
  const aberto = minutesNow >= abre && minutesNow < fecha;

  statusEl.textContent = aberto
    ? 'Estamos abertos agora.'
    : 'Estamos fechados no momento.';

  rows.forEach(row => {
    const dias = row.dataset.dias.split(',').map(Number);
    if (dias.includes(day)) {
      row.classList.add('is-today');
    }
  });
}

/* ---------- Galeria: lightbox acessível ---------- */
function initGalleryLightbox(){
  const items = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const closeBtn = document.getElementById('lightboxClose');
  if (!items.length || !lightbox) return;

  let lastFocused = null;

  const openLightbox = (item) => {
    const img = item.querySelector('img');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightboxCaption.textContent = item.dataset.caption || '';
    lightbox.hidden = false;
    lastFocused = document.activeElement;
    closeBtn.focus();
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightbox.hidden = true;
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  };

  items.forEach(item => {
    item.setAttribute('aria-label', `Ampliar imagem: ${item.dataset.caption || ''}`);
    item.addEventListener('click', () => openLightbox(item));
  });

  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
  });
}

/* ---------- Revelação suave das seções ao rolar ---------- */
function initRevealOnScroll(){
  const targets = document.querySelectorAll('.section-heading, .sobre-copy, .sobre-figure, .horario-card, .localizacao-copy');
  if (!targets.length) return;

  targets.forEach(el => el.classList.add('reveal'));

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    targets.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  targets.forEach(el => observer.observe(el));
}
