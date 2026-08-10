<div align="center">

# 🎓 CampusQuery

### A modern, college-specific knowledge-sharing & Q&A platform

*Think Stack Overflow — but built for your campus.*

[![Live Demo](https://img.shields.io/badge/Live_Demo-campusquery--red.vercel.app-000000?style=for-the-badge&logo=vercel)](https://campusquery-red.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

<br/>

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat-square&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![SQLite](https://img.shields.io/badge/Turso_LibSQL-4FF8D2?style=flat-square&logo=sqlite&logoColor=black)
![JWT](https://img.shields.io/badge/JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)
![Groq](https://img.shields.io/badge/Groq_LLM-F55036?style=flat-square&logo=meta&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=flat-square&logo=render&logoColor=white)

</div>

---

## 📖 About

**CampusQuery** is a full-stack Q&A platform designed specifically for college communities. Students can post technical and academic questions, get instant AI-generated answers, vote on the best solutions, and earn reputation as they help their peers — all inside a space governed by a comprehensive admin moderation panel.

Built with **Node.js**, **Express**, **Turso LibSQL (Cloud SQLite)**, and **React (Vite)**, it combines a student reputation system, course-specific tagging, AI-powered answers, voting, and bookmarking into one clean experience.

**🔗 Live URL:** [https://campusquery-red.vercel.app](https://campusquery-red.vercel.app)

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Directory Structure](#-directory-structure)
- [Getting Started Locally](#-getting-started-locally)
- [Environment Variables](#-environment-variables)
- [License](#-license)

---

## ✨ Features

### 🎓 Students & Community

| Feature | Description |
| :--- | :--- |
| 🔐 **Authentication** | Secure signup and login powered by **JWT** & `bcryptjs`. |
| 💬 **Q&A System** | Post technical or academic questions with detailed descriptions, code blocks, and tags. |
| 🤖 **Ask AI** | Get instant AI-generated answers powered by **Groq LLM** (`llama3-8b`). |
| 🏆 **Reputation System** | Earn reputation as the community values your contributions (see below). |
| 🔖 **Bookmarks & Saved Questions** | Save important questions and revisit them anytime from your personal dashboard. |
| 🚩 **Content Flagging** | Report inappropriate or off-topic questions and answers for admin moderation. |

#### 🏆 Reputation Points

| Action | Points |
| :--- | :---: |
| Question upvoted | `+10` |
| Answer upvoted | `+15` |
| Your solution accepted as best answer | `+20` |
| Content downvoted | `-2` |

### 🛡️ Admin Moderation Panel

- **📊 Dashboard Overview** — Metrics tracking total registered users, questions, answers, tags, and open report tickets.
- **🧹 Content Moderation** — Review user reports, resolve tickets, and delete spam or offensive content.
- **👥 User & Tag Management** — Manage user roles, delete users, and manage course tags.
- **🔑 Admin Access** — Configured for `mansii143@gmail.com` with full administrative privileges.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React (Vite), React Router DOM, Custom CSS Architecture |
| **Backend** | Node.js, Express.js |
| **Database** | Turso LibSQL — Cloud-Native SQLite via `@libsql/client` |
| **AI Integration** | Groq SDK (`groq-sdk`) — `llama3-8b` |
| **Auth** | JWT + `bcryptjs` |
| **Deployment** | Vercel (Frontend SPA) & Render (Backend Web Service) |

---

## 📁 Directory Structure

```text
campusquery/
├── backend/
│   ├── config/              # Turso DB connection & schema initializer
│   ├── controllers/         # Auth, Question, Answer, Vote, Admin, AI controllers
│   ├── middleware/          # JWT authentication, Admin check & Error handlers
│   ├── models/              # SQLite SQL-backed Data Models (User, Question, Answer, Tag, Report)
│   ├── routes/              # Express API route handlers
│   ├── utils/               # Reputation logic & JWT token generation
│   ├── .env                 # Backend environment variables
│   └── server.js            # Express API Entry Point
│
├── frontend/
│   ├── src/
│   │   ├── admin/           # Admin Dashboard, Reports, Tags, Users, Answers & Questions management
│   │   ├── components/      # Navbar, Footer, QuestionCard, AnswerCard, Route guards
│   │   ├── context/         # AuthContext state management
│   │   ├── pages/           # LandingPage, Login, Register, NotFound
│   │   ├── services/        # Centralized API fetch services
│   │   ├── styles/          # App stylesheets
│   │   └── user/            # User Dashboard, Profile, AskQuestion, QuestionDetails
│   ├── vercel.json          # Vercel SPA rewrite configuration
│   └── index.html           # Main HTML Entry point
│
├── vercel.json              # Root SPA fallback
└── README.md
```

---

## 🚀 Getting Started Locally

### Prerequisites

- **Node.js** (v18+)
- **Turso CLI** or a local SQLite file *(defaults to `file:campusquery.db` if no Turso URL is specified)*

### 1️⃣ Backend Setup

```bash
cd backend
npm install
```

Create a `backend/.env` file (see [Environment Variables](#-environment-variables)), then start the dev server:

```bash
npm run dev
```

### 2️⃣ Frontend Setup

```bash
cd frontend
npm install
```

Create a `frontend/.env` file:

```env
VITE_API_URL=http://localhost:5001/api
```

Run the React app:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. 🎉

---

## 🔐 Environment Variables

### `backend/.env`

```env
PORT=5001
NODE_ENV=development
TURSO_DATABASE_URL=libsql://your-database-name.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token
JWT_SECRET=supersecretkeycampusquery2026
GROQ_API_KEY=gsk_your_groq_api_key
```



## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**Made with ❤️ for campus communities**

⭐ If you find this project useful, consider giving it a star!

</div>