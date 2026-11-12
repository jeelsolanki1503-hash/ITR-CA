import {
  el, button, setLoading, iconButton, linkButton, textField, checkRow, pill, progress,
  skeletonRow, card, iconTile, row, activityList, emptyState, banner, kvTable, avatar,
  screen, mainHeader, backHeader, pageLead, screenFooter, toast, openSheet, confirmSheet,
  radioCards, filterChips, searchField, statusTile, sectionHead,
} from './components.js';
import { icon, logo } from './icons.js';
import { router } from './router.js';
import {
  store, seedReturning, freshState, recompute, stageText, pillText, countsByStatus, clientProgress,
  addActivity, setFlash, readFlash, queue, firstName, daysLabel, submittedLabel,
} from './store.js';
import {
  APP, CA, STATUS, STATUS_ORDER, PRACTICE_OPTIONS, SOFTWARE_OPTIONS, softwareLabel, NEWS,
  CHECKLIST_LIBRARY, SUGGESTED_FOR, REQUIREMENT_ITEMS, TOASTS, DEMO, clientFromContact,
} from './data.js';

const S = () => store.state;
const getClient = (id) => S().clients.find((c) => c.id === id);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const go = (path, opts) => router.go(path, opts);
const back = (fallback) => () => router.back(fallback);
const practiceName = () => S().profile?.name || CA.name;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const validContact = (v) => EMAIL_RE.test(v) || v.replace(/\D/g, '').length === 10;

function updateClient(id, fn) {
  store.update((s) => {
    const c = s.clients.find((x) => x.id === id);
    if (c) fn(c, s);
  });
}

function statusPill(c, text) {
  const meta = STATUS[c.status] || STATUS['not-started'];
  return pill(meta.pill, text || meta.label);
}

function tabHeader(opts) {
  return mainHeader({
    brandName: practiceName(),
    bell: { unread: S().bellUnread, onClick: openActivitySheet },
    ...opts,
  });
}

function flashBanner(clientId) {
  const f = readFlash(clientId);
  if (!f) return null;
  return banner({ kind: 'success', title: f.title, text: f.text, className: Date.now() - f.at < 1000 ? 'is-new' : '', onDismiss: () => store.set({ flash: null }) });
}

function openActivitySheet() {
  store.set({ bellUnread: false });
  openSheet({
    title: 'Recent activity',
    render: (api) => ({
      body: S().activity.length
        ? activityFeed(S().activity.slice(0, 10), () => api.close())
        : emptyState({ icon: 'bell', title: 'No activity yet', text: 'Once you link clients and start collecting documents, updates will show up here.' }),
      actions: [button({ label: 'Close', kind: 'secondary', block: true, onClick: () => api.close() })],
    }),
  });
}

function activityFeed(items, onPick) {
  const list = activityList(items);
  [...list.children].forEach((li, i) => {
    const a = items[i];
    if (!a.client || !getClient(a.client)) return;
    li.classList.add('activity__item--link');
    li.tabIndex = 0;
    li.setAttribute('role', 'link');
    const open = () => { onPick?.(); go(`/clients/${a.client}`); };
    li.addEventListener('click', open);
    li.addEventListener('keydown', (e) => { if (e.key === 'Enter') open(); });
  });
  return list;
}

/* ================= Inviting a client: name and contact are both required ================= */
function inviteFields(draft = {}) {
  const name = textField({ label: 'Client name', placeholder: 'e.g. Anita Desai', autocomplete: 'off', required: true, value: draft.name || '', onInput: (v) => { draft.name = v; } });
  const contact = textField({ label: 'Client email or phone number', placeholder: 'Email or 10-digit mobile number', autocomplete: 'off', inputmode: 'email', required: true, value: draft.contact || '', onInput: (v) => { draft.contact = v; } });
  name.input.dataset.key = 'invite-name';
  contact.input.dataset.key = 'invite-contact';
  return { name, contact };
}

function validateInvite({ name, contact }) {
  let bad = null;
  const value = contact.value;
  if (name.value.length < 2) { name.setError('Enter the client’s name.'); bad = bad || name; }
  if (!validContact(value)) { contact.setError('Enter a valid email address or a 10-digit mobile number.'); bad = bad || contact; }
  else {
    const digits = value.replace(/\D/g, '');
    const exists = S().clients.find((c) => (c.email && c.email.toLowerCase() === value.toLowerCase())
      || (!value.includes('@') && c.mobile && c.mobile.replace(/\D/g, '') === digits));
    if (exists) {
      contact.setError(exists.status === 'invited' ? TOASTS.inviteAlready(firstName(exists.name)) : `${exists.name} is already one of your clients.`);
      bad = bad || contact;
    }
  }
  bad?.input.focus();
  return !bad;
}

function createInvite({ name, contact }) {
  const c = clientFromContact(contact.value, name.value);
  c.invitedDays = 0;
  store.update((s) => {
    s.clients.unshift(c);
    addActivity(s, `Invite sent to ${c.name}`, 'info', c.id);
    queue(s, 'accept', c.id, 6000);
  });
  return c;
}

export function openInviteSheet() {
  openSheet({
    title: 'Invite a client',
    render: (api) => {
      const fields = inviteFields();
      fields.name.input.dataset.autofocus = '';
      const send = button({
        label: 'Send invite', block: true,
        onClick: async () => {
          if (!validateInvite(fields)) return;
          setLoading(send, true, 'Sending…');
          await wait(DEMO.timers.invite);
          setLoading(send, false);
          const c = createInvite(fields);
          api.close(true);
          toast(TOASTS.inviteSent(firstName(c.name)));
        },
      });
      fields.contact.input.addEventListener('keydown', (e) => { if (e.key === 'Enter') send.click(); });
      return {
        body: [
          el('p', { class: 'sheet__sub t-body', text: 'They’ll get a link by email or SMS. You’ll see them here once they accept.' }),
          fields.name.root,
          fields.contact.root,
        ],
        actions: [send, button({ label: 'Cancel', kind: 'secondary', block: true, onClick: () => api.close() })],
      };
    },
  });
}

/* ================= Welcome (M-00) ================= */
export function welcome() {
  return screen({
    name: 'welcome',
    className: 'welcome-screen',
    body: [
      el('div', { class: 'welcome__card card card--glass' },
        el('div', { class: 'welcome__hero' },
          logo({ className: 'brand__mark brand__mark--xl', title: 'ITR for CAs' }),
          el('h1', { class: 't-display welcome__title', tabindex: '-1' }, 'Run your practice, stress-free'),
          el('p', { class: 'welcome__sub t-body-lg', text: 'Collect client documents, track status, and keep every filing on schedule.' }),
        ),
        el('div', { class: 'welcome__actions' },
          button({ label: 'Create account', block: true, onClick: () => go('/create') }),
          button({ label: 'Log in', kind: 'secondary', block: true, onClick: () => go('/login') }),
          el('p', { class: 'divider-text t-small', text: 'OR CONTINUE WITH' }),
          button({ label: 'Continue with Google', kind: 'secondary', block: true, icon: 'google', onClick: () => socialLogin('Google') }),
          button({ label: 'Continue with Apple', kind: 'secondary', block: true, icon: 'apple', onClick: () => socialLogin('Apple') }),
        ),
      ),
    ],
  });
}

function socialLogin(provider) {
  store.set(seedReturning({ ...freshState(), profile: { name: CA.name, email: CA.email } }));
  toast(`Signed in with ${provider}. Welcome back, ${CA.first}.`);
  go('/dashboard', { replace: true, dir: 'fade' });
}

/* ================= Login (M-01, M-01b) ================= */
export function login() {
  const email = textField({ label: 'Email address', type: 'email', autocomplete: 'email', inputmode: 'email' });
  const pass = textField({ label: 'Password', type: 'password', autocomplete: 'current-password' });
  const eye = iconButton({ icon: 'eye', label: 'Show password', onClick: () => {
    const show = pass.input.type === 'password';
    pass.input.type = show ? 'text' : 'password';
    eye.replaceChildren(icon(show ? 'eye-off' : 'eye'));
    eye.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  } });
  const slot = pass.root.querySelector('.field__trailing');
  slot.classList.add('field__trailing--btn');
  slot.removeAttribute('aria-hidden');
  slot.replaceChildren(eye);
  pass.input.classList.add('has-trailing');

  const resetSlot = el('div', { class: 'auth-row-end' });
  const submit = button({ label: 'Continue', block: true, type: 'submit' });
  const form = el('form', { class: 'fields', novalidate: true }, email.root, pass.root, resetSlot, submit);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let ok = true;
    if (!EMAIL_RE.test(email.value)) { email.setError('Enter the email you signed up with.'); ok = false; }
    if (!pass.input.value) {
      pass.setError('Enter your password.');
      slot.replaceChildren(eye);
      ok = false;
    }
    if (!ok) { form.querySelector('[aria-invalid="true"]')?.focus(); return; }
    setLoading(submit, true, 'Signing in…');
    await wait(900);
    setLoading(submit, false);
    if (pass.input.value === DEMO.wrongPassword) {
      pass.setError('That password doesn’t match. Try again or reset it.');
      slot.replaceChildren(eye);
      resetSlot.replaceChildren(linkButton({ label: 'Reset password', target: true, onClick: () => toast('Password reset link sent to your email.', { kind: 'info' }) }));
      pass.input.focus();
      return;
    }
    store.set(seedReturning({ ...freshState(), profile: { name: CA.name, email: email.value } }));
    go('/dashboard', { replace: true, dir: 'fade' });
  });

  return screen({
    name: 'login',
    header: backHeader({ onBack: back('/welcome') }),
    body: card({ children: [
      el('div', { class: 'auth-hero' },
        logo({ className: 'brand__mark brand__mark--lg', title: '' }),
        el('h1', { class: 't-h1', tabindex: '-1', text: 'Welcome back' }),
        el('p', { class: 'auth-intro t-body', text: 'Sign in to manage your practice' }),
      ),
      form,
      el('p', { class: 'auth-alt t-body' }, 'New here?', linkButton({ label: 'Create account', onClick: () => go('/create', { replace: true }) })),
    ] }),
  });
}

