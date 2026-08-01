import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-super-secret-key-123456');

export async function GET() {
  try {
    const token = (await cookies()).get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Verify token
    const { payload } = await jwtVerify(token, JWT_SECRET);

    return NextResponse.json({
      authenticated: true,
      user: {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        tenantId: payload.tenantId
      }
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
