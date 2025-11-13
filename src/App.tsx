import { useMemo, useState } from 'react';
import { useAppState } from './state/AppState';
import Composer from './components/Composer';
import PostCard from './components/PostCard';
import ChatList from './components/ChatList';
import ChatThread from './components/ChatThread';

export default function App() {
  const { feed, threads, currentUser } = useAppState();
  const [activeTab, setActiveTab] = useState<'feed' | 'chat'>('feed');
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  const activeThread = useMemo(
    () => threads.find(t => t.id === activeThreadId) || null,
    [threads, activeThreadId]
  );

  return (
    <div className="container">
      <header className="header">
        <div className="brand">Readers Feed</div>
        <div className="tabs">
          <button
            className={activeTab === 'feed' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('feed')}
          >
            Feed
          </button>
          <button
            className={activeTab === 'chat' ? 'tab active' : 'tab'}
            onClick={() => setActiveTab('chat')}
          >
            Chats
          </button>
        </div>
        <div className="user">
          <div className="avatar">{currentUser.name[0]}</div>
          <span>{currentUser.name}</span>
        </div>
      </header>

      {activeTab === 'feed' ? (
        <main className="main two-col">
          <section className="content">
            <Composer />
            <div className="feed">
              {feed.length === 0 ? (
                <div className="empty">No posts yet. Share a book you love!</div>
              ) : (
                feed.map(post => <PostCard key={post.id} post={post} />)
              )}
            </div>
          </section>
          <aside className="sidebar">
            <h3>Tips</h3>
            <ul className="tips">
              <li>Tag the book title and author.</li>
              <li>Add a cover image URL for a richer post.</li>
              <li>Start a chat with friends about a book.</li>
            </ul>
          </aside>
        </main>
      ) : (
        <main className="main two-col">
          <aside className="left">
            <ChatList
              threads={threads}
              activeThreadId={activeThreadId}
              onSelect={setActiveThreadId}
            />
          </aside>
          <section className="content">
            {activeThread ? (
              <ChatThread thread={activeThread} />
            ) : (
              <div className="empty">Select a conversation to start chatting.</div>
            )}
          </section>
        </main>
      )}
    </div>
  );
}

