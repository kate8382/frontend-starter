// import api from './api';

class AppUI {
  burger: HTMLButtonElement | null;
  nav: HTMLElement | null;
  yearEl: HTMLElement | null;
  constructor() {
    this.burger = document.querySelector('.nav__burger');
    this.nav = document.getElementById('main-nav');
    this.yearEl = document.getElementById('year');
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
    this.setupGlobalListeners();
  }

  setupBurger() {
    if (!this.burger || !this.nav) return;
    // ensure initial state
    this.burger.setAttribute('aria-expanded', 'false');
    this.nav.classList.remove('is-open');

    this.burger.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleMenu();
    });
  }

  openMenu() {
    if (!this.burger || !this.nav) return;
    this.burger.setAttribute('aria-expanded', 'true');
    this.burger.classList.add('is-active');
    this.burger.setAttribute('aria-label', 'Close menu');
    this.nav.classList.add('is-open');
  }

  closeMenu() {
    if (!this.burger || !this.nav) return;
    this.burger.setAttribute('aria-expanded', 'false');
    this.burger.classList.remove('is-active');
    this.burger.setAttribute('aria-label', 'Open menu');
    this.nav.classList.remove('is-open');
  }

  toggleMenu() {
    if (!this.burger) return;
    const expanded = this.burger.getAttribute('aria-expanded') === 'true';
    if (expanded) this.closeMenu();
    else this.openMenu();
  }

  setupGlobalListeners() {
    // click outside to close
    document.addEventListener('click', (e) => {
      const target = e.target as Node;
      if (!this.nav || !this.burger) return;
      if (!this.nav.contains(target) && !this.burger.contains(target)) this.closeMenu();
    });

    // Esc to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeMenu();
    });
  }
}

const app = new AppUI();
document.addEventListener('DOMContentLoaded', () => app.init());

export { app };
