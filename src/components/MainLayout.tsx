import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { FeedPage } from '../pages/FeedPage';
import { ChatsPage } from '../pages/ChatsPage';
import { useAuth } from '../context/AuthContext';

export const MainLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="container">
      <header className="header">
        <div className="brand">📚 Readers Feed</div>

        <nav className="tabs">
          <button
            className={`tab ${isActive('/') ? 'active' : ''}`}
            onClick={() => navigate('/')}
          >
            Feed
          </button>
          <button
            className={`tab ${isActive('/chats') ? 'active' : ''}`}
            onClick={() => navigate('/chats')}
          >
            Chats
          </button>
        </nav>

        <div className="user-menu">
          <div className="avatar">{user?.name?.[0] || '?'}</div>
          <span className="user-name">{user?.name}</span>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            ↗
          </button>
        </div>
      </header>

      <main className="main">
        <Routes>
          <Route path="/" element={<FeedPage />} />
          <Route path="/chats" element={<ChatsPage />} />
        </Routes>
      </main>
    </div>
  );
};
