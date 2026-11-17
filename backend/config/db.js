
import mongoose from 'mongoose';
export let dbMode = 'local-json-fallback';
export async function connectDB(){
  const uri = process.env.MONGO_URI;
  if(!uri){ console.log('[db] No MONGO_URI set — using local JSON fallback store (backend/data/store.json)'); return false; }
  try{
    mongoose.set('bufferCommands', false);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 4000 });
    dbMode = 'mongodb';
    console.log('[db] Connected to MongoDB:', mongoose.connection.name || uri.replace(/\/\/[^@]*@/, '//***@'));
    return true;
  }catch(err){
    console.log('[db] MongoDB not reachable ('+err.message+') — using local JSON fallback store. Start mongod or set a valid Atlas MONGO_URI in backend/.env to use MongoDB.');
    return false;
  }
}
export const usingMongo = () => dbMode === 'mongodb';
