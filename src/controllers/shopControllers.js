import { PrismaClient } from '../../generated/prisma/index.js';
const prisma = new PrismaClient();
// Get all books
export const getAllBooks = async (req, res) => {
    try {
        const books = await prisma.book.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.status(200).json({
            success: true,
            data: books
        });
    }
    catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch books',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
// Get book by ID
export const getBookById = async (req, res) => {
    try {
        const { id } = req.params;
        const book = await prisma.book.findUnique({
            where: {
                id: parseInt(id)
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
    }
    catch (error) {
        console.error('Error fetching book:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch book',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
// Search books
export const searchBooks = async (req, res) => {
    try {
        const { query } = req.query;
        if (!query || typeof query !== 'string') {
            res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
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
                title: 'asc'
            }
        });
        res.status(200).json({
            success: true,
            data: books
        });
    }
    catch (error) {
        console.error('Error searching books:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search books',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
// Create new order
export const createOrder = async (req, res) => {
    try {
        const { customerName, customerEmail, items } = req.body;
        // Validate request
        if (!items || !Array.isArray(items) || items.length === 0) {
            res.status(400).json({
                success: false,
                message: 'Order items are required'
            });
            return;
        }
        // Verify all books exist and calculate total
        let totalAmount = 0;
        const bookIds = items.map(item => item.bookId);
        const books = await prisma.book.findMany({
            where: {
                id: {
                    in: bookIds
                }
            }
        });
        if (books.length !== bookIds.length) {
            res.status(400).json({
                success: false,
                message: 'Some books were not found'
            });
            return;
        }
        // Calculate total amount
        const orderItems = items.map(item => {
            const book = books.find(b => b.id === item.bookId);
            if (!book) {
                throw new Error(`Book with ID ${item.bookId} not found`);
            }
            const itemTotal = book.numericPrice * item.quantity;
            totalAmount += itemTotal;
            return {
                bookId: item.bookId,
                quantity: item.quantity,
                price: book.numericPrice
            };
        });
        // Create order with order items
        const order = await prisma.order.create({
            data: {
                customerName,
                customerEmail,
                totalAmount,
                orderItems: {
                    create: orderItems
                }
            },
            include: {
                orderItems: {
                    include: {
                        book: true
                    }
                }
            }
        });
        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            data: order
        });
    }
    catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create order',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
// Get all orders
export const getAllOrders = async (req, res) => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                orderItems: {
                    include: {
                        book: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.status(200).json({
            success: true,
            data: orders
        });
    }
    catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch orders',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
// Get order by ID
export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await prisma.order.findUnique({
            where: {
                id: parseInt(id)
            },
            include: {
                orderItems: {
                    include: {
                        book: true
                    }
                }
            }
        });
        if (!order) {
            res.status(404).json({
                success: false,
                message: 'Order not found'
            });
            return;
        }
        res.status(200).json({
            success: true,
            data: order
        });
    }
    catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch order',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
// Update order status
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const validStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
            res.status(400).json({
                success: false,
                message: 'Invalid status. Valid statuses are: ' + validStatuses.join(', ')
            });
            return;
        }
        const order = await prisma.order.update({
            where: {
                id: parseInt(id)
            },
            data: {
                status
            },
            include: {
                orderItems: {
                    include: {
                        book: true
                    }
                }
            }
        });
        res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            data: order
        });
    }
    catch (error) {
        if (error.code === 'P2025') {
            res.status(404).json({
                success: false,
                message: 'Order not found'
            });
            return;
        }
        console.error('Error updating order status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update order status',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
// Add new book (admin function)
export const createBook = async (req, res) => {
    try {
        console.log('body', req.body);
        const { title, author, publisher, price, numericPrice, image, pdfUrl } = req.body;
        // Validate required fields
        if (!title || !author || !publisher || !price || !numericPrice || !image || !pdfUrl) {
            res.status(400).json({
                success: false,
                message: 'All fields are required: title, author, publisher, price, numericPrice, image, pdfUrl'
            });
            return;
        }
        const book = await prisma.book.create({
            data: {
                title,
                author,
                publisher,
                price,
                numericPrice: parseFloat(numericPrice.toString()),
                image,
                pdfUrl
            }
        });
        console.log("book", book);
        res.status(201).json({
            success: true,
            message: 'Book created successfully',
            data: book
        });
    }
    catch (error) {
        console.error('Error creating book:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create book',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
// Update book (admin function)
export const updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, author, publisher, price, numericPrice, image, pdfUrl } = req.body;
        const updateData = {};
        if (title)
            updateData.title = title;
        if (author)
            updateData.author = author;
        if (publisher)
            updateData.publisher = publisher;
        if (price)
            updateData.price = price;
        if (numericPrice)
            updateData.numericPrice = parseFloat(numericPrice.toString());
        if (image)
            updateData.image = image;
        if (pdfUrl)
            updateData.pdfUrl = pdfUrl;
        const book = await prisma.book.update({
            where: {
                id: parseInt(id)
            },
            data: updateData
        });
        res.status(200).json({
            success: true,
            message: 'Book updated successfully',
            data: book
        });
    }
    catch (error) {
        if (error.code === 'P2025') {
            res.status(404).json({
                success: false,
                message: 'Book not found'
            });
            return;
        }
        console.error('Error updating book:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update book',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
// Delete book (admin function)
export const deleteBook = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.book.delete({
            where: {
                id: parseInt(id)
            }
        });
        res.status(200).json({
            success: true,
            message: 'Book deleted successfully'
        });
    }
    catch (error) {
        if (error.code === 'P2025') {
            res.status(404).json({
                success: false,
                message: 'Book not found'
            });
            return;
        }
        console.error('Error deleting book:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete book',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
//# sourceMappingURL=shopControllers.js.map