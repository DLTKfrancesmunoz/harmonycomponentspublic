/**
 * createButton(options) - returns DOM element (button or a) for Harmony Button.
 * options: variant, buttonType, size, orientation, disabled, loading, loadingText, icon, iconPosition, type, fullWidth, href, onClick, children, ariaLabel
 */
var ASSETS_BASE = 'assets';

function createButton(options = {}) {
  const {
    variant = 'primary',
    buttonType = 'theme',
    size = 'md',
    orientation = 'horizontal',
    disabled = false,
    loading = false,
    loadingText,
    icon,
    iconPosition = 'left',
    type = 'button',
    fullWidth = false,
    href,
    onClick,
    children = '',
    ariaLabel,
  } = options;

  const hasContent = Boolean(children);
  const isIconOnly = Boolean(icon && !hasContent && !loading);
  const isDelaVariant = variant === 'dela' || variant === 'dela-pill';

  const classes = [
    'btn',
    `btn--${variant}`,
    buttonType === 'pageHeader' && !isDelaVariant && 'btn--page-header',
    isIconOnly ? `btn--icon-${size}` : `btn--${size}`,
    orientation === 'vertical' && 'btn--vertical',
    (disabled || loading) && 'btn--disabled',
    loading && 'btn--loading',
    fullWidth && 'btn--full',
  ].filter(Boolean).join(' ');

  const content = document.createDocumentFragment();

  if (loading) {
    content.appendChild(createSpinnerSvg());
    if (loadingText) {
      const span = document.createElement('span');
      span.textContent = loadingText;
      content.appendChild(span);
    }
  } else {
    if (isDelaVariant) {
      const img = document.createElement('img');
      img.src = `${ASSETS_BASE}/Stars.svg`;
      img.alt = '';
      img.className = 'btn__dela-stars';
      content.appendChild(img);
    }
    if (icon && iconPosition === 'left') {
      const svg = createButtonIconSvg(icon);
      if (svg) content.appendChild(svg);
    }
    if (children) {
      const text = document.createTextNode(children);
      content.appendChild(text);
    }
    if (icon && iconPosition === 'right') {
      const svg = createButtonIconSvg(icon);
      if (svg) content.appendChild(svg);
    }
  }

  if (href) {
    const a = document.createElement('a');
    a.href = href;
    a.className = classes;
    if (loading) a.setAttribute('aria-busy', 'true');
    if (ariaLabel) a.setAttribute('aria-label', ariaLabel);
    a.appendChild(content);
    if (onClick) a.addEventListener('click', (e) => { e.preventDefault(); onClick(); });
    return a;
  }

  const btn = document.createElement('button');
  btn.type = type;
  btn.className = classes;
  btn.disabled = disabled || loading;
  if (loading) btn.setAttribute('aria-busy', 'true');
  if (ariaLabel) btn.setAttribute('aria-label', ariaLabel);
  btn.appendChild(content);
  if (onClick) btn.addEventListener('click', onClick);
  return btn;
}

window.createButton = createButton;
