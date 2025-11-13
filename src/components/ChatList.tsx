import type { Thread } from '../types';
import { useAppState } from '../state/AppState';

export default function ChatList({
  threads,
  activeThreadId,
  onSelect
}: {
  threads: Thread[];
  activeThreadId: string | null;
  onSelect: (id: string) => void;
}) {
  const { currentUser, usersById } = useAppState();

  return (
    <div className="chat-list">
      {threads.map(t => {
        const friendId = t.userIds.find(id => id !== currentUser.id) || currentUser.id;
        const friend = usersById.get(friendId);
        const isActive = activeThreadId === t.id;
        return (
          <div
            key={t.id}
            className={isActive ? 'chat-item active' : 'chat-item'}
            onClick={() => onSelect(t.id)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className="avatar">{friend?.name?.[0] || '?'}</div>
              <div>
                <div><strong>{friend?.name || 'Friend'}</strong></div>
                <div className="small">
                  Active {new Date(t.lastMessageAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
            <span className="badge">Open</span>
          </div>
        );
      })}
      {threads.length === 0 && <div className="empty">No conversations yet.</div>}
    </div>
  );
}

