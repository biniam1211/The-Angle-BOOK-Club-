import axios from 'axios';

interface GoogleBook {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    publishedDate?: string;
    pageCount?: number;
    categories?: string[];
  };
}

export class GoogleBooksService {
  private static apiKey = process.env.GOOGLE_BOOKS_API_KEY;
  private static baseUrl = 'https://www.googleapis.com/books/v1/volumes';

  static async search(query: string, maxResults: number = 10) {
    try {
      const response = await axios.get(this.baseUrl, {
        params: {
          q: query,
          maxResults,
          key: this.apiKey,
        },
      });

      const books = response.data.items || [];

      return books.map((book: GoogleBook) => ({
        googleBooksId: book.id,
        title: book.volumeInfo.title,
        author: book.volumeInfo.authors?.join(', ') || 'Unknown',
        coverUrl: book.volumeInfo.imageLinks?.thumbnail || book.volumeInfo.imageLinks?.smallThumbnail,
        description: book.volumeInfo.description,
        publishedDate: book.volumeInfo.publishedDate,
        pageCount: book.volumeInfo.pageCount,
        categories: book.volumeInfo.categories,
      }));
    } catch (error) {
      console.error('Google Books API error:', error);
      return [];
    }
  }

  static async getById(id: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/${id}`, {
        params: { key: this.apiKey },
      });

      const book = response.data;

      return {
        googleBooksId: book.id,
        title: book.volumeInfo.title,
        author: book.volumeInfo.authors?.join(', ') || 'Unknown',
        coverUrl: book.volumeInfo.imageLinks?.thumbnail || book.volumeInfo.imageLinks?.smallThumbnail,
        description: book.volumeInfo.description,
        publishedDate: book.volumeInfo.publishedDate,
        pageCount: book.volumeInfo.pageCount,
        categories: book.volumeInfo.categories,
      };
    } catch (error) {
      console.error('Google Books API error:', error);
      return null;
    }
  }
}
