import { useState } from 'react';
import { useAppState } from '../state/AppState';

export default function Composer() {
  const { createPost } = useAppState();
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!text.trim() && !title.trim()) return;
    setBusy(true);
    try {
      const book = title.trim()
        ? { title: title.trim(), author: author.trim(), coverUrl: coverUrl.trim() || undefined }
        : undefined;
      await createPost(text.trim(), book);
      setText('');
      setTitle('');
      setAuthor('');
      setCoverUrl('');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card" style={{ marginBottom: 10 }}>
      <div className="row" style={{ marginBottom: 8 }}>
        <textarea
          placeholder="What are you reading?"
          value={text}
          onChange={e => setText(e.target.value)}
          rows={3}
          style={{ width: '100%' }}
        />
      </div>
      <div className="row" style={{ marginBottom: 8 }}>
        <input
          className="input"
          placeholder="Book title (optional)"
          value={title}
          onChange={e => setTitle(e.target.value)}
          style={{ flex: 2 }}
        />
        <input
          className="input"
          placeholder="Author"
          value={author}
          onChange={e => setAuthor(e.target.value)}
          style={{ flex: 1 }}
        />
        <input
          className="input"
          placeholder="Cover URL"
          value={coverUrl}
          onChange={e => setCoverUrl(e.target.value)}
          style={{ flex: 2 }}
        />
      </div>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span className="small">Share a thought and optionally tag a book.</span>
        <button className="button primary" onClick={submit} disabled={busy}>
          Post
        </button>
      </div>
    </div>
  );
}

