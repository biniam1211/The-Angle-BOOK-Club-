# 📚 The Angle BOOK Club - Readers Feed

A **mobile-first social platform for book lovers**. Share your reading journey, discover new books, and connect with fellow readers.

Think "Goodreads meets Twitter" - a beautiful, modern app built for book enthusiasts who want to share their thoughts, discuss books, and build a reading community.

---

## ✨ Features

### 🎯 Core Features
- **📱 Mobile-First Design** - Optimized for smartphones with responsive layout
- **✍️ Post & Share** - Share thoughts about books you're reading
- **📖 Book Tagging** - Attach book info (title, author, cover) to posts via Google Books API
- **❤️ Social Interactions** - Like and comment on posts
- **💬 Real-time Chat** - Direct messaging with other readers
- **🔍 Book Search** - Integrated Google Books API for searching millions of books
- **✏️ Edit & Delete** - Full control over your posts
- **🔐 Authentication** - Secure JWT-based login and registration

### 🚀 Tech Stack

**Frontend:**
- React 18 + TypeScript
- React Router for navigation
- Axios for API calls
- Mobile-first responsive CSS
- Socket.io client (for real-time messaging)

**Backend:**
- Node.js + Express + TypeScript
- PostgreSQL database
- JWT authentication
- Socket.io (WebSockets for chat)
- Google Books API integration
- Zod for validation

---

## 📸 Screenshots

*Coming soon - mobile and desktop views*

---

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Google Books API key (optional, for book search)

### 1. Clone the Repository

```bash
git clone https://github.com/biniam1211/The-Angle-BOOK-Club-.git
cd The-Angle-BOOK-Club-
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration:
#   - DATABASE_URL: Your PostgreSQL connection string
#   - JWT_SECRET: A secure random string
#   - GOOGLE_BOOKS_API_KEY: Your API key (optional)
nano .env

# Create PostgreSQL database
createdb angle_book_club

# Run migrations to set up tables
npm run migrate

# Start backend server
npm run dev
```

Backend will run on `http://localhost:3001`

### 3. Frontend Setup

```bash
# From project root
cd ../

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start frontend dev server
npm run dev
```

Frontend will run on `http://localhost:5173`

### 4. Open the App

Visit `http://localhost:5173` and create an account to get started!

---

## 📚 Project Structure

```
The-Angle-BOOK-Club-/
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── config/          # Database config
│   │   ├── controllers/     # Route controllers
│   │   ├── db/              # Schema & migrations
│   │   ├── middleware/      # Auth & error handling
│   │   ├── models/          # Database models
│   │   ├── routes/          # API routes
│   │   ├── services/        # External services (Google Books)
│   │   ├── types/           # TypeScript types
│   │   └── server.ts        # Main server file
│   ├── package.json
│   └── README.md
│
├── src/                     # React frontend
│   ├── api/                 # API client & endpoints
│   ├── components/          # React components
│   ├── context/             # Auth context
│   ├── pages/               # Page components
│   ├── App.tsx              # Main app component
│   ├── main.tsx             # Entry point
│   ├── styles.css           # Mobile-first CSS
│   └── types.ts             # TypeScript types
│
├── package.json
├── vite.config.ts
└── README.md
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Posts
- `GET /api/posts` - Get feed
- `POST /api/posts` - Create post
- `GET /api/posts/:id` - Get single post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `GET /api/posts/user/:userId` - Get user's posts

### Social
- `POST /api/likes/:postId` - Toggle like
- `GET /api/comments/:postId` - Get comments
- `POST /api/comments/:postId` - Create comment
- `DELETE /api/comments/:id` - Delete comment

### Messaging
- `GET /api/messages/threads` - Get chat threads
- `POST /api/messages/threads` - Create thread
- `GET /api/messages/threads/:threadId/messages` - Get messages
- `POST /api/messages/threads/:threadId/messages` - Send message

### Books
- `GET /api/books/search?q=query` - Search books (Google Books API)
- `GET /api/books/:id` - Get book by ID

---

## 🎨 Design Philosophy

**Mobile-First**
- Designed for smartphones from the ground up
- Touch-friendly interface
- Optimized for one-handed use
- Responsive design scales up to desktop

**Modern & Clean**
- Dark theme for comfortable reading
- Smooth animations and transitions
- Clear typography
- Intuitive navigation

**Book-Centric**
- Books are first-class citizens
- Easy book tagging with autocomplete
- Beautiful book cover displays
- Google Books integration

---

## 🚧 Roadmap

### Phase 1: MVP ✅ (Current)
- [x] Backend API with PostgreSQL
- [x] Authentication system
- [x] Post creation and social features
- [x] Real-time messaging
- [x] Book search integration
- [x] Mobile-first responsive design

### Phase 2: Enhanced Features (Next)
- [ ] User profiles and settings
- [ ] Friend system (add/remove friends)
- [ ] Notifications (likes, comments, messages)
- [ ] Image uploads (avatars, custom book covers)
- [ ] Search functionality (users, posts, books)
- [ ] Reading lists and bookshelves

### Phase 3: Mobile App Packaging
- [ ] Capacitor integration for native iOS/Android
- [ ] Push notifications
- [ ] Offline support and PWA
- [ ] App store deployment

### Phase 4: Community Features
- [ ] Book clubs and groups
- [ ] Reading challenges
- [ ] Book recommendations
- [ ] Activity feed customization

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📝 License

MIT License - feel free to use this project for learning or building your own book community!

---

## 💡 About

Built with ❤️ for book lovers who want to share their reading journey.

**Tech Stack Highlights:**
- Modern React with TypeScript
- Production-ready Node.js backend
- PostgreSQL for data persistence
- Real-time WebSocket communication
- Google Books API integration
- Mobile-first responsive design
- JWT authentication

---

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

Made with 📚 by readers, for readers.
