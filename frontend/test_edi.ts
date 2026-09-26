import { generateEDI850, OrderData, OrderItem } from './src/lib/edi_service';

async function runTest() {
  const supplierId = 'SUPP_999123';
  
  const orderData: OrderData = {
    orderNumber: 'ORD-TEST-555',
    customerName: 'Test Buyer',
    date: new Date(),
    items: [],
  };
  
  const items: OrderItem[] = [
    {
      id: 'PART_A_001',
      name: 'Brake Pad Set',
      price: 45.99,
      quantity: 2,
      supplierId: supplierId
    },
    {
      id: 'PART_B_002',
      name: 'Oil Filter',
      price: 12.50,
      quantity: 5,
      supplierId: supplierId
    }
  ];
  
  console.log('Generating EDI 850 for supplier:', supplierId);
  const result = await generateEDI850(supplierId, orderData, items);
  
  console.log('Success! EDI file saved to:');
  console.log(result.filepath);
  
  // --- TEST SFTP UPLOAD ---
  console.log('\n--- Testing SFTP Upload ---');
  // Load environment variables for the test script
  require('dotenv').config({ path: '.env.local' });
  
  const mockConfig = {
    host: process.env[\`SFTP_HOST_\${supplierId}\`] || '',
    port: 22,
    username: process.env[\`SFTP_USER_\${supplierId}\`] || '',
    password: process.env[\`SFTP_PASS_\${supplierId}\`] || '',
    remoteDir: '/' // SFTPCloud root directory
  };

  if (!mockConfig.host || !mockConfig.username) {
    console.log('⚠️ No SFTP credentials found in .env.local for', supplierId);
    console.log('Please add SFTP_HOST_SUPP_999123, SFTP_USER_SUPP_999123, and SFTP_PASS_SUPP_999123 to your .env.local file.');
  } else {
    try {
      const { uploadEdiToSupplier } = await import('./src/lib/sftp_service');
      await uploadEdiToSupplier(result.filepath, mockConfig);
      console.log('✅ TEST PASSED: File successfully uploaded to SFTPCloud!');
    } catch (err: any) {
      console.error('❌ TEST FAILED: Could not upload to SFTPCloud.');
      console.error(err.message);
    }
  }
}

runTest().catch(console.error);
