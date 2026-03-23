/**
 * Harmony Vanilla (HTML/CSS/JS) Examples - demo page
 */
let dismissibleVisible = true;
let sidebarActiveId = null;
let buttonLoading = false;

document.documentElement.classList.add('theme-cp');
if (localStorage.getItem('harmony-theme') === 'dark') {
  document.documentElement.classList.add('dark');
}

let darkVariant = document.documentElement.classList.contains('theme-vp') ? 'vp' : 'cp';

function toggleDark() {
  const root = document.documentElement;
  root.classList.toggle('dark');
  const isDark = root.classList.contains('dark');
  localStorage.setItem('harmony-theme', isDark ? 'dark' : 'light');
  if (!isDark) {
    root.classList.remove('theme-vp');
    root.classList.add('theme-cp');
    darkVariant = 'cp';
  }
  updateThemeUI();
}

function setDarkThemeVariant(variant) {
  const root = document.documentElement;
  root.classList.remove('theme-cp', 'theme-vp');
  root.classList.add(`theme-${variant}`);
  darkVariant = variant;
  updateThemeUI();
}

function updateThemeUI() {
  const isDark = document.documentElement.classList.contains('dark');
  if (window._themeToggleBtn) {
    window._themeToggleBtn.textContent = isDark ? 'Switch to light' : 'Switch to dark';
    window._themeToggleBtn.setAttribute('aria-pressed', isDark);
  }
  if (window._darkVariantContainer) {
    window._darkVariantContainer.style.display = isDark ? 'inline-flex' : 'none';
    const cpBtn = window._darkVariantCpBtn;
    const vpBtn = window._darkVariantVpBtn;
    if (cpBtn) {
      cpBtn.classList.toggle('app__dark-variant-btn--active', darkVariant === 'cp');
    }
    if (vpBtn) {
      vpBtn.classList.toggle('app__dark-variant-btn--active', darkVariant === 'vp');
    }
  }
}

function el(tag, className, children = []) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  children.forEach((c) => e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
  return e;
}

function renderDismissibleSection(container) {
  container.innerHTML = '';
  if (dismissibleVisible) {
    container.appendChild(
      createAlert({
        variant: 'info',
        dismissible: true,
        onDismiss: () => {
          dismissibleVisible = false;
          renderDismissibleSection(container);
        },
        title: 'Dismiss me',
        children: 'Click the X to hide this alert. Use the button below to show it again.',
      })
    );
  } else {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'app__show-btn';
    btn.textContent = 'Show dismissible alert again';
    btn.addEventListener('click', () => {
      dismissibleVisible = true;
      renderDismissibleSection(container);
    });
    container.appendChild(btn);
  }
}

function renderStatesButtons(container) {
  container.innerHTML = '';
  container.appendChild(
    createButton({
      variant: 'primary',
      size: 'md',
      loading: buttonLoading,
      loadingText: 'Saving...',
      onClick: () => {
        buttonLoading = true;
        renderStatesButtons(container);
        setTimeout(() => {
          buttonLoading = false;
          renderStatesButtons(container);
        }, 2000);
      },
      children: 'Save',
    })
  );
  container.appendChild(createButton({ variant: 'primary', size: 'md', disabled: true, children: 'Disabled' }));
  container.appendChild(createButton({ variant: 'outline', size: 'md', disabled: true, children: 'Disabled outline' }));
}

function renderSidebar(container) {
  container.innerHTML = '';
  container.appendChild(
    createRightSidebar({
      variant: 'cp',
      activeItemId: sidebarActiveId,
      onItemClick: (id) => {
        sidebarActiveId = id;
        renderSidebar(container);
      },
    })
  );
}

