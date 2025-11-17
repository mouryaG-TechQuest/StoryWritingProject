import { X, Edit } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import SceneTimelineViewer from './SceneTimelineViewer';

interface Character {
  id?: string;
  name: string;
  description: string;
  role: string;
  actorName?: string;
  imageUrls?: string[];  // Changed from imageUrl to imageUrls array
  popularity?: number;
}

interface TimelineEntry {
  id: string;
  event: string;
  description: string;
  characters: string[];
  imageUrls: string[];
  order: number;
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
}

interface StoryDetailModalProps {
  story: Story;
  onClose: () => void;
  onEdit?: (story: Story, sceneIndex?: number) => void;
  currentUsername?: string;
  showAsPage?: boolean; // New prop to control if shown as page or modal
}

export default function StoryDetailModal({ 
  story, 
  onClose, 
  onEdit,
  currentUsername,
  showAsPage = false
}: StoryDetailModalProps) {
  const [viewMode, setViewMode] = useState<'timeline' | 'full'>('timeline');
  const startTimeRef = useRef<number>(Date.now());
  const viewTrackedRef = useRef<boolean>(false);
  
  // Track view count when modal opens (only once)
  useEffect(() => {
    const trackView = async () => {
      if (viewTrackedRef.current) return; // Already tracked
      viewTrackedRef.current = true;
      
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        await fetch(`/api/stories/${story.id}/view`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (err) {
        console.error('Failed to track view:', err);
      }
    };
    
    trackView();
    startTimeRef.current = Date.now();
    
    // Track watch time when modal closes
    return () => {
      const watchTime = Math.floor((Date.now() - startTimeRef.current) / 1000); // in seconds
      if (watchTime > 0) {
        const token = localStorage.getItem('token');
        if (token) {
          fetch(`/api/stories/${story.id}/watch-time`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ watchTime })
          }).catch(err => console.error('Failed to track watch time:', err));
        }
      }
    };
  }, [story.id]);
  
  let timeline: TimelineEntry[] = [];
  try {
    if (story.timelineJson) {
      timeline = JSON.parse(story.timelineJson);
      // Sort by order if available
      timeline.sort((a, b) => (a.order || 0) - (b.order || 0));
    }
  } catch {
    timeline = [];
  }

  const isOwner = currentUsername && story.authorUsername === currentUsername;

  const handleEditScene = (sceneIndex: number) => {
    if (onEdit) {
      onClose(); // Close modal before redirecting
      onEdit(story, sceneIndex);
    }
  };

  const handleEditStory = () => {
    if (onEdit) {
      onClose(); // Close modal before redirecting
      onEdit(story);
    }
  };

  // Content card structure
  const contentCard = (
    <div className="relative bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-auto">
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-2xl z-10 shadow-lg">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-2">{story.title}</h2>
            <p className="text-sm opacity-90">
              By <span className="font-semibold">{story.authorUsername}</span> · 📅 {story.createdAt ? new Date(story.createdAt).toLocaleString() : '-'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {isOwner && onEdit && (
              <button
                onClick={handleEditStory}
                className="flex items-center space-x-1 bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg hover:bg-yellow-400 transition font-semibold"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Story</span>
              </button>
            )}
            {!showAsPage && (
              <button
                aria-label="Close"
                onClick={onClose}
                className="text-white hover:bg-white/20 rounded-full p-2 transition"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
        </div>

        {/* View Mode Toggle - Only show if timeline exists */}
        {timeline.length > 0 && (
            <div className="mt-4 flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg p-1">
              <button
                onClick={() => setViewMode('timeline')}
                className={`flex-1 px-4 py-2 rounded-md font-semibold transition ${
                  viewMode === 'timeline'
                    ? 'bg-white text-purple-600 shadow-md'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                🎬 Scene Timeline
              </button>
              <button
                onClick={() => setViewMode('full')}
                className={`flex-1 px-4 py-2 rounded-md font-semibold transition ${
                  viewMode === 'full'
                    ? 'bg-white text-purple-600 shadow-md'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                📖 Full Story
              </button>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-6">
          {/* Timeline Scene Viewer - Interactive for Readers, Editable for Owners */}
          {timeline.length > 0 && viewMode === 'timeline' && (
            <section>
              <SceneTimelineViewer
                timeline={timeline}
                characters={story.characters}
                onEditScene={isOwner && onEdit ? handleEditScene : undefined}
                isEditorView={isOwner}
              />
            </section>
          )}

          {/* Full Story View - Traditional Layout */}
          {viewMode === 'full' && (
            <>
              {/* Images Gallery */}
              {story.imageUrls && story.imageUrls.length > 0 && (
                <section>
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                    🖼️ Story Images
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {story.imageUrls.map((url, idx) => (
                      <div key={idx} className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition bg-gray-100">
                        <img
                          src={url.startsWith('http') ? url : `http://localhost:8080${url}`}
                          alt={`Story image ${idx + 1}`}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16"%3EImage not available%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Description */}
              {story.description && (
                <section>
                  <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
                    📝 Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                    {story.description}
                  </p>
                </section>
              )}

              {/* Full Content */}
              <section>
                <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center">
                  📖 Full Story
                </h3>
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                  {story.content}
                </p>
              </section>

              {/* Timeline - Classic List View */}
              {timeline.length > 0 && (
                <section>
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                    ⏱️ Story Timeline
                  </h3>
                  <div className="space-y-4">
                    {timeline.map((entry, idx) => (
                      <div key={entry.id || idx} className="border-l-4 border-purple-500 pl-4 py-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-r-lg shadow-sm">
                        <div className="flex items-start space-x-3">
                          <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                            {idx + 1}
                          </span>
                          <div className="flex-1">
                            <h4 className="font-bold text-purple-900 text-lg mb-1">{entry.event || `Event ${idx + 1}`}</h4>
                            {entry.description && (
                              <p className="text-sm text-gray-700 mb-2 leading-relaxed">{entry.description}</p>
                            )}
                            
                            {/* Timeline Entry Images */}
                            {entry.imageUrls && entry.imageUrls.length > 0 && (
                              <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 mt-3 mb-2">
                                {entry.imageUrls.map((url: string, imgIdx: number) => (
                                  <div key={imgIdx} className="rounded overflow-hidden shadow-md bg-gray-100 hover:shadow-lg transition">
                                    <img
                                      src={url.startsWith('http') ? url : `http://localhost:8080${url}`}
                                      alt={`${entry.event} - Image ${imgIdx + 1}`}
                                      className="w-full h-32 object-cover"
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect fill="%23e5e7eb" width="200" height="150"/%3E%3Ctext fill="%239ca3af" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12"%3EImage Error%3C/text%3E%3C/svg%3E';
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {/* Characters in this timeline entry */}
                            {entry.characters && entry.characters.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                <span className="text-xs font-semibold text-purple-700">Cast:</span>
                                {entry.characters.map((charName: string, cIdx: number) => {
                                  const character = story.characters.find(c => c.name === charName);
                                  return (
                                    <span
                                      key={cIdx}
                                      className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full"
                                      title={character?.actorName ? `Played by ${character.actorName}` : ''}
                                    >
                                      {charName}
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Merged Story View */}
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-bold text-blue-900 mb-2">📜 Complete Story Flow</h4>
                    <div className="bg-white rounded p-3 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
                      {timeline.map((entry, idx) => {
                        const castList = entry.characters && entry.characters.length > 0
                          ? `\n[Cast: ${entry.characters.join(', ')}]`
                          : '';
                        return `${idx + 1}. ${entry.event}${castList}\n${entry.description || ''}`;
                      }).join('\n\n')}
                    </div>
                  </div>
                </section>
              )}

              {/* Cast/Characters */}
              {story.characters && story.characters.length > 0 && (
                <section>
                  <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                    🎭 Cast & Characters
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {story.characters.map((c) => (
                      <div key={c.id || c.name} className="rounded-lg border-2 border-gray-200 p-4 hover:border-purple-400 hover:shadow-md transition">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <span className="font-bold text-gray-900 text-lg">{c.name}</span>
                            {c.actorName && (
                              <p className="text-sm text-purple-700 font-medium mt-0.5">
                                Played by: {c.actorName}
                              </p>
                            )}
                          </div>
                          {c.role && (
                            <span className="text-xs bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-1 rounded-full font-medium">
                              {c.role}
                            </span>
                          )}
                        </div>
                        {c.description && <p className="text-sm text-gray-700 leading-relaxed">{c.description}</p>}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
    </div>
  );

  // Return modal with overlay or plain content based on showAsPage prop
  if (showAsPage) {
    return <div className="w-full">{contentCard}</div>;
  }

  return (
    <div className="fixed inset-0 z-[1000000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      {contentCard}
    </div>
  );
}
