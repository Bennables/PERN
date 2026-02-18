/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LINK: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