function buildApp() {
  const appContent = document.getElementById('app-content');
  const sidebarMount = document.getElementById('sidebar-mount');
  if (!appContent) return;

  const header = document.createElement('header');
  header.className = 'app__header';
  const h1 = document.createElement('h1');
  h1.textContent = 'Harmony HTML/CSS/JS Examples';
  const subP = document.createElement('p');
  subP.textContent = 'Simple (Button), medium (Alert), complex (Right Sidebar)';
  const nav = document.createElement('nav');
  nav.className = 'app__nav';
  const linkAlert = document.createElement('a');
  linkAlert.href = '#alert';
  linkAlert.textContent = 'Alert';
  const linkButton = document.createElement('a');
  linkButton.href = '#button';
  linkButton.textContent = 'Button';
  const linkSidebar = document.createElement('a');
  linkSidebar.href = '#right-sidebar';
  linkSidebar.textContent = 'Right Sidebar';
  const themeToggle = document.createElement('button');
  themeToggle.type = 'button';
  themeToggle.className = 'app__theme-toggle';
  themeToggle.textContent = document.documentElement.classList.contains('dark') ? 'Switch to light' : 'Switch to dark';
  themeToggle.setAttribute('aria-pressed', document.documentElement.classList.contains('dark'));
  themeToggle.addEventListener('click', toggleDark);
  window._themeToggleBtn = themeToggle;
  const darkVariantContainer = document.createElement('span');
  darkVariantContainer.className = 'app__dark-variant';
  darkVariantContainer.style.display = document.documentElement.classList.contains('dark') ? 'inline-flex' : 'none';
  const cpBtn = document.createElement('button');
  cpBtn.type = 'button';
  cpBtn.className = 'app__dark-variant-btn' + (darkVariant === 'cp' ? ' app__dark-variant-btn--active' : '');
  cpBtn.textContent = 'CP dark';
  cpBtn.addEventListener('click', () => setDarkThemeVariant('cp'));
  const vpBtn = document.createElement('button');
  vpBtn.type = 'button';
  vpBtn.className = 'app__dark-variant-btn' + (darkVariant === 'vp' ? ' app__dark-variant-btn--active' : '');
  vpBtn.textContent = 'VP dark';
  vpBtn.addEventListener('click', () => setDarkThemeVariant('vp'));
  darkVariantContainer.append(cpBtn, vpBtn);
  window._darkVariantContainer = darkVariantContainer;
  window._darkVariantCpBtn = cpBtn;
  window._darkVariantVpBtn = vpBtn;
  nav.append(linkAlert, linkButton, linkSidebar, themeToggle, darkVariantContainer);
  header.append(h1, subP, nav);
  appContent.appendChild(header);

  // Alert – default by variant
  const sectionAlert = document.createElement('section');
  sectionAlert.id = 'alert';
  sectionAlert.className = 'app__section';
  sectionAlert.appendChild(el('h2', '', ['Alert (medium)']));
  sectionAlert.appendChild(el('h3', 'app__subsection', ['Default style (by variant)']));
  const alerts1 = document.createElement('div');
  alerts1.className = 'app__alerts';
  alerts1.appendChild(createAlert({ variant: 'info', title: 'Info', children: 'This is an info alert with a title and message.' }));
  alerts1.appendChild(createAlert({ variant: 'success', title: 'Success', children: 'Your changes have been saved successfully.' }));
  alerts1.appendChild(createAlert({ variant: 'warning', title: 'Warning', children: 'Please review your input before continuing.' }));
  alerts1.appendChild(createAlert({ variant: 'error', title: 'Error', children: 'Something went wrong. Please try again.' }));
  sectionAlert.appendChild(alerts1);
  appContent.appendChild(sectionAlert);

  // Dismissible
  const sectionDismiss = document.createElement('section');
  sectionDismiss.className = 'app__section';
  sectionDismiss.appendChild(el('h2', '', ['Default style – dismissible']));
  const dismissibleContainer = document.createElement('div');
  dismissibleContainer.className = 'app__alerts';
  sectionDismiss.appendChild(dismissibleContainer);
  appContent.appendChild(sectionDismiss);

  // Enhanced
  const sectionEnhanced = document.createElement('section');
  sectionEnhanced.className = 'app__section';
  sectionEnhanced.appendChild(el('h2', '', ['Enhanced style (by variant)']));
  const alertsEnhanced = document.createElement('div');
  alertsEnhanced.className = 'app__alerts';
  alertsEnhanced.appendChild(createAlert({ variant: 'info', style: 'enhanced', title: 'Info', children: 'Enhanced info alert with card-style layout and left border.' }));
  alertsEnhanced.appendChild(createAlert({ variant: 'success', style: 'enhanced', title: 'Success', children: 'Enhanced success alert.' }));
  alertsEnhanced.appendChild(createAlert({ variant: 'warning', style: 'enhanced', title: 'Warning', children: 'Enhanced warning alert.' }));
  alertsEnhanced.appendChild(createAlert({ variant: 'error', style: 'enhanced', title: 'Error', children: 'Enhanced error alert.' }));
  sectionEnhanced.appendChild(alertsEnhanced);
  appContent.appendChild(sectionEnhanced);

  // Enhanced + actions
  const sectionActions = document.createElement('section');
  sectionActions.className = 'app__section';
  sectionActions.appendChild(el('h2', '', ['Enhanced – with actions (buttons + link)']));
  const alertsActions = document.createElement('div');
  alertsActions.className = 'app__alerts';
  alertsActions.appendChild(
    createAlert({
      variant: 'info',
      style: 'enhanced',
      title: 'Session expiring',
      primaryButton: { text: 'Stay signed in', onClick: () => window.alert('Primary clicked') },
      secondaryButton: { text: 'Sign out', onClick: () => window.alert('Secondary clicked') },
      linkText: 'Learn more',
      linkHref: '#',
      children: 'Your session will expire in 5 minutes. Choose an action below.',
    })
  );
  sectionActions.appendChild(alertsActions);
  appContent.appendChild(sectionActions);

  // Enhanced + progress
  const sectionProgress = document.createElement('section');
  sectionProgress.className = 'app__section';
  sectionProgress.appendChild(el('h2', '', ['Enhanced – with progress']));
  const alertsProgress = document.createElement('div');
  alertsProgress.className = 'app__alerts';
  alertsProgress.appendChild(
    createAlert({
      variant: 'success',
      style: 'enhanced',
      title: 'Upload in progress',
      progressValue: 60,
      children: 'Your file is being uploaded. This may take a moment.',
    })
  );
  sectionProgress.appendChild(alertsProgress);
  appContent.appendChild(sectionProgress);

  // Buttons
  const sectionButton = document.createElement('section');
  sectionButton.id = 'button';
  sectionButton.className = 'app__section';
  sectionButton.appendChild(el('h2', '', ['Button (simple)']));
  sectionButton.appendChild(el('h3', 'app__subsection', ['Variants (theme)']));
  const buttons1 = document.createElement('div');
  buttons1.className = 'app__buttons';
  ['Primary', 'Secondary', 'Tertiary', 'Outline', 'Ghost', 'Destructive', 'Dela', 'Dela pill'].forEach((label, i) => {
    const variants = ['primary', 'secondary', 'tertiary', 'outline', 'ghost', 'destructive', 'dela', 'dela-pill'];
    buttons1.appendChild(createButton({ variant: variants[i], size: 'md', children: label }));
  });
  sectionButton.appendChild(buttons1);
  sectionButton.appendChild(el('h3', 'app__subsection', ['Page header variants']));
  const buttons2 = document.createElement('div');
  buttons2.className = 'app__buttons';
  buttons2.appendChild(createButton({ variant: 'primary', buttonType: 'pageHeader', size: 'md', children: 'Page primary' }));
  buttons2.appendChild(createButton({ variant: 'secondary', buttonType: 'pageHeader', size: 'md', children: 'Page secondary' }));
  buttons2.appendChild(createButton({ variant: 'tertiary', buttonType: 'pageHeader', size: 'md', children: 'Page tertiary' }));
  sectionButton.appendChild(buttons2);
  sectionButton.appendChild(el('h3', 'app__subsection', ['Sizes']));
  const buttons3 = document.createElement('div');
  buttons3.className = 'app__buttons';
  ['xs', 'sm', 'md', 'lg'].forEach((s) => buttons3.appendChild(createButton({ variant: 'primary', size: s, children: s })));
  sectionButton.appendChild(buttons3);
  sectionButton.appendChild(el('h3', 'app__subsection', ['Icon and icon-only']));
  const buttons4 = document.createElement('div');
  buttons4.className = 'app__buttons';
  buttons4.appendChild(createButton({ variant: 'primary', size: 'md', icon: 'plus', iconPosition: 'left', children: 'Add item' }));
  buttons4.appendChild(createButton({ variant: 'primary', size: 'md', icon: 'arrow-right', iconPosition: 'right', children: 'Next' }));
  buttons4.appendChild(createButton({ variant: 'secondary', size: 'md', icon: 'plus', ariaLabel: 'Add' }));
  buttons4.appendChild(createButton({ variant: 'ghost', size: 'sm', icon: 'plus', ariaLabel: 'Add small' }));
  sectionButton.appendChild(buttons4);
  sectionButton.appendChild(el('h3', 'app__subsection', ['States']));
  const statesContainer = document.createElement('div');
  statesContainer.className = 'app__buttons';
  sectionButton.appendChild(statesContainer);
  sectionButton.appendChild(el('h3', 'app__subsection', ['Other props']));
  const buttons6 = document.createElement('div');
  buttons6.className = 'app__buttons';
  buttons6.appendChild(createButton({ variant: 'primary', size: 'md', href: '#', children: 'Link (href)' }));
  buttons6.appendChild(createButton({ variant: 'primary', size: 'md', fullWidth: true, children: 'Full width' }));
  buttons6.appendChild(createButton({ variant: 'outline', size: 'md', orientation: 'vertical', children: 'Vertical' }));
  sectionButton.appendChild(buttons6);
  appContent.appendChild(sectionButton);

  renderDismissibleSection(dismissibleContainer);
  renderStatesButtons(statesContainer);
  if (sidebarMount) renderSidebar(sidebarMount);
}

buildApp();
