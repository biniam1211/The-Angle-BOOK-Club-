import React from 'react';
import { Thread } from '../types';
import { useAuth } from '../context/AuthContext';

interface ChatListProps {
  threads: Thread[];
  selectedThreadId: string | null;
  onSelectThread: (threadId: string) => void;
}

export const ChatList: React.FC<ChatListProps> = ({ threads, selectedThreadId, onSelectThread }) => {
  const { user } = useAuth();

  const getOtherUser = (thread: Thread) => {
    return thread.participants?.find(p => p.id !== user?.id);
  };

  const formatTime = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();

    if (isToday) {
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString();
  };

  return (
    <div className="chat-list">
      <div className="chat-list-header">
        <h2>Messages</h2>
      </div>

      <div className="chat-list-items">
        {threads.length === 0 ? (
          <div className="empty-state">
            <p>No conversations yet</p>
          </div>
        ) : (
          threads.map((thread) => {
            const otherUser = getOtherUser(thread);
            const isSelected = selectedThreadId === thread.id;

            return (
              <div
                key={thread.id}
                className={`chat-list-item ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectThread(thread.id)}
              >
                <div className="avatar">
                  {otherUser?.avatar_url ? (
                    <img src={otherUser.avatar_url} alt={otherUser.name} />
                  ) : (
                    <div className="avatar-text">{otherUser?.name?.[0] || '?'}</div>
                  )}
                </div>

                <div className="chat-info">
                  <div className="chat-name">{otherUser?.name || 'Unknown'}</div>
                  {thread.last_message && (
                    <div className="chat-preview">{thread.last_message.text}</div>
                  )}
                </div>

                {thread.last_message && (
                  <div className="chat-time">{formatTime(thread.last_message.created_at)}</div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
