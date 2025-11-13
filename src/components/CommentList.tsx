import { useEffect, useState } from 'react';
import type { Comment } from '../types';
import { useAppState } from '../state/AppState';

export default function CommentList({ postId }: { postId: string }) {
  const { commentsByPost, usersById, provider } = useAppState();
  const [comments, setComments] = useState<Comment[]>(commentsByPost.get(postId) || []);

  useEffect(() => {
    const unsub = provider.onFeed(async () => {
      setComments(commentsByPost.get(postId) || []);
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId, provider, commentsByPost]);

  if (comments.length === 0) return null;

  return (
    <div style={{ display: 'grid', gap: 6 }}>
      {comments.map(c => {
        const u = usersById.get(c.userId);
        return (
          <div className="comment" key={c.id}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div className="avatar" style={{ width: 22, height: 22, fontSize: 12 }}>
                {u?.name?.[0] || '?'}
              </div>
              <strong>{u?.name || 'User'}</strong>
              <span className="small">{new Date(c.createdAt).toLocaleString()}</span>
            </div>
            <div>{c.text}</div>
          </div>
        );
      })}
    </div>
  );
}

