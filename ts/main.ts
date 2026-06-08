// import api from './api';

class AppUI {
  burger: HTMLButtonElement | null;
  nav: HTMLElement | null;
  asideToggle: HTMLElement | null;
  asideEl: HTMLElement | null;
  asideOpen: boolean;
  yearEl: HTMLElement | null;
  constructor() {
    this.burger = document.querySelector('.nav__burger');
    this.nav = document.getElementById('main-nav');
    this.asideToggle = document.querySelector('.aside__toggle');
    this.asideEl = document.getElementById('site-aside');
    this.yearEl = document.getElementById('year');
    this.asideOpen = false;
  }

  init() {
    if (this.yearEl) this.yearEl.textContent = String(new Date().getFullYear());

    // compute header height and expose as CSS variable for positioning mobile menu
    const header = document.querySelector('.header') as HTMLElement | null;
    if (header) {
      const h = Math.ceil(header.getBoundingClientRect().height);
      document.documentElement.style.setProperty('--header-height', `${h}px`);
    }

    this.setupBurger();
    this.setupAside();
    this.setupGlobalListeners();
  }

  setupAside() {
    const asideEl = this.asideEl;
    const asideToggle = this.asideToggle;
    if (!asideEl || !asideToggle) return;

    const closeBtn = asideEl.querySelector('.aside__close') as HTMLElement | null;
    // ensure initial state
    asideEl.classList.remove('is-open');
    asideToggle.setAttribute('aria-expanded', 'false');

    asideToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const expanded = asideToggle.getAttribute('aria-expanded') === 'true';
      if (expanded) this.closeAside();
      else this.openAside();
    });

    closeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.closeAside();
    });

    // click outside to close aside (keeps behavior consistent)
    document.addEventListener('click', (e) => {
      const target = e.target as Node;
      if (!asideEl) return;
      if (!asideEl.contains(target) && !asideToggle.contains(target)) this.closeAside();
    });

    // Esc to close aside
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeAside();
    });
  }

  openAside() {
    const asideEl = this.asideEl;
    const asideToggle = this.asideToggle;
    if (!asideEl || !asideToggle) return;
    asideEl.classList.add('is-open');
    asideToggle.setAttribute('aria-expanded', 'true');
    this.asideOpen = true;
    const firstFocusable = asideEl.querySelector('a, button, [tabindex]') as HTMLElement | null;
    firstFocusable?.focus();
  }

  closeAside() {
    const asideEl = this.asideEl;
    const asideToggle = this.asideToggle;
    if (!asideEl || !asideToggle) return;
    asideEl.classList.remove('is-open');
    asideToggle.setAttribute('aria-expanded', 'false');
    this.asideOpen = false;
    asideToggle.focus();
  }

  setupBurger() {
    const burger = this.burger;
    const nav = this.nav;
    const asideEl = this.asideEl;
    if (!burger || !nav) return;
    // ensure initial state
    burger.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');

    burger.addEventListener('click', (e) => {
      e.stopPropagation();
      // on small screens, prefer showing the aside off-canvas if it exists
      const isMobile = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
      if (isMobile && asideEl) {
        const expanded = burger.getAttribute('aria-expanded') === 'true';
        if (expanded) {
          this.closeAside();
          this.closeMenu();
        } else {
          this.openAside();
          this.closeMenu();
          // keep the burger aria in sync with aside state
          burger.setAttribute('aria-expanded', this.asideOpen ? 'true' : 'false');
        }
        return;
      }

      this.toggleMenu();
    });
  }

  openMenu() {
    const burger = this.burger;
    const nav = this.nav;
    if (!burger || !nav) return;
    burger.setAttribute('aria-expanded', 'true');
    burger.classList.add('is-active');
    burger.setAttribute('aria-label', 'Close menu');
    nav.classList.add('is-open');
  }

  closeMenu() {
    const burger = this.burger;
    const nav = this.nav;
    if (!burger || !nav) return;
    burger.setAttribute('aria-expanded', 'false');
    burger.classList.remove('is-active');
    burger.setAttribute('aria-label', 'Open menu');
    nav.classList.remove('is-open');
  }

  toggleMenu() {
    const burger = this.burger;
    if (!burger) return;
    const expanded = burger.getAttribute('aria-expanded') === 'true';
    if (expanded) this.closeMenu();
    else this.openMenu();
  }

  setupGlobalListeners() {
    // click outside to close
    document.addEventListener('click', (e) => {
      const target = e.target as Node;
      if (!this.nav || !this.burger) return;
      if (!this.nav.contains(target) && !this.burger.contains(target)) {
        this.closeMenu();
        this.closeAside();
      }
    });

    // Esc to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeMenu();
      if (e.key === 'Escape') this.closeAside();
    });
  }
}

const app = new AppUI();
document.addEventListener('DOMContentLoaded', () => app.init());

export { app, AppUI };
