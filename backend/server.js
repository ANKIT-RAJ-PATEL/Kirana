
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB, dbMode } from './config/db.js';
import { seedStore } from './data/store.js';
import productsRouter from './routes/products.js';
const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.get('/api/health', (req,res)=> res.json({ status:'ok', app:'KiranaIQ API', database: dbMode, note: dbMode==='mongodb' ? 'Connected to MongoDB' : 'MongoDB not connected — using local JSON fallback store (backend/data/store.json). Set MONGO_URI in backend/.env and restart to use MongoDB.' }));
app.use('/api/products', productsRouter);
app.use((err,req,res,next)=>{ console.error(err); res.status(500).json({ error: err.message || 'Server error' }); });
const PORT = process.env.PORT || 5000;
await connectDB();
await seedStore();
app.listen(PORT, ()=> console.log(`KiranaIQ backend running on http://localhost:${PORT}  (database: ${dbMode})`));
