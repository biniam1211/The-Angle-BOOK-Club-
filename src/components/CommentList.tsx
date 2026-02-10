import React, { useState, useEffect } from 'react';
import { Comment } from '../types';
import { commentsApi } from '../api/comments';

interface CommentListProps {
  postId: string;
}

export const CommentList: React.FC<CommentListProps> = ({ postId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);

  const loadComments = async () => {
    try {
      const fetchedComments = await commentsApi.getComments(postId);
      setComments(fetchedComments);
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  useEffect(() => {
    loadComments();
  }, [postId]);

  const handleSubmitComment = async () => {
    if (!commentText.trim()) return;

    setLoading(true);
    try {
      await commentsApi.createComment(postId, commentText.trim());
      setCommentText('');
      await loadComments();
    } catch (error) {
      console.error('Failed to create comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(diff / 3600000);
    if (hours < 24) return `${hours}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="comments-section">
      {comments.length > 0 && (
        <div className="comments-list">
          {comments.map((comment) => (
            <div key={comment.id} className="comment">
              <div className="comment-avatar">
                {comment.user?.avatar_url ? (
                  <img src={comment.user.avatar_url} alt={comment.user.name} />
                ) : (
                  <div className="avatar-text">{comment.user?.name?.[0] || '?'}</div>
                )}
              </div>
              <div className="comment-content">
                <div className="comment-header">
                  <span className="comment-author">{comment.user?.name}</span>
                  <span className="comment-time">{formatDate(comment.created_at)}</span>
                </div>
                <div className="comment-text">{comment.text}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="comment-input-container">
        <input
          type="text"
          className="comment-input"
          placeholder="Write a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
        />
        <button
          className="comment-submit"
          onClick={handleSubmitComment}
          disabled={loading || !commentText.trim()}
        >
          {loading ? '...' : '→'}
        </button>
      </div>
    </div>
  );
};
