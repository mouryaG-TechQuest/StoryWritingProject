import { Plus } from 'lucide-react';

interface StoryViewToggleProps {
  view: 'all' | 'my';
  onViewChange: (view: 'all' | 'my') => void;
  allStoriesCount: number;
  myStoriesCount: number;
  onNewStory: () => void;
  showForm: boolean;
}

const StoryViewToggle = ({
  view,
  onViewChange,
  allStoriesCount,
  myStoriesCount,
  onNewStory,
  showForm
}: StoryViewToggleProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex space-x-2">
        <button
          onClick={() => onViewChange('all')}
          className={`px-4 py-2 rounded-lg transition ${
            view === 'all'
              ? 'bg-purple-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          All Stories ({allStoriesCount})
        </button>
        <button
          onClick={() => onViewChange('my')}
          className={`px-4 py-2 rounded-lg transition ${
            view === 'my'
              ? 'bg-purple-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          My Stories ({myStoriesCount})
        </button>
      </div>

      <button
        onClick={onNewStory}
        className="flex items-center bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
      >
        <Plus className="w-5 h-5 mr-2" />
        {showForm ? 'Hide Form' : 'New Story'}
      </button>
    </div>
  );
};

export default StoryViewToggle;
