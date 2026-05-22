/// <reference types="vite/client" />

declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}

interface ImportMetaEnv {
  /** Human-readable app version, surfaced in the UI footer or DevTools. */
  readonly VITE_APP_VERSION: string;
  /** Optional Sentry DSN — when set, logger will start reporting errors. */
  readonly VITE_SENTRY_DSN?: string;
  /** Public CDN base URL for sprites / sounds / backgrounds. Empty for local. */
  readonly VITE_ASSETS_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
