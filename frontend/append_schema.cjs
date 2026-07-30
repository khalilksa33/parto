const fs = require('fs');
const code = `
export const dispatches = pgTable('dispatches', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }),
  customerName: varchar('customer_name', { length: 255 }).notNull(),
  customerPhone: varchar('customer_phone', { length: 50 }).notNull(),
  pickupLocation: varchar('pickup_location', { length: 255 }).notNull(),
  dropoffLocation: varchar('dropoff_location', { length: 255 }).notNull(),
  vehicleDetails: varchar('vehicle_details', { length: 255 }),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  acceptedBy: uuid('accepted_by').references(() => tenants.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
`;
fs.appendFileSync('src/lib/schema.ts', code);
console.log('Appended to schema.ts');
