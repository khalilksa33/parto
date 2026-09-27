import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, tenants } from '@/lib/schema';
import { getPartsForCarId } from '@/lib/tecdoc_service';
import { meiliClient } from '@/lib/meilisearch';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { carId } = body;

    if (!carId) {
      return NextResponse.json({ error: 'carId is required' }, { status: 400 });
    }

    // Find a master tenant to assign the generic auto parts to
    // In a real marketplace, you might have a dedicated "System Catalog" tenant
    const systemTenant = await db.select().from(tenants).limit(1);
    
    if (!systemTenant || systemTenant.length === 0) {
      return NextResponse.json({ error: 'No tenants available to assign products to' }, { status: 400 });
    }

    const tenantId = systemTenant[0].id;

    // Fetch articles from TecDoc
    const articles = await getPartsForCarId(carId);

    if (!articles || articles.length === 0) {
      return NextResponse.json({ message: 'No parts found for this carId' });
    }

    let syncedCount = 0;
    const documentsToIndex = [];

    // Map TecDoc articles to our Product schema
    for (const article of articles) {
      const articleName = article.directArticle?.articleName || article.articleName || 'Unknown Part';
      const articleId = article.directArticle?.articleId?.toString() || article.articleId?.toString();
      const brandName = article.directArticle?.brandName || article.brandName || 'OEM';
      const category = (article.genericArticles && article.genericArticles[0]?.genericArticleDescription) || 'General';

      if (!articleId) continue;

      const newProduct = {
        tenantId,
        name: `${brandName} ${articleName}`,
        price: '0.00', // Unpriced catalog item
        category: category,
        description: `Genuine ${brandName} part for selected vehicle.`,
        brandName: brandName,
        tecdocArticleId: articleId,
        status: 'active',
      };

      // Insert into PostgreSQL
      const [insertedProduct] = await db.insert(products)
        .values(newProduct)
        .returning();

      syncedCount++;

      // Prepare for MeiliSearch index
      documentsToIndex.push({
        id: insertedProduct.id,
        tenantId: insertedProduct.tenantId,
        name: insertedProduct.name,
        category: insertedProduct.category,
        brandName: insertedProduct.brandName,
        price: Number(insertedProduct.price),
        status: insertedProduct.status,
      });
    }

    // Sync to MeiliSearch
    if (documentsToIndex.length > 0) {
      try {
        const index = meiliClient.index('products');
        await index.addDocuments(documentsToIndex);
      } catch (meiliErr) {
        console.warn('Meilisearch sync failed, but DB succeeded:', meiliErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Automatically synced ${syncedCount} parts from TecDoc for carId ${carId}.`,
    });

  } catch (error: any) {
    console.error('Auto Catalog Sync Error:', error);
    return NextResponse.json({ error: 'Failed to auto-sync catalog' }, { status: 500 });
  }
}
