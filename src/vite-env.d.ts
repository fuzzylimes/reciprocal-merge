/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEA_PROXY_URL: string;
  readonly VITE_APP_VERSION: string;
  // add other environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
