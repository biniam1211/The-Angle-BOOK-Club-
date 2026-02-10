import React, { useState } from 'react';
import { postsApi } from '../api/posts';
import { booksApi, BookSearchResult } from '../api/books';

interface ComposerProps {
  onPostCreated: () => void;
}

export const Composer: React.FC<ComposerProps> = ({ onPostCreated }) => {
  const [text, setText] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const [searchResults, setSearchResults] = useState<BookSearchResult[]>([]);
  const [selectedBook, setSelectedBook] = useState<BookSearchResult | null>(null);
  const [searching, setSearching] = useState(false);
  const [posting, setPosting] = useState(false);

  const handleSearchBooks = async () => {
    if (!bookSearch.trim()) return;

    setSearching(true);
    try {
      const results = await booksApi.search(bookSearch);
      setSearchResults(results);
    } catch (error) {
      console.error('Failed to search books:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectBook = (book: BookSearchResult) => {
    setSelectedBook(book);
    setSearchResults([]);
    setBookSearch('');
  };

  const handlePost = async () => {
    if (!text.trim()) return;

    setPosting(true);
    try {
      await postsApi.createPost({
        text: text.trim(),
        book: selectedBook
          ? {
              title: selectedBook.title,
              author: selectedBook.author,
              coverUrl: selectedBook.coverUrl,
              googleBooksId: selectedBook.googleBooksId,
            }
          : undefined,
      });

      setText('');
      setSelectedBook(null);
      setBookSearch('');
      setSearchResults([]);
      onPostCreated();
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="composer card">
      <textarea
        className="composer-input"
        placeholder="What are you reading?"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
      />

      {selectedBook && (
        <div className="selected-book">
          {selectedBook.coverUrl && (
            <img src={selectedBook.coverUrl} alt={selectedBook.title} className="book-cover-small" />
          )}
          <div className="book-info">
            <div className="book-title">{selectedBook.title}</div>
            <div className="book-author">{selectedBook.author}</div>
          </div>
          <button className="remove-book" onClick={() => setSelectedBook(null)}>
            ×
          </button>
        </div>
      )}

      {!selectedBook && (
        <div className="book-search">
          <input
            className="search-input"
            placeholder="Search for a book..."
            value={bookSearch}
            onChange={(e) => setBookSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchBooks()}
          />
          <button className="search-btn" onClick={handleSearchBooks} disabled={searching}>
            {searching ? '...' : '🔍'}
          </button>
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="search-results">
          {searchResults.map((book) => (
            <div
              key={book.googleBooksId}
              className="search-result-item"
              onClick={() => handleSelectBook(book)}
            >
              {book.coverUrl && <img src={book.coverUrl} alt={book.title} />}
              <div>
                <div className="book-title">{book.title}</div>
                <div className="book-author">{book.author}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="composer-footer">
        <span className="hint">Share your thoughts, tag a book</span>
        <button className="post-btn" onClick={handlePost} disabled={posting || !text.trim()}>
          {posting ? 'Posting...' : 'Post'}
        </button>
      </div>
    </div>
  );
};
