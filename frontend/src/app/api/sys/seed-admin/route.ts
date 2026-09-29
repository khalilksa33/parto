import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const adminEmail = 'admin@parto.com';
    const adminPassword = 'SuperAdmin123!';

    const existing = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    if (existing.length > 0) {
      await db.update(users).set({ passwordHash: passwordHash, status: 'active', role: 'superadmin' }).where(eq(users.email, adminEmail));
      return NextResponse.json({ message: 'Admin password reset successfully', email: adminEmail, password: adminPassword });
    }

    await db.insert(users).values({
      email: adminEmail,
      name: 'Super Admin',
      passwordHash: passwordHash,
      role: 'superadmin',
      status: 'active'
    });

    return NextResponse.json({ message: 'Admin created successfully', email: adminEmail, password: adminPassword });
  } catch (error: any) {
    console.error('Failed to seed admin', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
