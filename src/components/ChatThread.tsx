import { useEffect, useRef, useState } from 'react';
import type { Thread } from '../types';
import { useAppState } from '../state/AppState';

export default function ChatThread({ thread }: { thread: Thread }) {
  const { usersById, currentUser, messagesByThread, loadThread, sendMessage, provider } = useAppState();
  const friendId = thread.userIds.find(id => id !== currentUser.id) || currentUser.id;
  const friend = usersById.get(friendId);
  const msgs = messagesByThread.get(thread.id) || [];
  const [text, setText] = useState('');
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadThread(thread.id);
    const unsub = provider.onThread(thread.id, () => loadThread(thread.id));
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thread.id]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: 'smooth' });
  }, [msgs.length]);

  async function send() {
    if (!text.trim()) return;
    await sendMessage(thread.id, text.trim());
    setText('');
  }

  return (
    <div className="thread">
      <div className="card" style={{ margin: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="avatar">{friend?.name?.[0] || '?'}</div>
          <div>
            <div><strong>{friend?.name || 'Friend'}</strong></div>
            <div className="small">Direct messages</div>
          </div>
        </div>
      </div>
      <div className="msgs" ref={scroller} style={{ padding: 8 }}>
        {msgs.map(m => {
          const mine = m.userId === currentUser.id;
          return (
            <div key={m.id} className={`msg ${mine ? 'me' : 'them'}`}>
              {m.text}
            </div>
          );
        })}
        {msgs.length === 0 && <div className="empty">No messages yet. Say hi!</div>}
      </div>
      <div className="thread-input" style={{ padding: 8 }}>
        <input
          className="input"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Message"
          style={{ flex: 1 }}
        />
        <button className="button primary" onClick={send}>Send</button>
      </div>
    </div>
  );
}

