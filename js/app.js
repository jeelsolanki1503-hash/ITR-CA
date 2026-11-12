import { router, defineRoutes } from './router.js';
import { mountLayout, setShell, setBrandName } from './layout.js';
import { store, recompute, addActivity, firstName } from './store.js';
import { toast } from './components.js';
import { DEMO_FILES } from './data.js';
import * as screens from './screens.js';

/* ---------------- Routes ---------------- */
defineRoutes([
  { path: '/', title: 'ITR for CAs', redirect: (s) => (s.session ? (s.onboarded ? '/dashboard' : (s.obStep || '/practice-setup')) : '/welcome') },
  { path: '/welcome', title: 'Welcome', shell: 'auth', guest: true, factory: screens.welcome },
  { path: '/login', title: 'Log in', shell: 'auth', guest: true, factory: screens.login },
  { path: '/create', title: 'Create account', shell: 'auth', guest: true, factory: screens.createAccount },
  { path: '/practice-setup', title: 'Set up your practice', shell: 'auth', auth: true, onboarding: true, factory: screens.practiceSetup },
  { path: '/add-clients', title: 'Add your clients', shell: 'auth', auth: true, onboarding: true, live: true, factory: screens.addClients },

  { path: '/dashboard', title: 'Dashboard', shell: 'tab', tab: 'dashboard', auth: true, app: true, live: true, factory: screens.dashboard },
  { path: '/clients', title: 'Clients', shell: 'tab', tab: 'clients', auth: true, app: true, live: true, factory: screens.clientsList },
  { path: '/tracking', title: 'Who’s waiting on what', shell: 'sub', tab: 'clients', tabbar: true, auth: true, app: true, live: true, factory: screens.tracking },
  { path: '/clients/:id', title: 'Client', shell: 'sub', tab: 'clients', tabbar: true, auth: true, app: true, live: true, needsClient: true, factory: screens.clientProfile },
  { path: '/clients/:id/checklist', title: 'Checklist', shell: 'sub', tab: 'clients', auth: true, app: true, needsClient: true, factory: screens.checklistBuilder },
  { path: '/clients/:id/review', title: 'Review documents', shell: 'sub', tab: 'clients', auth: true, app: true, live: true, needsClient: true, factory: screens.reviewDocs },
  { path: '/clients/:id/review/:docId', title: 'View document', shell: 'sub', tab: 'clients', auth: true, app: true, live: true, needsClient: true, factory: screens.viewDoc },
  { path: '/clients/:id/flag/:docId', title: 'Flag a document', shell: 'sub', tab: 'clients', auth: true, app: true, needsClient: true, factory: screens.flagDoc },
  { path: '/clients/:id/assisted', title: 'Record documents', shell: 'sub', tab: 'clients', auth: true, app: true, needsClient: true, factory: screens.assistedCollect },
  { path: '/clients/:id/requirement', title: 'New requirement', shell: 'sub', tab: 'dashboard', tabbar: false, auth: true, app: true, needsClient: true, factory: screens.requirement },
  { path: '/clients/:id/closed', title: 'Client closed', shell: 'auth', auth: true, app: true, needsClient: true, factory: screens.clientClosed },

  { path: '/export', title: 'Export', shell: 'tab', tab: 'export', auth: true, app: true, live: true, factory: screens.exportList },
  { path: '/settings', title: 'Settings', shell: 'tab', tab: 'settings', auth: true, app: true, live: true, factory: screens.settings },
  { path: '/settings/practice', title: 'Practice details', shell: 'sub', tab: 'settings', auth: true, app: true, factory: screens.settingsPractice },
  { path: '/settings/team', title: 'Team & assistant access', shell: 'sub', tab: 'settings', tabbar: true, auth: true, app: true, live: true, factory: screens.settingsTeam },

  { path: '/season-closed', title: 'Season closed', shell: 'auth', auth: true, app: true, factory: screens.seasonClosed },
]);

function guard(route, loc) {
  const s = store.state;
  if (route.redirect) return route.redirect(s);
  if (route.guest && s.session) return s.onboarded ? '/dashboard' : (s.obStep || '/practice-setup');
  if (route.auth && !s.session) return '/welcome';
  if (route.app && !s.onboarded) return s.obStep || '/practice-setup';
  if (route.onboarding && s.onboarded) return '/dashboard';
  if (route.needsClient) {
    const id = loc.path.split('/')[2];
    if (!s.clients.some((c) => c.id === id)) return '/clients';
  }
  return null;
}

