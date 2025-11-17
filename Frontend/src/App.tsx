import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import './App.css';
import Header from './components/layout/Header.tsx';
import AuthPage from './pages/Auth/Auth.tsx';
import StoryForm from './components/StoryForm.tsx';
import StoryCard from './components/StoryCard.tsx';
import StoryDetailModal from './components/StoryDetailModal.tsx';
import StoryViewToggle from './components/StoryViewToggle.tsx';
import EmptyState from './components/EmptyState.tsx';
import LoadingSpinner from './components/common/Loader.tsx';
import Favorites from './pages/Favorites/Favorites.tsx';
import Profile from './pages/Profile/Profile.tsx';
import Settings from './pages/Settings/Settings.tsx';
import ContactSupport from './pages/Support/ContactSupport.tsx';
import Subscription from './pages/Subscription/Subscription.tsx';
import Cart from './pages/Cart/Cart.tsx';

const API_BASE = '/api';

interface User {
  username: string;
  token: string;
}

interface Character {
  id?: string;
  name: string;
  description: string;
  role: string;
  actorName?: string;
}

interface Story {
  id: string;
  title: string;
  content: string;
  description?: string;
  timelineJson?: string;
  imageUrls?: string[];
  authorUsername: string;
  characters: Character[];
  createdAt: string;
  isPublished?: boolean;
  likeCount?: number;
  isLikedByCurrentUser?: boolean;
  isFavoritedByCurrentUser?: boolean;
  commentCount?: number;
  writers?: string;
}

