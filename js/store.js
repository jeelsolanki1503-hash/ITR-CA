import { CLIENTS, ACTIVITY_SEED } from './data.js';

const KEY = 'itr-ca-v1';
const listeners = new Set();
let storageOK = true;

function readStorage() {
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && parsed.version === 3 ? parsed : null;
  } catch {
    storageOK = false;
    return null;
  }
}

function writeStorage(value) {
  if (!storageOK) return;
  try { window.localStorage.setItem(KEY, JSON.stringify(value)); } catch { storageOK = false; }
}

function clearStorage() {
  try { window.localStorage.removeItem(KEY); } catch { storageOK = false; }
}

let uid = Date.now();
export const nextId = () => (uid += 1).toString(36);

const clone = (v) => (typeof structuredClone === 'function' ? structuredClone(v) : JSON.parse(JSON.stringify(v)));

export function freshState() {
  return {
    version: 3,
    session: null,
    onboarded: false,
    obStep: null,
    returning: false,
    profile: null,
    practice: { kind: 'solo', software: 'winman', team: [] },
    clients: [],
    activity: [],
    pending: [],
    flash: null,
    bellUnread: false,
    seasonClosed: false,
    exported: [],
    reminded: [],
    notify: { email: true, whatsapp: true, sms: false, deadline: true },
    schedule: { first: 3, second: 7 },
  };
}

export function seedReturning(base) {
  const clients = clone(CLIENTS).map((c) => ({ ...c, completed: c.status === 'complete' }));
  return {
    ...base,
    session: { email: base.profile?.email || 'deepak@deepakmehta.in' },
    onboarded: true,
    obStep: null,
    returning: true,
    practice: { kind: 'solo', software: 'winman', team: [] },
    clients,
    activity: ACTIVITY_SEED.map((a) => ({ id: nextId(), text: a.text, kind: a.kind, at: Date.now() - a.min * 60000, client: a.client })),
    bellUnread: true,
  };
}

let state = readStorage() || freshState();

function emit(prev) {
  listeners.forEach((fn) => { try { fn(state, prev); } catch (err) { console.error(err); } });
}

export const store = {
  get state() { return state; },
  get persistent() { return storageOK; },

  set(patch) {
    const prev = state;
    state = { ...state, ...patch };
    writeStorage(state);
    emit(prev);
  },

  update(mutator) {
    const prev = state;
    const draft = clone(state);
    const out = mutator(draft);
    state = out || draft;
    writeStorage(state);
    emit(prev);
  },

  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  reset() {
    clearStorage();
    const prev = state;
    state = freshState();
    emit(prev);
  },
};

/* ---------------- Client helpers (pure, take a client object) ---------------- */
export const firstName = (name) => name.split(' ')[0];

export const isIn = (d) => d.state === 'uploaded' || d.state === 'approved' || d.state === 'collected';

export function clientProgress(c) {
  const total = c.checklist.length;
  const done = c.checklist.filter(isIn).length;
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}

export function daysLabel(n) {
  if (n == null) return '';
  if (n === 0) return 'just now';
  if (n === 1) return 'yesterday';
  return `${n} days ago`;
}

export function submittedLabel(n) {
  if (n === 0) return 'today';
  return daysLabel(n);
}

// Re-derives status from the checklist, after any change.
export function recompute(c) {
  if (c.status === 'invited') return c;
  if (c.completed) { c.status = 'complete'; return c; }
  if (c.checklist.some((d) => d.state === 'flagged')) c.status = 'needs-correction';
  else if (c.checklistSentDays == null || !c.checklist.some(isIn)) c.status = 'not-started';
  else c.status = 'in-progress';
  return c;
}

export function stageText(c) {
  const first = firstName(c.name);
  const { done, total } = clientProgress(c);
  const flagged = c.checklist.filter((d) => d.state === 'flagged');
  if (c.status === 'invited') return `Invite sent ${daysLabel(c.invitedDays ?? 0)} , waiting for ${first} to accept`;
  if (c.status === 'complete') return `All ${total} documents received`;
  if (c.assisted) return 'Asked for in-person help';
  if (c.checklistSentDays == null) return c.acceptedDays === 0 ? `Accepted just now, send ${first} the checklist` : 'Checklist not sent yet';
  if (flagged.length === 1) return c.flagStage && flagged[0].flaggedDays ? c.flagStage : `1 document needs a fix, waiting on ${first}`;
  if (flagged.length > 1) return `${flagged.length} documents need a fix, waiting on ${first}`;
  if (total && done === total) return `All ${total} documents uploaded, ready for you to review`;
  if (done === 0) return c.checklistSentDays === 0 ? `Checklist sent just now, waiting for ${first}` : `Checklist sent ${daysLabel(c.checklistSentDays)}, no reply yet`;
  return `${done} of ${total} documents uploaded`;
}

export function pillText(c) {
  const first = firstName(c.name);
  const { done, total } = clientProgress(c);
  switch (c.status) {
    case 'invited': return 'Invite sent';
    case 'complete': return 'Complete · all documents received';
    case 'needs-correction': return `Needs correction · waiting on ${first}`;
    case 'in-progress': return done === total ? 'In progress · ready for your review' : `In progress · ${done} of ${total} uploaded`;
    default:
      if (c.assisted) return 'Not started · Asked for in-person help';
      if (c.checklistSentDays == null) return 'Not started · Checklist not sent';
      if (c.checklistSentDays === 0) return 'Not started · Checklist sent just now';
      return `Not started · no reply for ${c.checklistSentDays} days`;
  }
}

export function countsByStatus(clients) {
  const out = { all: 0, 'not-started': 0, 'in-progress': 0, 'needs-correction': 0, complete: 0 };
  clients.forEach((c) => {
    if (c.status === 'invited') return;
    out.all += 1;
    out[c.status] = (out[c.status] || 0) + 1;
  });
  return out;
}

export function addActivity(s, text, kind = 'info', client = null) {
  s.activity.unshift({ id: nextId(), text, at: Date.now(), kind, client, fresh: true });
  s.activity = s.activity.slice(0, 20);
  s.bellUnread = true;
}

export function setFlash(s, client, title, text = '') {
  s.flash = { client, title, text, at: Date.now() };
}

export function readFlash(clientId) {
  const f = state.flash;
  if (!f || f.client !== clientId) return null;
  if (Date.now() - f.at > 30000) return null;
  return f;
}

export function queue(s, type, client, delay, extra = {}) {
  s.pending = s.pending.filter((p) => !(p.type === type && p.client === client));
  s.pending.push({ type, client, at: Date.now() + delay, ...extra });
}
