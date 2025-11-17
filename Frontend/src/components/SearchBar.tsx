import React, { useState } from 'react';
import { Search, SlidersHorizontal, Filter, X, ChevronDown } from 'lucide-react';

interface Genre {
  id: number;
  name: string;
  description?: string;
}

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  itemsPerPage: number;
  onItemsPerPageChange: (count: number) => void;
  totalResults: number;
  genres: Genre[];
  selectedGenres: number[];
  onGenresChange: (genreIds: number[]) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  itemsPerPage,
  onItemsPerPageChange,
  totalResults,
  genres,
  selectedGenres,
  onGenresChange,
}) => {
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);

  return (
    <div className="bg-white/70 backdrop-blur-2xl rounded-xl shadow-lg border border-purple-200/30 p-3 sm:p-4 mb-4 space-y-3">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by title, author, #number..."
          className="block w-full pl-9 sm:pl-10 pr-10 py-2 sm:py-2.5 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all text-sm placeholder-gray-400 bg-white/80"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Filters Row - Horizontal Compact Layout */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-1.5 text-purple-700 bg-purple-50 px-2.5 py-1.5 rounded-lg">
          <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="font-semibold">
            {totalResults} {totalResults === 1 ? 'story' : 'stories'}
          </span>
        </div>

        <div className="h-4 w-px bg-purple-200"></div>

        {/* Sort By Dropdown */}
        <select
          id="sortBy"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="px-3 py-1.5 border border-purple-200 rounded-lg focus:ring-1 focus:ring-purple-400 transition-all text-xs sm:text-sm bg-white/80 cursor-pointer font-medium hover:border-purple-300"
        >
          <option value="newest">🆕 Newest</option>
          <option value="oldest">📅 Oldest</option>
          <option value="mostLiked">❤️ Most Liked</option>
          <option value="mostViewed">👁️ Most Viewed</option>
        </select>

        {/* Items Per Page Dropdown */}
        <select
          id="itemsPerPage"
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="px-3 py-1.5 border border-purple-200 rounded-lg focus:ring-1 focus:ring-purple-400 transition-all text-xs sm:text-sm bg-white/80 cursor-pointer font-medium hover:border-purple-300"
        >
          <option value={12}>12 cards/page</option>
          <option value={24}>24 cards/page</option>
          <option value={36}>36 cards/page</option>
          <option value={48}>48 cards/page</option>
        </select>

        {/* Genre Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowGenreDropdown(!showGenreDropdown)}
            className={`px-3 py-1.5 border rounded-lg focus:ring-1 transition-all text-xs sm:text-sm font-medium flex items-center gap-1.5 ${
              selectedGenres.length > 0
                ? 'bg-purple-600 text-white border-purple-700 shadow-md'
                : 'bg-white/80 text-gray-700 border-purple-200 hover:border-purple-300'
            }`}
          >
            <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Genre</span>
            {selectedGenres.length > 0 && (
              <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded-full text-xs font-bold">
                {selectedGenres.length}
              </span>
            )}
            <ChevronDown className="w-3 h-3" />
          </button>

          {showGenreDropdown && (
            <div className="absolute top-full left-0 mt-2 bg-white border-2 border-purple-200 rounded-lg shadow-2xl z-50 w-64 max-h-80 overflow-y-auto">
              <div className="p-3 border-b border-purple-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-purple-900">Filter by Genre</span>
                {selectedGenres.length > 0 && (
                  <button
                    onClick={() => onGenresChange([])}
                    className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Clear
                  </button>
                )}
              </div>
              <div className="p-2 space-y-1">
                {genres.map((genre) => {
                  const isSelected = selectedGenres.includes(genre.id);
                  return (
                    <label
                      key={genre.id}
                      className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-purple-100 text-purple-900'
                          : 'hover:bg-purple-50 text-gray-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const newGenres = e.target.checked
                            ? [...selectedGenres, genre.id]
                            : selectedGenres.filter(id => id !== genre.id);
                          onGenresChange(newGenres);
                        }}
                        className="w-4 h-4 rounded border-purple-300 text-purple-600 focus:ring-2 focus:ring-purple-500"
                      />
                      <span className="text-sm font-medium">{genre.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Active Search Badge - Inline */}
        {searchQuery && (
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-xs">Search:</span>
            <span className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-2.5 py-1 rounded-full font-semibold text-xs border border-purple-200">
              "{searchQuery}"
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
