import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { users } from '@/lib/schema';
import { jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-super-secret-key-123456');

async function authenticate() {
  const token = (await cookies()).get('auth_token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function GET() {
  const auth = await authenticate();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const allUsers = await db.select({
      id: users.id,
      tenantId: users.tenantId,
      name: users.name,
      email: users.email,
      role: users.role,
      status: users.status,
      createdAt: users.createdAt,
    }).from(users);

    return NextResponse.json({ users: allUsers });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await authenticate();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { name, email, password, role, tenantId } = await request.json();
    
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await db.insert(users).values({
      name,
      email,
      passwordHash,
      role: role || 'vendor',
      tenantId: tenantId || null,
      status: 'active'
    }).returning({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role
    });

    return NextResponse.json({ success: true, user: newUser[0] }, { status: 201 });
  } catch (error: any) {
    if (error.code === '23505') { // unique constraint violation
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
