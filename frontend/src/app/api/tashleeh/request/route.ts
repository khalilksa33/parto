import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { part_requests, part_quotes, tenants } from '@/lib/schema';
import { eq, desc } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Basic validation
    if (!body.customerName || !body.customerPhone || !body.vehicleMake || !body.vehicleModel || !body.vehicleYear || !body.partName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const [newRequest] = await db
      .insert(part_requests)
      .values({
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        vehicleMake: body.vehicleMake,
        vehicleModel: body.vehicleModel,
        vehicleYear: body.vehicleYear,
        partName: body.partName,
        status: 'pending'
      })
      .returning();

    return NextResponse.json({ request: newRequest }, { status: 201 });
  } catch (error: any) {
    console.error('Create part request error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const tenantId = req.headers.get('X-Tenant-ID');

    if (id) {
      // Fetch specific request
      const [request] = await db.select().from(part_requests).where(eq(part_requests.id, id));
      if (!request) return NextResponse.json({ error: 'Request not found' }, { status: 404 });

      // Fetch quotes for this request
      const quotes = await db.select({
        id: part_quotes.id,
        price: part_quotes.price,
        condition: part_quotes.condition,
        notes: part_quotes.notes,
        status: part_quotes.status,
        createdAt: part_quotes.createdAt,
        tenantId: part_quotes.tenantId,
        tenantName: tenants.name,
        tenantPhone: tenants.phone,
      })
      .from(part_quotes)
      .leftJoin(tenants, eq(part_quotes.tenantId, tenants.id))
      .where(eq(part_quotes.requestId, id))
      .orderBy(desc(part_quotes.createdAt));

      return NextResponse.json({ request, quotes });
    } else if (tenantId) {
      // Fetch pending requests for vendor portal (all pending for scrapyards)
      const pendingRequests = await db.select().from(part_requests).where(eq(part_requests.status, 'pending')).orderBy(desc(part_requests.createdAt));
      
      // Fetch quotes submitted by this vendor
      const vendorQuotes = await db.select().from(part_quotes).where(eq(part_quotes.tenantId, tenantId));
      
      return NextResponse.json({ requests: pendingRequests, myQuotes: vendorQuotes });
    }

    return NextResponse.json({ error: 'Missing ID or Tenant ID' }, { status: 400 });
  } catch (error: any) {
    console.error('Fetch part request error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