/* ---------------- Simulated clients: accept, upload, re-upload ---------------- */
let simTimer = null;

function fire(p) {
  let message = '';
  store.update((s) => {
    s.pending = s.pending.filter((x) => !(x.type === p.type && x.client === p.client && x.at === p.at));
    const c = s.clients.find((x) => x.id === p.client);
    if (!c) return;
    const first = firstName(c.name);
    if (p.type === 'accept' && c.status === 'invited') {
      c.status = 'not-started';
      c.acceptedDays = 0;
      c.sinceLabel = 'Linked just now';
      addActivity(s, `${c.name} accepted your invite`, 'success', c.id);
      message = `${c.name} accepted your invite.`;
    }
    if (p.type === 'upload' && c.checklistSentDays != null) {
      let n = 0;
      c.checklist.forEach((d) => {
        if (d.state !== 'todo') return;
        const [file, size] = DEMO_FILES[d.id] || [`${d.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.pdf`, '240 KB · 2 pages'];
        Object.assign(d, { state: 'uploaded', file, size, uploadedDays: 0 });
        n += 1;
      });
      if (!n) return;
      recompute(c);
      if (s.flash?.client === c.id) s.flash = null;
      addActivity(s, `${c.name} uploaded all ${c.checklist.length} documents`, 'success', c.id);
      message = `${c.name} uploaded all ${c.checklist.length} documents.`;
    }
    if (p.type === 'reupload') {
      const d = c.checklist.find((x) => x.id === p.doc);
      if (!d || d.state !== 'flagged') return;
      const [file, size] = DEMO_FILES[d.id] || ['updated_document.pdf', '260 KB · 2 pages'];
      Object.assign(d, { state: 'uploaded', file: file.replace('.pdf', '_v2.pdf'), size, uploadedDays: 0, reuploaded: true, note: null });
      recompute(c);
      if (s.flash?.client === c.id) s.flash = null;
      addActivity(s, `${first} re-uploaded “${d.title}”`, 'success', c.id);
      message = `${first} re-uploaded “${d.title}”.`;
    }
  });
  if (message) toast(message, { kind: 'info' });
}

function schedule() {
  clearTimeout(simTimer);
  const list = store.state.pending || [];
  if (!list.length) return;
  const next = list.reduce((a, b) => (a.at <= b.at ? a : b));
  simTimer = setTimeout(() => fire(next), Math.max(0, next.at - Date.now()));
}

/* ---------------- Boot ---------------- */
function runSplash(done) {
  const splash = document.getElementById('splash');
  if (!splash) { done(); return; }
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) splash.classList.add('is-static');
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    splash.remove();
    done();
  };
  splash.addEventListener('click', finish);
  document.addEventListener('keydown', function skip(e) {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') { document.removeEventListener('keydown', skip); finish(); }
  });
  setTimeout(finish, reduce ? 900 : 2000);
}

function boot() {
  const app = document.getElementById('app');

  mountLayout({
    onNavigate: (item) => {
      const cur = router.current?.loc.path;
      if (cur === item.path) {
        document.querySelector('.screen:not(.is-exiting)')?.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      router.go(item.path, { dir: 'fade' });
    },
  });

  router.configure({
    guard,
    beforeRender: (route, ctx) => {
      const shell = typeof route.shell === 'function' ? route.shell(ctx) : route.shell;
      setShell(shell, route.tab);
      document.getElementById('app').dataset.tabs = route.tabbar ? 'on' : 'off';
      setBrandName(store.state.profile?.name);
    },
    afterRender: (route, ctx, node, meta) => {
      document.title = `${route.title} · ITR for CAs`;
      if (meta?.refresh || ctx.dir === 'none') return;
      const heading = [...node.querySelectorAll('h1')].find((h) => h.offsetParent !== null);
      if (heading) {
        if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
        requestAnimationFrame(() => heading.focus({ preventScroll: true }));
      }
    },
  });

  store.subscribe((s, prev) => {
    if (s.pending !== prev.pending) schedule();
    router.refresh();
  });

  schedule();
  router.start();
  app.dataset.ready = 'true';

  runSplash(() => {
    app.classList.add('is-entering');
    app.addEventListener('animationend', () => app.classList.remove('is-entering'), { once: true });
  });

  window.addEventListener('offline', () => toast('You’re offline. Changes stay on this device until you’re back.', { kind: 'error' }));
  window.addEventListener('online', () => toast('You’re back online.', { kind: 'info' }));
}

boot();
