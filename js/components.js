import { icon, logo } from './icons.js';

/* ---------------- DOM helper ---------------- */
export function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, val] of Object.entries(props || {})) {
    if (val == null || val === false) continue;
    if (key === 'class') node.className = val;
    else if (key === 'text') node.textContent = val;
    else if (key === 'dataset') Object.assign(node.dataset, val);
    else if (key === 'vars') for (const [k, v] of Object.entries(val)) node.style.setProperty(k, v);
    else if (key.startsWith('on') && typeof val === 'function') node.addEventListener(key.slice(2).toLowerCase(), val);
    else if (key === 'value') node.value = val;
    else if (val === true) node.setAttribute(key, '');
    else node.setAttribute(key, val);
  }
  appendChildren(node, children);
  return node;
}

export function appendChildren(node, children) {
  for (const child of children.flat(Infinity)) {
    if (child == null || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

let idSeq = 0;
export const uid = (prefix = 'c') => `${prefix}-${(idSeq += 1)}`;

/* ---------------- Formatting ---------------- */
const inr = new Intl.NumberFormat('en-IN');
export const formatINR = (n) => `₹${inr.format(n)}`;
export const digitsOnly = (s) => String(s || '').replace(/\D+/g, '');

export function maskMobile(mobile) {
  const d = digitsOnly(mobile).slice(-10);
  if (d.length < 10) return `+91 ${mobile}`;
  return `+91 ${d.slice(0, 2)}••• ••${d.slice(7)}`;
}

export function formatMobile(mobile) {
  const d = digitsOnly(mobile).slice(-10);
  return d.length === 10 ? `+91 ${d.slice(0, 5)} ${d.slice(5)}` : mobile;
}

export function relativeTime(ts) {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min} min ago`;
  const hours = Math.floor(min / 60);
  const today = new Date();
  const then = new Date(ts);
  const sameDay = today.toDateString() === then.toDateString();
  if (sameDay && hours < 6) return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  if (sameDay) return 'Earlier today';
  const y = new Date(today); y.setDate(today.getDate() - 1);
  if (y.toDateString() === then.toDateString()) return 'Yesterday';
  const days = Math.max(2, Math.round(diff / 86400000));
  return `${days} days ago`;
}

export function formatBytes(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/* ---------------- Buttons and links ---------------- */
export function button({ label, kind = 'primary', icon: ic, iconRight, onClick, block = false, disabled = false, softDisabled = false, type = 'button', ariaLabel, id, className = '', describedBy } = {}) {
  const btn = el('button', {
    type,
    id,
    class: `btn btn--${kind}${block ? ' btn--block' : ''}${className ? ` ${className}` : ''}`,
    'aria-label': ariaLabel,
    'aria-describedby': describedBy,
  });
  if (ic) btn.append(icon(ic));
  btn.append(el('span', { class: 'btn__label', text: label }));
  if (iconRight) btn.append(icon(iconRight));
  if (disabled) btn.disabled = true;
  if (softDisabled) btn.setAttribute('aria-disabled', 'true');
  if (onClick) btn.addEventListener('click', (e) => {
    if (btn.getAttribute('aria-disabled') === 'true' && !btn.dataset.allowSoft) { btn.dispatchEvent(new CustomEvent('blocked', { bubbles: true })); return; }
    onClick(e);
  });
  return btn;
}

export function setLoading(btn, on, text) {
  const label = btn.querySelector('.btn__label');
  if (on) {
    if (btn.classList.contains('is-loading')) return;
    btn.dataset.label = label.textContent;
    btn.classList.add('is-loading');
    btn.setAttribute('aria-busy', 'true');
    btn.prepend(el('span', { class: 'spinner', 'aria-hidden': 'true' }));
    if (text) label.textContent = text;
  } else {
    btn.classList.remove('is-loading');
    btn.removeAttribute('aria-busy');
    btn.querySelector('.spinner')?.remove();
    if (btn.dataset.label) label.textContent = btn.dataset.label;
  }
}

export function iconButton({ icon: ic, label, onClick, outlined = false, dot = false, className = '' }) {
  const btn = el('button', {
    type: 'button',
    class: `icon-btn${outlined ? ' icon-btn--outlined' : ''}${className ? ` ${className}` : ''}`,
    'aria-label': label,
    onclick: onClick,
  }, icon(ic));
  if (dot) btn.append(el('span', { class: 'icon-btn__dot', 'aria-hidden': 'true' }));
  return btn;
}

export function linkButton({ label, onClick, className = '', target = false }) {
  return el('button', { type: 'button', class: `link${target ? ' link--target' : ''}${className ? ` ${className}` : ''}`, onclick: onClick, text: label });
}

/* ---------------- Text field ---------------- */
export function textField({ id = uid('f'), label, value = '', type = 'text', placeholder = '', helper = '', inputmode, autocomplete, readonly = false, disabled = false, multiline = false, maxlength, list, prefix, trailing, required = false, onInput, onBlur, ariaLabel }) {
  const helperId = `${id}-help`;
  const errorId = `${id}-err`;
  const input = el(multiline ? 'textarea' : 'input', {
    id,
    class: `field__input${trailing || readonly ? ' has-trailing' : ''}`,
    type: multiline ? null : type,
    placeholder,
    inputmode,
    autocomplete,
    maxlength,
    list,
    'aria-label': ariaLabel,
    'aria-describedby': helper ? helperId : null,
    'aria-required': required ? 'true' : null,
    spellcheck: type === 'email' || type === 'tel' ? 'false' : null,
  });
  input.value = value;
  if (readonly) input.readOnly = true;
  if (disabled) input.disabled = true;

  const control = el('div', { class: 'field__control' }, input);
  if (prefix) {
    control.prepend(el('span', { class: 'field__prefix', 'aria-hidden': 'true', text: prefix }));
  }
  const trailingSlot = el('span', { class: 'field__trailing', 'aria-hidden': 'true' });
  if (readonly) trailingSlot.append(icon('lock'));
  else if (trailing) trailingSlot.append(trailing);
  control.append(trailingSlot);

  const root = el('div', { class: `field${prefix ? ` field--prefix${prefix.length > 1 ? ' field--prefix-lg' : ''}` : ''}` },
    label ? el('label', { class: 'field__label t-label', for: id, text: label }) : null,
    control,
    helper ? el('p', { class: 'field__helper t-small', id: helperId, text: helper }) : null,
  );

  let errorNode = null;
  const nativeTrailing = type === 'date' || !!list;
  const api = {
    root,
    input,
    get value() { return input.value.trim(); },
    set value(v) { input.value = v; },
    setError(msg) {
      root.classList.add('is-error');
      input.setAttribute('aria-invalid', 'true');
      if (!nativeTrailing) trailingSlot.replaceChildren(icon('alert'));
      if (!errorNode) {
        errorNode = el('p', { class: 'field__error', id: errorId, role: 'alert' }, icon('alert', { size: 16 }), el('span'));
        control.after(errorNode);
      }
      errorNode.lastChild.textContent = msg;
      input.setAttribute('aria-describedby', [errorId, helper ? helperId : ''].filter(Boolean).join(' '));
    },
    clearError() {
      root.classList.remove('is-error');
      input.removeAttribute('aria-invalid');
      trailingSlot.replaceChildren(readonly ? icon('lock') : (trailing || ''));
      errorNode?.remove();
      errorNode = null;
      if (helper) input.setAttribute('aria-describedby', helperId); else input.removeAttribute('aria-describedby');
    },
  };
  input.addEventListener('input', () => { if (errorNode) api.clearError(); onInput?.(input.value, api); });
  if (onBlur) input.addEventListener('blur', () => onBlur(input.value, api));
  return api;
}

export function amountField(opts) {
  const f = textField({ ...opts, inputmode: 'numeric', prefix: '₹', autocomplete: 'off' });
  f.input.addEventListener('input', () => {
    const d = digitsOnly(f.input.value).slice(0, 12);
    f.input.value = d ? inr.format(Number(d)) : '';
  });
  return f;
}

/* ---------------- OTP ---------------- */
export function otpInput({ length = 6, label = 'Verification code', onComplete, onChange } = {}) {
  const inputs = [];
  const group = el('div', { class: 'otp', role: 'group', 'aria-label': label });
  const valueOf = () => inputs.map((i) => i.value).join('');
  const sync = () => {
    inputs.forEach((i) => i.classList.toggle('is-filled', !!i.value));
    group.classList.remove('is-error');
    onChange?.(valueOf());
    if (valueOf().length === length) onComplete?.(valueOf());
  };
  for (let i = 0; i < length; i += 1) {
    const input = el('input', {
      class: 'otp__digit',
      inputmode: 'numeric',
      autocomplete: i === 0 ? 'one-time-code' : 'off',
      maxlength: i === 0 ? String(length) : '1',
      'aria-label': `Digit ${i + 1} of ${length}`,
    });
    input.addEventListener('input', () => {
      const d = digitsOnly(input.value);
      if (d.length > 1) {
        d.slice(0, length - i).split('').forEach((ch, k) => { inputs[i + k].value = ch; });
        inputs[Math.min(i + d.length, length - 1)].focus();
      } else {
        input.value = d;
        if (d && i < length - 1) inputs[i + 1].focus();
      }
      sync();
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && i > 0) { inputs[i - 1].focus(); inputs[i - 1].value = ''; sync(); e.preventDefault(); }
      if (e.key === 'ArrowLeft' && i > 0) { inputs[i - 1].focus(); e.preventDefault(); }
      if (e.key === 'ArrowRight' && i < length - 1) { inputs[i + 1].focus(); e.preventDefault(); }
    });
    input.addEventListener('focus', () => input.select());
    inputs.push(input);
    group.append(input);
  }
  return {
    root: group,
    get value() { return valueOf(); },
    setError(on) { group.classList.toggle('is-error', on); inputs.forEach((i) => i.setAttribute('aria-invalid', on ? 'true' : 'false')); if (on) { group.classList.remove('shake'); void group.offsetWidth; group.classList.add('shake'); } },
    clear() { inputs.forEach((i) => { i.value = ''; }); sync(); inputs[0].focus(); },
    focus() { (inputs.find((i) => !i.value) || inputs[length - 1]).focus(); },
  };
}

/* ---------------- Selection controls ---------------- */
function checkBox() {
  return el('span', { class: 'check', 'aria-hidden': 'true' }, icon('check', { size: 14, strokeWidth: 3 }));
}

export function optionCard({ title, desc, checked = false, onToggle }) {
  const btn = el('button', { type: 'button', class: 'option-card', role: 'checkbox', 'aria-checked': String(checked) },
    checkBox(),
    el('span', { class: 'option-card__text' },
      el('span', { class: 't-title', text: title }),
      desc ? el('span', { class: 'option-card__desc t-small', text: desc }) : null,
    ),
  );
  btn.addEventListener('click', () => {
    const next = btn.getAttribute('aria-checked') !== 'true';
    btn.setAttribute('aria-checked', String(next));
    onToggle?.(next);
  });
  return btn;
}

export function checkRow({ label, checked = false, onToggle }) {
  const btn = el('button', { type: 'button', class: 'check-row', role: 'checkbox', 'aria-checked': String(checked) }, checkBox(), el('span', { text: label }));
  btn.addEventListener('click', () => {
    const next = btn.getAttribute('aria-checked') !== 'true';
    btn.setAttribute('aria-checked', String(next));
    onToggle?.(next);
  });
  return btn;
}

export function chipGroup({ label, options, selected = [], onChange }) {
  const group = el('div', { class: 'chip-group', role: 'group', 'aria-label': label });
  const current = new Set(selected);
  options.forEach((opt) => {
    const chip = el('button', { type: 'button', class: 'chip', role: 'checkbox', 'aria-checked': String(current.has(opt.id)) },
      icon('check', { size: 16, strokeWidth: 2.25 }), el('span', { text: opt.label }));
    chip.addEventListener('click', () => {
      if (current.has(opt.id)) current.delete(opt.id); else current.add(opt.id);
      chip.setAttribute('aria-checked', String(current.has(opt.id)));
      onChange?.([...current]);
    });
    group.append(chip);
  });
  return group;
}

export function toggleRow({ title, desc, checked = false, onChange }) {
  const btn = el('button', { type: 'button', class: 'toggle-row', role: 'switch', 'aria-checked': String(checked) },
    el('span', { class: 'toggle-row__text' },
      el('span', { class: 't-label', text: title }),
      desc ? el('span', { class: 'toggle-row__desc t-small', text: desc }) : null,
    ),
    el('span', { class: 'toggle', 'aria-hidden': 'true' }),
  );
  btn.addEventListener('click', () => {
    const next = btn.getAttribute('aria-checked') !== 'true';
    btn.setAttribute('aria-checked', String(next));
    onChange?.(next);
  });
  return btn;
}

/* ---------------- Status ---------------- */
const PILL_ICON = { neutral: 'ring', info: 'info', success: 'check-circle', warning: 'warning', danger: 'x-circle' };
export function pill(kind, label) {
  return el('span', { class: `pill pill--${kind}` }, icon(PILL_ICON[kind] || 'ring', { size: 16 }), el('span', { text: label }));
}

export function badge(label) {
  return el('span', { class: 'badge', text: label });
}

export function progress({ value = 0, max = 1, label, right, kind = '', ariaLabel, labelClass = 't-small-strong' }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  const track = el('div', {
    class: 'progress__track',
    role: 'progressbar',
    'aria-valuemin': '0',
    'aria-valuemax': String(max),
    'aria-valuenow': String(value),
    'aria-label': ariaLabel || label || 'Progress',
  }, el('div', { class: 'progress__fill', vars: { '--progress': `${pct}%` } }));
  const labels = (label || right) ? el('div', { class: 'progress__labels' },
    label ? el('span', { class: `${labelClass} progress__value`, text: label }) : el('span'),
    right ? (right instanceof Node ? right : el('span', { class: 't-small c-muted', text: right })) : null,
  ) : null;
  return el('div', { class: `progress${kind ? ` progress--${kind}` : ''}` }, labels, track);
}

export function spinner(size = '') {
  return el('span', { class: `spinner${size ? ` spinner--${size}` : ''}`, 'aria-hidden': 'true' });
}

export function skeletonRow() {
  return el('div', { class: 'skeleton-row', 'aria-hidden': 'true' },
    el('span', { class: 'skeleton skeleton--line skeleton--short' }),
    el('span', { class: 'skeleton skeleton--line skeleton--long' }),
  );
}

/* ---------------- Stepper ---------------- */
export function stepper(steps, { label = 'Your filing progress' } = {}) {
  const list = el('ol', { class: 'stepper stepper--responsive', 'aria-label': label });
  steps.forEach((s, i) => {
    const marker = el('span', { class: 'step__marker', 'aria-hidden': 'true' });
    if (s.state === 'done') marker.append(icon('check', { size: 16, strokeWidth: 2.5 }));
    else if (s.state === 'upcoming') marker.textContent = String(i + 1);
    list.append(el('li', { class: `step step--${s.state}`, 'aria-current': s.state === 'current' ? 'step' : null },
      marker,
      el('span', { class: 'step__text' },
        el('span', { class: 'step__title', text: s.title }),
        el('span', { class: 'step__sub t-small', text: s.sub }),
        el('span', { class: 'sr-only', text: s.state === 'done' ? 'Done' : s.state === 'current' ? 'In progress' : 'Not started' }),
      ),
    ));
  });
  return list;
}

/* ---------------- Cards and rows ---------------- */
export function card({ variant = 'glass', title, sub, titleTag = 'h2', titleClass = 't-title', className = '', aside, children = [], label } = {}) {
  const head = (title || sub || aside) ? el('div', { class: 'card__head' },
    el('div', { class: 'card__head-text' },
      title ? el(titleTag, { class: `card__title ${titleClass}`, text: title }) : null,
      sub ? el('p', { class: 'card__sub t-body', text: sub }) : null,
    ),
    aside || null,
  ) : null;
  return el('section', { class: `card card--${variant}${className ? ` ${className}` : ''}`, 'aria-label': label }, head, children);
}

export function highlightCard({ title, message, bar, action, className = '' }) {
  const text = el('div', { class: 'highlight__text' },
    el('h2', { class: 't-h2', text: title }),
    message ? el('p', { class: 'highlight__msg t-body', text: message }) : null,
  );
  const barNode = bar ? progress({ ...bar, labelClass: 't-small-strong' }) : null;
  barNode?.classList.add('highlight__bar');
  return el('section', { class: `card card--highlight highlight${className ? ` ${className}` : ''}`, 'aria-live': 'polite' },
    text,
    barNode,
    action ? button({ ...action, kind: 'on-dark', className: 'highlight__action' }) : null,
  );
}

export function iconTile(name, variant = '', extra = '') {
  return el('span', { class: `icon-tile${variant ? ` icon-tile--${variant}` : ''}${extra ? ` ${extra}` : ''}`, 'aria-hidden': 'true' }, icon(name));
}

export function actionCard({ icon: ic, label, onClick }) {
  return el('button', { type: 'button', class: 'action-card', onclick: onClick },
    el('span', { class: 'action-card__icon' }, iconTile(ic, 'accent')),
    el('span', { class: 'action-card__label t-body-strong', text: label }),
    el('span', { class: 'action-card__chev', 'aria-hidden': 'true' }, icon('chevron-right')),
  );
}

export function row({ icon: ic, iconVariant = '', lead, title, sub, trailing, chevron = false, onClick, className = '', titleClass = 't-body-strong', subClass = 't-small' }) {
  const tag = onClick ? 'button' : 'div';
  const node = el(tag, { type: onClick ? 'button' : null, class: `row${className ? ` ${className}` : ''}`, onclick: onClick },
    lead || (ic ? iconTile(ic, iconVariant) : null),
    el('span', { class: 'row__text' },
      el('span', { class: `row__title ${titleClass}`, text: title }),
      sub ? el('span', { class: `row__sub ${subClass}`, text: sub }) : null,
    ),
    (trailing || chevron) ? el('span', { class: 'row__trailing' }, trailing || null, chevron ? icon('chevron-right') : null) : null,
  );
  return node;
}

export function activityList(items) {
  const kindIcon = { warning: ['warning', 'activity__icon--warning'], success: ['check-circle', 'activity__icon--success'], info: ['clock', ''] };
  return el('ul', { class: 'activity' }, items.map((a) => {
    const [ic, cls] = kindIcon[a.kind] || kindIcon.info;
    return el('li', { class: `activity__item${a.fresh && Date.now() - a.at < 4000 ? ' is-new' : ''}` },
      el('span', { class: `activity__icon ${cls}`, 'aria-hidden': 'true' }, icon(ic, { size: 16 })),
      el('span', { class: 'activity__text' },
        el('span', { class: 't-body', text: a.text }),
        el('span', { class: 'activity__time t-small', text: relativeTime(a.at) }),
      ),
    );
  }));
}

export function emptyState({ icon: ic, title, text, action, headingTag = 'h2' }) {
  return el('div', { class: 'empty' },
    iconTile(ic, 'accent', 'icon-tile--round icon-tile--lg'),
    el(headingTag, { class: 't-title', text: title }),
    text ? el('p', { class: 'empty__text t-body', text }) : null,
    action ? button(action) : null,
  );
}

export function banner({ kind = 'info', title, text, action, onDismiss, className = '' }) {
  const ic = { info: 'info', success: 'check-circle', warning: 'warning', danger: 'alert', neutral: 'info', plain: 'info' }[kind];
  return el('div', { class: `banner banner--${kind}${className ? ` ${className}` : ''}`, role: kind === 'danger' ? 'alert' : 'status' },
    icon(ic),
    el('div', { class: 'banner__text' },
      title ? el('p', { class: 'banner__title t-body-strong', text: title }) : null,
      text ? el('p', { class: 'banner__msg t-body', text }) : null,
    ),
    action ? linkButton(action) : null,
    onDismiss ? iconButton({ icon: 'close', label: 'Dismiss', onClick: onDismiss }) : null,
  );
}

export function note(text, ic = 'shield', className = '') {
  return el('p', { class: `note t-small${className ? ` ${className}` : ''}` }, icon(ic, { size: 16 }), el('span', { text }));
}

export function kvTable(rows, title) {
  return el('div', { class: 'kv' },
    title ? el('p', { class: 't-body-strong', text: title }) : null,
    rows.map(([k, v]) => el('div', { class: 'kv__row' }, el('span', { class: 'kv__key t-small', text: k }), el('span', { class: 'kv__value t-body', text: v }))),
  );
}

export function fileChip({ name, meta, side, error = false, bar }) {
  return el('div', { class: `file-chip${error ? ' file-chip--error' : ''}` },
    iconTile('file', 'white'),
    el('div', { class: 'file-chip__text' },
      el('span', { class: 'file-chip__name t-body-strong', text: name }),
      meta ? el('span', { class: 'file-chip__meta t-small', text: meta }) : null,
      bar || null,
    ),
    side ? (side instanceof Node ? side : el('span', { class: 'file-chip__side t-small', text: side })) : null,
  );
}

export function avatar(initials, size = '') {
  return el('span', { class: `avatar${size ? ` avatar--${size}` : ''}`, 'aria-hidden': 'true', text: initials });
}

export function brand({ name, sub, size = '', titleId } = {}) {
  return el('div', { class: 'brand' },
    logo({ className: `brand__mark${size ? ` brand__mark--${size}` : ''}`, title: name ? '' : 'ITR' }),
    name ? el('span', { class: 'brand__text' },
      el('span', { class: 'brand__name', id: titleId, text: name }),
      sub ? el('span', { class: 'brand__sub t-small', text: sub }) : null,
    ) : null,
  );
}

/* ---------------- Dropzone ---------------- */
export function dropzone({ title = 'Drag and drop, or click to choose a file', mobileTitle = 'Tap to choose a file', hint, error, onFiles, accept }) {
  const input = el('input', { type: 'file', accept, class: 'sr-only', tabindex: '-1', 'aria-hidden': 'true' });
  const isTouch = window.matchMedia('(hover: none)').matches;
  const errNode = error ? el('p', { class: 'field__error', role: 'alert' }, icon('alert', { size: 16 }), el('span', { text: error })) : null;
  const zone = el('div', {
    class: `dropzone${error ? ' is-error' : ''}`,
    role: 'button',
    tabindex: '0',
    'aria-label': `${isTouch ? mobileTitle : title}. ${hint}`,
  },
    iconTile('upload', 'accent', 'icon-tile--round'),
    el('p', { class: 't-label', text: isTouch ? mobileTitle : title }),
    el('p', { class: 'dropzone__hint t-small', text: hint }),
    input,
  );
  const open = () => input.click();
  zone.addEventListener('click', (e) => { if (e.target !== input) open(); });
  zone.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  input.addEventListener('change', () => { if (input.files?.length) onFiles(input.files); input.value = ''; });
  ['dragenter', 'dragover'].forEach((t) => zone.addEventListener(t, (e) => { e.preventDefault(); zone.classList.add('is-over'); }));
  ['dragleave', 'drop'].forEach((t) => zone.addEventListener(t, (e) => { e.preventDefault(); zone.classList.remove('is-over'); }));
  zone.addEventListener('drop', (e) => { if (e.dataTransfer?.files?.length) onFiles(e.dataTransfer.files); });
  return { root: el('div', { class: 'stack stack--tight' }, zone, errNode), open, zone };
}

/* ---------------- Screen scaffolding ---------------- */
export function screen({ name, header, flash, body = [], footer, bodyClass = '', className = '' }) {
  return el('section', { class: `screen${className ? ` ${className}` : ''}`, 'data-screen': name },
    el('div', { class: 'screen-frame' },
      header || null,
      flash ? el('div', { class: 'screen-flash' }, flash) : null,
      el('div', { class: `screen-body${bodyClass ? ` ${bodyClass}` : ''}` }, body),
      footer || null,
    ),
  );
}

// Tab screens. Below 768 the bar carries the brand and pageLead carries the title.
export function mainHeader({ title, sub, brandName = '', bell, bellDesktop = false, actions = [] }) {
  const bellBtn = bell ? iconButton({ icon: 'bell', label: bell.unread ? 'Notifications, new updates' : 'Notifications', outlined: true, dot: bell.unread, onClick: bell.onClick, className: bellDesktop ? '' : 'bell--mobile-only' }) : null;
  if (bellBtn) bellBtn.dataset.key = 'bell';
  return el('header', { class: 'screen-header screen-header--main' },
    el('span', { class: 'screen-header__brand' },
      logo({ className: 'brand__mark brand__mark--sm', title: 'ITR' }),
      brandName ? el('span', { class: 't-title screen-header__brand-name', text: brandName }) : null,
    ),
    el('div', { class: 'screen-header__title' },
      el('h1', { class: 'screen-title', tabindex: '-1', text: title }),
      sub ? el('p', { class: 'screen-header__sub t-body c-secondary', text: sub }) : null,
    ),
    actions.length ? el('div', { class: 'screen-header__actions' }, actions) : null,
    bellBtn,
  );
}

// Sub screens. Md+ shows a back link, title, sub and aside; below 768 the bar is back + centred label.
export function backHeader({ bar = '', backText = '', title = '', sub = '', aside = null, onBack, backLabel = 'Back' }) {
  const back = el('button', { type: 'button', class: 'back-btn', 'aria-label': backLabel, onclick: onBack, dataset: { key: 'back' } },
    icon('chevron-left'),
    backText ? el('span', { class: 'back-btn__text', text: backText }) : null,
  );
  return el('header', { class: 'screen-header screen-header--back' },
    el('div', { class: 'screen-header__bar' },
      back,
      bar ? el('span', { class: 'screen-header__bar-title t-title', text: bar }) : null,
      el('span', { class: 'screen-header__spacer', 'aria-hidden': 'true' }),
    ),
    title ? el('div', { class: 'screen-header__page' },
      el('div', { class: 'screen-header__page-text' },
        el('h1', { class: 'screen-title', tabindex: '-1', text: title }),
        sub ? el('p', { class: 't-body c-secondary', text: sub }) : null,
      ),
      aside,
    ) : null,
  );
}

// The page title block in the body, shown below 768 only.
export function pageLead({ title, sub, aside, action, below }) {
  return el('div', { class: 'page-lead' },
    el('div', { class: 'page-lead__row' },
      el('h1', { class: 't-h1', tabindex: '-1', text: title }),
      action || null,
    ),
    aside || null,
    sub ? el('p', { class: 't-body page-lead__sub', text: sub }) : null,
    below || null,
  );
}

export function screenFooter(...children) {
  return el('footer', { class: 'screen-footer' }, children);
}

/* ---------------- Toasts ---------------- */
const TOAST_ICON = { success: 'check-circle', error: 'alert', info: 'info' };
export function toast(message, { kind = 'success', duration = 6000 } = {}) {
  const region = document.getElementById('toast-region');
  if (!region) return;
  while (region.children.length >= 3) region.firstElementChild.remove();
  let timer = null;
  let remaining = duration;
  let started = 0;
  const node = el('div', { class: 'toast', role: kind === 'error' ? 'alert' : 'status' },
    icon(TOAST_ICON[kind] || 'check-circle'),
    el('p', { class: 'toast__msg', text: message }),
  );
  const close = () => {
    clearTimeout(timer);
    if (!node.isConnected || node.classList.contains('is-leaving')) return;
    node.classList.add('is-leaving');
    node.addEventListener('animationend', () => node.remove(), { once: true });
    setTimeout(() => node.remove(), 400);
  };
  node.append(iconButton({ icon: 'close', label: 'Dismiss message', onClick: close }));
  const start = () => { if (kind === 'error') return; started = Date.now(); timer = setTimeout(close, remaining); };
  const pause = () => { if (!timer) return; clearTimeout(timer); timer = null; remaining -= Date.now() - started; };
  node.addEventListener('mouseenter', pause);
  node.addEventListener('mouseleave', start);
  node.addEventListener('focusin', pause);
  node.addEventListener('focusout', start);
  region.append(node);
  start();
  return { close };
}

/* ---------------- Sheet (mobile) / dialog (md+) ---------------- */
const FOCUSABLE = 'button:not([disabled]), [href], input:not([disabled]):not([tabindex="-1"]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
let openCount = 0;

export function openSheet({ title, render, wide = false, dismissible = true, onClose, labelSuffix = '' }) {
  const trigger = document.activeElement;
  const app = document.getElementById('app');
  const titleId = uid('sheet-title');
  const titleNode = el('h2', { class: 'sheet__title t-h2', id: titleId, text: title });
  const body = el('div', { class: 'sheet__body' });
  const actions = el('div', { class: 'sheet__actions' });
  const closeBtn = iconButton({ icon: 'close', label: 'Close', className: 'sheet__close', onClick: () => api.close(null) });
  const panel = el('div', { class: `sheet${wide ? ' sheet--wide' : ''}`, role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': titleId },
    el('div', { class: 'sheet__handle', 'aria-hidden': 'true' }),
    el('div', { class: 'sheet__head' }, titleNode, closeBtn),
    body,
    actions,
  );
  const overlay = el('div', { class: 'overlay' }, panel);
  let closed = false;
  let resolve;
  const done = new Promise((r) => { resolve = r; });

  const api = {
    panel,
    done,
    get isOpen() { return !closed; },
    setTitle(t) { titleNode.textContent = t; },
    update(next) {
      if (next.title) titleNode.textContent = next.title;
      body.replaceChildren(...[].concat(next.body || []).filter(Boolean));
      actions.replaceChildren(...[].concat(next.actions || []).filter(Boolean));
      actions.hidden = !actions.children.length;
      api.dismissible = next.dismissible ?? dismissible;
      closeBtn.hidden = !api.dismissible;
      if (next.focus) requestAnimationFrame(() => next.focus.focus());
    },
    dismissible,
    close(result = null) {
      if (closed) return;
      closed = true;
      overlay.classList.add('is-leaving');
      document.removeEventListener('keydown', onKey, true);
      const finish = () => {
        overlay.remove();
        openCount -= 1;
        if (openCount <= 0 && app) { app.inert = false; app.removeAttribute('aria-hidden'); openCount = 0; }
        const key = trigger?.dataset?.key;
        const target = trigger?.isConnected ? trigger : (key ? document.querySelector(`.screen:not(.is-exiting) [data-key="${key}"]`) : null);
        (target || document.querySelector('.screen:not(.is-exiting) h1'))?.focus({ preventScroll: true });
        onClose?.(result);
        resolve(result);
      };
      setTimeout(finish, 230);
    },
  };

  function onKey(e) {
    if (e.key === 'Escape' && api.dismissible) { e.stopPropagation(); api.close(null); return; }
    if (e.key !== 'Tab') return;
    const nodes = [...panel.querySelectorAll(FOCUSABLE)].filter((n) => n.offsetParent !== null || n === document.activeElement);
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  overlay.addEventListener('mousedown', (e) => { if (e.target === overlay && api.dismissible) api.close(null); });

  // Drag the handle down to dismiss on touch screens
  const handle = panel.querySelector('.sheet__handle');
  let startY = null;
  const head = panel.querySelector('.sheet__head');
  [handle, head].forEach((zone) => {
    zone.addEventListener('touchstart', (e) => { startY = e.touches[0].clientY; panel.style.transition = 'none'; }, { passive: true });
    zone.addEventListener('touchmove', (e) => {
      if (startY == null) return;
      const dy = Math.max(0, e.touches[0].clientY - startY);
      panel.style.transform = `translateY(${dy}px)`;
    }, { passive: true });
    zone.addEventListener('touchend', (e) => {
      if (startY == null) return;
      const dy = e.changedTouches[0].clientY - startY;
      panel.style.transition = '';
      panel.style.transform = '';
      startY = null;
      if (dy > 90 && api.dismissible) api.close(null);
    });
  });

  api.update(render(api));
  document.body.append(overlay);
  openCount += 1;
  if (app) { app.inert = true; app.setAttribute('aria-hidden', 'true'); }
  document.addEventListener('keydown', onKey, true);
  requestAnimationFrame(() => {
    const target = panel.querySelector('[data-autofocus]') || panel.querySelector(FOCUSABLE);
    (target || panel).focus({ preventScroll: true });
  });
  if (labelSuffix) panel.setAttribute('aria-description', labelSuffix);
  return api;
}

export function confirmSheet({ title, message, confirmLabel, cancelLabel = 'Cancel', destructive = false }) {
  const sheet = openSheet({
    title,
    render: (api) => ({
      body: el('p', { class: 'sheet__sub t-body', text: message }),
      actions: [
        button({ label: confirmLabel, kind: destructive ? 'danger' : 'primary', block: true, onClick: () => api.close(true) }),
        button({ label: cancelLabel, kind: 'secondary', block: true, onClick: () => api.close(false) }),
      ],
    }),
  });
  return sheet.done.then((r) => r === true);
}

export function announce(message) {
  const live = document.getElementById('live-region');
  if (!live) return;
  live.textContent = '';
  setTimeout(() => { live.textContent = message; }, 30);
}

/* ---------------- Radio cards (single choice) ---------------- */
export function radioCards({ label, options, value, onChange, compact = false }) {
  const group = el('div', { class: `option-list${compact ? ' option-list--compact' : ''}`, role: 'radiogroup', 'aria-label': label });
  let current = value;
  const btns = options.map((opt) => el('button', {
    type: 'button',
    class: 'option-card option-card--radio',
    role: 'radio',
    'aria-checked': String(opt.id === current),
  },
    el('span', { class: 'radio', 'aria-hidden': 'true' }),
    el('span', { class: 'option-card__text' },
      el('span', { class: 't-title', text: opt.title || opt.label }),
      opt.desc ? el('span', { class: 'option-card__desc t-small', text: opt.desc }) : null,
    ),
  ));
  const sync = () => btns.forEach((b, i) => {
    const on = options[i].id === current;
    b.setAttribute('aria-checked', String(on));
    b.tabIndex = on || (!current && i === 0) ? 0 : -1;
  });
  const select = (i, focus = false) => {
    current = options[i].id;
    sync();
    if (focus) btns[i].focus();
    onChange?.(current);
  };
  btns.forEach((b, i) => {
    b.addEventListener('click', () => select(i));
    b.addEventListener('keydown', (e) => {
      const n = btns.length;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); select((i + 1) % n, true); }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); select((i - 1 + n) % n, true); }
    });
  });
  sync();
  group.append(...btns);
  return group;
}

/* ---------------- Filter chips with counts (single choice) ---------------- */
export function filterChips({ label, options, value, onChange }) {
  const group = el('div', { class: 'filter-chips', role: 'radiogroup', 'aria-label': label });
  let current = value;
  const chips = options.map((opt) => el('button', { type: 'button', class: 'chip chip--filter', role: 'radio', 'aria-checked': String(opt.id === current), dataset: { key: `chip-${opt.id}` } },
    icon('check', { size: 16, strokeWidth: 2.25 }),
    el('span', { class: 'nums', text: `${opt.label} ${opt.count}` }),
  ));
  const sync = () => chips.forEach((c, i) => {
    const on = options[i].id === current;
    c.setAttribute('aria-checked', String(on));
    c.tabIndex = on ? 0 : -1;
  });
  chips.forEach((c, i) => {
    c.addEventListener('click', () => { current = options[i].id; sync(); onChange?.(current); });
    c.addEventListener('keydown', (e) => {
      const n = chips.length;
      let j = null;
      if (e.key === 'ArrowRight') j = (i + 1) % n;
      if (e.key === 'ArrowLeft') j = (i - 1 + n) % n;
      if (j == null) return;
      e.preventDefault();
      current = options[j].id; sync(); chips[j].focus(); onChange?.(current);
    });
  });
  sync();
  group.append(...chips);
  return group;
}

/* ---------------- Search field ---------------- */
export function searchField({ value = '', placeholder = 'Search', label = 'Search', onInput, onClear }) {
  const input = el('input', { class: 'field__input search__input', type: 'search', placeholder, 'aria-label': label, autocomplete: 'off', dataset: { key: 'search' } });
  input.value = value;
  const clear = el('button', { type: 'button', class: 'link search__clear', text: 'Clear', hidden: !value });
  const root = el('div', { class: 'search', role: 'search' },
    el('span', { class: 'search__icon', 'aria-hidden': 'true' }, icon('search')),
    input,
    clear,
  );
  input.addEventListener('input', () => { clear.hidden = !input.value; onInput?.(input.value); });
  clear.addEventListener('click', () => { input.value = ''; clear.hidden = true; onClear?.(); input.focus(); });
  return { root, input };
}

/* ---------------- Status tile ---------------- */
export function statusTile({ kind, label, count, help, iconName, onClick }) {
  return el('button', { type: 'button', class: `status-tile status-tile--${kind}`, onclick: onClick, 'aria-label': `${label}: ${count} clients. ${help}` },
    el('span', { class: 'status-tile__top' },
      el('span', { class: 'status-tile__icon', 'aria-hidden': 'true' }, icon(iconName, { size: 16 })),
      el('span', { class: 't-label', text: label }),
    ),
    el('span', { class: 'status-tile__count t-figure', text: String(count) }),
    el('span', { class: 'status-tile__help t-small', text: help }),
  );
}

/* ---------------- Section heading ---------------- */
export function sectionHead({ title, sub, aside, tag = 'h2' }) {
  return el('div', { class: 'section-head' },
    el('div', { class: 'section-head__text' },
      el(tag, { class: 't-title', text: title }),
      sub ? el('p', { class: 't-small c-muted', text: sub }) : null,
    ),
    aside || null,
  );
}
