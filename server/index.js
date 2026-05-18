import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { fileURLToPath } from 'url';
import { getDb, initDb } from './db.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'art_website_secret_2026_key';

// Initialize Cloudinary if credentials exist
const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log("Cloudinary Node SDK configured successfully.");
} else {
  console.log("Cloudinary credentials incomplete in .env. Falling back to local disk storage uploads.");
}

// Ensure local uploads directory exists
const uploadDir = path.resolve(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Disk Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Enable CORS and parse JSON (using 50MB payload limits for handling direct Base64 if needed)
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve local static uploaded files
app.use('/uploads', express.static(uploadDir));

// Initialize SQLite database
initDb().then(() => {
  console.log("SQLite database initialized and seeded.");
}).catch(err => {
  console.error("Failed to initialize database:", err);
});

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access token required.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired access token.' });
    }
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Administrator role required.' });
  }
  next();
};

/* ==================== API ENDPOINTS ==================== */

// 1. File Upload Endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    if (isCloudinaryConfigured) {
      // Upload local file to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'art_website'
      });
      // Delete temporary local file
      fs.unlinkSync(req.file.path);
      return res.json({ secure_url: result.secure_url });
    } else {
      // Fallback: serve from local public uploads folder
      const localUrl = `/uploads/${req.file.filename}`;
      return res.json({ secure_url: localUrl });
    }
  } catch (error) {
    console.error('Upload endpoint failed:', error);
    return res.status(500).json({ message: 'Image upload failed.', error: error.message });
  }
});

// 2. Authentication API
app.post('/api/auth/signup', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const db = await getDb();
    const userExists = await db.get("SELECT * FROM users WHERE username = ?", [username]);
    if (userExists) {
      return res.status(400).json({ message: 'Username already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await db.run(
      "INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'user')",
      [username, passwordHash]
    );

    const newUser = { id: result.lastID, username, role: 'user' };
    const token = jwt.sign(newUser, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({ user: newUser, token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Signup failed.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const db = await getDb();
    const user = await db.get("SELECT * FROM users WHERE username = ?", [username]);
    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password.' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid username or password.' });
    }

    const payload = { id: user.id, username: user.username, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      user: { id: user.id, username: user.username, role: user.role },
      token
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Login failed.' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  return res.json({ user: req.user });
});

// 3. Artworks API
app.get('/api/artworks', async (req, res) => {
  try {
    const db = await getDb();
    const list = await db.all("SELECT * FROM artworks ORDER BY id DESC");
    return res.json(list);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to fetch sketches.' });
  }
});

app.post('/api/artworks', authenticateToken, requireAdmin, async (req, res) => {
  const { title, type, category, price, image, description, status } = req.body;
  if (!title || !type || !category || !price || !image) {
    return res.status(400).json({ message: 'Required fields missing.' });
  }

  try {
    const db = await getDb();
    const result = await db.run(
      "INSERT INTO artworks (title, type, category, price, image, description, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [title, type, category, parseInt(price), image, description || '', status || 'Published']
    );
    const newArt = { id: result.lastID, title, type, category, price, image, description, status: status || 'Published' };
    return res.status(201).json(newArt);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to create artwork.' });
  }
});

app.put('/api/artworks/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { title, type, category, price, image, description, status } = req.body;

  try {
    const db = await getDb();
    const existing = await db.get("SELECT * FROM artworks WHERE id = ?", [id]);
    if (!existing) {
      return res.status(404).json({ message: 'Artwork not found.' });
    }

    await db.run(
      `UPDATE artworks 
       SET title = ?, type = ?, category = ?, price = ?, image = ?, description = ?, status = ? 
       WHERE id = ?`,
      [
        title !== undefined ? title : existing.title,
        type !== undefined ? type : existing.type,
        category !== undefined ? category : existing.category,
        price !== undefined ? parseInt(price) : existing.price,
        image !== undefined ? image : existing.image,
        description !== undefined ? description : existing.description,
        status !== undefined ? status : existing.status,
        id
      ]
    );

    const updated = await db.get("SELECT * FROM artworks WHERE id = ?", [id]);
    return res.json(updated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to update artwork.' });
  }
});

app.delete('/api/artworks/:id', authenticateToken, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getDb();
    const existing = await db.get("SELECT * FROM artworks WHERE id = ?", [id]);
    if (!existing) {
      return res.status(404).json({ message: 'Artwork not found.' });
    }
    await db.run("DELETE FROM artworks WHERE id = ?", [id]);
    return res.json({ message: 'Artwork deleted successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to delete artwork.' });
  }
});

// 4. Transformation API
app.get('/api/transformation', async (req, res) => {
  try {
    const db = await getDb();
    const trans = await db.get("SELECT * FROM transformation WHERE id = 1");
    return res.json(trans || {});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to fetch transformation settings.' });
  }
});

