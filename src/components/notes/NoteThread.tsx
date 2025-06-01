import React, { useState } from 'react';
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

dayjs.extend(relativeTime);

const allNoteTypes = [basicNoteType, ...systemNoteTypes] as NoteType[];

interface NoteThreadProps {
  thread: NoteThreadType;
  onAddSubNote: (parentId: string, content: string | Record<string, any>, noteType: NoteType) => void;
}

const NoteThread: React.FC<NoteThreadProps> = ({ thread, onAddSubNote }) => {
  const [subNoteContent, setSubNoteContent] = useState('');
  const [isSubNoting, setIsSubNoting] = useState(false);
  const [selectedNoteType, setSelectedNoteType] = useState<NoteType>(basicNoteType as NoteType);
  const [showNoteForm, setShowNoteForm] = useState(false);

  const handleSubmitSubNote = () => {
    if (subNoteContent.trim()) {
      onAddSubNote(thread.id, subNoteContent, selectedNoteType);
      setSubNoteContent('');
      setIsSubNoting(false);
      setShowNoteForm(false);
      setSelectedNoteType(basicNoteType as NoteType);
    }
  };

  const handleNoteTypeChange = (typeId: string) => {
    const noteType = allNoteTypes.find(type => type.id === typeId);
    if (noteType) {
      setSelectedNoteType(noteType);
      setShowNoteForm(noteType.id !== 'basic-note');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Root note */}
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{thread.rootNote.title}</h2>
        
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <span className="font-medium bg-gray-100 px-2 py-0.5 rounded-full flex items-center gap-1">
            <NoteTypeIcon 
              iconName={allNoteTypes.find((type: NoteType) => type.id === thread.rootNote.type)?.icon || 'file-text'} 
              className="h-3 w-3" 
            />
            {allNoteTypes.find((type: NoteType) => type.id === thread.rootNote.type)?.name || thread.rootNote.type}
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
      
      {/* Replies */}
      {thread.replies && thread.replies.length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <h3 className="px-6 text-sm font-medium text-gray-500 mb-2">
            Replies ({thread.replies.length})
          </h3>
          
          <div className="space-y-4">
            {thread.replies.map((subNote) => (
              <SubNote key={subNote.id} subNote={subNote} />
            ))}
          </div>
        </div>
      )}
      
      {/* Add sub note */}
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
                  {allNoteTypes.map((type) => (
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
                  onAddSubNote(thread.id, data, selectedNoteType);
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

const SubNote: React.FC<{ subNote: Note }> = ({ subNote }) => {
  const noteTypeInfo = allNoteTypes.find((type: NoteType) => type.id === subNote.type);
  
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
    <div className="px-6 py-4 border-b last:border-b-0 border-gray-100">
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
    </div>
  );
};

export default NoteThread;