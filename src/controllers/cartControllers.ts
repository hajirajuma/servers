'use client';
import { Button } from "@/components/ui/button"
import Image from "next/image";
import { MoveRight, Search, ShoppingCart, Eye, Plus, Minus } from "lucide-react";
import { useState, useEffect } from "react";

interface Book {
  id: string;
  title: string;
  author: string;
  publisher: string;
  price: string;
  image: string;
  pdfUrl: string;
  category?: string;
}

interface CartItem {
  book: Book;
  quantity: number;
}

interface Cart {
  sessionId: string;
  items: CartItem[];
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

export default function CategoriesPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [cart, setCart] = useState<Cart | null>(null);
  const [showCart, setShowCart] = useState<boolean>(false);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  // Static fallback data
  const fallbackBooks: Book[] = [
    {
      id: "1",
      title: "Data Analysis using SQL and Excel",
      author: "Gordon S.Linoff",
      publisher: "Wiley Publishing",
      price: "K40000/$4.5",
      image: "/books/data1.jpg",
      pdfUrl: "/books/data.pdf",
      category: "Technology"
    },
    {
      id: "2",
      title: "JavaScript: The Complete Guide",
      author: "David Flanagan",
      publisher: "O'Reilly Media",
      price: "K30000/$3.8",
      image: "/books/atom.jpg",
      pdfUrl: "/books/javascript.pdf",
      category: "Technology"
    },
    {
      id: "3",
      title: "Linear Algebra and Its Applications",
      author: "David C. Lay",
      publisher: "Pearson",
      price: "K50000/$6.4",
      image: "/books/java.jpg",
      pdfUrl: "/books/linear.pdf",
      category: "Education"
    }
  ];

  const fallbackCategories = ["Education", "Technology", "Romance", "History", "Life"];

  // Get or create a session ID
  const getSessionId = (): string => {
    if (typeof window === 'undefined') return 'default-session';
    
    let sessionId = localStorage.getItem('cartSessionId');
    if (!sessionId) {
      sessionId = 'session-' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('cartSessionId', sessionId);
    }
    return sessionId;
  };

