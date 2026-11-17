import { Router } from 'express';
import * as store from '../data/store.js';
import { enrichAll, dashboardStats } from '../utils/calculations.js';
const r = Router();
// Single dataset — no ?mode= anywhere anymore.
r.get('/', async (req,res,next)=>{ try{ res.json(await store.listProducts()); }catch(e){ next(e); } });
r.get('/enriched', async (req,res,next)=>{ try{ res.json(enrichAll(await store.listProducts())); }catch(e){ next(e); } });
r.get('/reorder', async (req,res,next)=>{ try{ const e=enrichAll(await store.listProducts()); res.json(e.filter(p=>p.status==='Critical'||p.status==='Reorder')); }catch(e){ next(e); } });
r.get('/stats', async (req,res,next)=>{ try{ res.json(dashboardStats(await store.listProducts())); }catch(e){ next(e); } });
r.post('/', async (req,res,next)=>{ try{ const errs=store.validateBody(req.body); if(errs.length) return res.status(400).json({errors:errs}); res.status(201).json(await store.createProduct(req.body)); }catch(e){ next(e); } });
r.post('/import', async (req,res,next)=>{ try{ const {rows, replace} = req.body||{}; if(!Array.isArray(rows)) return res.status(400).json({error:'rows array is required'}); for(const row of rows){ const errs=store.validateBody(row); if(errs.length) return res.status(400).json({errors:errs}); } res.json(await store.importProducts(rows, !!replace)); }catch(e){ next(e); } });
r.post('/reset-sample', async (req,res,next)=>{ try{ res.json(await store.resetSample()); }catch(e){ next(e); } });
r.delete('/clear-all', async (req,res,next)=>{ try{ res.json(await store.clearAll()); }catch(e){ next(e); } });
r.put('/:id', async (req,res,next)=>{ try{ const errs=store.validateBody(req.body); if(errs.length) return res.status(400).json({errors:errs}); const out=await store.updateProduct(req.params.id, req.body); if(!out) return res.status(404).json({error:'Product not found'}); res.json(out); }catch(e){ next(e); } });
r.patch('/:id/stock', async (req,res,next)=>{ try{ const v=Number(req.body.current_stock); if(isNaN(v)||v<0) return res.status(400).json({error:'current_stock must be a number >= 0'}); const out=await store.updateStock(req.params.id, v); if(!out) return res.status(404).json({error:'Product not found'}); res.json(out); }catch(e){ next(e); } });
r.patch('/:id/reviewed', async (req,res,next)=>{ try{ const out=await store.toggleReviewed(req.params.id); if(!out) return res.status(404).json({error:'Product not found'}); res.json(out); }catch(e){ next(e); } });
r.delete('/:id', async (req,res,next)=>{ try{ const ok=await store.deleteProduct(req.params.id); if(!ok) return res.status(404).json({error:'Product not found'}); res.json({deleted:true}); }catch(e){ next(e); } });
export default r;
