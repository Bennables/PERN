import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

// Import routes
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import orgRoutes from './routes/org.js';

const app = express();

dotenv.config();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173', // Vite default port
    credentials: true
}));
app.use(cookieParser());

// Mount routes
app.use(authRoutes);
app.use(orgRoutes);
app.use(taskRoutes);

app.listen(3333, () => {
    console.log("We're connected \n http://localhost:3333");
});