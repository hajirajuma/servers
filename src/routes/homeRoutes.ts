import { Router } from 'express';
import { 
  getAllBooks, 
  getFeaturedBooks, 
  getBookById, 
  getBooksByCategory, 
  searchBooks 
} from '../controllers/homeController.js';

const router = Router();

// @route   GET /api/books
// @desc    Get all books
// @access  Public
router.get('/', getAllBooks);

// @route   GET /api/books/featured
// @desc    Get featured books
// @access  Public
router.get('/featured', getFeaturedBooks);

// @route   GET /api/books/:id
// @desc    Get single book
// @access  Public
router.get('/:id', getBookById);

// @route   GET /api/books/category/:category
// @desc    Get books by category
// @access  Public
router.get('/category/:category', getBooksByCategory);

// @route   GET /api/books/search/:query
// @desc    Search books
// @access  Public
router.get('/search/:query', searchBooks);

export default router;

/*import express from 'express';
import { getAllBooks, getFeaturedBooks, getBookById, getBooksByCategory, searchBooks } from '../controllers/homeController.js';

const router = express.Router();

// GET /api/books - Get all books
router.get('/',getAllBooks);

// GET /api/books/featured - Get featured books (for homepage)
router.get('/featured',getFeaturedBooks);

// GET /api/books/:id - Get single book by ID
router.get('/:id',getBookById);

// GET /api/books/category/:category - Get books by category
router.get('/category/:category',getBooksByCategory);

// GET /api/books/search/:query - Search books
router.get('/search/:query',searchBooks);

export default router;
*/