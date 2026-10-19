(() => {
  'use strict';

  const initialize = () => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const header = document.getElementById('site-header');
    const progress = document.getElementById('scroll-progress');
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    let menuOpen = false;
    let previousOverflow = '';
    let scrollScheduled = false;

    const closeMenu = () => {
      if (!menuOpen) return;
      menuOpen = false;
      menuToggle?.setAttribute('aria-expanded', 'false');
      menuToggle?.setAttribute('aria-label', 'Open navigation');
      mobileMenu?.classList.remove('is-open');
      mobileMenu?.setAttribute('aria-hidden', 'true');
      if (mobileMenu) mobileMenu.inert = true;
      document.body.style.overflow = previousOverflow;
    };

    if (menuToggle && mobileMenu) {
      menuToggle.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
      mobileMenu.inert = true;
      menuToggle.addEventListener('click', () => {
        if (menuOpen) {
          closeMenu();
          return;
        }
        menuOpen = true;
        previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        menuToggle.setAttribute('aria-expanded', 'true');
        menuToggle.setAttribute('aria-label', 'Close navigation');
        mobileMenu.classList.add('is-open');
        mobileMenu.setAttribute('aria-hidden', 'false');
        mobileMenu.inert = false;
        mobileMenu.querySelector('a[href]')?.focus({ preventScroll: true });
      });
      mobileMenu.addEventListener('click', (event) => {
        const link = event.target.closest('a[href]');
        if (!link) return;
        closeMenu();
        const destination = new URL(link.href, window.location.href);
        if (destination.origin !== window.location.origin
          || destination.pathname !== window.location.pathname
          || destination.search !== window.location.search
          || !destination.hash) return;
        let target;
        try {
          target = document.getElementById(decodeURIComponent(destination.hash.slice(1)));
        } catch {
          return;
        }
        if (!target) return;
        window.requestAnimationFrame(() => {
          const needsTabIndex = !target.hasAttribute('tabindex') && target.tabIndex < 0;
          if (needsTabIndex) {
            target.setAttribute('tabindex', '-1');
            target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
          }
          target.focus({ preventScroll: true });
        });
      });
      document.addEventListener('keydown', (event) => {
        if (!menuOpen) return;
        if (event.key === 'Escape') {
          event.preventDefault();
          closeMenu();
          menuToggle.focus();
          return;
        }
        if (event.key !== 'Tab') return;
        const focusable = [menuToggle, ...mobileMenu.querySelectorAll('a[href]')]
          .filter((element) => !element.disabled && element.getClientRects().length > 0);
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const current = document.activeElement;
        if (event.shiftKey && (current === first || !focusable.includes(current))) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && (current === last || !focusable.includes(current))) {
          event.preventDefault();
          first?.focus();
        }
      });
      window.addEventListener('resize', () => {
        if (window.innerWidth > 760) closeMenu();
      }, { passive: true });
    }

    const updateScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      header?.classList.toggle('is-scrolled', scrollTop > 40);
      if (progress) {
        const available = document.documentElement.scrollHeight - window.innerHeight;
        const percent = available > 0 ? Math.min(100, Math.max(0, scrollTop / available * 100)) : 0;
        progress.style.width = `${percent}%`;
      }
      scrollScheduled = false;
    };
    const scheduleScroll = () => {
      if (scrollScheduled) return;
      scrollScheduled = true;
      window.requestAnimationFrame(updateScroll);
    };
    window.addEventListener('scroll', scheduleScroll, { passive: true });
    window.addEventListener('resize', scheduleScroll, { passive: true });
    updateScroll();

    const reveals = document.querySelectorAll('.reveal');
    if (reducedMotion || !('IntersectionObserver' in window)) {
      reveals.forEach((element) => element.classList.add('is-visible'));
    } else {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
      reveals.forEach((element) => observer.observe(element));
    }

    const filterButtons = [...document.querySelectorAll('[data-filter]')];
    const projects = [...document.querySelectorAll('.project-card[data-category]')];
    filterButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.classList.contains('is-active')));
      button.addEventListener('click', (event) => {
        event.preventDefault();
        const filter = button.dataset.filter;
        filterButtons.forEach((other) => {
          const active = other === button;
          other.classList.toggle('is-active', active);
          other.setAttribute('aria-pressed', String(active));
        });
        projects.forEach((project) => {
          project.hidden = filter !== 'all' && project.dataset.category !== filter;
        });
        scheduleScroll();
      });
    });

    const dialog = document.getElementById('project-dialog');
    const dialogTitle = document.getElementById('dialog-title');
    const dialogMaterial = document.getElementById('dialog-material');
    const dialogDescription = document.getElementById('dialog-description');
    const dialogImage = document.getElementById('dialog-image');
    let dialogTrigger = null;

    if (dialog && typeof dialog.showModal === 'function') {
      document.addEventListener('click', (event) => {
        const trigger = event.target.closest('[data-project]');
        if (!trigger) return;
        const card = trigger.closest('.project-card') || trigger;
        const metadata = { ...card.dataset, ...trigger.dataset };
        const cardImage = card.querySelector('img');
        const dialogKicker = dialog.querySelector('.dialog-kicker');
        if (dialogKicker) dialogKicker.textContent = metadata.kicker || 'DESIGN STUDY / CONCEPT IMAGERY';
        if (dialogTitle) dialogTitle.textContent = metadata.title || 'Custom commission';
        if (dialogMaterial) dialogMaterial.textContent = metadata.material || '';
        if (dialogDescription) dialogDescription.textContent = metadata.description || '';
        if (dialogImage) {
          const imageSource = metadata.image || cardImage?.currentSrc || cardImage?.src;
          if (imageSource) {
            dialogImage.src = imageSource;
            dialogImage.alt = metadata.imageAlt || cardImage?.alt || metadata.title || 'Custom woodwork';
            dialogImage.hidden = false;
          } else {
            dialogImage.removeAttribute('src');
            dialogImage.alt = '';
            dialogImage.hidden = true;
          }
        }
        event.preventDefault();
        closeMenu();
        dialogTrigger = trigger;
        if (!dialog.open) dialog.showModal();
      });
      dialog.querySelectorAll('[data-close-dialog]').forEach((button) => {
        button.addEventListener('click', () => dialog.close());
      });
      dialog.addEventListener('click', (event) => {
        if (event.target !== dialog) return;
        const bounds = dialog.getBoundingClientRect();
        const outside = event.clientX < bounds.left || event.clientX > bounds.right
          || event.clientY < bounds.top || event.clientY > bounds.bottom;
        if (outside) dialog.close();
      });
      dialog.addEventListener('close', () => {
        if (dialogTrigger?.isConnected) dialogTrigger.focus({ preventScroll: true });
        dialogTrigger = null;
      });
    }

    const form = document.getElementById('commission-form');
    const formStatus = document.getElementById('form-status');
    if (form) {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!form.reportValidity()) return;
        if (formStatus) {
          formStatus.textContent = 'This preview does not send inquiries yet. Your project details are ready for the live site.';
          formStatus.hidden = false;
          formStatus.setAttribute('role', 'status');
          formStatus.setAttribute('tabindex', '-1');
          formStatus.focus({ preventScroll: true });
        }
      });
    }

    const year = document.getElementById('year');
    if (year) year.textContent = String(new Date().getFullYear());
    document.documentElement.classList.add('js-ready');
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }
})();
