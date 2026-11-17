# Project Reflection

### What I Got Wrong at the Start
I jumped straight into building a frontend-only React prototype using `LocalStorage` without setting up a proper backend. When I later had to move to a full MERN structure, I had to split the project into `frontend/` and `backend/` folders, rip out all the `LocalStorage` logic, and reconnect every page to REST APIs. I also initially missed the non-code submission requirements in the assignment brief.

### What I Would Cut
I would cut the two-dashboard setup ("Demo Mode" vs. "Real Store Mode"). Maintaining separate modes added unnecessary frontend state, extra `?mode=` API parameters, and a bug where clearing the inventory caused sample data to reload automatically. A single unified inventory that seeds sample products once at startup is much simpler and cleaner.

### Where AI Helped
- **Backend Setup:** Helped structure the Express routes, Mongoose schema, Vite proxy, and a local JSON fallback for when MongoDB wasn't available.
- **Debugging:** Caught a bug where stock updates were wiping out other product fields (name, sales, target) and helped fix it with a partial update.
- **Testing & Validation:** Sped up testing the reorder math, checking CSV imports for duplicates and bad data types, and fixing port 5000 conflicts.

### Where AI Wasted Time
Generating a complete frontend-only app with `LocalStorage` and a mode switcher right at the start felt fast, but almost all of that data logic had to be thrown away and rewritten once I switched to a proper MERN stack. Planning the backend first would have saved a lot of rework.
