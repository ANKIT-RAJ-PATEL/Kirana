# KiranaIQ — Smart Inventory & Reorder Assistant

A simple tool for a small kirana shop: it watches current stock, works out how fast each product is selling, and tells the shopkeeper what to reorder, how much, and how urgently — before the shelf goes empty.

Built as a full **MERN stack** app — **MongoDB + Express + React + Node.js** — in two folders:

```
kirana-iq/
  frontend/   React + Vite + Tailwind CSS + Recharts (port 5173)
  backend/    Node + Express REST API + Mongoose / MongoDB (port 5000)
```

The frontend never stores products itself — every product, edit, stock update and import goes through the backend API (`frontend/src/utils/api.js`).

## How to run it (MERN — needs TWO terminals)

**Terminal 1 — backend:**

```powershell
cd backend
copy .env.example .env
npm install
npm run dev
```

**Terminal 2 — frontend:**

```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The Vite dev server proxies `/api` calls to the backend on port 5000.
Shortcut from the project root (after installing both once): `npm run install-all`, then `npm run dev:backend` and `npm run dev:frontend` in two terminals.

**MongoDB:** set `MONGO_URI` in `backend/.env` — either a local MongoDB (`mongodb://127.0.0.1:27017/kiranaiq`, needs `mongod` running) or a free MongoDB Atlas connection string. Seed demo products into Mongo with `npm run seed` from the root (or `cd backend; npm run seed`).

**If MongoDB is not running:** the backend does NOT crash. It logs a clear message and falls back to a local JSON store (`backend/data/store.json`) with the exact same API, so the project always runs for a demo. `GET /api/health` tells you which database mode you are in (`"database": "mongodb"` or `"local-json-fallback"`). For your final submission, run it once with real MongoDB connected so you can honestly say the MERN stack was used end-to-end.

Production build of the frontend: `cd frontend; npm run build`.

## One inventory — no modes

There is exactly **one** dataset, one dashboard, one inventory. No Demo Mode / Real Store Mode switch.

It starts with 28 sample products (Maggi, Parle-G, Amul Milk, Tata Salt, etc.) so the dashboard is not empty and every screen can be tried immediately. Those sample products are illustrative — they are **not** collected from any real shop. Add, edit and delete them freely, or replace all of them at once with your own shop CSV (Import / Export → import → **Replace all**). From that moment, the one inventory is your shop's inventory.

## Where to put YOUR real shop data  ← the important part

The assignment needs at least 20 entries you collected yourself from a real shopkeeper. Do **not** submit the demo data as fieldwork.

1. Collect your data at the shop (name, current stock, how much sold, over how many days, how long the supplier takes, etc.).
2. Put it in a CSV with exactly these columns — use `data/real-data-template.csv` as the starting file, or download the template from the app's **Import / Export** page:

```
product_name,category,current_stock,units_sold,observation_period_days,lead_time_days,safety_stock,unit,target_stock
```

3. In the app: go to **Import / Export → Choose CSV file**.
4. Check the preview: it shows valid rows, invalid rows, missing columns and duplicates. Fix bad rows in your CSV — the app never silently invents missing values.
5. Choose **Add valid rows** or **Replace all**.
6. Also keep that same file in the repo root as `data.csv` for submission (replace the demo `data.csv` that ships with this project — the shipped one is the illustrative demo set, clearly labelled, and is only there so the tool can be tried immediately).

One honest example row (format only):

```
Amul Taaza Milk 500ml,Dairy & Bread,9,182,14,1,18,packets,90
```

## How the reorder maths works

All of it is in `src/utils/calculations.js` — plain functions, no UI code mixed in, so they can be tested and changed easily (for example, changing a threshold live during a review call).

- Average Daily Demand = Units Sold ÷ Observation Period (days)
- Lead-time Demand = Average Daily Demand × Supplier Lead Time (days)
- Reorder Point = Lead-time Demand + Safety Stock  (rounded up)
- Suggested Order Quantity = max(0, Target Stock − Current Stock)  (rounded up)

Status: **Critical** = stock is zero or less than half the reorder point. **Reorder** = stock at/below reorder point. **Slow-moving** = more than 45 days of stock at the current selling rate. **Sufficient** = everything else. Every flagged product shows a plain-language reason.

### What it gets wrong — honestly

