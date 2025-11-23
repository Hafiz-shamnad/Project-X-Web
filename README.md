# ⚔️ Project-X — Open-Source CTF Platform

> **Project-X** is an open-source, next-generation Capture The Flag (CTF) and cybersecurity learning platform built for students, ethical hackers, and communities.
> Designed for smooth challenge delivery, secure flag validation, real-time leaderboards, and a sleek hacker-themed interface — all under the **GNU GPL License**.

---

![Project-X Banner](./banner.png)

---

## 🧠 Overview

**Project-X** is an end-to-end platform that powers cybersecurity competitions, training labs, and community challenges.

Built with a modular architecture, Project-X offers:

* Role-based authentication
* Dynamic scoring
* Real-time leaderboards
* Multi-category challenges
* Team collaboration
* Dockerized deployment

Perfect for universities, hackathons, student clubs, training centers, and cybersecurity communities.

---

## 🧩 Core Features

### 🔐 **User Authentication & Access Control**

* JWT-based login / registration
* Role-based permissions (Admin / Player)

### 🧠 **Challenge Management**

* Add, update, delete CTF challenges
* Category & difficulty tagging
* Web, Forensics, Crypto, Pwn, OSINT, Misc

### 🚩 **Secure Flag Validation Engine**

* Backend-only validation
* Anti-bruteforce protection
* Dynamic or static scoring options

### 🏆 **Leaderboard System**

* Real-time ranking
* Individual + Team-based scores

### 👥 **Team Collaboration**

* Create or join teams
* Team dashboard & statistics

### 🛡️ **Protected Routes via Middleware**

* Dashboard & challenge pages require auth

### 🐳 **Docker & Docker Compose Support**

* One-command setup
* Automatic PostgreSQL + Prisma migration
* Frontend + Backend + DB fully containerized

---

## 🏗️ Tech Stack

| Layer                | Technology                          |
| -------------------- | ----------------------------------- |
| **Frontend**         | Next.js + Tailwind CSS + TypeScript |
| **Backend**          | Node.js (API Routes / Express)      |
| **Authentication**   | JWT + Secure Middleware             |
| **Database**         | PostgreSQL                          |
| **ORM**              | Prisma                              |
| **Containerization** | Docker + Docker Compose             |
| **Deployment**       | Vercel / Render / Railway / Local   |

---

## 📁 Project Structure

```
Project-X/
│
├── frontend/                   # Next.js + Tailwind UI
│   ├── components/             # UI components
│   ├── app/                    # Routes and views
│   ├── middleware.ts           # Auth guard
│   └── ...
│
├── backend/                    # Node.js / API logic
│   ├── prisma/                 # Prisma schema & migrations
│   ├── src/
│   │   ├── routes/             # Auth, Challenge, Flag
│   │   ├── middleware/         # Auth checks
│   │   └── utils/              # Helpers
│   └── ...
│
├── docker-compose.yml          # Full Docker stack
├── .env.example                # Environment variables
├── package.json
└── README.md
```

---

# ⚙️ Setup Instructions

## 🧩 1. Clone the Repository

```bash
git clone https://github.com/yourusername/project-x.git
cd project-x
```

---

# 🐳 **Docker Setup (Recommended)**

> This method runs the entire platform in containers:
> **Frontend + Backend + PostgreSQL + Prisma Migrations**

### ▶️ Start Everything

```bash
docker-compose up --build
```

### 🛑 Stop Everything

```bash
docker-compose down
```

After build completes, access:

👉 **Frontend:** [http://localhost:3000](http://localhost:3000)
👉 **Backend API:** [http://localhost:8000](http://localhost:8000)

---

# 🧩 Manual Setup (Without Docker)

## 🔧 2. Install Dependencies

```bash
npm install
# or
yarn install
```

## ⚙️ 3. Configure Environment Variables

Duplicate `.env.example` → `.env` and fill in:

```bash
DATABASE_URL="postgresql://username:password@localhost:5432/projectx"
JWT_SECRET="your_super_secret_key"
```

## 🗄️ 4. Database Initialization

```bash
npx prisma migrate dev --name init
```

## 🚀 5. Run the Development Server

```bash
npm run dev
```

---

# 🔐 Example Middleware (Auth Guard)

```ts
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const { pathname } = req.nextUrl;

  const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/ctf');
  const isAuthPage = ['/login', '/register', '/'].includes(pathname);

  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}
```

---

# 🧩 API Endpoints

| Method | Endpoint             | Description              |
| ------ | -------------------- | ------------------------ |
| `POST` | `/api/auth/register` | Register user            |
| `POST` | `/api/auth/login`    | Login & token generation |
| `GET`  | `/api/challenges`    | Fetch all challenges     |
| `POST` | `/api/flag/submit`   | Validate challenge flag  |
| `GET`  | `/api/leaderboard`   | Real-time leaderboard    |

---

# 🧠 Future Enhancements

* 🤖 AI-powered challenge recommendations
* 🌍 Multi-language UI support
* 🔔 Real-time notifications & chat
* 📊 Admin analytics dashboard
* 🧑‍💻 Integrated code sandbox
* 🧵 Support for event-mode CTFs (Jeopardy/Attack-Defense)

---

# 🧾 License

**Project-X is open-source under the GNU General Public License (GPL).**

✔️ Free to use
✔️ Free to modify
✔️ Free to distribute
✔️ Must remain open-source

For full legal text, see: **LICENSE** file.

---

# 💬 Contact

**Author:** Hafiz Shamnad
**LinkedIn:** [https://linkedin.com/in/hafiz-shamnad](https://linkedin.com/in/hafiz-shamnad)

---

> 🧠 **"Hack. Learn. Grow. — Project-X empowers the next generation of cybersecurity talent."**

