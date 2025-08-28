import { Request, Response } from 'express'; // Add Response import
import { PrismaClient } from '../../generated/prisma/index.js';

const prisma = new PrismaClient();

// Interface for API response structure
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  error?: string;
}

// Interface for book structure (matching your Prisma schema)
interface Book {
  id: number;
  title: string;
  author: string;
  publisher: string;
  price: string;
  numericPrice: number; // Changed from Float to number for TypeScript
  image: string;
  pdfUrl: string;
  category: string | null; // Allow null as per schema
  createdAt: Date;
  updatedAt: Date;
}

// Type for request parameters
interface BookParams {
  id?: string;
  category?: string;
  query?: string;
}

// Get all books
export const getAllBooks = async (req: Request, res: Response): Promise<void> => {
  try {
    const books = await prisma.book.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    const response: ApiResponse<Book[]> = {
      success: true,
      count: books.length,
      data: books
    };
    
    res.status(200).json(response); // Fixed this line
  } catch (error) {
    console.error('Error fetching books:', error);
    
    const errorResponse: ApiResponse = {
      success: false,
      message: 'Failed to fetch books',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    
    res.status(500).json(errorResponse);
  }
};

// @desc    Get featured books
// @route   GET /api/books/featured
// @access  Public
export const getFeaturedBooks = async (req: Request, res: Response): Promise<void> => {
  try {
    // Note: Your schema doesn't have a 'featured' field, so this query will fail
    // You need to either add 'featured Boolean?' to your Book model or use a different filter
    const books = await prisma.book.findMany({
      // Remove featured filter since it doesn't exist in schema
      take: 6,
      orderBy: {
        createdAt: 'desc'
      }
    });

    const response: ApiResponse<Book[]> = {
      success: true,
      count: books.length,
      data: books
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching featured books:', error);
    
    const errorResponse: ApiResponse = {
      success: false,
      message: 'Failed to fetch featured books',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    
    res.status(500).json(errorResponse);
  }
};

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
export const getBookById = async (req: Request<BookParams>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      const errorResponse: ApiResponse = {
        success: false,
        message: 'Invalid book ID provided'
      };
      res.status(400).json(errorResponse);
      return;
    }

    const book = await prisma.book.findUnique({
      where: {
        id: parseInt(id)
      }
    });

    if (!book) {
      const errorResponse: ApiResponse = {
        success: false,
        message: 'Book not found'
      };
      res.status(404).json(errorResponse);
      return;
    }

    const response: ApiResponse<Book> = {
      success: true,
      data: book
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching book by ID:', error);
    
    const errorResponse: ApiResponse = {
      success: false,
      message: 'Failed to fetch book',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    
    res.status(500).json(errorResponse);
  }
};

// @desc    Get books by category
// @route   GET /api/books/category/:category
// @access  Public
export const getBooksByCategory = async (req: Request<BookParams>, res: Response): Promise<void> => {
  try {
    const { category } = req.params;
    
    if (!category) {
      const errorResponse: ApiResponse = {
        success: false,
        message: 'Category parameter is required'
      };
      res.status(400).json(errorResponse);
      return;
    }

    const books = await prisma.book.findMany({
      where: {
        category: {
          contains: category,
          mode: 'insensitive'
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const response: ApiResponse<Book[]> = {
      success: true,
      count: books.length,
      data: books
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching books by category:', error);
    
    const errorResponse: ApiResponse = {
      success: false,
      message: 'Failed to fetch books by category',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    
    res.status(500).json(errorResponse);
  }
};

// @desc    Search books
// @route   GET /api/books/search/:query
// @access  Public
export const searchBooks = async (req: Request<BookParams>, res: Response): Promise<void> => {
  try {
    const { query } = req.params;
    
    if (!query || query.trim().length === 0) {
      const errorResponse: ApiResponse = {
        success: false,
        message: 'Search query is required'
      };
      res.status(400).json(errorResponse);
      return;
    }

    const books = await prisma.book.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            author: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            publisher: {
              contains: query,
              mode: 'insensitive'
            }
          }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const response: ApiResponse<Book[]> = {
      success: true,
      count: books.length,
      data: books
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error searching books:', error);
    
    const errorResponse: ApiResponse = {
      success: false,
      message: 'Failed to search books',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    
    res.status(500).json(errorResponse);
  }
};

/*import { Request } from 'express';
import { PrismaClient } from '../../generated/prisma/index.js';

const prisma = new PrismaClient();

// Interface for API response structure
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  error?: string;
}

// Interface for book structure (should match your Prisma schema)
interface Book {
  id: number;
  title: string;
  author: string;
  publisher: string;
  price: string;
  image: string;
  pdfUrl: string;
  category?: string;
  featured?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Type for request parameters
interface BookParams {
  id?: string;
  category?: string;
  query?: string;
}

// Get all books
export const getAllBooks = async (req: Request, res: Response): Promise<void> => {
  try {
    const books = await prisma.book.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    
res.status(200).json(Response);
  } catch (error) {
    console.error('Error fetching books:', error);
    
    const errorResponse: ApiResponse = {
      success: false,
      message: 'Failed to fetch books',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    
    res.status(500).json(errorResponse);
  }
};

// @desc    Get featured books
// @route   GET /api/books/featured
// @access  Public
export const getFeaturedBooks = async (req: Request, res: Response): Promise<void> => {
  try {
    const books = await prisma.book.findMany({
      where: {
        featured: true
      },
      take: 6,
      orderBy: {
        createdAt: 'desc'
      }
    });

    const response: ApiResponse<Book[]> = {
      success: true,
      count: books.length,
      data: books
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching featured books:', error);
    
    const errorResponse: ApiResponse = {
      success: false,
      message: 'Failed to fetch featured books',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    
    res.status(500).json(errorResponse);
  }
};

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Public
export const getBookById = async (req: Request<BookParams>, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      const errorResponse: ApiResponse = {
        success: false,
        message: 'Invalid book ID provided'
      };
      res.status(400).json(errorResponse);
      return;
    }

    const book = await prisma.book.findUnique({
      where: {
        id: parseInt(id)
      }
    });

    if (!book) {
      const errorResponse: ApiResponse = {
        success: false,
        message: 'Book not found'
      };
      res.status(404).json(errorResponse);
      return;
    }

    const response: ApiResponse<Book> = {
      success: true,
      data: book
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching book by ID:', error);
    
    const errorResponse: ApiResponse = {
      success: false,
      message: 'Failed to fetch book',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    
    res.status(500).json(errorResponse);
  }
};

// @desc    Get books by category
// @route   GET /api/books/category/:category
// @access  Public
export const getBooksByCategory = async (req: Request<BookParams>, res: Response): Promise<void> => {
  try {
    const { category } = req.params;
    
    if (!category) {
      const errorResponse: ApiResponse = {
        success: false,
        message: 'Category parameter is required'
      };
      res.status(400).json(errorResponse);
      return;
    }

    const books = await prisma.book.findMany({
      where: {
        category: {
          contains: category,
          mode: 'insensitive'
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const response: ApiResponse<Book[]> = {
      success: true,
      count: books.length,
      data: books
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching books by category:', error);
    
    const errorResponse: ApiResponse = {
      success: false,
      message: 'Failed to fetch books by category',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    
    res.status(500).json(errorResponse);
  }
};

// @desc    Search books
// @route   GET /api/books/search/:query
// @access  Public
export const searchBooks = async (req: Request<BookParams>, res: Response): Promise<void> => {
  try {
    const { query } = req.params;
    
    if (!query || query.trim().length === 0) {
      const errorResponse: ApiResponse = {
        success: false,
        message: 'Search query is required'
      };
      res.status(400).json(errorResponse);
      return;
    }

    const books = await prisma.book.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            author: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            publisher: {
              contains: query,
              mode: 'insensitive'
            }
          }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const response: ApiResponse<Book[]> = {
      success: true,
      count: books.length,
      data: books
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error searching books:', error);
    
    const errorResponse: ApiResponse = {
      success: false,
      message: 'Failed to search books',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    
    res.status(500).json(errorResponse);
  }
};
*/
