// The 44 icons from the ITR design system (section 07), drawn on one 24 grid, shown at 20.
const paths = {
  'alert': '<circle cx="12" cy="12" r="9.5"/><path d="M12 7.5v5"/><path d="M12 16.2h.01"/>',
  'arrow-left': '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  'arrow-right': '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  'bank': '<path d="M3 21h18"/><path d="M6 17.5V11"/><path d="M10 17.5V11"/><path d="M14 17.5V11"/><path d="M18 17.5V11"/><path d="M12 2.5 20.5 7h-17Z"/>',
  'bell': '<path d="M6 8.5a6 6 0 0 1 12 0c0 6.5 2.5 8.5 2.5 8.5h-17S6 15 6 8.5"/><path d="M10.3 20.5a1.94 1.94 0 0 0 3.4 0"/>',
  'check': '<path d="M20 6 9 17l-5-5"/>',
  'check-circle': '<circle cx="12" cy="12" r="9.5"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
  'checklist': '<rect width="8" height="4" x="8" y="2.5" rx="1"/><path d="M16 4.5h2a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  'chevron-left': '<path d="m15 18-6-6 6-6"/>',
  'chevron-right': '<path d="m9 18 6-6-6-6"/>',
  'chevron-up': '<path d="m18 15-6-6-6 6"/>',
  'clock': '<circle cx="12" cy="12" r="9.5"/><path d="M12 7v5l3 2"/>',
  'close': '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  'dashboard': '<rect width="7" height="7" x="3" y="3" rx="1.5"/><rect width="7" height="7" x="14" y="3" rx="1.5"/><rect width="7" height="7" x="14" y="14" rx="1.5"/><rect width="7" height="7" x="3" y="14" rx="1.5"/>',
  'dot': '<circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none"/>',
  'download': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  'edit': '<path d="M21.17 6.81a1 1 0 0 0-3.98-3.98L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5z"/><path d="m15 5 4 4"/>',
  'eye': '<path d="M2.06 12.35a1 1 0 0 1 0-.7 10.75 10.75 0 0 1 19.88 0 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-19.88 0"/><circle cx="12" cy="12" r="3"/>',
  'eye-off': '<path d="M10.73 5.08a10.74 10.74 0 0 1 11.2 6.57 1 1 0 0 1 0 .7 10.75 10.75 0 0 1-1.44 2.49"/><path d="M14.08 14.16a3 3 0 0 1-4.24-4.24"/><path d="M17.48 17.5a10.75 10.75 0 0 1-15.42-5.15 1 1 0 0 1 0-.7 10.75 10.75 0 0 1 4.45-5.14"/><path d="m2 2 20 20"/>',
  'file': '<path d="M14.5 2.5H6a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2.5V7a1.5 1.5 0 0 0 1.5 1.5H20"/>',
  'folder': '<path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/>',
  'help': '<circle cx="12" cy="12" r="9.5"/><path d="M9.1 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',
  'history': '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/>',
  'home': '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .71-1.53l7-6a2 2 0 0 1 2.58 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  'info': '<circle cx="12" cy="12" r="9.5"/><path d="M12 16v-4.5"/><path d="M12 8h.01"/>',
  'link': '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  'lock': '<rect width="16" height="10.5" x="4" y="10.5" rx="2"/><path d="M7.5 10.5V7a4.5 4.5 0 0 1 9 0v3.5"/>',
  'logout': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
  'mail': '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  'menu': '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',
  'minus': '<path d="M5 12h14"/>',
  'plus': '<path d="M5 12h14"/><path d="M12 5v14"/>',
  'ring': '<circle cx="12" cy="12" r="8"/>',
  'search': '<circle cx="11" cy="11" r="7.5"/><path d="m21 21-4.3-4.3"/>',
  'settings': '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
  'shield': '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  'trash': '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  'upload': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/>',
  'user': '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  'users': '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  'warning': '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  'wifi-off': '<path d="M12 20h.01"/><path d="M8.5 16.43a5 5 0 0 1 7 0"/><path d="M5 12.86a10 10 0 0 1 5.17-2.69"/><path d="M19 12.86a10 10 0 0 0-2.01-1.52"/><path d="M2 8.82a15 15 0 0 1 4.18-2.64"/><path d="M22 8.82a15 15 0 0 0-11.29-3.76"/><path d="m2 2 20 20"/>',
  'x-circle': '<circle cx="12" cy="12" r="9.5"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>',
  'clock-alert': '<circle cx="12" cy="12" r="9.5"/><path d="M12 7v5l3 2"/><path d="M12 17h.01"/>',
  'google': '<path d="M21.6 12.23c0-.68-.06-1.33-.17-1.95H12v3.7h5.4a4.63 4.63 0 0 1-2 3.04v2.5h3.24c1.9-1.75 2.96-4.33 2.96-7.29z" fill="#4285F4" stroke="none"/><path d="M12 22c2.7 0 4.97-.9 6.63-2.44l-3.24-2.5c-.9.6-2.04.95-3.39.95-2.6 0-4.8-1.75-5.59-4.11H3.07v2.58A10 10 0 0 0 12 22z" fill="#34A853" stroke="none"/><path d="M6.41 13.9a6 6 0 0 1 0-3.8V7.52H3.07a10 10 0 0 0 0 8.96z" fill="#FBBC05" stroke="none"/><path d="M12 5.98c1.47 0 2.78.5 3.82 1.5l2.86-2.87A10 10 0 0 0 12 2a10 10 0 0 0-8.93 5.52l3.34 2.58C7.2 7.73 9.4 5.98 12 5.98z" fill="#EA4335" stroke="none"/>',
  'apple': '<path d="M17.5 12.5c0-2.4 1.95-3.56 2.04-3.62-1.11-1.63-2.84-1.85-3.46-1.88-1.47-.15-2.86.86-3.6.86-.75 0-1.9-.84-3.12-.82-1.6.02-3.08.93-3.9 2.37-1.67 2.88-.42 7.14 1.18 9.48.78 1.14 1.7 2.42 2.92 2.37 1.18-.05 1.63-.76 3.05-.76 1.43 0 1.83.76 3.08.74 1.27-.02 2.08-1.16 2.86-2.31.9-1.33 1.27-2.62 1.29-2.69-.03-.01-2.46-.95-2.49-3.74zM15.1 5.26c.65-.79 1.1-1.88 0.97-2.98-.94.04-2.08.62-2.76 1.4-.6.69-1.14 1.81-1 2.88 1.05.08 2.14-.52 2.79-1.3z" stroke="none" fill="currentColor"/>',
};

