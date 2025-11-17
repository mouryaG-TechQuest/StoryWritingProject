import { useState, useEffect } from 'react';
import { User, Clock, ChevronLeft, ChevronRight, Film } from 'lucide-react';

interface Character {
  id?: string;
  name: string;
  description: string;
  role: string;
  actorName?: string;
  imageUrls?: string[];
}

interface Genre {
  id: number;
  name: string;
  description?: string;
}

interface Story {
  id: string;
  title: string;
  content: string;
  description?: string;
  imageUrls?: string[];
  authorUsername: string;
  characters: Character[];
  createdAt: string;
  genres?: Genre[];
  storyNumber?: string;
  totalWatchTime?: number;
  writers?: string;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
}

interface StoryCardTooltipProps {
  story: Story;
  visible: boolean;
  position: { x: number; y: number };
}

const StoryCardTooltip = ({ story, visible, position }: StoryCardTooltipProps) => {
  const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reset indices when story changes
  useEffect(() => {
    setCurrentCharacterIndex(0);
    setCurrentImageIndex(0);
  }, [story.id]);

  if (!visible) return null;

  // Filter characters with photos
  const charactersWithPhotos = story.characters?.filter(c => c.imageUrls && c.imageUrls.length > 0) || [];
  const currentCharacter = charactersWithPhotos[currentCharacterIndex];
  const currentCharacterImages = currentCharacter?.imageUrls || [];

  const nextCharacter = () => {
    setCurrentCharacterIndex((prev) => (prev + 1) % charactersWithPhotos.length);
    setCurrentImageIndex(0);
  };

  const prevCharacter = () => {
    setCurrentCharacterIndex((prev) => (prev - 1 + charactersWithPhotos.length) % charactersWithPhotos.length);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % currentCharacterImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + currentCharacterImages.length) % currentCharacterImages.length);
  };

  // Format watch time (seconds to hours:minutes)
  const formatWatchTime = (seconds?: number) => {
    if (!seconds || seconds === 0) return '0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  // Calculate tooltip position to stay within viewport
  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    left: Math.min(position.x, window.innerWidth - 420),
    top: Math.min(position.y, window.innerHeight - 500),
    zIndex: 9999,
    maxWidth: '400px',
    width: '100%',
  };

  return (
    <div
      style={tooltipStyle}
      className="bg-white rounded-xl shadow-2xl border-2 border-purple-200 overflow-hidden animate-fade-in"
      onClick={(e) => e.stopPropagation()} // Prevent clicks from propagating
    >
      {/* Header with Story Number and Title */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-3">
        <div className="flex items-center justify-between mb-1">
          {story.storyNumber && (
            <span className="text-white/90 text-xs font-mono bg-white/20 px-2 py-0.5 rounded">
              #{story.storyNumber}
            </span>
          )}
          <div className="flex items-center space-x-2 text-white/90 text-xs">
            <Clock className="w-3 h-3" />
            <span>{formatWatchTime(story.totalWatchTime)}</span>
          </div>
        </div>
        <h3 className="text-white font-bold text-sm line-clamp-2">{story.title}</h3>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
        {/* Description */}
        {story.description && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Description</p>
            <p className="text-xs text-gray-700 leading-relaxed">{story.description}</p>
          </div>
        )}

        {/* Writers */}
        {story.writers && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Writers</p>
            <p className="text-xs text-gray-700">{story.writers}</p>
          </div>
        )}

        {/* Genres */}
        {story.genres && story.genres.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Genres</p>
            <div className="flex flex-wrap gap-1">
              {story.genres.map((genre) => (
                <span
                  key={genre.id}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Cast with Character and Actor Names */}
        {story.characters && story.characters.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Cast</p>
            <div className="space-y-1">
              {story.characters.map((character, index) => (
                <div key={character.id || index} className="flex items-center justify-between text-xs bg-purple-50 rounded px-2 py-1 border border-purple-100">
                  <div className="flex items-center space-x-1 min-w-0 flex-1">
                    <Film className="w-3 h-3 text-purple-600 flex-shrink-0" />
                    <span className="font-medium text-purple-900 truncate">{character.name}</span>
                    {character.role && (
                      <span className="text-purple-600 text-xs">({character.role})</span>
                    )}
                  </div>
                  {character.actorName && (
                    <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                      <User className="w-3 h-3 text-gray-500" />
                      <span className="text-gray-700 font-medium">{character.actorName}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Character Photos Carousel */}
        {charactersWithPhotos.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Character Photos</p>
            <div className="relative bg-gray-100 rounded-lg overflow-hidden">
              {/* Current Character Info */}
              <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs z-10">
                <div className="font-semibold">{currentCharacter.name}</div>
                {currentCharacter.actorName && (
                  <div className="text-xs opacity-90">{currentCharacter.actorName}</div>
                )}
              </div>

              {/* Image Display */}
              <div className="relative h-48">
                {currentCharacterImages.length > 0 ? (
                  <>
                    <img
                      src={currentCharacterImages[currentImageIndex].startsWith('http') 
                        ? currentCharacterImages[currentImageIndex] 
                        : `http://localhost:8080${currentCharacterImages[currentImageIndex]}`}
                      alt={currentCharacter.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23667eea" width="400" height="300"/%3E%3Ctext fill="%23fff" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="14"%3ENo Image%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    
                    {/* Image Navigation within Character */}
                    {currentCharacterImages.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full"
                        >
                          <ChevronLeft className="w-3 h-3" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full"
                        >
                          <ChevronRight className="w-3 h-3" />
                        </button>
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-0.5 rounded-full text-xs">
                          {currentImageIndex + 1}/{currentCharacterImages.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                    No photo available
                  </div>
                )}
              </div>

              {/* Character Navigation */}
              {charactersWithPhotos.length > 1 && (
                <div className="bg-gray-200 px-2 py-1.5 flex items-center justify-between">
                  <button
                    onClick={prevCharacter}
                    className="flex items-center space-x-1 text-xs text-gray-700 hover:text-purple-600 font-medium"
                  >
                    <ChevronLeft className="w-3 h-3" />
                    <span>Prev</span>
                  </button>
                  <span className="text-xs text-gray-600 font-medium">
                    {currentCharacterIndex + 1}/{charactersWithPhotos.length} characters
                  </span>
                  <button
                    onClick={nextCharacter}
                    className="flex items-center space-x-1 text-xs text-gray-700 hover:text-purple-600 font-medium"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats Footer */}
        <div className="flex items-center justify-around pt-2 border-t border-gray-200">
          <div className="text-center">
            <p className="text-xs text-gray-500">Views</p>
            <p className="text-sm font-bold text-gray-800">{story.viewCount || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Likes</p>
            <p className="text-sm font-bold text-gray-800">{story.likeCount || 0}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Comments</p>
            <p className="text-sm font-bold text-gray-800">{story.commentCount || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryCardTooltip;
