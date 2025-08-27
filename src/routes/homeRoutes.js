import express from 'express';
import { getAllBooks, getFeaturedBooks, getBookById, getBooksByCategory, searchBooks } from '../controllers/homeController.js';
const router = express.Router();
// GET /api/books - Get all books
router.get('/', getAllBooks);
// GET /api/books/featured - Get featured books (for homepage)
router.get('/featured', getFeaturedBooks);
// GET /api/books/:id - Get single book by ID
router.get('/:id', getBookById);
// GET /api/books/category/:category - Get books by category
router.get('/category/:category', getBooksByCategory);
// GET /api/books/search/:query - Search books
router.get('/search/:query', searchBooks);
export default router;
//# sourceMappingURL=homeRoutes.js.map