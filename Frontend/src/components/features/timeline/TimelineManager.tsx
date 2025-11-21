import { useState, useMemo, useRef, useEffect } from 'react';
import { Plus, Trash2, Upload, X, ChevronDown, ChevronUp, Users, Image as ImageIcon, Search, Edit2, Check, XCircle, ChevronLeft, ChevronRight, Film, Eye, EyeOff, Music, Video } from 'lucide-react';
import { getCharacterColor, getAllCharacterNames } from '../../../utils/characterColors';

interface Character {
  id?: string;
  name: string;
  description: string;
  role: string;
  actorName?: string;
  popularity?: number;
}

interface TimelineEntry {
  id: string;
  event: string;
  description: string;
  characters: string[]; // character names
  imageUrls: string[];
  videoUrls?: string[];
  audioUrls?: string[];
  order: number;
}

interface TimelineManagerProps {
  timeline: TimelineEntry[];
  onChange: (timeline: TimelineEntry[]) => void;
  availableCharacters: Character[];
  onAddCharacter: (character: Character) => void;
}

const TimelineManager = ({ timeline, onChange, availableCharacters, onAddCharacter }: TimelineManagerProps) => {
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  const [showCharacters, setShowCharacters] = useState(false);
  const [showNewCharacterForm, setShowNewCharacterForm] = useState<string | null>(null);
  const [uploadingImages, setUploadingImages] = useState<string | null>(null);
  const [uploadingVideos, setUploadingVideos] = useState<string | null>(null);
  const [uploadingAudio, setUploadingAudio] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSceneIndex, setActiveSceneIndex] = useState<number | null>(null);
  const [editingSceneNumber, setEditingSceneNumber] = useState<string | null>(null);
  const [newSceneNumber, setNewSceneNumber] = useState('');
  const [draggedSceneIndex, setDraggedSceneIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [timelineBarPage, setTimelineBarPage] = useState(0);
  const [editingTimelineSceneId, setEditingTimelineSceneId] = useState<string | null>(null);
  const [timelineSceneNumber, setTimelineSceneNumber] = useState('');
  const [quickJumpValue, setQuickJumpValue] = useState('');
  const [hiddenScenes, setHiddenScenes] = useState<Set<string>>(new Set());
  const [manuallySetActive, setManuallySetActive] = useState(false);
  const [sceneVisibilityFilter, setSceneVisibilityFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [currentScenePage, setCurrentScenePage] = useState(0);
  const [scenesPerPageList, setScenesPerPageList] = useState(10);
  const [showPreview, setShowPreview] = useState(false);
  
  // Dynamic scenes per page based on screen width
  const [scenesPerPage, setScenesPerPage] = useState(10);
  
  useEffect(() => {
    const updateScenesPerPage = () => {
      const width = window.innerWidth;
      if (width < 640) setScenesPerPage(5); // mobile
      else if (width < 768) setScenesPerPage(7); // tablet
      else if (width < 1024) setScenesPerPage(8); // small desktop
      else setScenesPerPage(10); // large desktop - max 10
    };
    
    updateScenesPerPage();
    window.addEventListener('resize', updateScenesPerPage);
    return () => window.removeEventListener('resize', updateScenesPerPage);
  }, []);
  
  const SCENES_PER_PAGE = scenesPerPage;
  const timelineBarRef = useRef<HTMLDivElement>(null);
  const sceneRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [newCharacter, setNewCharacter] = useState<Character>({
    name: '',
    description: '',
    role: '',
    actorName: '',
    popularity: undefined
  });

  // Get all character names for color assignment
  const allCharacterNames = useMemo(() => getAllCharacterNames(availableCharacters), [availableCharacters]);

  // Filter timeline entries based on search query
  const filteredTimeline = useMemo(() => {
    let filtered = timeline;
    
    // Apply visibility filter
    if (sceneVisibilityFilter === 'visible') {
      filtered = filtered.filter(entry => !hiddenScenes.has(entry.id));
    } else if (sceneVisibilityFilter === 'hidden') {
      filtered = filtered.filter(entry => hiddenScenes.has(entry.id));
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((entry, index) => {
        const sceneNumber = (index + 1).toString();
        const eventTitle = entry.event.toLowerCase();
        const description = entry.description.toLowerCase();
        
        return sceneNumber.includes(query) || 
               eventTitle.includes(query) || 
               description.includes(query);
      });
    }
    
    return filtered;
  }, [timeline, searchQuery, sceneVisibilityFilter, hiddenScenes]);

  // Paginate filtered timeline
  const totalScenePages = Math.ceil(filteredTimeline.length / scenesPerPageList);
  const paginatedScenes = useMemo(() => {
    const start = currentScenePage * scenesPerPageList;
    const end = start + scenesPerPageList;
    return filteredTimeline.slice(start, end);
  }, [filteredTimeline, currentScenePage, scenesPerPageList]);

  const goToSceneListPage = (page: number) => {
    setCurrentScenePage(Math.max(0, Math.min(page, totalScenePages - 1)));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Scroll to scene when clicked in timeline bar
  const scrollToScene = (entryId: string, index: number) => {
    setActiveSceneIndex(index);
    setManuallySetActive(true);
    // Navigate timeline bar to the correct page
    goToScenePage(index);
    // Scroll timeline bar to show the scene card
    setTimeout(() => {
      if (timelineBarRef.current) {
        const cardWidth = window.innerWidth < 640 ? 112 : window.innerWidth < 768 ? 144 : 176;
        const spacing = window.innerWidth < 640 ? 8 : 12;
        const indexInPage = index % SCENES_PER_PAGE;
        const scrollPosition = indexInPage * (cardWidth + spacing);
        timelineBarRef.current.scrollTo({ left: scrollPosition, behavior: 'smooth' });
      }
    }, 100);
    // Scroll to the scene in main content
    const element = sceneRefs.current[entryId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Expand the scene
      setExpandedEntries(new Set([entryId]));
    }
  };

  // Update active scene on scroll
  useEffect(() => {
    const handleScroll = () => {
      // Clear any existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Don't auto-update if user manually selected a scene
      if (manuallySetActive) {
        // Set a timeout to reset manual flag after user stops scrolling for 2 seconds
        scrollTimeoutRef.current = setTimeout(() => {
          // Only reset if user has scrolled significantly away from the selected scene
          if (activeSceneIndex !== null) {
            const selectedElement = sceneRefs.current[timeline[activeSceneIndex]?.id];
            if (selectedElement) {
              const rect = selectedElement.getBoundingClientRect();
              // If the selected scene is far from viewport, allow auto-update
              if (Math.abs(rect.top - 200) > 500) {
                setManuallySetActive(false);
              }
            }
          }
        }, 2000);
        return;
      }
      
      let closestIndex = 0;
      let closestDistance = Infinity;
      
      timeline.forEach((entry, index) => {
        const element = sceneRefs.current[entry.id];
        if (element) {
          const rect = element.getBoundingClientRect();
          const distance = Math.abs(rect.top - 200); // 200px from top
          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        }
      });
      
      setActiveSceneIndex(closestIndex);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [timeline, manuallySetActive, activeSceneIndex]);

  const addTimelineEntry = () => {
    const newSceneNumber = timeline.length + 1;
    const newEntry: TimelineEntry = {
      id: Date.now().toString(),
      event: `Scene ${newSceneNumber}`, // Default title with scene number
      description: '',
      characters: [],
      imageUrls: [],
      videoUrls: [],
      audioUrls: [],
      order: timeline.length
    };
    onChange([...timeline, newEntry]);
    setExpandedEntries(new Set([...expandedEntries, newEntry.id]));
  };

  const removeEntry = (id: string) => {
    onChange(timeline.filter(e => e.id !== id));
    const newExpanded = new Set(expandedEntries);
    newExpanded.delete(id);
    setExpandedEntries(newExpanded);
    
    // Clean up hidden scenes
    const newHidden = new Set(hiddenScenes);
    newHidden.delete(id);
    setHiddenScenes(newHidden);
    
    // Reset active scene if it was the deleted one
    if (timeline.findIndex(e => e.id === id) === activeSceneIndex) {
      setActiveSceneIndex(null);
      setManuallySetActive(false);
    }
  };

  const updateEntry = (id: string, field: keyof TimelineEntry, value: string | string[] | number) => {
    onChange(timeline.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedEntries(newExpanded);
  };

  const collapseAll = () => {
    setExpandedEntries(new Set());
  };

  const expandAll = () => {
    setExpandedEntries(new Set(filteredTimeline.map(entry => entry.id)));
  };

  const moveEntry = (id: string, direction: 'up' | 'down') => {
    const index = timeline.findIndex(e => e.id === id);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === timeline.length - 1)) return;
    
    const newTimeline = [...timeline];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newTimeline[index], newTimeline[targetIndex]] = [newTimeline[targetIndex], newTimeline[index]];
    
    onChange(newTimeline.map((e, i) => ({ ...e, order: i })));
  };

  const startEditSceneNumber = (entryId: string, currentIndex: number) => {
    setEditingSceneNumber(entryId);
    setNewSceneNumber((currentIndex + 1).toString());
  };

  const cancelEditSceneNumber = () => {
    setEditingSceneNumber(null);
    setNewSceneNumber('');
  };

  const confirmSceneNumberChange = (_entryId: string, currentIndex: number) => {
    const targetSceneNumber = parseInt(newSceneNumber);
    
    if (isNaN(targetSceneNumber) || targetSceneNumber < 1 || targetSceneNumber > timeline.length) {
      alert(`Please enter a valid scene number between 1 and ${timeline.length}`);
      return;
    }

    const targetIndex = targetSceneNumber - 1;
    
    if (targetIndex === currentIndex) {
      cancelEditSceneNumber();
      return;
    }

    // Reorder the timeline
    const newTimeline = [...timeline];
    const [movedEntry] = newTimeline.splice(currentIndex, 1);
    newTimeline.splice(targetIndex, 0, movedEntry);
    
    // Update order property
    onChange(newTimeline.map((e, i) => ({ ...e, order: i })));
    cancelEditSceneNumber();
  };

  // Drag and Drop handlers for timeline bar
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedSceneIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedSceneIndex === null || draggedSceneIndex === dropIndex) {
      setDraggedSceneIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newTimeline = [...timeline];
    const [draggedEntry] = newTimeline.splice(draggedSceneIndex, 1);
    newTimeline.splice(dropIndex, 0, draggedEntry);
    
    onChange(newTimeline.map((e, i) => ({ ...e, order: i })));
    
    setDraggedSceneIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedSceneIndex(null);
    setDragOverIndex(null);
  };

  // Timeline bar scene number editing
  const startEditTimelineScene = (entryId: string, currentIndex: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTimelineSceneId(entryId);
    setTimelineSceneNumber((currentIndex + 1).toString());
  };

  const confirmTimelineSceneChange = (currentIndex: number) => {
    const targetSceneNumber = parseInt(timelineSceneNumber);
    
    if (isNaN(targetSceneNumber) || targetSceneNumber < 1 || targetSceneNumber > timeline.length) {
      alert(`Please enter a valid scene number between 1 and ${timeline.length}`);
      return;
    }

    const targetIndex = targetSceneNumber - 1;
    
    if (targetIndex !== currentIndex) {
      const newTimeline = [...timeline];
      const [movedEntry] = newTimeline.splice(currentIndex, 1);
      newTimeline.splice(targetIndex, 0, movedEntry);
      onChange(newTimeline.map((e, i) => ({ ...e, order: i })));
    }
    
    setEditingTimelineSceneId(null);
    setTimelineSceneNumber('');
  };

  const cancelTimelineSceneEdit = () => {
    setEditingTimelineSceneId(null);
    setTimelineSceneNumber('');
  };

  // Pagination for timeline bar
  const totalPages = Math.ceil(timeline.length / SCENES_PER_PAGE);
  const paginatedTimeline = timeline.slice(
    timelineBarPage * SCENES_PER_PAGE,
    (timelineBarPage + 1) * SCENES_PER_PAGE
  );

  const goToTimelinePage = (page: number) => {
    setTimelineBarPage(Math.max(0, Math.min(page, totalPages - 1)));
  };

  const goToScenePage = (sceneIndex: number) => {
    const page = Math.floor(sceneIndex / SCENES_PER_PAGE);
    setTimelineBarPage(page);
  };

  const handleQuickJump = () => {
    const sceneNum = parseInt(quickJumpValue);
    if (sceneNum >= 1 && sceneNum <= timeline.length) {
      const sceneIndex = sceneNum - 1;
      // Navigate to the page in timeline bar
      goToScenePage(sceneIndex);
      // Set as active scene to highlight it
      setActiveSceneIndex(sceneIndex);
      setManuallySetActive(true);
      // Scroll the timeline bar to show the scene card
      setTimeout(() => {
        if (timelineBarRef.current) {
          const cardWidth = window.innerWidth < 640 ? 112 : window.innerWidth < 768 ? 144 : 176; // w-28/w-36/w-44
          const spacing = window.innerWidth < 640 ? 8 : 12; // space-x-2/space-x-3
          const indexInPage = sceneIndex % SCENES_PER_PAGE;
          const scrollPosition = indexInPage * (cardWidth + spacing);
          timelineBarRef.current.scrollTo({ left: scrollPosition, behavior: 'smooth' });
        }
      }, 100);
      setQuickJumpValue('');
    }
  };

  const deleteSceneFromTimeline = (entryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this scene from the timeline?')) {
      // Remove from timeline
      const newTimeline = timeline.filter(entry => entry.id !== entryId);
      // Update order
      const reorderedTimeline = newTimeline.map((entry, index) => ({ ...entry, order: index }));
      onChange(reorderedTimeline);
      
      // Clean up related states
      const newExpanded = new Set(expandedEntries);
      newExpanded.delete(entryId);
      setExpandedEntries(newExpanded);
      
      const newHidden = new Set(hiddenScenes);
      newHidden.delete(entryId);
      setHiddenScenes(newHidden);
      
      // Reset active scene if it was the deleted one
      if (timeline.findIndex(e => e.id === entryId) === activeSceneIndex) {
        setActiveSceneIndex(null);
        setManuallySetActive(false);
      }
    }
  };

  const toggleHideScene = (entryId: string, e: React.MouseEvent | MouseEvent) => {
    if ('stopPropagation' in e) {
      e.stopPropagation();
    }
    const newHidden = new Set(hiddenScenes);
    if (newHidden.has(entryId)) {
      newHidden.delete(entryId);
    } else {
      newHidden.add(entryId);
    }
    setHiddenScenes(newHidden);
  };

  const handleImageUpload = async (entryId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingImages(entryId);

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
        const entry = timeline.find(e => e.id === entryId);
        if (entry) {
          updateEntry(entryId, 'imageUrls', [...entry.imageUrls, ...urls]);
        }
      }
    } catch (err) {
      console.error('Image upload failed', err);
    } finally {
      setUploadingImages(null);
    }
  };

  const removeImage = (entryId: string, imageIndex: number) => {
    const entry = timeline.find(e => e.id === entryId);
    if (entry) {
      updateEntry(entryId, 'imageUrls', entry.imageUrls.filter((_, i) => i !== imageIndex));
    }
  };

  const handleMediaUpload = async (entryId: string, e: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'audio') => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    if (type === 'video') setUploadingVideos(entryId);
    else setUploadingAudio(entryId);

    const files = Array.from(e.target.files);
    const formDataUpload = new FormData();
    files.forEach(file => formDataUpload.append('files', file));
    formDataUpload.append('type', type);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/stories/upload-media', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataUpload
      });

      if (response.ok) {
        const urls: string[] = await response.json();
        const entry = timeline.find(e => e.id === entryId);
        if (entry) {
          const field = type === 'video' ? 'videoUrls' : 'audioUrls';
          const currentUrls = entry[field] || [];
          updateEntry(entryId, field, [...currentUrls, ...urls]);
        }
      }
    } catch (err) {
      console.error(`${type} upload failed`, err);
    } finally {
      if (type === 'video') setUploadingVideos(null);
      else setUploadingAudio(null);
    }
  };

  const removeMedia = (entryId: string, mediaIndex: number, type: 'video' | 'audio') => {
    const entry = timeline.find(e => e.id === entryId);
    if (entry) {
      const field = type === 'video' ? 'videoUrls' : 'audioUrls';
      const currentUrls = entry[field] || [];
      updateEntry(entryId, field, currentUrls.filter((_, i) => i !== mediaIndex));
    }
  };

  const toggleCharacter = (entryId: string, characterName: string) => {
    const entry = timeline.find(e => e.id === entryId);
    if (!entry) return;

    if (entry.characters.includes(characterName)) {
      updateEntry(entryId, 'characters', entry.characters.filter(c => c !== characterName));
    } else {
      updateEntry(entryId, 'characters', [...entry.characters, characterName]);
    }
  };

  const handleAddNewCharacter = (entryId: string) => {
    if (newCharacter.name.trim()) {
      onAddCharacter(newCharacter);
      toggleCharacter(entryId, newCharacter.name);
      setNewCharacter({ name: '', description: '', role: '', actorName: '', popularity: undefined });
      setShowNewCharacterForm(null);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Enhanced Timeline Bar */}
      {timeline.length > 0 && (
        <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-lg sm:rounded-xl shadow-lg sm:shadow-2xl p-2 sm:p-4 mb-3 sm:mb-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1.5 sm:p-2">
                <Film className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm sm:text-lg">Scene Timeline</h3>
                <p className="text-purple-100 text-xs hidden sm:block">{timeline.length} scenes total</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              {activeSceneIndex !== null && (
                <div className="bg-white/20 backdrop-blur-sm px-2 py-0.5 sm:px-3 sm:py-1 rounded-full">
                  <span className="text-white text-xs sm:text-sm font-semibold">
                    {activeSceneIndex + 1}/{timeline.length}
                  </span>
                </div>
              )}
              {totalPages > 1 && (
                <div className="bg-white/20 backdrop-blur-sm px-1 sm:px-2 py-0.5 sm:py-1 rounded-lg flex items-center space-x-0.5 sm:space-x-1">
                  <button
                    type="button"
                    onClick={() => goToTimelinePage(timelineBarPage - 1)}
                    disabled={timelineBarPage === 0}
                    className="text-white disabled:text-gray-300 hover:bg-white/20 p-0.5 sm:p-1 rounded transition"
                  >
                    <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                  <span className="text-white text-xs px-1 sm:px-2">
                    {timelineBarPage + 1}/{totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => goToTimelinePage(timelineBarPage + 1)}
                    disabled={timelineBarPage === totalPages - 1}
                    className="text-white disabled:text-gray-300 hover:bg-white/20 p-0.5 sm:p-1 rounded transition"
                  >
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Scrollable Timeline Bar */}
          <div 
            ref={timelineBarRef}
            className="relative overflow-x-auto pb-2 sm:pb-3 pt-4 sm:pt-5 px-4 sm:px-5 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-white/10 rounded-lg"
            style={{ scrollbarWidth: 'thin' }}
          >
            <div className="flex space-x-2 sm:space-x-3 min-w-max">
              {paginatedTimeline.map((entry, paginatedIndex) => {
                const actualIndex = timelineBarPage * SCENES_PER_PAGE + paginatedIndex;
                const isHidden = hiddenScenes.has(entry.id);
                return (
                  <div
                    key={entry.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, actualIndex)}
                    onDragOver={(e) => handleDragOver(e, actualIndex)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, actualIndex)}
                    onDragEnd={handleDragEnd}
                    className={`relative flex-shrink-0 w-28 sm:w-36 md:w-44 rounded-lg sm:rounded-xl transition-all duration-300 cursor-move group ${
                      draggedSceneIndex === actualIndex
                        ? 'opacity-50 scale-90 z-10'
                        : dragOverIndex === actualIndex
                        ? 'scale-105 sm:scale-110 ring-2 sm:ring-4 ring-green-400 shadow-xl sm:shadow-2xl z-50'
                        : activeSceneIndex === actualIndex
                        ? 'scale-105 ring-2 sm:ring-4 ring-yellow-400 shadow-xl sm:shadow-2xl z-50'
                        : 'hover:scale-105 hover:shadow-lg sm:hover:shadow-xl hover:z-50'
                    } ${isHidden ? 'opacity-40' : ''}`}
                    onClick={() => scrollToScene(entry.id, actualIndex)}
                  >
                    {/* Scene Card */}
                    <div className={`h-20 sm:h-24 md:h-28 rounded-lg sm:rounded-xl overflow-visible backdrop-blur-sm border ${
                      activeSceneIndex === actualIndex
                        ? 'bg-gradient-to-br from-yellow-400/50 via-amber-400/50 to-orange-400/50 border-yellow-300 shadow-lg'
                        : 'bg-white/10 border-white/20'
                    } ${isHidden ? 'bg-gray-400/30' : ''}`}>
                      {/* Action Buttons - Show on Hover */}
                      <div className="absolute -top-3 -right-3 z-[60] opacity-0 group-hover:opacity-100 transition-all duration-200 flex space-x-1.5 pointer-events-auto">
                        <button
                          type="button"
                          onClick={(e) => toggleHideScene(entry.id, e)}
                          className={`${isHidden ? 'bg-blue-600 ring-2 ring-blue-300' : 'bg-gray-800'} text-white w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shadow-2xl hover:scale-125 transition-all duration-200 border-2 border-white`}
                          title={isHidden ? "Unhide scene" : "Hide scene"}
                        >
                          {isHidden ? <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <EyeOff className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => deleteSceneFromTimeline(entry.id, e)}
                          className="bg-red-600 text-white w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shadow-2xl hover:scale-125 transition-all duration-200 border-2 border-white ring-2 ring-red-300"
                          title="Delete scene"
                        >
                          <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>
                      </div>

                      {/* Scene Number Badge */}
                      {editingTimelineSceneId === entry.id ? (
                        <div className="absolute -top-1 -left-1 sm:-top-2 sm:-left-2 z-[70] flex items-center space-x-0.5 sm:space-x-1 bg-white rounded-md sm:rounded-lg shadow-lg p-0.5 sm:p-1">
                          <input
                            type="number"
                            min="1"
                            max={timeline.length}
                            value={timelineSceneNumber}
                            onChange={(e) => setTimelineSceneNumber(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-10 sm:w-12 px-1 py-0.5 text-xs font-bold text-center border-2 border-purple-500 rounded focus:outline-none focus:ring-2 focus:ring-purple-600"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); confirmTimelineSceneChange(actualIndex); }}
                            className="text-green-600 hover:text-green-700 p-0.5"
                          >
                            <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); cancelTimelineSceneEdit(); }}
                            className="text-red-500 hover:text-red-600 p-0.5"
                          >
                            <XCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => startEditTimelineScene(entry.id, actualIndex, e)}
                          className={`absolute -top-1 -left-1 sm:-top-2 sm:-left-2 z-[60] text-white w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg hover:scale-110 transition-all group-hover:ring-2 ${
                            activeSceneIndex === actualIndex
                              ? 'bg-gradient-to-br from-yellow-400 to-amber-500 ring-2 ring-yellow-300 scale-110'
                              : 'bg-gradient-to-br from-purple-500 to-blue-500 ring-yellow-300'
                          }`}
                          title="Click to edit scene number"
                        >
                          <span className="group-hover:hidden">{actualIndex + 1}</span>
                          <Edit2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 hidden group-hover:block" />
                        </button>
                      )}
                      
                      {/* Scene Content */}
                      <div className="p-2 sm:p-2.5 md:p-3 h-full flex flex-col justify-between pointer-events-none">
                        <div className="flex-1 min-h-0 overflow-hidden">
                          <div className={`text-xs sm:text-sm font-bold line-clamp-2 mb-1 leading-tight ${
                            activeSceneIndex === actualIndex ? 'text-gray-900 drop-shadow-sm' : 'text-white/90'
                          }`}>
                            {entry.event || `Scene ${actualIndex + 1}`}
                          </div>
                          {entry.description && (
                            <div className={`text-[10px] sm:text-xs line-clamp-2 leading-tight ${
                              activeSceneIndex === actualIndex ? 'text-gray-800' : 'text-white/70'
                            }`}>
                              {entry.description.substring(0, 50)}...
                            </div>
                          )}
                        </div>
                        
                        {/* Scene Info */}
                        <div className="flex items-center gap-1 sm:gap-1.5 mt-1.5 flex-wrap">
                          {entry.characters.length > 0 && (
                            <div className={`flex items-center backdrop-blur-sm px-1.5 py-0.5 rounded-full ${
                              activeSceneIndex === actualIndex ? 'bg-gray-800/80' : 'bg-white/25'
                            }`}>
                              <Users className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white mr-0.5" />
                              <span className="text-[10px] sm:text-xs text-white font-semibold">{entry.characters.length}</span>
                            </div>
                          )}
                          {entry.imageUrls.length > 0 && (
                            <div className={`flex items-center backdrop-blur-sm px-1.5 py-0.5 rounded-full ${
                              activeSceneIndex === actualIndex ? 'bg-gray-800/80' : 'bg-white/25'
                            }`}>
                              <ImageIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white mr-0.5" />
                              <span className="text-[10px] sm:text-xs text-white font-semibold">{entry.imageUrls.length}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            }
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="mt-2 sm:mt-3 flex items-center justify-center space-x-1 sm:space-x-2">
            <span className="text-white/70 text-xs hidden sm:inline">Quick Jump to Scene:</span>
            <input
              type="number"
              min="1"
              max={timeline.length}
              placeholder="Scene #"
              value={quickJumpValue}
              onChange={(e) => setQuickJumpValue(e.target.value)}
              className="w-16 sm:w-20 px-2 py-1 text-xs text-center bg-white/20 backdrop-blur-sm text-white placeholder-white/50 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleQuickJump();
                }
              }}
            />
            <button
              type="button"
              onClick={handleQuickJump}
              disabled={!quickJumpValue}
              className="bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed text-white px-2 sm:px-3 py-1 rounded-lg text-xs font-semibold transition"
            >
              Go
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      {timeline.length > 0 && (
        <div className="space-y-3">
          {/* Scene Visibility Filter */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-semibold text-gray-700">Filter Scenes:</label>
            <select
              value={sceneVisibilityFilter}
              onChange={(e) => {
                setSceneVisibilityFilter(e.target.value as 'all' | 'visible' | 'hidden');
                setCurrentScenePage(0);
              }}
              className="px-4 py-2 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white font-medium text-sm"
            >
              <option value="all">All Scenes ({timeline.length})</option>
              <option value="visible">Visible Scenes ({timeline.filter(e => !hiddenScenes.has(e.id)).length})</option>
              <option value="hidden">Hidden Scenes ({hiddenScenes.size})</option>
            </select>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
            <input
              type="text"
              placeholder="Search by scene number or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-800">📖 Story Timeline</h3>
          <button
            type="button"
            onClick={() => setShowCharacters(!showCharacters)}
            className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-200 transition flex items-center space-x-1"
          >
            <Users className="w-4 h-4" />
            <span>Characters ({availableCharacters.length})</span>
            {showCharacters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 transition flex items-center space-x-1"
            title="Collapse all scenes"
          >
            <ChevronUp className="w-4 h-4" />
            <span className="hidden sm:inline">Collapse All</span>
          </button>
          <button
            type="button"
            onClick={expandAll}
            className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 transition flex items-center space-x-1"
            title="Expand all scenes"
          >
            <ChevronDown className="w-4 h-4" />
            <span className="hidden sm:inline">Expand All</span>
          </button>
          <select
            value={scenesPerPageList}
            onChange={(e) => {
              setScenesPerPageList(Number(e.target.value));
              setCurrentScenePage(0);
            }}
            className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full border-0 hover:bg-gray-200 transition"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition flex items-center space-x-1 shadow-sm"
          >
            <Film className="w-4 h-4" />
            <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
          </button>
          <button
            type="button"
            onClick={addTimelineEntry}
            className="text-sm bg-purple-600 text-white px-4 py-1.5 rounded-lg hover:bg-purple-700 transition flex items-center space-x-1 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Scene</span>
          </button>
        </div>
      </div>

      {/* All Characters Panel */}
      {showCharacters && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-purple-900 mb-3">All Characters in Story</h4>
          {availableCharacters.length > 0 ? (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {availableCharacters.map((char, idx) => (
                <div key={idx} className="bg-white rounded p-2 border border-purple-200">
                  <div className="font-medium text-gray-900 text-sm">{char.name}</div>
                  {char.actorName && (
                    <div className="text-xs text-purple-600">Actor: {char.actorName}</div>
                  )}
                  {char.role && (
                    <div className="text-xs text-gray-600">{char.role}</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600 italic">No characters added yet. Add characters below.</p>
          )}
        </div>
      )}

      {/* Scene Pagination Info */}
      {filteredTimeline.length > 0 && (
        <div className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold">{currentScenePage * scenesPerPageList + 1}</span> to{' '}
            <span className="font-semibold">{Math.min((currentScenePage + 1) * scenesPerPageList, filteredTimeline.length)}</span> of{' '}
            <span className="font-semibold">{filteredTimeline.length}</span> scenes
          </div>
          {totalScenePages > 1 && (
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => goToSceneListPage(currentScenePage - 1)}
                disabled={currentScenePage === 0}
                className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentScenePage + 1} of {totalScenePages}
              </span>
              <button
                type="button"
                onClick={() => goToSceneListPage(currentScenePage + 1)}
                disabled={currentScenePage === totalScenePages - 1}
                className="px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Timeline Entries */}
      <div className="space-y-3">
        {timeline.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-600">No timeline entries yet. Click "Add Scene" to begin.</p>
          </div>
        ) : filteredTimeline.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <p className="text-gray-600">No scenes match your search "{searchQuery}"</p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="mt-2 text-purple-600 hover:text-purple-700 underline"
            >
              Clear search
            </button>
          </div>
        ) : (
          paginatedScenes.map((entry) => {
            const originalIndex = timeline.findIndex(e => e.id === entry.id);
            return (
            <div 
              key={entry.id} 
              ref={el => { sceneRefs.current[entry.id] = el; }}
              className={`border-2 rounded-lg shadow-sm transition-all ${
                hiddenScenes.has(entry.id) 
                  ? 'border-gray-400 bg-gray-100 opacity-60' 
                  : 'border-gray-200 bg-white'
              }`}
            >
              {/* Entry Header */}
              <div className={`flex items-center justify-between p-3 transition-colors ${
                hiddenScenes.has(entry.id)
                  ? 'bg-gradient-to-r from-gray-200 to-gray-300'
                  : 'bg-gradient-to-r from-purple-50 to-blue-50'
              }`}>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => toggleHideScene(entry.id, new MouseEvent('click') as unknown as React.MouseEvent)}
                    className={`${hiddenScenes.has(entry.id) ? 'bg-blue-600 ring-2 ring-blue-300' : 'bg-gray-700'} text-white w-7 h-7 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all`}
                    title={hiddenScenes.has(entry.id) ? "Unhide from story" : "Hide from story"}
                  >
                    {hiddenScenes.has(entry.id) ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    {editingSceneNumber === entry.id ? (
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          min="1"
                          max={timeline.length}
                          value={newSceneNumber}
                          onChange={(e) => setNewSceneNumber(e.target.value)}
                          className="w-16 px-2 py-1 border-2 border-purple-500 rounded text-sm font-bold text-center focus:outline-none focus:ring-2 focus:ring-purple-600"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => confirmSceneNumberChange(entry.id, originalIndex)}
                          className="text-green-600 hover:text-green-700 p-1"
                          title="Confirm"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditSceneNumber}
                          className="text-red-500 hover:text-red-600 p-1"
                          title="Cancel"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startEditSceneNumber(entry.id, originalIndex)}
                        className="bg-purple-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold hover:bg-purple-700 transition group relative"
                        title="Click to edit scene number"
                      >
                        {originalIndex + 1}
                        <Edit2 className="w-3 h-3 absolute opacity-0 group-hover:opacity-100 transition" />
                      </button>
                    )}
                    <input
                      type="text"
                      placeholder="Event Title (e.g., Opening Scene)"
                      value={entry.event}
                      onChange={(e) => updateEntry(entry.id, 'event', e.target.value)}
                      className="flex-1 px-3 py-1 border-0 bg-transparent font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 rounded"
                    />
                  </div>
                  {/* Character badges in collapsed view */}
                  {!expandedEntries.has(entry.id) && entry.characters.length > 0 && (
                    <div className="flex flex-wrap gap-1 ml-9 mt-1">
                      {entry.characters.map((charName, cIdx) => {
                        const color = getCharacterColor(charName, allCharacterNames);
                        return (
                          <span key={cIdx} className={`${color.bg} ${color.text} px-2 py-0.5 rounded-full text-xs font-semibold border ${color.border}`}>
                            {charName}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  {originalIndex > 0 && (
                    <button
                      type="button"
                      onClick={() => moveEntry(entry.id, 'up')}
                      className="text-gray-500 hover:text-gray-700 p-1"
                      title="Move up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                  )}
                  {originalIndex < timeline.length - 1 && (
                    <button
                      type="button"
                      onClick={() => moveEntry(entry.id, 'down')}
                      className="text-gray-500 hover:text-gray-700 p-1"
                      title="Move down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => toggleExpanded(entry.id)}
                    className="text-gray-500 hover:text-gray-700 p-1"
                  >
                    {expandedEntries.has(entry.id) ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeEntry(entry.id)}
                    className="text-red-500 hover:text-red-600 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Entry Details (Expandable) */}
              {expandedEntries.has(entry.id) && (
                <div className="p-4 space-y-3">
                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Scene Description
                      {entry.characters.length > 0 && (
                        <span className="text-xs text-purple-600 ml-2">
                          (Use character names in bold/italic: they'll be auto-formatted)
                        </span>
                      )}
                    </label>
                    <textarea
                      placeholder={
                        entry.characters.length > 0
                          ? `Describe what happens with ${entry.characters.join(', ')}...`
                          : "First select characters for this scene, then describe what happens..."
                      }
                      value={entry.description}
                      onChange={(e) => updateEntry(entry.id, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 h-24 font-mono text-sm"
                    />
                  </div>

                  {/* Characters Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Characters in this scene:</label>
                    <div className="flex flex-wrap gap-2">
                      {availableCharacters.map((char, idx) => {
                        const color = getCharacterColor(char.name, allCharacterNames);
                        const isSelected = entry.characters.includes(char.name);
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => toggleCharacter(entry.id, char.name)}
                            className={`px-3 py-1.5 rounded-full text-sm font-semibold transition border-2 ${
                              isSelected
                                ? `${color.bg} ${color.text} ${color.border}`
                                : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200'
                            }`}
                          >
                            {char.name}
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        onClick={() => setShowNewCharacterForm(entry.id)}
                        className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700 hover:bg-green-200 transition flex items-center border-2 border-green-300"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add New
                      </button>
                    </div>
                    {entry.characters.length > 0 && (
                      <div className="text-xs text-gray-600 mt-2">
                        ℹ️ Only these characters can be mentioned in this scene's description
                      </div>
                    )}
                  </div>

                  {/* New Character Form */}
                  {showNewCharacterForm === entry.id && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
                      <h5 className="text-sm font-semibold text-green-800">Add New Character</h5>
                      <input
                        type="text"
                        placeholder="Character Name"
                        value={newCharacter.name}
                        onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
                        className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Actor Name (optional)"
                        value={newCharacter.actorName}
                        onChange={(e) => setNewCharacter({ ...newCharacter, actorName: e.target.value })}
                        className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Role (e.g., Protagonist)"
                          value={newCharacter.role}
                          onChange={(e) => setNewCharacter({ ...newCharacter, role: e.target.value })}
                          className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                        />
                        <input
                          type="number"
                          min="1"
                          max="10"
                          placeholder="Popularity (1-10)"
                          value={newCharacter.popularity || ''}
                          onChange={(e) => setNewCharacter({ ...newCharacter, popularity: e.target.value ? parseInt(e.target.value) : undefined })}
                          className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <textarea
                        placeholder="Character Description"
                        value={newCharacter.description}
                        onChange={(e) => setNewCharacter({ ...newCharacter, description: e.target.value })}
                        className="w-full px-3 py-1 border border-gray-300 rounded text-sm h-16"
                      />
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => handleAddNewCharacter(entry.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          Add Character
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowNewCharacterForm(null);
                            setNewCharacter({ name: '', description: '', role: '', actorName: '', popularity: undefined });
                          }}
                          className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Images Upload */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <ImageIcon className="w-4 h-4 mr-1" />
                      Scene Images
                    </label>
                    <div className="flex items-center space-x-2">
                      <label className="cursor-pointer bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 flex items-center text-sm">
                        <Upload className="w-3 h-3 mr-1" />
                        Upload
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleImageUpload(entry.id, e)}
                          className="hidden"
                          disabled={uploadingImages === entry.id}
                        />
                      </label>
                      {uploadingImages === entry.id && <span className="text-xs text-gray-600">Uploading...</span>}
                    </div>
                    {entry.imageUrls.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {entry.imageUrls.map((url, idx) => (
                          <div key={idx} className="relative group">
                            <img 
                              src={url.startsWith('http') ? url : `http://localhost:8080${url}`} 
                              alt={`Scene image ${idx + 1}`} 
                              className="w-full h-16 sm:h-20 object-cover rounded border border-gray-300 group-hover:border-purple-400 transition" 
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E';
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(entry.id, idx)}
                              className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700 opacity-0 group-hover:opacity-100 transition"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Video Upload */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Video className="w-4 h-4 mr-1" />
                      Scene Videos
                    </label>
                    <div className="flex items-center space-x-2">
                      <label className="cursor-pointer bg-purple-600 text-white px-3 py-1.5 rounded hover:bg-purple-700 flex items-center text-sm">
                        <Upload className="w-3 h-3 mr-1" />
                        Upload Video
                        <input
                          type="file"
                          multiple
                          accept="video/*"
                          onChange={(e) => handleMediaUpload(entry.id, e, 'video')}
                          className="hidden"
                          disabled={uploadingVideos === entry.id}
                        />
                      </label>
                      {uploadingVideos === entry.id && <span className="text-xs text-gray-600">Uploading...</span>}
                    </div>
                    {entry.videoUrls && entry.videoUrls.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {entry.videoUrls.map((url, idx) => (
                          <div key={idx} className="relative group">
                            <video 
                              src={url.startsWith('http') ? url : `http://localhost:8080${url}`} 
                              controls
                              className="w-full h-32 object-cover rounded border border-gray-300" 
                            />
                            <button
                              type="button"
                              onClick={() => removeMedia(entry.id, idx, 'video')}
                              className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full p-0.5 hover:bg-red-700 opacity-0 group-hover:opacity-100 transition z-10"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Audio Upload */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <Music className="w-4 h-4 mr-1" />
                      Scene Audio
                    </label>
                    <div className="flex items-center space-x-2">
                      <label className="cursor-pointer bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 flex items-center text-sm">
                        <Upload className="w-3 h-3 mr-1" />
                        Upload Audio
                        <input
                          type="file"
                          multiple
                          accept="audio/*"
                          onChange={(e) => handleMediaUpload(entry.id, e, 'audio')}
                          className="hidden"
                          disabled={uploadingAudio === entry.id}
                        />
                      </label>
                      {uploadingAudio === entry.id && <span className="text-xs text-gray-600">Uploading...</span>}
                    </div>
                    {entry.audioUrls && entry.audioUrls.length > 0 && (
                      <div className="space-y-2">
                        {entry.audioUrls.map((url, idx) => (
                          <div key={idx} className="relative group flex items-center bg-gray-50 p-2 rounded border border-gray-200">
                            <audio 
                              src={url.startsWith('http') ? url : `http://localhost:8080${url}`} 
                              controls
                              className="w-full h-8" 
                            />
                            <button
                              type="button"
                              onClick={() => removeMedia(entry.id, idx, 'audio')}
                              className="ml-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 opacity-0 group-hover:opacity-100 transition"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
      </div>

      {/* Generate Story Preview - Enhanced Modal with Book-like Layout */}
      {showPreview && timeline.length > 0 && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowPreview(false)}>
            <div className="bg-white p-4 rounded">
                <h2>Preview Placeholder</h2>
                <button onClick={() => setShowPreview(false)}>Close</button>
            </div>
        </div>
      )}
    </div>
  );
};

export default TimelineManager;
