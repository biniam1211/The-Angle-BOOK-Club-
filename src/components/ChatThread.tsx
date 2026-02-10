import React, { useState, useEffect, useRef } from 'react';
import { Thread, Message } from '../types';
import { messagesApi } from '../api/messages';
import { useAuth } from '../context/AuthContext';

interface ChatThreadProps {
  thread: Thread;
  onBack: () => void;
}

export const ChatThread: React.FC<ChatThreadProps> = ({ thread, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const otherUser = thread.participants?.find(p => p.id !== user?.id);

  const loadMessages = async () => {
    try {
      const fetchedMessages = await messagesApi.getMessages(thread.id);
      setMessages(fetchedMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  useEffect(() => {
    loadMessages();

    // Poll for new messages every 3 seconds (simple approach)
    const interval = setInterval(loadMessages, 3000);

    return () => clearInterval(interval);
  }, [thread.id]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;

    setLoading(true);
    try {
      await messagesApi.sendMessage(thread.id, messageText.trim());
      setMessageText('');
      await loadMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-thread">
      <div className="chat-thread-header">
        <button className="back-btn" onClick={onBack}>
          ←
        </button>
        <div className="avatar">
          {otherUser?.avatar_url ? (
            <img src={otherUser.avatar_url} alt={otherUser.name} />
          ) : (
            <div className="avatar-text">{otherUser?.name?.[0] || '?'}</div>
          )}
        </div>
        <div className="header-info">
          <div className="header-name">{otherUser?.name || 'Unknown'}</div>
          <div className="header-status">Active</div>
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-state">
            <p>No messages yet. Say hi! 👋</p>
          </div>
        ) : (
          messages.map((message) => {
            const isMine = message.user_id === user?.id;

            return (
              <div
                key={message.id}
                className={`message ${isMine ? 'message-mine' : 'message-theirs'}`}
              >
                <div className="message-content">
                  <div className="message-text">{message.text}</div>
                  <div className="message-time">{formatTime(message.created_at)}</div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <input
          type="text"
          className="chat-input"
          placeholder="Type a message..."
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
        />
        <button
          className="send-btn"
          onClick={handleSendMessage}
          disabled={loading || !messageText.trim()}
        >
          {loading ? '...' : '→'}
        </button>
      </div>
    </div>
  );
};
