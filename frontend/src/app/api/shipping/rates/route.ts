import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, tenants } from '@/lib/schema';
import { eq, inArray } from 'drizzle-orm';
import { Shippo } from 'shippo';

const shippo = new Shippo({
  apiKeyHeader: process.env.SHIPPO_API_KEY || 'shippo_test_dummy_key',
});

// Fallback warehouse if a tenant has no address set
const defaultAddressFrom = {
  name: 'Parto Central Warehouse',
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

    const productIds = cartItems.map((item: any) => item.productId);
    const dbProducts = await db.select().from(products).where(inArray(products.id, productIds));

    // Group items by tenantId
    const itemsByTenant: Record<string, { product: any, quantity: number }[]> = {};
    
    for (const item of cartItems) {
      const product = dbProducts.find((p: any) => p.id === item.productId);
      if (product) {
        const tId = product.tenantId;
        if (!itemsByTenant[tId]) itemsByTenant[tId] = [];
        itemsByTenant[tId].push({ product, quantity: item.quantity });
      }
    }

    // Fetch tenant warehouse addresses
    const tenantIds = Object.keys(itemsByTenant);
    const dbTenants = await db.select().from(tenants).where(inArray(tenants.id, tenantIds as any[]));

    const multiOriginShipments = [];

    // Create a Shippo shipment for each origin warehouse
    for (const tId of tenantIds) {
      const tenantItems = itemsByTenant[tId];
      const tenant = dbTenants.find(t => t.id === tId);
      
      const addressFrom = (tenant && tenant.warehouseAddress) ? tenant.warehouseAddress : defaultAddressFrom;

      let totalWeight = 0;
      let maxLength = 0;
      let maxWidth = 0;
      let totalHeight = 0;

      for (const item of tenantItems) {
        totalWeight += (Number(item.product.weight) || 0.5) * item.quantity;
        maxLength = Math.max(maxLength, Number(item.product.length) || 10);
        maxWidth = Math.max(maxWidth, Number(item.product.width) || 10);
        totalHeight += (Number(item.product.height) || 10) * item.quantity;
      }

      const parcel = {
        length: maxLength.toString(),
        width: maxWidth.toString(),
        height: totalHeight.toString(),
        distanceUnit: 'cm' as const,
        weight: totalWeight.toString(),
        massUnit: 'kg' as const,
      };

      const shipmentPromise = shippo.shipments.create({
        addressFrom: addressFrom as any,
        addressTo: addressTo,
        parcels: [parcel],
        async: false,
      }).then(shipment => ({
        tenantId: tId,
        sellerName: tenant?.name || 'Seller',
        rates: shipment.rates
      }));

      multiOriginShipments.push(shipmentPromise);
    }

    // Wait for all Shippo API calls to complete
    const shipments = await Promise.all(multiOriginShipments);

    return NextResponse.json({ 
      multiOrigin: true,
      shipments 
    });
  } catch (error: any) {
    console.error('Error fetching shipping rates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
