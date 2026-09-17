import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { Wallpaper, Category, DailyWallpaper, DownloadRecord, AdminStats } from './src/types.ts';

const app = express();
const PORT = 3000;

// Ensure public uploads folder exists for saved image files
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded images statically
app.use('/uploads', express.static(uploadsDir));

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Initial Categories
let categories: Category[] = [
  {
    id: 'cat-nature',
    name: 'Nature',
    slug: 'nature',
    image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString(),
  },
  {
    id: 'cat-minimal',
    name: 'Minimal',
    slug: 'minimal',
    image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString(),
  },
  {
    id: 'cat-abstract',
    name: 'Abstract',
    slug: 'abstract',
    image_url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString(),
  },
  {
    id: 'cat-dark',
    name: 'Dark & AMOLED',
    slug: 'dark',
    image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString(),
  },
  {
    id: 'cat-space',
    name: 'Space',
    slug: 'space',
    image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString(),
  },
  {
    id: 'cat-cars',
    name: 'Cars',
    slug: 'cars',
    image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString(),
  },
  {
    id: 'cat-architecture',
    name: 'Architecture',
    slug: 'architecture',
    image_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString(),
  },
  {
    id: 'cat-gaming',
    name: 'Gaming',
    slug: 'gaming',
    image_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString(),
  },
];

