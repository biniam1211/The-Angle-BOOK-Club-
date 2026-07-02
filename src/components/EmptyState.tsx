import React from 'react';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {action && (
        <button className="empty-state-action" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
};

// Predefined Empty States
export const EmptyFeed: React.FC = () => (
  <EmptyState
    icon="📚"
    title="No posts yet"
    description="Be the first to share a book you're reading! Start the conversation."
    action={{
      label: 'Create Post',
      onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
    }}
  />
);

export const EmptyChats: React.FC = () => (
  <EmptyState
    icon="💬"
    title="No conversations"
    description="Start a conversation with other book lovers to discuss your favorite reads."
  />
);

export const EmptySearch: React.FC = () => (
  <EmptyState
    icon="🔍"
    title="No results found"
    description="Try adjusting your search terms or browse our recommendations."
  />
);
