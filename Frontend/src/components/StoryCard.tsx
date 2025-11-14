import { Edit, Trash2 } from 'lucide-react';

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

interface StoryCardProps {
  story: Story;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const StoryCard = ({ story, isOwner, onEdit, onDelete }: StoryCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-800 flex-1">{story.title}</h3>
        {isOwner && (
          <div className="flex space-x-2 ml-2">
            <button
              onClick={onEdit}
              className="text-blue-600 hover:text-blue-700"
              aria-label="Edit story"
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={onDelete}
              className="text-red-600 hover:text-red-700"
              aria-label="Delete story"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-600 mb-3">
        By: <span className="font-medium">{story.authorUsername}</span>
      </p>

      <p className="text-gray-700 mb-4 line-clamp-3">{story.content}</p>

      {story.characters.length > 0 && (
        <div className="border-t pt-4 mt-4">
          <h4 className="font-semibold text-gray-700 mb-2 text-sm">Characters:</h4>
          <div className="space-y-2">
            {story.characters.map((char) => (
              <div key={char.id || char.name} className="bg-purple-50 rounded p-3">
                <div className="flex justify-between items-start">
                  <span className="font-medium text-purple-900">{char.name}</span>
                  {char.role && (
                    <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded">
                      {char.role}
                    </span>
                  )}
                </div>
                {char.description && (
                  <p className="text-sm text-gray-600 mt-1">{char.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 mt-4 border-t pt-3">
        Created: {new Date(story.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
};

export default StoryCard;
