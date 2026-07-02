import React from 'react';

export const SkeletonPost: React.FC = () => (
  <div className="skeleton-post card">
    <div className="skeleton-header">
      <div className="skeleton-avatar" />
      <div className="skeleton-author">
        <div className="skeleton-text skeleton-name" />
        <div className="skeleton-text skeleton-time" />
      </div>
    </div>
    <div className="skeleton-content">
      <div className="skeleton-text skeleton-line" />
      <div className="skeleton-text skeleton-line" />
      <div className="skeleton-text skeleton-line-short" />
    </div>
    <div className="skeleton-book">
      <div className="skeleton-cover" />
      <div className="skeleton-book-info">
        <div className="skeleton-text skeleton-book-title" />
        <div className="skeleton-text skeleton-book-author" />
      </div>
    </div>
  </div>
);

export const SkeletonFeed: React.FC<{ count?: number }> = ({ count = 3 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonPost key={i} />
    ))}
  </>
);

export const SkeletonChat: React.FC = () => (
  <div className="skeleton-chat-item">
    <div className="skeleton-avatar" />
    <div className="skeleton-chat-info">
      <div className="skeleton-text skeleton-name" />
      <div className="skeleton-text skeleton-preview" />
    </div>
    <div className="skeleton-text skeleton-time-small" />
  </div>
);
