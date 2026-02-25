type Runtime = import("@astrojs/cloudflare").Runtime<Env>;
type Env = import("../worker-configuration").Env;

interface ImportMetaEnv {
  readonly PUBLIC_API_URL: string;
  readonly PUBLIC_CLIENT_URL:string
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Locals extends Runtime {
    otherLocals: {
      test: string;
    };
  }
}
