import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

/* ROUTES IMPORTS */
import categoriesRoutes from "./routes/categoriesRoutes";
import shopRoutes from "./routes/shopRoutes";
import cartRoutes from './routes/cartRoutes';
import { ApiResponse } from './types/cartTypes';
import adminRoutes from './routes/adminRoutes';
import { ApiResponse } from './types/adminTypes';


/* CONFIGURATION */
dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

/* ROUTES */
app.use("/api/categories", categoriesRoutes);  
app.use("/api/shop", shopRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/admin', adminRoutes);

// Health check route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Book Heaven API is running!",
    endpoints: {
      categories: "/api/categories",
      shop: "/api/shop"
    }
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : "Something went wrong"
  });
});

/* SERVER */
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Documentation available at http://localhost:${PORT}`);
});