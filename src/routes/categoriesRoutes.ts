import { Router } from "express";
import { 
  getAllBooks, 
  searchBooks, 
  getAllCategories, 
  getBooksByCategory, 
  getBookById, 
  addToCart, 
  createBook, 
  updateBook, 
  deleteBook 
} from "../controllers/categoriesControllers";

const router = Router();

// Public Book Routes
router.get('/books', getAllBooks);                           // GET /api/books
router.get('/books/search', searchBooks);                    // GET /api/books/search?query=...
router.get('/books/:id', getBookById);                       // GET /api/books/:id

// Category Routes
router.get('/categories', getAllCategories);                 // GET /api/categories
router.get('/categories/:category', getBooksByCategory);     // GET /api/categories/:category

// Cart Routes
router.post('/cart', addToCart);                            // POST /api/cart

// Admin Routes (you might want to add authentication middleware)
router.post('/books', createBook);                          // POST /api/books
router.put('/books/:id', updateBook);                       // PUT /api/books/:id
router.delete('/books/:id', deleteBook);                    // DELETE /api/books/:id

export default router;