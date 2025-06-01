import React, { useState, useEffect } from 'react';
import { Plus, Filter, Grid3X3, List, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import NoteCard from '@/components/notes/NoteCard';
import { Note } from '@/types';
import { api } from '@/utils/api';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const Dashboard: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterOpen, setFilterOpen] = useState(false);
  const [showSubNotes, setShowSubNotes] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const fetchNotes = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/notes');
        
        if (!isMounted) return; // Prevent state updates if component unmounted
        
        if (response.data.success) {
          setNotes(response.data.data);
        } else {
          toast.error(response.data.error || 'Failed to fetch notes');
        }
      } catch (error) {
        if (!isMounted) return; // Prevent state updates if component unmounted
        
        console.error('Error fetching notes:', error);
        toast.error('Failed to fetch notes. Please try again.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchNotes();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []);

  const handleTogglePin = async (noteId: string) => {
    try {
      const noteToUpdate = notes.find((note) => note.id === noteId);
      
      if (!noteToUpdate) return;
      
      const updatedNote = { ...noteToUpdate, isPinned: !noteToUpdate.isPinned };
      
      // Optimistic update
      setNotes((prevNotes) =>
        prevNotes.map((note) => (note.id === noteId ? updatedNote : note))
      );
      
      const response = await api.put(`/notes/${noteId}`, {
        isPinned: updatedNote.isPinned,
      });
      
      if (!response.data.success) {
        // Revert if the API call fails
        setNotes((prevNotes) =>
          prevNotes.map((note) => (note.id === noteId ? noteToUpdate : note))
        );
        
        toast.error(response.data.error || 'Failed to update note');
      } else {
        toast.success(updatedNote.isPinned ? 'Note pinned' : 'Note unpinned');
      }
    } catch (error) {
      console.error('Error updating note:', error);
      
      // Revert on error
      setNotes((prevNotes) => [...prevNotes]);
      
      toast.error('Failed to update note. Please try again.');
    }
  };

  const handleDuplicate = async (note: Note) => {
    try {
      const duplicatedNote = {
        title: `Copy of ${note.title}`,
        content: note.content,
        type: note.type,
        fields: note.fields,
        tags: note.tags,
        category: note.category,
        color: note.color,
      };

      const response = await api.post('/notes', duplicatedNote);
      
      if (response.data.success) {
        // Add the new note to the list
        setNotes((prevNotes) => [response.data.data, ...prevNotes]);
        toast.success('Note duplicated successfully');
      } else {
        toast.error(response.data.error || 'Failed to duplicate note');
      }
    } catch (error) {
      console.error('Error duplicating note:', error);
      toast.error('Failed to duplicate note. Please try again.');
    }
  };

  const handleShare = async (note: Note) => {
    try {
      // Create a shareable text with note content
      const shareText = `${note.title}\n\n${note.content}\n\n${note.tags?.length ? `Tags: ${note.tags.map(tag => `#${tag}`).join(' ')}` : ''}`;
      
      // Check if the browser supports the Web Share API
      if (navigator.share) {
        await navigator.share({
          title: note.title,
          text: shareText,
          url: window.location.origin + `/notes/${note.id}`,
        });
        toast.success('Note shared successfully');
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareText);
        toast.success('Note content copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing note:', error);
      // Fallback: try to copy to clipboard
      try {
        const shareText = `${note.title}\n\n${note.content}`;
        await navigator.clipboard.writeText(shareText);
        toast.success('Note content copied to clipboard');
      } catch (clipboardError) {
        toast.error('Failed to share note. Please try again.');
      }
    }
  };

  const handleDelete = async (noteId: string) => {
    try {
      const noteToDelete = notes.find((note) => note.id === noteId);
      
      if (!noteToDelete) return;
      
      // Optimistic update - remove from UI immediately
      setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
      
      const response = await api.delete(`/notes/${noteId}`);
      
      if (!response.data.success) {
        // Revert if the API call fails
        setNotes((prevNotes) => [...prevNotes, noteToDelete]);
        toast.error(response.data.error || 'Failed to delete note');
      } else {
        toast.success('Note deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      
      // Revert on error - fetch fresh data
      try {
        const response = await api.get('/notes');
        if (response.data.success) {
          setNotes(response.data.data);
        }
      } catch (refetchError) {
        console.error('Error refetching notes:', refetchError);
      }
      
      toast.error('Failed to delete note. Please try again.');
    }
  };

  const toggleFilterPanel = () => {
    setFilterOpen(!filterOpen);
  };

  // Filter notes based on showSubNotes toggle
  const getFilteredNotes = () => {
    if (showSubNotes) {
      return notes; // Show all notes including subnotes
    } else {
      return notes.filter(note => !note.parentId); // Only show root notes (no parentId)
    }
  };

  const filteredNotes = getFilteredNotes();

  // If loading, show a loading spinner
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Notes</h1>
          <p className="text-gray-500">Organize and manage your hackathon progress</p>
        </div>

        <div className="flex mt-4 sm:mt-0 space-x-2">
          <Button
            variant="outline"
            onClick={toggleFilterPanel}
          >
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          
          <Button
            variant={showSubNotes ? "default" : "outline"}
            onClick={() => setShowSubNotes(!showSubNotes)}
          >
            <MessageSquare className="h-4 w-4" />
            {showSubNotes ? 'Hide Sub Notes' : 'Show Sub Notes'}
          </Button>
          
          <div className="hidden sm:flex bg-gray-100 rounded-md p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded ${
                viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'
              }`}
            >
              <Grid3X3 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 rounded ${
                viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'
              }`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
          
          <Link to="/notes/new">
            <Button>
              <Plus className="h-4 w-4" />
              New Note
            </Button>
          </Link>
        </div>
      </div>

      {filterOpen && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 animate-slide-down">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Filter fields would go here */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Note Type
              </label>
              <select className="select">
                <option value="">All Types</option>
                <option value="daily-progress">Daily Progress</option>
                <option value="meeting-notes">Meeting Notes</option>
                <option value="feature-idea">Feature Idea</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select className="select">
                <option value="">All Categories</option>
                <option value="hackathon">Hackathon</option>
                <option value="product-ideas">Product Ideas</option>
                <option value="meetings">Meetings</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <select className="select">
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="yesterday">Yesterday</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <input
                type="text"
                placeholder="Enter tags..."
                className="input"
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-4 pt-4 border-t border-gray-200">
            <Button variant="outline" size="sm" className="mr-2">
              Reset
            </Button>
            <Button variant="default" size="sm">
              Apply Filters
            </Button>
          </div>
        </div>
      )}

      {/* Pinned notes section */}
      {filteredNotes.some((note) => note.isPinned) && (
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Pinned Notes
          </h2>
          <div className={`grid gap-4 ${
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
          }`}>
            {filteredNotes
              .filter((note) => note.isPinned)
              .map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onTogglePin={handleTogglePin}
                  onDuplicate={handleDuplicate}
                  onShare={handleShare}
                  onDelete={handleDelete}
                />
              ))}
          </div>
        </div>
      )}

      {/* Recent notes section */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Recent Notes
        </h2>
        {filteredNotes.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Plus className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {showSubNotes ? 'No notes yet' : 'No main notes yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {showSubNotes 
                ? 'Create your first note to start tracking your progress'
                : 'Create your first note to start tracking your progress. Sub notes are hidden by default.'
              }
            </p>
            <Link to="/notes/new">
              <Button>Create Note</Button>
            </Link>
          </div>
        ) : (
          <div className={`grid gap-4 ${
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
          }`}>
            {filteredNotes
              .filter((note) => !note.isPinned)
              .map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onTogglePin={handleTogglePin}
                  onDuplicate={handleDuplicate}
                  onShare={handleShare}
                  onDelete={handleDelete}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;