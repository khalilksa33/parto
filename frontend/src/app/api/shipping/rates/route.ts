import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, tenants } from '@/lib/schema';
import { inArray } from 'drizzle-orm';
import { Shippo } from 'shippo';

export const dynamic = 'force-dynamic';

const shippoApiKey = process.env.SHIPPO_API_KEY || '';
const hasLiveShippoKey = Boolean(
  shippoApiKey &&
  shippoApiKey !== 'shippo_test_dummy_key' &&
  !shippoApiKey.includes('dummy')
);

const shippo = hasLiveShippoKey
  ? new Shippo({ apiKeyHeader: shippoApiKey })
  : null;

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

function calculateKsaCarrierRates(params: {
  originCity: string;
  destinationCity: string;
  totalWeightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
}) {
  const origin = (params.originCity || 'Riyadh').trim().toLowerCase();
  const dest = (params.destinationCity || 'Riyadh').trim().toLowerCase();
  const isSameCity = origin === dest;

  const volumetricWeight = (params.lengthCm * params.widthCm * params.heightCm) / 5000;
  const billableWeight = Math.max(0.5, params.totalWeightKg, volumetricWeight);
  const extraKg = Math.max(0, billableWeight - 1);

  const smsaAmount = (isSameCity ? 18 : 25) + extraKg * (isSameCity ? 1.5 : 2.5);
  const aramexAmount = (isSameCity ? 21 : 28) + extraKg * (isSameCity ? 1.75 : 2.75);
  const splAmount = (isSameCity ? 15 : 20) + extraKg * (isSameCity ? 1.0 : 1.75);
  const dhlAmount = (isSameCity ? 35 : 45) + extraKg * (isSameCity ? 2.5 : 4.0);

  return [
    {
      id: 'spl-economy',
      provider: 'SPL (Saudi Post)',
      servicelevel: { name: isSameCity ? 'City Parcel' : 'Economy Domestic' },
      estimatedDays: isSameCity ? '2-3 Days' : '3-5 Days',
      amount: splAmount.toFixed(2),
      currency: 'SAR'
    },
    {
      id: 'smsa-standard',
      provider: 'SMSA Express',
      servicelevel: { name: isSameCity ? 'Same-City Express' : 'Standard KSA' },
      estimatedDays: isSameCity ? '1-2 Days' : '2-3 Days',
      amount: smsaAmount.toFixed(2),
      currency: 'SAR'
    },
    {
      id: 'aramex-domestic',
      provider: 'Aramex',
      servicelevel: { name: 'Domestic Parcel' },
      estimatedDays: isSameCity ? '1-2 Days' : '2-4 Days',
      amount: aramexAmount.toFixed(2),
      currency: 'SAR'
    },
    {
      id: 'dhl-express',
      provider: 'DHL Express',
      servicelevel: { name: 'Priority Next Day' },
      estimatedDays: '1 Business Day',
      amount: dhlAmount.toFixed(2),
      currency: 'SAR'
    }
  ];
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { addressTo, cartItems } = body;

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: 'Missing cart items' }, { status: 400 });
    }

    const effectiveAddressTo = {
      name: addressTo?.name || 'Customer',
      street1: addressTo?.street1 || 'King Fahd Road',
      city: addressTo?.city || 'Riyadh',
      state: addressTo?.state || 'RIY',
      zip: addressTo?.zip || '12211',
      country: addressTo?.country || 'SA'
    };

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const productIds = cartItems
      .map((item: any) => item.productId || item.product?.id)
      .filter((id: any) => typeof id === 'string' && uuidRegex.test(id));

    let dbProducts: any[] = [];
    if (productIds.length > 0) {
      try {
        dbProducts = await db.select().from(products).where(inArray(products.id, productIds));
      } catch (dbErr) {
        console.warn('Products lookup fallback in shipping calculation:', dbErr);
      }
    }

    // Group items by tenantId (falling back to client-supplied item/product data if DB row not found)
    const itemsByTenant: Record<string, { product: any; quantity: number }[]> = {};

    for (const item of cartItems) {
      const itemProductId = item.productId || item.product?.id;
      const dbProduct = dbProducts.find((p: any) => p.id === itemProductId);
      const mergedProduct = dbProduct || item.product || {
        id: itemProductId || 'unknown',
        tenantId: item.tenantId || 'default-seller',
        weight: item.weight || 1.5,
        length: item.length || 20,
        width: item.width || 15,
        height: item.height || 10
      };

      const tId = mergedProduct.tenantId || item.tenantId || 'default-seller';
      if (!itemsByTenant[tId]) itemsByTenant[tId] = [];
      itemsByTenant[tId].push({
        product: mergedProduct,
        quantity: Math.max(1, Number(item.quantity) || 1)
      });
    }

    const tenantIds = Object.keys(itemsByTenant);
    const validTenantUuids = tenantIds.filter(id => uuidRegex.test(id));

    let dbTenants: any[] = [];
    if (validTenantUuids.length > 0) {
      try {
        dbTenants = await db.select().from(tenants).where(inArray(tenants.id, validTenantUuids));
      } catch (tenantErr) {
        console.warn('Tenants lookup fallback in shipping calculation:', tenantErr);
      }
    }

    const multiOriginShipments = [];

    for (const tId of tenantIds) {
      const tenantItems = itemsByTenant[tId];
      const tenant = dbTenants.find(t => t.id === tId);

      const addressFrom: any = (tenant && tenant.warehouseAddress)
        ? tenant.warehouseAddress
        : defaultAddressFrom;

      let totalWeight = 0;
      let maxLength = 0;
      let maxWidth = 0;
      let totalHeight = 0;

      for (const item of tenantItems) {
        totalWeight += (Number(item.product.weight) || 1.5) * item.quantity;
        maxLength = Math.max(maxLength, Number(item.product.length) || 20);
        maxWidth = Math.max(maxWidth, Number(item.product.width) || 15);
        totalHeight += (Number(item.product.height) || 10) * item.quantity;
      }

      const fallbackRates = calculateKsaCarrierRates({
        originCity: addressFrom.city || 'Riyadh',
        destinationCity: effectiveAddressTo.city || 'Riyadh',
        totalWeightKg: totalWeight,
        lengthCm: maxLength,
        widthCm: maxWidth,
        heightCm: totalHeight
      });

      const parcel = {
        length: maxLength.toString(),
        width: maxWidth.toString(),
        height: totalHeight.toString(),
        distanceUnit: 'cm' as const,
        weight: totalWeight.toFixed(2),
        massUnit: 'kg' as const,
      };

      if (shippo) {
        const shipmentPromise = shippo.shipments.create({
          addressFrom: addressFrom as any,
          addressTo: effectiveAddressTo,
          parcels: [parcel],
          async: false,
        }).then(shipment => ({
          tenantId: tId,
          sellerName: tenant?.name || 'Authorized Parto Seller',
          originCity: addressFrom.city || 'Riyadh',
          destinationCity: effectiveAddressTo.city || 'Riyadh',
          totalWeight: Number(totalWeight.toFixed(2)),
          parcel,
          rates: (shipment.rates && shipment.rates.length > 0) ? shipment.rates : fallbackRates
        })).catch(() => ({
          tenantId: tId,
          sellerName: tenant?.name || 'Authorized Parto Seller',
          originCity: addressFrom.city || 'Riyadh',
          destinationCity: effectiveAddressTo.city || 'Riyadh',
          totalWeight: Number(totalWeight.toFixed(2)),
          parcel,
          rates: fallbackRates
        }));

        multiOriginShipments.push(shipmentPromise);
      } else {
        multiOriginShipments.push(Promise.resolve({
          tenantId: tId,
          sellerName: tenant?.name || 'Authorized Parto Seller',
          originCity: addressFrom.city || 'Riyadh',
          destinationCity: effectiveAddressTo.city || 'Riyadh',
          totalWeight: Number(totalWeight.toFixed(2)),
          parcel,
          rates: fallbackRates
        }));
      }
    }

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
