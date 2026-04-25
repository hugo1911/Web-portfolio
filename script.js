/* =====================================================
   PORTFOLIO — Hugo Manzano
   script.js — Interactividad y animaciones

   Secciones:
   1. Cursor personalizado
   2. Navegación (scroll + mobile menú)
   3. Smooth scroll
   4. Animaciones de revelado (Intersection Observer)
   5. Parallax sutil en el hero
   6. Link activo en nav según sección visible
   ===================================================== */

/* ─── 1. Cursor personalizado ────────────────────────
   Funciona solo en dispositivos con mouse (pointer fino).
   Un punto sigue exactamente el cursor.
   Un anillo sigue con suavidad (interpolación).
   Se agranda al pasar sobre elementos interactivos.
─────────────────────────────────────────────────────── */
(function initCursor() {
  const dot  = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');

  // Verificar que el dispositivo tenga mouse (no touch-only)
  const hasPointer = window.matchMedia('(pointer: fine)').matches;
  if (!hasPointer || !dot || !ring) return;

  let mx = 0, my = 0;   // Posición real del mouse
  let rx = 0, ry = 0;   // Posición suavizada del anillo
  let raf;

  // Seguir el mouse con el punto (inmediato) y el anillo (suave)
  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  function animateRing() {
    // Interpolación lineal para el movimiento suave del anillo
    rx += (mx - rx) * 0.11;
    ry += (my - ry) * 0.11;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    raf = requestAnimationFrame(animateRing);
  }
  animateRing();

  // Agrandar anillo sobre elementos interactivos
  const interactives = document.querySelectorAll(
    'a, button, .project-card, .stat-card, .skill-tag, .contact-link'
  );
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('hovered'));
    el.addEventListener('mouseleave', () => ring.classList.remove('hovered'));
  });

  // Ocultar cursor al salir de la ventana
  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  });
})();


/* ─── 2. Navegación ──────────────────────────────────
   a) Agrega clase .scrolled al nav cuando el usuario
      baja más de 60px (activa el fondo translúcido).
   b) Menú hamburguesa para mobile.
─────────────────────────────────────────────────────── */
(function initNav() {
  const nav       = document.getElementById('nav');
  const toggle    = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('navMobile');

  if (!nav) return;

  // a) Clase scrolled
  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // Llamar al cargar por si la página ya estaba scrolleada

  // b) Menú mobile — abrir/cerrar
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', isOpen);
      mobileMenu.setAttribute('aria-hidden', !isOpen);
      // Bloquear scroll del body cuando el menú está abierto
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Cerrar menú al tocar un link dentro
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      });
    });
  }
})();


/* ─── 3. Smooth scroll ───────────────────────────────
   Intercepta todos los links internos (#sección) y
   desplaza la página teniendo en cuenta la altura del nav.
─────────────────────────────────────────────────────── */
(function initSmoothScroll() {
  const nav = document.getElementById('nav');

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      // Offset: altura del nav para no quedar tapado
      const navH   = nav ? nav.offsetHeight : 0;
      const top    = target.getBoundingClientRect().top + window.scrollY - navH;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ─── 4. Animaciones de revelado (Intersection Observer)
   Añade la clase .is-visible a los elementos con .reveal
   cuando estos entran en el viewport.
   El CSS se encarga de la transición fade-up.
─────────────────────────────────────────────────────── */
(function initReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        // Dejar de observar para no repetir la animación
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,                   // Activar cuando el 10% sea visible
    rootMargin: '0px 0px -40px 0px'   // Margen inferior para que se active ligeramente antes
  });

  elements.forEach(el => observer.observe(el));
})();


/* ─── 5. Parallax sutil en el hero ──────────────────
   El nombre del hero se desplaza lentamente al hacer
   scroll, creando profundidad. Desactivado en mobile
   para mejor rendimiento.
─────────────────────────────────────────────────────── */
(function initParallax() {
  const heroName = document.querySelector('.hero-name');
  const heroContent = document.querySelector('.hero-content');
  if (!heroName || !heroContent) return;

  function onScroll() {
    // Solo en pantallas anchas (desktop)
    if (window.innerWidth < 768) return;

    const scrollY   = window.scrollY;
    const vhHeight  = window.innerHeight;

    if (scrollY < vhHeight) {
      const progress = scrollY / vhHeight;
      // Desplazamiento vertical suave
      heroContent.style.transform = `translateY(${scrollY * 0.12}px)`;
      // Fade del contenido al hacer scroll
      heroContent.style.opacity = 1 - progress * 1.4;
    } else {
      heroContent.style.transform = '';
      heroContent.style.opacity   = '';
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();


/* ─── 6. Link activo en nav según sección visible ────
   Resalta el link del nav que corresponde a la sección
   que el usuario está viendo actualmente.
─────────────────────────────────────────────────────── */
(function initActiveNav() {
  const sections  = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-links a');

  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        const isActive = link.getAttribute('href') === `#${id}`;
        // Aplicar color más claro al link activo
        link.style.color = isActive ? 'var(--text-primary)' : '';
      });
    });
  }, {
    threshold: 0.45  // La sección debe ocupar ≥45% del viewport
  });

  sections.forEach(s => observer.observe(s));
})();