/* ================= Create account (inferred: Welcome links here, no Figma frame) ================= */
export function createAccount() {
  const name = textField({ label: 'Full name', autocomplete: 'name', placeholder: 'e.g. Deepak Mehta' });
  const email = textField({ label: 'Work email', type: 'email', autocomplete: 'email', inputmode: 'email', placeholder: 'you@yourpractice.in' });
  const pass = textField({ label: 'Password', type: 'password', autocomplete: 'new-password', helper: 'At least 8 characters' });
  const submit = button({ label: 'Continue', block: true, type: 'submit' });
  const form = el('form', { class: 'fields', novalidate: true }, name.root, email.root, pass.root, submit);
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let ok = true;
    if (name.value.length < 2) { name.setError('Enter your full name.'); ok = false; }
    if (!EMAIL_RE.test(email.value)) { email.setError('Enter a valid email address.'); ok = false; }
    if (pass.input.value.length < 8) { pass.setError('Use at least 8 characters.'); ok = false; }
    if (!ok) { form.querySelector('[aria-invalid="true"]')?.focus(); return; }
    setLoading(submit, true, 'Creating…');
    await wait(800);
    store.set({ ...freshState(), session: { email: email.value }, profile: { name: name.value, email: email.value }, obStep: '/practice-setup' });
    go('/practice-setup', { replace: true });
  });
  return screen({
    name: 'create',
    header: backHeader({ onBack: back('/welcome') }),
    body: card({ children: [
      el('div', { class: 'auth-hero' },
        logo({ className: 'brand__mark brand__mark--lg', title: '' }),
        el('h1', { class: 't-h1', tabindex: '-1', text: 'Create your account' }),
        el('p', { class: 'auth-intro t-body', text: 'Two minutes to set up. Then invite your first client.' }),
      ),
      form,
      el('p', { class: 'auth-alt t-body' }, 'Already have an account?', linkButton({ label: 'Log in', onClick: () => go('/login', { replace: true }) })),
    ] }),
  });
}

/* ================= Practice setup (M-02, M-02b) ================= */
function teamInvite(practice) {
  const field = textField({ label: 'Team member emails', placeholder: 'asha@yourpractice.in', helper: 'They’ll get an invite once you finish setting up.', value: practice.team.join(', ') });
  field.input.addEventListener('input', () => { practice.team = field.input.value.split(/[,\s]+/).filter(Boolean); });
  return el('section', { class: 'card card--solid team-invite fade-up' }, el('h3', { class: 't-title', text: 'Invite team' }), field.root);
}

export function practiceSetup() {
  const practice = { ...S().practice, team: [...(S().practice.team || [])] };
  const slot = el('div', { class: 'stack' });
  const renderTeam = () => { slot.replaceChildren(); if (practice.kind === 'team') slot.append(teamInvite(practice)); slot.hidden = practice.kind !== 'team'; };
  renderTeam();

  const why = el('details', { class: 'why' },
    el('summary', { class: 'why__summary t-label' }, icon('help', { size: 16 }), el('span', { text: 'Why we ask' }), icon('chevron-down', { size: 16 })),
    el('p', { class: 'why__body t-small', text: 'If you run a team, you can add your team members so they can work on clients with you.' }),
  );

  const submit = button({ label: 'Continue', block: true, onClick: async () => {
    const bad = practice.team.filter((e) => !EMAIL_RE.test(e));
    if (practice.kind === 'team' && bad.length) { toast(`Check this email: ${bad[0]}`, { kind: 'error' }); return; }
    setLoading(submit, true, 'Saving…');
    await wait(600);
    store.set({ practice, obStep: '/add-clients' });
    go('/add-clients');
  } });

  return screen({
    name: 'practice-setup',
    header: backHeader({ onBack: () => { store.reset(); go('/welcome', { replace: true, dir: 'back' }); }, backLabel: 'Back to welcome' }),
    body: card({ className: 'auth-body', children: [
      el('h1', { class: 't-h1', tabindex: '-1', text: 'Set up your practice' }),
      el('section', { class: 'stack' },
        el('h2', { class: 't-title', text: 'How does your practice work?' }),
        radioCards({ label: 'Practice type', options: PRACTICE_OPTIONS, value: practice.kind, onChange: (v) => { practice.kind = v; renderTeam(); } }),
        why,
      ),
      slot,
      el('section', { class: 'stack' },
        el('h2', { class: 't-title', text: 'Which software do you use?' }),
        el('p', { class: 't-small c-muted', text: 'We’ll export documents in a format it can read.' }),
        radioCards({ label: 'Software', options: SOFTWARE_OPTIONS, value: practice.software, onChange: (v) => { practice.software = v; } }),
      ),
    ] }),
    footer: screenFooter(submit),
  });
}

/* ================= Add your clients (M-19b–f) ================= */
const addDraft = { name: '', contact: '' };

export function addClients() {
  const invited = S().clients;
  const fields = inviteFields(addDraft);
  const send = button({ label: 'Send invite', block: true, onClick: async () => {
    if (!validateInvite(fields)) return;
    setLoading(send, true, 'Sending…');
    await wait(DEMO.timers.invite);
    setLoading(send, false);
    const snapshot = { name: fields.name, contact: fields.contact };
    addDraft.name = ''; addDraft.contact = '';
    const c = createInvite(snapshot);
    toast(TOASTS.inviteSent(firstName(c.name)));
  } });
  fields.contact.input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); send.click(); } });

  const finish = () => {
    store.set({ onboarded: true, obStep: null });
    go('/dashboard', { replace: true, dir: 'fade' });
  };

  return screen({
    name: 'add-clients',
    header: backHeader({ onBack: () => { store.set({ obStep: '/practice-setup' }); go('/practice-setup', { dir: 'back', replace: true }); }, backLabel: 'Back to practice setup' }),
    body: card({ className: 'auth-body', children: [
      el('div', { class: 'auth-hero' },
        el('h1', { class: 't-h1', tabindex: '-1', text: 'Add your clients' }),
        el('p', { class: 'auth-intro t-body', text: 'Invite clients by email or phone number.' }),
      ),
      invited.length ? banner({ kind: 'success', text: 'Invite sent. Add more clients, or continue to your dashboard.' }) : null,
      el('section', { class: 'card card--solid invite-card' },
        el('h2', { class: 't-title', text: 'Invite a new client' }),
        fields.name.root,
        fields.contact.root,
        send,
      ),
      el('p', { class: 't-small c-muted', text: 'They’ll be listed here until they accept.' }),
      invited.length ? el('section', { class: 'stack' },
        el('h2', { class: 't-small-strong section-label', text: 'INVITED' }),
        el('div', { class: 'row-list' }, invited.map((c) => row({
          lead: avatar(c.initials),
          title: c.name,
          sub: c.email || c.mobile,
          trailing: c.status === 'invited' ? pill('neutral', 'Invited') : pill('success', 'Accepted'),
        }))),
      ) : null,
    ] }),
    footer: screenFooter(
      invited.length
        ? button({ label: 'Continue', block: true, onClick: finish })
        : el('div', { class: 'center' }, linkButton({ label: 'Skip for now', target: true, onClick: finish })),
    ),
  });
}

/* ================= Dashboard (M-03, first-time M-00b–h) ================= */
function darkCard({ title, text, bar, action }) {
  return el('section', { class: 'card card--highlight dark-banner', 'aria-live': 'polite' },
    el('div', { class: 'dark-banner__text' },
      el('h2', { class: 't-h2', text: title }),
      el('p', { class: 't-body c-inverse-muted', text }),
    ),
    action ? button({ ...action, kind: 'on-dark', className: 'dark-banner__action' }) : null,
    bar ? el('div', { class: 'dark-banner__bar' }, progress({ ...bar })) : null,
  );
}

async function closeSeason() {
  const ok = await confirmSheet({ title: 'Close the season?', message: `This locks ${CA.taxYear}. Your clients’ files stay available to export.`, confirmLabel: 'Close season' });
  if (!ok) return;
  store.set({ seasonClosed: true });
  go('/season-closed', { replace: true, dir: 'fade' });
}

