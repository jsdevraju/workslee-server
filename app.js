import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import errorHandler from './middleware/error.js';
import morgan from 'morgan';
import { config } from 'dotenv';

// Define Application App
const app = express();

config();


//Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// All Routes here
import authRoute from './routes/authRoute.js'
import userRoute from './routes/userRoute.js'
import jobRoute from './routes/jobRoute.js'

// Route Middleware
app.use("/api/v1", authRoute);
app.use("/api/v1", userRoute);
app.use("/api/v1", jobRoute);

// Error Middleware
app.use(errorHandler);

export default app;