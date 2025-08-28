import { PrismaClient } from '../../generated/prisma/index';
const prisma = new PrismaClient();
// Get all books
export const getAllBooks = async (req, res) => {
    try {
        const books = await prisma.book.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.status(200).json(Response);
    }
    catch (error) {
        console.error('Error fetching books:', error);
        const errorResponse = {
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
export const getFeaturedBooks = async (req, res) => {
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
        const response = {
            success: true,
            count: books.length,
            data: books
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error fetching featured books:', error);
        const errorResponse = {
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
export const getBookById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || isNaN(parseInt(id))) {
            const errorResponse = {
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
            const errorResponse = {
                success: false,
                message: 'Book not found'
            };
            res.status(404).json(errorResponse);
            return;
        }
        const response = {
            success: true,
            data: book
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error fetching book by ID:', error);
        const errorResponse = {
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
export const getBooksByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        if (!category) {
            const errorResponse = {
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
        const response = {
            success: true,
            count: books.length,
            data: books
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error fetching books by category:', error);
        const errorResponse = {
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
export const searchBooks = async (req, res) => {
    try {
        const { query } = req.params;
        if (!query || query.trim().length === 0) {
            const errorResponse = {
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
        const response = {
            success: true,
            count: books.length,
            data: books
        };
        res.status(200).json(response);
    }
    catch (error) {
        console.error('Error searching books:', error);
        const errorResponse = {
            success: false,
            message: 'Failed to search books',
            error: error instanceof Error ? error.message : 'Unknown error'
        };
        res.status(500).json(errorResponse);
    }
};
//# sourceMappingURL=homeController.js.map