function firstTimeCard() {
  const s = S();
  const c = s.clients.find((x) => x.demo);
  if (!c) return darkCard({ title: `Your last filing day is ${CA.deadlineLabel}`, text: 'That’s 10 weeks from today. Plenty of time to link clients and get set up.' });
  const first = firstName(c.name);
  const flagged = c.checklist.find((d) => d.state === 'flagged');
  const { done, total } = clientProgress(c);
  const all = countsByStatus(s.clients);
  if (c.status === 'invited') return darkCard({ title: `Waiting for ${c.name} to accept`, text: 'Invite sent just now. We’ll tell you the moment they accept.' });
  if (c.status === 'complete' && all.complete === all.all) {
    return darkCard({ title: 'All clients are complete', text: `${c.name}’s file is done. Close the season when you’re ready.`, action: { label: 'Close season', onClick: closeSeason } });
  }
  if (c.status === 'complete') return darkCard({ title: `${c.name}’s file is complete`, text: 'Export the documents to your software.', action: { label: 'Export', onClick: () => go('/export') } });
  if (flagged) return darkCard({ title: `Waiting on ${c.name} to re-upload`, text: `You flagged ${flagged.title}. Everything else is received.`, action: { label: 'View client', onClick: () => go(`/clients/${c.id}`) } });
  if (c.checklistSentDays == null) return darkCard({ title: `${c.name} accepted your invite`, text: `Next step: send ${first} the document checklist.`, action: { label: 'Send checklist', onClick: () => go(`/clients/${c.id}/checklist`) } });
  if (total && done === total) return darkCard({ title: `${c.name} uploaded all ${total} documents`, text: 'Review each one: view it, or flag it if something is missing or unclear.', action: { label: 'Review documents', onClick: () => go(`/clients/${c.id}/review`) } });
  return darkCard({ title: `Checklist sent to ${c.name}`, text: `Waiting for ${first} to upload. Reminders go out on day 3 and day 7.`, action: { label: 'View client', onClick: () => go(`/clients/${c.id}`) } });
}

const FLAG_ICON = { investment: 'bank', income: 'plus', expenditure: 'minus' };
const FLAG_ORDER = ['investment', 'income', 'expenditure'];

function clientFlagsCard() {
  const flags = S().clients.filter((c) => c.flag && !c.flagReviewed)
    .sort((a, b) => FLAG_ORDER.indexOf(a.flag.kind) - FLAG_ORDER.indexOf(b.flag.kind));
  return card({
    title: 'Client flags',
    sub: 'New income, investments, or expenses your clients need guidance on',
    children: flags.length
      ? el('div', { class: 'row-list' }, flags.map((c) => row({
        icon: FLAG_ICON[c.flag.kind] || 'alert',
        title: c.name,
        sub: `${c.flag.what} · ${c.flag.detail}`,
        className: 'flag-row',
        trailing: el('span', { class: 'row__cta t-label', text: 'Review' }),
        chevron: true,
        onClick: () => go(`/clients/${c.id}/requirement`),
      })))
      : el('p', { class: 'empty-line t-body c-muted' }, icon('check-circle', { size: 16 }), el('span', { text: 'No new flags. You’re all caught up.' })),
  });
}

function newsCard(items) {
  return card({
    title: 'News',
    children: el('ul', { class: 'news' }, items.map((n) => el('li', {},
      el('button', { type: 'button', class: 'news__item', onclick: () => toast('Opening article in a new tab…', { kind: 'info' }) },
        el('span', { class: 't-small c-muted', text: `${n.source} · ${n.when}` }),
        el('span', { class: 't-body-strong', text: n.title }),
      )))),
  });
}

function activityCard() {
  const items = S().activity;
  return card({
    title: 'Recent activity',
    children: items.length
      ? activityFeed(items.slice(0, 6))
      : el('div', { class: 'stack stack--tight' },
        el('p', { class: 't-body-strong', text: 'No activity yet' }),
        el('p', { class: 't-small c-muted', text: 'Once you link clients and start collecting documents, updates will show up here.' })),
  });
}

function softChip() {
  return el('span', { class: 'soft-chip', title: 'The software you export to' },
    el('span', { class: 't-small c-muted', text: 'Software' }),
    el('span', { class: 't-small-strong', text: softwareLabel(S().practice.software) }));
}

export function dashboard() {
  const s = S();
  const firstTime = !s.returning;
  const counts = countsByStatus(s.clients);
  const name = firstName(practiceName());
  const greeting = firstTime && !s.clients.some((c) => c.status !== 'invited') ? `Welcome, ${name}` : `Hi ${name}`;
  const noClients = s.clients.length === 0;
  const sub = noClients ? '' : 'Here is where your clients stand today.';

  const tiles = el('div', { class: 'status-tiles' },
    ['not-started', 'in-progress', 'needs-correction', 'complete'].map((k) => statusTile({
      kind: k, label: STATUS[k].label, count: counts[k] || 0, help: STATUS[k].help, iconName: STATUS[k].icon,
      onClick: () => go(`/clients?status=${k}`),
    })),
  );

  const closedBanner = s.seasonClosed ? banner({ kind: 'success', title: `Season ${CA.taxYear} closed`, text: 'Everything is filed. Files stay available in Export.', action: { label: 'Reopen', onClick: () => { store.set({ seasonClosed: false }); toast(TOASTS.seasonReopened); } } }) : null;
  const allDone = !firstTime && counts.all > 0 && counts.complete === counts.all && !s.seasonClosed;

  const deadline = allDone
    ? darkCard({ title: 'All clients are complete', text: 'Close the season when you’re ready.', action: { label: 'Close season', onClick: closeSeason } })
    : darkCard({
      title: `${CA.deadlineDaysLeft} days to your internal deadline`,
      text: `Target: all clients filed by ${CA.deadlineLabel}`,
      bar: { value: counts.complete, max: counts.all || 1, label: `${counts.complete} of ${counts.all} clients have sent all documents`, ariaLabel: 'Clients with all documents sent' },
    });

  return screen({
    name: 'dashboard',
    header: tabHeader({
      title: greeting,
      sub,
      bellDesktop: true,
      actions: [softChip(), firstTime ? button({ label: 'Add clients', onClick: openInviteSheet }) : null].filter(Boolean),
    }),
    body: [
      pageLead({
        title: greeting,
        action: firstTime ? button({ label: 'Add clients', kind: 'on-dark', onClick: openInviteSheet }) : null,
        below: softChip(),
      }),
      closedBanner,
      el('section', { class: 'card card--glass status-card' },
        sectionHead({
          title: 'Client status',
          sub: noClients ? 'Add clients to see their status here' : 'Tap a square to see those clients',
          aside: noClients ? null : button({ label: 'View all clients', kind: 'secondary', onClick: () => go('/clients') }),
        }),
        tiles,
      ),
      firstTime ? firstTimeCard() : deadline,
      firstTime ? null : clientFlagsCard(),
      firstTime
        ? el('div', { class: 'stack stack--section' }, newsCard(NEWS), activityCard())
        : el('div', { class: 'two-col two-col--home' }, newsCard(NEWS.slice(0, 2)), activityCard()),
    ],
  });
}

/* ================= Clients list (M-04 family) ================= */
let listQuery = '';
let loadedOnce = false;
let showAll = false;
const PAGE = 8;

function clientRow(c) {
  const meta = STATUS[c.status] || STATUS['not-started'];
  return el('button', { type: 'button', class: 'client-row', onclick: () => go(`/clients/${c.id}`), dataset: { key: `client-${c.id}` } },
    el('span', { class: 'client-row__avatar' }, avatar(c.initials)),
    el('span', { class: 'client-row__name t-body-strong', text: c.name }),
    el('span', { class: 'client-row__meta' },
      el('span', { class: 'client-row__short t-small c-muted', text: c.short || c.sources }),
      el('span', { class: 'client-row__stage t-small c-secondary', text: stageText(c) }),
    ),
    el('span', { class: 'client-row__pill' }, pill(meta.pill, meta.label)),
    el('span', { class: 'client-row__chev', 'aria-hidden': 'true' }, icon('chevron-right')),
  );
}

function invitedRow(c) {
  const first = firstName(c.name);
  return el('div', { class: 'client-row client-row--invited' },
    el('span', { class: 'client-row__avatar' }, avatar(c.initials)),
    el('span', { class: 'client-row__name t-body-strong', text: c.name }),
    el('span', { class: 'client-row__meta' },
      el('span', { class: 'client-row__short t-small c-muted', text: c.email || c.mobile }),
      el('span', { class: 'client-row__stage t-small c-secondary', text: `Waiting for ${first} to accept` }),
    ),
    el('span', { class: 'client-row__pill' }, pill('neutral', 'Invite sent')),
    el('span', { class: 'client-row__action' }, linkButton({ label: 'Resend invite', target: true, onClick: () => toast(TOASTS.inviteSent(first)) })),
  );
}

