import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../controllers/cartControllers';

const router = express.Router();

router.get('/:sessionId', getCart);
router.post('/:sessionId/add', addToCart);
router.put('/:sessionId/update/:bookId', updateCartItem);
router.delete('/:sessionId/remove/:bookId', removeFromCart);
router.delete('/:sessionId/clear', clearCart);

export default router;