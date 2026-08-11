/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    /** Correlation id for the current request. */
    requestId: string;
    /** Whether the request passed admin Basic Auth. */
    isAdmin: boolean;
    /** Whether the request passed the site invite-code gate. */
    hasInviteAccess: boolean;
    /** Demo-shop cart id (from the `cart_id` cookie); set on `/shop*` routes. */
    cartId: string | null;
  }
}
