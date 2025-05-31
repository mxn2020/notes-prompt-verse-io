import React from 'react';
import { Link } from 'react-router-dom';
import { Pin, MessageSquare, Edit } from 'lucide-react';
import { Note } from '../../types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

interface NoteCardProps {
  note: Note;
  onTogglePin?: (id: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onTogglePin }) => {
  const hasReplies = note.threadId && note.threadId === note.id;
  
  // Define background color based on note color
  let bgColorClass = 'bg-white';
  let borderColorClass = 'border-gray-200';
  
  if (note.color) {
    // This mapping would be more comprehensive in a real app
    switch (note.color) {
      case 'blue':
        bgColorClass = 'bg-primary-50';
        borderColorClass = 'border-primary-200';
        break;
      case 'green':
        bgColorClass = 'bg-secondary-50';
        borderColorClass = 'border-secondary-200';
        break;
      case 'yellow':
        bgColorClass = 'bg-accent-50';
        borderColorClass = 'border-accent-200';
        break;
      case 'red':
        bgColorClass = 'bg-error-50';
        borderColorClass = 'border-error-200';
        break;
    }
  }

  return (
    <div className={`rounded-lg shadow-sm border ${borderColorClass} ${bgColorClass} transition-all duration-200 hover:shadow-md overflow-hidden`}>
      <div className="p-4">
        {/* Title and pin button */}
        <div className="flex justify-between items-start mb-2">
          <Link to={`/notes/${note.id}`} className="text-lg font-medium text-gray-900 hover:text-primary-600">
            {note.title}
          </Link>
          {onTogglePin && (
            <button
              onClick={() => onTogglePin(note.id)}
              className={`p-1 rounded-full hover:bg-gray-100 ${note.isPinned ? 'text-primary-600' : 'text-gray-400'}`}
            >
              <Pin className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {/* Note type and date */}
        <div className="flex items-center text-xs text-gray-500 mb-3">
          <span className="font-medium bg-gray-100 px-2 py-0.5 rounded-full">
            {note.type}
          </span>
          <span className="mx-2">•</span>
          <time dateTime={note.updatedAt}>{dayjs(note.updatedAt).fromNow()}</time>
        </div>
        
        {/* Note content preview */}
        <div className="text-sm text-gray-700 mb-3 line-clamp-3">
          {note.content}
        </div>
        
        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {note.tags.map((tag, index) => (
              <span key={index} className="tag tag-blue">
                #{tag}
              </span>
            ))}
          </div>
        )}
        
        {/* Footer with actions */}
        <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-200">
          <div className="flex space-x-2">
            {hasReplies && (
              <div className="flex items-center text-xs text-gray-500">
                <MessageSquare className="h-3 w-3 mr-1" />
                <span>Thread</span>
              </div>
            )}
            {note.category && (
              <div className="flex items-center text-xs text-gray-500">
                <span className="mr-1">in</span>
                <span className="font-medium">{note.category}</span>
              </div>
            )}
          </div>
          
          <Link 
            to={`/notes/${note.id}/edit`}
            className="p-1 rounded text-gray-400 hover:text-primary-600 hover:bg-gray-100"
          >
            <Edit className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;