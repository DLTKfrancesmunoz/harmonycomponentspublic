/**
 * createRightSidebar(options) - returns DOM element for Harmony RightSidebar.
 * options: variant, sections, activeItemId, onItemClick
 */
const cpSections = [
  {
    items: [
      { label: 'Dela AI', isCustom: true, customSrc: `${ASSETS_BASE}/RS_DelaDefault.svg`, customSrcActive: `${ASSETS_BASE}/RS_Dela_Active.svg` },
      { icon: 'bell', label: 'Notifications' },
      { icon: 'arrow-up-tray', label: 'Files' },
    ],
  },
  {
    items: [
      { icon: 'printer', label: 'Print' },
      { icon: 'view-columns', label: 'Layout Options' },
    ],
  },
  {
    items: [
      { icon: 'mic-slash', label: 'Microphone' },
      { icon: 'signal-slash', label: 'Offline' },
      { icon: 'command-line', label: 'Keyboard Shortcuts' },
      { icon: 'question-mark-circle', label: 'Help' },
    ],
  },
];

function createRightSidebar(options = {}) {
  const {
    variant = 'cp',
    sections: sectionsProp,
    activeItemId = null,
    onItemClick,
  } = options;

  const sections = sectionsProp ?? cpSections;

  const nav = document.createElement('nav');
  nav.className = `right-sidebar right-sidebar--${variant}`.trim();
  nav.setAttribute('data-variant', variant);

  sections.forEach((section, sectionIndex) => {
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'right-sidebar__section';

    section.items.forEach((item, itemIndex) => {
      const itemId = `right-sidebar-${sectionIndex}-${itemIndex}`;
      const isActive = activeItemId === itemId;

      const a = document.createElement('a');
      a.href = item.href ?? '#';
      a.className = 'right-sidebar__item';
      a.setAttribute('data-panel-title', item.label);
      if (item.icon) a.setAttribute('data-panel-icon', item.icon);
      a.setAttribute('data-item-id', itemId);
      if (isActive) a.setAttribute('data-active', 'true');
      a.setAttribute('data-right-sidebar-item', '');
      a.title = item.label;

      a.addEventListener('click', (e) => {
        e.preventDefault();
        onItemClick?.(itemId);
      });

      const labelSpan = document.createElement('span');
      labelSpan.className = 'right-sidebar__label';
      labelSpan.textContent = item.label;
      a.appendChild(labelSpan);

      const iconSpan = document.createElement('span');
      iconSpan.className = 'right-sidebar__icon';

      if (item.isCustom && item.customSrc) {
        if (item.customSrcActive) {
          const imgDefault = document.createElement('img');
          imgDefault.src = item.customSrc;
          imgDefault.alt = item.label;
          imgDefault.className = 'right-sidebar__dela-logo right-sidebar__dela-logo--default';
          const imgActive = document.createElement('img');
          imgActive.src = item.customSrcActive;
          imgActive.alt = item.label;
          imgActive.className = 'right-sidebar__dela-logo right-sidebar__dela-logo--active';
          iconSpan.appendChild(imgDefault);
          iconSpan.appendChild(imgActive);
        } else {
          const img = document.createElement('img');
          img.src = item.customSrc;
          img.alt = item.label;
          img.className = 'right-sidebar__dela-logo';
          iconSpan.appendChild(img);
        }
      } else if (item.icon) {
        if (isSidebarIconCustom(item.icon)) {
          const img = document.createElement('img');
          img.src = `${ASSETS_BASE}/mic-slash.svg`;
          img.alt = '';
          img.className = 'right-sidebar__icon-img';
          img.width = 24;
          img.height = 24;
          iconSpan.appendChild(img);
        } else {
          const IconFn = getSidebarIcon(item.icon);
          const svg = IconFn();
          svg.setAttribute('width', '24');
          svg.setAttribute('height', '24');
          iconSpan.appendChild(svg);
        }
      }

      a.appendChild(iconSpan);
      sectionDiv.appendChild(a);
    });

    nav.appendChild(sectionDiv);
  });

  return nav;
}

window.createRightSidebar = createRightSidebar;
