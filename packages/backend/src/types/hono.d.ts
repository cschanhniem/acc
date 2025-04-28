declare module 'hono' {
  import type { Variables, AppBindings } from './bindings';

  export class Hono<E = any> {
    constructor(options?: any);
    use(path: string, ...handlers: any[]): this;
    get(path: string, ...handlers: any[]): this;
    post(path: string, ...handlers: any[]): this;
    route(path: string, app: Hono): this;
    notFound(handler: (c: Context) => any): this;
    onError(handler: (err: Error, c: Context) => any): this;
  }

  export type Handler<E = any> = (c: Context<E>, next?: () => Promise<void>) => any;

  export interface Context<E = any> {
    env: E extends { Bindings: infer B } ? B : any;
    req: {
      url: string;
      method: string;
      headers: Headers;
      json(): Promise<any>;
      formData(): Promise<FormData>;
      text(): Promise<string>;
      arrayBuffer(): Promise<ArrayBuffer>;
      header(name: string): string | null;
      param(key: string): string;
    };
    get<K extends keyof Variables>(key: K): Variables[K];
    set<K extends keyof Variables>(key: K, value: Variables[K]): void;
    json(data: Record<string, any>, status?: number): Response;
    text(text: string, status?: number): Response;
  }

  export interface Env {
    Bindings?: Record<string, any>;
    Variables?: Variables;
  }
}
