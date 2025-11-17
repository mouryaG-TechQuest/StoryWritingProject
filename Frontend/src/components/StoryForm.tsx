import { Plus, Trash2, Upload, X, Users, BookOpen, Info, Eye, Filter, SortAsc, ChevronDown, ChevronUp, Search, ChevronLeft, ChevronRight, Image as ImageIcon, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import TimelineManager from './TimelineManager';
import { getAllCharacterNames, getCharacterColor } from '../utils/characterColors.tsx';

interface Character {
  id?: string;
  name: string;
  description: string;
  role: string;
  actorName?: string;
  imageUrl?: string;
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

interface TimelineEntry {
  id: string;
  event: string;
  description: string;
  characters: string[];
  imageUrls: string[];
  order: number;
}

interface StoryFormProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
  isEditing: boolean;
  storyId?: string;
  onCharacterCountChange?: () => void;
}

const StoryForm = ({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  loading,
  isEditing,
  storyId,
  onCharacterCountChange
}: StoryFormProps) => {
  const [uploadingImages, setUploadingImages] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'characters' | 'timeline' | 'preview'>('details');
  const [expandedCharacters, setExpandedCharacters] = useState<Set<number>>(new Set([0]));
  const [showAllCharacters, setShowAllCharacters] = useState(false);
  const [characterFilter, setCharacterFilter] = useState<'none' | 'character-az' | 'actor-az'>('none');
  const [characterSearchQuery, setCharacterSearchQuery] = useState('');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [uploadingCharacterImage, setUploadingCharacterImage] = useState<number | null>(null);
  const [characterSaveStatus, setCharacterSaveStatus] = useState<{[key: number]: {type: 'success' | 'error', message: string} | null}>({});
  const [writerMode, setWriterMode] = useState(true);
  const [previewPage, setPreviewPage] = useState(0);
  const [castPage, setCastPage] = useState(0);
  const [customScenesPerPage, setCustomScenesPerPage] = useState(10);
  const [readerScenesPerPage, setReaderScenesPerPage] = useState(10);
  const [searchPageNumber, setSearchPageNumber] = useState('');
  const [searchSceneNumber, setSearchSceneNumber] = useState('');
  const [sceneSearchQuery, setSceneSearchQuery] = useState('');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [screenSize, setScreenSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const CAST_PER_PAGE = 20; // Paginate cast members
  const MIN_SCENES_PER_PAGE = 5;
  const MAX_SCENES_PER_PAGE_WRITER = 30;
  const MAX_SCENES_PER_PAGE_READER = 15;
  
  // Calculate max scenes based on screen size
  const getMaxScenesForScreen = () => {
    if (writerMode) {
      if (screenSize.height < 600) return 5; // Small phones
      if (screenSize.height < 800) return 10; // Medium phones/tablets
      if (screenSize.height < 1000) return 20; // Laptops
      return 30; // Large screens
    } else {
      if (screenSize.height < 600) return 5; // Small phones
      if (screenSize.height < 800) return 8; // Medium phones/tablets
      if (screenSize.height < 1000) return 12; // Laptops
      return 15; // Large screens
    }
  };
  
  // Get responsive text size classes
  const getTextSizeClass = () => {
    if (screenSize.width < 640) return 'text-base leading-relaxed'; // Small
    if (screenSize.width < 1024) return 'text-lg leading-relaxed'; // Medium
    return 'text-lg sm:text-xl leading-loose'; // Large
  };
  
  // Update screen size on resize
  useEffect(() => {
    const handleResize = () => {
      setScreenSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const [timeline, setTimeline] = useState<TimelineEntry[]>(() => {
    try {
      return formData.timelineJson ? JSON.parse(formData.timelineJson) : [];
    } catch {
      return [];
    }
  });

  const handleTimelineChange = (newTimeline: TimelineEntry[]) => {
    setTimeline(newTimeline);
    setFormData({ ...formData, timelineJson: JSON.stringify(newTimeline) });
  };

  const handleAddCharacterFromTimeline = async (character: Character) => {
    const newCharacters = [...formData.characters, character];
    const updatedFormData = {
      ...formData,
      characters: newCharacters
    };
    setFormData(updatedFormData);

    // If editing an existing story, save the character immediately
    if (storyId) {
      try {
        const token = localStorage.getItem('token');
        const characterData = { ...character, storyId: parseInt(storyId) };
        
        const response = await fetch('http://localhost:8080/api/stories/characters', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(characterData)
        });

        if (response.ok) {
          const savedCharacter = await response.json();
          // Update the character list with the saved character (with ID)
          const finalCharacters = [...newCharacters];
          finalCharacters[finalCharacters.length - 1] = savedCharacter;
          
          const finalFormData = { ...formData, characters: finalCharacters };
          setFormData(finalFormData);
          
          // Notify parent to refresh
          if (onCharacterCountChange) {
            setTimeout(() => {
              onCharacterCountChange();
            }, 100);
          }
        }
      } catch (err) {
        console.error('Failed to save character from timeline', err);
      }
    }
  };

  const addCharacter = () => {
    const newIndex = formData.characters.length;
    setFormData({
      ...formData,
      characters: [...formData.characters, { name: '', description: '', role: '', actorName: '', imageUrl: '' }]
    });
    // Collapse all existing characters and expand only the new one
    setExpandedCharacters(new Set([newIndex]));
    setShowAllCharacters(false);
  };

  const removeCharacter = (index: number) => {
    const characterToRemove = formData.characters[index];
    const characterName = characterToRemove.name;
    
    // Remove character from the characters array
    const newCharacters = formData.characters.filter((_, i) => i !== index);
    
    // Update timeline to remove this character from all scenes
    const updatedTimeline = timeline.map(entry => ({
      ...entry,
      characters: entry.characters.filter(charName => charName !== characterName)
    }));
    
    setTimeline(updatedTimeline);
    setFormData({
      ...formData,
      characters: newCharacters,
      timelineJson: JSON.stringify(updatedTimeline)
    });
    
    // Update expanded characters after removal
    const newExpanded = new Set<number>();
    expandedCharacters.forEach(i => {
      if (i < index) newExpanded.add(i);
      else if (i > index) newExpanded.add(i - 1);
    });
    setExpandedCharacters(newExpanded);
  };

  const toggleCharacter = (index: number) => {
    const newExpanded = new Set(expandedCharacters);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedCharacters(newExpanded);
  };

  const getFilteredAndSortedCharacters = () => {
    let chars = formData.characters.map((char, index) => ({ char, index }));
    
    // Apply search filter
    if (characterSearchQuery.trim()) {
      const query = characterSearchQuery.toLowerCase();
      chars = chars.filter(({ char }) => 
        (char.name || '').toLowerCase().includes(query) ||
        (char.actorName || '').toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    if (characterFilter === 'character-az') {
      chars.sort((a, b) => (a.char.name || '').localeCompare(b.char.name || ''));
    } else if (characterFilter === 'actor-az') {
      chars.sort((a, b) => (a.char.actorName || '').localeCompare(b.char.actorName || ''));
    }
    
    return chars;
  };

  const updateCharacter = (index: number, field: keyof Character, value: string) => {
    const newCharacters = [...formData.characters];
    const oldCharacterName = newCharacters[index].name;
    
    newCharacters[index][field] = value;
    
    // If the character name is being changed, update it in the timeline too
    if (field === 'name' && oldCharacterName && value !== oldCharacterName) {
      const updatedTimeline = timeline.map(entry => {
        // Update character name in the characters array
        const updatedCharacters = entry.characters.map(charName => 
          charName === oldCharacterName ? value : charName
        );
        
        // Update character name in the description text using word boundary regex
        const oldNameRegex = new RegExp(`\\b${oldCharacterName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
        const updatedDescription = entry.description.replace(oldNameRegex, value);
        
        // Update character name in the event title
        const updatedEvent = entry.event.replace(oldNameRegex, value);
        
        return {
          ...entry,
          characters: updatedCharacters,
          description: updatedDescription,
          event: updatedEvent
        };
      });
      
      setTimeline(updatedTimeline);
      setFormData({ 
        ...formData, 
        characters: newCharacters,
        timelineJson: JSON.stringify(updatedTimeline)
      });
    } else {
      setFormData({ ...formData, characters: newCharacters });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingImages(true);

    const files = Array.from(e.target.files);
    const formDataUpload = new FormData();
    files.forEach(file => formDataUpload.append('files', file));

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/stories/upload-images', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataUpload
      });

      if (response.ok) {
        const urls: string[] = await response.json();
        setFormData({ ...formData, imageUrls: [...formData.imageUrls, ...urls] });
      }
    } catch (err) {
      console.error('Image upload failed', err);
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index)
    });
  };

  const handleCharacterImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, characterIndex: number) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingCharacterImage(characterIndex);

    const file = e.target.files[0];
    const formDataUpload = new FormData();
    formDataUpload.append('files', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/stories/upload-images', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataUpload
      });

      if (response.ok) {
        const urls: string[] = await response.json();
        if (urls.length > 0) {
          updateCharacter(characterIndex, 'imageUrl', urls[0]);
        }
      }
    } catch (err) {
      console.error('Character image upload failed', err);
    } finally {
      setUploadingCharacterImage(null);
    }
  };

  const removeCharacterImage = (characterIndex: number) => {
    updateCharacter(characterIndex, 'imageUrl', '');
  };

  const saveCharacterToGlobal = async (characterIndex: number) => {
    const character = formData.characters[characterIndex];
    if (!character.name.trim()) {
      setCharacterSaveStatus({...characterSaveStatus, [characterIndex]: {type: 'error', message: 'Character name is required'}});
      setTimeout(() => setCharacterSaveStatus({...characterSaveStatus, [characterIndex]: null}), 3000);
      return;
    }

    // For new stories, characters will be saved with the story
    if (!storyId) {
      setCharacterSaveStatus({...characterSaveStatus, [characterIndex]: {type: 'success', message: 'Character will be saved when you submit the story'}});
      setTimeout(() => setCharacterSaveStatus({...characterSaveStatus, [characterIndex]: null}), 3000);
      return;
    }

    // For existing stories, save immediately
    try {
      const token = localStorage.getItem('token');
      const characterData = { ...character, storyId: parseInt(storyId) };
      
      const response = await fetch('http://localhost:8080/api/stories/characters', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(characterData)
      });

      if (response.ok) {
        const savedCharacter = await response.json();
        // Update the character with the returned ID - create a completely new array
        const newCharacters = [...formData.characters];
        newCharacters[characterIndex] = savedCharacter;
        
        // Update formData with new characters array
        const updatedFormData = { ...formData, characters: newCharacters };
        setFormData(updatedFormData);
        
        setCharacterSaveStatus({...characterSaveStatus, [characterIndex]: {type: 'success', message: 'Character added successfully!'}});
        setTimeout(() => setCharacterSaveStatus({...characterSaveStatus, [characterIndex]: null}), 3000);
        
        // Notify parent component about character count change
        if (onCharacterCountChange) {
          // Small delay to ensure state update completes
          setTimeout(() => {
            onCharacterCountChange();
          }, 100);
        }
      } else {
        setCharacterSaveStatus({...characterSaveStatus, [characterIndex]: {type: 'error', message: 'Failed to add character'}});
        setTimeout(() => setCharacterSaveStatus({...characterSaveStatus, [characterIndex]: null}), 3000);
      }
    } catch (err) {
      console.error('Failed to save character', err);
      setCharacterSaveStatus({...characterSaveStatus, [characterIndex]: {type: 'error', message: 'Failed to add character'}});
      setTimeout(() => setCharacterSaveStatus({...characterSaveStatus, [characterIndex]: null}), 3000);
    }
  };

  const updateCharacterToGlobal = async (characterIndex: number) => {
    const character = formData.characters[characterIndex];
    if (!character.id) {
      setCharacterSaveStatus({...characterSaveStatus, [characterIndex]: {type: 'error', message: 'Character not saved yet. Use "Add Character" first.'}});
      setTimeout(() => setCharacterSaveStatus({...characterSaveStatus, [characterIndex]: null}), 3000);
      return;
    }
    if (!character.name.trim()) {
      setCharacterSaveStatus({...characterSaveStatus, [characterIndex]: {type: 'error', message: 'Character name is required'}});
      setTimeout(() => setCharacterSaveStatus({...characterSaveStatus, [characterIndex]: null}), 3000);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/stories/characters/${character.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(character)
      });

      if (response.ok) {
        const updatedCharacter = await response.json();
        const newCharacters = [...formData.characters];
        newCharacters[characterIndex] = updatedCharacter;
        
        const updatedFormData = { ...formData, characters: newCharacters };
        setFormData(updatedFormData);
        
        setCharacterSaveStatus({...characterSaveStatus, [characterIndex]: {type: 'success', message: 'Character updated successfully!'}});
        setTimeout(() => setCharacterSaveStatus({...characterSaveStatus, [characterIndex]: null}), 3000);
        
        // Notify parent component about character count change
        if (onCharacterCountChange) {
          setTimeout(() => {
            onCharacterCountChange();
          }, 100);
        }
      } else {
        setCharacterSaveStatus({...characterSaveStatus, [characterIndex]: {type: 'error', message: 'Failed to update character'}});
        setTimeout(() => setCharacterSaveStatus({...characterSaveStatus, [characterIndex]: null}), 3000);
      }
    } catch (err) {
      console.error('Failed to update character', err);
      setCharacterSaveStatus({...characterSaveStatus, [characterIndex]: {type: 'error', message: 'Failed to update character'}});
      setTimeout(() => setCharacterSaveStatus({...characterSaveStatus, [characterIndex]: null}), 3000);
    }
  };

  const generateFullStory = () => {
    if (timeline.length === 0) return formData.content;
    
    const allCharNames = getAllCharacterNames(formData.characters);
    
    return timeline
      .sort((a, b) => a.order - b.order)
      .map((entry, idx) => {
        const castList = entry.characters.length > 0 
          ? `\n[Cast: ${entry.characters.map(name => `***${name}***`).join(', ')}]` 
          : '';
        
        // Format character names in description as bold italic
        let description = entry.description;
        entry.characters.forEach(charName => {
          const regex = new RegExp(`\\b${charName}\\b`, 'gi');
          description = description.replace(regex, `***${charName}***`);
        });
        
        return `${idx + 1}. ${entry.event}${castList}\n${description}`;
      })
      .join('\n\n');
  };

  const renderFormattedStory = (text: string) => {
    if (!text) return 'No content yet. Add timeline entries or write content in Story Details.';
    
    const allCharNames = getAllCharacterNames(formData.characters);
    if (allCharNames.length === 0) return text;
    
    const parts: (string | JSX.Element)[] = [];
    let lastIndex = 0;
    
    // Match ***name*** pattern for formatted character names
    const pattern = allCharNames
      .map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|');
    const regex = new RegExp(`\\*\\*\\*(${pattern})\\*\\*\\*`, 'gi');
    
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      
      const matchedName = match[1];
      const normalizedName = allCharNames.find(n => n.toLowerCase() === matchedName.toLowerCase()) || matchedName;
      const color = getCharacterColor(normalizedName, allCharNames);
      parts.push(
        <span
          key={`${match.index}-${matchedName}`}
          className={`font-bold italic ${color.text} px-1 rounded`}
          style={{ backgroundColor: color.hex ? `${color.hex}15` : 'transparent' }}
        >
          {matchedName}
        </span>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts.length > 0 ? <>{parts}</> : text;
  };

  const tabs = [
    { id: 'details', label: 'Story Details', icon: Info, color: 'blue' },
    { id: 'characters', label: 'Characters', icon: Users, color: 'purple', count: formData.characters.length },
    { id: 'timeline', label: 'Write Story', icon: BookOpen, color: 'green', count: timeline.length },
    { id: 'preview', label: 'Preview Story', icon: Eye, color: 'orange' }
  ] as const;

  return (
    <div className="bg-white rounded-xl shadow-2xl mb-6 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold flex items-center">
          <BookOpen className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 mr-2 sm:mr-3" />
          <span className="truncate">{isEditing ? 'Edit Your Story' : 'Create New Story'}</span>
        </h2>
        <p className="text-purple-100 mt-1 sm:mt-2 text-xs sm:text-sm lg:text-base">Craft your narrative with characters, timeline, and rich media</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-gray-50 border-b-2 border-gray-200">
        <div className="flex overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const colorClasses = {
              blue: isActive ? 'bg-blue-600 text-white' : 'text-blue-700 hover:bg-blue-50',
              purple: isActive ? 'bg-purple-600 text-white' : 'text-purple-700 hover:bg-purple-50',
              green: isActive ? 'bg-green-600 text-white' : 'text-green-700 hover:bg-green-50',
              orange: isActive ? 'bg-orange-600 text-white' : 'text-orange-700 hover:bg-orange-50'
            };

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 font-semibold transition-all border-b-4 whitespace-nowrap text-sm sm:text-base ${
                  isActive ? 'border-current' : 'border-transparent'
                } ${colorClasses[tab.color]}`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="hidden xs:inline">{tab.label}</span>
                <span className="xs:hidden">{tab.label.split(' ')[0]}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-bold ${
                    isActive ? 'bg-white/20' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={onSubmit} className="p-3 sm:p-4 lg:p-6">
        {/* Story Details Tab */}
        {activeTab === 'details' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                <Info className="w-5 h-5 mr-2" />
                Basic Information
              </h3>
              
              <input
                type="text"
                placeholder="Story Title *"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold mb-3"
                required
              />

              <textarea
                placeholder="Short Description (displayed in preview)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />

              <input
                type="text"
                placeholder="Writers (e.g., John Doe, Jane Smith)"
                value={formData.writers || ''}
                onChange={(e) => setFormData({ ...formData, writers: e.target.value })}
                className="w-full px-4 py-3 border-2 border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mt-3"
              />
            </div>

            {/* Cover Images Section */}
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                Cover & Story Images
              </h3>
              
              <div className="flex items-center space-x-2 mb-3">
                <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition shadow-md">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Images
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImages}
                  />
                </label>
                {uploadingImages && <span className="text-sm text-blue-600 font-medium">Uploading...</span>}
              </div>

              {formData.imageUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {formData.imageUrls.map((url, idx) => (
                    <div key={idx} className="relative group">
                      <img 
                        src={url.startsWith('http') ? url : `http://localhost:8080${url}`} 
                        alt="" 
                        className="w-full h-32 object-cover rounded-lg border-2 border-blue-200 group-hover:border-blue-400 transition" 
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 opacity-0 group-hover:opacity-100 transition shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Characters Tab */}
        {activeTab === 'characters' && (
          <div className="space-y-3 sm:space-y-4 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-3 sm:mb-4">
              <h3 className="text-lg sm:text-xl font-bold text-purple-900 flex items-center">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                Manage Characters ({formData.characters.length})
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowAllCharacters(!showAllCharacters)}
                  className="flex-1 sm:flex-initial bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center shadow-md transition text-xs sm:text-sm"
                >
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  {showAllCharacters ? 'Hide' : 'View All'}
                </button>
                <button
                  type="button"
                  onClick={addCharacter}
                  className="flex-1 sm:flex-initial bg-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center justify-center shadow-md transition text-xs sm:text-sm"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Add Character
                </button>
              </div>
            </div>

            {/* Search and Filter Controls */}
            {formData.characters.length > 0 && (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 bg-purple-50 p-2 sm:p-3 rounded-lg">
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by character or actor name..."
                    value={characterSearchQuery}
                    onChange={(e) => setCharacterSearchQuery(e.target.value)}
                    className="w-full pl-8 sm:pl-10 pr-8 sm:pr-10 py-2 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition text-xs sm:text-sm"
                  />
                  {characterSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setCharacterSearchQuery('')}
                      className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-600"
                    >
                      <X className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  )}
                </div>

                {/* Filter Dropdown Menu */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                    className={`w-full sm:w-auto p-2 rounded-lg transition flex items-center justify-center gap-2 ${
                      characterFilter !== 'none'
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'bg-white text-purple-700 hover:bg-purple-100 border-2 border-purple-200'
                    }`}
                    title="Sort options"
                  >
                    <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-xs sm:text-sm font-medium sm:hidden">
                      {characterFilter === 'character-az' ? 'Character A-Z' : 
                       characterFilter === 'actor-az' ? 'Actor A-Z' : 'Sort'}
                    </span>
                  </button>

                  {showFilterMenu && (
                    <div className="absolute right-0 top-12 bg-white border-2 border-purple-200 rounded-lg shadow-lg z-10 min-w-[200px]">
                      <div className="p-2 space-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            setCharacterFilter('character-az');
                            setShowFilterMenu(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition flex items-center ${
                            characterFilter === 'character-az'
                              ? 'bg-purple-600 text-white'
                              : 'text-purple-700 hover:bg-purple-50'
                          }`}
                        >
                          <SortAsc className="w-4 h-4 mr-2" />
                          Character Name A-Z
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCharacterFilter('actor-az');
                            setShowFilterMenu(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition flex items-center ${
                            characterFilter === 'actor-az'
                              ? 'bg-purple-600 text-white'
                              : 'text-purple-700 hover:bg-purple-50'
                          }`}
                        >
                          <SortAsc className="w-4 h-4 mr-2" />
                          Actor Name A-Z
                        </button>
                        {characterFilter !== 'none' && (
                          <button
                            type="button"
                            onClick={() => {
                              setCharacterFilter('none');
                              setShowFilterMenu(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-md text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 transition flex items-center"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Clear Sort
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {formData.characters.length === 0 ? (
              <div className="text-center py-12 bg-purple-50 rounded-lg border-2 border-dashed border-purple-300">
                <Users className="w-16 h-16 text-purple-300 mx-auto mb-3" />
                <p className="text-purple-600 font-medium">No characters yet</p>
                <p className="text-purple-500 text-sm mt-1">Add characters to bring your story to life</p>
              </div>
            ) : showAllCharacters ? (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {getFilteredAndSortedCharacters().map(({ char, index }) => (
                  <div
                    key={index}
                    onClick={() => { setShowAllCharacters(false); setExpandedCharacters(new Set([index])); }}
                    className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-4 shadow-sm hover:shadow-lg hover:border-purple-400 transition cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                        #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeCharacter(index); }}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 p-1 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-purple-900 text-lg truncate">
                        {char.name || 'Unnamed Character'}
                      </p>
                      {char.actorName && (
                        <p className="text-sm text-purple-700 flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          Actor: {char.actorName}
                        </p>
                      )}
                      {char.role && (
                        <p className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded inline-block">
                          {char.role}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {getFilteredAndSortedCharacters().map(({ char, index }) => {
                  const isExpanded = expandedCharacters.has(index);
                  return (
                  <div key={index} className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg shadow-sm hover:shadow-md transition">
                    <div className="flex justify-between items-center p-2 sm:p-3 cursor-pointer" onClick={() => toggleCharacter(index)}>
                      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <span className="bg-purple-600 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap">
                          #{index + 1}
                        </span>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-semibold text-purple-900 text-sm sm:text-base truncate">{char.name || 'Unnamed Character'}</span>
                          {char.actorName && (
                            <span className="text-xs sm:text-sm text-purple-600 flex items-center truncate">
                              <Users className="w-3 h-3 mr-1 flex-shrink-0" />
                              <span className="truncate">Actor: {char.actorName}</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); removeCharacter(index); }}
                          className="text-red-500 hover:text-red-600 hover:bg-red-50 p-1 rounded transition"
                        >
                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        {isExpanded ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />}
                      </div>
                    </div>

                    <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: isExpanded ? '1000px' : '0' }}>
                      <div className="p-3 sm:p-4 pt-0 space-y-2 sm:space-y-3">
                        <input
                          type="text"
                          placeholder="Character Name *"
                          value={char.name}
                          onChange={(e) => updateCharacter(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-semibold text-sm sm:text-base"
                          required
                        />

                        <input
                          type="text"
                          placeholder="Actor Name (who plays this role)"
                          value={char.actorName || ''}
                          onChange={(e) => updateCharacter(index, 'actorName', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                        />

                        <input
                          type="text"
                          placeholder="Role (e.g., Protagonist, Villain)"
                          value={char.role}
                          onChange={(e) => updateCharacter(index, 'role', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                        />

                        <textarea
                          placeholder="Character Description"
                          value={char.description}
                          onChange={(e) => updateCharacter(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm sm:text-base"
                          rows={3}
                        />

                        {/* Character Image Upload */}
                        <div className="space-y-2">
                          <label className="block text-xs sm:text-sm font-semibold text-purple-900">
                            Character Image
                          </label>
                          {char.imageUrl ? (
                            <div className="relative inline-block">
                              <img
                                src={char.imageUrl.startsWith('http') ? char.imageUrl : `http://localhost:8080${char.imageUrl}`}
                                alt={char.name}
                                className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg border-2 border-purple-300"
                              />
                              <button
                                type="button"
                                onClick={() => removeCharacterImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                              >
                                <X className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <label className="cursor-pointer bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 sm:px-4 py-2 rounded-lg flex items-center transition text-xs sm:text-sm">
                                <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                                {uploadingCharacterImage === index ? 'Uploading...' : 'Upload Image'}
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleCharacterImageUpload(e, index)}
                                  className="hidden"
                                  disabled={uploadingCharacterImage === index}
                                />
                              </label>
                            </div>
                          )}
                        </div>

                        {/* Add/Update Character Buttons */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2 border-t-2 border-purple-200">
                          {char.id ? (
                            <button
                              type="button"
                              onClick={() => updateCharacterToGlobal(index)}
                              className="flex-1 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center shadow-md transition text-xs sm:text-sm"
                            >
                              <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                              Update Character
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => saveCharacterToGlobal(index)}
                              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center shadow-md transition"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Add Character
                            </button>
                          )}
                        </div>

                        {/* Inline Status Message */}
                        {characterSaveStatus[index] && (
                          <div className={`mt-2 p-2 rounded-lg text-sm font-medium flex items-center ${
                            characterSaveStatus[index]?.type === 'success' 
                              ? 'bg-green-100 text-green-800 border border-green-300' 
                              : 'bg-red-100 text-red-800 border border-red-300'
                          }`}>
                            {characterSaveStatus[index]?.type === 'success' ? (
                              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                            )}
                            {characterSaveStatus[index]?.message}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Timeline/Write Story Tab */}
        {activeTab === 'timeline' && (
          <div className="animate-fadeIn">
            <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-r-lg mb-4">
              <h3 className="font-semibold text-green-900 mb-2 flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Build Your Story Timeline
              </h3>
              <p className="text-green-700 text-sm">
                Create a sequence of events with characters and images. The timeline will automatically generate your complete story.
              </p>
            </div>

            <TimelineManager
              timeline={timeline}
              onChange={handleTimelineChange}
              availableCharacters={formData.characters}
              onAddCharacter={handleAddCharacterFromTimeline}
            />
          </div>
        )}

        {/* Preview Tab */}
        {activeTab === 'preview' && (() => {
          const sortedTimeline = [...timeline].sort((a, b) => a.order - b.order);
          
          // Dynamic pagination based on scene content length and screen size
          const calculateReaderPages = () => {
            const maxScenesPerPage = Math.min(readerScenesPerPage, getMaxScenesForScreen());
            const MAX_CHARS_PER_PAGE = screenSize.height < 800 ? 3000 : 4000; // Increased for more content
            const MAX_LINES_PER_PAGE = screenSize.height < 800 ? 40 : 60; // Increased for more content
            let currentPage: any[] = [];
            let currentLength = 0;
            let currentLines = 0;
            const pages: any[][] = [];
            
            sortedTimeline.forEach(scene => {
              const sceneLength = (scene.description || '').length;
              const sceneLines = Math.ceil(sceneLength / 80); // Approximate lines (80 chars per line)
              
              // Check if adding this scene exceeds limits OR max scenes per page
              if ((
                currentLength + sceneLength > MAX_CHARS_PER_PAGE || 
                currentLines + sceneLines > MAX_LINES_PER_PAGE ||
                currentPage.length >= maxScenesPerPage
              ) && currentPage.length > 0) {
                pages.push(currentPage);
                currentPage = [scene];
                currentLength = sceneLength;
                currentLines = sceneLines;
              } else {
                currentPage.push(scene);
                currentLength += sceneLength;
                currentLines += sceneLines;
              }
            });
            if (currentPage.length > 0) pages.push(currentPage);
            return pages.length > 0 ? pages : [sortedTimeline]; // Fallback to all scenes if no pages
          };
          
          // Dynamic pagination for reader and writer modes
          let paginatedScenes, totalPreviewPages, effectiveScenesPerPage;
          if (writerMode) {
            effectiveScenesPerPage = Math.min(customScenesPerPage, getMaxScenesForScreen());
            totalPreviewPages = Math.ceil(sortedTimeline.length / effectiveScenesPerPage);
            paginatedScenes = sortedTimeline.slice(
              previewPage * effectiveScenesPerPage,
              (previewPage + 1) * effectiveScenesPerPage
            );
          } else {
            const readerPages = calculateReaderPages();
            totalPreviewPages = readerPages.length;
            paginatedScenes = readerPages[previewPage] || [];
            effectiveScenesPerPage = paginatedScenes.length;
          }

          // Cast pagination
          const totalCastPages = Math.ceil(formData.characters.length / CAST_PER_PAGE);
          const paginatedCast = formData.characters.slice(
            castPage * CAST_PER_PAGE,
            (castPage + 1) * CAST_PER_PAGE
          );

          return (
            <div className="space-y-4 animate-fadeIn">
              {/* Preview Header with Mode Toggle */}
              <div className="bg-orange-50 border-l-4 border-orange-600 p-3 sm:p-4 rounded-r-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-orange-900 mb-1 sm:mb-2 flex items-center text-sm sm:text-base">
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                      <span className="truncate">Story Preview - {writerMode ? 'Writer' : 'Reader'}</span>
                    </h3>
                    <p className="text-orange-700 text-xs sm:text-sm line-clamp-2">
                      {writerMode ? 'See characters, images, and highlighted names' : 'Clean reading experience with highlighted character names'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setWriterMode(!writerMode);
                      setPreviewPage(0);
                    }}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition flex items-center justify-center space-x-2 whitespace-nowrap flex-shrink-0 ${
                      writerMode
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-gray-600 text-white hover:bg-gray-700'
                    }`}
                  >
                    {writerMode ? (
                      <>
                        <Eye className="w-4 h-4" />
                        <span>Writer</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-4 h-4" />
                        <span>Reader</span>
                      </>
                    )}
                  </button>
                </div>
                
                {/* Writer Mode: Scenes Per Page Control */}
                {writerMode && (
                  <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3 bg-purple-50 px-3 py-2 rounded-lg border border-purple-200">
                    <label className="text-xs sm:text-sm font-semibold text-purple-900 whitespace-nowrap">Scenes per page:</label>
                    <div className="flex items-center justify-between xs:justify-start gap-2">
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setCustomScenesPerPage(Math.max(MIN_SCENES_PER_PAGE, customScenesPerPage - 1))}
                          className="px-2 sm:px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition text-sm font-bold"
                        >
                          -
                        </button>
                        <span className="px-2 sm:px-3 py-1 bg-white border border-purple-300 rounded font-bold text-purple-900 min-w-[40px] text-center text-sm sm:text-base">
                          {Math.min(customScenesPerPage, getMaxScenesForScreen())}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCustomScenesPerPage(Math.min(MAX_SCENES_PER_PAGE_WRITER, customScenesPerPage + 1))}
                          className="px-2 sm:px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition text-sm font-bold"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xs text-purple-600 whitespace-nowrap">(range: {MIN_SCENES_PER_PAGE}-{Math.min(MAX_SCENES_PER_PAGE_WRITER, getMaxScenesForScreen())})</span>
                    </div>
                  </div>
                )}
                
                {/* Reader Mode: Scenes Per Page Control */}
                {!writerMode && (
                  <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                    <label className="text-xs sm:text-sm font-semibold text-gray-900 whitespace-nowrap">Scenes per page:</label>
                    <div className="flex items-center justify-between xs:justify-start gap-2">
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setReaderScenesPerPage(Math.max(MIN_SCENES_PER_PAGE, readerScenesPerPage - 1));
                            setPreviewPage(0);
                          }}
                          className="px-2 sm:px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition text-sm font-bold"
                        >
                          -
                        </button>
                        <span className="px-2 sm:px-3 py-1 bg-white border border-gray-300 rounded font-bold text-gray-900 min-w-[40px] text-center text-sm sm:text-base">
                          {Math.min(readerScenesPerPage, getMaxScenesForScreen())}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setReaderScenesPerPage(Math.min(MAX_SCENES_PER_PAGE_READER, readerScenesPerPage + 1));
                            setPreviewPage(0);
                          }}
                          className="px-2 sm:px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition text-sm font-bold"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xs text-gray-600 whitespace-nowrap">(range: {MIN_SCENES_PER_PAGE}-{Math.min(MAX_SCENES_PER_PAGE_READER, getMaxScenesForScreen())})</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Story Header */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-xl shadow-lg">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">{formData.title || 'Untitled Story'}</h1>
                {formData.description && (
                  <p className="text-purple-100 text-base sm:text-lg">{formData.description}</p>
                )}
              </div>

              {/* Cover Images */}
              {formData.imageUrls.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  {formData.imageUrls.map((url, idx) => (
                    <img
                      key={idx}
                      src={url.startsWith('http') ? url : `http://localhost:8080${url}`}
                      alt={`Cover ${idx + 1}`}
                      className="w-full h-32 sm:h-48 object-cover rounded-lg shadow-md hover:shadow-xl transition cursor-pointer"
                      onClick={() => window.open(url.startsWith('http') ? url : `http://localhost:8080${url}`, '_blank')}
                    />
                  ))}
                </div>
              )}

              {/* Characters List - Only in Writer Mode - Compact with Pagination */}
              {writerMode && formData.characters.length > 0 && (
                <div className="bg-purple-50 p-2 sm:p-3 rounded-lg border border-purple-300">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-purple-900 flex items-center text-xs sm:text-sm">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
                      Cast ({formData.characters.length})
                      {totalCastPages > 1 && (
                        <span className="ml-1 sm:ml-2 text-xs text-purple-600">
                          ({castPage + 1}/{totalCastPages})
                        </span>
                      )}
                    </h4>
                    {totalCastPages > 1 && (
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => setCastPage(Math.max(0, castPage - 1))}
                          disabled={castPage === 0}
                          className="p-1 rounded hover:bg-purple-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
                        >
                          <ChevronLeft className="w-3 h-3 text-purple-700" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCastPage(Math.min(totalCastPages - 1, castPage + 1))}
                          disabled={castPage === totalCastPages - 1}
                          className="p-1 rounded hover:bg-purple-200 disabled:opacity-30 disabled:cursor-not-allowed transition"
                        >
                          <ChevronRight className="w-3 h-3 text-purple-700" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 sm:gap-1.5">
                    {paginatedCast.map((char, idx) => {
                      const color = getCharacterColor(char.name, getAllCharacterNames(formData.characters));
                      return (
                        <span
                          key={idx}
                          className={`${color.bg} ${color.text} px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-semibold border ${color.border} inline-flex flex-col`}
                          title={`${char.name}${char.actorName ? ` - ${char.actorName}` : ''}${char.role ? ` (${char.role})` : ''}`}
                        >
                          <span className="font-bold truncate max-w-[100px] sm:max-w-none">{char.name}</span>
                          {char.actorName && (
                            <span className="text-xs opacity-80 font-normal truncate max-w-[100px] sm:max-w-none">{char.actorName}</span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Unified Beautiful Search & Navigation */}
              {totalPreviewPages > 1 && (
                <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-purple-50 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 lg:py-5 rounded-xl border-2 border-purple-200 shadow-lg">
                  <div className="flex flex-col gap-3 sm:gap-4">
                    {/* Search Bar with Autocomplete */}
                    <div className="relative">
                      <div className="flex items-center gap-2 bg-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-2 border-purple-300 shadow-md hover:border-purple-400 transition-all">
                        <Search className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 flex-shrink-0" />
                        <input
                          type="text"
                          placeholder="Search by page #, scene #, or scene title..."
                          value={sceneSearchQuery}
                          onChange={(e) => {
                            setSceneSearchQuery(e.target.value);
                            setShowSearchSuggestions(e.target.value.trim().length > 0);
                          }}
                          onFocus={() => {
                            if (sceneSearchQuery.trim().length > 0) {
                              setShowSearchSuggestions(true);
                            }
                          }}
                          onBlur={() => {
                            // Delay to allow clicking suggestions
                            setTimeout(() => setShowSearchSuggestions(false), 200);
                          }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const query = sceneSearchQuery.trim();
                              if (!query) return;

                              const numericValue = parseInt(query);
                              
                              // Check if it's a page number
                              if (!isNaN(numericValue) && numericValue >= 1 && numericValue <= totalPreviewPages) {
                                setPreviewPage(numericValue - 1);
                                setSceneSearchQuery('');
                                setShowSearchSuggestions(false);
                                return;
                              }
                              
                              // Check if it's a scene number
                              if (!isNaN(numericValue) && numericValue >= 1 && numericValue <= sortedTimeline.length) {
                                const targetPage = Math.floor((numericValue - 1) / effectiveScenesPerPage);
                                setPreviewPage(targetPage);
                                setSceneSearchQuery('');
                                setShowSearchSuggestions(false);
                                return;
                              }
                              
                              // Search by scene title
                              const foundIndex = sortedTimeline.findIndex(scene => 
                                scene.event && scene.event.toLowerCase().includes(query.toLowerCase())
                              );
                              
                              if (foundIndex !== -1) {
                                const targetPage = Math.floor(foundIndex / effectiveScenesPerPage);
                                setPreviewPage(targetPage);
                                setSceneSearchQuery('');
                                setShowSearchSuggestions(false);
                              } else {
                                alert(`No page, scene, or title matching "${query}" was found.`);
                              }
                            }
                          }}
                          className="flex-1 text-xs sm:text-sm md:text-base focus:outline-none bg-transparent placeholder:text-xs sm:placeholder:text-sm"
                        />
                        {sceneSearchQuery && (
                          <button
                            type="button"
                            onClick={() => {
                              setSceneSearchQuery('');
                              setShowSearchSuggestions(false);
                            }}
                            className="p-1 hover:bg-purple-100 rounded-full transition-colors"
                          >
                            <X className="w-4 h-4 text-gray-500" />
                          </button>
                        )}
                      </div>

                      {/* Autocomplete Suggestions Dropdown */}
                      {showSearchSuggestions && sceneSearchQuery.trim().length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-purple-300 rounded-lg shadow-2xl z-50 max-h-80 overflow-y-auto">
                          {(() => {
                            const query = sceneSearchQuery.trim().toLowerCase();
                            const numericValue = parseInt(sceneSearchQuery.trim());
                            const suggestions: JSX.Element[] = [];

                            // Page number suggestion
                            if (!isNaN(numericValue) && numericValue >= 1 && numericValue <= totalPreviewPages) {
                              suggestions.push(
                                <button
                                  key="page-suggestion"
                                  type="button"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    setPreviewPage(numericValue - 1);
                                    setSceneSearchQuery('');
                                    setShowSearchSuggestions(false);
                                  }}
                                  className="w-full px-4 py-3 flex items-start gap-3 hover:bg-blue-50 transition-colors text-left border-b border-gray-100"
                                >
                                  <BookOpen className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <div className="font-semibold text-blue-900">Go to Page {numericValue}</div>
                                    <div className="text-xs text-blue-600 mt-0.5">Jump directly to this page</div>
                                  </div>
                                </button>
                              );
                            }

                            // Scene number suggestion
                            if (!isNaN(numericValue) && numericValue >= 1 && numericValue <= sortedTimeline.length) {
                              const targetScene = sortedTimeline[numericValue - 1];
                              const targetPage = Math.floor((numericValue - 1) / effectiveScenesPerPage);
                              suggestions.push(
                                <button
                                  key="scene-number-suggestion"
                                  type="button"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    setPreviewPage(targetPage);
                                    setSceneSearchQuery('');
                                    setShowSearchSuggestions(false);
                                  }}
                                  className="w-full px-4 py-3 flex items-start gap-3 hover:bg-green-50 transition-colors text-left border-b border-gray-100"
                                >
                                  <div className="flex-shrink-0 mt-0.5 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                    {numericValue}
                                  </div>
                                  <div>
                                    <div className="font-semibold text-green-900">Go to Scene {numericValue}</div>
                                    {targetScene?.event && (
                                      <div className="text-xs text-green-700 mt-0.5 line-clamp-1">{targetScene.event}</div>
                                    )}
                                    <div className="text-xs text-green-600 mt-0.5">On page {targetPage + 1}</div>
                                  </div>
                                </button>
                              );
                            }

                            // Scene title suggestions
                            const titleMatches = sortedTimeline
                              .map((scene, idx) => ({ scene, idx }))
                              .filter(({ scene }) => scene.event && scene.event.toLowerCase().includes(query))
                              .slice(0, 5);

                            titleMatches.forEach(({ scene, idx }) => {
                              const targetPage = Math.floor(idx / effectiveScenesPerPage);
                              suggestions.push(
                                <button
                                  key={`title-${idx}`}
                                  type="button"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    setPreviewPage(targetPage);
                                    setSceneSearchQuery('');
                                    setShowSearchSuggestions(false);
                                  }}
                                  className="w-full px-4 py-3 flex items-start gap-3 hover:bg-purple-50 transition-colors text-left border-b border-gray-100 last:border-b-0"
                                >
                                  <Eye className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                  <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-purple-900 line-clamp-1">{scene.event}</div>
                                    {scene.description && (
                                      <div className="text-xs text-purple-600 mt-1 line-clamp-2">{scene.description.substring(0, 120)}...</div>
                                    )}
                                    <div className="text-xs text-purple-500 mt-1">Scene {idx + 1} • Page {targetPage + 1}</div>
                                  </div>
                                </button>
                              );
                            });

                            return suggestions.length > 0 ? suggestions : (
                              <div className="px-4 py-6 text-center text-gray-500 text-sm">
                                No matching pages or scenes found
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>

                    {/* Navigation Bar */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-3">
                      {/* Page Info */}
                      <div className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-white rounded-lg border border-purple-200 shadow-sm">
                        <span className="text-xs sm:text-sm font-semibold text-purple-900 whitespace-nowrap">
                          Page {previewPage + 1} of {totalPreviewPages}
                        </span>
                        <span className="text-xs text-purple-600 whitespace-nowrap">
                          ({effectiveScenesPerPage} scene{effectiveScenesPerPage !== 1 ? 's' : ''})
                        </span>
                      </div>

                      {/* Navigation Buttons */}
                      <div className="flex items-center justify-center gap-1 sm:gap-2">
                        <button
                          type="button"
                          onClick={() => setPreviewPage(0)}
                          disabled={previewPage === 0}
                          className="p-1.5 sm:p-2 bg-white border-2 border-purple-300 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-purple-50 hover:border-purple-400 transition-all shadow-sm"
                          title="First Page"
                        >
                          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-purple-700" strokeWidth={3} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewPage(Math.max(0, previewPage - 1))}
                          disabled={previewPage === 0}
                          className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-white border-2 border-purple-300 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-purple-50 hover:border-purple-400 transition-all flex items-center gap-1 font-semibold text-purple-700 shadow-sm text-xs sm:text-sm"
                        >
                          <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span className="hidden sm:inline">Previous</span>
                          <span className="sm:hidden">Prev</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewPage(Math.min(totalPreviewPages - 1, previewPage + 1))}
                          disabled={previewPage === totalPreviewPages - 1}
                          className="px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 bg-white border-2 border-purple-300 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-purple-50 hover:border-purple-400 transition-all flex items-center gap-1 font-semibold text-purple-700 shadow-sm text-xs sm:text-sm"
                        >
                          <span className="hidden sm:inline">Next</span>
                          <span className="sm:hidden">Next</span>
                          <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewPage(totalPreviewPages - 1)}
                          disabled={previewPage === totalPreviewPages - 1}
                          className="p-1.5 sm:p-2 bg-white border-2 border-purple-300 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-purple-50 hover:border-purple-400 transition-all shadow-sm"
                          title="Last Page"
                        >
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-purple-700" strokeWidth={3} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Story Content - Book-like Reading Experience */}
              <div className={`rounded-lg shadow-2xl overflow-hidden ${
                writerMode ? 'bg-white border-2 border-gray-200' : 'bg-amber-50 border-2 border-amber-200'
              }`}>
                {paginatedScenes.length === 0 ? (
                  <div className="p-12 text-center">
                    <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No scenes yet. Go to "Write Story" tab to add timeline entries.</p>
                  </div>
                ) : (
                  <div className={`overflow-auto ${
                    writerMode ? 'p-6 sm:p-10 max-w-4xl mx-auto' : 'p-8 sm:p-12 md:p-16 max-w-5xl mx-auto'
                  }`} style={{ maxHeight: writerMode ? 'none' : '800px' }}>
                    {/* Continuous Reading Flow - Book-like Layout */}
                    <div className={writerMode ? "prose prose-lg max-w-none" : "max-w-none"}>
                      {paginatedScenes.map((entry, idx) => {
                        const actualSceneNumber = writerMode 
                          ? previewPage * effectiveScenesPerPage + idx + 1
                          : sortedTimeline.findIndex(s => s.id === entry.id) + 1;
                        const allCharNames = getAllCharacterNames(formData.characters);
                        
                        return (
                          <div key={entry.id} className={writerMode ? "mb-8 last:mb-0" : "mb-6 last:mb-0"}>
                            {/* Small Scene Header - ONLY in Writer Mode */}
                            {writerMode && (
                              <div className="mb-3 flex items-center justify-between border-b border-gray-200 pb-2">
                                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                                  Scene {actualSceneNumber}: {entry.event || `Untitled`}
                                </h4>
                                
                                {/* Writer Mode: Inline Character Badges */}
                                {entry.characters.length > 0 && (
                                  <div className="flex flex-wrap gap-1 items-center">
                                    {entry.characters.map((charName, cIdx) => {
                                      const color = getCharacterColor(charName, allCharNames);
                                      return (
                                        <span
                                          key={cIdx}
                                          className={`${color.bg} ${color.text} px-2 py-0.5 rounded-full text-xs font-semibold border ${color.border}`}
                                        >
                                          {charName}
                                        </span>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Scene Description - Book Paragraph Style */}
                            <div className={writerMode 
                              ? `${getTextSizeClass()} text-gray-900 mb-6 font-serif whitespace-pre-wrap`
                              : `text-justify ${getTextSizeClass()} text-gray-800 mb-4 font-serif whitespace-pre-wrap`
                            } style={{ 
                              wordWrap: 'break-word',
                              overflowWrap: 'break-word',
                              wordBreak: 'break-word'
                            }}>
                              {entry.description ? (
                                (() => {
                                  // Split description into paragraphs for better readability
                                  const paragraphs = entry.description.split(/\n\n+/);
                                  return paragraphs.map((paragraph, pIdx) => (
                                    <p key={pIdx} className={!writerMode && pIdx > 0 ? "indent-8 mt-4" : pIdx > 0 ? "mt-4" : writerMode ? "" : "indent-8"}>
                                      {paragraph.split(new RegExp(`\\b(${entry.characters.join('|')})\\b`, 'gi')).map((part, i) => {
                                        const isCharacter = entry.characters.some(c => c.toLowerCase() === part.toLowerCase());
                                        if (isCharacter && part.trim()) {
                                          const matchedChar = entry.characters.find(c => c.toLowerCase() === part.toLowerCase()) || part;
                                          const color = getCharacterColor(matchedChar, allCharNames);
                                          return (
                                            <span
                                              key={i}
                                              style={{ color: color.hex }}
                                              className="font-bold not-italic"
                                            >
                                              {part}
                                            </span>
                                          );
                                        }
                                        return <span key={i}>{part}</span>;
                                      })}
                                    </p>
                                  ));
                                })()
                              ) : (
                                <span className="text-gray-400 italic text-base">No description for this scene</span>
                              )}
                            </div>

                            {/* Scene Images - Both Modes (Book-style for reader) */}
                            {entry.imageUrls.length > 0 && (
                              <div className={writerMode 
                                ? "mb-6 pl-4 border-l-4 border-gray-200"
                                : "mb-8 flex justify-center items-center"
                              }>
                                <div className={writerMode
                                  ? "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2"
                                  : "grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl"
                                }>
                                  {entry.imageUrls.map((url, imgIdx) => (
                                    <div key={imgIdx} className="relative group">
                                      <img
                                        src={`http://localhost:8080${url}`}
                                        alt={`Scene ${actualSceneNumber} - Image ${imgIdx + 1}`}
                                        className={writerMode
                                          ? "w-full h-16 sm:h-20 object-cover rounded border border-gray-300 group-hover:border-purple-500 transition cursor-pointer shadow-sm group-hover:shadow-md"
                                          : "w-full h-48 sm:h-64 object-cover rounded-lg border-2 border-amber-300 shadow-lg group-hover:shadow-2xl transition cursor-pointer"
                                        }
                                        onClick={() => window.open(`http://localhost:8080${url}`, '_blank')}
                                      />
                                      {!writerMode && (
                                        <div className="text-center mt-2 text-sm italic text-gray-600">
                                          Image {imgIdx + 1}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Pagination */}
              {totalPreviewPages > 1 && (
                <div className="flex items-center justify-center space-x-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setPreviewPage(0)}
                    disabled={previewPage === 0}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                  >
                    First
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewPage(Math.max(0, previewPage - 1))}
                    disabled={previewPage === 0}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition flex items-center"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <div className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold">
                    {previewPage + 1} / {totalPreviewPages}
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewPage(Math.min(totalPreviewPages - 1, previewPage + 1))}
                    disabled={previewPage === totalPreviewPages - 1}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition flex items-center"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewPage(totalPreviewPages - 1)}
                    disabled={previewPage === totalPreviewPages - 1}
                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                  >
                    Last
                  </button>
                </div>
              )}
            </div>
          );
        })()}

        {/* Form Actions */}
        <div className="space-y-4 mt-8 pt-6 border-t-2 border-gray-200">
          {/* Publish Toggle */}
          <div className="flex items-center justify-between bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border-2 border-green-200">
            <div className="flex items-center space-x-3">
              <Eye className="w-6 h-6 text-green-600" />
              <div>
                <h4 className="font-bold text-gray-900">Publish Status</h4>
                <p className="text-sm text-gray-600">
                  {formData.isPublished ? 'Story is visible to all users' : 'Story is saved as draft'}
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isPublished || false}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              disabled={loading || !formData.title.trim()}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 sm:py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-base sm:text-lg shadow-lg"
              title={!formData.title.trim() ? 'Story title is required' : ''}
            >
              {loading ? 'Saving...' : storyId ? '💾 Update Story' : '✨ Create Story'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition font-semibold text-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default StoryForm;
