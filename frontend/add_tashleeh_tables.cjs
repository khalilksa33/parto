const fs = require('fs');
let content = fs.readFileSync('src/lib/schema.ts', 'utf8');
const newTables = `
export const part_requests = pgTable('part_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerName: varchar('customer_name', { length: 255 }).notNull(),
  customerPhone: varchar('customer_phone', { length: 50 }).notNull(),
  vehicleMake: varchar('vehicle_make', { length: 100 }).notNull(),
  vehicleModel: varchar('vehicle_model', { length: 100 }).notNull(),
  vehicleYear: varchar('vehicle_year', { length: 10 }).notNull(),
  partName: varchar('part_name', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const part_quotes = pgTable('part_quotes', {
  id: uuid('id').defaultRandom().primaryKey(),
  requestId: uuid('request_id').notNull().references(() => part_requests.id, { onDelete: 'cascade' }),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  price: numeric('price', { precision: 15, scale: 4 }).notNull(),
  condition: varchar('condition', { length: 50 }).notNull(),
  notes: varchar('notes', { length: 500 }),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
`;
content += newTables;
fs.writeFileSync('src/lib/schema.ts', content);
