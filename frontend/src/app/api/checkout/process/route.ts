import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders } from '@/lib/schema';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer, cartItems, shippingRates, paymentMethod, totalAmount } = body;

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Since it's a guest checkout for now, generate a random customer UUID
    const customerId = crypto.randomUUID();

    // Group items by seller (tenantId)
    const itemsBySeller = cartItems.reduce((acc: any, item: any) => {
      const tId = item.product.tenantId;
      if (!acc[tId]) acc[tId] = [];
      acc[tId].push(item);
      return acc;
    }, {});

    const generatedOrderIds = [];

    // Create a separate order row for each seller
    for (const [tenantId, tenantItems] of Object.entries(itemsBySeller)) {
      
      // Calculate subtotal for this seller
      const itemsArray = tenantItems as any[];
      const sellerSubtotal = itemsArray.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      
      // Calculate shipping for this seller
      let sellerShipping = 15.00;
      if (shippingRates?.multiOrigin) {
        const shipInfo = shippingRates.shipments.find((s:any) => s.tenantId === tenantId);
        if (shipInfo && shipInfo.rates.length > 0) {
          const cheapest = shipInfo.rates.sort((a:any, b:any) => parseFloat(a.amount) - parseFloat(b.amount))[0];
          sellerShipping = parseFloat(cheapest.amount);
        }
      }

      const sellerTotal = sellerSubtotal + sellerShipping + (paymentMethod === 'cod' ? 10 : 0);
      const randomString = Math.random().toString(36).substring(2, 10).toUpperCase();
      const orderNumber = `ORD-${randomString}`;

      const newOrder = await db.insert(orders).values({
        tenantId: tenantId,
        orderNumber: orderNumber,
        customerId: customerId,
        totalAmount: sellerTotal.toFixed(2),
        currency: 'SAR',
        status: paymentMethod === 'cod' ? 'pending_cod' : 'paid',
        metadata: {
          items: itemsArray,
          shippingAddress: customer,
          paymentMethod: paymentMethod,
          shippingCost: sellerShipping
        }
      }).returning({ id: orders.id, orderNumber: orders.orderNumber });

      generatedOrderIds.push(newOrder[0].orderNumber);
    }

    // In a real app with Stripe/Moyasar, we would return a ClientSecret here.
    // For now, we simulate immediate success.

    return NextResponse.json({ 
      success: true, 
      message: 'Orders created successfully',
      orderIds: generatedOrderIds
    });

  } catch (error: any) {
    console.error('Checkout Process Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process checkout' }, { status: 500 });
  }
}
