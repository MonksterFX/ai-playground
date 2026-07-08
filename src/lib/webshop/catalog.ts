export interface Product {
  id: string;
  name: string;
  /** Price in cents (USD). */
  priceInCents: number;
  shortDescription: string;
  longDescription: string;
  /** A single emoji used as a visual placeholder instead of an image. */
  emoji: string;
}

export const products: readonly Product[] = [
  {
    id: 'widget-blue',
    name: 'Blue Widget',
    priceInCents: 1299,
    shortDescription: 'A sturdy, multipurpose blue widget.',
    longDescription:
      'The Blue Widget is crafted from high-quality recycled materials. It measures 10 cm × 5 cm and weighs just 80 g. Suitable for home, office, and outdoor use. Comes with a 1-year warranty.',
    emoji: '🔵',
  },
  {
    id: 'gadget-green',
    name: 'Green Gadget',
    priceInCents: 2499,
    shortDescription: 'An energy-efficient green gadget.',
    longDescription:
      'The Green Gadget operates on a single AA battery and consumes 30% less power than comparable devices. Dimensions: 8 cm × 4 cm × 3 cm. Ideal for testing automation scenarios that require product detail pages with longer copy.',
    emoji: '🟢',
  },
  {
    id: 'doohickey-red',
    name: 'Red Doohickey',
    priceInCents: 799,
    shortDescription: 'A compact, pocket-sized red doohickey.',
    longDescription:
      'Small enough to fit in any pocket, the Red Doohickey punches above its weight. Water-resistant to IPX4 standard. Available in red only. Ships within 2 business days.',
    emoji: '🔴',
  },
  {
    id: 'thingamajig-yellow',
    name: 'Yellow Thingamajig',
    priceInCents: 3999,
    shortDescription: 'The premium yellow thingamajig — our best seller.',
    longDescription:
      'Built for enthusiasts, the Yellow Thingamajig features dual-mode operation, a matte finish, and a detachable accessory rail. Backed by our 2-year extended warranty and free return shipping.',
    emoji: '🟡',
  },
  {
    id: 'gizmo-purple',
    name: 'Purple Gizmo',
    priceInCents: 1599,
    shortDescription: 'A versatile purple gizmo for every occasion.',
    longDescription:
      'The Purple Gizmo adapts to your needs. Whether on the desk or on the go, its lightweight frame and intuitive controls make it the everyday companion you didn\'t know you needed. Includes carrying pouch.',
    emoji: '🟣',
  },
] as const;

/** Look up a product by its id. */
export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

/** Return all products. */
export function getAllProducts(): readonly Product[] {
  return products;
}

/** Format a price in cents to a locale string, e.g. "$12.99". */
export function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}
