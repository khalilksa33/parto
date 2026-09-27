import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, tenants } from '@/lib/schema';
import { getPartsForCarId } from '@/lib/tecdoc_service';
import { meiliClient } from '@/lib/meilisearch';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { carId, tenantId } = body;

    if (!carId || !tenantId) {
      return NextResponse.json({ error: 'carId and tenantId are required' }, { status: 400 });
    }

    // Fetch articles from TecDoc
    const articles = await getPartsForCarId(carId);

    if (!articles || articles.length === 0) {
      return NextResponse.json({ message: 'No parts found for this carId' });
    }

    let syncedCount = 0;
    const documentsToIndex = [];

    // Map TecDoc articles to our Product schema
    for (const article of articles) {
      // TecDoc typically returns articleId, articleName, brandName, genericArticles (categories)
      const articleName = article.directArticle?.articleName || article.articleName || 'Unknown Part';
      const articleId = article.directArticle?.articleId?.toString() || article.articleId?.toString();
      const brandName = article.directArticle?.brandName || article.brandName || 'OEM';
      const category = (article.genericArticles && article.genericArticles[0]?.genericArticleDescription) || 'General';

      if (!articleId) continue;

      const newProduct = {
        tenantId,
        name: `${brandName} ${articleName}`,
        price: '0.00', // Pricing usually needs to be set manually or via ERP
        category: category,
        description: `Genuine ${brandName} part for selected vehicle.`,
        brandName: brandName,
        tecdocArticleId: articleId,
        status: 'active',
      };

      // Insert into PostgreSQL (in production, use ON CONFLICT DO UPDATE to upsert)
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
      const index = meiliClient.index('products');
      await index.addDocuments(documentsToIndex);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${syncedCount} parts from TecDoc to database and Meilisearch.`,
    });

  } catch (error: any) {
    console.error('Catalog Sync Error:', error);
    return NextResponse.json({ error: 'Failed to sync catalog' }, { status: 500 });
  }
}
