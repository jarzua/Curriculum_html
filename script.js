/* Javier David Ripoll — interacciones de la hoja de vida */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- entrada del hero ---------- */
  requestAnimationFrame(() => document.body.classList.add('is-loaded'));
  $('#year').textContent = new Date().getFullYear();

  /* ---------- reveal al hacer scroll ---------- */
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      revealIO.unobserve(e.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  $$('.reveal, .sec-head').forEach((el) => revealIO.observe(el));

  /* ---------- contadores ---------- */
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const end = +el.dataset.count;
      countIO.unobserve(el);
      if (reduced) { el.textContent = end; return; }
      const dur = Math.min(1800, 600 + end * 8);
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min(1, (t - t0) / dur);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach((el) => countIO.observe(el));

  /* ---------- perfil: palabras que se encienden con el scroll ---------- */
  const perfil = $('[data-words]');
  const highlight = /^(SENA|C#|.NET|Vue.js|SQL|Server|producción|Iberoamericana|Frontend|Backend|Claude|Gemini|skills|agentes|ciberseguridad)/i;
  const words = perfil.textContent.trim().split(/\s+/);
  perfil.innerHTML = words.map((w) => `<span class="w${highlight.test(w) ? ' hl' : ''}">${w}</span>`).join(' ');
  const wordEls = $$('.w', perfil);

  /* ---------- timeline de educación ---------- */
  const tl = $('.timeline');
  const tlLine = $('.timeline__line span');

  /* ---------- nav, progreso, sección activa, parallax ---------- */
  const nav = $('.nav');
  const bar = $('.progress span');
  const fab = $('.fab');
  const sections = $$('[data-section]');
  const links = $$('.nav__links a, .dots a');
  const heroPhoto = $('.hero__photo img');
  let lastY = 0;
  let ticking = false;

  const onScroll = () => {
    const y = scrollY;
    const vh = innerHeight;
    const max = document.documentElement.scrollHeight - vh;
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

    nav.classList.toggle('is-solid', y > 40);
    nav.classList.toggle('is-hidden', y > lastY && y > vh * 0.8);
    fab.classList.toggle('is-visible', y > vh * 0.7);
    lastY = y;

    // sección activa
    let current = sections[0].id;
    sections.forEach((s) => { if (s.getBoundingClientRect().top < vh * 0.4) current = s.id; });
    links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + current));

    // palabras del perfil
    const r = perfil.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
    const lit = Math.round(p * wordEls.length);
    wordEls.forEach((w, i) => w.classList.toggle('on', i < lit));

    // línea del timeline
    const tr = tl.getBoundingClientRect();
    const tp = Math.min(1, Math.max(0, (vh * 0.8 - tr.top) / (tr.height * 0.6)));
    tlLine.style.setProperty('--p', tp);

    // parallax suave en la foto
    if (!reduced && y < vh) heroPhoto.style.translate = `0 ${y * 0.12}px`;

    ticking = false;
  };
  addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* ---------- foco de luz en el hero ---------- */
  const hero = $('.hero');
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    hero.style.setProperty('--mx', `${e.clientX - r.left}px`);
    hero.style.setProperty('--my', `${e.clientY - r.top}px`);
  });

  /* ---------- tabs genéricos ---------- */
  const setupTabs = (buttons, key, onChange) => {
    const select = (btn, focus) => {
      buttons.forEach((b) => b.setAttribute('aria-selected', String(b === btn)));
      onChange(btn.dataset[key]);
      if (focus) btn.focus();
    };
    buttons.forEach((btn, i) => {
      btn.addEventListener('click', () => select(btn));
      btn.addEventListener('keydown', (e) => {
        const dir = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (!dir) return;
        e.preventDefault();
        select(buttons[(i + dir + buttons.length) % buttons.length], true);
      });
    });
    return select;
  };

  /* ---------- experiencia: funciones ↔ maqueta del módulo ---------- */
  const taskBtns = $$('.tasks button');
  const panels = $$('.mock [data-panel]');
  const sides = $$('.mock [data-side]');
  const showView = (v) => {
    panels.forEach((p) => p.classList.toggle('is-active', p.dataset.panel === v));
    sides.forEach((s) => s.classList.toggle('is-active', s.dataset.side === v));
  };
  const selectTask = setupTabs(taskBtns, 'view', showView);
  showView('stack');

  // recorrido automático mientras la sección está visible y nadie ha interactuado
  let auto = null, touched = false, idx = 0;
  const stopAuto = () => { touched = true; clearInterval(auto); auto = null; };
  taskBtns.forEach((b) => {
    b.addEventListener('click', stopAuto);
    b.addEventListener('pointerenter', () => { if (matchMedia('(hover: hover)').matches) { stopAuto(); selectTask(b); } });
  });
  if (!reduced) {
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !touched && !auto) {
        auto = setInterval(() => { idx = (idx + 1) % taskBtns.length; selectTask(taskBtns[idx]); }, 3200);
      } else if (!e.isIntersecting && auto) { clearInterval(auto); auto = null; }
    }, { threshold: 0.35 }).observe($('.job__grid'));
  }

  /* ---------- conocimientos: tabs ---------- */
  const panes = $$('.pane');
  setupTabs($$('.stack__tabs button'), 'tab', (t) => {
    panes.forEach((p) => p.classList.toggle('is-active', p.dataset.pane === t));
  });

  /* ---------- certificados: desactiva el botón si el PDF aún no está subido ---------- */
  const certLinks = $$('[data-cert]');
  const checked = new Map();
  certLinks.forEach((a) => {
    const href = a.getAttribute('href');
    if (!checked.has(href)) {
      checked.set(href, fetch(href, { method: 'HEAD' }).then((r) => r.ok).catch(() => location.protocol === 'file:'));
    }
    checked.get(href).then((ok) => {
      if (ok) return;
      a.classList.add('is-missing');
      a.setAttribute('aria-disabled', 'true');
      a.setAttribute('tabindex', '-1');
      if (a.classList.contains('btn')) a.querySelector('span').textContent = 'Certificado próximamente';
    });
  });

  /* ---------- copiar correo ---------- */
  const toast = $('.toast');
  let toastT;
  const say = (msg) => {
    toast.textContent = msg;
    toast.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(() => toast.classList.remove('is-on'), 2200);
  };
  $$('[data-copy]').forEach((b) => b.addEventListener('click', async (e) => {
    e.preventDefault();
    try { await navigator.clipboard.writeText(b.dataset.copy); say('Correo copiado ✓'); }
    catch { say(b.dataset.copy); }
  }));

  /* ---------- aviso al descargar la hoja de vida ---------- */
  $$('a[href$="HV_Javier_David_Ripoll.pdf"]').forEach((a) =>
    a.addEventListener('click', () => say('Descargando hoja de vida…')));
})();
