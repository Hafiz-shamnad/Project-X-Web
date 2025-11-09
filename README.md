# ⚔️ Project-X CTF Platform

> **Project-X** is a next-generation cybersecurity and Capture The Flag (CTF) platform built for learners, ethical hackers, and organizations.  
> Designed to deliver seamless challenge experiences, secure flag validation, and real-time competition — all under a sleek, hacker-themed UI.

---

![Project-X Banner](https://via.placeholder.com/1200x300?text=Project-X+CTF+Platform)

---

## 🧠 Overview

**Project-X** provides an end-to-end platform for hosting cybersecurity challenges, managing participants, and tracking performance through an interactive web interface.  
It’s built for universities, hackathons, and hacker communities who want a robust and scalable CTF experience.

With **role-based authentication**, **dynamic scoring**, and **real-time leaderboards**, Project-X transforms how cybersecurity competitions are organized and experienced.

---

## 🧩 Core Features

✅ **User Authentication & Role Management**  
- Secure JWT-based login/register system  
- Role-based access control (Admin / Player)

🏁 **Challenge Management System**  
- Add, update, and delete CTF challenges  
- Categorization by difficulty and domain (Web, Crypto, Pwn, etc.)

🚩 **Flag Validation Engine**  
- Secure backend verification  
- Prevents brute-force & replay attacks  
- Dynamic scoring mechanism

🏆 **Leaderboard System**  
- Real-time rank updates  
- Individual and team-based scores  

💬 **Team Collaboration**  
- Team dashboard  
- Invite members and collaborate on challenges

🛡️ **Protected Routes with Middleware**  
- Dashboard and challenge routes accessible only to authenticated users  

⚡ **Optimized Performance**  
- Lazy loading, caching, and database optimization  
- Docker-ready setup for deployment

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | Next.js + Tailwind CSS + TypeScript |
| **Backend** | Node.js (API Routes or Express) |
| **ORM** | Prisma |
| **Database** | PostgreSQL |
| **Auth** | JWT + Secure Middleware |
| **Containerization** | Docker & Docker Compose |
| **Deployment** | Vercel / Render / Railway / Local |

---

## 📁 Project Structure

```

Project-X/
│
├── frontend/                   # Next.js + Tailwind frontend
│   ├── components/             # UI components
│   ├── app/ or pages/          # Routes and views
│   ├── middleware.ts           # Auth guard for routes
│   ├── lib/                    # Helper utilities
│   └── ...
│
├── backend/                    # Node.js or API logic
│   ├── prisma/                 # Prisma schema & migrations
│   ├── src/
│   │   ├── routes/             # Auth, Challenges, Flags
│   │   ├── middleware/         # Authentication checks
│   │   └── utils/
│   └── ...
│
├── docker-compose.yml          # Container setup
├── .env.example                # Environment template
├── prisma.schema               # Database schema
├── package.json
└── README.md

````

## ⚙️ Setup Instructions

### 🧩 1. Clone the Repository

```bash
git clone https://github.com/yourusername/project-x.git
cd project-x
````

### 🔧 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### ⚙️ 3. Configure Environment Variables

Duplicate `.env.example` and rename it to `.env`.
Fill in your database and secret values:

```bash
DATABASE_URL="postgresql://username:password@localhost:5432/projectx"
JWT_SECRET="your_super_secret_key"
```

### 🗄️ 4. Set Up the Database

Make sure PostgreSQL is running, then:

```bash
npx prisma migrate dev --name init
```

### 🚀 5. Run the Development Server

```bash
npm run dev
```

Now open your browser at:
👉 [http://localhost:3000](http://localhost:3000)

---

## 🧱 Example Middleware (Authentication Guard)

```ts
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const { pathname } = req.nextUrl;

  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/ctf');
  const isAuthRoute = ['/login', '/register', '/'].includes(pathname);

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}
```

This ensures:

* 🔒 Authenticated users can access `/dashboard` and `/ctf`
* 🚫 Unauthenticated users are redirected to `/login`
* 🏠 Logged-in users can’t revisit `/login` or `/register`

---

## 🐳 Docker Setup (Optional)

To run everything in containers:

```bash
docker-compose up --build
```

This spins up:

* PostgreSQL database
* Next.js frontend/backend
* Prisma migrations automatically

---

## 🧩 API Endpoints (Sample)

| Method | Endpoint             | Description                 |
| ------ | -------------------- | --------------------------- |
| `POST` | `/api/auth/register` | Register a new user         |
| `POST` | `/api/auth/login`    | Authenticate user           |
| `GET`  | `/api/challenges`    | Get all CTF challenges      |
| `POST` | `/api/flag/submit`   | Validate submitted flag     |
| `GET`  | `/api/leaderboard`   | Retrieve global leaderboard |

---

## 🧠 Future Enhancements

* 🤖 AI-based challenge recommendations
* 🌍 Multi-language support
* 🔔 Real-time notifications and chat
* 🧮 Analytics dashboard for admins
* 🧑‍💻 Integrated code sandbox for challenges

---


🧾 License

This project is proprietary and closed-source.
All rights are reserved by the author.
You are not permitted to copy, modify, distribute, or use any part of this software without explicit written permission.

Unauthorized use, reproduction, or redistribution of this software — in full or in part — is strictly prohibited.

## 💬 Contact

**Author:** Hafiz Shamnad

**LinkedIn:** [linkedin.com/in/hafiz-shamnad](https://linkedin.com/in/hafiz-shamnad)

---

> 🧠 *"Hack. Learn. Grow. — Project-X is where cybersecurity meets creativity."*

---

Would you like me to tailor this for your actual **backend framework** (e.g., `FastAPI` + `Next.js`) or keep it as the **Node.js full-stack (Next.js API Routes)** version you’re using right now?
```
