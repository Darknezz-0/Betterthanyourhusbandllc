// @vitest-environment happy-dom
import { act, createElement } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

// Keep unrelated forms, galleries, and reviews out of this navigation test.
// App's header, footer, routes, homepage section, and scroll manager stay real.
vi.mock('@/pages/QuoteForm', () => ({ QuoteForm: () => null }));
vi.mock('@/components/CustomerReviews', () => ({ CustomerReviews: () => null }));
vi.mock('@/components/BeforeAfterProjects', () => ({ BeforeAfterProjects: () => null }));

let root: Root;
let container: HTMLDivElement;
let frames: Map<number, FrameRequestCallback>;
let nextFrame: number;
const scrollIntoView = vi.fn();
const scrollTo = vi.fn();

async function navigate(href: string) {
  await act(async () => {
    window.history.pushState(null, '', href);
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
}

async function mountAt(href: string) {
  window.history.replaceState(null, '', href);
  await act(async () => root.render(createElement(App)));
}

async function flushFrames() {
  await act(async () => {
    const pending = [...frames.values()];
    frames.clear();
    for (const callback of pending) callback(0);
  });
}

function expectServicesScroll() {
  const section = container.querySelector('section#services');
  expect(section, 'homepage must contain exactly one Services section').not.toBeNull();
  expect(container.querySelectorAll('#services')).toHaveLength(1);
  expect(section?.textContent).toContain('Handyman services.');
  expect(scrollIntoView).toHaveBeenCalledExactlyOnceWith({ behavior: 'auto', block: 'start' });
  expect(scrollIntoView.mock.contexts[0]).toBe(section);
  expect(scrollTo).not.toHaveBeenCalled();
}

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  frames = new Map();
  nextFrame = 0;
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    frames.set(++nextFrame, callback);
    return nextFrame;
  });
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => { frames.delete(id); });
  vi.spyOn(Element.prototype, 'scrollIntoView').mockImplementation(scrollIntoView);
  vi.spyOn(window, 'scrollTo').mockImplementation(scrollTo);
  scrollIntoView.mockClear();
  scrollTo.mockClear();
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Services anchor navigation', () => {
  it.each([
    ['/about', 'link-nav-services'],
    ['/contact', 'link-footer-services'],
    ['/about', 'link-mobile-services'],
  ])('%s: %s resolves to the homepage Services section', async (from, testId) => {
    await mountAt(from);
    await flushFrames();
    if (testId === 'link-mobile-services') {
      await act(async () => container.querySelector<HTMLButtonElement>('[data-testid="button-mobile-menu"]')!.click());
    }
    const link = container.querySelector<HTMLAnchorElement>(`[data-testid="${testId}"]`);
    expect(link?.tagName).toBe('A');
    expect(link?.getAttribute('href')).toBe('/#services');
    expect(new URL(link!.href).pathname).toBe('/');
    expect(new URL(link!.href).hash).toBe('#services');
    scrollTo.mockClear();
    // Services uses native anchors (a document navigation, not a Wouter Link).
    // Reproduce the destination load; a DOM emulator cannot perform real loads.
    await act(async () => root.unmount());
    root = createRoot(container);
    await mountAt(link!.href);
    await flushFrames();
    expectServicesScroll();
  });

  it('redirects legacy /services to /#services and scrolls to the mounted section', async () => {
    await mountAt('/about');
    await flushFrames();
    scrollTo.mockClear();
    await navigate('/services');
    expect(window.location.pathname + window.location.hash).toBe('/#services');
    await flushFrames();
    expectServicesScroll();
  });

  it('handles a direct visit to the legacy /services route', async () => {
    await mountAt('/services');
    expect(window.location.pathname + window.location.hash).toBe('/#services');
    await flushFrames();
    expectServicesScroll();
  });

  it('scrolls to Services on a client-side transition from another page', async () => {
    await mountAt('/contact');
    await flushFrames();
    scrollTo.mockClear();
    await navigate('/#services');
    await flushFrames();
    expectServicesScroll();
  });

  it('scrolls to the top instead when navigating without a hash', async () => {
    await mountAt('/#services');
    await flushFrames();
    scrollIntoView.mockClear();
    await navigate('/about');
    await flushFrames();
    expect(scrollIntoView).not.toHaveBeenCalled();
    expect(scrollTo).toHaveBeenCalledExactlyOnceWith({ top: 0, left: 0, behavior: 'auto' });
  });

  it('cancels a pending Services scroll when another page replaces it', async () => {
    await mountAt('/#services');
    await navigate('/about');
    await flushFrames();
    expect(scrollIntoView).not.toHaveBeenCalled();
    expect(scrollTo).toHaveBeenCalledExactlyOnceWith({ top: 0, left: 0, behavior: 'auto' });
  });
});
