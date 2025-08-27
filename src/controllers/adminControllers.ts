import { Request, Response } from 'express';
import { PrismaClient } from '../../generated/prisma/index.js';
import { Book, Order, ApiResponse } from '../types/adminTypes.js';

const prisma = new PrismaClient();


interface book {
  title: string;
  author: string;
  publisher: string;
  price: string;
  numericPrice: number;
  image: string;
  pdfUrl: string;
}
// Book Management
export const getBooks = async (req: Request, res: Response<ApiResponse<Book[]>>) => {
  try {
    const books = await prisma.book.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      message: 'Books retrieved successfully',
      data: books.map(book => ({
        ...book,
        displayPrice: `$${(book.price / 100).toFixed(2)}` // Convert cents to dollars
      }))
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve books',
      error: error.message
    });
  }
};

export const addBook = async (req: Request, res: Response<ApiResponse<Book>>) => {
  try {
    const { title, author, price, imageUrl, pdfUrl } = req.body;

    // Convert price from dollars to cents
    const priceInCents = Math.round(parseFloat(price) * 100);

    const newBook = await prisma.book.create({
      data: {
        title,
        author,
        price: priceInCents,
        imageUrl,
        pdfUrl
      }
    });

    res.status(201).json({
      success: true,
      message: 'Book added successfully',
      data: {
        ...newBook,
        displayPrice: `$${(newBook.price / 100).toFixed(2)}`
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to add book',
      error: error.message
    });
  }
};

export const updateBook = async (req: Request, res: Response<ApiResponse<Book>>) => {
  try {
    const { id } = req.params;
    const { title, author, price, imageUrl, pdfUrl } = req.body;

    // Convert price from dollars to cents if provided
    const priceInCents = price ? Math.round(parseFloat(price) * 100) : undefined;

    const updatedBook = await prisma.book.update({
      where: { id: parseInt(id) },
      data: {
        title,
        author,
        price: priceInCents,
        imageUrl,
        pdfUrl
      }
    });

    res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      data: {
        ...updatedBook,
        displayPrice: `$${(updatedBook.price / 100).toFixed(2)}`
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update book',
      error: error.message
    });
  }
};

export const deleteBook = async (req: Request, res: Response<ApiResponse<null>>) => {
  try {
    const { id } = req.params;

    await prisma.book.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete book',
      error: error.message
    });
  }
};

// Order Management
export const getOrders = async (req: Request, res: Response<ApiResponse<Order[]>>) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            book: {
              select: {
                title: true,
                price: true
              }
            }
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedOrders: Order[] = orders.map(order => ({
      id: order.id,
      buyer: order.user?.name || 'Guest',
      buyerEmail: order.user?.email,
      items: order.items.map(item => ({
        bookId: item.bookId,
        title: item.book.title,
        quantity: item.quantity,
        price: item.book.price
      })),
      total: order.total,
      status: order.status as Order['status'],
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }));

    res.status(200).json({
      success: true,
      message: 'Orders retrieved successfully',
      data: formattedOrders
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve orders',
      error: error.message
    });
  }
};

export const updateOrderStatus = async (req: Request, res: Response<ApiResponse<Order>>) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Unpaid', 'Paid', 'Shipped', 'Delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status'
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            book: {
              select: {
                title: true
              }
            }
          }
        },
        user: {
          select: {
            name: true
          }
        }
      }
    });

    const formattedOrder: Order = {
      id: updatedOrder.id,
      buyer: updatedOrder.user?.name || 'Guest',
      items: updatedOrder.items.map(item => ({
        bookId: item.bookId,
        title: item.book.title,
        quantity: item.quantity,
        price: item.priceAtPurchase
      })),
      total: updatedOrder.total,
      status: updatedOrder.status as Order['status']
    };

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: formattedOrder
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update order status',
      error: error.message
    });
  }
};