// Initial Curated Wallpapers
let wallpapers: Wallpaper[] = [
  {
    id: 'wp-1',
    title: 'Minimal Sunset Horizon',
    description: 'Serene warm sunset over calm ocean waters, clean gradients and peaceful stillness.',
    category_id: 'cat-minimal',
    category_name: 'Minimal',
    original_url: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=2160&q=95',
    thumbnail_url: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=400&q=80',
    medium_url: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=1080&q=85',
    full_url: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=2160&q=95',
    width: 1440,
    height: 2560,
    aspect_ratio: '9:16',
    file_size: 4200150,
    is_featured: true,
    is_daily: true,
    publish_date: new Date().toISOString().split('T')[0],
    downloads: 1420,
    views: 8930,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'wp-2',
    title: 'Alpine Mist Valley',
    description: 'Crisp morning clouds rolling over jagged pine tree ridges in the high Alps.',
    category_id: 'cat-nature',
    category_name: 'Nature',
    original_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2160&q=95',
    thumbnail_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=400&q=80',
    medium_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1080&q=85',
    full_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2160&q=95',
    width: 1080,
    height: 1920,
    aspect_ratio: '9:16',
    file_size: 3845000,
    is_featured: true,
    is_daily: true,
    publish_date: new Date().toISOString().split('T')[0],
    downloads: 980,
    views: 5210,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'wp-3',
    title: 'Deep Obsidian Fluid',
    description: 'True black AMOLED luxury wallpaper with subtle chrome gold fluid swirls.',
    category_id: 'cat-dark',
    category_name: 'Dark & AMOLED',
    original_url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=2160&q=95',
    thumbnail_url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=400&q=80',
    medium_url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1080&q=85',
    full_url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=2160&q=95',
    width: 1080,
    height: 2400,
    aspect_ratio: '20:9',
    file_size: 2980000,
    is_featured: true,
    is_daily: true,
    publish_date: new Date().toISOString().split('T')[0],
    downloads: 2150,
    views: 12400,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'wp-4',
    title: 'Cosmic Nebula Silence',
    description: 'Interstellar dust clouds and distant starlight captured in ultraviolet violet hues.',
    category_id: 'cat-space',
    category_name: 'Space',
    original_url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=2160&q=95',
    thumbnail_url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=400&q=80',
    medium_url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1080&q=85',
    full_url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=2160&q=95',
    width: 1440,
    height: 2560,
    aspect_ratio: '9:16',
    file_size: 5120000,
    is_featured: false,
    is_daily: true,
    publish_date: new Date().toISOString().split('T')[0],
    downloads: 1650,
    views: 7890,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

let downloadsList: DownloadRecord[] = [
  {
    id: 'dl-1',
    wallpaper_id: 'wp-1',
    device_id: 'device-demo-local',
    downloaded_at: new Date(Date.now() - 3600000).toISOString(),
    local_file_path: '/storage/emulated/0/Pictures/Wallpapers/minimal_sunset_horizon.jpg',
  },
];

let favoritesList: { id: string; wallpaper_id: string; device_id: string; created_at: string }[] = [
  {
    id: 'fav-1',
    wallpaper_id: 'wp-1',
    device_id: 'device-demo-local',
    created_at: new Date().toISOString(),
  },
];

// Helper to calculate category counts
function populateCategoryCounts() {
  categories.forEach((cat) => {
    cat.wallpaper_count = wallpapers.filter((w) => w.category_id === cat.id).length;
  });
}
populateCategoryCounts();

// ==========================================
// REST API ROUTES
// ==========================================

// 1. GET /api/wallpapers
app.get('/api/wallpapers', (req: Request, res: Response) => {
  const category = req.query.category as string;
  let results = [...wallpapers];

  if (category) {
    results = results.filter((w) => w.category_id === category || w.category_name?.toLowerCase() === category.toLowerCase());
  }

  res.json({
    data: results,
    total: results.length,
    status: 'success',
  });
});

// 2. GET /api/wallpapers/daily
app.get('/api/wallpapers/daily', (_req: Request, res: Response) => {
  const daily = wallpapers.filter((w) => w.is_daily);
  res.json({
    data: daily.length > 0 ? daily : wallpapers.slice(0, 4),
    date: new Date().toISOString().split('T')[0],
    status: 'success',
  });
});

// 3. GET /api/wallpapers/featured
app.get('/api/wallpapers/featured', (_req: Request, res: Response) => {
  const featured = wallpapers.filter((w) => w.is_featured);
  res.json({
    data: featured.length > 0 ? featured : wallpapers.slice(0, 4),
    status: 'success',
  });
});

// 4. GET /api/wallpapers/:id
app.get('/api/wallpapers/:id', (req: Request, res: Response) => {
  const wp = wallpapers.find((w) => w.id === req.params.id);
  if (!wp) {
    return res.status(404).json({ error: 'Wallpaper not found' });
  }
  res.json({ data: wp, status: 'success' });
});

// 5. GET /api/categories
app.get('/api/categories', (_req: Request, res: Response) => {
  populateCategoryCounts();
  res.json({ data: categories, status: 'success' });
});

// 6. GET /api/categories/:slug/wallpapers
app.get('/api/categories/:slug/wallpapers', (req: Request, res: Response) => {
  const cat = categories.find((c) => c.slug === req.params.slug || c.id === req.params.slug);
  if (!cat) {
    return res.status(404).json({ error: 'Category not found' });
  }
  const filtered = wallpapers.filter((w) => w.category_id === cat.id);
  res.json({ category: cat, data: filtered, status: 'success' });
});

// 7. GET /api/search?q=
app.get('/api/search', (req: Request, res: Response) => {
  const query = ((req.query.q as string) || '').trim().toLowerCase();
  if (!query) {
    return res.json({ data: wallpapers, total: wallpapers.length, status: 'success' });
  }

  const results = wallpapers.filter(
    (w) =>
      w.title.toLowerCase().includes(query) ||
      w.description.toLowerCase().includes(query) ||
      (w.category_name && w.category_name.toLowerCase().includes(query))
  );

  res.json({ data: results, total: results.length, query, status: 'success' });
});

// 8. POST /api/wallpapers/:id/view
app.post('/api/wallpapers/:id/view', (req: Request, res: Response) => {
  const wp = wallpapers.find((w) => w.id === req.params.id);
  if (wp) {
    wp.views += 1;
    return res.json({ success: true, views: wp.views });
  }
  res.status(404).json({ error: 'Wallpaper not found' });
});

// 9. POST /api/wallpapers/:id/download
app.post('/api/wallpapers/:id/download', (req: Request, res: Response) => {
  const wp = wallpapers.find((w) => w.id === req.params.id);
  const device_id = req.body.device_id || 'device-local';

  if (wp) {
    wp.downloads += 1;
    const newRecord: DownloadRecord = {
      id: `dl-${Date.now()}`,
      wallpaper_id: wp.id,
      device_id,
      downloaded_at: new Date().toISOString(),
      local_file_path: `/storage/emulated/0/Pictures/Wallpapers/${wp.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.jpg`,
      wallpaper: wp,
    };
    downloadsList.unshift(newRecord);
    return res.json({
      success: true,
      downloads: wp.downloads,
      record: newRecord,
      message: 'Download registered successfully',
    });
  }
  res.status(404).json({ error: 'Wallpaper not found' });
});

// 10. GET & POST /api/favorites
app.get('/api/favorites', (req: Request, res: Response) => {
  const device_id = (req.query.device_id as string) || 'device-demo-local';
  const favWpIds = favoritesList.filter((f) => f.device_id === device_id).map((f) => f.wallpaper_id);
  const userFavorites = wallpapers.filter((w) => favWpIds.includes(w.id));
  res.json({ data: userFavorites, status: 'success' });
});

app.post('/api/favorites', (req: Request, res: Response) => {
  const { wallpaper_id, device_id = 'device-demo-local' } = req.body;
  if (!wallpaper_id) {
    return res.status(400).json({ error: 'wallpaper_id required' });
  }

  const existingIndex = favoritesList.findIndex((f) => f.wallpaper_id === wallpaper_id && f.device_id === device_id);

  if (existingIndex >= 0) {
    favoritesList.splice(existingIndex, 1);
    return res.json({ is_favorite: false, message: 'Removed from favorites' });
  } else {
    favoritesList.push({
      id: `fav-${Date.now()}`,
      wallpaper_id,
      device_id,
      created_at: new Date().toISOString(),
    });
    return res.json({ is_favorite: true, message: 'Added to favorites' });
  }
});

// 11. GET /api/downloads
app.get('/api/downloads', (_req: Request, res: Response) => {
  const populated = downloadsList.map((dl) => ({
    ...dl,
    wallpaper: wallpapers.find((w) => w.id === dl.wallpaper_id),
  }));
  res.json({ data: populated, status: 'success' });
});

// ==========================================
// ADMIN DASHBOARD API ROUTES
// ==========================================

// POST /api/admin/login
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (email === 'admin@dailywallpapers.app' && password === 'admin123') {
    return res.json({
      token: 'adm_token_' + Buffer.from(email).toString('base64'),
      user: { email, role: 'admin' },
      status: 'success',
    });
  }
  return res.status(401).json({ error: 'Invalid admin credentials' });
});

