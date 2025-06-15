/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as get_fcm_tokens from "../get_fcm_tokens.js";
import type * as get_functions from "../get_functions.js";
import type * as http from "../http.js";
import type * as seed from "../seed.js";
import type * as send_push from "../send_push.js";
import type * as services from "../services.js";
import type * as set_fcm_token from "../set_fcm_token.js";
import type * as set_functions from "../set_functions.js";
import type * as topic_push from "../topic_push.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  get_fcm_tokens: typeof get_fcm_tokens;
  get_functions: typeof get_functions;
  http: typeof http;
  seed: typeof seed;
  send_push: typeof send_push;
  services: typeof services;
  set_fcm_token: typeof set_fcm_token;
  set_functions: typeof set_functions;
  topic_push: typeof topic_push;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
