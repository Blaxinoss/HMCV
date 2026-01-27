/// <reference types="vite/client" />

export const VITE_API_URL = "https://hmcv.vercel.app"

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}