interface FormData {
  title: string;
  content: string;
  description: string;
  timelineJson: string;
  imageUrls: string[];
  characters: Character[];
  isPublished?: boolean;
  writers?: string;
}

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [myStories, setMyStories] = useState<Story[]>([]);
  const [view, setView] = useState<'all' | 'my'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [detailStory, setDetailStory] = useState<Story | null>(null);
  const [currentPage, setCurrentPage] = useState<'home' | 'favorites' | 'profile' | 'settings' | 'support' | 'subscription' | 'cart'>('home');

  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    description: '',
    timelineJson: '',
    imageUrls: [],
    characters: [{ name: '', description: '', role: '', actorName: '' }],
    isPublished: false,
    writers: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    if (token && username) {
      setUser({ username, token });
      fetchStories(token);
    }
  }, []);

  const fetchStories = async (token: string) => {
    setLoading(true);
    try {
      const [allRes, myRes] = await Promise.all([
        fetch(`${API_BASE}/stories`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/stories/my-stories`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (!allRes.ok || !myRes.ok) {
        throw new Error('Failed to fetch stories');
      }

      const allStories = await allRes.json();
      const userStories = await myRes.json();

      setStories(allStories);
      setMyStories(userStories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitStory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate title on frontend
    if (!formData.title.trim()) {
      setError('Story title is required');
      return;
    }
    
    setLoading(true);

    try {
      const method = editingStory ? 'PUT' : 'POST';
      const endpoint = editingStory
        ? `${API_BASE}/stories/${editingStory.id}`
        : `${API_BASE}/stories`;

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Check for duplicate title error
        if (errorData.message && errorData.message.includes('already exists')) {
          throw new Error('A story with this title already exists. Please choose a different title.');
        }
        throw new Error(errorData.message || 'Failed to save story');
      }

      await fetchStories(user?.token || '');
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save story');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStory = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this story?')) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/stories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to delete story');
      }

      await fetchStories(user?.token || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete story');
    } finally {
      setLoading(false);
    }
  };

  const handleEditStory = (story: Story, sceneIndex?: number) => {
    // Close detail modal if open
    setDetailStory(null);
    
    setEditingStory(story);
    setFormData({
      title: story.title,
      content: story.content,
      description: story.description || '',
      timelineJson: story.timelineJson || '',
      imageUrls: story.imageUrls || [],
      characters: story.characters.length > 0
        ? story.characters
        : [{ name: '', description: '', role: '', actorName: '' }],
      isPublished: story.isPublished || false,
      writers: story.writers || ''
    });
    setShowForm(true);
    
    // TODO: If sceneIndex is provided, scroll to or highlight that scene in the form
    // This can be implemented by passing sceneIndex to StoryForm and having it focus the timeline entry
  };

  const refreshCurrentStory = async () => {
    if (!editingStory || !user?.token) return;
    
    try {
      // Just refresh the story lists, don't overwrite the form being edited
      await fetchStories(user.token);
      
      // Optionally fetch the updated story to update editingStory reference
      const response = await fetch(`${API_BASE}/stories/${editingStory.id}`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      
      if (response.ok) {
        const updatedStory = await response.json();
        setEditingStory(updatedStory);
        // Don't update formData here - let the component manage its own state
      }
    } catch (err) {
      console.error('Failed to refresh story', err);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      description: '',
      timelineJson: '',
      imageUrls: [],
      characters: [{ name: '', description: '', role: '', actorName: '' }],
      isPublished: false,
      writers: ''
    });
    setEditingStory(null);
    setShowForm(false);
  };

  const toggleLike = async (storyId: string, isLiked: boolean) => {
    if (!user) return;
    
    try {
      const method = isLiked ? 'DELETE' : 'POST';
      const response = await fetch(`${API_BASE}/stories/${storyId}/like`, {
        method,
        headers: { 'Authorization': `Bearer ${user.token}` }
      });

      if (!response.ok) throw new Error('Failed to toggle like');
      
      const updated = await response.json();
      
      // Update story in both lists
      setStories(prev => prev.map(s => s.id === storyId ? updated : s));
      setMyStories(prev => prev.map(s => s.id === storyId ? updated : s));
      if (detailStory && detailStory.id === storyId) {
        setDetailStory(updated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle like');
    }
  };

  const toggleFavorite = async (storyId: string, isFavorited: boolean) => {
    if (!user) return;
    
    try {
      const method = isFavorited ? 'DELETE' : 'POST';
      const response = await fetch(`${API_BASE}/stories/${storyId}/favorite`, {
        method,
        headers: { 'Authorization': `Bearer ${user.token}` }
      });

      if (!response.ok) throw new Error('Failed to toggle favorite');
      
      const updated = await response.json();
      
      // Update story in both lists
      setStories(prev => prev.map(s => s.id === storyId ? updated : s));
      setMyStories(prev => prev.map(s => s.id === storyId ? updated : s));
      if (detailStory && detailStory.id === storyId) {
        setDetailStory(updated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle favorite');
    }
  };

  const togglePublish = async (storyId: string) => {
    if (!user) return;
    
    try {
      const response = await fetch(`${API_BASE}/stories/${storyId}/toggle-publish`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });

      if (!response.ok) throw new Error('Failed to toggle publish status');
      
      await fetchStories(user.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle publish status');
    }
  };

  const handleAuth = (userData: User) => {
    setUser(userData);
    localStorage.setItem('token', userData.token);
    localStorage.setItem('username', userData.username);
    fetchStories(userData.token);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUser(null);
    setStories([]);
    setMyStories([]);
    setCurrentPage('home');
  };

  const handleNavigate = (page: 'home' | 'favorites' | 'profile' | 'settings' | 'support' | 'subscription' | 'cart' | 'logout') => {
    if (page === 'logout') {
      logout();
    } else {
      setCurrentPage(page);
      setShowForm(false); // Hide form when navigating
    }
  };

  if (!user) {
    return <AuthPage onAuth={handleAuth} />;
  }

  const displayStories = view === 'all' ? stories : myStories;

  // Render page content based on currentPage
  const renderPage = () => {
    switch (currentPage) {
      case 'favorites':
        return <Favorites onNavigate={handleNavigate} />;
      case 'profile':
        return <Profile onNavigate={handleNavigate} />;
      case 'settings':
        return <Settings onNavigate={handleNavigate} />;
      case 'support':
        return <ContactSupport onNavigate={handleNavigate} />;
      case 'subscription':
        return <Subscription onNavigate={handleNavigate} />;
      case 'cart':
        return <Cart onNavigate={handleNavigate} />;
      case 'home':
      default:
        return (
          <>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-start">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <StoryViewToggle
              view={view}
              onViewChange={(newView) => {
                setView(newView);
                setShowForm(false); // Hide form when changing view
              }}
              allStoriesCount={stories.length}
              myStoriesCount={myStories.length}
              onNewStory={() => setShowForm(!showForm)}
              showForm={showForm}
            />

            {showForm && (
              <StoryForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmitStory}
                onCancel={resetForm}
                loading={loading}
                isEditing={!!editingStory}
                storyId={editingStory?.id}
                onCharacterCountChange={refreshCurrentStory}
              />
            )}

            {loading && !showForm ? (
              <LoadingSpinner isLoading={true} />
            ) : displayStories.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {displayStories.map((story) => (
                  <StoryCard
                    key={story.id}
                    story={story}
                    isOwner={story.authorUsername === user!.username}
                    onEdit={() => handleEditStory(story)}
                    onDelete={() => handleDeleteStory(story.id)}
                    onView={() => setDetailStory(story)}
                    onToggleLike={toggleLike}
                    onToggleFavorite={toggleFavorite}
                    onTogglePublish={story.authorUsername === user!.username ? togglePublish : undefined}
                  />
                ))}
              </div>
            ) : (
              <EmptyState view={view} />
            )}

            {detailStory && (
              <StoryDetailModal 
                story={detailStory} 
                onClose={() => setDetailStory(null)}
                onEdit={handleEditStory}
                currentUsername={user?.username}
              />
            )}
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <Header user={user} onLogout={logout} onNavigate={handleNavigate} />

      <div className="w-full px-2 sm:px-4 lg:px-6 py-4 sm:py-6">
        {renderPage()}
      </div>
    </div>
  );
};

export default App;
