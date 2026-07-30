import { pgTable, uuid, varchar, numeric, jsonb, timestamp, boolean, text } from 'drizzle-orm/pg-core';

export const tenants = pgTable('tenants', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  subdomain: varchar('subdomain', { length: 100 }).notNull().unique(),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  businessType: varchar('business_type', { length: 100 }),
  ownerName: varchar('owner_name', { length: 255 }),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  settings: jsonb('settings').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  orderNumber: varchar('order_number', { length: 100 }).notNull(),
  customerId: uuid('customer_id').notNull(),
  totalAmount: numeric('total_amount', { precision: 15, scale: 4 }).notNull().default('0.0000'),
  currency: varchar('currency', { length: 3 }).notNull().default('USD'),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  metadata: jsonb('metadata').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  price: numeric('price', { precision: 15, scale: 4 }).notNull().default('0.0000'),
  category: varchar('category', { length: 100 }).notNull(),
  description: text('description'),
  compatibility: jsonb('compatibility'),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  moderationReason: text('moderation_reason'),
  image: varchar('image', { length: 100 }),
  rating: numeric('rating', { precision: 3, scale: 2 }).default('0.00'),
  featured: boolean('featured').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const dispatches = pgTable('dispatches', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }),
  serviceType: varchar('service_type', { length: 50 }).notNull().default('tow'),
  customerName: varchar('customer_name', { length: 255 }).notNull(),
  customerPhone: varchar('customer_phone', { length: 50 }).notNull(),
  pickupLocation: varchar('pickup_location', { length: 255 }).notNull(),
  dropoffLocation: varchar('dropoff_location', { length: 255 }).notNull(),
  vehicleDetails: varchar('vehicle_details', { length: 255 }),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  quote: varchar('quote', { length: 50 }),
  acceptedBy: uuid('accepted_by').references(() => tenants.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

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
