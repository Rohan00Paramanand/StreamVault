import React from 'react';
import { LayoutGrid, List, Heart, Sparkles } from 'lucide-react';
import { CATEGORIES } from '../data/initialVideos';

export default function CategoryFilter({
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  totalFavorites
}) {
  return (
    <div className="controls-bar">
      {/* Category Pills */}
      <div className="category-scroll">
        {CATEGORIES.map((category) => {
          const isActive = selectedCategory === category;
          return (
            <button
              key={category}
              type="button"
              className={`category-pill ${isActive ? 'active' : ''}`}
              onClick={() => onSelectCategory(category)}
            >
              {category === 'Favorites' && (
                <Heart size={13} fill={isActive ? 'currentColor' : 'none'} className="category-icon" />
              )}
              {category === 'Uploaded' && (
                <Sparkles size={13} className="category-icon" />
              )}
              <span>{category}</span>
              {category === 'Favorites' && totalFavorites > 0 && (
                <span className="pill-count">{totalFavorites}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sort and View toggles */}
      <div className="view-and-sort">
        <div className="sort-select-wrapper">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="sort-select"
            aria-label="Sort videos"
          >
            <option value="newest">Newest first</option>
            <option value="views">Most viewed</option>
            <option value="duration">Longest duration</option>
            <option value="title">Alphabetical (A–Z)</option>
          </select>
        </div>

        <div className="view-toggles">
          <button
            type="button"
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => onViewModeChange('grid')}
            title="Grid View"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            type="button"
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => onViewModeChange('list')}
            title="List View"
          >
            <List size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
