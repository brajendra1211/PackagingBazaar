import express from 'express';
import cors from 'cors';
import productRoutes from './routes/productRoutes.js';
import authRoutes from './routes/authRoutes.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', productRoutes);
app.use('/api/auth', authRoutes);



const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));