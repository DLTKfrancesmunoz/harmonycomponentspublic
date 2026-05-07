/// <reference types="vite/client" />

declare module '*.css' {
  const src: string
  export default src
}

declare module '@dltkfrancesmunoz/harmony-design-system/styles/*.css' {
  const src: string
  export default src
}

declare module '@harmony-data/icon-manifest.json' {
  const value: {
    cp?: Record<string, { source?: string; svg?: string }>
    vp?: Record<string, { source?: string; svg?: string }>
    ppm?: Record<string, { source?: string; svg?: string }>
    maconomy?: Record<string, { source?: string; svg?: string }>
  }
  export default value
}
