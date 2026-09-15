const { Client } = require('pg');
const fs = require('fs');

async function run() {
  const client = new Client({ connectionString: 'postgres://partouser:supersecretpassword@localhost:5433/partodb' });
  await client.connect();
  const sql = fs.readFileSync('drizzle/0000_common_sentinels.sql', 'utf8');
  await client.query(sql);
  console.log('Migration completed successfully.');
  await client.end();
}

run().catch(console.error);
