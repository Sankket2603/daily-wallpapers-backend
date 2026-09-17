export interface Wallpaper {
  id: string;
  title: string;
  description: string;
  category_id: string;
  category_name?: string;
  original_url: string;
  thumbnail_url: string;
  medium_url: string;
  full_url: string;
  width: number;
  height: number;
  aspect_ratio?: string;
  file_size: number; // in bytes
  is_featured: boolean;
  is_daily: boolean;
  publish_date: string; // YYYY-MM-DD
  downloads: number;
  views: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image_url: string;
  wallpaper_count?: number;
  created_at: string;
}

export interface DailyWallpaper {
  id: string;
  wallpaper_id: string;
  display_date: string;
  position: number;
  wallpaper?: Wallpaper;
  created_at: string;
}

export interface DownloadRecord {
  id: string;
  user_id?: string;
  wallpaper_id: string;
  device_id: string;
  downloaded_at: string;
  local_file_path?: string;
  wallpaper?: Wallpaper;
}

export interface FavoriteRecord {
  id: string;
  user_id?: string;
  wallpaper_id: string;
  created_at: string;
}

export interface AdminStats {
  totalWallpapers: number;
  totalDownloads: number;
  downloadsToday: number;
  viewsToday: number;
  totalCategories: number;
}

export type ScreenTab = 'home' | 'explore' | 'favorites' | 'settings';

export type ApplyTarget = 'home' | 'lock' | 'both';

export type CropMode = 'fill' | 'fit';

export interface UnlockedSession {
  wallpaperId: string;
  unlockedAt: number;
  expiresAt: number;
}
