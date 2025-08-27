import { Request, Response } from 'express';
import { Book, Order, ApiResponse } from '../types/adminTypes.js';
export declare const getBooks: (req: Request, res: Response<ApiResponse<Book[]>>) => Promise<void>;
export declare const addBook: (req: Request, res: Response<ApiResponse<Book>>) => Promise<void>;
export declare const updateBook: (req: Request, res: Response<ApiResponse<Book>>) => Promise<void>;
export declare const deleteBook: (req: Request, res: Response<ApiResponse<null>>) => Promise<void>;
export declare const getOrders: (req: Request, res: Response<ApiResponse<Order[]>>) => Promise<void>;
export declare const updateOrderStatus: (req: Request, res: Response<ApiResponse<Order>>) => Promise<Response<ApiResponse<Order>, Record<string, any>> | undefined>;
//# sourceMappingURL=adminControllers.d.ts.map