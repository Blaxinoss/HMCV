/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_DEFAULT_TENANT?: string;
    readonly VITE_API_URL?: string;
    readonly VITE_DEMO_MODE?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
