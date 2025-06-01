import React, { useState, useEffect } from 'react'; // Added useEffect
import { NoteThread as NoteThreadType, Note, NoteType } from '../../types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Reply, Plus } from 'lucide-react';
import { systemNoteTypes, basicNoteType } from '../../data/systemNoteTypes';
import NoteForm from './NoteForm';
import NoteTypeIcon from '@/components/ui/NoteTypeIcon';
import { api } from '../../utils/api'; // Added api import
import { toast } from 'sonner'; // Added toast import

dayjs.extend(relativeTime);

// const allNoteTypes = [basicNoteType, ...systemNoteTypes] as NoteType[]; // This will be fetched

interface NoteThreadProps {
  thread: NoteThreadType;
  onAddSubNote: (parentId: string, content: string | Record<string, any>, noteType: NoteType) => void;
}

// Define props for SubNote
interface SubNoteProps {
  subNote: Note;
  onAddSubNote: (parentId: string, content: string | Record<string, any>, noteType: NoteType) => void;
  availableNoteTypes: NoteType[]; // Changed from allNoteTypes to availableNoteTypes
  basicNoteType: NoteType; // Ensure this matches the actual type of basicNoteType constant
  level: number;
}

const NoteThread: React.FC<NoteThreadProps> = ({ thread, onAddSubNote }) => {
  const [subNoteContent, setSubNoteContent] = useState('');
  const [isSubNoting, setIsSubNoting] = useState(false);
  const [selectedNoteType, setSelectedNoteType] = useState<NoteType>(basicNoteType as NoteType);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [availableNoteTypes, setAvailableNoteTypes] = useState<NoteType[]>([]);
  const [isLoadingTypes, setIsLoadingTypes] = useState(true);

  useEffect(() => {
    const fetchNoteTypes = async () => {
      try {
        setIsLoadingTypes(true);
        let customNoteTypes: NoteType[] = [];
        try {
          const customTypesResponse = await api.get('/note-types');
          if (customTypesResponse.data.success) {
            customNoteTypes = customTypesResponse.data.data;
          } else {
            console.error('Failed to fetch custom note types:', customTypesResponse.data.error);
            toast.error('Failed to load custom note types for sub-notes.');
          }
        } catch (error) {
          console.error('Error fetching custom note types:', error);
          toast.error('An error occurred while loading custom note types for sub-notes.');
        }
        const allFetchedNoteTypes = [basicNoteType as NoteType, ...systemNoteTypes as NoteType[], ...customNoteTypes];
        setAvailableNoteTypes(allFetchedNoteTypes);
      } catch (error) {
        console.error('Error fetching note types for thread:', error);
        toast.error('Failed to load note types for thread.');
      } finally {
        setIsLoadingTypes(false);
      }
    };
    fetchNoteTypes();
  }, []);

  const handleSubmitSubNote = () => {
    if (subNoteContent.trim()) {
      onAddSubNote(thread.rootNote.id, subNoteContent, selectedNoteType); // Ensure parentId is rootNote.id
      setSubNoteContent('');
      setIsSubNoting(false);
      setShowNoteForm(false);
      setSelectedNoteType(basicNoteType as NoteType);
    }
  };

  const handleNoteTypeChange = (typeId: string) => {
    const noteType = availableNoteTypes.find(type => type.id === typeId); // Use availableNoteTypes
    if (noteType) {
      setSelectedNoteType(noteType);
      setShowNoteForm(noteType.id !== 'basic-note');
    }
  };

  if (isLoadingTypes) {
    // Optional: Add a loading indicator for note types
    // return <p>Loading note types...</p>;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Root note */}
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{thread.rootNote.title}</h2>
        
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <span className="font-medium bg-gray-100 px-2 py-0.5 rounded-full flex items-center gap-1">
            <NoteTypeIcon 
              iconName={availableNoteTypes.find((type: NoteType) => type.id === thread.rootNote.type)?.icon || 'file-text'} // Use availableNoteTypes
              className="h-3 w-3" 
            />
            {availableNoteTypes.find((type: NoteType) => type.id === thread.rootNote.type)?.name || thread.rootNote.type} {/* Use availableNoteTypes */}
          </span>
          <span className="mx-2">•</span>
          <time dateTime={thread.rootNote.createdAt}>{dayjs(thread.rootNote.createdAt).fromNow()}</time>
          {thread.rootNote.updatedAt !== thread.rootNote.createdAt && (
            <>
              <span className="mx-2">•</span>
              <span>Updated {dayjs(thread.rootNote.updatedAt).fromNow()}</span>
            </>
          )}
        </div>
        
        <div className="prose prose-sm max-w-none mb-4">
          <p className="text-gray-700 whitespace-pre-wrap">{thread.rootNote.content}</p>
        </div>
        
        {thread.rootNote.tags && thread.rootNote.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {thread.rootNote.tags.map((tag, index) => (
              <span key={index} className="tag tag-blue">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
      
      {/* Sub Notes */}
      {thread.subNotes && thread.subNotes.length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <h3 className="px-6 text-sm font-medium text-gray-500 mb-2">
            Sub Notes ({thread.subNotes.length})
          </h3>
          
          <div className="space-y-4">
            {thread.subNotes.map((subNote) => (
              <SubNote 
                key={subNote.id} 
                subNote={subNote} 
                onAddSubNote={onAddSubNote}
                availableNoteTypes={availableNoteTypes} // Pass availableNoteTypes
                basicNoteType={basicNoteType as NoteType}
                level={0}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Add sub note to the ROOT note */}
      <div className="border-t border-gray-200 p-6 bg-gray-50">
        {isSubNoting ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Select
                value={selectedNoteType.id}
                onValueChange={handleNoteTypeChange}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select note type" />
                </SelectTrigger>
                <SelectContent>
                  {availableNoteTypes.map((type) => ( // Use availableNoteTypes
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center gap-2">
                        <NoteTypeIcon iconName={type.icon} className="h-4 w-4" />
                        {type.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {showNoteForm ? (
              <NoteForm
                noteType={selectedNoteType}
                initialValues={{}}
                onSubmit={(data) => {
                  onAddSubNote(thread.rootNote.id, data, selectedNoteType); // Ensure parentId is rootNote.id
                  setIsSubNoting(false);
                  setShowNoteForm(false);
                  setSelectedNoteType(basicNoteType as NoteType);
                }}
                onCancel={() => {
                  setIsSubNoting(false);
                  setShowNoteForm(false);
                  setSelectedNoteType(basicNoteType as NoteType);
                }}
              />
            ) : (
              <>
                <Textarea
                  value={subNoteContent}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSubNoteContent(e.target.value)}
                  placeholder="Write your sub note..."
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsSubNoting(false);
                      setSubNoteContent('');
                      setSelectedNoteType(basicNoteType as NoteType);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSubmitSubNote}
                  >
                    <Reply className="h-4 w-4" />
                    Submit Sub Note
                  </Button>
                </div>
              </>
            )}
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={() => setIsSubNoting(true)}
            className="w-full"
          >
            <Plus className="h-4 w-4" />
            Add a sub note
          </Button>
        )}
      </div>
    </div>
  );
};

const SubNote: React.FC<SubNoteProps> = ({ subNote, onAddSubNote, availableNoteTypes, basicNoteType, level }) => { // availableNoteTypes
  const noteTypeInfo = availableNoteTypes.find((type: NoteType) => type.id === subNote.type); // Use availableNoteTypes

  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [selectedReplyNoteType, setSelectedReplyNoteType] = useState<NoteType>(basicNoteType);
  const [showReplyNoteForm, setShowReplyNoteForm] = useState(false);

  const handleReplySubmit = () => {
    if (replyContent.trim() || showReplyNoteForm) { 
      // For NoteForm, actual content is passed by its own onSubmit
      if (!showReplyNoteForm && replyContent.trim()) {
         onAddSubNote(subNote.id, replyContent, selectedReplyNoteType);
      }
      // Resetting state is partly handled by NoteForm's onCancel/onSubmit
      // For basic textarea:
      if (!showReplyNoteForm) {
        setReplyContent('');
      }
      setIsReplying(false);
      setShowReplyNoteForm(false);
      setSelectedReplyNoteType(basicNoteType);
    }
  };
  
  const handleReplyNoteTypeChange = (typeId: string) => {
    const noteType = availableNoteTypes.find(type => type.id === typeId); // Use availableNoteTypes
    if (noteType) {
      setSelectedReplyNoteType(noteType);
      setShowReplyNoteForm(noteType.id !== 'basic-note');
    }
  };
  
  const formatFieldValue = (key: string, value: any): string | JSX.Element | null => {
    if (!value) return null;
    
    // Find field definition to get proper label
    const fieldDef = noteTypeInfo?.fields.find((field: any) => field.name === key);
    const label = fieldDef?.label || key.charAt(0).toUpperCase() + key.slice(1);
    
    // Format based on field type
    if (fieldDef?.type === 'date' && value) {
      return `${label}: ${dayjs(value).format('MMM D, YYYY')}`;
    }
    
    if (typeof value === 'string' && value.length > 100) {
      return (
        <div>
          <span className="font-medium">{label}:</span>
          <div className="mt-1 whitespace-pre-wrap">{value}</div>
        </div>
      );
    }
    
    return `${label}: ${value}`;
  };

  return (
    <div className={`px-6 py-4 border-b last:border-b-0 border-gray-100 ${level > 0 ? 'ml-6' : ''}`}>
      <div className="flex items-center text-xs text-gray-500 mb-2">
        <span className="font-medium bg-gray-100 px-2 py-0.5 rounded-full flex items-center gap-1">
          <NoteTypeIcon iconName={noteTypeInfo?.icon || 'file-text'} className="h-3 w-3" />
          {noteTypeInfo?.name || subNote.type}
        </span>
        <span className="mx-2">•</span>
        <time dateTime={subNote.createdAt}>{dayjs(subNote.createdAt).fromNow()}</time>
      </div>
      
      {subNote.title && subNote.title !== 'Sub Note' && (
        <h4 className="font-medium text-gray-900 mb-2">{subNote.title}</h4>
      )}
      
      <div className="prose prose-sm max-w-none mb-2">
        <p className="text-gray-700 whitespace-pre-wrap">{subNote.content}</p>
      </div>

      {/* Display custom fields if they exist */}
      {Object.entries(subNote.fields || {}).map(([key, value]) => {
        const formatted = formatFieldValue(key, value);
        if (!formatted) return null;
        
        return (
          <div key={key} className="text-sm text-gray-600 mt-2">
            {typeof formatted === 'string' ? formatted : formatted}
          </div>
        );
      })}
      
      {subNote.tags && subNote.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {subNote.tags.map((tag, index) => (
            <span key={index} className="tag tag-blue">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Reply Button */}
      <div className="mt-2">
        <Button variant="outline" size="sm" onClick={() => setIsReplying(true)} className="text-xs">
          <Reply className="h-3 w-3 mr-1" />
          Reply
        </Button>
      </div>

      {/* Reply Form */}
      {isReplying && (
        <div className="mt-4 space-y-3 p-4 bg-gray-50 rounded-md">
          <div className="flex items-center gap-2">
            <Select
              value={selectedReplyNoteType.id}
              onValueChange={handleReplyNoteTypeChange}
            >
              <SelectTrigger className="w-[180px] h-8 text-xs">
                <SelectValue placeholder="Select note type" />
              </SelectTrigger>
              <SelectContent>
                {availableNoteTypes.map((type) => ( // Use availableNoteTypes
                  <SelectItem key={type.id} value={type.id} className="text-xs">
                    <div className="flex items-center gap-1.5">
                      <NoteTypeIcon iconName={type.icon} className="h-3.5 w-3.5" />
                      {type.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showReplyNoteForm ? (
            <NoteForm
              noteType={selectedReplyNoteType}
              initialValues={{}}
              onSubmit={(data) => {
                onAddSubNote(subNote.id, data, selectedReplyNoteType);
                setIsReplying(false);
                setShowReplyNoteForm(false);
                setSelectedReplyNoteType(basicNoteType);
              }}
              onCancel={() => {
                setIsReplying(false);
                setShowReplyNoteForm(false);
                setSelectedReplyNoteType(basicNoteType);
              }}
            />
          ) : (
            <>
              <Textarea
                value={replyContent}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReplyContent(e.target.value)}
                placeholder={`Reply to this note...`}
                className="text-sm p-2"
                rows={3}
              />
              <div className="flex justify-end space-x-2 mt-2">
                <Button
                  variant="outline"
                  size="sm" // Changed from xs to sm
                  onClick={() => {
                    setIsReplying(false);
                    setReplyContent('');
                    setSelectedReplyNoteType(basicNoteType);
                    setShowReplyNoteForm(false);
                  }}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  size="sm" // Changed from xs to sm
                  onClick={handleReplySubmit} // For basic textarea submission
                  className="text-xs"
                >
                  <Reply className="h-3 w-3 mr-1" />
                  Submit Reply
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Nested SubNotes */}
      {subNote.subNotes && subNote.subNotes.length > 0 && (
        <div className="mt-4 space-y-4 border-l-2 border-gray-200 pl-4">
          {subNote.subNotes.map((childSubNote: Note) => ( // Added Note type for childSubNote
            <SubNote
              key={childSubNote.id}
              subNote={childSubNote}
              onAddSubNote={onAddSubNote}
              availableNoteTypes={availableNoteTypes} // Pass availableNoteTypes
              basicNoteType={basicNoteType}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default NoteThread;