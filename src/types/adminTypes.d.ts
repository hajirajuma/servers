export interface Book {
    id: number;
    title: string;
    author: string;
    price: number;
    displayPrice: string;
    imageUrl?: string;
    pdfUrl?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface Order {
    id: string;
    buyer: string;
    buyerEmail?: string;
    items: {
        bookId: number;
        title: string;
        quantity: number;
        price: number;
    }[];
    total: number;
    status: 'Pending' | 'Unpaid' | 'Paid' | 'Shipped' | 'Delivered';
    createdAt?: Date;
    updatedAt?: Date;
}
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}
//# sourceMappingURL=adminTypes.d.ts.map