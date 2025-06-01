import React, { useState } from 'react';
import { NoteThread as NoteThreadType, Note } from '../../types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Reply, Plus } from 'lucide-react';

dayjs.extend(relativeTime);

interface NoteThreadProps {
  thread: NoteThreadType;
  onAddSubNote: (parentId: string, content: string) => void;
}

const NoteThread: React.FC<NoteThreadProps> = ({ thread, onAddSubNote }) => {
  const [subNoteContent, setSubNoteContent] = useState('');
  const [isSubNoting, setIsSubNoting] = useState(false);

  const handleSubmitSubNote = () => {
    if (subNoteContent.trim()) {
      onAddSubNote(thread.id, subNoteContent);
      setSubNoteContent('');
      setIsSubNoting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Root note */}
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{thread.rootNote.title}</h2>
        
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <span className="font-medium bg-gray-100 px-2 py-0.5 rounded-full">
            {thread.rootNote.type}
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
          <div className="space-y-3">
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
  return (
    <div className="px-6 py-4 border-b last:border-b-0 border-gray-100">
      <div className="flex items-center text-xs text-gray-500 mb-2">
        <span className="font-medium bg-gray-100 px-2 py-0.5 rounded-full">
          {subNote.type}
        </span>
        <span className="mx-2">•</span>
        <time dateTime={subNote.createdAt}>{dayjs(subNote.createdAt).fromNow()}</time>
      </div>
      
      <div className="prose prose-sm max-w-none mb-2">
        <p className="text-gray-700 whitespace-pre-wrap">{subNote.content}</p>
      </div>
      
      {subNote.tags && subNote.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
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