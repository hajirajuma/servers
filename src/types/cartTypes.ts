export interface Book {
  id: number;
  title: string;
  author: string;
  publisher: string;
  price: number;
  displayPrice: string;
  image: string;
  pdfUrl: string;
}

export interface CartItem {
  book: Book;
  quantity: number;
}

export interface Cart {
  userId?: string;
  sessionId: string;
  items: CartItem[];
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}