export function clientsList(ctx) {
  const s = S();
  let status = STATUS_ORDER.includes(ctx.query.status) ? ctx.query.status : 'all';
  const all = s.clients.filter((c) => c.status !== 'invited');
  const invited = s.clients.filter((c) => c.status === 'invited');
  const counts = countsByStatus(s.clients);
  const listHost = el('div', { class: 'client-list-host', 'aria-live': 'polite' });

  const clearSearch = () => { listQuery = ''; search.input.value = ''; search.root.querySelector('.search__clear').hidden = true; renderList(); search.input.focus(); };

  const renderList = () => {
    const q = listQuery.trim().toLowerCase();
    let list = status === 'all' ? all : all.filter((c) => c.status === status);
    if (q) list = list.filter((c) => [c.name, c.pan, c.email, c.sources, c.short].some((v) => (v || '').toLowerCase().includes(q)));
    const pool = status === 'all' ? all.length : counts[status] || 0;

    if (!s.clients.length) {
      listHost.replaceChildren(emptyState({ icon: 'users', title: 'No clients yet', text: 'Add your clients to send them a checklist and start collecting documents.', action: { label: 'Add clients', onClick: openInviteSheet } }));
      return;
    }
    if (q && !list.length) {
      listHost.replaceChildren(el('div', { class: 'stack' },
        emptyState({ icon: 'search', title: `No clients match “${listQuery.trim()}”`, text: 'Check the spelling, or search by PAN or email.', action: { label: 'Add clients', kind: 'secondary', onClick: openInviteSheet } }),
        el('div', { class: 'center' }, linkButton({ label: 'Clear search', target: true, onClick: clearSearch })),
      ));
      return;
    }
    const groups = [];
    if (invited.length && status === 'all' && !q) {
      groups.push(el('section', { class: 'client-group' },
        el('h2', { class: 'section-label t-small-strong', text: 'WAITING TO ACCEPT' }),
        el('div', { class: 'client-list' }, invited.map(invitedRow)),
      ));
    }
    const fullCount = list.length;
    const paged = !q && !showAll && list.length > PAGE;
    if (paged) list = list.slice(0, PAGE);
    if (list.length) {
      groups.push(el('section', { class: 'client-group', 'aria-label': 'Clients' },
        el('div', { class: 'client-list' }, list.map(clientRow)),
      ));
    } else if (!invited.length || status !== 'all') {
      groups.push(emptyState({ icon: STATUS[status]?.icon || 'users', title: `No clients ${status === 'all' ? 'yet' : `in “${STATUS[status].label}”`}`, text: 'They’ll show up here as the season moves along.' }));
    }
    const caption = q ? `${list.length} result${list.length === 1 ? '' : 's'} for “${listQuery.trim()}”`
      : list.length ? (pool === 1 ? '1 client' : `Showing ${list.length} of ${pool} clients`)
        : invited.length ? `${invited.length} invite${invited.length === 1 ? '' : 's'} waiting` : '';
    if (caption) {
      groups.push(el('div', { class: 'list-foot' },
        el('p', { class: 't-small list-foot__caption', text: caption }),
        paged ? linkButton({ label: `Show all ${fullCount}`, target: true, onClick: () => { showAll = true; renderList(); } }) : null,
      ));
    }
    listHost.replaceChildren(...groups);
  };

  const search = searchField({ value: listQuery, placeholder: 'Search clients', label: 'Search clients by name, PAN or email', onInput: (v) => { listQuery = v; renderList(); }, onClear: () => { listQuery = ''; renderList(); } });
  const chips = filterChips({
    label: 'Filter by status',
    value: status,
    options: STATUS_ORDER.map((k) => ({ id: k, label: k === 'all' ? 'All' : STATUS[k].label, count: k === 'all' ? counts.all : counts[k] || 0 })),
    onChange: (v) => {
      status = v;
      const full = `/clients${v === 'all' ? '' : `?status=${v}`}`;
      history.replaceState(history.state, '', `#${full}`);
      router.current.loc.full = full;
      router.current.ctx.query.status = v;
      renderList();
    },
  });

  if (ctx.query.error === '1') {
    listHost.replaceChildren(emptyState({ icon: 'alert', title: 'Couldn’t load your clients', text: 'Your connection may have dropped. Nothing you’ve done is lost.', action: { label: 'Try again', onClick: () => go('/clients', { replace: true, dir: 'none' }) } }));
  } else if (!loadedOnce && s.clients.length) {
    loadedOnce = true;
    listHost.replaceChildren(el('div', { class: 'stack', 'aria-busy': 'true' }, skeletonRow(), skeletonRow(), skeletonRow(), el('p', { class: 't-small list-foot__caption', text: 'Loading your clients…' })));
    setTimeout(() => { if (listHost.isConnected) renderList(); }, 550);
  } else {
    renderList();
  }

  const title = 'Your clients';
  const subText = s.clients.length ? `${counts.all} client${counts.all === 1 ? '' : 's'} this season` : '';
  return screen({
    name: 'clients',
    header: tabHeader({
      title, sub: subText,
      actions: [
        button({ label: 'Track requests', kind: 'secondary', onClick: () => go('/tracking') }),
        button({ label: 'Add clients', onClick: openInviteSheet }),
      ],
    }),
    body: [
      pageLead({ title }),
      el('div', { class: 'mobile-actions' },
        button({ label: 'Track requests', kind: 'secondary', onClick: () => go('/tracking') }),
        button({ label: 'Add clients', kind: 'on-dark', onClick: openInviteSheet })),
      el('section', { class: 'clients-card' },
        s.clients.length ? el('div', { class: 'list-tools' }, search.root, el('div', { class: 'chips-scroll' }, chips)) : null,
        listHost,
      ),
    ],
  });
}

/* ================= Client profile (M-05 family, M-20/22/24/26/28) ================= */
function docSub(d) {
  if (d.state === 'todo') return d.custom ? 'Not uploaded yet · added by you' : 'Not uploaded yet';
  if (d.state === 'flagged') return `Flagged ${daysLabel(d.flaggedDays ?? 0)}, waiting for a fresh upload`;
  if (d.state === 'collected') return 'Collected in person';
  if (d.reuploaded) return `Re-uploaded ${submittedLabel(d.uploadedDays ?? 0)}`;
  return `Submitted ${submittedLabel(d.uploadedDays ?? 0)}`;
}

function docPill(d) {
  if (d.state === 'flagged') return pill('warning', 'Needs correction');
  if (d.state === 'todo') return pill('neutral', 'Not uploaded');
  if (d.state === 'collected') return pill('success', 'Collected');
  return pill('success', 'Received');
}

function docRow(c, d) {
  const canReview = ['uploaded', 'approved', 'flagged'].includes(d.state);
  return row({
    icon: 'file',
    title: d.title,
    sub: docSub(d),
    className: `doc-row doc-row--${d.state}`,
    trailing: el('span', { class: 'doc-row__side' }, docPill(d), canReview ? el('span', { class: 'row__cta t-label', text: 'Review' }) : null),
    chevron: canReview,
    onClick: canReview ? () => go(`/clients/${c.id}/review/${d.id}`) : null,
  });
}

function nextStep(c) {
  const first = firstName(c.name);
  const { done, total } = clientProgress(c);
  const flagged = c.checklist.find((d) => d.state === 'flagged');
  const bar = total ? { value: done, max: total, label: `${done} of ${total} documents received`, ariaLabel: 'Documents received' } : null;
  const remind = { label: 'Send reminder', onClick: () => { toast(TOASTS.reminderSent(first)); store.update((s) => { addActivity(s, `Reminder sent to ${c.name}`, 'info', c.id); }); } };
  if (c.status === 'invited') return { title: `Waiting for ${first} to accept`, text: 'Invite sent. We’ll tell you the moment they accept.', action: { label: 'Resend invite', onClick: () => toast(TOASTS.inviteSent(first)) } };
  if (c.status === 'complete') return { title: `${first}’s file is complete`, text: `All ${total} documents are received and reviewed.`, bar, action: { label: 'Export documents', onClick: () => go('/export') } };
  if (c.assisted) return { title: `${first} will hand over documents in person`, text: 'Record each document here as you receive it.', action: { label: 'Record documents', onClick: () => go(`/clients/${c.id}/assisted`) } };
  if (c.checklistSentDays == null) return { title: `Send ${first} a checklist`, text: `We’ll suggest documents based on ${first}’s income sources. Add or remove items, or type in your own.`, action: { label: 'Send checklist', onClick: () => go(`/clients/${c.id}/checklist`) } };
  if (flagged) {
    const fresh = !flagged.flaggedDays;
    return {
      warn: true,
      title: `Waiting for ${first} to re-upload ${flagged.title}`,
      text: fresh ? 'Everything else is received. You can send a reminder after 2 days.' : `You flagged it ${daysLabel(flagged.flaggedDays)}: “${flagged.note}”`,
      action: fresh ? null : remind,
    };
  }
  if (total && done === total) return { title: `${first} has submitted all ${total} documents`, text: 'Review each one: view it, or flag it if something is missing or unclear.', bar, action: { label: 'Review documents', onClick: () => go(`/clients/${c.id}/review`) } };
  if (done === 0 && c.checklistSentDays === 0) return { title: `Waiting for ${first} to upload`, text: 'Reminders go out on day 3 and day 7 if nothing comes in.', bar };
  if (done === 0) return { title: `${first} hasn’t uploaded anything yet`, text: `Checklist sent ${daysLabel(c.checklistSentDays)}. Reminders already went out on day 3 and day 7.`, bar, action: remind };
  return { title: `Waiting on ${total - done} more document${total - done === 1 ? '' : 's'} from ${first}`, text: 'Reminders go out automatically. You can nudge them now.', bar, action: remind };
}

function nextStepCard(step, wide) {
  return el('section', { class: `card next-step ${step.warn ? 'next-step--warn' : 'card--highlight'}${wide ? ' next-step--wide' : ''}`, 'aria-live': 'polite' },
    el('div', { class: 'next-step__text' },
      step.warn ? icon('warning') : null,
      el('div', { class: 'stack stack--tight' },
        el('h2', { class: step.warn ? 't-title' : 't-h2', text: step.title }),
        el('p', { class: `t-body${step.warn ? '' : ' c-inverse-muted'}`, text: step.text }),
      ),
    ),
    step.bar ? progress(step.bar) : null,
    step.action ? button({ ...step.action, kind: step.warn ? 'secondary' : 'on-dark', className: 'next-step__action' }) : null,
  );
}