- It uses a simple average. It cannot know about festivals, weekends, salary days, weather, or a discount offer, all of which change kirana demand a lot.
- If the observation period is very short (under 3 days) the app itself warns that the suggestion should not be trusted yet.
- It assumes the supplier lead time you typed is reliable. If the wholesaler is late, safety stock is the only buffer.
- Perishables (milk, curd) need daily judgement that a 14-day average cannot give.

## Screens

- **Dashboard** — totals, critical/reorder counts, units sold, category chart, top sellers, reorder priority list. All calculated live from the selected dataset, nothing hard-coded.
- **Inventory** — search, category/status filters, sorting, add/edit/delete (with confirmation), quick stock +/− and direct stock edit, product detail view with the reason for its status.
- **Smart Reorder** — only the products that need ordering, grouped by Critical / High / Normal priority, with suggested quantities and a downloadable purchase-list CSV. "Mark as reviewed" never marks anything as purchased.
- **Analytics** — sales by product, inventory by category, fast- and slow-moving lists, stock-status distribution. No fake daily trend chart: totals alone cannot honestly produce one.
- **Import / Export** — CSV import with preview + validation report, exports for full inventory / reorder recommendations / product report, demo-CSV download, reset demo data, clear real data (with confirmation).

## Data storage

Products live in the **backend** — in MongoDB (collection `products`, model in `backend/models/Product.js`, in one single collection, plus a `reviewed` flag) or, when Mongo is unreachable, in the fallback `backend/data/store.json` with the same demo/real separation. The browser only remembers which mode you last selected. Edits survive a page refresh because they are saved server-side. Reset Demo restores the original 28 illustrative products.

### Backend API (all under http://localhost:5000)

| Method | Route | What it does |
|---|---|---|
| GET | /api/health | status + which database mode is active |
| GET | /api/products | list products (the one dataset) |
| GET | /api/products/stats | dashboard totals, calculated server-side |
| GET | /api/products/reorder | only Critical/Reorder products, enriched |
| POST | /api/products | add product (validated, negatives rejected) |
| PUT | /api/products/:id | edit product |
| PATCH | /api/products/:id/stock | update only current stock |
| PATCH | /api/products/:id/reviewed | toggle reviewed |
| DELETE | /api/products/:id | delete product |
| POST | /api/products/import | bulk import validated CSV rows (add or replace) |
| POST | /api/products/reset-demo | restore demo set |
| DELETE | /api/products/clear-real | delete all real records |

## Project structure

```
backend/
  server.js          Express app entry (port 5000)
  config/db.js       Mongoose connection + fallback decision
  models/Product.js  Mongoose schema (mode: demo|real, reviewed)
  routes/products.js all REST endpoints above
  data/store.js      data layer used by routes (MongoDB OR JSON fallback)
  data/demoData.js   illustrative demo set (server copy)
  utils/calculations.js  reorder engine (server copy — same formulas)
  seed/seed.js       `npm run seed` — loads demo products into the DB
frontend/src/
  components/   ui.jsx (cards, badges, modals, toasts), ProductForm.jsx
  pages/        Dashboard, Inventory, Reorder, Analytics, DataPage
  data/         demoData.js (labels only — product data now comes from the API)
  utils/        api.js (all backend calls), calculations.js, csv.js
  hooks/        useToast.js
data.csv                  demo/illustrative set — REPLACE with your real collected CSV before submission
data/real-data-template.csv   blank template with the correct header
research.md               fill this in yourself — Step 1 of the assignment
fieldwork.md              fill this in yourself — Step 2 (your visit, your photos, your conversation)
```

## Tests done while building

Calculation checks run in Node (average demand, reorder point, suggested quantity, zero-stock → Critical, slow-moving detection, negative-value validation), CSV validation checks (valid/invalid/duplicate/missing-column cases), a full production build, and live API tests against the running backend: health, stats, list, create, edit (PUT), stock-only patch, reviewed toggle, import, clear-real, reset-demo, and negative-stock rejection (400). A real bug was caught and fixed this way: the first stock-patch reused the full-product formatter and blanked the other fields — stock updates are now a true partial update, re-tested. There is only one dataset, so there is nothing to separate or mix — every API route reads and writes the same single collection / fallback `products` list.

Screen Recording link - https://drive.google.com/file/d/1IHvEQ8wZIlSr7BkVi2h0Vy_pt5s3ZtXT/view?usp=drive_link
