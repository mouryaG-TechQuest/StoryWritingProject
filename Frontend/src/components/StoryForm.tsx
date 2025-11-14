import { Plus, Trash2 } from 'lucide-react';

interface Character {
  id?: string;
  name: string;
  description: string;
  role: string;
}

interface FormData {
  title: string;
  content: string;
  characters: Character[];
}

interface StoryFormProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
  isEditing: boolean;
}

const StoryForm = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  loading,
  isEditing
}: StoryFormProps) => {
  const addCharacter = () => {
    setFormData({
      ...formData,
      characters: [...formData.characters, { name: '', description: '', role: '' }]
    });
  };

  const removeCharacter = (index: number) => {
    setFormData({
      ...formData,
      characters: formData.characters.filter((_, i) => i !== index)
    });
  };

  const updateCharacter = (index: number, field: keyof Character, value: string) => {
    const newCharacters = [...formData.characters];
    newCharacters[index][field] = value;
    setFormData({ ...formData, characters: newCharacters });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        {isEditing ? 'Edit Story' : 'Create New Story'}
      </h2>

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Story Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          required
        />

        <textarea
          placeholder="Story Content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 h-32"
          required
        />

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-700">Characters</h3>
            <button
              type="button"
              onClick={addCharacter}
              className="text-purple-600 hover:text-purple-700 text-sm flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Character
            </button>
          </div>

          {formData.characters.map((char, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Character {index + 1}</span>
                {formData.characters.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCharacter(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <input
                type="text"
                placeholder="Character Name"
                value={char.name}
                onChange={(e) => updateCharacter(index, 'name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                required
              />

              <input
                type="text"
                placeholder="Role (e.g., Protagonist, Antagonist)"
                value={char.role}
                onChange={(e) => updateCharacter(index, 'role', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
              />

              <textarea
                placeholder="Character Description"
                value={char.description}
                onChange={(e) => updateCharacter(index, 'description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 h-20"
              />
            </div>
          ))}
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : isEditing ? 'Update Story' : 'Create Story'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default StoryForm;
