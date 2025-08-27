import { Request, Response } from 'express';
interface CreateBookRequest {
    title: string;
    author: string;
    publisher: string;
    price: string;
    image: string;
    pdfUrl: string;
    category?: string;
}
export declare const getAllBooks: (req: Request, res: Response) => Promise<void>;
export declare const getAllCategories: (req: Request, res: Response) => Promise<void>;
export declare const getBooksByCategory: (req: Request, res: Response) => Promise<void>;
export declare const searchBooks: (req: Request, res: Response) => Promise<void>;
export declare const getBookById: (req: Request, res: Response) => Promise<void>;
export declare const addToCart: (req: Request, res: Response) => Promise<void>;
export declare const createBook: (req: Request<{}, {}, CreateBookRequest>, res: Response) => Promise<void>;
export declare const updateBook: (req: Request, res: Response) => Promise<void>;
export declare const deleteBook: (req: Request, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=categoriesControllers.d.ts.map