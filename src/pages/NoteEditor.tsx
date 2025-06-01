import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NoteTypeSelector from '@/components/notes/NoteTypeSelector';
import NoteForm from '@/components/notes/NoteForm';
import { NoteType, Note } from '../types';
import { api } from '../utils/api';
import { toast } from 'sonner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { systemNoteTypes, basicNoteType } from '../data/systemNoteTypes';

const NoteEditor: React.FC = () => {
  const { noteId } = useParams<{ noteId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedNoteType, setSelectedNoteType] = useState<NoteType | null>(null);
  const [availableNoteTypes, setAvailableNoteTypes] = useState<NoteType[]>([]); // Renamed from noteTypes to availableNoteTypes for clarity
  const [note, setNote] = useState<Note | null>(null);

  // Fetch note types and note (if editing)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch custom note types from API
        let customNoteTypes: NoteType[] = [];
        try {
          const customTypesResponse = await api.get('/note-types');
          if (customTypesResponse.data.success) {
            customNoteTypes = customTypesResponse.data.data;
          } else {
            console.error('Failed to fetch custom note types:', customTypesResponse.data.error);
            toast.error('Failed to load custom note types.');
          }
        } catch (error) {
          console.error('Error fetching custom note types:', error);
          toast.error('An error occurred while loading custom note types.');
        }
        
        const allNoteTypes = [basicNoteType as NoteType, ...systemNoteTypes as NoteType[], ...customNoteTypes];
        setAvailableNoteTypes(allNoteTypes);
        
        // If editing an existing note, fetch it
        if (noteId) {
          try {
            const response = await api.get(`/notes/${noteId}`);
            
            if (response.data.success) {
              setNote(response.data.data.rootNote);
              
              // Find the matching note type from the combined list
              const currentNoteType = allNoteTypes.find(
                (type) => type.id === response.data.data.rootNote.type
              );
              
              if (currentNoteType) {
                setSelectedNoteType(currentNoteType);
              } else {
                // Fallback to basic if type not found (e.g. custom type deleted)
                setSelectedNoteType(basicNoteType as NoteType);
                toast.error(`Note type "${response.data.data.rootNote.type}" not found. Defaulting to Basic Note.`); // Changed from toast.warn
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
          noteTypes={availableNoteTypes} // Use availableNoteTypes
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