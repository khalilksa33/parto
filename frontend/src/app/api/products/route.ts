import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, tenants } from '@/lib/schema';
import { redis } from '@/lib/redis';
import { eq } from 'drizzle-orm';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { resolvePartImage } from '@/lib/part-images';

export const dynamic = 'force-dynamic';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const BRAND_SEED_CATALOG = [
  {
    brandName: 'Lexus',
    sellerPrefer: 'Luxury Parts Co',
    name: 'Lexus ES350 / RX350 Genuine Front Brake Rotor Disc (43512-33140)',
    price: '640.00',
    category: 'Brakes & Suspension',
    description: 'Genuine Lexus ventilated front brake disc rotor for ES350 and RX350 models.',
    compatibility: ['Lexus', 'ES350', 'RX350', 'LX570'],
    image: 'https://images.unsplash.com/photo-1590362891991-f700445d3153?q=80&w=800&auto=format&fit=crop',
    rating: '4.9',
    featured: true,
    weight: '7.40',
    length: '34.00',
    width: '34.00',
    height: '8.00'
  },
  {
    brandName: 'Kia',
    sellerPrefer: 'Riyadh OEM Parts',
    name: 'Kia K5 / Sportage Genuine Timing Chain & Tensioner Kit (24321-2G111)',
    price: '780.00',
    category: 'Engine Parts',
    description: 'OEM Hyundai/Kia Mobis timing chain kit with hydraulic tensioner for Kia K5, Optima, and Sportage.',
    compatibility: ['Kia', 'K5', 'Sportage', 'Sorento'],
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=800&auto=format&fit=crop',
    rating: '4.9',
    featured: true,
    weight: '2.10',
    length: '28.00',
    width: '22.00',
    height: '10.00'
  },
  {
    brandName: 'Kia',
    sellerPrefer: 'Riyadh OEM Parts',
    name: 'Kia Telluride / Sorento Ceramic Front Brake Pads Set (58101-S9A00)',
    price: '340.00',
    category: 'Brakes & Suspension',
    description: 'Genuine Mobis low-dust ceramic brake pad set for Kia Telluride and Sorento.',
    compatibility: ['Kia', 'Telluride', 'Sorento'],
    image: 'https://images.unsplash.com/photo-1590362891991-f700445d3153?q=80&w=800&auto=format&fit=crop',
    rating: '4.8',
    featured: false,
    weight: '1.90',
    length: '20.00',
    width: '14.00',
    height: '8.00'
  },
  {
    brandName: 'BMW',
    sellerPrefer: 'Performance Motors',
    name: 'BMW M3 / 5 Series (G30) M-Performance Brembo Brake Caliper & Pad Kit',
    price: '3850.00',
    category: 'Brakes & Suspension',
    description: 'Genuine BMW M-Performance 4-piston front brake kit for BMW 3 Series, 5 Series, and M models.',
    compatibility: ['BMW', '3 Series', '5 Series', 'M3', 'X5'],
    image: 'https://images.unsplash.com/photo-1590362891991-f700445d3153?q=80&w=800&auto=format&fit=crop',
    rating: '5.0',
    featured: true,
    weight: '9.50',
    length: '42.00',
    width: '32.00',
    height: '18.00'
  },
  {
    brandName: 'BMW',
    sellerPrefer: 'Luxury Parts Co',
    name: 'BMW B58 TwinPower Turbo Charge Pipe & Intercooler Assembly',
    price: '2150.00',
    category: 'Engine Parts',
    description: 'High-flow aluminum charge pipe and intercooler upgrade for BMW B58 3.0L turbocharged engines.',
    compatibility: ['BMW', 'M340i', '540i', 'X5 xDrive40i'],
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=800&auto=format&fit=crop',
    rating: '4.9',
    featured: true,
    weight: '5.80',
    length: '55.00',
    width: '28.00',
    height: '22.00'
  },
  {
    brandName: 'Audi',
    sellerPrefer: 'Luxury Parts Co',
    name: 'Audi A6 / Q7 Matrix LED Headlamp Assembly Left (4K0-941-035)',
    price: '4200.00',
    category: 'Exterior & Body',
    description: 'Genuine Audi OEM HD Matrix LED headlight assembly with dynamic turn signal for Audi A6 and Q7.',
    compatibility: ['Audi', 'A6', 'Q7', 'Q8', 'A8'],
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop',
    rating: '5.0',
    featured: true,
    weight: '5.20',
    length: '62.00',
    width: '34.00',
    height: '28.00'
  },
  {
    brandName: 'Audi',
    sellerPrefer: 'Performance Motors',
    name: 'Audi RS / S-Line Sport Exhaust Downpipe & Resonator Kit (TFSI)',
    price: '3600.00',
    category: 'Exhaust Systems',
    description: 'Stainless steel performance exhaust system for Audi A4, A6, S5, and RS models.',
    compatibility: ['Audi', 'A4', 'A6', 'S5', 'RS5'],
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=800&auto=format&fit=crop',
    rating: '4.9',
    featured: false,
    weight: '8.40',
    length: '80.00',
    width: '30.00',
    height: '24.00'
  },
  {
    brandName: 'Nissan',
    sellerPrefer: 'Riyadh OEM Parts',
    name: 'Nissan Patrol Y62 V8 OEM Radiator & Cooling Fan Assembly (21460-1LA0A)',
    price: '1650.00',
    category: 'Engine Parts',
    description: 'Heavy-duty genuine Nissan radiator engineered for desert climate cooling on Patrol Y62.',
    compatibility: ['Nissan', 'Patrol', 'Altima', 'Maxima'],
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=800&auto=format&fit=crop',
    rating: '4.9',
    featured: true,
    weight: '7.80',
    length: '75.00',
    width: '55.00',
    height: '16.00'
  },
  {
    brandName: 'Honda',
    sellerPrefer: 'Riyadh OEM Parts',
    name: 'Honda Accord 1.5T / 2.0T Genuine VTEC Fuel Injector Set (16010-6A0-A01)',
    price: '1120.00',
    category: 'Engine Parts',
    description: 'Original Honda direct injection fuel injector set of 4 for Accord and CR-V.',
    compatibility: ['Honda', 'Accord', 'CR-V', 'Civic'],
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=800&auto=format&fit=crop',
    rating: '4.8',
    featured: false,
    weight: '0.95',
    length: '22.00',
    width: '16.00',
    height: '8.00'
  },
  {
    brandName: 'Hyundai',
    sellerPrefer: 'Riyadh OEM Parts',
    name: 'Hyundai Sonata / Elantra Genuine AC Compressor Unit (97701-L1000)',
    price: '1480.00',
    category: 'Engine Parts',
    description: 'Genuine Hanon/Mobis high-output air conditioning compressor for Hyundai Sonata and Tucson.',
    compatibility: ['Hyundai', 'Sonata', 'Elantra', 'Tucson', 'Palisade'],
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=800&auto=format&fit=crop',
    rating: '4.9',
    featured: true,
    weight: '6.20',
    length: '30.00',
    width: '25.00',
    height: '24.00'
  },
  {
    brandName: 'Ford',
    sellerPrefer: 'Performance Motors',
    name: 'Ford F-150 / Taurus Motorcraft Heavy-Duty Alternator (GL-8728-RM)',
    price: '1290.00',
    category: 'Engine Parts',
    description: 'Original Ford Motorcraft 220A alternator for F-150, Expedition, and Taurus.',
    compatibility: ['Ford', 'F-150', 'Expedition', 'Taurus', 'Mustang'],
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=800&auto=format&fit=crop',
    rating: '4.8',
    featured: false,
    weight: '6.80',
    length: '26.00',
    width: '22.00',
    height: '22.00'
  },
  {
    brandName: 'Chevrolet',
    sellerPrefer: 'Performance Motors',
    name: 'Chevrolet Tahoe / Silverado ACDelco Magnetic Ride Shock Absorber (84977478)',
    price: '1890.00',
    category: 'Brakes & Suspension',
    description: 'Genuine GM ACDelco MagneRide front suspension strut for Chevrolet Tahoe and Suburban.',
    compatibility: ['Chevrolet', 'Tahoe', 'Suburban', 'Silverado', 'Camaro'],
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=800&auto=format&fit=crop',
    rating: '4.9',
    featured: true,
    weight: '8.10',
    length: '68.00',
    width: '20.00',
    height: '20.00'
  },
  {
    brandName: 'Mazda',
    sellerPrefer: 'Riyadh OEM Parts',
    name: 'Mazda CX-9 / Mazda6 SkyActiv-G Ignition Coil & Spark Plug Kit (PE20-18-100A)',
    price: '690.00',
    category: 'Engine Parts',
    description: 'Genuine Mazda OEM SkyActiv ignition coil pack and iridium spark plug service kit.',
    compatibility: ['Mazda', 'CX-9', 'Mazda6', 'CX-5'],
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=800&auto=format&fit=crop',
    rating: '4.8',
    featured: false,
    weight: '1.40',
    length: '24.00',
    width: '18.00',
    height: '8.00'
  },
  {
    brandName: 'Mercedes',
    sellerPrefer: 'Luxury Parts Co',
    name: 'Mercedes-Benz S-Class / E-Class (W223/W213) Airmatic Air Suspension Strut',
    price: '4650.00',
    category: 'Brakes & Suspension',
    description: 'Original Mercedes-Benz Bilstein Airmatic front air suspension damper assembly.',
    compatibility: ['Mercedes', 'S-Class', 'E-Class', 'GLE', 'G-Class'],
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=800&auto=format&fit=crop',
    rating: '5.0',
    featured: true,
    weight: '9.20',
    length: '72.00',
    width: '22.00',
    height: '22.00'
  }
];

