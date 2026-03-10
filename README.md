# 🔗 LinkMate — Room Finding Platform

## Quick Start

### 1. Setup Database
1. Go to your Supabase SQL Editor: https://ndfqysbzwckegfrmrgan.supabase.co
2. Paste and run `database.sql`

### 2. Install & Run
```bash
npm install
npm run dev
```
Open http://localhost:3000

### 3. Create Admin (optional)
Sign up, then in Supabase SQL Editor:
```sql
UPDATE public.users SET role = 'admin' WHERE email = 'your@email.com';
```

---

## Routes
| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/browse` | Browse & filter all rooms |
| `/browse/favorites` | Saved rooms (citizens) |
| `/room/[id]` | Room detail + contact owner |
| `/auth/login` | Login |
| `/auth/signup` | Signup with role selection |
| `/owner` | Owner dashboard (manage listings) |
| `/owner/add` | Add new room (3-step: details → photos → done) |
| `/owner/edit/[id]` | Edit existing room + manage photos |
| `/admin` | Admin panel (users + rooms) |

## Key Fixes in This Version
- ✅ No `next/headers` import — pure client-side Supabase
- ✅ Singleton Supabase client (no multiple GoTrueClient warnings)
- ✅ Owner dashboard with Add/Edit/Delete/Toggle availability
- ✅ 3-step room creation flow (details → photos → done)
- ✅ Working image upload with drag-and-drop
- ✅ Browse rooms works without login
- ✅ Room details visible to everyone
- ✅ Navbar shows "Add Room" button for owners on every page
- ✅ Auth redirects work properly by role
