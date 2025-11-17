import { useState, useEffect } from 'react';
import { Heart, ArrowLeft } from 'lucide-react';
import StoryCard from '../../components/StoryCard';

const API_BASE = '/api';

interface Story {
  id: string;
  title: string;
  content: string;
  description?: string;
  authorUsername: string;
  imageUrls?: string[];
  characters: any[];
  createdAt: string;
  isPublished?: boolean;
  likeCount?: number;
  isLikedByCurrentUser?: boolean;
  isFavoritedByCurrentUser?: boolean;
  commentCount?: number;
}

interface FavoritesPageProps {
  onNavigate?: (page: 'home') => void;
}

export default function FavoritesPage({ onNavigate }: FavoritesPageProps) {
  const [favorites, setFavorites] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/stories/favorites`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setFavorites(data);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLike = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const story = favorites.find(s => s.id === id);
      const method = story?.isLikedByCurrentUser ? 'DELETE' : 'POST';
      
      const response = await fetch(`${API_BASE}/stories/${id}/like`, {
        method,
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const updatedStory = await response.json();
        setFavorites(favorites.map(s => s.id === id ? updatedStory : s));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/stories/${id}/favorite`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setFavorites(favorites.filter(s => s.id !== id));
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => onNavigate?.('home')}
            className="flex items-center text-purple-600 hover:text-purple-700 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            <h1 className="text-3xl font-bold text-gray-800">My Favorite Stories</h1>
          </div>
          <p className="text-gray-600 mt-2">{favorites.length} favorite{favorites.length !== 1 ? 's' : ''}</p>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">No favorites yet</h2>
            <p className="text-gray-500">Start exploring and save your favorite stories!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                isOwner={false}
                onEdit={() => {}}
                onDelete={() => {}}
                onToggleLike={handleToggleLike}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