// GET /api/admin/stats
app.get('/api/admin/stats', (_req: Request, res: Response) => {
  const totalDownloads = wallpapers.reduce((sum, w) => sum + w.downloads, 0);
  const totalViews = wallpapers.reduce((sum, w) => sum + w.views, 0);

  const stats: AdminStats = {
    totalWallpapers: wallpapers.length,
    totalDownloads,
    downloadsToday: Math.floor(totalDownloads * 0.12) + 14,
    viewsToday: Math.floor(totalViews * 0.15) + 48,
    totalCategories: categories.length,
  };

  res.json({ data: stats, status: 'success' });
});

// POST /api/admin/wallpapers
app.post('/api/admin/wallpapers', (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      category_id,
      image_url,
      thumbnail_url,
      original_url,
      width = 1080,
      height = 1920,
      is_featured = false,
      is_daily = false,
      file_size = 3500000,
    } = req.body;

    let rawImage = (image_url || original_url || '').trim();
    if (!title || !category_id || !rawImage) {
      return res.status(400).json({ error: 'Title, category, and image URL are required' });
    }

    // Helper: Convert Base64 upload to actual file in public/uploads/
    const saveBase64ToFile = (base64Str: string, prefix: string) => {
      if (!base64Str || !base64Str.startsWith('data:image/')) {
        return base64Str;
      }
      const matches = base64Str.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
      if (!matches) return base64Str;

      const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
      const buffer = Buffer.from(matches[2], 'base64');
      const filename = `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}.${ext}`;
      fs.writeFileSync(path.join(uploadsDir, filename), buffer);

      const host = req.get('host') || 'daily-wallpapers.onrender.com';
      const proto = req.get('x-forwarded-proto') || 'https';
      return `${proto}://${host}/uploads/${filename}`;
    };

    const finalImage = saveBase64ToFile(rawImage, 'full');
    const finalThumb = thumbnail_url ? saveBase64ToFile(thumbnail_url, 'thumb') : finalImage;

    const category = categories.find((c) => c.id === category_id);

    // Compute aspect ratio description
    const ratioVal = Number(width) / Number(height);
    let aspect_ratio = 'Custom';
    if (Math.abs(ratioVal - 9 / 16) < 0.05) aspect_ratio = '9:16';
    else if (Math.abs(ratioVal - 16 / 9) < 0.05) aspect_ratio = '16:9';
    else if (Math.abs(ratioVal - 1) < 0.05) aspect_ratio = '1:1';
    else if (Math.abs(ratioVal - 4 / 5) < 0.05) aspect_ratio = '4:5';
    else if (Math.abs(ratioVal - 20 / 9) < 0.05) aspect_ratio = '20:9';

    const newWp: Wallpaper = {
      id: `wp-${Date.now()}`,
      title: title.trim(),
      description: (description || '').trim(),
      category_id,
      category_name: category ? category.name : 'General',
      original_url: finalImage,
      thumbnail_url: finalThumb,
      medium_url: finalImage,
      full_url: finalImage,
      width: Number(width) || 1080,
      height: Number(height) || 1920,
      aspect_ratio,
      file_size: Number(file_size) || 3500000,
      is_featured: Boolean(is_featured),
      is_daily: Boolean(is_daily),
      publish_date: new Date().toISOString().split('T')[0],
      downloads: 0,
      views: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    wallpapers.unshift(newWp);
    populateCategoryCounts();

    res.status(201).json({ data: newWp, message: 'Wallpaper published successfully' });
  } catch (err) {
    console.error('Error creating wallpaper:', err);
    res.status(500).json({ error: 'Failed to create wallpaper' });
  }
});

