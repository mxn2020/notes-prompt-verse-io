import React, { useState, useEffect } from 'react';
import { Plus, Filter, Grid3X3, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import NoteCard from '../components/notes/NoteCard';
import { Note } from '../types';
import { api } from '../utils/api';
import { toast } from 'sonner';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Dashboard: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterOpen, setFilterOpen] = useState(false);

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
      }
    } catch (error) {
      console.error('Error updating note:', error);
      
      // Revert on error
      setNotes((prevNotes) => [...prevNotes]);
      
      toast.error('Failed to update note. Please try again.');
    }
  };

  const toggleFilterPanel = () => {
    setFilterOpen(!filterOpen);
  };

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
      {notes.some((note) => note.isPinned) && (
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Pinned Notes
          </h2>
          <div className={`grid gap-4 ${
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
          }`}>
            {notes
              .filter((note) => note.isPinned)
              .map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onTogglePin={handleTogglePin}
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
        {notes.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Plus className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No notes yet
            </h3>
            <p className="text-gray-500 mb-4">
              Create your first note to start tracking your progress
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
            {notes
              .filter((note) => !note.isPinned)
              .map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onTogglePin={handleTogglePin}
                />
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;