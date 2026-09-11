/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_RESERVATION_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
