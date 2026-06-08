import { describe, it, expect } from 'vitest';
import { AppUI } from '../main.js';

describe('Aside UI', () => {
  it('toggles aside open/close and updates aria-expanded', () => {
    const toggle = document.createElement('button');
    toggle.className = 'aside__toggle';
    toggle.setAttribute('aria-controls', 'site-aside');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.appendChild(toggle);

    const aside = document.createElement('aside');
    aside.id = 'site-aside';
    aside.className = 'aside';
    const close = document.createElement('button');
    close.className = 'aside__close';
    aside.appendChild(close);
    document.body.appendChild(aside);

    const ui = new AppUI();
    ui.setupAside();

    toggle.click();
    expect(aside.classList.contains('is-open')).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('true');

    toggle.click();
    expect(aside.classList.contains('is-open')).toBe(false);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
  });
});
