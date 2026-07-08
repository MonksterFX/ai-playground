/**
 * Server-side cart service. Combines persisted line items (see
 * `src/lib/db/repo.ts`) with the in-code product catalog to produce a fully
 * priced cart view. This is the single source of truth for the demo shop;
 * everything works without client-side JavaScript.
 */
import { getCartItems } from '../db/repo';
import { formatPrice, getProductById, type Product } from './catalog';

/** Flat shipping fee applied to any non-empty cart, in cents. */
export const SHIPPING_IN_CENTS = 499;

export interface CartLine {
  product: Product;
  qty: number;
  /** Line total in cents (`product.priceInCents * qty`). */
  lineTotalInCents: number;
}

export interface CartView {
  lines: CartLine[];
  /** Total number of individual units across all lines. */
  itemCount: number;
  subtotalInCents: number;
  shippingInCents: number;
  totalInCents: number;
  isEmpty: boolean;
}

/**
 * Build a priced view of a cart. Line items whose product id no longer exists
 * in the catalog are skipped rather than throwing.
 */
export function getCartView(cartId: string | null | undefined): CartView {
  const lines: CartLine[] = [];

  if (cartId) {
    for (const item of getCartItems(cartId)) {
      const product = getProductById(item.productId);
      if (!product) continue;
      lines.push({
        product,
        qty: item.qty,
        lineTotalInCents: product.priceInCents * item.qty,
      });
    }
  }

  const itemCount = lines.reduce((sum, line) => sum + line.qty, 0);
  const subtotalInCents = lines.reduce((sum, line) => sum + line.lineTotalInCents, 0);
  const shippingInCents = lines.length > 0 ? SHIPPING_IN_CENTS : 0;

  return {
    lines,
    itemCount,
    subtotalInCents,
    shippingInCents,
    totalInCents: subtotalInCents + shippingInCents,
    isEmpty: lines.length === 0,
  };
}

/** Convenience re-export so pages can format prices from one import. */
export { formatPrice };