function openAddDocSheet(c) {
  openSheet({
    title: 'Add a document',
    render: (api) => {
      const field = textField({ label: 'Document name', placeholder: 'e.g. Rent receipts' });
      field.input.dataset.autofocus = '';
      const add = button({ label: 'Add & notify', block: true, onClick: () => {
        const v = field.value;
        if (!v) { field.setError('Type a document name to add it.'); return; }
        if (c.checklist.some((d) => d.title.toLowerCase() === v.toLowerCase())) { field.setError(TOASTS.duplicate(v)); return; }
        updateClient(c.id, (x) => { x.checklist.push({ id: `custom-${Date.now()}`, title: v, state: 'todo', custom: true }); x.completed = false; recompute(x); });
        api.close();
        toast('Document added. The client has been notified.');
      } });
      field.input.addEventListener('keydown', (e) => { if (e.key === 'Enter') add.click(); });
      return {
        body: [el('p', { class: 'sheet__sub t-body', text: 'The client gets a notification right away.' }), field.root],
        actions: [add, button({ label: 'Cancel', kind: 'secondary', block: true, onClick: () => api.close() })],
      };
    },
  });
}

export function clientProfile(ctx) {
  const c = getClient(ctx.params.id);
  const first = firstName(c.name);
  const step = nextStep(c);
  const hasDocs = c.checklist.length > 0;
  const subLine = c.status === 'invited' ? (c.email || c.mobile) : `${c.sources} · ${c.sinceLabel}`;
  const docs = [...c.checklist].sort((a, b) => (b.state === 'flagged') - (a.state === 'flagged'));

  const season = hasDocs ? card({
    title: `This season · ${CA.taxYear}`,
    sub: c.assisted ? 'Collecting in person' : c.checklistSentDays == null ? 'No checklist sent yet' : `Checklist sent ${daysLabel(c.checklistSentDays)}`,
    className: 'season-card',
    aside: c.checklistSentDays != null && c.status !== 'complete' ? linkButton({ label: 'Add a document', target: true, onClick: () => openAddDocSheet(c) }) : null,
    children: el('div', { class: 'row-list' }, docs.map((d) => docRow(c, d))),
  }) : null;

  const hist = card({
    title: 'Document history',
    className: 'history-card',
    children: el('div', { class: 'row-list' }, c.history.length
      ? c.history.map((h) => row({ icon: 'folder', title: h.ay, sub: h.detail }))
      : row({ title: 'No earlier filings with you yet', sub: `Past seasons appear here once you have filed for ${first}.` })),
  });

  return screen({
    name: 'client',
    header: backHeader({ bar: 'Clients', backText: 'Back to clients', title: c.name, sub: subLine, aside: statusPill(c, pillText(c)), onBack: back('/clients'), backLabel: 'Back to clients' }),
    flash: flashBanner(c.id),
    body: [
      pageLead({ title: c.name, aside: statusPill(c, pillText(c)), sub: subLine }),
      hasDocs
        ? el('div', { class: 'profile-grid' },
          el('div', { class: 'profile-grid__main' }, season),
          el('div', { class: 'profile-grid__side' }, nextStepCard(step), hist))
        : el('div', { class: 'stack stack--section' }, nextStepCard(step, true), hist),
    ],
  });
}

/* ================= Checklist builder (M-21, M-09 family) ================= */
const drafts = new Map();

export function checklistBuilder(ctx) {
  const c = getClient(ctx.params.id);
  const first = firstName(c.name);
  if (!drafts.has(c.id)) {
    const ids = SUGGESTED_FOR[c.demo ? 'anita' : c.id] || SUGGESTED_FOR.kiran;
    drafts.set(c.id, ids.map((id) => ({ id, title: CHECKLIST_LIBRARY[id].title, state: 'todo', isNew: !c.demo && id === 'rent' })));
  }
  const items = drafts.get(c.id);
  const listHost = el('div', { class: 'checklist-edit' });
  const status = el('p', { class: 'sr-only', 'aria-live': 'polite' });
  const added = el('p', { class: 't-small checklist-added', 'aria-live': 'polite' });
  const helper = el('p', { class: 'screen-footer__caption t-small' });
  const builtFrom = c.history.length ? 'Built from last year’s filing' : `Built from ${first}’s income sources`;

  const send = button({ label: 'Send to client', block: true, onClick: async () => {
    setLoading(send, true, 'Sending…');
    await wait(DEMO.timers.send);
    store.update((s) => {
      const x = s.clients.find((y) => y.id === c.id);
      x.checklist = items.map((d) => ({ id: d.id, title: d.title, state: 'todo', custom: !!d.custom }));
      x.checklistSentDays = 0;
      recompute(x);
      addActivity(s, `Checklist sent to ${x.name}`, 'info', x.id);
      setFlash(s, x.id, `Checklist sent to ${first}`, 'Reminders go out on day 3 and day 7 if nothing comes in.');
      if (x.demo) queue(s, 'upload', x.id, 8000);
    });
    drafts.delete(c.id);
    go(`/clients/${c.id}`, { replace: true, dir: 'back' });
  } });

  const sync = () => {
    send.disabled = !items.length;
    helper.textContent = 'Add at least one document to send the checklist.';
    helper.hidden = items.length > 0;
  };

  const renderList = () => {
    if (!items.length) {
      listHost.replaceChildren(el('div', { class: 'empty empty--inline' },
        el('p', { class: 't-title', text: 'No documents on this checklist' }),
        linkButton({ label: 'Restore suggestions', target: true, onClick: () => { drafts.delete(c.id); router.refresh({ force: true }); } }),
      ));
      return;
    }
    listHost.replaceChildren(el('ul', { class: 'row-list' }, items.map((d, i) => el('li', { class: `row checklist-item${d.fresh ? ' is-new' : ''}` },
      el('span', { class: 'checklist-item__check', 'aria-hidden': 'true' }, icon('check', { strokeWidth: 2.25 })),
      el('span', { class: 'row__text' },
        el('span', { class: 't-body-strong' }, d.title, d.isNew ? el('span', { class: 'badge badge--new', text: 'New' }) : null),
        d.custom ? el('span', { class: 't-small c-muted', text: 'Added by you' }) : null,
      ),
      iconButton({ icon: 'minus', label: `Remove ${d.title}`, onClick: () => {
        items.splice(i, 1);
        status.textContent = `Removed ${d.title}.`;
        renderList(); sync();
      } }),
    ))));
  };

  const field = textField({ label: 'Need something else? Add your own', placeholder: 'e.g. Rent receipts' });
  const addBtn = button({ label: 'Add', kind: 'secondary', onClick: () => {
    const v = field.value;
    added.textContent = '';
    if (!v) { field.setError('Type a document name to add it.'); field.input.focus(); return; }
    if (items.some((d) => d.title.toLowerCase() === v.toLowerCase())) { field.setError(TOASTS.duplicate(v)); field.input.focus(); return; }
    items.forEach((d) => { d.fresh = false; });
    items.push({ id: `custom-${Date.now()}`, title: v, state: 'todo', custom: true, fresh: true });
    field.input.value = '';
    added.textContent = TOASTS.itemAdded(v);
    renderList(); sync();
  } });
  field.input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addBtn.click(); } });

  renderList();
  sync();

  const title = `Checklist for ${c.name}`;
  return screen({
    name: 'checklist',
    header: backHeader({ bar: 'Checklist', backText: `Back to ${c.name}`, title, sub: builtFrom, onBack: back(`/clients/${c.id}`) }),
    body: el('div', { class: 'column' },
      pageLead({ title, sub: builtFrom }),
      el('section', { class: 'card card--glass' },
        el('div', { class: 'section-head section-head--center' },
          el('p', { class: 't-body c-secondary', text: 'Review and edit before sending' }),
          linkButton({ label: 'Clear all', target: true, onClick: async () => {
            if (!items.length) return;
            const ok = await confirmSheet({ title: 'Clear the checklist?', message: 'This removes every document. You can restore the suggestions afterwards.', confirmLabel: 'Clear all', destructive: true });
            if (ok) { items.splice(0, items.length); renderList(); sync(); }
          } }),
        ),
        listHost,
        el('div', { class: 'add-own' }, field.root, addBtn),
        added,
      ),
      status,
    ),
    footer: screenFooter(helper, send),
  });
}

