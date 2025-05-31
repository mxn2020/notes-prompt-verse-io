import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import NoteTypeSelector from '../components/notes/NoteTypeSelector';
import NoteForm from '../components/notes/NoteForm';
import { NoteType, Note } from '../types';
import { api } from '../utils/api';
import { toast } from 'sonner';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { systemNoteTypes, basicNoteType } from '../data/systemNoteTypes';

const NoteEditor: React.FC = () => {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedNoteType, setSelectedNoteType] = useState<NoteType | null>(null);
  const [noteTypes, setNoteTypes] = useState<NoteType[]>([]);
  const [note, setNote] = useState<Note | null>(null);

  // Fetch note types and note (if editing)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // For demo purposes, use system note types
        // In a real app, we'd fetch from API
        const allNoteTypes = [basicNoteType, ...systemNoteTypes];
        setNoteTypes(allNoteTypes as NoteType[]);
        
        // If editing an existing note, fetch it
        if (noteId) {
          try {
            const response = await api.get(`/notes/${noteId}`);
            
            if (response.data.success) {
              setNote(response.data.data.rootNote);
              
              // Find the matching note type
              const noteType = allNoteTypes.find(
                (type) => type.id === response.data.data.rootNote.type
              );
              
              if (noteType) {
                setSelectedNoteType(noteType as NoteType);
              }
            } else {
              toast.error(response.data.error || 'Failed to fetch note');
              navigate('/');
            }
          } catch (error) {
            console.error('Error fetching note:', error);
            toast.error('Failed to fetch note. Please try again.');
            navigate('/');
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [noteId, navigate]);

  const handleNoteTypeSelect = (noteType: NoteType) => {
    setSelectedNoteType(noteType);
  };

  const handleSubmit = async (data: Record<string, any>) => {
    if (!selectedNoteType) return;
    
    try {
      setIsSubmitting(true);
      
      if (noteId) {
        // Update existing note
        const response = await api.put(`/notes/${noteId}`, {
          ...data,
          type: selectedNoteType.id,
        });
        
        if (response.data.success) {        toast.success('Note updated successfully');
        navigate(`/notes/${noteId}`);
      } else {
        toast.error(response.data.error || 'Failed to update note');
      }
    } else {
      // Create new note
      const response = await api.post('/notes', {
        ...data,
        type: selectedNoteType.id,
        tags: [], // Would be set by user in real app
      });
      
      if (response.data.success) {
        toast.success('Note created successfully');
        navigate(`/notes/${response.data.data.id}`);
      } else {
        toast.error(response.data.error || 'Failed to create note');
      }
    }
  } catch (error) {
    console.error('Error submitting note:', error);
    toast.error('Failed to save note. Please try again.');
  } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <span className="mx-2 text-gray-300">|</span>
        <h1 className="text-xl font-semibold text-gray-900">
          {noteId ? 'Edit Note' : 'Create New Note'}
        </h1>
      </div>

      {!selectedNoteType ? (
        <NoteTypeSelector
          noteTypes={noteTypes}
          onSelect={handleNoteTypeSelect}
        />
      ) : (
        <NoteForm
          noteType={selectedNoteType}
          initialValues={note || {}}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

export default NoteEditor;