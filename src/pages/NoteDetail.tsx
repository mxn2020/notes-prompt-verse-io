import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Edit, Trash, Copy, Pin, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NoteThread from '@/components/notes/NoteThread';
import { NoteThread as NoteThreadType, NoteType } from '../types';
import { api } from '../utils/api';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const NoteDetail: React.FC = () => {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
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
          toast.error(response.data.error || 'Failed to fetch note');
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching note:', error);
        toast.error('Failed to fetch note. Please try again.');
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNoteThread();
  }, [noteId, navigate]);

  const handleAddSubNote = async (parentId: string, content: string | Record<string, any>, noteType: NoteType) => {
    if (!noteThread) return;

    try {
      // Handle different content types based on note type
      const isBasicNote = noteType.id === 'basic-note';
      const noteData = {
        parentId,
        title: isBasicNote 
          ? 'Sub Note' 
          : (typeof content === 'object' && content.title) || `Sub Note to ${noteThread.rootNote.title}`,
        content: isBasicNote 
          ? content as string 
          : (typeof content === 'object' && content.content) || '',
        type: noteType.id,
        fields: isBasicNote 
          ? {} 
          : (typeof content === 'object' ? { ...content } : {}),
        tags: [],
      };

      // Remove title and content from fields if they exist to avoid duplication
      if (typeof content === 'object' && noteData.fields) {
        delete noteData.fields.title;
        delete noteData.fields.content;
      }

      const response = await api.post('/notes', noteData);
      
      if (response.data.success) {
        // Add the new sub note to the thread
        setNoteThread({
          ...noteThread,
          replies: [...noteThread.replies, response.data.data],
        });

        toast.success('Sub note added successfully');
      } else {
        toast.error(response.data.error || 'Failed to add sub note');
      }
    } catch (error) {
      console.error('Error adding sub note:', error);
      toast.error('Failed to add sub note. Please try again.');
    }
  };

  const handleTogglePin = async () => {
    if (!noteThread) return;

    try {
      const updatedNote = { 
        ...noteThread.rootNote, 
        isPinned: !noteThread.rootNote.isPinned 
      };
      
      const response = await api.put(`/notes/${noteThread.rootNote.id}`, {
        isPinned: updatedNote.isPinned,
      });
      
      if (response.data.success) {
        setNoteThread({
          ...noteThread,
          rootNote: updatedNote,
        });
        toast.success(updatedNote.isPinned ? 'Note pinned' : 'Note unpinned');
      } else {
        toast.error(response.data.error || 'Failed to update note');
      }
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note. Please try again.');
    }
  };

  const handleDuplicate = async () => {
    if (!noteThread) return;

    try {
      const note = noteThread.rootNote;
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
        toast.success('Note duplicated successfully');
        navigate(`/notes/${response.data.data.id}`);
      } else {
        toast.error(response.data.error || 'Failed to duplicate note');
      }
    } catch (error) {
      console.error('Error duplicating note:', error);
      toast.error('Failed to duplicate note. Please try again.');
    }
  };

  const handleShare = async () => {
    if (!noteThread) return;

    try {
      const note = noteThread.rootNote;
      const shareText = `${note.title}\n\n${note.content}\n\n${note.tags?.length ? `Tags: ${note.tags.map(tag => `#${tag}`).join(' ')}` : ''}`;
      
      // Check if the browser supports the Web Share API
      if (navigator.share) {
        await navigator.share({
          title: note.title,
          text: shareText,
          url: window.location.href,
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
        const note = noteThread.rootNote;
        const shareText = `${note.title}\n\n${note.content}`;
        await navigator.clipboard.writeText(shareText);
        toast.success('Note content copied to clipboard');
      } catch (clipboardError) {
        toast.error('Failed to share note. Please try again.');
      }
    }
  };

  const handleDelete = async () => {
    if (!noteThread) return;

    const confirmed = window.confirm(
      'Are you sure you want to delete this note? This action cannot be undone.'
    );
    
    if (!confirmed) return;

    try {
      const response = await api.delete(`/notes/${noteThread.rootNote.id}`);
      
      if (response.data.success) {
        toast.success('Note deleted successfully');
        navigate('/');
      } else {
        toast.error(response.data.error || 'Failed to delete note');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!noteThread) {
    return null;
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <span className="mx-2 text-gray-300">|</span>
          <h1 className="text-xl font-semibold text-gray-900">Note Details</h1>
        </div>

        <div className="flex mt-4 sm:mt-0 space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTogglePin}
          >
            <Pin className="h-4 w-4" />
            {noteThread.rootNote.isPinned ? 'Unpin' : 'Pin'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDuplicate}
          >
            <Copy className="h-4 w-4" />
            Duplicate
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
          >
            <Share className="h-4 w-4" />
            Share
          </Button>
          <Link to={`/notes/${noteId}/edit`}>
            <Button
              variant="outline"
              size="sm"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
          >
            <Trash className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <NoteThread thread={noteThread} onAddSubNote={handleAddSubNote} />
    </div>
  );
};

export default NoteDetail;