/* ================= Review documents (M-25, M-25b, M-13, M-13b) ================= */
export function reviewDocs(ctx) {
  const c = getClient(ctx.params.id);
  const first = firstName(c.name);
  const docs = c.checklist;
  const submitted = docs.filter((d) => d.state !== 'todo').length;
  const flagged = docs.filter((d) => d.state === 'flagged').length;
  const reviewed = docs.filter((d) => d.state === 'approved').length;
  const sub = flagged
    ? `${c.name} · ${submitted} of ${docs.length} submitted · ${flagged} flagged`
    : reviewed ? `${c.name} · ${reviewed} of ${docs.length} reviewed` : `${c.name} · ${submitted} of ${docs.length} submitted`;

  const rows = docs.map((d) => {
    const actions = d.state === 'todo' ? [pill('neutral', 'Not uploaded')]
      : d.state === 'flagged' ? [button({ label: 'Flagged', kind: 'secondary', disabled: true })]
        : [
          d.state === 'approved' ? pill('success', 'Looks good') : null,
          button({ label: 'View', kind: 'secondary', onClick: () => go(`/clients/${c.id}/review/${d.id}`) }),
          d.state !== 'approved' ? button({ label: 'Flag', kind: 'secondary', onClick: () => go(`/clients/${c.id}/flag/${d.id}`) }) : null,
        ];
    return el('li', { class: `row review-row review-row--${d.state}` },
      iconTile('file'),
      el('span', { class: 'row__text' },
        el('span', { class: 't-body-strong' }, d.title, d.state === 'flagged' ? el('span', { class: 'c-warning', text: ' · flagged' }) : null),
        el('span', { class: 't-small c-muted', text: docSub(d) }),
      ),
      el('span', { class: 'review-row__actions' }, actions),
    );
  });

  const allIn = docs.length && docs.every((d) => d.state !== 'todo');
  const done = button({
    label: flagged || !allIn ? 'Done reviewing' : 'Mark all reviewed',
    block: true,
    onClick: async () => {
      if (!allIn || flagged) {
        store.update((s) => {
          const x = s.clients.find((y) => y.id === c.id);
          x.checklist.forEach((d) => { if (d.state === 'uploaded') d.state = 'approved'; });
          recompute(x);
        });
        go(`/clients/${c.id}`, { replace: true, dir: 'back' });
        return;
      }
      const ok = await confirmSheet({ title: `Mark ${first}’s file complete?`, message: `All ${docs.length} documents will be marked reviewed and ${first} will be told nothing else is needed.`, confirmLabel: 'Mark complete' });
      if (!ok) return;
      store.update((s) => {
        const x = s.clients.find((y) => y.id === c.id);
        x.checklist.forEach((d) => { d.state = 'approved'; });
        x.completed = true;
        recompute(x);
        addActivity(s, `${x.name}’s file marked complete`, 'success', x.id);
      });
      go(`/clients/${c.id}/closed`, { replace: true, dir: 'fade' });
    },
  });

  return screen({
    name: 'review',
    header: backHeader({ bar: 'Review documents', backText: `Back to ${c.name}`, title: 'Review documents', sub, onBack: back(`/clients/${c.id}`) }),
    flash: flashBanner(c.id),
    body: el('div', { class: 'column column--wide' },
      pageLead({ title: 'Review documents', sub }),
      el('section', { class: 'card card--glass' }, el('ul', { class: 'row-list' }, rows)),
    ),
    footer: screenFooter(done),
  });
}

/* ================= View document (M-25a, M-13a, M-13c) ================= */
export function viewDoc(ctx) {
  const c = getClient(ctx.params.id);
  const docs = c.checklist.filter((d) => d.state !== 'todo');
  const idx = docs.findIndex((d) => d.id === ctx.params.docId);
  const d = docs[idx];
  if (!d) { setTimeout(() => go(`/clients/${c.id}/review`, { replace: true })); return screen({ name: 'view-doc' }); }
  const first = firstName(c.name);
  const noPreview = /\.heic$/i.test(d.file || '');
  const nav = (j) => go(`/clients/${c.id}/review/${docs[j].id}`, { replace: true, dir: j > idx ? 'forward' : 'back' });
  const sub = `Submitted by ${c.name} · ${submittedLabel(d.uploadedDays ?? 0)}`;

  const preview = noPreview
    ? el('div', { class: 'doc-preview doc-preview--none' },
      iconTile('alert', 'warning', 'icon-tile--round icon-tile--lg'),
      el('p', { class: 't-title', text: 'Can’t preview this file' }),
      el('p', { class: 't-small c-muted', text: 'This is a phone photo format your browser can’t show. Download it to view.' }))
    : el('div', { class: 'doc-preview', role: 'img', 'aria-label': `Preview of ${d.title}` },
      el('div', { class: 'doc-preview__page' },
        el('div', { class: 'doc-preview__top' },
          icon('file', { size: 18 }),
          el('span', { class: 't-chart-title', text: `${d.title.toUpperCase()} · FY 2025-26` }),
        ),
        ...[78, 92, 64, 88, 40].map((w) => el('span', { class: 'doc-line', vars: { '--w': `${w}%` } })),
        el('div', { class: 'doc-preview__table' }, [0, 1, 2, 3].map(() => el('span', { class: 'doc-cell' }))),
        ...[86, 58].map((w) => el('span', { class: 'doc-line', vars: { '--w': `${w}%` } })),
      ));

  const looks = button({ label: d.state === 'approved' ? 'Reviewed' : 'Looks good', block: true, disabled: d.state === 'approved' || d.state === 'flagged', onClick: () => {
    updateClient(c.id, (x) => { const y = x.checklist.find((z) => z.id === d.id); if (y) y.state = 'approved'; recompute(x); });
    toast(TOASTS.approved(d.title));
    const nextIdx = docs.findIndex((z, j) => j > idx && z.state === 'uploaded');
    if (nextIdx > -1) nav(nextIdx);
    else go(`/clients/${c.id}/review`, { replace: true, dir: 'back' });
  } });
  const flag = button({ label: d.state === 'flagged' ? 'Flagged' : 'Flag this document', kind: 'secondary', block: true, disabled: d.state === 'flagged', onClick: () => go(`/clients/${c.id}/flag/${d.id}`) });
  const download = noPreview ? button({ label: 'Download file', block: true, onClick: () => toast(TOASTS.downloading(d.file), { kind: 'info' }) }) : null;

  return screen({
    name: 'view-doc',
    header: backHeader({ bar: d.title, backText: 'Back to review', title: d.title, sub, onBack: back(`/clients/${c.id}/review`) }),
    body: el('div', { class: 'column column--doc' },
      pageLead({ title: d.title, sub }),
      d.state === 'flagged' ? banner({ kind: 'warning', title: `Waiting for ${first} to re-upload`, text: d.note }) : null,
      el('div', { class: 'doc-view__grid' },
        el('section', { class: 'card card--glass doc-view__preview' }, preview),
        el('section', { class: 'card card--glass doc-view__meta' },
          kvTable([['Checklist item', d.title], ['File', d.file || '—'], ['Size · pages', d.size || '—']]),
          el('div', { class: 'doc-pager' },
            iconButton({ icon: 'chevron-left', label: 'Previous document', outlined: true, onClick: () => idx > 0 && nav(idx - 1) }),
            el('span', { class: 't-label nums', text: `Document ${idx + 1} of ${docs.length}` }),
            iconButton({ icon: 'chevron-right', label: 'Next document', outlined: true, onClick: () => idx < docs.length - 1 && nav(idx + 1) }),
          ),
        ),
      ),
    ),
    footer: screenFooter(download || looks, flag),
  });
}

/* ================= Flag a document (M-27, M-14, M-14b) ================= */
export function flagDoc(ctx) {
  const c = getClient(ctx.params.id);
  const d = c.checklist.find((x) => x.id === ctx.params.docId);
  if (!d) { setTimeout(() => go(`/clients/${c.id}/review`, { replace: true })); return screen({ name: 'flag' }); }
  const first = firstName(c.name);
  const sample = d.id === 'rent' ? 'The March rent entry looks incomplete. Could you upload the full-year rent statement, not just the first half?'
    : d.id === 'brokerPnl' ? 'The March entry in your capital gains statement is missing. Could you download the full-year Tax P&L again?'
      : `This copy of your ${d.title} is hard to read. Could you upload a clearer PDF?`;
  const what = textField({ label: 'What needs fixing?', multiline: true, placeholder: `e.g. ${sample}`, required: true });
  const where = textField({ label: 'Where the client can find it (optional)', placeholder: 'e.g. Net banking → Statements' });
  const quote = el('p', { class: 'quote__text t-body' });
  const whereLine = el('p', { class: 't-small c-muted quote__where' });
  const syncPreview = () => {
    quote.textContent = what.value ? `“${what.value}”` : `Add a short note and ${first} will see it here.`;
    quote.classList.toggle('is-placeholder', !what.value);
    whereLine.textContent = where.value ? `Where to find it: ${where.value}` : '';
  };
  what.input.addEventListener('input', syncPreview);
  where.input.addEventListener('input', syncPreview);
  syncPreview();

  const submit = button({ label: 'Flag & notify client', block: true, onClick: async () => {
    if (!what.value) {
      what.setError(`Tell ${first} what to fix so they know what to upload.`);
      what.input.focus();
      return;
    }
    setLoading(submit, true, 'Flagging…');
    await wait(DEMO.timers.flag);
    store.update((s) => {
      const x = s.clients.find((y) => y.id === c.id);
      const doc = x.checklist.find((z) => z.id === d.id);
      Object.assign(doc, { state: 'flagged', note: what.value, where: where.value, flaggedDays: 0 });
      recompute(x);
      addActivity(s, `You flagged ${x.name}’s ${doc.title}`, 'warning', x.id);
      setFlash(s, x.id, TOASTS.flagged(doc.title, first), 'We’ll send reminders on day 3 and day 7.');
      queue(s, 'reupload', x.id, 9000, { doc: doc.id });
    });
    go(`/clients/${c.id}/review`, { replace: true, dir: 'back' });
  } });

  const sub = `${d.title} · ${c.name}`;
  return screen({
    name: 'flag',
    header: backHeader({ bar: 'Flag a document', backText: 'Back to review', title: 'Flag a document', sub, onBack: back(`/clients/${c.id}/review`) }),
    body: el('div', { class: 'column' },
      pageLead({ title: 'Flag a document', sub }),
      el('section', { class: 'card card--glass fields' }, what.root, where.root),
      el('section', { class: 'card card--glass quote', 'aria-live': 'polite' },
        el('p', { class: 't-small-strong c-muted', text: 'Client will see:' }),
        el('div', { class: 'quote__bubble' }, quote, whereLine),
      ),
    ),
    footer: screenFooter(submit),
  });
}

