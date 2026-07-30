import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products } from '@/lib/schema';
import { redis } from '@/lib/redis';
import { eq } from 'drizzle-orm';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get('tenantId');

  try {
    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId is required' }, { status: 400 });
    }

    // Check cache
    const cacheKey = `products:tenant:${tenantId}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }

    const tenantProducts = await db.select().from(products).where(eq(products.tenantId, tenantId as string));
    
    // Cache for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(tenantProducts));

    return NextResponse.json(tenantProducts);
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

    let productStatus = 'active';
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
      price: body.price,
      category: body.category,
      image: body.image,
      description: body.description,
      compatibility: body.compatibility,
      status: productStatus,
      moderationReason: modReason,
      featured: body.featured
    }).returning();
    
    // Invalidate cache
    await redis.del(`products:tenant:${tenantId}`);

    return NextResponse.json({ product: newProduct[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
