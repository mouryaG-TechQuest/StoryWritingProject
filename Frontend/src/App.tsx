import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import './App.css';
import Header from './components/layout/Header.tsx';
import AuthPage from './pages/Auth/Auth.tsx';
import StoryForm from './components/StoryForm.tsx';
import StoryCard from './components/StoryCard.tsx';
import StoryViewToggle from './components/StoryViewToggle.tsx';
import EmptyState from './components/EmptyState.tsx';
import LoadingSpinner from './components/common/Loader.tsx';

const API_BASE = 'http://localhost:8080/api';

interface User {
  username: string;
  token: string;
}

interface Character {
  id?: string;
  name: string;
  description: string;
  role: string;
}

interface Story {
  id: string;
  title: string;
  content: string;
  authorUsername: string;
  characters: Character[];
  createdAt: string;
}

interface FormData {
  title: string;
  content: string;
  characters: Character[];
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

  const [formData, setFormData] = useState<FormData>({
    title: '',
    content: '',
    characters: [{ name: '', description: '', role: '' }]
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

  const handleEditStory = (story: Story) => {
    setEditingStory(story);
    setFormData({
      title: story.title,
      content: story.content,
      characters: story.characters.length > 0
        ? story.characters
        : [{ name: '', description: '', role: '' }]
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      characters: [{ name: '', description: '', role: '' }]
    });
    setEditingStory(null);
    setShowForm(false);
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
  };

  if (!user) {
    return <AuthPage onAuth={handleAuth} />;
  }

  const displayStories = view === 'all' ? stories : myStories;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <Header user={user} onLogout={logout} />

      <div className="max-w-7xl mx-auto p-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <StoryViewToggle
          view={view}
          onViewChange={setView}
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
                isOwner={story.authorUsername === user.username}
                onEdit={() => handleEditStory(story)}
                onDelete={() => handleDeleteStory(story.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState view={view} />
        )}
      </div>
    </div>
  );
};

export default App;
