// Hash router with a screen stack: forward slides in from the right, back from the left, tabs fade.
const routes = [];
let current = null;
let index = 0;
let hooks = { beforeRender: null, afterRender: null, guard: null };
const scrollMemory = new Map();
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function compile(path) {
  const keys = [];
  const pattern = path.replace(/:([a-z]+)/gi, (_, k) => { keys.push(k); return '([^/]+)'; });
  return { regex: new RegExp(`^${pattern}$`), keys };
}

export function defineRoutes(list) {
  list.forEach((r) => routes.push({ ...r, ...compile(r.path) }));
}

function parse(hash) {
  const raw = (hash || '').replace(/^#/, '') || '/';
  const [path, qs = ''] = raw.split('?');
  const query = Object.fromEntries(new URLSearchParams(qs));
  return { path: path || '/', query, full: raw };
}

function resolve(path) {
  for (const route of routes) {
    const m = path.match(route.regex);
    if (m) {
      const params = {};
      route.keys.forEach((k, i) => { params[k] = decodeURIComponent(m[i + 1]); });
      return { route, params };
    }
  }
  return null;
}

function viewport() { return document.getElementById('viewport'); }

function buildContext(match, loc, dir) {
  return {
    params: match.params,
    query: loc.query,
    path: loc.path,
    dir,
    go: router.go,
    back: router.back,
    rerender: () => router.refresh({ force: true }),
  };
}

function swap(next, dir) {
  const host = viewport();
  const leaving = [...host.querySelectorAll('.screen')];
  leaving.forEach((n) => { if (n.classList.contains('is-exiting')) n.remove(); });
  const prev = host.querySelector('.screen:not(.is-exiting)');
  const animate = prev && dir && dir !== 'none' && !reduceMotion.matches;
  host.append(next);
  if (!animate) { prev?.remove(); return; }
  const kind = dir === 'back' ? 'back' : dir === 'fade' ? 'fade' : 'forward';
  prev.classList.add('is-exiting', `exit-${kind}`);
  next.classList.add(`enter-${kind}`);
  const cleanup = () => { prev.remove(); next.classList.remove(`enter-${kind}`); };
  prev.addEventListener('animationend', cleanup, { once: true });
  setTimeout(() => { if (prev.isConnected) cleanup(); }, 400);
}

function render(loc, dir, { replace = false } = {}) {
  const match = resolve(loc.path);
  if (!match) { router.go('/', { replace: true, dir: 'none' }); return; }
  const redirect = hooks.guard?.(match.route, loc);
  if (redirect && redirect !== loc.full) { router.go(redirect, { replace: true, dir: dir === 'back' ? 'back' : 'fade' }); return; }

  const host = viewport();
  const old = host.querySelector('.screen:not(.is-exiting)');
  if (old && current) scrollMemory.set(current.loc.full, old.scrollTop);

  const ctx = buildContext(match, loc, dir);
  hooks.beforeRender?.(match.route, ctx);
  const node = match.route.factory(ctx);
  node.dataset.path = loc.full;
  current = { route: match.route, params: match.params, loc, ctx };
  swap(node, dir);

  if (dir === 'back' && scrollMemory.has(loc.full)) node.scrollTop = scrollMemory.get(loc.full);
  hooks.afterRender?.(match.route, ctx, node, { replace });
}

export const router = {
  get current() { return current; },

  configure(next) { hooks = { ...hooks, ...next }; },

  start() {
    const state = history.state;
    index = state?.idx ?? 0;
    history.replaceState({ idx: index }, '', location.hash || '#/');
    window.addEventListener('popstate', (e) => {
      const nextIdx = e.state?.idx ?? 0;
      const dir = nextIdx < index ? 'back' : 'forward';
      index = nextIdx;
      const loc = parse(location.hash);
      if (current && loc.full === current.loc.full) return;
      render(loc, dir);
    });
    window.addEventListener('hashchange', () => {
      const loc = parse(location.hash);
      if (current && loc.full === current.loc.full) return;
      render(loc, 'fade');
    });
    render(parse(location.hash), 'none');
  },

  go(path, { replace = false, dir = 'forward' } = {}) {
    if (replace) history.replaceState({ idx: index }, '', `#${path}`);
    else { index += 1; history.pushState({ idx: index }, '', `#${path}`); }
    render(parse(`#${path}`), dir, { replace });
  },

  back(fallback = '/home') {
    if (index > 0) history.back();
    else router.go(fallback, { replace: true, dir: 'back' });
  },

  // Re-run the current screen in place, keeping scroll and focus (used when state changes)
  refresh({ force = false } = {}) {
    if (!current) return;
    if (!force && !current.route.live) return;
    const host = viewport();
    const old = host.querySelector('.screen:not(.is-exiting)');
    if (!old) return;
    const scroll = old.scrollTop;
    const active = document.activeElement;
    const focusKey = active && old.contains(active) ? (active.dataset.key || `${active.tagName}:${active.textContent.trim()}`) : null;
    const redirect = hooks.guard?.(current.route, current.loc);
    if (redirect && redirect !== current.loc.full) { router.go(redirect, { replace: true, dir: 'fade' }); return; }
    const node = current.route.factory({ ...current.ctx, dir: 'none' });
    node.dataset.path = current.loc.full;
    old.replaceWith(node);
    node.scrollTop = scroll;
    if (focusKey) {
      const target = [...node.querySelectorAll('button, a, input, textarea, [tabindex]')]
        .find((n) => (n.dataset.key || `${n.tagName}:${n.textContent.trim()}`) === focusKey);
      target?.focus({ preventScroll: true });
    }
    hooks.afterRender?.(current.route, current.ctx, node, { refresh: true });
  },
};
