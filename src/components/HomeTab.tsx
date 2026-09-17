import React from 'react';
import { Sparkles, Calendar, Heart, ArrowDownToLine } from 'lucide-react';
import { Wallpaper } from '../types.ts';

interface HomeTabProps {
  wallpapers: Wallpaper[];
  dailyWallpapers: Wallpaper[];
  featuredWallpapers: Wallpaper[];
  favorites: string[];
  onSelectWallpaper: (wallpaper: Wallpaper) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  wallpapers,
  dailyWallpapers,
  featuredWallpapers,
  favorites,
  onSelectWallpaper,
  onToggleFavorite,
}) => {
  const today = new Date();
  const dateFormatted = today.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
  }).toUpperCase();

  return (
    <div className="px-4 pb-20 pt-1 space-y-6">
      {/* App Header */}
      <div className="pt-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#171717]">
          Daily Wallpapers
        </h1>
        <p className="text-xs text-[#737373] mt-0.5">
          A new wallpaper every day.
        </p>
      </div>

      {/* Today's Wallpapers Section */}
      <section>
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[#6C63FF] bg-[#6C63FF]/10 px-2 py-0.5 rounded-full">
              <Calendar className="w-3 h-3" />
              TODAY • {dateFormatted}
            </span>
          </div>
          <span className="text-xs font-medium text-[#737373]">
            {dailyWallpapers.length} Wallpapers
          </span>
        </div>

        <h2 className="text-lg font-semibold text-[#171717] mb-3">
          Today's Wallpapers
        </h2>

        {/* 2-Column Adaptive Grid */}
        <div className="grid grid-cols-2 gap-3">
          {dailyWallpapers.map((wallpaper) => {
            const isFav = favorites.includes(wallpaper.id);
            return (
              <div
                key={wallpaper.id}
                onClick={() => onSelectWallpaper(wallpaper)}
                className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-neutral-100 shadow-xs hover:shadow-md transition cursor-pointer"
              >
                <img
                  src={wallpaper.thumbnail_url || wallpaper.medium_url}
                  alt={wallpaper.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />

                {/* Subtle gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                {/* Aspect Ratio / Category Badge */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
                  <span className="text-[10px] font-medium bg-black/40 backdrop-blur-md text-white/90 px-1.5 py-0.5 rounded-md">
                    {wallpaper.aspect_ratio || '9:16'}
                  </span>
                </div>

                {/* Favorite Heart Quick Toggle */}
                <button
                  type="button"
                  onClick={(e) => onToggleFavorite(wallpaper.id, e)}
                  aria-label="Favorite"
                  className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/90 hover:text-white transition"
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      isFav ? 'fill-rose-500 text-rose-500' : 'text-white'
                    }`}
                  />
                </button>

                {/* Bottom title & category */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white pointer-events-none">
                  <p className="text-xs font-semibold leading-tight line-clamp-1">
                    {wallpaper.title}
                  </p>
                  <div className="flex items-center justify-between mt-0.5 text-[10px] text-white/80">
                    <span>{wallpaper.category_name}</span>
                    <span className="flex items-center gap-0.5">
                      <ArrowDownToLine className="w-2.5 h-2.5" />
                      {wallpaper.downloads}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Section */}
      {featuredWallpapers.length > 0 && (
        <section className="pt-2">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Sparkles className="w-4 h-4 text-[#6C63FF]" />
            <h2 className="text-base font-semibold text-[#171717]">
              Featured Collection
            </h2>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory -mx-4 px-4">
            {featuredWallpapers.map((wallpaper) => (
              <div
                key={wallpaper.id}
                onClick={() => onSelectWallpaper(wallpaper)}
                className="snap-start shrink-0 w-44 aspect-[9/16] rounded-2xl overflow-hidden bg-neutral-100 shadow-xs relative cursor-pointer group"
              >
                <img
                  src={wallpaper.thumbnail_url || wallpaper.medium_url}
                  alt={wallpaper.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white pointer-events-none">
                  <p className="text-xs font-semibold line-clamp-1">{wallpaper.title}</p>
                  <p className="text-[10px] text-white/80">{wallpaper.category_name}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All Recent Discovery */}
      <section className="pt-1">
        <h2 className="text-base font-semibold text-[#171717] mb-3">
          Discover All
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {wallpapers.map((wallpaper) => (
            <div
              key={wallpaper.id}
              onClick={() => onSelectWallpaper(wallpaper)}
              className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-neutral-100 shadow-xs hover:shadow-md transition cursor-pointer"
            >
              <img
                src={wallpaper.thumbnail_url || wallpaper.medium_url}
                alt={wallpaper.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />
              <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white pointer-events-none">
                <p className="text-xs font-semibold leading-tight line-clamp-1">
                  {wallpaper.title}
                </p>
                <p className="text-[10px] text-white/80 mt-0.5">
                  {wallpaper.category_name}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