/* ================= Assisted mode (M-10) ================= */
export function assistedCollect(ctx) {
  const c = getClient(ctx.params.id);
  const first = firstName(c.name);
  const marks = new Map(c.checklist.map((d) => [d.id, d.state === 'collected']));
  const noteField = textField({ label: 'Note', multiline: true, placeholder: 'e.g. Visited 14 June, remaining doc to be dropped off on Friday.', value: c.assistNote || '' });
  const save = button({ label: 'Save & mark collected', block: true, onClick: async () => {
    setLoading(save, true, 'Saving…');
    await wait(600);
    let count = 0;
    store.update((s) => {
      const x = s.clients.find((y) => y.id === c.id);
      x.checklist.forEach((d) => { const on = marks.get(d.id); if (on && d.state !== 'collected') count += 1; d.state = on ? 'collected' : 'todo'; });
      x.assistNote = noteField.value;
      if (x.checklist.every((d) => d.state === 'collected')) { x.assisted = false; x.checklistSentDays = 0; recompute(x); }
      addActivity(s, `Recorded documents collected from ${x.name}`, 'success', x.id);
    });
    toast(count ? `Recorded ${count} document${count === 1 ? '' : 's'} as collected from ${first}.` : TOASTS.saved);
    router.back(`/clients/${c.id}`);
  } });
  const sub = 'Asked for in-person help · you are logging documents as you receive them';
  return screen({
    name: 'assisted',
    header: backHeader({ bar: 'Record documents', backText: `Back to ${c.name}`, title: c.name, sub, onBack: back(`/clients/${c.id}`) }),
    body: el('div', { class: 'column' },
      pageLead({ title: c.name, sub }),
      el('section', { class: 'card card--glass stack' },
        el('h2', { class: 't-title', text: 'Collected' }),
        el('div', { class: 'stack stack--tight' }, c.checklist.map((d) => checkRow({ label: d.title, checked: marks.get(d.id), onToggle: (v) => marks.set(d.id, v) }))),
        noteField.root,
      ),
    ),
    footer: screenFooter(save),
  });
}

/* ================= New requirement (M-06) + explanation (M-07) ================= */
let reqState = null;

export function requirement(ctx) {
  const c = getClient(ctx.params.id);
  const first = firstName(c.name);
  const flag = c.flag || { kind: 'investment', what: 'New investment', detail: 'foreign equity', note: '' };
  const spec = REQUIREMENT_ITEMS[flag.kind] || REQUIREMENT_ITEMS.investment;
  if (ctx.dir !== 'none' || !reqState || reqState.id !== c.id) {
    reqState = {
      id: c.id,
      step: 1,
      message: `Hi ${first}, we noticed a new ${flag.what.replace('New ', '')} this year: ${flag.detail}. To include it in your return, please share your ${spec.items.map((i) => (i.startsWith('Form') ? i : i.charAt(0).toLowerCase() + i.slice(1))).join(', and your ')}. Where to find it: ${spec.where} Thanks, ${CA.first}`,
    };
  }

  if (reqState.step === 1) {
    const title = 'New requirement detected';
    return screen({
      name: 'requirement',
      header: backHeader({ bar: 'New requirement', backText: 'Back to dashboard', title, sub: c.name, onBack: back('/dashboard') }),
      body: el('div', { class: 'column' },
        pageLead({ title, sub: c.name }),
        el('section', { class: 'card card--glass stack' },
          el('h2', { class: 't-title', text: 'Detected' }),
          el('p', { class: 't-body', text: flag.note }),
        ),
        el('section', { class: 'card card--glass stack' },
          el('h2', { class: 't-title', text: 'Suggested checklist addition' }),
          el('ul', { class: 'check-list' }, spec.items.map((i) => el('li', {}, icon('plus', { size: 16 }), el('span', { class: 't-body', text: i })))),
        ),
        el('section', { class: 'card card--glass stack' },
          el('h2', { class: 't-title', text: 'Where the client can find it' }),
          el('p', { class: 't-body', text: spec.where }),
        ),
      ),
      footer: screenFooter(button({ label: 'Flag & continue', block: true, onClick: () => { reqState.step = 2; router.refresh({ force: true }); } })),
    });
  }

  const title = 'Send explanation to client';
  const sub = `Preview message to ${first}`;
  const text = el('p', { class: 'quote__text t-body', text: `“${reqState.message}”` });
  const editor = textField({ label: 'Message', multiline: true, value: reqState.message });
  editor.root.hidden = true;
  editor.input.addEventListener('input', () => { reqState.message = editor.input.value; text.textContent = `“${reqState.message}”`; });
  const edit = button({ label: 'Edit message', kind: 'secondary', block: true, onClick: () => { editor.root.hidden = !editor.root.hidden; if (!editor.root.hidden) editor.input.focus(); } });
  const sendBtn = button({ label: 'Send to client', block: true, onClick: async () => {
    setLoading(sendBtn, true, 'Sending…');
    await wait(900);
    store.update((s) => {
      const x = s.clients.find((y) => y.id === c.id);
      x.flagReviewed = true;
      if (x.checklistSentDays != null) {
        spec.items.forEach((t, i) => { if (!x.checklist.some((d) => d.title === t)) x.checklist.push({ id: `req-${i}-${Date.now()}`, title: t, state: 'todo', custom: true }); });
        x.completed = false;
        recompute(x);
      }
      addActivity(s, `Explanation sent to ${x.name}`, 'info', x.id);
    });
    toast(TOASTS.explainSent);
    router.back('/dashboard');
  } });
  return screen({
    name: 'requirement',
    header: backHeader({ bar: 'Send explanation', backText: 'Back to requirement', title, sub, onBack: () => { reqState.step = 1; router.refresh({ force: true }); }, backLabel: 'Back to requirement' }),
    body: el('div', { class: 'column' },
      pageLead({ title, sub }),
      el('section', { class: 'card card--glass quote' }, el('div', { class: 'quote__bubble' }, text), editor.root),
    ),
    footer: screenFooter(sendBtn, edit),
  });
}

/* ================= Client closed (M-15) ================= */
export function clientClosed(ctx) {
  const c = getClient(ctx.params.id);
  return screen({
    name: 'closed',
    body: el('div', { class: 'done-hero card card--glass' },
      el('span', { class: 'done-hero__mark pop-in', 'aria-hidden': 'true' }, icon('check', { size: 36, strokeWidth: 2.5 })),
      el('h1', { class: 't-h1', tabindex: '-1', text: `${c.name} · Closed` }),
      el('p', { class: 't-body-lg c-secondary', text: 'All received. Nothing pending.' }),
      el('div', { class: 'done-hero__actions' },
        button({ label: 'Back to clients', block: true, onClick: () => go('/clients', { replace: true, dir: 'back' }) }),
      ),
    ),
  });
}

/* ================= Requests tracking (M-11) + reminder cadence (M-12) ================= */
function openScheduleSheet() {
  const sched = { ...S().schedule };
  openSheet({
    title: 'Escalating reminder cadence',
    render: (api) => ({
      body: [
        el('p', { class: 'sheet__sub t-body', text: 'Replaces the “day or two” pattern with a fixed rhythm, so nobody gets chased by hand.' }),
        el('ol', { class: 'stepper' },
          el('li', { class: 'step step--upcoming' }, el('span', { class: 'step__marker', text: String(sched.first) }), el('span', { class: 'step__text' }, el('span', { class: 'step__title', text: `Day ${sched.first} · gentle nudge` }), el('span', { class: 'step__sub t-small', text: 'A friendly reminder sent automatically' }))),
          el('li', { class: 'step step--upcoming' }, el('span', { class: 'step__marker', text: String(sched.second) }), el('span', { class: 'step__text' }, el('span', { class: 'step__title', text: `Day ${sched.second} · priority flag` }), el('span', { class: 'step__sub t-small', text: 'Escalated in your dashboard for follow-up' }))),
        ),
      ],
      actions: [
        button({ label: 'Save settings', block: true, onClick: () => { store.set({ schedule: sched }); api.close(); toast(TOASTS.saved); } }),
        button({ label: 'Cancel', kind: 'secondary', block: true, onClick: () => api.close() }),
      ],
    }),
  });
}