  // Fetch cart from backend
  const fetchCart = async () => {
    try {
      const sessionId = getSessionId();
      const response = await fetch(`${API_BASE_URL}/cart/${sessionId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }
      
      const result = await response.json();
      if (result.success) {
        setCart(result.data);
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      console.error('Error fetching cart:', err);
      // Fallback to empty cart if API fails
      setCart({
        sessionId: getSessionId(),
        items: [],
        total: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  };

  // Add to cart via API - FIXED THIS FUNCTION
  const addToCartAPI = async (bookId: string) => {
    try {
      setAddingToCart(bookId);
      const sessionId = getSessionId();
      const response = await fetch(`${API_BASE_URL}/cart/${sessionId}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookId, quantity: 1 })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // FIXED: Changed data.success to result.success
      if (result.success) {
        setCart(result.data);
        setError(""); // Clear any previous errors
        return true;
      } else {
        throw new Error(result.message || 'Failed to add to cart');
      }
    } catch (error: any) {
      console.error('Error adding to cart via API:', error);
      setError(error.message || "Failed to add item to cart");
      return false;
    } finally {
      setAddingToCart(null);
    }
  };

  // Update quantity via API
  const updateQuantityAPI = async (bookId: string, newQuantity: number) => {
    try {
      const sessionId = getSessionId();
      const response = await fetch(`${API_BASE_URL}/cart/${sessionId}/${bookId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quantity: Math.max(1, newQuantity) }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update quantity');
      }
      
      const result = await response.json();
      if (result.success) {
        setCart(result.data);
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      console.error('Error updating quantity:', err);
      // Re-fetch cart to ensure UI is in sync
      fetchCart();
    }
  };

  // Remove from cart via API
  const removeFromCartAPI = async (bookId: string) => {
    try {
      const sessionId = getSessionId();
      const response = await fetch(`${API_BASE_URL}/cart/${sessionId}/${bookId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove from cart');
      }
      
      const result = await response.json();
      if (result.success) {
        setCart(result.data);
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      console.error('Error removing item:', err);
      // Re-fetch cart to ensure UI is in sync
      fetchCart();
    }
  };

  // Clear cart via API
  const clearCartAPI = async () => {
    try {
      const sessionId = getSessionId();
      const response = await fetch(`${API_BASE_URL}/cart/${sessionId}/clear`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to clear cart');
      }
      
      const result = await response.json();
      if (result.success) {
        setCart(result.data);
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      console.error('Error clearing cart:', err);
      // Re-fetch cart to ensure UI is in sync
      fetchCart();
    }
  };

  // Fetch all books from API
  const fetchAllBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/books`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setBooks(data.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching books from API:', error);
      setError('Failed to load books from server. Using local data.');
      setBooks(fallbackBooks);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/books/categories`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setCategories(data.data);
      } else {
        throw new Error('Invalid categories response format');
      }
    } catch (error) {
      console.error('Error fetching categories from API:', error);
      setCategories(fallbackCategories);
    }
  };

  // Fetch books by category
  const fetchBooksByCategory = async (category: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/books/category/${encodeURIComponent(category)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setBooks(data.data);
      } else {
        throw new Error('Invalid category books response format');
      }
    } catch (error) {
      console.error('Error fetching books by category:', error);
      // Fallback to client-side filtering
      const filtered = fallbackBooks.filter(book => 
        book.category?.toLowerCase() === category.toLowerCase()
      );
      setBooks(filtered);
    } finally {
      setLoading(false);
    }
  };

  // Search books via API
  const searchBooks = async (query: string) => {
    if (!query.trim()) {
      if (selectedCategory) {
        fetchBooksByCategory(selectedCategory);
      } else {
        fetchAllBooks();
      }
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/books/search?query=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: {response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setBooks(data.data);
      } else {
        throw new Error('Invalid search response format');
      }
    } catch (error) {
      console.error('Error searching books:', error);
      // Fallback to client-side search
      const filtered = fallbackBooks.filter(book =>
        book.title.toLowerCase().includes(query.toLowerCase()) ||
        book.author.toLowerCase().includes(query.toLowerCase()) ||
        book.publisher.toLowerCase().includes(query.toLowerCase()) ||
        book.category?.toLowerCase().includes(query.toLowerCase())
      );
      setBooks(filtered);
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial data on component mount
  useEffect(() => {
    fetchAllBooks();
    fetchCategories();
    fetchCart();
  }, []);

  // Handle search with debouncing
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      searchBooks(searchTerm);
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm, selectedCategory]);

  // Handle category selection
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
    setSearchTerm(''); // Clear search when selecting category
    
    if (category === selectedCategory) {
      // If clicking the same category, show all books
      fetchAllBooks();
    } else {
      // Fetch books for the selected category
      fetchBooksByCategory(category);
    }
  };

  // Add book to cart
  const addToCart = async (book: Book) => {
    const success = await addToCartAPI(book.id);
    if (!success) {
      setError("Failed to add item to cart. Please try again.");
    }
  };

  // Get total cart items
  const getTotalItems = (): number => {
    if (!cart) return 0;
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  };

  // Get total cart price
  const getTotalPrice = (): string => {
    if (!cart) return "0.00";
    return (cart.total / 100).toFixed(2); // Assuming price is stored in cents
  };

  // View PDF function
  const viewPDF = (pdfUrl: string, title: string): void => {
    window.open(pdfUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setShowCart(false)}>
          <div className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl p-6 overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Shopping Cart ({getTotalItems()})</h3>
              <button onClick={() => setShowCart(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            
            {!cart || cart.items.length === 0 ? (
              <p className="text-gray-500 text-center">Your cart is empty</p>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {cart.items.map((item) => (
                    <div key={item.book.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <Image 
                        src={item.book.image} 
                        alt={item.book.title} 
                        width={60} 
                        height={80} 
                        className="object-cover rounded" 
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.book.title}</h4>
                        <p className="text-gray-600 text-xs">{item.book.author}</p>
                        <p className="font-bold text-sm">${(parseFloat(item.book.price.split('$')[1] || '0') * item.quantity).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => updateQuantityAPI(item.book.id, item.quantity - 1)}
                          className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantityAPI(item.book.id, item.quantity + 1)}
                          className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold">Total: ${getTotalPrice()}</span>
                  </div>
                  <button className="w-full bg-gray-900 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors">
                    Proceed to Checkout
                  </button>
                  <button 
                    onClick={clearCartAPI}
                    className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition-colors"
                  >
                    Clear Cart
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Header with Cart Button */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <button 
              onClick={() => setShowCart(true)}
              className="relative bg-gray-900 hover:bg-blue-700 text-white p-3 rounded-full transition-colors"
            >
              <ShoppingCart size={24} />
              {getTotalItems() > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-700 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                  {getTotalItems()}
                </span>
              )}
            </button>
            
            {/* Error message */}
            {error && (
              <div className="text-red-600 text-sm bg-red-100 px-4 py-2 rounded">
                {error}
                <button onClick={() => setError("")} className="ml-2">✕</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Centered Category Buttons Section */}
      <div className="shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-center">
            <div className="relative w-full max-w-4xl">
              <div className="relative overflow-x-auto pb-3">
                <div className="flex justify-center">
                  <ul className="inline-flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-6 flex-nowrap whitespace-nowrap">
                    <li className="flex-shrink-0">
                      <Button 
                        variant={selectedCategory === '' ? "default" : "outline"} 
                        className="text-sm px-3 py-1 sm:px-4 sm:py-2"
                        onClick={() => handleCategoryClick('')}
                      >
                        All Books
                      </Button>
                    </li>
                    {categories.map((category) => (
                      <li key={category} className="flex-shrink-0">
                        <Button 
                          variant={selectedCategory === category ? "default" : "outline"}
                          className="text-sm px-3 py-1 sm:px-4 sm:py-2"
                          onClick={() => handleCategoryClick(category)}
                        >
                          {category}
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Library Section */}
      <div className="bg-white shadow-lg w-full min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <div className="flex justify-center items-center mb-12 md:mb-16 lg:mb-20">
            <div className="relative w-full max-w-md top-10">
              <input 
                type="text" 
                placeholder="Search by genres, author, title..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 md:p-4 pr-12 border-2 border-gray-900 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-gray-700 placeholder-gray-500"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-900 hover:text-yellow-800 transition-colors">
                <Search size={20} />
              </button>
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Loading books...</p>
            </div>
          )}

          {/* Books List - Vertical Layout with Details on Left */}
          {!loading && (
            <div className="space-y-6 mb-16">
              {books.map((book) => (
                <div 
                  key={book.id}
                  className="bg-white border-2 border-blue-200 rounded-xl p-6 hover:border-blue-400 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Book Image - Left side */}
                    <div className="flex-shrink-0">
                      <button 
                        onClick={() => viewPDF(book.pdfUrl, book.title)}
                        className="block"
                      >
                        <div className="relative overflow-hidden rounded-lg bg-gray-100">
                          <Image 
                            src={book.image} 
                            alt={book.title}
                            width={150}
                            height={200}
                            className="w-32 h-40 md:w-36 md:h-48 object-cover transition-transform duration-300 hover:scale-105"
                          />
                        </div>
                      </button>
                    </div>
                    
                    {/* Spacer */}
                    <div className="flex-1"></div>
                    
                    {/* Book Details - Right side near margin */}
                    <div className="flex-shrink-0 w-full md:w-80 space-y-3">
                      <h3 className="text-gray-900 font-semibold text-lg md:text-xl leading-tight">
                        {book.title}
                      </h3>
                      <p className="text-gray-600 text-sm md:text-base">
                        <span className="font-medium">Author:</span> {book.author}
                      </p>
                      <p className="text-gray-600 text-sm md:text-base">
                        <span className="font-medium">Publisher:</span> {book.publisher}
                      </p>
                      {book.category && (
                        <p className="text-gray-600 text-sm md:text-base">
                          <span className="font-medium">Category:</span> {book.category}
                        </p>
                      )}
                      <p className="text-gray-600 font-bold text-base md:text-lg">
                        {book.price}
                      </p>
                      
                      {/* Individual book actions */}
                      <div className="flex flex-wrap gap-3 pt-2">
                        <button 
                          onClick={() => viewPDF(book.pdfUrl, book.title)}
                          className="bg-gray-900 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors duration-300 text-sm inline-flex items-center"
                        >
                          <Eye size={16} className="mr-1" />
                          View PDF
                        </button>
                        <button 
                          onClick={() => addToCart(book)}
                          disabled={addingToCart === book.id}
                          className="bg-gray-900 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors duration-300 text-sm inline-flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {addingToCart === book.id ? (
                            "Adding..."
                          ) : (
                            <>
                              <ShoppingCart size={16} className="mr-1" />
                              Add to Cart
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No results message */}
          {!loading && books.length === 0 && (searchTerm || selectedCategory) && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No books found {selectedCategory && `in category "${selectedCategory}"`}
                {searchTerm && ` matching "${searchTerm}"`}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pb-16 md:pb-20">
            <button 
              onClick={() => {
                setSelectedCategory('');
                setSearchTerm('');
                fetchAllBooks();
              }}
              className="w-full sm:w-auto bg-gray-900 hover:bg-yellow-700 hover:scale-105 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 transform hover:shadow-xl"
            >
              View All Categories
            </button>
            
            <button 
              onClick={() => fetchAllBooks()}
              className="w-full sm:w-auto bg-gray-900 hover:bg-yellow-700 hover:scale-105 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 transform hover:shadow-xl inline-flex items-center justify-center"
            >
              Browse More
              <MoveRight size={20} className="ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}