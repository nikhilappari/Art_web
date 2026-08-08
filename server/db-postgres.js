import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcryptjs';

let pool = null;

/**
 * Initialize PostgreSQL connection pool
 */
export function initPool() {
  if (pool) return pool;

  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Required for Supabase
    }
  });

  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
  });

  return pool;
}

/**
 * Get database connection
 */
export async function getDb() {
  const pool = initPool();
  return pool;
}

/**
 * Initialize database tables and seed data
 */
export async function initDb() {
  const pool = initPool();
  const client = await pool.connect();

  try {
    // Create Users Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT,
        role TEXT NOT NULL DEFAULT 'user',
        google_id TEXT UNIQUE
      )
    `);

    // Create Artworks Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS artworks (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        type TEXT NOT NULL,
        category TEXT NOT NULL,
        price INTEGER NOT NULL,
        image TEXT NOT NULL,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'Published'
      )
    `);

    // Create Transformation Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS transformation (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        before TEXT NOT NULL DEFAULT '',
        after TEXT NOT NULL DEFAULT '',
        title TEXT NOT NULL DEFAULT 'The Transformation',
        subtitle TEXT NOT NULL DEFAULT 'See how we turn your favorite memories into hand-drawn masterpieces.'
      )
    `);

    // Create Pricing/Settings Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS pricing (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `);

    // Create Client Requests Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS client_requests (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        image TEXT NOT NULL,
        images TEXT NOT NULL,
        price INTEGER NOT NULL DEFAULT 0,
        frame TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Pending',
        customerApproval TEXT,
        adminNote TEXT,
        date TEXT NOT NULL
      )
    `);

    // Seed default admin if not exists
    const adminResult = await client.query("SELECT * FROM users WHERE username = $1", ["admin"]);
    if (adminResult.rows.length === 0) {
      const defaultPasswordHash = await bcrypt.hash("admin123", 10);
      await client.query(
        "INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)",
        ["admin", defaultPasswordHash, "admin"]
      );
      console.log("Database seeded with default Admin user ('admin' / 'admin123')");
    }

    // Seed default artworks if empty
    const artworksResult = await client.query("SELECT COUNT(*) as count FROM artworks");
    if (artworksResult.rows[0].count == 0) {
      const initialArtworks = [
        {
          title: "Classic Monochrome",
          type: "Black & White",
          category: "Single Portrait",
          price: 1500,
          image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=1000",
          description: "Deep charcoal textures capturing every emotion."
        },
        {
          title: "Vibrant Soul",
          type: "Color",
          category: "Single Portrait",
          price: 2500,
          image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=1000",
          description: "Hyper-realistic color pencil work with soft blending."
        },
        {
          title: "The Eternal Bond",
          type: "Black & White",
          category: "Couple Portrait",
          price: 3500,
          image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=1000",
          description: "Detailed couple portrait in A3 size."
        },
        {
          title: "Radiant Smile",
          type: "Color",
          category: "Single Portrait",
          price: 2200,
          image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=1000",
          description: "Bright color palette for joyful memories."
        },
        {
          title: "Shadow & Light",
          type: "Black & White",
          category: "Single Portrait",
          price: 1800,
          image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=1000",
          description: "Dramatic lighting captured in pencil."
        },
        {
          title: "Sunset Glow",
          type: "Color",
          category: "Couple Portrait",
          price: 4500,
          image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&q=80&w=1000",
          description: "Warm tones and intricate detail for couples."
        }
      ];

      for (const art of initialArtworks) {
        await client.query(
          "INSERT INTO artworks (title, type, category, price, image, description, status) VALUES ($1, $2, $3, $4, $5, $6, 'Published')",
          [art.title, art.type, art.category, art.price, art.image, art.description]
        );
      }
      console.log("Database seeded with default artworks.");
    }

    // Seed default transformation settings if empty
    const transResult = await client.query("SELECT COUNT(*) as count FROM transformation WHERE id = 1");
    if (transResult.rows[0].count == 0) {
      await client.query(`
        INSERT INTO transformation (id, before, after, title, subtitle) 
        VALUES (1, '', '', 'The Transformation', 'See how we turn your favorite memories into hand-drawn masterpieces.')
      `);
      console.log("Database seeded with default transformation parameters.");
    }

    // Seed default pricing parameters if empty
    const pricingResult = await client.query("SELECT COUNT(*) as count FROM pricing");
    if (pricingResult.rows[0].count == 0) {
      const defaultPricing = {
        charcoalA4: '1500',
        charcoalA3: '2500',
        charcoalCouple: '3500',
        graphiteA4: '1500',
        graphiteA3: '2500',
        graphiteCouple: '3500',
        colorA4: '2200',
        colorA3: '3200',
        colorCouple: '4500',
        frameA4Normal: '300',
        frameA4Premium: '500',
        frameA3Normal: '500',
        frameA3Premium: '700',
        cloudinaryCloudName: '',
        cloudinaryUploadPreset: ''
      };

      for (const [key, value] of Object.entries(defaultPricing)) {
        await client.query("INSERT INTO pricing (key, value) VALUES ($1, $2)", [key, value]);
      }
      console.log("Database seeded with default base pricing.");
    }

    console.log("PostgreSQL Database initialized successfully!");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Execute a query
 */
export async function query(text, params) {
  const pool = initPool();
  return pool.query(text, params);
}

/**
 * Close database connection
 */
export async function closeDb() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
