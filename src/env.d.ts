/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    /** Correlation id for the current request. */
    requestId: string;
    /** Whether the request passed admin Basic Auth. */
    isAdmin: boolean;
    /** Demo-shop cart id (from the `cart_id` cookie); set on `/shop*` routes. */
    cartId: string | null;
  }
}
