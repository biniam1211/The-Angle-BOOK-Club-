# The Angle BOOK Club - Backend API

Backend API for The Angle BOOK Club mobile app - a social platform for book lovers.

## Features

- **Authentication**: JWT-based auth with registration/login
- **Posts**: Create, read, update, delete posts with optional book tagging
- **Social**: Likes, comments on posts
- **Messaging**: Real-time 1-on-1 chat with Socket.io
- **Books**: Google Books API integration for book search
- **Real-time**: WebSocket support for live messaging

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Real-time**: Socket.io
- **Auth**: JWT (jsonwebtoken) + bcrypt
- **Validation**: Zod
- **External API**: Google Books API

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Google Books API key (optional, for book search)

### Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and configure:
- `DATABASE_URL`: Your PostgreSQL connection string
- `JWT_SECRET`: A secure random string
- `GOOGLE_BOOKS_API_KEY`: Your Google Books API key (optional)

3. Set up the database:
```bash
# Create database
createdb angle_book_club

# Run migrations
npm run migrate
```

### Development

Start the dev server with hot reload:
```bash
npm run dev
```

Server runs on `http://localhost:3001`

### Production

Build and start:
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Posts
- `GET /api/posts` - Get feed (public)
- `POST /api/posts` - Create post (requires auth)
- `GET /api/posts/:id` - Get single post
- `PUT /api/posts/:id` - Update post (requires auth)
- `DELETE /api/posts/:id` - Delete post (requires auth)
- `GET /api/posts/user/:userId` - Get user's posts

### Likes
- `POST /api/likes/:postId` - Toggle like on post (requires auth)

### Comments
- `GET /api/comments/:postId` - Get post comments
- `POST /api/comments/:postId` - Create comment (requires auth)
- `DELETE /api/comments/:id` - Delete comment (requires auth)

### Messages
- `GET /api/messages/threads` - Get user's chat threads (requires auth)
- `POST /api/messages/threads` - Create thread (requires auth)
- `GET /api/messages/threads/:threadId/messages` - Get messages (requires auth)
- `POST /api/messages/threads/:threadId/messages` - Send message (requires auth)

### Books
- `GET /api/books/search?q=query` - Search books via Google Books API
- `GET /api/books/:id` - Get book by Google Books ID

## WebSocket Events

Connect to WebSocket with authentication:
```javascript
const socket = io('http://localhost:3001', {
  auth: { token: 'your-jwt-token' }
});

// Join a thread
socket.emit('join_thread', threadId);

// Listen for new messages
socket.on('new_message', (message) => {
  console.log('New message:', message);
});

// Leave a thread
socket.emit('leave_thread', threadId);
```

## Database Schema

See `/home/user/The-Angle-BOOK-Club-/backend/src/db/schema.sql` for complete schema.

Main tables:
- `users` - User accounts
- `posts` - User posts
- `books` - Book information
- `likes` - Post likes
- `comments` - Post comments
- `threads` - Chat threads
- `messages` - Chat messages
- `friendships` - User friendships (future feature)
- `notifications` - User notifications (future feature)

## License

MIT
