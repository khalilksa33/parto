const { Client } = require('pg');
const bcrypt = require('bcryptjs');

async function seedAdmin() {
  const client = new Client({
    connectionString: "postgres://partouser:supersecretpassword@localhost:5433/partodb"
  });

  try {
    await client.connect();
    
    // Hash password
    const hash = await bcrypt.hash('admin123', 10);
    
    // Check if admin exists
    const checkRes = await client.query("SELECT * FROM users WHERE email = 'admin@parto.com'");
    if (checkRes.rows.length === 0) {
      await client.query(
        "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)",
        ['Super Admin', 'admin@parto.com', hash, 'super_admin']
      );
      console.log("Super Admin seeded successfully: admin@parto.com / admin123");
    } else {
      console.log("Admin user already exists.");
    }
    
  } catch (err) {
    console.error("Error seeding admin:", err);
  } finally {
    await client.end();
  }
}

seedAdmin();
