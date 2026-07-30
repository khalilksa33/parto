import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { part_quotes, part_requests } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const tenantId = req.headers.get('X-Tenant-ID');
    if (!tenantId) {
      return NextResponse.json({ error: 'Missing Tenant ID' }, { status: 400 });
    }

    const body = await req.json();
    if (!body.requestId || !body.price || !body.condition) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if vendor already quoted
    const existingQuotes = await db.select().from(part_quotes).where(and(eq(part_quotes.requestId, body.requestId), eq(part_quotes.tenantId, tenantId)));
    if (existingQuotes.length > 0) {
      return NextResponse.json({ error: 'You have already submitted a quote for this request' }, { status: 400 });
    }

    const [newQuote] = await db
      .insert(part_quotes)
      .values({
        requestId: body.requestId,
        tenantId,
        price: body.price,
        condition: body.condition,
        notes: body.notes || null,
        status: 'pending'
      })
      .returning();

    // Mark request as quoted if it's pending
    await db.update(part_requests).set({ status: 'quoted' }).where(and(eq(part_requests.id, body.requestId), eq(part_requests.status, 'pending')));

    return NextResponse.json({ quote: newQuote }, { status: 201 });
  } catch (error: any) {
    console.error('Create quote error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const quoteId = searchParams.get('id');

    if (!quoteId) {
      return NextResponse.json({ error: 'Missing quote ID' }, { status: 400 });
    }

    const body = await req.json();
    const { status, requestId } = body;

    if (status === 'accepted') {
      if (!requestId) return NextResponse.json({ error: 'Missing requestId' }, { status: 400 });
      
      // Update this quote to accepted
      await db.update(part_quotes).set({ status: 'accepted', updatedAt: new Date() }).where(eq(part_quotes.id, quoteId));
      
      // Update all other quotes for this request to rejected
      await db.execute(`UPDATE part_quotes SET status = 'rejected' WHERE request_id = '${requestId}' AND id != '${quoteId}'`);

      // Update request to accepted
      await db.update(part_requests).set({ status: 'accepted', updatedAt: new Date() }).where(eq(part_requests.id, requestId));

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error: any) {
    console.error('Update quote error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
