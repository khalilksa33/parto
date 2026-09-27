import { NextResponse } from 'next/server';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db } from '@/lib/db';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    // Basic protection
    const url = new URL(request.url);
    if (url.searchParams.get('token') !== 'secret-migration-token-123') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const drizzleFolder = path.join(process.cwd(), 'drizzle');
    
    await migrate(db, { migrationsFolder: drizzleFolder });
    
    return NextResponse.json({ success: true, message: 'Database migrated successfully!' });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
  }
}
