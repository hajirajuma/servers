import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
/*ROUTES IMPORTS  */
import categoriesRoutes from './routes/categoriesRoutes.js';
import shopRoutes from './routes/shopRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import homeRoutes from './routes/homeRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { ApiResponse } from './types/adminTypes.js';

/* CONFIGURATION */
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
/*app.use(cors());*/
/*ROUTES */
app.use('/api/categories', categoriesRoutes);  
app.use('/api/shop', shopRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/books', homeRoutes);
/*SERVER*/
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`server running on server ${PORT}`);
});
//# sourceMappingURL=index.js.map