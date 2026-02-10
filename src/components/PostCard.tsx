import React, { useState } from 'react';
import { Post, User } from '../types';
import { postsApi } from '../api/posts';
import { CommentList } from './CommentList';

interface PostCardProps {
  post: Post;
  currentUser: User;
  onPostUpdated: (post: Post) => void;
  onPostDeleted: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, currentUser, onPostUpdated, onPostDeleted }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(post.text);
  const [isLiked, setIsLiked] = useState(post.liked_by_current_user || false);
  const [likeCount, setLikeCount] = useState(post.like_count || 0);

  const isOwner = post.user_id === currentUser.id;

  const handleLike = async () => {
    try {
      const liked = await postsApi.toggleLike(post.id);
      setIsLiked(liked);
      setLikeCount(prev => liked ? prev + 1 : prev - 1);
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleEdit = async () => {
    if (!editText.trim()) return;

    try {
      const updated = await postsApi.updatePost(post.id, editText.trim());
      onPostUpdated(updated);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update post:', error);
      alert('Failed to update post');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;

    try {
      await postsApi.deletePost(post.id);
      onPostDeleted(post.id);
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post');
    }
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className="post-card card">
      <div className="post-header">
        <div className="avatar">
          {post.user?.avatar_url ? (
            <img src={post.user.avatar_url} alt={post.user.name} />
          ) : (
            <div className="avatar-text">{post.user?.name?.[0] || '?'}</div>
          )}
        </div>
        <div className="post-author">
          <div className="author-name">{post.user?.name}</div>
          <div className="post-time">{formatDate(post.created_at)}</div>
        </div>
        {isOwner && (
          <div className="post-actions">
            <button className="action-btn" onClick={() => setIsEditing(!isEditing)} title="Edit">
              ✏️
            </button>
            <button className="action-btn" onClick={handleDelete} title="Delete">
              🗑️
            </button>
          </div>
        )}
      </div>

      <div className="post-content">
        {isEditing ? (
          <div className="edit-mode">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={3}
              className="edit-textarea"
            />
            <div className="edit-actions">
              <button className="btn-cancel" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
              <button className="btn-save" onClick={handleEdit}>
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="post-text">{post.text}</div>
        )}

        {post.book && (
          <div className="post-book">
            {post.book.cover_url && (
              <img src={post.book.cover_url} alt={post.book.title} className="book-cover" />
            )}
            <div className="book-details">
              <div className="book-title">{post.book.title}</div>
              <div className="book-author">{post.book.author}</div>
            </div>
          </div>
        )}
      </div>

      <div className="post-stats">
        <button className={`like-btn ${isLiked ? 'liked' : ''}`} onClick={handleLike}>
          {isLiked ? '❤️' : '🤍'} {likeCount}
        </button>
        <span className="comment-count">💬 {post.comment_count || 0}</span>
      </div>

      <CommentList postId={post.id} />
    </div>
  );
};
