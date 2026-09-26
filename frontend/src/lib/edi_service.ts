// @ts-nocheck
import { X12Interchange, X12FunctionalGroup, X12TransactionSet, X12Segment } from 'node-x12';
import * as fs from 'fs';
import * as path from 'path';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  supplierId: string;
}

export interface OrderData {
  orderNumber: string;
  customerName: string;
  date: Date;
  items: OrderItem[];
}

/**
 * Generates an EDI 850 (Purchase Order) for a specific supplier
 * based on the provided items.
 */
export async function generateEDI850(supplierId: string, orderData: OrderData, supplierItems: OrderItem[]) {
  // Create the interchange envelope
  const interchange = new X12Interchange({
    segmentTerminator: '~',
    elementDelimiter: '*',
  });
  
  interchange.setHeaderElements(['00', '', '00', '', 'ZZ', 'PARTO          ', 'ZZ', supplierId.substring(0, 15).padEnd(15, ' '), '231015', '1430', 'U', '00401', '000000001', '0', 'T', '>']);
  
  // Create functional group
  const group = new X12FunctionalGroup();
  group.setHeaderElements(['PO', 'PARTO', supplierId.substring(0, 15), '20231015', '1430', '1', 'X', '004010']);
  
  // Create transaction set (850 Purchase Order)
  const transaction = new X12TransactionSet();
  transaction.setHeaderElements(['850', '0001']);
  
  // BEG - Beginning Segment for Purchase Order
  const beg = new X12Segment('BEG');
  beg.setElements(['00', 'NE', orderData.orderNumber, '', orderData.date.toISOString().split('T')[0].replace(/-/g, '')]);
  transaction.segments.push(beg);

  // Line items (PO1)
  let lineCount = 1;
  let totalAmount = 0;

  for (const item of supplierItems) {
    const po1 = new X12Segment('PO1');
    po1.setElements([
      lineCount.toString(),
      item.quantity.toString(),
      'EA', // Each
      item.price.toFixed(2),
      'PE', // Price per each
      'VN', // Vendor Item Number
      item.id,
    ]);
    transaction.segments.push(po1);
    
    totalAmount += (item.price * item.quantity);
    lineCount++;
  }
  
  // CTT - Transaction Totals
  const ctt = new X12Segment('CTT');
  ctt.setElements([(lineCount - 1).toString()]);
  transaction.segments.push(ctt);

  // Close transaction, group, interchange
  group.transactions.push(transaction);
  interchange.functionalGroups.push(group);
  
  const ediString = interchange.toString();
  
  // In a real app, this would be sent via SFTP. We save it to a local 'outbox'.
  const outboxDir = path.join(process.cwd(), 'edi', 'outbox');
  if (!fs.existsSync(outboxDir)) {
    fs.mkdirSync(outboxDir, { recursive: true });
  }
  
  const filename = `PO_${orderData.orderNumber}_${supplierId}_${Date.now()}.edi`;
  const filepath = path.join(outboxDir, filename);
  
  fs.writeFileSync(filepath, ediString);
  
  return { filepath, ediString };
}
