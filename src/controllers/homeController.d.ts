import { Request } from 'express';
interface BookParams {
    id?: string;
    category?: string;
    query?: string;
}
export declare const getAllBooks: (req: Request, res: Response) => Promise<void>;
export declare const getFeaturedBooks: (req: Request, res: Response) => Promise<void>;
export declare const getBookById: (req: Request<BookParams>, res: Response) => Promise<void>;
export declare const getBooksByCategory: (req: Request<BookParams>, res: Response) => Promise<void>;
export declare const searchBooks: (req: Request<BookParams>, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=homeController.d.ts.map