/**
 * createAlert(options) - returns DOM element for Harmony Alert.
 * options: variant, style, title, dismissible, onDismiss, icon, primaryButton, secondaryButton, linkText, linkHref, progressValue, children (message text)
 */
const DEFAULT_ICONS = {
  info: 'information-circle',
  success: 'check-circle',
  warning: 'exclamation-triangle',
  error: 'exclamation-circle',
};

function createAlert(options = {}) {
  const {
    variant = 'info',
    style = 'default',
    title,
    dismissible = false,
    onDismiss,
    icon,
    primaryButton,
    secondaryButton,
    linkText,
    linkHref,
    progressValue,
    children = '',
  } = options;

  const iconName = icon ?? DEFAULT_ICONS[variant];
  const hasActions = primaryButton || secondaryButton || (linkText && linkHref);

  const classes = [
    'alert',
    `alert--${variant}`,
    style === 'enhanced' && 'alert--enhanced',
  ].filter(Boolean).join(' ');

  const root = document.createElement('div');
  root.className = classes;
  root.setAttribute('role', 'alert');

  const handleClose = () => onDismiss?.();

  if (style === 'enhanced') {
    const border = document.createElement('div');
    border.className = 'alert__border';
    root.appendChild(border);

    const content = document.createElement('div');
    content.className = 'alert__content';

    const inner = document.createElement('div');
    inner.className = 'alert__inner';

    const iconSpan = document.createElement('span');
    iconSpan.className = 'alert__icon';
    iconSpan.setAttribute('aria-hidden', 'true');
    const iconSvg = createAlertIconSvg(iconName, 'alert__icon-svg');
    iconSpan.appendChild(iconSvg);
    inner.appendChild(iconSpan);

    const textDiv = document.createElement('div');
    textDiv.className = 'alert__text';
    if (title) {
      const titleDiv = document.createElement('div');
      titleDiv.className = 'alert__title';
      titleDiv.textContent = title;
      textDiv.appendChild(titleDiv);
    }
    const messageDiv = document.createElement('div');
    messageDiv.className = 'alert__message';
    messageDiv.textContent = children;
    textDiv.appendChild(messageDiv);
    inner.appendChild(textDiv);

    if (dismissible) {
      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'alert__close';
      closeBtn.setAttribute('aria-label', 'Dismiss');
      closeBtn.appendChild(createXMarkIcon('alert__icon-svg'));
      closeBtn.addEventListener('click', handleClose);
      inner.appendChild(closeBtn);
    }

    content.appendChild(inner);

    if (hasActions && style === 'enhanced') {
      const actions = document.createElement('div');
      actions.className = 'alert__actions';
      if (primaryButton || secondaryButton) {
        const buttons = document.createElement('div');
        buttons.className = 'alert__buttons';
        if (primaryButton) {
          if (primaryButton.href) {
            const a = document.createElement('a');
            a.href = primaryButton.href;
            a.className = 'alert__btn alert__btn--primary';
            a.textContent = primaryButton.text;
            buttons.appendChild(a);
          } else {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'alert__btn alert__btn--primary';
            btn.textContent = primaryButton.text;
            btn.addEventListener('click', () => primaryButton.onClick?.());
            buttons.appendChild(btn);
          }
        }
        if (secondaryButton) {
          if (secondaryButton.href) {
            const a = document.createElement('a');
            a.href = secondaryButton.href;
            a.className = 'alert__btn alert__btn--secondary';
            a.textContent = secondaryButton.text;
            buttons.appendChild(a);
          } else {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'alert__btn alert__btn--secondary';
            btn.textContent = secondaryButton.text;
            btn.addEventListener('click', () => secondaryButton.onClick?.());
            buttons.appendChild(btn);
          }
        }
        actions.appendChild(buttons);
      }
      if (linkText && linkHref) {
        const link = document.createElement('a');
        link.href = linkHref;
        link.className = 'alert__link';
        link.textContent = linkText;
        actions.appendChild(link);
      }
      content.appendChild(actions);
    }

    if (progressValue != null && style === 'enhanced') {
      const value = Math.min(100, Math.max(0, progressValue));
      const progress = document.createElement('div');
      progress.className = 'alert__progress';
      const track = document.createElement('div');
      track.className = 'alert-progress__track';
      const fill = document.createElement('div');
      fill.className = 'alert-progress__fill';
      fill.style.width = `${value}%`;
      fill.setAttribute('role', 'progressbar');
      fill.setAttribute('aria-valuenow', String(value));
      fill.setAttribute('aria-valuemin', '0');
      fill.setAttribute('aria-valuemax', '100');
      track.appendChild(fill);
      progress.appendChild(track);
      content.appendChild(progress);
    }

    root.appendChild(content);
  } else {
    const iconSpan = document.createElement('span');
    iconSpan.className = 'alert__icon';
    iconSpan.setAttribute('aria-hidden', 'true');
    iconSpan.appendChild(createAlertIconSvg(iconName, 'alert__icon-svg'));
    root.appendChild(iconSpan);

    const content = document.createElement('div');
    content.className = 'alert__content';
    if (title) {
      const titleDiv = document.createElement('div');
      titleDiv.className = 'alert__title';
      titleDiv.textContent = title;
      content.appendChild(titleDiv);
    }
    const messageDiv = document.createElement('div');
    messageDiv.className = 'alert__message';
    messageDiv.textContent = children;
    content.appendChild(messageDiv);
    root.appendChild(content);

    if (dismissible) {
      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'alert__close';
      closeBtn.setAttribute('aria-label', 'Dismiss');
      closeBtn.appendChild(createXMarkIcon('alert__icon-svg'));
      closeBtn.addEventListener('click', handleClose);
      root.appendChild(closeBtn);
    }
  }

  return root;
}

window.createAlert = createAlert;
