import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { products } from '../../../../lib/schema';
import { eq, inArray } from 'drizzle-orm';
import { Shippo } from 'shippo';

const shippo = new Shippo({
  apiKeyHeader: process.env.SHIPPO_API_KEY || 'shippo_test_dummy_key',
});

// The warehouse address where parts are shipped from
const addressFrom = {
  name: 'Parto Warehouse',
  street1: '123 Parts Ave',
  city: 'Riyadh',
  state: 'RIY',
  zip: '12211',
  country: 'SA',
  phone: '+966500000000',
  email: 'shipping@parto.local'
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { addressTo, cartItems } = body;

    if (!addressTo || !cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Missing address or cart items' }, { status: 400 });
    }

    // Extract product IDs
    const productIds = cartItems.map((item: any) => item.productId);

    // Fetch products from database to get dimensions and weight
    const dbProducts = await db.select().from(products).where(inArray(products.id, productIds));

    // Calculate total weight and bounding box (simplified algorithm)
    let totalWeight = 0;
    let maxLength = 0;
    let maxWidth = 0;
    let totalHeight = 0;

    for (const item of cartItems) {
      const product = dbProducts.find((p: any) => p.id === item.productId);
      if (product) {
        totalWeight += (Number(product.weight) || 0.5) * item.quantity;
        maxLength = Math.max(maxLength, Number(product.length) || 10);
        maxWidth = Math.max(maxWidth, Number(product.width) || 10);
        totalHeight += (Number(product.height) || 10) * item.quantity;
      }
    }

    // Create the parcel object for Shippo
    const parcel = {
      length: maxLength.toString(),
      width: maxWidth.toString(),
      height: totalHeight.toString(),
      distanceUnit: 'cm' as const,
      weight: totalWeight.toString(),
      massUnit: 'kg' as const,
    };

    // Make request to Shippo to get rates
    const shipment = await shippo.shipments.create({
      addressFrom: addressFrom,
      addressTo: addressTo,
      parcels: [parcel],
      async: false,
    });

    return NextResponse.json({ rates: shipment.rates });
  } catch (error: any) {
    console.error('Error fetching shipping rates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
