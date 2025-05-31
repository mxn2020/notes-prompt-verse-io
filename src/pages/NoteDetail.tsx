import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Edit, Trash, Copy, Pin, Share } from 'lucide-react';
import Button from '../components/ui/Button';
import NoteThread from '../components/notes/NoteThread';
import { NoteThread as NoteThreadType } from '../types';
import { api } from '../utils/api';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const NoteDetail: React.FC = () => {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [noteThread, setNoteThread] = useState<NoteThreadType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNoteThread = async () => {
      if (!noteId) return;

      try {
        setIsLoading(true);
        const response = await api.get(`/notes/${noteId}`);
        
        if (response.data.success) {
          setNoteThread(response.data.data);
        } else {
          addToast({
            type: 'error',
            message: response.data.error || 'Failed to fetch note',
          });
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching note:', error);
        addToast({
          type: 'error',
          message: 'Failed to fetch note. Please try again.',
        });
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNoteThread();
  }, [noteId, navigate, addToast]);

  const handleAddReply = async (parentId: string, content: string) => {
    if (!noteThread) return;

    try {
      const response = await api.post('/notes', {
        parentId,
        title: `Reply to ${noteThread.rootNote.title}`,
        content,
        type: 'basic-note',
        fields: {},
        tags: [],
      });
      
      if (response.data.success) {
        // Add the new reply to the thread
        setNoteThread({
          ...noteThread,
          replies: [...noteThread.replies, response.data.data],
        });
        
        addToast({
          type: 'success',
          message: 'Reply added successfully',
        });
      } else {
        addToast({
          type: 'error',
          message: response.data.error || 'Failed to add reply',
        });
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      addToast({
        type: 'error',
        message: 'Failed to add reply. Please try again.',
      });
    }
  };

  // For demo purposes, create a mock note thread
  const demoNoteThread: NoteThreadType = {
    id: '3',
    rootNote: {
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
      isPinned: false,
      isArchived: false,
      threadId: '3',
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      updatedAt: new Date(Date.now() - 259200000).toISOString()
    },
    replies: [
      {
        id: '4',
        userId: 'user1',
        title: 'Reply to Kickoff Meeting Notes',
        content: 'I\'ve started researching APIs for the project. Found some good options we can discuss tomorrow.',
        type: 'Basic Note',
        fields: {},
        parentId: '3',
        threadId: '3',
        tags: ['research'],
        isPinned: false,
        isArchived: false,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 172800000).toISOString()
      },
      {
        id: '5',
        userId: 'user1',
        title: 'Reply to Kickoff Meeting Notes',
        content: 'Just pushed the initial repo setup. Everyone should have access now!',
        type: 'Basic Note',
        fields: {},
        parentId: '3',
        threadId: '3',
        tags: ['setup'],
        isPinned: false,
        isArchived: false,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString()
      }
    ]
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If we don't have a real note thread yet, use the demo one
  const displayNoteThread = noteThread || demoNoteThread;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            icon={<ChevronLeft className="h-4 w-4" />}
          >
            Back
          </Button>
          <span className="mx-2 text-neutral-300">|</span>
          <h1 className="text-xl font-semibold text-neutral-900">Note Details</h1>
        </div>

        <div className="flex mt-4 sm:mt-0 space-x-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Pin className="h-4 w-4" />}
          >
            Pin
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Copy className="h-4 w-4" />}
          >
            Duplicate
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Share className="h-4 w-4" />}
          >
            Share
          </Button>
          <Link to={`/notes/${noteId}/edit`}>
            <Button
              variant="outline"
              size="sm"
              icon={<Edit className="h-4 w-4" />}
            >
              Edit
            </Button>
          </Link>
          <Button
            variant="danger"
            size="sm"
            icon={<Trash className="h-4 w-4" />}
          >
            Delete
          </Button>
        </div>
      </div>

      <NoteThread thread={displayNoteThread} onAddReply={handleAddReply} />
    </div>
  );
};

export default NoteDetail;