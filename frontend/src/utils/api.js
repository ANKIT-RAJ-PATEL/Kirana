// All data comes from the MERN backend (Express API on port 5000, via Vite proxy).
// ONE single dataset — there are no demo/real modes anymore.
const base = '/api/products';
async function req(url, options={}){ const res = await fetch(url, { headers:{'Content-Type':'application/json'}, ...options }); if(!res.ok){ let msg='Request failed ('+res.status+')'; try{ const j=await res.json(); msg=j.error||(j.errors||[]).join('; ')||msg; }catch{} throw new Error(msg); } return res.json(); }
export const api = {
  list: () => req(base),
  create: (data) => req(base, { method:'POST', body: JSON.stringify(data) }),
  update: (id, data) => req(`${base}/${id}`, { method:'PUT', body: JSON.stringify(data) }),
  updateStock: (id, current_stock) => req(`${base}/${id}/stock`, { method:'PATCH', body: JSON.stringify({current_stock}) }),
  toggleReviewed: (id) => req(`${base}/${id}/reviewed`, { method:'PATCH' }),
  remove: (id) => req(`${base}/${id}`, { method:'DELETE' }),
  importRows: (rows, replace) => req(`${base}/import`, { method:'POST', body: JSON.stringify({rows, replace}) }),
  resetSample: () => req(`${base}/reset-sample`, { method:'POST' }),
  clearAll: () => req(`${base}/clear-all`, { method:'DELETE' }),
  health: () => req('/api/health')
};