export const iconNames = Object.keys(paths);

export function iconSvg(name, size = 20, strokeWidth = 1.75) {
  const body = paths[name] || paths['dot'];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
}

export function icon(name, { size = 20, label = '', strokeWidth = 1.75 } = {}) {
  const tpl = document.createElement('template');
  tpl.innerHTML = iconSvg(name, size, strokeWidth);
  const svg = tpl.content.firstElementChild;
  if (label) {
    svg.removeAttribute('aria-hidden');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', label);
  }
  return svg;
}

let logoId = 0;

// Brand mark for ITR CAs: a stack of documents with a verifier badge, on the canvas gradient.
export function logoSvg({ className = 'brand__mark', title = '', animated = false } = {}) {
  logoId += 1;
  const id = `itr-logo-${logoId}`;
  const a11y = title ? `role="img" aria-label="${title}"` : 'aria-hidden="true" focusable="false"';
  const cls = (base) => (animated ? ` class="${base}"` : '');
  return `<svg class="${className}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" ${a11y}>
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0.6" y2="1"><stop offset="0" stop-color="#1c2d3f"/><stop offset="1" stop-color="#3f7a8e"/></linearGradient></defs>
    <rect${cls('splash__tile')} width="48" height="48" rx="13" fill="url(#${id})"/>
    <path${cls('splash__doc')} d="M14 10h14a3 3 0 0 1 3 3v22a3 3 0 0 1-3 3H14a3 3 0 0 1-3-3V13a3 3 0 0 1 3-3Z" fill="#ffffff"/>
    <path${cls('splash__fold')} d="M17 15.5h11M17 20h11M17 24.5h7" stroke="#caf0f5" stroke-width="1.6" stroke-linecap="round" fill="none"/>
    <circle${cls('splash__badge')} cx="30" cy="30" r="7.5" fill="#047e9d"/>
    <path${cls('splash__check')} d="M26.5 30l2.2 2.2 4-4.3" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

export function logo(opts) {
  const tpl = document.createElement('template');
  tpl.innerHTML = logoSvg(opts).trim();
  return tpl.content.firstElementChild;
}
