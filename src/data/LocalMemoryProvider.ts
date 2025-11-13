import type { DataProvider } from './DataProvider';
import type { Book, Comment, ID, Message, Post, Thread, User } from '../types';

const isDev = import.meta.env.MODE === 'development';

function uid(prefix = 'id'): ID {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

class Bus extends EventTarget {
  emit(name: string) {
    this.dispatchEvent(new Event(name));
  }
  sub(name: string, cb: () => void) {
    const handler = () => cb();
    this.addEventListener(name, handler);
    return () => this.removeEventListener(name, handler);
  }
}

const bus = new Bus();

type DB = {
  users: User[];
  posts: Post[];
  comments: Comment[];
  threads: Thread[];
  messages: Message[];
  currentUserId: ID;
};

const db: DB = {
  users: [],
  posts: [],
  comments: [],
  threads: [],
  messages: [],
  currentUserId: ''
};

function seed() {
  if (!isDev || db.users.length > 0) return;

  const u1: User = { id: uid('u'), name: 'Alex' };
  const u2: User = { id: uid('u'), name: 'Sam' };
  const u3: User = { id: uid('u'), name: 'Jordan' };
  db.users.push(u1, u2, u3);
  db.currentUserId = u1.id;

  const book1: Book = {
    id: uid('b'),
    title: 'The Midnight Library',
    author: 'Matt Haig',
    coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=400'
  };
  const p1: Post = {
    id: uid('p'),
    userId: u2.id,
    text: 'A gentle multiverse story about choices. Loved it.',
    book: book1,
    likeUserIds: [u1.id],
    commentIds: [],
    createdAt: Date.now() - 1000 * 60 * 60 * 2
  };
  db.posts.push(p1);

  const t1: Thread = { id: uid('t'), userIds: [u1.id, u2.id], lastMessageAt: Date.now() - 60000 };
  db.threads.push(t1);
  db.messages.push(
    { id: uid('m'), threadId: t1.id, userId: u2.id, text: 'Have you read chapter 10?', createdAt: Date.now() - 59000 },
    { id: uid('m'), threadId: t1.id, userId: u1.id, text: 'Not yet! No spoilers 🙈', createdAt: Date.now() - 57000 }
  );
}
seed();

export class LocalMemoryProvider implements DataProvider {
  async getCurrentUser(): Promise<User> {
    if (!db.currentUserId) {
      const u: User = { id: uid('u'), name: 'You' };
      db.users.push(u);
      db.currentUserId = u.id;
    }
    return db.users.find(u => u.id === db.currentUserId)!;
  }

  async listFriends(): Promise<User[]> {
    const me = await this.getCurrentUser();
    return db.users.filter(u => u.id !== me.id);
  }

  // Feed
  async listFeed(): Promise<Post[]> {
    const posts = [...db.posts].sort((a, b) => b.createdAt - a.createdAt);
    return posts;
  }

  async createPost(input: { text: string; book?: Omit<Book, 'id'> }): Promise<Post> {
    const me = await this.getCurrentUser();
    const book: Book | undefined = input.book
      ? { id: uid('b'), ...input.book }
      : undefined;
    const post: Post = {
      id: uid('p'),
      userId: me.id,
      text: input.text,
      book,
      likeUserIds: [],
      commentIds: [],
      createdAt: Date.now()
    };
    db.posts.push(post);
    bus.emit('feed');
    return post;
  }

  async likePost(postId: ID, like: boolean): Promise<void> {
    const me = await this.getCurrentUser();
    const p = db.posts.find(p => p.id === postId);
    if (!p) return;
    const has = p.likeUserIds.includes(me.id);
    if (like && !has) p.likeUserIds.push(me.id);
    if (!like && has) p.likeUserIds = p.likeUserIds.filter(id => id !== me.id);
    bus.emit('feed');
  }

  async addComment(postId: ID, text: string): Promise<Comment> {
    const me = await this.getCurrentUser();
    const c: Comment = {
      id: uid('c'),
      postId,
      userId: me.id,
      text,
      createdAt: Date.now()
    };
    db.comments.push(c);
    const p = db.posts.find(p => p.id === postId);
    if (p) p.commentIds.push(c.id);
    bus.emit('feed');
    return c;
  }

  // Chat
  async listThreads(): Promise<Thread[]> {
    const me = await this.getCurrentUser();
    return db.threads
      .filter(t => t.userIds.includes(me.id))
      .sort((a, b) => b.lastMessageAt - a.lastMessageAt);
  }

  async getThreadMessages(threadId: ID): Promise<Message[]> {
    return db.messages
      .filter(m => m.threadId === threadId)
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  async sendMessage(threadId: ID, text: string): Promise<Message> {
    const me = await this.getCurrentUser();
    const msg: Message = {
      id: uid('m'),
      threadId,
      userId: me.id,
      text,
      createdAt: Date.now()
    };
    db.messages.push(msg);
    const t = db.threads.find(t => t.id === threadId);
    if (t) t.lastMessageAt = msg.createdAt;
    bus.emit(`thread:${threadId}`);
    return msg;
  }

  onFeed(callback: () => void): () => void {
    return bus.sub('feed', callback);
  }

  onThread(threadId: ID, callback: () => void): () => void {
    return bus.sub(`thread:${threadId}`, callback);
  }
}

