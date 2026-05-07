export interface ThemeComponent {
  title: string;
  href: string;
  icon: string;
}

export interface ThemeCompany {
  id: string;
  name: string;
  gradientColor: string; // Center color of the gradient
}

export interface ThemeConfig {
  name: string;
  fullName: string;
  primaryColor: string;
  components: ThemeComponent[];
  companies?: ThemeCompany[];
}

export const themeConfig: Record<string, ThemeConfig> = {
  cp: {
    name: 'CP',
    fullName: 'Harmony CP Design System',
    primaryColor: '#0073E6',
    components: [
      { title: 'Floating Nav', href: '/cp/floating-nav', icon: 'ti-navigation' },
      { title: 'Kanban', href: '/cp/kanban', icon: 'ti-layout-kanban' },
    ],
    companies: [
      { id: 'acme-corp', name: 'Acme Corporation', gradientColor: '#FF507B' },
      { id: 'ocean-industries', name: 'Ocean Industries', gradientColor: '#285F8C' },
      { id: 'violet-systems', name: 'Violet Systems', gradientColor: '#DC50FF' },
      { id: 'azure-dynamics', name: 'Azure Dynamics', gradientColor: '#5077FF' },
      { id: 'sunset-corporation', name: 'Sunset Corporation', gradientColor: '#FFAF50' }
    ]
  },
  vp: {
    name: 'VP',
    fullName: 'Harmony VP Design System',
    primaryColor: '#0073E6',
    components: [],
    companies: [
      { id: 'vendor-a', name: 'Vendor A', gradientColor: '#10B981' },
      { id: 'vendor-b', name: 'Vendor B', gradientColor: '#F59E0B' }
    ]
  },
  ppm: {
    name: 'PPM',
    fullName: 'Harmony PPM Design System',
    primaryColor: '#0073E6',
    components: [],
    companies: [
      { id: 'project-alpha', name: 'Project Alpha', gradientColor: '#8B5CF6' },
      { id: 'project-beta', name: 'Project Beta', gradientColor: '#EC4899' }
    ]
  },
  maconomy: {
    name: 'Maconomy',
    fullName: 'Harmony Maconomy Design System',
    primaryColor: '#0073E6',
    components: [],
    companies: [
      { id: 'consulting-firm', name: 'Consulting Firm', gradientColor: '#0073E6' }
    ]
  }
};


