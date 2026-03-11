export {}; // ensure this file is treated as a module

declare global {
  interface ImportMetaEnv {
    // list the keys you expect to exist at compile time:
    readonly NODE_ENV?: string;
    readonly TZ?: string;

    // allow other environment variables if you’d like:
    [key: string]: string | undefined;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
