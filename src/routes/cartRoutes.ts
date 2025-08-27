import express from 'express';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from "../controllers/cartControllers.js";

const router = express.Router();

// Get cart by session ID
router.get('/:sessionId', getCart);

// Add item to cart
router.post('/:sessionId/add', addToCart);

// Update cart item quantity
router.put('/:sessionId/update/:bookId', updateCartItem);

// Remove item from cart
router.delete('/:sessionId/remove/:bookId', removeFromCart);

// Clear entire cart
router.delete('/:sessionId/clear', clearCart);

export default router;