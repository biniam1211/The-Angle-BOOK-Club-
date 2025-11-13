import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Comment, Message, Post, Thread, User, Book, ID } from '../types';
import type { DataProvider } from '../data/DataProvider';
import { LocalMemoryProvider } from '../data/LocalMemoryProvider';

type State = {
  provider: DataProvider;
  currentUser: User;
  friends: User[];
  feed: Post[];
  commentsByPost: Map<ID, Comment[]>;
  usersById: Map<ID, User>;
  threads: Thread[];
  messagesByThread: Map<ID, Message[]>;
  refreshFeed: () => Promise<void>;
  refreshThreads: () => Promise<void>;
  createPost: (text: string, book?: Omit<Book, 'id'>) => Promise<void>;
  toggleLike: (postId: ID) => Promise<void>;
  addComment: (postId: ID, text: string) => Promise<void>;
  loadThread: (threadId: ID) => Promise<void>;
  sendMessage: (threadId: ID, text: string) => Promise<void>;
};

const Ctx = createContext<State | null>(null);

function useProvider(): DataProvider {
  return useMemo(() => new LocalMemoryProvider(), []);
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const provider = useProvider();

  const [currentUser, setCurrentUser] = useState<User>({ id: 'init', name: '...' });
  const [friends, setFriends] = useState<User[]>([]);
  const [feed, setFeed] = useState<Post[]>([]);
  const [commentsByPost, setCommentsByPost] = useState<Map<ID, Comment[]>>(new Map());
  const [usersById, setUsersById] = useState<Map<ID, User>>(new Map());
  const [threads, setThreads] = useState<Thread[]>([]);
  const [messagesByThread, setMessagesByThread] = useState<Map<ID, Message[]>>(new Map());

  useEffect(() => {
    (async () => {
      const me = await provider.getCurrentUser();
      const fr = await provider.listFriends();
      setCurrentUser(me);
      setFriends(fr);
      const byId = new Map<ID, User>();
      [me, ...fr].forEach(u => byId.set(u.id, u));
      setUsersById(byId);
      await refreshFeed();
      await refreshThreads();
    })();

    const unsubFeed = provider.onFeed(() => refreshFeed());
    return () => {
      unsubFeed?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);

  async function refreshFeed() {
    const posts = await provider.listFeed();
    setFeed(posts);
    const map = new Map<ID, Comment[]>();
    setCommentsByPost(map);
  }

  async function refreshThreads() {
    const ts = await provider.listThreads();
    setThreads(ts);
  }

  async function createPost(text: string, book?: Omit<Book, 'id'>) {
    await provider.createPost({ text, book });
  }

  async function toggleLike(postId: ID) {
    const meId = currentUser.id;
    const post = feed.find(p => p.id === postId);
    const like = !(post?.likeUserIds.includes(meId));
    await provider.likePost(postId, !!like);
  }

  async function addComment(postId: ID, text: string) {
    const c = await provider.addComment(postId, text);
    setCommentsByPost(prev => {
      const next = new Map(prev);
      const arr = next.get(postId) || [];
      next.set(postId, [...arr, c]);
      return next;
    });
  }

  async function loadThread(threadId: ID) {
    const msgs = await provider.getThreadMessages(threadId);
    setMessagesByThread(prev => {
      const next = new Map(prev);
      next.set(threadId, msgs);
      return next;
    });
  }

  async function sendMessage(threadId: ID, text: string) {
    const m = await provider.sendMessage(threadId, text);
    setMessagesByThread(prev => {
      const next = new Map(prev);
      const arr = next.get(threadId) || [];
      next.set(threadId, [...arr, m]);
      return next;
    });
  }

  const value: State = {
    provider,
    currentUser,
    friends,
    feed,
    commentsByPost,
    usersById,
    threads,
    messagesByThread,
    refreshFeed,
    refreshThreads,
    createPost,
    toggleLike,
    addComment,
    loadThread,
    sendMessage
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('AppState missing');
  return ctx;
}

