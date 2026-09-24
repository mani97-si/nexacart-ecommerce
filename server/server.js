import 'dotenv/config';import express from 'express';import cors from 'cors';import morgan from 'morgan';import connectDB from './config/db.js';import {notFound,errorHandler} from './middleware/error.js';
import auth from './routes/auth.js';import products from './routes/products.js';import categories from './routes/categories.js';import cart from './routes/cart.js';import wishlist from './routes/wishlist.js';import orders from './routes/orders.js';import reviews from './routes/reviews.js';import users from './routes/users.js';import admin from './routes/admin.js';
const app=express();app.use(cors());app.use(express.json());app.use(morgan('dev'));
app.get('/api/health',(req,res)=>res.json({ok:true,service:'NexaCart API'}));
app.use('/api/auth',auth);app.use('/api/products',products);app.use('/api/categories',categories);app.use('/api/cart',cart);app.use('/api/wishlist',wishlist);app.use('/api/orders',orders);app.use('/api/reviews',reviews);app.use('/api/users',users);app.use('/api/admin',admin);
app.use(notFound);app.use(errorHandler);
const port=process.env.PORT||5000;connectDB().then(()=>app.listen(port,()=>console.log(`API running on ${port}`))).catch(e=>{console.error(e);process.exit(1)});
