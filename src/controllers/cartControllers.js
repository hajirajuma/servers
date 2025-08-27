import { PrismaClient } from '../../generated/prisma/index.js';
const prisma = new PrismaClient();
// Get cart by session ID
export const getCart = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const cart = await prisma.cart.findUnique({
            where: { sessionId },
            include: {
                items: {
                    include: {
                        book: {
                            select: {
                                id: true,
                                title: true,
                                author: true,
                                price: true,
                                imageUrl: true
                            }
                        }
                    }
                }
            }
        });
        if (!cart) {
            return res.status(200).json({
                success: true,
                message: 'Cart is empty',
                data: {
                    sessionId,
                    items: [],
                    total: 0
                }
            });
        }
        res.status(200).json({
            success: true,
            message: 'Cart retrieved successfully',
            data: cart
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve cart',
            error: error.message
        });
    }
};
// Add item to cart
export const addToCart = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { bookId, quantity = 1 } = req.body;
        if (!bookId) {
            return res.status(400).json({
                success: false,
                message: 'Book ID is required'
            });
        }
        // Check if book exists
        const book = await prisma.book.findUnique({
            where: { id: parseInt(bookId) }
        });
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }
        // Check if cart exists
        let cart = await prisma.cart.findUnique({
            where: { sessionId },
            include: { items: true }
        });
        if (!cart) {
            // Create new cart with item
            cart = await prisma.cart.create({
                data: {
                    sessionId,
                    items: {
                        create: {
                            bookId: parseInt(bookId),
                            quantity: parseInt(quantity),
                            priceAtAddition: book.price
                        }
                    },
                    total: book.price * parseInt(quantity)
                },
                include: {
                    items: {
                        include: {
                            book: {
                                select: {
                                    id: true,
                                    title: true,
                                    author: true,
                                    price: true,
                                    imageUrl: true
                                }
                            }
                        }
                    }
                }
            });
        }
        else {
            // Check if item already exists in cart
            const existingItem = cart.items.find(item => item.bookId === parseInt(bookId));
            if (existingItem) {
                // Update existing item
                await prisma.cartItem.update({
                    where: { id: existingItem.id },
                    data: {
                        quantity: existingItem.quantity + parseInt(quantity)
                    }
                });
            }
            else {
                // Add new item to existing cart
                await prisma.cartItem.create({
                    data: {
                        cartId: cart.id,
                        bookId: parseInt(bookId),
                        quantity: parseInt(quantity),
                        priceAtAddition: book.price
                    }
                });
            }
            // Recalculate cart total
            const updatedItems = await prisma.cartItem.findMany({
                where: { cartId: cart.id },
                include: { book: true }
            });
            const newTotal = updatedItems.reduce((sum, item) => {
                return sum + (item.priceAtAddition * item.quantity);
            }, 0);
            // Update cart total
            cart = await prisma.cart.update({
                where: { id: cart.id },
                data: {
                    total: newTotal,
                    updatedAt: new Date()
                },
                include: {
                    items: {
                        include: {
                            book: {
                                select: {
                                    id: true,
                                    title: true,
                                    author: true,
                                    price: true,
                                    imageUrl: true
                                }
                            }
                        }
                    }
                }
            });
        }
        res.status(200).json({
            success: true,
            message: 'Item added to cart successfully',
            data: cart
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to add item to cart',
            error: error.message
        });
    }
};
// Update cart item quantity
export const updateCartItem = async (req, res) => {
    try {
        const { sessionId, bookId } = req.params;
        const { quantity } = req.body;
        if (!quantity || quantity < 0) {
            return res.status(400).json({
                success: false,
                message: 'Valid quantity is required'
            });
        }
        const cart = await prisma.cart.findUnique({
            where: { sessionId },
            include: { items: true }
        });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }
        const cartItem = cart.items.find(item => item.bookId === parseInt(bookId));
        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }
        if (parseInt(quantity) === 0) {
            // Remove item if quantity is 0
            await prisma.cartItem.delete({
                where: { id: cartItem.id }
            });
        }
        else {
            // Update item quantity
            await prisma.cartItem.update({
                where: { id: cartItem.id },
                data: { quantity: parseInt(quantity) }
            });
        }
        // Recalculate cart total
        const updatedItems = await prisma.cartItem.findMany({
            where: { cartId: cart.id },
            include: { book: true }
        });
        const newTotal = updatedItems.reduce((sum, item) => {
            return sum + (item.priceAtAddition * item.quantity);
        }, 0);
        // Update cart
        const updatedCart = await prisma.cart.update({
            where: { id: cart.id },
            data: {
                total: newTotal,
                updatedAt: new Date()
            },
            include: {
                items: {
                    include: {
                        book: {
                            select: {
                                id: true,
                                title: true,
                                author: true,
                                price: true,
                                imageUrl: true
                            }
                        }
                    }
                }
            }
        });
        res.status(200).json({
            success: true,
            message: 'Cart item updated successfully',
            data: updatedCart
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update cart item',
            error: error.message
        });
    }
};
// Remove item from cart
export const removeFromCart = async (req, res) => {
    try {
        const { sessionId, bookId } = req.params;
        const cart = await prisma.cart.findUnique({
            where: { sessionId },
            include: { items: true }
        });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }
        const cartItem = cart.items.find(item => item.bookId === parseInt(bookId));
        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }
        // Remove the item
        await prisma.cartItem.delete({
            where: { id: cartItem.id }
        });
        // Recalculate cart total
        const remainingItems = await prisma.cartItem.findMany({
            where: { cartId: cart.id },
            include: { book: true }
        });
        const newTotal = remainingItems.reduce((sum, item) => {
            return sum + (item.priceAtAddition * item.quantity);
        }, 0);
        // Update cart
        const updatedCart = await prisma.cart.update({
            where: { id: cart.id },
            data: {
                total: newTotal,
                updatedAt: new Date()
            },
            include: {
                items: {
                    include: {
                        book: {
                            select: {
                                id: true,
                                title: true,
                                author: true,
                                price: true,
                                imageUrl: true
                            }
                        }
                    }
                }
            }
        });
        res.status(200).json({
            success: true,
            message: 'Item removed from cart successfully',
            data: updatedCart
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to remove item from cart',
            error: error.message
        });
    }
};
// Clear entire cart
export const clearCart = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const cart = await prisma.cart.findUnique({
            where: { sessionId }
        });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }
        // Delete all cart items first
        await prisma.cartItem.deleteMany({
            where: { cartId: cart.id }
        });
        // Update cart total to 0
        const clearedCart = await prisma.cart.update({
            where: { id: cart.id },
            data: {
                total: 0,
                updatedAt: new Date()
            },
            include: {
                items: {
                    include: {
                        book: {
                            select: {
                                id: true,
                                title: true,
                                author: true,
                                price: true,
                                imageUrl: true
                            }
                        }
                    }
                }
            }
        });
        res.status(200).json({
            success: true,
            message: 'Cart cleared successfully',
            data: clearedCart
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to clear cart',
            error: error.message
        });
    }
};
//# sourceMappingURL=cartControllers.js.map