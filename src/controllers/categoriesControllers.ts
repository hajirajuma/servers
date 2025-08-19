import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateBookRequest {
  title: string;
  author: string;
  publisher: string;
  price: string;
  image: string;
  pdfUrl: string;
  category?: string;
}

// Get all books
export const getAllBooks = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const books = await prisma.book.findMany({
      orderBy: {
        title: 'asc'
      }
    });
    
    res.status(200).json({
      success: true,
      data: books
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch books',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get all categories (for the category filter buttons)
export const getAllCategories = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const categories = await prisma.book.findMany({                                                                                       
      select: {
        category: true
      },
      distinct: ['category'],
      where: {
        category: {
          not: null
        }
      }
    });

    const categoryNames = categories
      .map(item => item.category)
      .filter(Boolean)
      .sort();

    res.status(200).json({
      success: true,
      data: categoryNames
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get books by category (when category button is clicked)
export const getBooksByCategory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { category } = req.params;

    if (!category) {
      res.status(400).json({
        success: false,
        message: 'Category is required'
      });
      return;
    }

    const books = await prisma.book.findMany({
      where: {
        category: {
          equals: category,
          mode: 'insensitive'
        }
      },
      orderBy: {
        title: 'asc'
      }
    });

    res.status(200).json({
      success: true,
      data: books,
      category: category
    });
  } catch (error) {
    console.error('Error fetching books by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch books by category',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Search books (for the search functionality)
export const searchBooks = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { query, genre, author, title } = req.query;
    
    if (!query || typeof query !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
      return;
    }

    // Build search conditions based on the search input
    const searchConditions = [];

    // General search across all fields
    if (query) {
      searchConditions.push(
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
        },
        {
          category: {
            contains: query,
            mode: 'insensitive'
          }
        }
      );
    }

    const books = await prisma.book.findMany({
      where: {
        OR: searchConditions
      },
      orderBy: {
        title: 'asc'
      }
    });

    res.status(200).json({
      success: true,
      data: books,
      searchQuery: query
    });
  } catch (error) {
    console.error('Error searching books:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search books',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get book by ID
export const getBookById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Book ID is required'
      });
      return;
    }

    const book = await prisma.book.findUnique({
      where: {
        id: id
      }
    });

    if (!book) {
      res.status(404).json({
        success: false,
        message: 'Book not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: book
    });
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch book',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Add book to cart (for "Add to Cart" functionality)
export const addToCart = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { bookId, userId, quantity = 1 } = req.body;

    if (!bookId) {
      res.status(400).json({
        success: false,
        message: 'Book ID is required'
      });
      return;
    }

    // Check if book exists
    const book = await prisma.book.findUnique({
      where: { id: bookId }
    });

    if (!book) {
      res.status(404).json({
        success: false,
        message: 'Book not found'
      });
      return;
    }

    // Check if item already exists in cart
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        bookId: bookId,
        userId: userId || 'guest' // Handle guest users
      }
    });

    let cartItem;

    if (existingCartItem) {
      // Update quantity if item already exists
      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { 
          quantity: existingCartItem.quantity + quantity 
        },
        include: {
          book: true
        }
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          bookId,
          userId: userId || 'guest',
          quantity
        },
        include: {
          book: true
        }
      });
    }

    res.status(201).json({
      success: true,
      data: cartItem,
      message: 'Book added to cart successfully'
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add book to cart',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Create a new book (Admin functionality)
export const createBook = async (
  req: Request<{}, {}, CreateBookRequest>,
  res: Response
): Promise<void> => {
  try {
    const { title, author, publisher, price, image, pdfUrl, category } = req.body;

    // Validate required fields
    if (!title || !author || !publisher || !price) {
      res.status(400).json({
        success: false,
        message: 'Title, author, publisher, and price are required'
      });
      return;
    }

    const book = await prisma.book.create({
      data: {
        title,
        author,
        publisher,
        price,
        image: image || null,
        pdfUrl: pdfUrl || null,
        category: category || null
      }
    });

    res.status(201).json({
      success: true,
      data: book,
      message: 'Book created successfully'
    });
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create book',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update book (Admin functionality)
export const updateBook = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Book ID is required'
      });
      return;
    }

    // Check if book exists
    const existingBook = await prisma.book.findUnique({
      where: { id }
    });

    if (!existingBook) {
      res.status(404).json({
        success: false,
        message: 'Book not found'
      });
      return;
    }

    const updatedBook = await prisma.book.update({
      where: { id },
      data: updateData
    });

    res.status(200).json({
      success: true,
      data: updatedBook,
      message: 'Book updated successfully'
    });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update book',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Delete book (Admin functionality)
export const deleteBook = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Book ID is required'
      });
      return;
    }

    // Check if book exists
    const existingBook = await prisma.book.findUnique({
      where: { id }
    });

    if (!existingBook) {
      res.status(404).json({
        success: false,
        message: 'Book not found'
      });
      return;
    }

    await prisma.book.delete({
      where: { id }
    });

    res.status(200).json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete book',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};