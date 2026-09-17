import React, { useState, useMemo } from 'react';
import { Search, X, Layers, Filter } from 'lucide-react';
import { Wallpaper, Category } from '../types.ts';

interface ExploreTabProps {
  categories: Category[];
  wallpapers: Wallpaper[];
  onSelectWallpaper: (wallpaper: Wallpaper) => void;
}

export const ExploreTab: React.FC<ExploreTabProps> = ({
  categories,
  wallpapers,
  onSelectWallpaper,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredWallpapers = useMemo(() => {
    return wallpapers.filter((wp) => {
      const matchesCategory = selectedCategory ? wp.category_id === selectedCategory : true;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = q
        ? wp.title.toLowerCase().includes(q) ||
          wp.description.toLowerCase().includes(q) ||
          (wp.category_name && wp.category_name.toLowerCase().includes(q))
        : true;
      return matchesCategory && matchesQuery;
    });
  }, [wallpapers, selectedCategory, searchQuery]);

  return (
    <div className="px-4 pb-20 pt-2 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#171717]">
          Explore
        </h1>
        <p className="text-xs text-[#737373] mt-0.5">
          Curated by category & theme
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search wallpapers (cars, minimal, dark...)"
          className="w-full bg-neutral-100 hover:bg-neutral-200/60 focus:bg-white text-sm text-[#171717] placeholder:text-neutral-400 pl-10 pr-9 py-2.5 rounded-xl border border-transparent focus:border-[#6C63FF]/40 focus:ring-2 focus:ring-[#6C63FF]/20 transition outline-none"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Categories Horizontal Pills */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            Categories
          </span>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-xs text-[#6C63FF] font-medium hover:underline"
            >
              Reset filter
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar -mx-4 px-4">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition ${
              selectedCategory === null
                ? 'bg-[#171717] text-white shadow-xs'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            All Wallpapers
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition ${
                  isSelected
                    ? 'bg-[#6C63FF] text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                <span>{cat.name}</span>
                {cat.wallpaper_count !== undefined && (
                  <span
                    className={`text-[10px] px-1 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-neutral-200 text-neutral-600'
                    }`}
                  >
                    {cat.wallpaper_count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs font-medium text-neutral-500">
          Showing {filteredWallpapers.length} {filteredWallpapers.length === 1 ? 'wallpaper' : 'wallpapers'}
        </span>
      </div>

      {/* Empty State */}
      {filteredWallpapers.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-dashed border-neutral-200">
          <Layers className="w-8 h-8 mx-auto text-neutral-300 mb-2" />
          <p className="text-sm font-semibold text-neutral-800">No wallpapers found</p>
          <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto">
            Try searching for another keyword like &quot;nature&quot;, &quot;dark&quot;, or clearing active filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory(null);
            }}
            className="mt-4 px-4 py-1.5 rounded-lg bg-neutral-100 text-xs font-medium text-neutral-700 hover:bg-neutral-200 transition"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        /* Wallpapers 2-Column Grid */
        <div className="grid grid-cols-2 gap-3">
          {filteredWallpapers.map((wallpaper) => (
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

              <div className="absolute top-2.5 left-2.5">
                <span className="text-[10px] font-medium bg-black/40 backdrop-blur-md text-white/90 px-1.5 py-0.5 rounded-md">
                  {wallpaper.aspect_ratio || '9:16'}
                </span>
              </div>

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
      )}
    </div>
  );
};
