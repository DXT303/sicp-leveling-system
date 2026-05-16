declare module '*.css';
declare module '*.svg';
declare module '*.png';
declare module '*.jpg';

interface ImportMetaEnv {
  readonly VITE_PASSCODE: string;
  [key: string]: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
