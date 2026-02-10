import apiClient from './client';

export interface BookSearchResult {
  googleBooksId: string;
  title: string;
  author: string;
  coverUrl?: string;
  description?: string;
  publishedDate?: string;
  pageCount?: number;
  categories?: string[];
}

export const booksApi = {
  search: async (query: string): Promise<BookSearchResult[]> => {
    const response = await apiClient.get('/books/search', { params: { q: query } });
    return response.data.books;
  },

  getById: async (id: string): Promise<BookSearchResult> => {
    const response = await apiClient.get(`/books/${id}`);
    return response.data.book;
  },
};
