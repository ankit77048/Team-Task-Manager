# TaskFlow — Team Task Manager

A full-stack, production-ready **Team Task Manager** web application with role-based access control (Admin/Member), Kanban boards, project management, real-time dashboards, and JWT authentication.

---

## 🚀 Live Demo Credentials (after seeding)

| Role   | Email                       | Password    |
|--------|-----------------------------|-------------|
| Admin  | admin@taskmanager.com       | Admin@123   |
| Member | alice@taskmanager.com       | Member@123  |
| Member | bob@taskmanager.com         | Member@123  |
| Member | carol@taskmanager.com       | Member@123  |

---

## 🧱 Tech Stack

| Layer      | Technology                                    |
|------------|-----------------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS, React Router v6 |
| Charts     | Chart.js + react-chartjs-2                    |
| Drag & Drop| @hello-pangea/dnd                             |
| Backend    | Node.js, Express.js                           |
| Database   | MongoDB + Mongoose                            |
| Auth       | JWT, bcryptjs                                 |
| Validation | express-validator                             |
| Security   | helmet, cors, express-rate-limit              |

---

## 📁 Project Structure

```
├── client/               # React + Vite frontend
│   └── src/
│       ├── api/          # Axios API calls
│       ├── components/   # Reusable UI components
│       ├── context/      # AuthContext (global auth state)
│       └── pages/        # Route-level pages
│
└── server/               # Node.js + Express backend
    ├── index.js          # App entry point
    └── src/
        ├── config/       # MongoDB connection
        ├── controllers/  # Route business logic
        ├── middleware/    # JWT auth + RBAC
        ├── models/        # Mongoose schemas
        └── routes/       # Express routers
```

---

## ⚙️ Environment Variables

### Backend (`server/.env`)
Copy `server/.env.example` to `server/.env` and fill in:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/taskmanager
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

### Frontend (`client/.env`) — optional
```env
VITE_API_URL=    # Leave empty to use Vite proxy (recommended for dev)
```

---

## 🛠️ Local Development Setup

### Prerequisites
- Node.js >= 18
- MongoDB Atlas account **or** local MongoDB instance

### 1. Clone / open the project
```bash
cd "Ehtara Ai project"
```

### 2. Backend setup
```bash
cd server
npm install
cp .env.example .env
# Edit .env — add your MONGODB_URI and JWT_SECRET
npm run seed     # Populate demo data (optional but recommended)
npm run dev      # Start dev server on port 5000
```

### 3. Frontend setup (new terminal)
```bash
cd client
npm install
npm run dev      # Start Vite on port 5173
```

Open **http://localhost:5173** in your browser.

---

## 📦 Production Build

```bash
# Frontend
cd client && npm run build   # outputs to client/dist/

# Backend
cd server && npm start       # NODE_ENV=production
```

---

## 🚢 Deployment

### Backend → Render
1. Push `server/` to GitHub
2. Create a **Web Service** on [Render](https://render.com)
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Add environment variables in Render dashboard
6. Set `CLIENT_URL` to your Vercel frontend URL

### Frontend → Vercel
1. Push `client/` to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Framework: **Vite**
4. Add environment variable:
   - `VITE_API_URL` = `https://your-render-backend.onrender.com/api`
5. Deploy

---

## 📡 API Endpoints

### Auth
| Method | Endpoint               | Access  | Description          |
|--------|------------------------|---------|----------------------|
| POST   | `/api/auth/register`   | Public  | Register new user    |
| POST   | `/api/auth/login`      | Public  | Login, get JWT       |
| GET    | `/api/auth/me`         | Private | Get current user     |
| PUT    | `/api/auth/profile`    | Private | Update profile       |
| PUT    | `/api/auth/password`   | Private | Change password      |

### Projects
| Method | Endpoint                            | Access       |
|--------|-------------------------------------|--------------|
| GET    | `/api/projects`                     | Private      |
| POST   | `/api/projects`                     | Admin only   |
| GET    | `/api/projects/:id`                 | Private      |
| PUT    | `/api/projects/:id`                 | Admin only   |
| DELETE | `/api/projects/:id`                 | Admin only   |
| POST   | `/api/projects/:id/members`         | Admin only   |
| DELETE | `/api/projects/:id/members/:userId` | Admin only   |

### Tasks
| Method | Endpoint                     | Access                        |
|--------|------------------------------|-------------------------------|
| GET    | `/api/tasks`                 | Private (filtered by role)    |
| POST   | `/api/tasks`                 | Admin only                    |
| GET    | `/api/tasks/:id`             | Private                       |
| PUT    | `/api/tasks/:id`             | Admin: all fields; Member: status |
| DELETE | `/api/tasks/:id`             | Admin only                    |
| GET    | `/api/tasks/project/:id`     | Private                       |

### Users (Admin only)
| Method | Endpoint             | Description       |
|--------|----------------------|-------------------|
| GET    | `/api/users`         | List all users    |
| GET    | `/api/users/:id`     | Get single user   |
| GET    | `/api/users/:id/stats` | User task stats |
| PUT    | `/api/users/:id/role`| Update user role  |
| DELETE | `/api/users/:id`     | Deactivate user   |

### Dashboard
| Method | Endpoint         | Description               |
|--------|------------------|---------------------------|
| GET    | `/api/dashboard` | Aggregated stats & charts |

---

## ✨ Features

### Admin
- ✅ Create / edit / delete projects with color coding
- ✅ Add / remove team members per project  
- ✅ Create / assign / edit / delete tasks
- ✅ Manage deadlines and priorities
- ✅ Full analytics dashboard with charts
- ✅ Team performance metrics
- ✅ Role management

### Member
- ✅ View assigned projects & tasks
- ✅ Update task status (drag-and-drop Kanban)
- ✅ Personal dashboard with own task stats
- ✅ Profile management

### All Users
- ✅ JWT authentication with auto-logout on expiry
- ✅ Responsive design (mobile + desktop)
- ✅ Toast notifications
- ✅ Overdue task alerts
- ✅ Dark glassmorphism UI

---

## 🔐 RBAC Summary

| Feature                | Admin | Member     |
|------------------------|-------|------------|
| Create/edit projects   | ✅    | ❌         |
| Manage members         | ✅    | ❌         |
| Create/delete tasks    | ✅    | ❌         |
| Edit all task fields   | ✅    | ❌         |
| Update own task status | ✅    | ✅         |
| View team page         | ✅    | ❌ (redirect) |
| Dashboard              | ✅ (all) | ✅ (own) |

---

## 🧪 Seed Script

```bash
cd server && npm run seed
```

Creates 4 users, 3 projects, and 13 tasks (including overdue tasks for demo purposes).
