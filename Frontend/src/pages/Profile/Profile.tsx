import { useState, useEffect } from 'react';
import { BookOpen, Heart, Settings, ArrowLeft } from 'lucide-react';
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
  commentCount?: number;
}

interface ProfilePageProps {
  onNavigate?: (page: 'home') => void;
}

export default function ProfilePage({ onNavigate }: ProfilePageProps) {
  const [username, setUsername] = useState('');
  const [myStories, setMyStories] = useState<Story[]>([]);
  const [activeTab, setActiveTab] = useState<'stories' | 'favorites'>('stories');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    setUsername(storedUsername || '');
    fetchMyStories();
  }, []);

  const fetchMyStories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/stories/my-stories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMyStories(data);
      }
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => onNavigate?.('home')}
          className="flex items-center text-purple-600 hover:text-purple-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{username}</h1>
              <div className="flex gap-6 text-gray-600">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  <span>{myStories.length} Stories</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  <span>{myStories.reduce((sum, s) => sum + (s.likeCount || 0), 0)} Total Likes</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => window.location.href = '/settings'}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              <Settings className="w-5 h-5" />
              Settings
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('stories')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'stories'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            My Stories
          </button>
          <button
            onClick={() => window.location.href = '/favorites'}
            className="px-6 py-3 rounded-lg font-semibold bg-white text-gray-600 hover:bg-gray-50 transition"
          >
            Favorites
          </button>
        </div>

        {/* Stories Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          </div>
        ) : myStories.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">No stories yet</h2>
            <p className="text-gray-500">Start creating your first story!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myStories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                isOwner={true}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
