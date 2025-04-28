import { Context as HonoContext } from "hono";
import { Env } from "./env";

declare module "hono" {
  interface Context extends HonoContext {
    get(key: "user"): { id: string; email: string } | undefined;
  }

  interface ContextVariableMap {
    user: { id: string; email: string };
  }

  interface Bindings extends Env {}
}
