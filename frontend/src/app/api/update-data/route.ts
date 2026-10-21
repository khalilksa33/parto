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

    // 3. Clear old duplicate products for these 3 tenants
    for (const t of [tLuxury, tPerformance, tRiyadh].filter(Boolean)) {
      if (t) {
        await db.delete(products).where(eq(products.tenantId, t.id));
        try {
          await redis.del(`products:tenant:${t.id}`);
          await redis.del(`products:v2:tenant:${t.id}`);
          await redis.del(`products:v3:tenant:${t.id}`);
        } catch (e) {}
      }
    }
    try {
      await redis.del(`products:all`);
      await redis.del(`products:v2:all`);
      await redis.del(`products:v3:all`);
    } catch (e) {}

    // 4. Create fresh unique products across all 12 vehicle brands
    const newProducts = [];
    
    if (tRiyadh) {
      newProducts.push(
        {
          tenantId: tRiyadh.id,
          brandName: 'Toyota',
          name: 'Toyota Camry OEM Ceramic Brake Pads Kit (04465-33471)',
          price: '385.00',
          category: 'Brakes & Suspension',
          description: 'Genuine Toyota front ceramic brake pad set for Camry 2018-2024.',
          compatibility: ['Toyota', 'Camry', 'Avalon'],
          image: 'https://images.unsplash.com/photo-1590362891991-f700445d3153?q=80&w=800&auto=format&fit=crop',
          rating: '4.9',
          featured: true,
          weight: '2.20',
          length: '20.00',
          width: '15.00',
          height: '8.00'
        },
        {
          tenantId: tRiyadh.id,
          brandName: 'Lexus',
          name: 'Lexus LX570 / Land Cruiser OEM Oil Filter (90915-YZZD4)',
          price: '65.00',
          category: 'Engine Parts',
          description: 'Original Denso/Toyota/Lexus oil filter element with gasket O-ring.',
          compatibility: ['Lexus', 'Toyota', 'LX570', 'Land Cruiser'],
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
          brandName: 'Toyota',
          name: 'Toyota Hilux Front Shock Absorber Pair (48510-09W50)',
          price: '920.00',
          category: 'Brakes & Suspension',
          description: 'Heavy-duty genuine gas shock absorbers for Hilux 4x4.',
          compatibility: ['Toyota', 'Hilux', 'Fortuner'],
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
          brandName: 'Lexus',
          name: 'Denso Iridium TT Spark Plugs Set of 6 (FK20HR11)',
          price: '310.00',
          category: 'Engine Parts',
          description: 'Long-life twin-tip iridium spark plugs for V6 3.5L Toyota and Lexus engines.',
          compatibility: ['Lexus', 'Toyota', 'ES350', 'RX350', 'Camry'],
          image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=800&auto=format&fit=crop',
          rating: '4.9',
          featured: true,
          weight: '0.35',
          length: '15.00',
          width: '10.00',
          height: '5.00'
        },
        {
          tenantId: tRiyadh.id,
          brandName: 'Toyota',
          name: 'Toyota Prado OEM LED Headlight Assembly RH (81130-60P70)',
          price: '2450.00',
          category: 'Exterior & Body',
          description: 'Original right-hand side full LED projector headlamp unit.',
          compatibility: ['Toyota', 'Prado', 'Land Cruiser Prado'],
          image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop',
          rating: '4.7',
          featured: false,
          weight: '4.80',
          length: '65.00',
          width: '35.00',
          height: '30.00'
        },
        {
          tenantId: tRiyadh.id,
          brandName: 'Kia',
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
          tenantId: tRiyadh.id,
          brandName: 'Kia',
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
          tenantId: tRiyadh.id,
          brandName: 'Nissan',
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
          tenantId: tRiyadh.id,
          brandName: 'Honda',
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
          tenantId: tRiyadh.id,
          brandName: 'Hyundai',
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
          tenantId: tRiyadh.id,
          brandName: 'Mazda',
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
        }
      );
    }

    if (tLuxury) {
      newProducts.push(
        {
          tenantId: tLuxury.id,
          brandName: 'Lexus',
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
          tenantId: tLuxury.id,
          brandName: 'BMW',
          name: 'BMW M-Performance Carbon Fiber Steering Wheel & Dashboard Trim Kit',
          price: '4500.00',
          category: 'Interior Accessories',
          description: 'Genuine dry carbon fiber & Alcantara steering wheel trim kit for BMW 3/4/5 Series and M models.',
          compatibility: ['BMW', 'M3', 'M4', 'M5', '3 Series', '5 Series'],
          image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop',
          rating: '4.9',
          featured: true,
          weight: '3.20',
          length: '45.00',
          width: '45.00',
          height: '18.00'
        },
        {
          tenantId: tLuxury.id,
          brandName: 'Audi',
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
          tenantId: tLuxury.id,
          brandName: 'Mercedes',
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
        },
        {
          tenantId: tLuxury.id,
          brandName: 'Mercedes',
          name: 'Mercedes-Benz Designo Nappa Leather Custom Seat Covers Set',
          price: '3200.00',
          category: 'Interior Accessories',
          description: 'Hand-stitched Nappa leather interior seat cover set tailored for Mercedes-Benz, BMW, and Lexus sedans.',
          compatibility: ['Mercedes', 'BMW', 'Lexus', 'Audi'],
          image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop',
          rating: '4.8',
          featured: false,
          weight: '5.50',
          length: '60.00',
          width: '50.00',
          height: '25.00'
        }
      );
    }

    if (tPerformance) {
      newProducts.push(
        {
          tenantId: tPerformance.id,
          brandName: 'BMW',
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
          tenantId: tPerformance.id,
          brandName: 'Audi',
          name: 'Audi RS / S-Line Valvetronic Full Titanium Cat-Back Exhaust System',
          price: '9500.00',
          category: 'Exhaust Systems',
          description: 'Valvetronic titanium cat-back exhaust system for Audi RS5/RS6 and BMW M series.',
          compatibility: ['Audi', 'BMW', 'RS5', 'RS6', 'M3'],
          image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=800&auto=format&fit=crop',
          rating: '4.7',
          featured: true,
          weight: '11.50',
          length: '110.00',
          width: '40.00',
          height: '25.00'
        },
        {
          tenantId: tPerformance.id,
          brandName: 'Ford',
          name: 'Ford Mustang / F-150 Coyote Twin-Turbo V8 Forged Short Block Assembly',
          price: '28000.00',
          category: 'Engine Parts',
          description: 'Forged 5.0L V8 short block engine assembly rated for 1000+ HP for Ford Mustang GT and F-150.',
          compatibility: ['Ford', 'Mustang', 'F-150', 'Expedition'],
          image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=800&auto=format&fit=crop',
          rating: '5.0',
          featured: true,
          weight: '85.00',
          length: '75.00',
          width: '65.00',
          height: '60.00'
        },
        {
          tenantId: tPerformance.id,
          brandName: 'Chevrolet',
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
            brandName: p.brandName,
            description: p.description,
            compatibility: p.compatibility,
            price: Number(p.price),
            category: p.category,
            tenantId: p.tenantId,
            tenant_id: p.tenantId,
            image: p.image,
            rating: Number(p.rating || 4.8),
            featured: Boolean(p.featured),
            weight: Number(p.weight || 1.5),
            status: p.status
          }))
        );
      }
    } catch (meiliErr) {
      console.warn('Meilisearch sync skipped or failed:', meiliErr);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Seller accounts verified, old duplicates cleared, and fresh vehicle brand parts seeded.',
      primaryTestSeller: tRiyadh ? {
        name: tRiyadh.name,
        tenantId: tRiyadh.id,
        email: 'riyadh@parto.com',
        password: 'vendor123',
        partsCount: insertedProducts.filter(p => p.tenantId === tRiyadh.id).length
      } : null,
      accounts: vendorsToCreate.map(v => ({ email: v.email, password: 'vendor123', tenantId: v.tenantId }))
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