app.put('/api/transformation', authenticateToken, requireAdmin, async (req, res) => {
  const { before, after, title, subtitle } = req.body;
  try {
    const db = await getDb();
    await db.run(
      `UPDATE transformation 
       SET before = ?, after = ?, title = ?, subtitle = ? 
       WHERE id = 1`,
      [before || '', after || '', title || '', subtitle || '']
    );
    const updated = await db.get("SELECT * FROM transformation WHERE id = 1");
    return res.json(updated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to save transformation settings.' });
  }
});

// 5. Pricing Settings API
app.get('/api/pricing', async (req, res) => {
  try {
    const db = await getDb();
    const rows = await db.all("SELECT * FROM pricing");
    const pricingObj = {};
    rows.forEach(r => {
      pricingObj[r.key] = r.value;
    });
    return res.json(pricingObj);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to fetch pricing Settings.' });
  }
});

app.put('/api/pricing', authenticateToken, requireAdmin, async (req, res) => {
  const pricingData = req.body; // Key-value object
  try {
    const db = await getDb();
    for (const [key, value] of Object.entries(pricingData)) {
      await db.run(
        "INSERT INTO pricing (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        [key, String(value)]
      );
    }
    
    // Fetch and return the updated state
    const rows = await db.all("SELECT * FROM pricing");
    const pricingObj = {};
    rows.forEach(r => {
      pricingObj[r.key] = r.value;
    });
    return res.json(pricingObj);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to save pricing configurations.' });
  }
});

// 6. Client Requests / Orders API
app.get('/api/requests', authenticateToken, async (req, res) => {
  try {
    const db = await getDb();
    let requests;
    if (req.user.role === 'admin') {
      requests = await db.all("SELECT * FROM client_requests ORDER BY date DESC");
    } else {
      requests = await db.all("SELECT * FROM client_requests WHERE name = ? ORDER BY date DESC", [req.user.username]);
    }
    
    // Parse JSON stringified images list
    const parsedRequests = requests.map(r => ({
      ...r,
      images: JSON.parse(r.images || '[]')
    }));

    return res.json(parsedRequests);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to fetch client requests.' });
  }
});

app.post('/api/requests', authenticateToken, async (req, res) => {
  const { type, image, images, price, frame } = req.body;
  if (!type || !image || !images) {
    return res.status(400).json({ message: 'Commission type and images are required.' });
  }

  const id = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
  const date = new Date().toISOString().split('T')[0];

  try {
    const db = await getDb();
    await db.run(
      `INSERT INTO client_requests (id, name, type, image, images, price, frame, status, date) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending', ?)`,
      [
        id,
        req.user.username,
        type,
        image,
        JSON.stringify(images),
        price ? parseInt(price) : 0,
        frame || 'Without Frame',
        date
      ]
    );

    const created = await db.get("SELECT * FROM client_requests WHERE id = ?", [id]);
    created.images = JSON.parse(created.images || '[]');
    return res.status(201).json(created);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to log your custom commission request.' });
  }
});

app.put('/api/requests/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status, price, frame, customerApproval, adminNote } = req.body;

  try {
    const db = await getDb();
    const existing = await db.get("SELECT * FROM client_requests WHERE id = ?", [id]);
    if (!existing) {
      return res.status(404).json({ message: 'Request order not found.' });
    }

    // Role-based editing restriction
    if (req.user.role === 'admin') {
      await db.run(
        `UPDATE client_requests 
         SET status = ?, price = ?, frame = ?, customerApproval = ?, adminNote = ? 
         WHERE id = ?`,
        [
          status !== undefined ? status : existing.status,
          price !== undefined ? parseInt(price) : existing.price,
          frame !== undefined ? frame : existing.frame,
          customerApproval !== undefined ? customerApproval : existing.customerApproval,
          adminNote !== undefined ? adminNote : existing.adminNote,
          id
        ]
      );
    } else {
      // Customers can only approve or decline quotes
      if (existing.name !== req.user.username) {
        return res.status(403).json({ message: 'Unauthorized access to this order.' });
      }
      await db.run(
        `UPDATE client_requests 
         SET customerApproval = ? 
         WHERE id = ?`,
        [
          customerApproval !== undefined ? customerApproval : existing.customerApproval,
          id
        ]
      );
    }

    const updated = await db.get("SELECT * FROM client_requests WHERE id = ?", [id]);
    updated.images = JSON.parse(updated.images || '[]');
    return res.json(updated);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to update order details.' });
  }
});

/* ======================================================= */

// Start Server
app.listen(PORT, () => {
  console.log(`Backend Server is running live on http://localhost:${PORT}`);
});
