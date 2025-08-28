import { Request, Response } from 'express';
import { PrismaClient } from '../../generated/prisma/index.js';
import { Book, Order, ApiResponse } from '../types/adminTypes.js';

const prisma = new PrismaClient();

interface BookCreateData {
  title: string;
  author: string;
  publisher: string;
  price: string;
  numericPrice: number;
  image: string;
  pdfUrl: string;
  category?: string;
}

// Book Management
export const getBooks = async (req: Request, res: Response<ApiResponse<any[]>>) => {
  try {
    const books = await prisma.book.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      message: 'Books retrieved successfully',
      data: books.map(book => ({
        ...book,
        displayPrice: `${(book.numericPrice / 100).toFixed(2)}` // Use numericPrice instead of price
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

export const addBook = async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const { title, author, publisher, price, image, pdfUrl, category } = req.body;

    // Convert price from dollars to cents for numericPrice
    const priceInCents = Math.round(parseFloat(price) * 100);

    const newBook = await prisma.book.create({
      data: {
        title,
        author,
        publisher,
        price, // Keep as string for display
        numericPrice: priceInCents, // Store numeric value for calculations
        image,
        pdfUrl,
        category
      }
    });

    res.status(201).json({
      success: true,
      message: 'Book added successfully',
      data: {
        ...newBook,
        displayPrice: `${(newBook.numericPrice / 100).toFixed(2)}`
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

export const updateBook = async (req: Request, res: Response<ApiResponse<any>>) => {
  try {
    const { id } = req.params;
    const { title, author, publisher, price, image, pdfUrl, category } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Book ID is required'
      });
    }

    // Convert price from dollars to cents if provided
    const priceInCents = price ? Math.round(parseFloat(price) * 100) : undefined;
    
    const updatedBook = await prisma.book.update({
      where: { id: parseInt(id) },
      data: {
        title,
        author,
        publisher,
        price,
        numericPrice: priceInCents,
        image,
        pdfUrl,
        category
      }
    });

    res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      data: {
        ...updatedBook,
        displayPrice: `${(updatedBook.numericPrice / 100).toFixed(2)}`
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

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Book ID is required'
      });
    }

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
        orderItems: { // Use correct relation name from schema
          include: {
            book: {
              select: {
                title: true,
                price: true,
                numericPrice: true
              }
            }
          }
        }
        // Note: Your schema doesn't have user relation on Order
        // You only have userId string field, not a relation
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedOrders: Order[] = orders.map(order => ({
      id: order.id.toString(), // Convert to string to match Order type
      buyer: order.customerName || 'Guest', // Use customerName from schema
      buyerEmail: order.customerEmail, // Use customerEmail from schema
      items: order.orderItems.map(item => ({
        bookId: item.bookId,
        title: item.book.title,
        quantity: item.quantity,
        price: item.priceAtPurchase
      })),
      total: order.totalAmount, // Use totalAmount from schema
      status: order.status,
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

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    // Valid statuses from your enum
    const validStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) }, // Convert string to number
      data: { status },
      include: {
        orderItems: {
          include: {
            book: {
              select: {
                title: true
              }
            }
          }
        }
      }
    });

    const formattedOrder: Order = {
      id: updatedOrder.id.toString(),
      buyer: updatedOrder.customerName || 'Guest',
      buyerEmail: updatedOrder.customerEmail,
      items: updatedOrder.orderItems.map(item => ({
        bookId: item.bookId,
        title: item.book.title,
        quantity: item.quantity,
        price: item.priceAtPurchase
      })),
      total: updatedOrder.totalAmount,
      status: updatedOrder.status,
      createdAt: updatedOrder.createdAt,
      updatedAt: updatedOrder.updatedAt
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

/*import { Request, Response } from 'express';
import { PrismaClient } from '../../generated/prisma/index.js';
import { Book, Order, ApiResponse } from '../types/adminTypes.js';

const prisma = new PrismaClient();

interface BookCreateData {
  title: string;
  author: string;
  publisher: string;
  price: string;
  numericPrice: number;
  image: string;
  pdfUrl: string;
  category?: string;
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
        displayPrice: `$${(book.numericPrice / 100).toFixed(2)}` // Use numericPrice instead of price
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
    const { title, author, publisher, price, image, pdfUrl, category } = req.body;

    // Convert price from dollars to cents for numericPrice
    const priceInCents = Math.round(parseFloat(price) * 100);

    const newBook = await prisma.book.create({
      data: {
        title,
        author,
        publisher,
        price, // Keep as string for display
        numericPrice: priceInCents, // Store numeric value for calculations
        image,
        pdfUrl,
        category
      }
    });

    res.status(201).json({
      success: true,
      message: 'Book added successfully',
      data: {
        ...newBook,
        displayPrice: `$${(newBook.numericPrice / 100).toFixed(2)}`
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
    const { title, author, publisher, price, image, pdfUrl, category } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Book ID is required'
      });
    }

    // Convert price from dollars to cents if provided
    const priceInCents = price ? Math.round(parseFloat(price) * 100) : undefined;
    
    const updatedBook = await prisma.book.update({
      where: { id: parseInt(id) },
      data: {
        title,
        author,
        publisher,
        price,
        numericPrice: priceInCents,
        image,
        pdfUrl,
        category
      }
    });

    res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      data: {
        ...updatedBook,
        displayPrice: `$${(updatedBook.numericPrice / 100).toFixed(2)}`
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

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Book ID is required'
      });
    }

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
        orderItems: { // Use correct relation name from schema
          include: {
            book: {
              select: {
                title: true,
                price: true,
                numericPrice: true
              }
            }
          }
        }
        // Note: Your schema doesn't have user relation on Order
        // You only have userId string field, not a relation
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedOrders: Order[] = orders.map(order => ({
      id: order.id.toString(), // Convert to string to match Order type
      buyer: order.customerName || 'Guest', // Use customerName from schema
      buyerEmail: order.customerEmail, // Use customerEmail from schema
      items: order.orderItems.map(item => ({
        bookId: item.bookId,
        title: item.book.title,
        quantity: item.quantity,
        price: item.priceAtPurchase
      })),
      total: order.totalAmount, // Use totalAmount from schema
      status: order.status,
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

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }

    // Valid statuses from your enum
    const validStatuses = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status. Must be one of: ' + validStatuses.join(', ')
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) }, // Convert string to number
      data: { status },
      include: {
        orderItems: {
          include: {
            book: {
              select: {
                title: true
              }
            }
          }
        }
      }
    });

    const formattedOrder: Order = {
      id: updatedOrder.id.toString(),
      buyer: updatedOrder.customerName || 'Guest',
      buyerEmail: updatedOrder.customerEmail,
      items: updatedOrder.orderItems.map(item => ({
        bookId: item.bookId,
        title: item.book.title,
        quantity: item.quantity,
        price: item.priceAtPurchase
      })),
      total: updatedOrder.totalAmount,
      status: updatedOrder.status,
      createdAt: updatedOrder.createdAt,
      updatedAt: updatedOrder.updatedAt
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


/*import { Request, Response } from 'express';
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
      
    displayPrice: `$${(parseFloat(book.price) / 100).toFixed(2)}`
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
     const bookId = req.params.id;
      if (!bookId) {
      return res.status(400).json();
    }
    
    const updatedBook = await prisma.book.update({
      
    where: { id: parseInt(bookId) }
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
*/