import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    if (url.searchParams.get('token') !== 'secret-migration-token-123') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Create vin_cache if missing
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "vin_cache" (
        "vin" varchar(20) PRIMARY KEY NOT NULL,
        "make" varchar(100),
        "model" varchar(100),
        "year" varchar(10),
        "engine_details" jsonb,
        "raw_data" jsonb,
        "tecdoc_car_id" varchar(50),
        "created_at" timestamp with time zone DEFAULT now() NOT NULL
      );
    `);

    // 2. Add columns to products and tenants safely (Postgres 9.6+ supports IF NOT EXISTS for columns)
    await db.execute(sql`
      ALTER TABLE "tenants" ADD COLUMN IF NOT EXISTS "warehouse_address" jsonb;
      
      ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "weight" numeric(10, 2) DEFAULT '0.00';
      ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "length" numeric(10, 2) DEFAULT '0.00';
      ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "width" numeric(10, 2) DEFAULT '0.00';
      ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "height" numeric(10, 2) DEFAULT '0.00';
      ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "brand_name" varchar(100);
      ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "tecdoc_article_id" varchar(100);
    `);
    
    return NextResponse.json({ success: true, message: 'Database schema synchronized successfully via raw SQL!' });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
