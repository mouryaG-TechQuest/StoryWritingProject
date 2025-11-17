import { Edit, Trash2, ThumbsUp, Heart, Eye, EyeOff } from 'lucide-react';

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
}

interface StoryCardProps {
  story: Story;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onView?: () => void;
  onToggleLike?: (storyId: string, isLiked: boolean) => void;
  onToggleFavorite?: (storyId: string, isFavorited: boolean) => void;
  onTogglePublish?: (storyId: string) => void;
}

const StoryCard = ({ 
  story, 
  isOwner, 
  onEdit, 
  onDelete, 
  onView,
  onToggleLike,
  onToggleFavorite,
  onTogglePublish
}: StoryCardProps) => {
  const cast = story.characters?.map((c) => c.actorName || c.name).filter(Boolean).join(', ');
  const firstImage = story.imageUrls?.[0];
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  return (
    <div className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col h-[480px]">
      {/* Image Banner */}
      {firstImage && (
        <div className="h-40 bg-gradient-to-br from-purple-100 to-blue-100 overflow-hidden">
          <img
            src={`http://localhost:8080${firstImage}`}
            alt={story.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      
      <div className="flex-1 p-5 flex flex-col">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-800 flex-1 line-clamp-2" title={story.title}>
            {story.title}
          </h3>
          <div className="flex items-center space-x-1 ml-2 shrink-0">
            {isOwner && onTogglePublish && (
              <button
                onClick={() => onTogglePublish(story.id)}
                className={`${
                  story.isPublished 
                    ? 'text-green-600 hover:bg-green-50' 
                    : 'text-gray-400 hover:bg-gray-50'
                } p-1.5 rounded transition`}
                title={story.isPublished ? 'Published (click to unpublish)' : 'Draft (click to publish)'}
              >
                {story.isPublished ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
              </button>
            )}
            {isOwner && (
              <>
                <button
                  onClick={onEdit}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-1.5 rounded transition"
                  aria-label="Edit story"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={onDelete}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition"
                  aria-label="Delete story"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-3 flex items-center justify-between">
          <span>
            By: <span className="font-semibold text-purple-700">{story.authorUsername}</span>
          </span>
          {!story.isPublished && isOwner && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">
              Draft
            </span>
          )}
        </p>

        {story.description && (
          <p className="text-gray-700 text-sm mb-3 line-clamp-3" title={story.description}>
            {story.description}
          </p>
        )}

        {cast && (
          <div className="mb-3">
            <p className="text-xs text-gray-600 line-clamp-2" title={cast}>
              <span className="font-semibold text-gray-800">Cast:</span> {cast}
            </p>
          </div>
        )}

        <div className="mt-auto pt-3 flex items-center justify-between border-t text-xs text-gray-500">
          <span>📅 {formatDate(story.createdAt)}</span>
          <div className="flex items-center space-x-3">
            {onToggleLike && (
              <button
                onClick={() => onToggleLike(story.id, story.isLikedByCurrentUser || false)}
                className={`flex items-center space-x-1 transition ${
                  story.isLikedByCurrentUser 
                    ? 'text-blue-600' 
                    : 'text-gray-500 hover:text-blue-600'
                }`}
              >
                <ThumbsUp className={`w-4 h-4 ${story.isLikedByCurrentUser ? 'fill-current' : ''}`} />
                <span className="font-medium">{story.likeCount || 0}</span>
              </button>
            )}
            {onToggleFavorite && (
              <button
                onClick={() => onToggleFavorite(story.id, story.isFavoritedByCurrentUser || false)}
                className={`transition ${
                  story.isFavoritedByCurrentUser 
                    ? 'text-red-600' 
                    : 'text-gray-400 hover:text-red-600'
                }`}
              >
                <Heart className={`w-4 h-4 ${story.isFavoritedByCurrentUser ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </div>

      {onView && (
        <div className="px-5 pb-4">
          <button
            onClick={onView}
            className="w-full text-sm bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2.5 rounded-lg shadow-md hover:shadow-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
          >
            View Full Story
          </button>
        </div>
      )}
    </div>
  );
};

export default StoryCard;
