import { Router } from "express";
import {getAllBooks,getBookById,searchBooks,createBook,updateBook,deleteBook,createOrder,getAllOrders,getOrderById, updateOrderStatus} from "../controllers/shopControllers.js";
const router = Router();
// Book Routes
router.get('/books', getAllBooks);                    // GET /api/shop/books
router.get('/books/search', searchBooks);             // GET /api/shop/books/search?query=javascript
router.get('/books/:id', getBookById);                // GET 
router.post('/books', createBook);                    // POST /api/shop/books (admin)
router.put('/books/:id', updateBook);                 // PUT /api/shop/books/1 (admin)
router.delete('/books/:id', deleteBook);              // DELETE /api/shop/books/1 (admin)

// Order Routes
router.post('/orders', createOrder);                  // POST /api/shop/orders
router.get('/orders', getAllOrders);                  // GET /api/shop/orders
router.get('/orders/:id', getOrderById);              // GET /api/shop/orders/1
router.put('/orders/:id/status', updateOrderStatus);  // PUT /api/shop/orders/1/status

export default router;