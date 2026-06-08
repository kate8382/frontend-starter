import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';

describe('DOM smoke', () => {
  it('loads basic document', () => {
    const dom = new JSDOM(`<!doctype html><html><body><div id="app"></div></body></html>`);
    expect(dom.window.document.getElementById('app')).not.toBeNull();
  });
});
