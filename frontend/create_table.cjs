const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'app_user',
  password: process.env.DB_PASSWORD || 'app_password',
  database: process.env.DB_NAME || 'marketplace',
});

async function main() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS dispatches (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50) NOT NULL,
        pickup_location VARCHAR(255) NOT NULL,
        dropoff_location VARCHAR(255) NOT NULL,
        vehicle_details VARCHAR(255),
        status VARCHAR(50) NOT NULL DEFAULT 'pending',
        accepted_by UUID REFERENCES tenants(id),
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    console.log('Created dispatches table successfully');
  } catch (err) {
    console.error('Error creating table:', err);
  } finally {
    client.release();
    pool.end();
  }
}

main();
