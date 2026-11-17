import 'dotenv/config';
import { connectDB } from '../config/db.js';
import { resetSample } from '../data/store.js';
await connectDB();
const products = await resetSample();
console.log(`Seeded ${products.length} sample products into the single KiranaIQ dataset (sample data is illustrative, not real shop records).`);
process.exit(0);
