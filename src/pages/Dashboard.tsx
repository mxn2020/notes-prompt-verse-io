import React, { useState, useEffect } from 'react';
import { Plus, Filter, Grid3X3, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import NoteCard from '../components/notes/NoteCard';
import { Note } from '../types';
import { api } from '../utils/api';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Dashboard: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterOpen, setFilterOpen] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setIsLoading(true);
        const response = await api.get('/notes');
        
        if (response.data.success) {
          setNotes(response.data.data);
        } else {
          addToast({
            type: 'error',
            message: response.data.error || 'Failed to fetch notes',
          });
        }
      } catch (error) {
        console.error('Error fetching notes:', error);
        addToast({
          type: 'error',
          message: 'Failed to fetch notes. Please try again.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, [addToast]);

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
        
        addToast({
          type: 'error',
          message: response.data.error || 'Failed to update note',
        });
      }
    } catch (error) {
      console.error('Error updating note:', error);
      
      // Revert on error
      setNotes((prevNotes) => [...prevNotes]);
      
      addToast({
        type: 'error',
        message: 'Failed to update note. Please try again.',
      });
    }
  };

  const toggleFilterPanel = () => {
    setFilterOpen(!filterOpen);
  };

  // For demo purposes, simulate some notes
  const demoNotes: Note[] = [
    {
      id: '1',
      userId: 'user1',
      title: 'Hackathon Day 1 Progress',
      content: 'Started working on the project architecture. Set up the basic React components and implemented the authentication flow.',
      type: 'Daily Progress',
      fields: {
        mood: 'Excited',
        energy: 'High',
        challenges: 'Deciding on the best state management approach',
        wins: 'Got the basic structure working',
        tomorrow: 'Implement the note editor component'
      },
      category: 'Hackathon',
      tags: ['progress', 'day1'],
      color: 'blue',
      isPinned: true,
      isArchived: false,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: '2',
      userId: 'user1',
      title: 'Feature Ideas for prompt-verse.io',
      content: 'AI-powered prompt suggestions based on user history. Collaborative prompt editing for teams. Version history for prompts.',
      type: 'Feature Idea',
      fields: {
        priority: 'Must Have',
        impact: 'High impact for user experience',
        implementation: 'Will require integrating with an AI service'
      },
      category: 'Product Ideas',
      tags: ['feature', 'ai'],
      color: 'green',
      isPinned: false,
      isArchived: false,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: '3',
      userId: 'user1',
      title: 'Kickoff Meeting Notes',
      content: 'Discussed project scope, timeline, and key features. Everyone is excited about the hackathon!',
      type: 'Meeting Notes',
      fields: {
        attendees: 'John, Sarah, Miguel',
        action_items: 'John: Research APIs, Sarah: Design mockups, Miguel: Set up the repo',
        follow_up: '2023-06-15'
      },
      category: 'Meetings',
      tags: ['meeting', 'kickoff'],
      color: 'yellow',
      isPinned: false,
      isArchived: false,
      threadId: '3',
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      updatedAt: new Date(Date.now() - 259200000).toISOString()
    }
  ];

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
          <h1 className="text-2xl font-bold text-neutral-900">My Notes</h1>
          <p className="text-neutral-500">Organize and manage your hackathon progress</p>
        </div>

        <div className="flex mt-4 sm:mt-0 space-x-2">
          <Button
            variant="outline"
            onClick={toggleFilterPanel}
            icon={<Filter className="h-4 w-4" />}
          >
            Filter
          </Button>
          
          <div className="hidden sm:flex bg-neutral-100 rounded-md p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded ${
                viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-neutral-500'
              }`}
            >
              <Grid3X3 className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 rounded ${
                viewMode === 'list' ? 'bg-white shadow-sm' : 'text-neutral-500'
              }`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
          
          <Link to="/notes/new">
            <Button icon={<Plus className="h-4 w-4" />}>New Note</Button>
          </Link>
        </div>
      </div>

      {filterOpen && (
        <div className="bg-white border border-neutral-200 rounded-lg p-4 mb-6 animate-slide-down">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Filter fields would go here */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
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
              <label className="block text-sm font-medium text-neutral-700 mb-1">
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
              <label className="block text-sm font-medium text-neutral-700 mb-1">
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
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Tags
              </label>
              <input
                type="text"
                placeholder="Enter tags..."
                className="input"
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-4 pt-4 border-t border-neutral-200">
            <Button variant="outline" size="sm" className="mr-2">
              Reset
            </Button>
            <Button variant="primary" size="sm">
              Apply Filters
            </Button>
          </div>
        </div>
      )}

      {/* Pinned notes section */}
      {demoNotes.some((note) => note.isPinned) && (
        <div className="mb-8">
          <h2 className="text-lg font-medium text-neutral-900 mb-4">
            Pinned Notes
          </h2>
          <div className={`grid gap-4 ${
            viewMode === 'grid'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
          }`}>
            {demoNotes
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
        <h2 className="text-lg font-medium text-neutral-900 mb-4">
          Recent Notes
        </h2>
        {demoNotes.length === 0 ? (
          <div className="bg-white border border-neutral-200 rounded-lg p-8 text-center">
            <div className="text-neutral-400 mb-4">
              <Plus className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              No notes yet
            </h3>
            <p className="text-neutral-500 mb-4">
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
            {demoNotes
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