export interface ThemeComponent {
  title: string;
  href: string;
  icon: string;
}

export interface ThemeConfig {
  name: string;
  primaryColor: string;
  components: ThemeComponent[];
}

export const themeConfig: Record<string, ThemeConfig> = {
  cp: {
    name: 'CP',
    primaryColor: '#4C92D9',
    components: [
      { title: 'Floating Nav', href: '/cp/floating-nav', icon: 'ti-navigation' }
    ]
  },
  vp: {
    name: 'VP',
    primaryColor: '#4C92D9',
    components: []
  },
  ppm: {
    name: 'PPM',
    primaryColor: '#30659F',
    components: []
  },
  maconomy: {
    name: 'Maconomy',
    primaryColor: '#804A98',
    components: []
  }
};

