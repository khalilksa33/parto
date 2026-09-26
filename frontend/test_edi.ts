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
}

runTest().catch(console.error);
