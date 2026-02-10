import React, { useState, useEffect } from 'react';
import { ChatList } from '../components/ChatList';
import { ChatThread } from '../components/ChatThread';
import { Thread } from '../types';
import { messagesApi } from '../api/messages';

export const ChatsPage: React.FC = () => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadThreads = async () => {
    try {
      const fetchedThreads = await messagesApi.getThreads();
      setThreads(fetchedThreads);
    } catch (error) {
      console.error('Failed to load threads:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadThreads();
  }, []);

  const selectedThread = threads.find((t) => t.id === selectedThreadId);

  if (loading) {
    return <div className="loading">Loading chats...</div>;
  }

  return (
    <div className="chats-container">
      {!selectedThreadId || window.innerWidth > 768 ? (
        <ChatList
          threads={threads}
          selectedThreadId={selectedThreadId}
          onSelectThread={setSelectedThreadId}
        />
      ) : null}

      {selectedThread && (
        <ChatThread
          thread={selectedThread}
          onBack={() => setSelectedThreadId(null)}
        />
      )}

      {!selectedThread && window.innerWidth > 768 && (
        <div className="chat-empty-state">
          <p>Select a conversation to start chatting</p>
        </div>
      )}
    </div>
  );
};
