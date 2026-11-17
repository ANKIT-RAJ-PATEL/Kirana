import {useEffect,useState,useCallback} from 'react'; import {LayoutDashboard,Boxes,ShoppingCart,BarChart3,Database,Menu,ServerCrash} from 'lucide-react';
import Dashboard from './pages/Dashboard'; import Inventory from './pages/Inventory'; import Reorder from './pages/Reorder'; import Analytics from './pages/Analytics'; import DataPage from './pages/DataPage';
import {api} from './utils/api'; import {useToast} from './hooks/useToast'; import {Toasts} from './components/ui';
const NAV=[['dashboard','Dashboard',LayoutDashboard],['inventory','Inventory',Boxes],['reorder','Smart Reorder',ShoppingCart],['analytics','Analytics',BarChart3],['data','Import / Export',Database]];
export default function App(){
  const [products,setProducts]=useState([]); const [loading,setLoading]=useState(true); const [backendDown,setBackendDown]=useState(false);
  const [page,setPage]=useState('dashboard'); const [open,setOpen]=useState(false); const {toasts,push}=useToast();
  const load=useCallback(async()=>{ setLoading(true); try{ const data=await api.list(); setProducts(data); setBackendDown(false); }catch(e){ setBackendDown(true); setProducts([]); } setLoading(false); },[]);
  useEffect(()=>{ load(); },[load]);
  const reviewed=products.filter(p=>p.reviewed).map(p=>p.id);
  const wrap=fn=>async(...args)=>{ try{ await fn(...args); }catch(e){ push(e.message||'Backend error','error'); } };
  const handlers={
    onAdd: wrap(async d=>{ const created=await api.create(d); setProducts(p=>[...p,created]); }),
    onEdit: wrap(async (id,d)=>{ const upd=await api.update(id,d); setProducts(p=>p.map(x=>x.id===id?upd:x)); }),
    onDelete: wrap(async id=>{ await api.remove(id); setProducts(p=>p.filter(x=>x.id!==id)); }),
    onStock: wrap(async (id,v)=>{ setProducts(p=>p.map(x=>x.id===id?{...x,current_stock:v}:x)); const upd=await api.updateStock(id,v); setProducts(p=>p.map(x=>x.id===id?upd:x)); }),
    onReview: wrap(async id=>{ const upd=await api.toggleReviewed(id); setProducts(p=>p.map(x=>x.id===id?upd:x)); }),
    onImport: wrap(async (rows,replace)=>{ const out=await api.importRows(rows,replace); setProducts(replace?out:p=>[...p,...out]); }),
    onResetSample: wrap(async ()=>{ const out=await api.resetSample(); setProducts(out); }),
    onClearAll: wrap(async ()=>{ await api.clearAll(); setProducts([]); })
  };
  const titles={dashboard:'Dashboard',inventory:'Inventory',reorder:'Smart Reorder',analytics:'Analytics',data:'Import / Export Data'};
  return (<div className="min-h-screen lg:flex"><aside className={`fixed lg:static z-50 inset-y-0 left-0 w-64 bg-slate-900 text-white p-5 transform ${open?'translate-x-0':'-translate-x-full'} lg:translate-x-0 transition-transform`}><div className="flex items-center gap-2"><div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center font-extrabold text-xl">K</div><div><h1 className="font-extrabold text-lg leading-none">KiranaIQ</h1><p className="text-xs text-slate-400 mt-1">MERN · Smart Inventory & Reorder</p></div></div><div className="mt-7 space-y-1">{NAV.map(([k,label,Icon])=>(<button key={k} onClick={()=>{setPage(k); setOpen(false);}} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${page===k?'bg-emerald-600':'hover:bg-slate-800 text-slate-300'}`}><Icon size={19}/>{label}</button>))}</div><div className="mt-8 bg-slate-800 rounded-2xl p-4"><p className="text-xs font-bold text-slate-300">ONE STORE, ONE INVENTORY</p><p className="text-[11px] text-slate-400 mt-2 leading-relaxed">There is only one dataset now — no Demo / Real switch. It starts with sample products so the dashboard is not empty. Add, edit, delete or import your own shop CSV and that becomes your inventory.</p></div><p className="text-[11px] text-slate-500 mt-6 leading-relaxed">Stack: MongoDB + Express + React + Node. Data is saved by the backend API, not in the browser.</p></aside>
  <main className="flex-1 min-w-0"><header className="sticky top-0 bg-[#f8fafc]/90 backdrop-blur border-b border-slate-200 px-4 lg:px-8 py-4 flex items-center justify-between z-40"><div className="flex items-center gap-3"><button className="lg:hidden p-2 border rounded-xl bg-white" onClick={()=>setOpen(true)}><Menu size={20}/></button><div><h2 className="text-xl lg:text-2xl font-extrabold">{titles[page]}</h2><p className="text-xs text-slate-500">One dashboard · one inventory · {products.length} products</p></div></div></header><div className="p-4 lg:p-8 max-w-[1400px] mx-auto">
  {backendDown&&<div className="mb-5 bg-red-50 border border-red-200 text-red-800 rounded-2xl px-4 py-3 text-sm flex gap-2 items-start"><ServerCrash className="shrink-0 mt-0.5" size={18}/><span><b>Backend is not running.</b> Start it in a second terminal: <code className="bg-red-100 px-1.5 py-0.5 rounded">cd backend && npm install && npm run dev</code> — wait 5 seconds, then refresh this page.</span></div>}
  {!backendDown&&<div className="mb-5 bg-slate-100 border border-slate-200 text-slate-600 rounded-2xl px-4 py-3 text-sm">Sample products are preloaded so you can try every feature. Replace them with your own shop data from <b>Import / Export → Replace all</b> with your CSV.</div>}
  {loading?<div className="bg-white border rounded-2xl p-10 text-center text-slate-500">Loading products from backend…</div>:<>
  {page==='dashboard'&&<Dashboard products={products}/>} {page==='inventory'&&<Inventory products={products} {...handlers} toast={push}/>} {page==='reorder'&&<Reorder products={products} reviewed={reviewed} onReview={handlers.onReview} toast={push}/>} {page==='analytics'&&<Analytics products={products}/>} {page==='data'&&<DataPage products={products} {...handlers} toast={push}/>}</>}
  </div></main><Toasts toasts={toasts}/></div>); }
