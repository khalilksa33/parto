import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { products } from '../../../lib/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    // Automotive part images
    const updates = [
      { name: 'V8 Engine Block (Brand New)', url: 'https://images.unsplash.com/photo-1586266153920-563b7df089e1?q=80&w=800&auto=format&fit=crop' },
      { name: 'Ceramic Brake Kit', url: 'https://images.unsplash.com/photo-1600705593881-229202517565?q=80&w=800&auto=format&fit=crop' },
      { name: 'Full Titanium Exhaust', url: 'https://images.unsplash.com/photo-1596706798031-bb035c935d2d?q=80&w=800&auto=format&fit=crop' }
    ];

    for (const update of updates) {
      await db.update(products)
        .set({ image: update.url })
        .where(eq(products.name, update.name));
    }

    return NextResponse.json({ success: true, message: 'Images updated via Next.js API' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
