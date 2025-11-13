import { useMemo, useState } from 'react';
import type { Post } from '../types';
import { useAppState } from '../state/AppState';
import CommentList from './CommentList';

export default function PostCard({ post }: { post: Post }) {
  const { usersById, currentUser, toggleLike, addComment } = useAppState();
  const actor = usersById.get(post.userId);
  const [commentText, setCommentText] = useState('');

  const likeCount = post.likeUserIds.length;
  const likedByMe = useMemo(
    () => post.likeUserIds.includes(currentUser.id),
    [post.likeUserIds, currentUser.id]
  );

  const created = new Date(post.createdAt).toLocaleString();

  async function sendComment() {
    if (!commentText.trim()) return;
    await addComment(post.id, commentText.trim());
    setCommentText('');
  }

  return (
    <div className="card">
      <div className="post-head">
        <div className="avatar">{actor?.name?.[0] || '?'}</div>
        <div className="post-actor">
          <strong>{actor?.name || 'Someone'}</strong>
          <span className="small">{created}</span>
        </div>
      </div>

      <div style={{ marginTop: 10, whiteSpace: 'pre-wrap' }}>{post.text}</div>

      {post.book && (
        <div className="post-book">
          {post.book.coverUrl ? (
            <img className="cover" src={post.book.coverUrl} alt={post.book.title} />
          ) : (
            <div className="cover" />
          )}
          <div>
            <div><strong>{post.book.title}</strong></div>
            <div className="small">{post.book.author}</div>
          </div>
        </div>
      )}

      <div className="actions">
        <button
          className={likedByMe ? 'button' : 'button ghost'}
          onClick={() => toggleLike(post.id)}
          title="Like"
        >
          {likedByMe ? '❤️ Liked' : '🤍 Like'}
        </button>
        <span className="badge">{likeCount} likes</span>
      </div>

      <hr className="hr" />

      <div className="comment-box">
        <CommentList postId={post.id} />
        <div className="row">
          <input
            className="input"
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            placeholder="Write a comment"
            style={{ flex: 1 }}
          />
          <button className="button" onClick={sendComment}>Comment</button>
        </div>
      </div>
    </div>
  );
}