// PUT /api/admin/wallpapers/:id
app.put('/api/admin/wallpapers/:id', (req: Request, res: Response) => {
  const wp = wallpapers.find((w) => w.id === req.params.id);
  if (!wp) {
    return res.status(404).json({ error: 'Wallpaper not found' });
  }

  const { title, description, category_id, is_featured, is_daily } = req.body;
  if (title !== undefined) wp.title = title;
  if (description !== undefined) wp.description = description;
  if (category_id !== undefined) {
    wp.category_id = category_id;
    const cat = categories.find((c) => c.id === category_id);
    if (cat) wp.category_name = cat.name;
  }
  if (is_featured !== undefined) wp.is_featured = Boolean(is_featured);
  if (is_daily !== undefined) wp.is_daily = Boolean(is_daily);
  wp.updated_at = new Date().toISOString();

  populateCategoryCounts();
  res.json({ data: wp, message: 'Wallpaper updated successfully' });
});

// DELETE /api/admin/wallpapers/:id
app.delete('/api/admin/wallpapers/:id', (req: Request, res: Response) => {
  const idx = wallpapers.findIndex((w) => w.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Wallpaper not found' });
  }
  const deleted = wallpapers.splice(idx, 1)[0];
  populateCategoryCounts();
  res.json({ success: true, message: `Deleted ${deleted.title}` });
});

// POST /api/admin/categories
app.post('/api/admin/categories', (req: Request, res: Response) => {
  const { name, image_url } = req.body;
  if (!name || !image_url) {
    return res.status(400).json({ error: 'Name and image URL required' });
  }
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const newCat: Category = {
    id: `cat-${slug}-${Date.now()}`,
    name,
    slug,
    image_url,
    wallpaper_count: 0,
    created_at: new Date().toISOString(),
  };
  categories.push(newCat);
  res.status(201).json({ data: newCat, message: 'Category created successfully' });
});

// ==========================================
// VITE MIDDLEWARE & SERVER STARTUP
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Daily Wallpapers server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();