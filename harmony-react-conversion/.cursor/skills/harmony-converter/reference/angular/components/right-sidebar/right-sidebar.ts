import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface NavItem {
  icon?: string;
  label: string;
  href?: string;
  isCustom?: boolean;
  customSrc?: string;
  customSrcActive?: string;
}

export interface Section {
  items: NavItem[];
}

const cpSections: Section[] = [
  {
    items: [
      { label: 'Dela AI', isCustom: true, customSrc: '/RS_DelaDefault.svg', customSrcActive: '/RS_Dela_Active.svg' },
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

@Component({
  selector: 'app-right-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './right-sidebar.html',
})
export class RightSidebar {
  variant = input<'cp' | 'vp' | 'ppm' | 'maconomy'>('cp');
  sections = input<Section[]>(cpSections);
  activeItemId = input<string | null>(null);

  itemClick = output<string>();

  isSidebarIconCustom(name: string): boolean {
    return name === 'mic-slash';
  }

  handleItemClick(e: Event, itemId: string): void {
    e.preventDefault();
    this.itemClick.emit(itemId);
  }

  getItemId(sectionIndex: number, itemIndex: number): string {
    return `right-sidebar-${sectionIndex}-${itemIndex}`;
  }

  isActive(sectionIndex: number, itemIndex: number): boolean {
    return this.activeItemId() === this.getItemId(sectionIndex, itemIndex);
  }

  get sectionsWithIndex(): { section: Section; sectionIndex: number }[] {
    return this.sections().map((section, sectionIndex) => ({ section, sectionIndex }));
  }
}
