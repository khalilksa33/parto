import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { dispatches, tenants } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerName, customerPhone, pickupLocation, dropoffLocation, vehicleDetails, serviceType } = body;

    if (!customerName || !customerPhone || !pickupLocation || !dropoffLocation) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const [newDispatch] = await db.insert(dispatches).values({
      customerName,
      customerPhone,
      pickupLocation,
      dropoffLocation,
      vehicleDetails,
      serviceType: serviceType || 'tow',
      status: 'pending',
    }).returning();

    return NextResponse.json({ success: true, dispatch: newDispatch }, { status: 201 });
  } catch (error: any) {
    console.error('Dispatch error:', error);
    return NextResponse.json({ error: error.message || 'Failed to create dispatch' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tenantId = searchParams.get('tenant_id');
  const action = searchParams.get('action');
  const dispatchId = searchParams.get('id');
  const serviceType = searchParams.get('service_type');

  try {
    if (dispatchId) {
      // Get specific dispatch, potentially joined with tenant details if accepted
      const results = await db.select({
        dispatch: dispatches,
        driverName: tenants.name,
        driverPhone: tenants.phone,
      })
      .from(dispatches)
      .leftJoin(tenants, eq(dispatches.acceptedBy, tenants.id))
      .where(eq(dispatches.id, dispatchId));

      if (results.length === 0) {
        return NextResponse.json({ error: 'Dispatch not found' }, { status: 404 });
      }
      return NextResponse.json({ dispatch: results[0].dispatch, driver: { name: results[0].driverName, phone: results[0].driverPhone } });
    }

    if (action === 'poll') {
      // Returns pending dispatches that are not accepted by anyone yet
      let query: any = eq(dispatches.status, 'pending');
      if (serviceType) {
        const { and } = require('drizzle-orm');
        query = and(eq(dispatches.status, 'pending'), eq(dispatches.serviceType, serviceType));
      }
      const pendingDispatches = await db.select().from(dispatches).where(query);
      
      let acceptedDispatches: any[] = [];
      if (tenantId) {
        acceptedDispatches = await db.select().from(dispatches).where(eq(dispatches.acceptedBy, tenantId));
      }

      return NextResponse.json({
        dispatches: [...pendingDispatches, ...acceptedDispatches]
      });
    }

    return NextResponse.json({ dispatches: await db.select().from(dispatches) });
  } catch (error: any) {
    console.error('Fetch dispatch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const tenantId = req.headers.get('X-Tenant-ID');

    if (!id || !tenantId) {
      return NextResponse.json({ error: 'Missing dispatch ID or Tenant ID' }, { status: 400 });
    }

    const body = await req.json();
    const { status, quote } = body;

    if (!status) {
      return NextResponse.json({ error: 'Missing status' }, { status: 400 });
    }

    let updateData: any = { status, updatedAt: new Date() };

    if (status === 'accepted') {
      updateData.acceptedBy = tenantId;
      if (quote) {
        updateData.quote = quote;
      }
    }

    const [updatedDispatch] = await db
      .update(dispatches)
      .set(updateData)
      .where(eq(dispatches.id, id as string))
      .returning();

    return NextResponse.json({ success: true, dispatch: updatedDispatch });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
