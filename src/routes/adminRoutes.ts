import express from 'express';
import {
  getBooks,
  addBook,
  updateBook,
  deleteBook,
  getOrders,
  updateOrderStatus
} from '../controllers/adminControllers.js';


const router = express.Router();

// Apply authentication and admin authorization to all routes

// Book management routes
router.get('/books', getBooks);
router.post('/books', addBook);
router.put('/books/:id', updateBook);
router.delete('/books/:id', deleteBook);

// Order management routes
router.get('/orders', getOrders);
router.put('/orders/:id/status', updateOrderStatus);

export default router;