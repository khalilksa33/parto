import { NextResponse } from 'next/server';
import { generateEDI850, OrderItem, OrderData } from '../../../../lib/edi_service';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { orderId, orderNumber, items } = payload;
    
    if (!orderId || !items || items.length === 0) {
      return NextResponse.json({ error: 'Invalid order payload' }, { status: 400 });
    }
    
    // In a real scenario, we'd verify the webhook signature here.
    // Group items by supplier (tenantId)
    const itemsBySupplier: Record<string, OrderItem[]> = {};
    
    for (const item of items) {
      const supplierId = item.tenantId || 'DEFAULT_SUPPLIER';
      if (!itemsBySupplier[supplierId]) {
        itemsBySupplier[supplierId] = [];
      }
      itemsBySupplier[supplierId].push({
        id: item.productId,
        name: item.name,
        price: Number(item.price),
        quantity: item.quantity,
        supplierId: supplierId
      });
    }
    
    const orderData: OrderData = {
      orderNumber: orderNumber || \ORD-\\,
      customerName: payload.customerName || 'Customer',
      date: new Date(),
      items: [], // Not strictly needed in parent object since we group
    };
    
    const generatedFiles = [];
    
    // Generate an EDI 850 for each supplier
    for (const supplierId in itemsBySupplier) {
      const supplierItems = itemsBySupplier[supplierId];
      const result = await generateEDI850(supplierId, orderData, supplierItems);
      generatedFiles.push(result.filepath);

      // --- NEW SFTP UPLOAD LOGIC ---
      // In a production system, you'd fetch these credentials from your database 
      // where the 'tenants' (suppliers) are stored, or from encrypted environment variables.
      // We are wrapping this in a try/catch so a failed upload doesn't break the whole order process.
      try {
        // Example logic: Only attempt upload if supplier has SFTP details configured in your DB
        // const supplierSftpConfig = await getSupplierSftpConfigFromDB(supplierId);
        
        // Mock Config for demonstration:
        const mockConfig = {
          host: process.env[\`SFTP_HOST_\${supplierId}\`] || '',
          port: 22,
          username: process.env[\`SFTP_USER_\${supplierId}\`] || '',
          password: process.env[\`SFTP_PASS_\${supplierId}\`] || '',
          remoteDir: '/inbound/edi/orders'
        };

        // If credentials exist, upload the file automatically!
        if (mockConfig.host && mockConfig.username) {
          const { uploadEdiToSupplier } = await import('../../../../lib/sftp_service');
          await uploadEdiToSupplier(result.filepath, mockConfig);
        }
      } catch (uploadError) {
        console.error(\`SFTP Upload failed for supplier \${supplierId}\`, uploadError);
        // The file remains in the local 'edi/outbox' folder so you can retry manually later.
      }
      // -----------------------------
    }
    
    return NextResponse.json({ 
      success: true, 
      message: \Generated \ EDI Purchase Orders\,
      files: generatedFiles
    });
    
  } catch (err: any) {
    console.error('EDI Webhook Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