export function tracking() {
  const s = S();
  const live = s.clients.filter((c) => c.status !== 'invited');
  const isReady = (c) => c.status === 'in-progress' && clientProgress(c).done === clientProgress(c).total;
  const ready = live.filter(isReady);
  const waiting = live.filter((c) => !c.filler && c.checklistSentDays != null && c.status !== 'complete' && !isReady(c));
  const done = live.filter((c) => c.status === 'complete');
  const text = (c) => (c.trackText && c.status === c.trackFor ? c.trackText : stageText(c));

  const group = (title, count, content, aside) => el('section', { class: 'card card--glass stack' },
    el('div', { class: 'section-head section-head--center' },
      el('h2', { class: 't-title track-title' }, title, el('span', { class: 'count-badge nums', text: String(count) })),
      aside || null,
    ),
    content,
  );
  const remindBtn = (c) => {
    const sent = s.reminded.includes(c.id);
    return button({ label: sent ? 'Reminded' : 'Send reminder', kind: 'secondary', disabled: sent, onClick: () => {
      store.update((x) => { x.reminded.push(c.id); addActivity(x, `Reminder sent to ${c.name}`, 'info', c.id); });
      toast(TOASTS.reminderSent(firstName(c.name)));
    } });
  };
  const trow = (c, action) => el('div', { class: 'track-row' },
    el('button', { type: 'button', class: 'track-row__main', onclick: () => go(`/clients/${c.id}`) },
      avatar(c.initials),
      el('span', { class: 'row__text' }, el('span', { class: 't-body-strong', text: c.name }), el('span', { class: 't-small c-muted', text: text(c) })),
    ),
    el('span', { class: 'track-row__pill' }, statusPill(c)),
    action,
  );
  const leadSub = 'Every checklist you’ve sent this season, grouped by who needs to act next.';

  return screen({
    name: 'tracking',
    header: backHeader({ bar: 'Track requests', backText: 'Back to clients', title: 'Track requests', sub: `Who’s waiting on what: ${leadSub.charAt(0).toLowerCase()}${leadSub.slice(1)}`, onBack: back('/clients'), backLabel: 'Back to clients' }),
    body: [
      pageLead({ title: 'Who’s waiting on what', sub: leadSub }),
      group('Waiting on you', ready.length, ready.length
        ? el('div', { class: 'stack stack--tight' }, ready.map((c) => trow(c, button({ label: 'Review', onClick: () => go(`/clients/${c.id}/review`) }))))
        : el('p', { class: 'empty-line t-body c-muted' }, icon('check-circle', { size: 16 }), el('span', { text: 'Nothing waiting on you.' }))),
      group('Waiting on the client', waiting.length,
        waiting.length
          ? el('div', { class: 'stack stack--tight' }, waiting.map((c) => trow(c, remindBtn(c))))
          : el('p', { class: 'empty-line t-body c-muted' }, el('span', { text: 'No one to chase right now.' })),
        el('div', { class: 'track-note' },
          el('span', { class: 't-small c-secondary', text: `Reminders go out on day ${s.schedule.first} and day ${s.schedule.second}.` }),
          linkButton({ label: 'Change schedule', target: true, onClick: openScheduleSheet }),
        )),
      group('Done', done.length, done.length
        ? el('div', { class: 'stack stack--tight' }, trow(done[0], el('span', { class: 'track-row__chev', 'aria-hidden': 'true' }, icon('chevron-right'))), done.length > 1 ? el('p', { class: 't-small c-muted', text: `and ${done.length - 1} more` }) : null)
        : el('p', { class: 'empty-line t-body c-muted' }, el('span', { text: 'No completed files yet.' }))),
    ],
  });
}

/* ================= Export (M-16) ================= */
export function exportList() {
  const s = S();
  const soft = softwareLabel(s.practice.software);
  const ready = s.clients.filter((c) => c.status === 'complete');
  const exportRow = (c) => {
    const done = s.exported.includes(c.id);
    const btn = button({ label: done ? 'Exported' : `Export to ${soft}`, kind: done ? 'secondary' : 'primary', disabled: done, onClick: async () => {
      setLoading(btn, true, 'Exporting…');
      await wait(1100);
      store.update((x) => { x.exported.push(c.id); addActivity(x, `Exported ${c.name}’s documents to ${soft}`, 'success', c.id); });
      toast(TOASTS.exportSent(soft));
    } });
    return el('div', { class: 'export-row' },
      el('span', { class: 'row__text' },
        el('span', { class: 't-body-strong', text: `${c.name} · ${c.checklist.length} documents` }),
        el('span', { class: 't-small c-muted', text: 'Winman / Genius-compatible format' })),
      btn,
    );
  };

  return screen({
    name: 'export',
    header: tabHeader({ title: 'Export' }),
    body: [
      pageLead({ title: 'Export' }),
      el('section', { class: 'card card--glass stack' },
        el('h2', { class: 't-title', text: 'Ready to export' }),
        ready.length ? el('div', { class: 'stack stack--tight' }, ready.map(exportRow))
          : emptyState({ icon: 'download', title: 'Nothing to export yet', text: 'Files appear here once you mark a client complete.', action: { label: 'Go to clients', kind: 'secondary', onClick: () => go('/clients') } }),
      ),
    ],
  });
}

/* ================= Settings (M-17, M-17b, M-17c) ================= */
export function settings() {
  const p = S().practice;
  return screen({
    name: 'settings',
    header: tabHeader({ title: 'Settings' }),
    body: [
      pageLead({ title: 'Settings' }),
      el('section', { class: 'card card--glass settings-card' },
        el('h2', { class: 'card__group-label t-small-strong', text: 'PRACTICE' }),
        el('div', { class: 'group' },
          row({ icon: 'home', title: 'Practice details', sub: `${p.kind === 'team' ? 'Team practice' : 'Solo practice'} · ${softwareLabel(p.software)}`, chevron: true, onClick: () => go('/settings/practice') }),
          row({ icon: 'users', title: 'Team & assistant access', sub: p.team.length ? `${p.team.length} invited` : 'Add team members', chevron: true, onClick: () => go('/settings/team') }),
        ),
      ),
      el('section', { class: 'card card--glass settings-card' },
        el('h2', { class: 'card__group-label t-small-strong', text: 'ABOUT' }),
        el('div', { class: 'group' },
          row({ icon: 'help', title: 'Help & support', chevron: true, onClick: () => toast(TOASTS.help, { kind: 'info' }) }),
          row({ icon: 'logout', title: 'Log out', chevron: true, onClick: async () => {
            const ok = await confirmSheet({ title: 'Log out?', message: 'You can log back in any time.', confirmLabel: 'Log out', destructive: true });
            if (ok) { store.reset(); toast(TOASTS.loggedOut, { kind: 'info' }); go('/welcome', { replace: true, dir: 'fade' }); }
          } }),
        ),
      ),
    ],
  });
}

export function settingsPractice() {
  const p = { ...S().practice, team: [...S().practice.team] };
  const save = button({ label: 'Save changes', block: true, onClick: async () => {
    setLoading(save, true, 'Saving…');
    await wait(500);
    store.set({ practice: p });
    toast(TOASTS.saved);
    router.back('/settings');
  } });
  return screen({
    name: 'settings-practice',
    header: backHeader({ bar: 'Practice details', backText: 'Back to settings', title: 'Practice details', onBack: back('/settings'), backLabel: 'Back to settings' }),
    body: el('div', { class: 'column' },
      pageLead({ title: 'Practice details' }),
      el('section', { class: 'card card--glass stack' }, el('h2', { class: 't-title', text: 'Practice type' }),
        radioCards({ label: 'Practice type', options: PRACTICE_OPTIONS, value: p.kind, onChange: (v) => { p.kind = v; } })),
      el('section', { class: 'card card--glass stack' },
        el('div', { class: 'stack stack--tight' },
          el('h2', { class: 't-title', text: 'Software you use' }),
          el('p', { class: 't-small c-muted', text: 'Shown on your home page, so you always see where exports go.' })),
        radioCards({ label: 'Software', options: SOFTWARE_OPTIONS, value: p.software, onChange: (v) => { p.software = v; } })),
    ),
    footer: screenFooter(save),
  });
}

const teamDraft = { value: '' };

export function settingsTeam() {
  const team = S().practice.team;
  const field = textField({ label: 'Email address', type: 'email', inputmode: 'email', placeholder: 'asha@yourpractice.in', value: teamDraft.value, onInput: (v) => { teamDraft.value = v; } });
  field.input.dataset.key = 'team-email';
  const send = button({ label: 'Send invite', block: true, onClick: async () => {
    const v = field.value;
    if (!EMAIL_RE.test(v)) { field.setError('Enter a valid email address.'); field.input.focus(); return; }
    if (team.includes(v)) { field.setError('That person is already invited.'); return; }
    setLoading(send, true, 'Sending…');
    await wait(700);
    teamDraft.value = '';
    store.update((s) => { s.practice.team.push(v); if (s.practice.kind === 'solo') s.practice.kind = 'team'; });
    toast(`Invite sent to ${v}.`);
  } });
  field.input.addEventListener('keydown', (e) => { if (e.key === 'Enter') send.click(); });
  const sub = 'Team members can see your clients and work on them with you.';
  return screen({
    name: 'settings-team',
    header: backHeader({ bar: 'Team & assistant access', backText: 'Back to settings', title: 'Team & assistant access', sub, onBack: back('/settings'), backLabel: 'Back to settings' }),
    body: el('div', { class: 'column' },
      pageLead({ title: 'Team & assistant access', sub }),
      el('section', { class: 'card card--glass invite-card' },
        el('h2', { class: 't-title', text: 'Invite a team member' }),
        field.root,
        send,
      ),
      team.length
        ? card({ title: 'Invited', children: el('div', { class: 'row-list' }, team.map((e) => row({ lead: avatar(e[0].toUpperCase()), title: e, sub: 'Invite sent, waiting to accept', trailing: pill('neutral', 'Invited') }))) })
        : card({ children: emptyState({ icon: 'users', title: 'No team members yet', text: 'Invited people appear here once they accept.' }) }),
    ),
  });
}

/* ================= Season closed (M-18) ================= */
export function seasonClosed() {
  return screen({
    name: 'season-closed',
    body: el('div', { class: 'done-hero card card--glass' },
      el('span', { class: 'done-hero__mark done-hero__mark--success pop-in', 'aria-hidden': 'true' }, icon('check', { size: 36, strokeWidth: 2.5 })),
      el('h1', { class: 't-h1', tabindex: '-1', text: 'Season closed.' }),
      el('p', { class: 't-body-lg c-secondary', text: 'Filed 3 days ahead of schedule.' }),
      el('p', { class: 't-body c-muted', text: 'Not chasing anyone. Just filing · the payoff of a season run well.' }),
      el('div', { class: 'done-hero__actions' }, button({ label: 'Back to Dashboard', block: true, onClick: () => go('/dashboard', { replace: true, dir: 'fade' }) })),
    ),
  });
}
