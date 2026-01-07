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
    primaryColor: '#1D8DFF',
    components: [
      { title: 'Floating Nav', href: '/cp/floating-nav', icon: 'ti-navigation' }
    ],
    companies: [
      { id: 'acme-corp', name: 'Acme Corporation', gradientColor: '#FF507B' },
      { id: 'tech-industries', name: 'Tech Industries', gradientColor: '#1D8DFF' },
      { id: 'global-services', name: 'Global Services', gradientColor: '#1D8DFF' }
    ]
  },
  vp: {
    name: 'VP',
    fullName: 'Harmony VP Design System',
    primaryColor: '#1D8DFF',
    components: [],
    companies: [
      { id: 'vendor-a', name: 'Vendor A', gradientColor: '#10B981' },
      { id: 'vendor-b', name: 'Vendor B', gradientColor: '#F59E0B' }
    ]
  },
  ppm: {
    name: 'PPM',
    fullName: 'Harmony PPM Design System',
    primaryColor: '#1D8DFF',
    components: [],
    companies: [
      { id: 'project-alpha', name: 'Project Alpha', gradientColor: '#8B5CF6' },
      { id: 'project-beta', name: 'Project Beta', gradientColor: '#EC4899' }
    ]
  },
  maconomy: {
    name: 'Maconomy',
    fullName: 'Harmony Maconomy Design System',
    primaryColor: '#1D8DFF',
    components: [],
    companies: [
      { id: 'consulting-firm', name: 'Consulting Firm', gradientColor: '#1D8DFF' }
    ]
  }
};


