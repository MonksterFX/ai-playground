import type { APIRoute } from 'astro';
import { addCartItem, getOrCreateCart, recordEvent } from '../../../lib/db/repo';
import { getProductById } from '../../../lib/webshop/catalog';

/** Only allow same-site relative redirect targets. */
function safeRedirect(target: string | null, fallback: string): string {
  if (target && target.startsWith('/') && !target.startsWith('//')) return target;
  return fallback;
}

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const data = await request.formData();
  const productId = (data.get('productId') ?? '').toString();
  const qtyRaw = Number.parseInt((data.get('qty') ?? '1').toString(), 10);
  const qty = Number.isFinite(qtyRaw) && qtyRaw > 0 ? Math.min(qtyRaw, 99) : 1;
  const redirectTo = safeRedirect(data.get('redirectTo')?.toString() ?? null, '/shop/cart');

  const product = getProductById(productId);
  const cartId = locals.cartId;

  if (product && cartId) {
    getOrCreateCart(cartId);
    addCartItem(cartId, product.id, qty);
    recordEvent({
      eventType: 'cart_update',
      pageId: 'shop-cart',
      path: '/shop/cart/add',
      url: request.url,
      method: 'POST',
      statusCode: 303,
      requestId: locals.requestId,
      metadata: { action: 'add', productId: product.id, qty },
    });
  }

  const separator = redirectTo.includes('?') ? '&' : '?';
  const location = product ? `${redirectTo}${separator}added=${encodeURIComponent(product.id)}` : redirectTo;
  return redirect(location, 303);
};
