import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, 'database.sqlite');

let dbConnection = null;

/**
 * Returns the open SQLite database connection singleton.
 */
export async function getDb() {
  if (dbConnection) return dbConnection;

  dbConnection = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  return dbConnection;
}

/**
 * Initializes tables and seeds default data if tables are empty.
 */
export async function initDb() {
  const db = await getDb();

  // Create Users Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      role TEXT NOT NULL DEFAULT 'user',
      google_id TEXT UNIQUE
    )
  `);

  // Migrate existing database if google_id is not already present
  try {
    await db.exec("ALTER TABLE users ADD COLUMN google_id TEXT UNIQUE");
  } catch (e) {
    // Column already exists, safe to ignore
  }

  // Create Artworks Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS artworks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
  await db.exec(`
    CREATE TABLE IF NOT EXISTS transformation (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      before TEXT NOT NULL DEFAULT '',
      after TEXT NOT NULL DEFAULT '',
      title TEXT NOT NULL DEFAULT 'The Transformation',
      subtitle TEXT NOT NULL DEFAULT 'See how we turn your favorite memories into hand-drawn masterpieces.'
    )
  `);

  // Create Pricing/Settings Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS pricing (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  // Create Client Requests Table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS client_requests (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      image TEXT NOT NULL,
      images TEXT NOT NULL, -- Stored as stringified JSON array
      price INTEGER NOT NULL DEFAULT 0,
      frame TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending',
      customerApproval TEXT,
      adminNote TEXT,
      date TEXT NOT NULL
    )
  `);

  // Seed default admin if not exists
  const adminExists = await db.get("SELECT * FROM users WHERE username = ?", ["admin"]);
  if (!adminExists) {
    const defaultPasswordHash = await bcrypt.hash("admin123", 10);
    await db.run("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)", ["admin", defaultPasswordHash, "admin"]);
    console.log("Database seeded with default Admin user ('admin' / 'admin123')");
  }

  // Seed default artworks if empty
  const artworksCount = await db.get("SELECT COUNT(*) as count FROM artworks");
  if (artworksCount.count === 0) {
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
      await db.run(
        "INSERT INTO artworks (title, type, category, price, image, description, status) VALUES (?, ?, ?, ?, ?, ?, 'Published')",
        [art.title, art.type, art.category, art.price, art.image, art.description]
      );
    }
    console.log("Database seeded with default artworks.");
  }

  // Seed default transformation settings if empty
  const transCount = await db.get("SELECT COUNT(*) as count FROM transformation WHERE id = 1");
  if (transCount.count === 0) {
    await db.run(`
      INSERT INTO transformation (id, before, after, title, subtitle) 
      VALUES (1, '', '', 'The Transformation', 'See how we turn your favorite memories into hand-drawn masterpieces.')
    `);
    console.log("Database seeded with default transformation parameters.");
  }

  // Seed default pricing parameters if empty
  const pricingCount = await db.get("SELECT COUNT(*) as count FROM pricing");
  if (pricingCount.count === 0) {
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
      await db.run("INSERT INTO pricing (key, value) VALUES (?, ?)", [key, value]);
    }
    console.log("Database seeded with default base pricing.");
  }
}