function sanitizeProductsList(list: any[]) {
  return list.map(p => ({
    ...p,
    image: resolvePartImage(p.image, p.category, p.name)
  }));
}

async function invalidateProductCaches(tenantId?: string | null) {
  try {
    if (tenantId) {
      await redis.del(`products:tenant:${tenantId}`);
      await redis.del(`products:v2:tenant:${tenantId}`);
      await redis.del(`products:v3:tenant:${tenantId}`);
    }
    await redis.del(`products:all`);
    await redis.del(`products:v2:all`);
    await redis.del(`products:v3:all`);
  } catch (e) {}
}

async function ensureBrandCatalogSeeded(existingProducts: any[]) {
  try {
    const existingText = existingProducts
      .map(p => `${p.brandName || ''} ${p.name || ''}`.toLowerCase())
      .join(' | ');

    const missingSeeds = BRAND_SEED_CATALOG.filter(
      seed => !existingText.includes(seed.name.toLowerCase())
    );

    if (missingSeeds.length === 0) return existingProducts;

    const allTenants = await db.select().from(tenants);
    if (allTenants.length === 0) return existingProducts;

    const defaultTenant = allTenants[0];
    const rowsToInsert = missingSeeds.map(seed => {
      const matchedTenant =
        allTenants.find(t => t.name === seed.sellerPrefer) || defaultTenant;
      return {
        tenantId: matchedTenant.id,
        name: seed.name,
        price: seed.price,
        category: seed.category,
        description: seed.description,
        compatibility: seed.compatibility,
        brandName: seed.brandName,
        image: seed.image,
        rating: seed.rating,
        featured: seed.featured,
        weight: seed.weight,
        length: seed.length,
        width: seed.width,
        height: seed.height,
        status: 'active'
      };
    });

    const inserted = await db.insert(products).values(rowsToInsert).returning();
    return [...existingProducts, ...inserted];
  } catch (seedErr) {
    console.warn('Auto-seed brand catalog skipped:', seedErr);
    return existingProducts;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get('tenantId');
  const productId = searchParams.get('id');

  try {
    if (productId) {
      const found = await db.select().from(products).where(eq(products.id, productId)).limit(1);
      if (found.length > 0) {
        const sanitized = sanitizeProductsList(found)[0];
        return NextResponse.json({ product: sanitized });
      }
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (!tenantId) {
      const cacheKey = `products:v3:all`;
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          const list = Array.isArray(parsed) ? parsed : (parsed.products || []);
          if (list.length >= 15) {
            return NextResponse.json({ products: sanitizeProductsList(list) });
          }
        }
      } catch (e) {}

      let allProducts = await db.select().from(products);
      allProducts = await ensureBrandCatalogSeeded(allProducts);
      const sanitizedAll = sanitizeProductsList(allProducts);

      try {
        await redis.setex(cacheKey, 300, JSON.stringify({ products: sanitizedAll }));
      } catch (e) {}

      return NextResponse.json({ products: sanitizedAll });
    }

    const allCurrent = await db.select().from(products);
    if (allCurrent.length < 15) {
      await ensureBrandCatalogSeeded(allCurrent);
    }

    const cacheKey = `products:v3:tenant:${tenantId}`;
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        const list = Array.isArray(parsed) ? parsed : (parsed.products || []);
        return NextResponse.json({ products: sanitizeProductsList(list) });
      }
    } catch (e) {}

    const tenantProducts = await db.select().from(products).where(eq(products.tenantId, tenantId as string));
    const sanitizedTenant = sanitizeProductsList(tenantProducts);

    try {
      await redis.setex(cacheKey, 300, JSON.stringify({ products: sanitizedTenant }));
    } catch (e) {}

    return NextResponse.json({ products: sanitizedTenant });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tenantId = request.headers.get('X-Tenant-ID') || body.tenantId;

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 });
    }

    let productStatus = body.status || 'active';
    let modReason = null;

    // AI COMPLIANCE GUARD
    if (genAI) {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `
        You are a compliance moderator for a Saudi auto parts marketplace.
        Evaluate this product submission for safety, legality, and platform compliance.
        Product Name: "${body.name}"
        Description: "${body.description || 'N/A'}"
        
        Rules:
        - No illegal modifications (e.g., 100% dark window tints, license plate hiders)
        - No weapons, drugs, or non-automotive items
        - No obvious spam or abusive language
        
        If the product is STRICTLY prohibited or unsafe, output a JSON object:
        {"compliant": false, "reason": "Specific reason why it is blocked"}
        
        If it is acceptable (even if vague or poorly described), output:
        {"compliant": true}
        
        Output ONLY the JSON object.
      `;

      try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          const compliance = JSON.parse(jsonMatch[0]);
          if (!compliance.compliant) {
             productStatus = 'pending_review';
             modReason = compliance.reason;
          }
        }
      } catch (aiError) {
        console.error("AI Compliance Check Failed (Proceeding anyway):", aiError);
      }
    }

    const newProduct = await db.insert(products).values({
      tenantId: tenantId,
      name: body.name,
      price: String(body.price || '0.00'),
      category: body.category || 'Engine Parts',
      image: resolvePartImage(body.image, body.category, body.name),
      description: body.description || null,
      compatibility: body.compatibility || null,
      brandName: body.brandName || null,
      tecdocArticleId: body.tecdocArticleId || body.oemPartNumber || null,
      weight: String(body.weight || '1.50'),
      length: String(body.length || '20.00'),
      width: String(body.width || '15.00'),
      height: String(body.height || '10.00'),
      status: productStatus,
      moderationReason: modReason,
      featured: Boolean(body.featured)
    }).returning();
    
    await invalidateProductCaches(tenantId);

    return NextResponse.json({ product: newProduct[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const productId = id || body.id;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const updateValues: any = { updatedAt: new Date() };
    if (body.name !== undefined) updateValues.name = body.name;
    if (body.price !== undefined) updateValues.price = String(body.price);
    if (body.category !== undefined) updateValues.category = body.category;
    if (body.brandName !== undefined) updateValues.brandName = body.brandName;
    if (body.description !== undefined) updateValues.description = body.description;
    if (body.status !== undefined) updateValues.status = body.status;
    if (body.featured !== undefined) updateValues.featured = Boolean(body.featured);
    if (body.weight !== undefined) updateValues.weight = String(body.weight);
    if (body.image !== undefined) updateValues.image = body.image;

    const updated = await db
      .update(products)
      .set(updateValues)
      .where(eq(products.id, productId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    await invalidateProductCaches(updated[0].tenantId);

    return NextResponse.json({ product: updated[0] });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const deleted = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning();

    if (deleted.length > 0) {
      await invalidateProductCaches(deleted[0].tenantId);
    } else {
      await invalidateProductCaches();
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
