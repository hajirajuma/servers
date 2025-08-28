export interface Book {
  id: number;
  title: string;
  author: string;
  price: number; // Stored in cents
  displayPrice: string; // Formatted string like "$250.00"
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
  status: 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}