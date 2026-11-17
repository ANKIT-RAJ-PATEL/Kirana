import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
import { usingMongo } from '../config/db.js';
import Product, { toClient } from '../models/Product.js';
import { demoProducts as sampleProducts } from './demoData.js';
// ONE single dataset for the whole app. No demo/real modes.
// It is seeded once with sample products so the dashboard is not empty on first run;
// after that, whatever the user adds / edits / imports IS the dataset.
export const DATASET = 'store';
const __dir = path.dirname(fileURLToPath(import.meta.url));
const FILE = path.join(__dir, 'store.json');
const newId = () => 'P' + Date.now().toString(36).toUpperCase() + Math.floor(Math.random()*90+10);
function readFileStore(){ try{ return JSON.parse(fs.readFileSync(FILE,'utf8')); }catch{ return null; } }
function writeFileStore(s){ fs.writeFileSync(FILE, JSON.stringify(s,null,2)); }
function fileStore(){ let s = readFileStore(); if(!s || !Array.isArray(s.products)){ s = { products: sampleProducts.map(p=>({...p})) }; writeFileStore(s); } return s; }
async function seedMongoIfEmpty(){ const count = await Product.countDocuments({mode:DATASET}); if(count===0){ await Product.insertMany(sampleProducts.map(p=>({...p, productId:p.id, mode:DATASET}))); } }
export async function listProducts(){
  if(usingMongo()){ const docs = await Product.find({mode:DATASET}).sort({createdAt:1}); return docs.map(toClient); }
  return fileStore().products;
}
export async function createProduct(data){
  const clean = pick(data);
  if(usingMongo()){ const doc = await Product.create({...clean, productId:newId(), mode:DATASET}); return toClient(doc); }
  const s=fileStore(); const item={...clean, id:newId(), reviewed:false}; s.products.push(item); writeFileStore(s); return item;
}
export async function updateProduct(id, data){
  const clean = pick(data);
  if(usingMongo()){ const doc = await Product.findOneAndUpdate({mode:DATASET, productId:id}, clean, {new:true, runValidators:true}); return doc?toClient(doc):null; }
  const s=fileStore(); const i=s.products.findIndex(p=>p.id===id); if(i<0) return null; s.products[i]={...s.products[i], ...clean}; writeFileStore(s); return s.products[i];
}
export async function updateStock(id, stock){
  if(usingMongo()){ const doc = await Product.findOneAndUpdate({mode:DATASET, productId:id}, {current_stock: stock}, {new:true, runValidators:true}); return doc?toClient(doc):null; }
  const s=fileStore(); const item=s.products.find(p=>p.id===id); if(!item) return null; item.current_stock=stock; writeFileStore(s); return item;
}
export async function toggleReviewed(id){
  if(usingMongo()){ const doc=await Product.findOne({mode:DATASET, productId:id}); if(!doc) return null; doc.reviewed=!doc.reviewed; await doc.save(); return toClient(doc); }
  const s=fileStore(); const p=s.products.find(p=>p.id===id); if(!p) return null; p.reviewed=!p.reviewed; writeFileStore(s); return p;
}
export async function deleteProduct(id){
  if(usingMongo()){ const r=await Product.deleteOne({mode:DATASET, productId:id}); return r.deletedCount>0; }
  const s=fileStore(); const before=s.products.length; s.products=s.products.filter(p=>p.id!==id); writeFileStore(s); return s.products.length<before;
}
export async function importProducts(rows, replace){
  const items = rows.map(r=>({...pick(r), reviewed:false}));
  if(usingMongo()){ if(replace) await Product.deleteMany({mode:DATASET}); const docs=await Product.insertMany(items.map(x=>({...x, productId:newId()+Math.floor(Math.random()*999), mode:DATASET}))); return docs.map(toClient); }
  const s=fileStore(); const withIds=items.map(x=>({...x, id:newId()+Math.floor(Math.random()*999)})); s.products = replace? withIds : [...s.products, ...withIds]; writeFileStore(s); return withIds;
}
export async function resetSample(){
  if(usingMongo()){ await Product.deleteMany({mode:DATASET}); await Product.insertMany(sampleProducts.map(p=>({...p, productId:p.id, mode:DATASET}))); return listProducts(); }
  const s=fileStore(); s.products=sampleProducts.map(p=>({...p})); writeFileStore(s); return s.products;
}
export async function clearAll(){
  if(usingMongo()){ await Product.deleteMany({mode:DATASET}); return []; }
  const s=fileStore(); s.products=[]; writeFileStore(s); return [];
}
export async function seedStore(){ if(usingMongo()){ await seedMongoIfEmpty(); } else { fileStore(); } }
function pick(d){ return { product_name:String(d.product_name||'').trim(), category:String(d.category||'').trim(), current_stock:Number(d.current_stock), units_sold:Number(d.units_sold), observation_period_days:Number(d.observation_period_days), lead_time_days:Number(d.lead_time_days), safety_stock:Number(d.safety_stock), unit:String(d.unit||'pieces').trim(), target_stock:Number(d.target_stock) }; }
export function validateBody(d){ const c=pick(d); const errs=[]; if(!c.product_name) errs.push('product_name is required'); if(!c.category) errs.push('category is required'); for(const k of ['current_stock','units_sold','observation_period_days','lead_time_days','safety_stock','target_stock']){ if(isNaN(c[k])) errs.push(k+' must be a number'); else if(c[k]<0) errs.push(k+' cannot be negative'); } if(c.observation_period_days<=0) errs.push('observation_period_days must be at least 1'); return errs; }
