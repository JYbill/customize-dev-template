import { AsyncLocalStorage } from "node:async_hooks";

import type { AsyncContext } from "#types/library.d.ts";

const asyncLocalStorage = new AsyncLocalStorage<AsyncContext>();

export { asyncLocalStorage };
