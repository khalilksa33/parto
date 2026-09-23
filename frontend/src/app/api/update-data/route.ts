import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { tenants, products, users } from '../../../lib/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

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
      }
    }

    // 4. Create fresh unique products for each tenant
    const newProducts = [];
    
    if (tLuxury) {
      newProducts.push({
        tenantId: tLuxury.id,
        name: 'Carbon Fiber Dashboard Kit',
        price: '4500.00',
        category: 'Interior Accessories',
        image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop',
        rating: '4.9',
        featured: true
      });
      newProducts.push({
        tenantId: tLuxury.id,
        name: 'Premium Leather Seat Covers',
        price: '3200.00',
        category: 'Interior Accessories',
        image: 'https://images.unsplash.com/photo-1596706798031-bb035c935d2d?q=80&w=800&auto=format&fit=crop', // generic auto vibe
        rating: '4.8',
        featured: false
      });
    }

    if (tPerformance) {
      newProducts.push({
        tenantId: tPerformance.id,
        name: 'Twin-Turbo V8 Engine Block',
        price: '28000.00',
        category: 'Engine Parts',
        image: 'https://images.unsplash.com/photo-1586266153920-563b7df089e1?q=80&w=800&auto=format&fit=crop',
        rating: '5.0',
        featured: true
      });
      newProducts.push({
        tenantId: tPerformance.id,
        name: 'Full Titanium Exhaust System',
        price: '9500.00',
        category: 'Exhaust Systems',
        image: 'https://images.unsplash.com/photo-1616428789525-41e975f8f53a?q=80&w=800&auto=format&fit=crop',
        rating: '4.7',
        featured: false
      });
    }

    if (tRiyadh) {
      newProducts.push({
        tenantId: tRiyadh.id,
        name: 'OEM Ceramic Brake Pads Kit',
        price: '1200.00',
        category: 'Brakes & Suspension',
        image: 'https://images.unsplash.com/photo-1600705593881-229202517565?q=80&w=800&auto=format&fit=crop',
        rating: '4.6',
        featured: true
      });
      newProducts.push({
        tenantId: tRiyadh.id,
        name: 'OEM Sports Suspension Kit',
        price: '5400.00',
        category: 'Brakes & Suspension',
        image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=800&auto=format&fit=crop',
        rating: '4.5',
        featured: false
      });
    }

    if (newProducts.length > 0) {
      await db.insert(products).values(newProducts);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Sellers accounts created, old duplicates deleted, and fresh unique products seeded.',
      accounts: vendorsToCreate.map(v => ({ email: v.email, password: 'vendor123' }))
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
