import { Request, Response } from 'express';
interface CreateOrderRequest {
    customerName?: string;
    customerEmail?: string;
    items: {
        bookId: number;
        quantity: number;
    }[];
}
interface UpdateBookRequest {
    title?: string;
    author?: string;
    publisher?: string;
    price?: string;
    numericPrice?: number;
    image?: string;
    pdfUrl?: string;
}
interface UpdateOrderStatusRequest {
    status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
}
export declare const getAllBooks: (req: Request, res: Response) => Promise<void>;
export declare const getBookById: (req: Request, res: Response) => Promise<void>;
export declare const searchBooks: (req: Request, res: Response) => Promise<void>;
export declare const createOrder: (req: Request<{}, {}, CreateOrderRequest>, res: Response) => Promise<void>;
export declare const getAllOrders: (req: Request, res: Response) => Promise<void>;
export declare const getOrderById: (req: Request, res: Response) => Promise<void>;
export declare const updateOrderStatus: (req: Request<{
    id: string;
}, {}, UpdateOrderStatusRequest>, res: Response) => Promise<void>;
export declare const createBook: (req: Request, res: Response) => Promise<void>;
export declare const updateBook: (req: Request<{
    id: string;
}, {}, UpdateBookRequest>, res: Response) => Promise<void>;
export declare const deleteBook: (req: Request, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=shopControllers.d.ts.map