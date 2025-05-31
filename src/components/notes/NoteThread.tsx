import React, { useState } from 'react';
import { NoteThread as NoteThreadType, Note } from '../../types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import { Reply, Plus } from 'lucide-react';

dayjs.extend(relativeTime);

interface NoteThreadProps {
  thread: NoteThreadType;
  onAddReply: (parentId: string, content: string) => void;
}

const NoteThread: React.FC<NoteThreadProps> = ({ thread, onAddReply }) => {
  const [replyContent, setReplyContent] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  const handleSubmitReply = () => {
    if (replyContent.trim()) {
      onAddReply(thread.id, replyContent);
      setReplyContent('');
      setIsReplying(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
      {/* Root note */}
      <div className="p-6">
        <h2 className="text-xl font-semibold text-neutral-900 mb-2">{thread.rootNote.title}</h2>
        
        <div className="flex items-center text-sm text-neutral-500 mb-4">
          <span className="font-medium bg-neutral-100 px-2 py-0.5 rounded-full">
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
          <p className="text-neutral-700 whitespace-pre-wrap">{thread.rootNote.content}</p>
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
        <div className="border-t border-neutral-200 pt-4">
          <h3 className="px-6 text-sm font-medium text-neutral-500 mb-2">
            Replies ({thread.replies.length})
          </h3>
          
          <div className="space-y-4">
            {thread.replies.map((reply) => (
              <ReplyNote key={reply.id} reply={reply} />
            ))}
          </div>
        </div>
      )}
      
      {/* Add reply */}
      <div className="border-t border-neutral-200 p-6 bg-neutral-50">
        {isReplying ? (
          <div className="space-y-3">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write your reply..."
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsReplying(false);
                  setReplyContent('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSubmitReply}
                icon={<Reply className="h-4 w-4" />}
              >
                Submit Reply
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={() => setIsReplying(true)}
            icon={<Plus className="h-4 w-4" />}
            fullWidth
          >
            Add a reply
          </Button>
        )}
      </div>
    </div>
  );
};

const ReplyNote: React.FC<{ reply: Note }> = ({ reply }) => {
  return (
    <div className="px-6 py-4 border-b last:border-b-0 border-neutral-100">
      <div className="flex items-center text-xs text-neutral-500 mb-2">
        <span className="font-medium bg-neutral-100 px-2 py-0.5 rounded-full">
          {reply.type}
        </span>
        <span className="mx-2">•</span>
        <time dateTime={reply.createdAt}>{dayjs(reply.createdAt).fromNow()}</time>
      </div>
      
      <div className="prose prose-sm max-w-none mb-2">
        <p className="text-neutral-700 whitespace-pre-wrap">{reply.content}</p>
      </div>
      
      {reply.tags && reply.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {reply.tags.map((tag, index) => (
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