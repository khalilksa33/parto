import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { tenants, products, users } from '../../../lib/schema';
import { redis } from '../../../lib/redis';
import { meiliClient } from '../../../lib/meilisearch';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Fetch all tenants
    const existingTenants = await db.select().from(tenants);
    
    // Hardcoded known names
    const tLuxury = existingTenants.find(t => t.name === 'Luxury Parts Co');
    const tPerformance = existingTenants.find(t => t.name === 'Performance Motors');
    const tRiyadh = existingTenants.find(t => t.name === 'Riyadh OEM Parts');

    // 2. Set up vendor users so the user can login
    const vendorsToCreate = [];
    if (tLuxury) vendorsToCreate.push({ email: 'luxury@parto.com', name: 'Luxury Parts Admin', tenantId: tLuxury.id });
    if (tPerformance) vendorsToCreate.push({ email: 'performance@parto.com', name: 'Performance Motors Admin', tenantId: tPerformance.id });
    if (tRiyadh) vendorsToCreate.push({ email: 'riyadh@parto.com', name: 'Riyadh OEM Admin', tenantId: tRiyadh.id });

    const passwordHash = await bcrypt.hash('vendor123', 10);

    for (const v of vendorsToCreate) {
      // Check if user exists
      const existingUser = await db.select().from(users).where(eq(users.email, v.email)).limit(1);
      if (existingUser.length === 0) {
        await db.insert(users).values({
          email: v.email,
          passwordHash: passwordHash,
          name: v.name,
          role: 'vendor',
          tenantId: v.tenantId,
          status: 'active'
        });
      }
    }

    // 3. Clear old duplicate products (only for these 3 tenants to avoid deleting other stuff if it exists)
    for (const t of [tLuxury, tPerformance, tRiyadh].filter(Boolean)) {
      if (t) {
        await db.delete(products).where(eq(products.tenantId, t.id));
        try {
          await redis.del(`products:tenant:${t.id}`);
        } catch (e) {}
      }
    }
    try {
      await redis.del(`products:all`);
    } catch (e) {}

    // 4. Create fresh unique products for each tenant (with 5 parts under Riyadh OEM Parts for comprehensive single-seller checkout testing)
    const newProducts = [];
    
    if (tRiyadh) {
      newProducts.push(
        {
          tenantId: tRiyadh.id,
          name: 'Toyota Camry OEM Ceramic Brake Pads Kit (04465-33471)',
          price: '385.00',
          category: 'Brakes & Suspension',
          description: 'Genuine Toyota front ceramic brake pad set for Camry 2018-2024.',
          image: 'https://images.unsplash.com/photo-1600705593881-229202517565?q=80&w=800&auto=format&fit=crop',
          rating: '4.9',
          featured: true,
          weight: '2.20',
          length: '20.00',
          width: '15.00',
          height: '8.00'
        },
        {
          tenantId: tRiyadh.id,
          name: 'Lexus LX570 / Land Cruiser OEM Oil Filter (90915-YZZD4)',
          price: '65.00',
          category: 'Engine Parts',
          description: 'Original Denso/Toyota oil filter element with gasket O-ring.',
          image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=800&auto=format&fit=crop',
          rating: '5.0',
          featured: true,
          weight: '0.45',
          length: '12.00',
          width: '12.00',
          height: '14.00'
        },
        {
          tenantId: tRiyadh.id,
          name: 'Toyota Hilux Front Shock Absorber Pair (48510-09W50)',
          price: '920.00',
          category: 'Brakes & Suspension',
          description: 'Heavy-duty genuine gas shock absorbers for Hilux 4x4.',
          image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=800&auto=format&fit=crop',
          rating: '4.8',
          featured: false,
          weight: '6.50',
          length: '55.00',
          width: '20.00',
          height: '15.00'
        },
        {
          tenantId: tRiyadh.id,
          name: 'Denso Iridium TT Spark Plugs Set of 6 (FK20HR11)',
          price: '310.00',
          category: 'Engine Parts',
          description: 'Long-life twin-tip iridium spark plugs for V6 3.5L Toyota/Lexus engines.',
          image: 'https://images.unsplash.com/photo-1586266153920-563b7df089e1?q=80&w=800&auto=format&fit=crop',
          rating: '4.9',
          featured: true,
          weight: '0.35',
          length: '15.00',
          width: '10.00',
          height: '5.00'
        },
        {
          tenantId: tRiyadh.id,
          name: 'Toyota Prado OEM LED Headlight Assembly RH (81130-60P70)',
          price: '2450.00',
          category: 'Exterior & Body',
          description: 'Original right-hand side full LED projector headlamp unit.',
          image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop',
          rating: '4.7',
          featured: false,
          weight: '4.80',
          length: '65.00',
          width: '35.00',
          height: '30.00'
        }
      );
    }

    if (tLuxury) {
      newProducts.push(
        {
          tenantId: tLuxury.id,
          name: 'Carbon Fiber Steering Wheel & Dashboard Trim Kit',
          price: '4500.00',
          category: 'Interior Accessories',
          image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop',
          rating: '4.9',
          featured: true
        },
        {
          tenantId: tLuxury.id,
          name: 'Nappa Leather Custom Seat Covers Set',
          price: '3200.00',
          category: 'Interior Accessories',
          image: 'https://images.unsplash.com/photo-1596706798031-bb035c935d2d?q=80&w=800&auto=format&fit=crop',
          rating: '4.8',
          featured: false
        }
      );
    }

    if (tPerformance) {
      newProducts.push(
        {
          tenantId: tPerformance.id,
          name: 'Twin-Turbo V8 Forged Short Block Assembly',
          price: '28000.00',
          category: 'Engine Parts',
          image: 'https://images.unsplash.com/photo-1586266153920-563b7df089e1?q=80&w=800&auto=format&fit=crop',
          rating: '5.0',
          featured: true
        },
        {
          tenantId: tPerformance.id,
          name: 'Valvetronic Full Titanium Cat-Back Exhaust System',
          price: '9500.00',
          category: 'Exhaust Systems',
          image: 'https://images.unsplash.com/photo-1616428789525-41e975f8f53a?q=80&w=800&auto=format&fit=crop',
          rating: '4.7',
          featured: true
        }
      );
    }

    let insertedProducts: any[] = [];
    if (newProducts.length > 0) {
      insertedProducts = await db.insert(products).values(newProducts).returning();
    }

    // 5. Sync to Meilisearch if running
    try {
      const index = meiliClient.index('products');
      await index.deleteAllDocuments();
      if (insertedProducts.length > 0) {
        await index.addDocuments(
          insertedProducts.map(p => ({
            id: p.id,
            name: p.name,
            price: Number(p.price),
            category: p.category,
            tenantId: p.tenantId,
            tenant_id: p.tenantId,
            image: p.image,
            rating: Number(p.rating || 4.8),
            featured: Boolean(p.featured),
            status: p.status
          }))
        );
      }
    } catch (meiliErr) {
      console.warn('Meilisearch sync skipped or failed:', meiliErr);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Seller accounts verified, old duplicates cleared, and fresh parts seeded (including 5 OEM parts under Riyadh OEM Parts).',
      primaryTestSeller: tRiyadh ? {
        name: tRiyadh.name,
        tenantId: tRiyadh.id,
        email: 'riyadh@parto.com',
        password: 'vendor123',
        partsCount: 5
      } : null,
      accounts: vendorsToCreate.map(v => ({ email: v.email, password: 'vendor123', tenantId: v.tenantId }))
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
