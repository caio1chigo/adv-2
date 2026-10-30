(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const loader = document.getElementById('loader');
  let loaderTimer;
  let dismissed = false;
  function dismissLoader() {
    if (dismissed) return;
    dismissed = true;
    clearTimeout(loaderTimer);
    loader.classList.add('is-leaving');
    setTimeout(() => { loader.hidden = true; }, reduced.matches ? 0 : 550);
  }
  // Never blocks scrolling or interaction. Hidden by default if JS is unavailable.
  if (!reduced.matches) {
    loader.hidden = false;
    loaderTimer = setTimeout(dismissLoader, 1800);
    window.addEventListener('load', () => setTimeout(dismissLoader, 450), { once: true });
    if (document.readyState === 'complete') setTimeout(dismissLoader, 450);
    document.addEventListener('keydown', dismissLoader, { once: true });
    document.addEventListener('pointerdown', dismissLoader, { once: true });
  }

  const nav = document.getElementById('nav');
  const toggle = document.querySelector('.menu-toggle');
  const header = document.querySelector('.header');
  const backTop = document.querySelector('.back-top');
  function closeMenu() {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
  }
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  });
  nav.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('click', e => { if (!e.target.closest('.header')) closeMenu(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) { closeMenu(); toggle.focus(); }
  });
  window.addEventListener('resize', () => { if (innerWidth > 900) closeMenu(); });
  const navLinks = [...nav.querySelectorAll('a:not(.mobile-cta)')];
  const sections = [...document.querySelectorAll('.section-anchor')];
  let pending = false;
  function updateScroll() {
    pending = false;
    header.classList.toggle('scrolled', scrollY > 20);
    backTop.hidden = scrollY < 700;
    let current = sections[0].id;
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= header.offsetHeight + 150) current = section.id;
    }
    navLinks.forEach(link => {
      if (link.getAttribute('href') === '#' + current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', () => {
    if (!pending) { pending = true; requestAnimationFrame(updateScroll); }
  }, { passive: true });
  updateScroll();
  document.getElementById('year').textContent = new Date().getFullYear();

  // Local demonstration: no fetch, backend, analytics or browser storage.
  const form = document.getElementById('contact-form');
  const topic = document.getElementById('assunto');
  document.querySelectorAll('[data-topic]').forEach(link => link.addEventListener('click', () => {
    topic.value = link.dataset.topic;
  }));
  let lastFocus;
  function openDialog(dialog, trigger) {
    if (!dialog || typeof dialog.showModal !== 'function') return false;
    lastFocus = trigger || document.activeElement;
    dialog.showModal();
    return true;
  }
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    document.getElementById('form-status').textContent = 'Demonstração concluída. Nenhuma mensagem foi enviada ou armazenada.';
    openDialog(document.getElementById('message-dialog'), event.submitter);
  });
  document.querySelector('[data-open-privacy]').addEventListener('click', event => {
    const dialog = document.getElementById('privacy-dialog');
    if (!openDialog(dialog, event.currentTarget)) {
      alert('Modelo fictício de portfólio. Não há envio nem armazenamento de formulários. Google Fonts e a hospedagem podem gerar registros de acesso.');
    }
  });
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.querySelectorAll('[data-close-dialog]').forEach(button => button.addEventListener('click', () => dialog.close()));
    dialog.addEventListener('close', () => { if (lastFocus) lastFocus.focus(); });
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const r = dialog.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
    });
  });

  let observer;
  const reveal = [...document.querySelectorAll('[data-reveal]')];
  function showAll() {
    document.documentElement.classList.remove('motion-ready');
    if (observer) observer.disconnect();
    reveal.forEach(el => el.classList.add('is-visible'));
  }
  if (!reduced.matches && 'IntersectionObserver' in window) {
    try {
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
        });
      }, { threshold: 0, rootMargin: '0px 0px -15px 0px' });
      document.querySelectorAll('[data-stagger]').forEach(group => {
        [...group.children].forEach((el, index) => el.style.setProperty('--delay', `${index % 3 * 100}ms`));
      });
      document.documentElement.classList.add('motion-ready');
      void document.body.offsetWidth;
      reveal.forEach(el => observer.observe(el));
      document.addEventListener('focusin', event => {
        const parent = event.target.closest('[data-reveal]');
        if (parent) parent.classList.add('is-visible');
      });
      document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', () => {
        const target = document.getElementById(link.getAttribute('href').slice(1));
        if (target) {
          target.classList.add('is-visible');
          target.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-visible'));
        }
      }));
    } catch (error) { showAll(); }
  }
  if (reduced.addEventListener) reduced.addEventListener('change', event => {
    if (event.matches) { dismissLoader(); showAll(); }
  });
})();
/* Expansão dos cards de áreas de atuação */
(() => {
  const buttons = document.querySelectorAll(".area-toggle");

  function setExpanded(button, expanded) {
    const panelId = button.getAttribute("aria-controls");
    const panel = document.getElementById(panelId);

    if (!panel) return;

    button.setAttribute("aria-expanded", String(expanded));

    button.closest(".area-card")
      ?.classList.toggle("is-expanded", expanded);

    panel.hidden = !expanded;

    const label = button.querySelector(".area-toggle-label");

    if (label) {
      label.textContent = expanded
        ? "Ocultar detalhes"
        : "Ver detalhes";
    }
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const shouldOpen =
        button.getAttribute("aria-expanded") !== "true";

      /* Fecha os outros cards antes de abrir o selecionado */
      buttons.forEach((otherButton) => {
        if (otherButton !== button) {
          setExpanded(otherButton, false);
        }
      });

      setExpanded(button, shouldOpen);
    });
  });
})();