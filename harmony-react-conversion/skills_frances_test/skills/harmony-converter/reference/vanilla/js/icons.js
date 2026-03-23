/**
 * Inline SVG helpers for Alert, Button, RightSidebar (Heroicons 24 outline equivalents).
 */

const SVG_NS = 'http://www.w3.org/2000/svg';
const defaultSvgProps = {
  xmlns: SVG_NS,
  fill: 'none',
  viewBox: '0 0 24 24',
  'stroke-width': 1.5,
  stroke: 'currentColor',
  'aria-hidden': 'true',
};

function createSvg(pathD, className = '') {
  const svg = document.createElementNS(SVG_NS, 'svg');
  Object.entries(defaultSvgProps).forEach(([k, v]) => svg.setAttribute(k, String(v)));
  if (className) svg.setAttribute('class', className);
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  path.setAttribute('d', pathD);
  svg.appendChild(path);
  return svg;
}

// Alert icons
const alertIcons = {
  'information-circle': () => createSvg('m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z'),
  'check-circle': () => createSvg('M9 12.75L11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'),
  'exclamation-triangle': () => createSvg('M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z'),
  'exclamation-circle': () => createSvg('M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z'),
  'x-mark': () => createSvg('M6 18 18 6M6 6l12 12'),
};

const alertDefaultIcons = {
  info: 'information-circle',
  success: 'check-circle',
  warning: 'exclamation-triangle',
  error: 'exclamation-circle',
};

function getAlertIcon(name) {
  const key = alertDefaultIcons[name] || name;
  return alertIcons[key] || alertIcons['information-circle'];
}

function createAlertIconSvg(name, className) {
  const fn = getAlertIcon(name);
  const svg = fn();
  if (className) svg.classList.add(className);
  return svg;
}

function createXMarkIcon(className) {
  const svg = alertIcons['x-mark']();
  if (className) svg.classList.add(className);
  return svg;
}

// Button icons
const buttonIcons = {
  plus: () => createSvg('M12 4.5v15m7.5-7.5h-15'),
  'arrow-right': () => createSvg('M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3'),
};

function getButtonIcon(name) {
  return buttonIcons[name] || null;
}

function createButtonIconSvg(name, className) {
  const fn = getButtonIcon(name);
  if (!fn) return null;
  const svg = fn();
  svg.setAttribute('style', 'width:1em;height:1em;flex-shrink:0');
  if (className) svg.classList.add(className);
  return svg;
}

// Button spinner
function createSpinnerSvg() {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('class', 'btn__spinner');
  svg.setAttribute('width', 'var(--btn-spinner-size)');
  svg.setAttribute('height', 'var(--btn-spinner-size)');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('xmlns', SVG_NS);
  const circle = document.createElementNS(SVG_NS, 'circle');
  circle.setAttribute('class', 'opacity-25');
  circle.setAttribute('cx', '12');
  circle.setAttribute('cy', '12');
  circle.setAttribute('r', '10');
  circle.setAttribute('stroke', 'currentColor');
  circle.setAttribute('stroke-width', 'var(--btn-spinner-stroke-width)');
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('class', 'opacity-75');
  path.setAttribute('fill', 'currentColor');
  path.setAttribute('d', 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z');
  svg.appendChild(circle);
  svg.appendChild(path);
  return svg;
}

// RightSidebar icons
const sidebarIcons = {
  bell: () => createSvg('M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0'),
  'arrow-up-tray': () => createSvg('M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5'),
  printer: () => createSvg('M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z'),
  'view-columns': () => createSvg('M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125Z'),
  'signal-slash': () => createSvg('m3 3 8.735 8.735m0 0a.374.374 0 1 1 .53.53m-.53-.53.53.53m0 0L21 21M14.652 9.348a3.75 3.75 0 0 1 0 5.304m2.121-7.425a6.75 6.75 0 0 1 0 9.546m2.121-11.667c3.808 3.807 3.808 9.98 0 13.788m-9.546-4.242a3.733 3.733 0 0 1-1.06-2.122m-1.061 4.243a6.75 6.75 0 0 1-1.625-6.929m-.496 9.05c-3.068-3.067-3.664-7.67-1.79-11.334M12 12h.008v.008H12V12Z'),
  'command-line': () => createSvg('m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z'),
  'question-mark-circle': () => createSvg('M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z'),
};

function getSidebarIcon(name) {
  return sidebarIcons[name] || sidebarIcons['question-mark-circle'];
}

function isSidebarIconCustom(name) {
  return name === 'mic-slash';
}

function createSidebarIconSvg(name) {
  const fn = getSidebarIcon(name);
  const svg = fn();
  svg.setAttribute('width', '24');
  svg.setAttribute('height', '24');
  return svg;
}

window.createAlertIconSvg = createAlertIconSvg;
window.createXMarkIcon = createXMarkIcon;
window.createButtonIconSvg = createButtonIconSvg;
window.createSpinnerSvg = createSpinnerSvg;
window.getSidebarIcon = getSidebarIcon;
window.isSidebarIconCustom = isSidebarIconCustom;
window.createSidebarIconSvg = createSidebarIconSvg;
