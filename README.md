# CampusQuery

CampusQuery is a MERN-stack, college-specific knowledge base sharing platform. It operates similarly to Stack Overflow, featuring student reputations, course-specific tagging, vote scores, and content moderation panels for campus administrators.

## Features

### 🎓 Students/Users
- **User Authentication**: Secure signup and login using JWT and hashed passwords (bcrypt).
- **Ask & Search**: Ask academic questions detailing code blocks, text summaries, and categories. Filter questions using keywords or course tags.
- **Answer**: Write solutions for classmate queries.
- **Reputational Points**: Earn +10 for question upvotes, +15 for answer upvotes, and +20 when your solution is accepted by the asker. Downvotes deduct -2.
- **Bookmarks**: Bookmark important questions to access them from the student dashboard.
- **Flags/Reports**: Report off-topic, offensive, or incorrect questions and answers.

### 🛡️ Administrative Moderation
- **Moderator Dashboard**: High-level metrics showing users registry, questions count, answers count, unique tags, and open report tickets.
- **User Audits**: Promote users to admins or revoke permissions, and delete offensive accounts.
- **Content Moderation**: Review reported posts, delete offensive questions or answers, and dismiss false flags.
- **Tag Management**: Configure catalog tags for student selection.

---

## Directory Structure

```text
CampusQuery/
├── backend/
│   ├── config/              # MongoDB connection helpers
│   ├── controllers/         # Authentication, Question, Answer, Vote, Admin controllers
│   ├── middleware/          # JWT authentication, Admin check, and Error handler middlewares
│   ├── models/              # Mongoose database schemas
│   ├── routes/              # Express API route endpoints
│   ├── utils/               # Reputation updates and token generation
│   ├── .env                 # Environment variables config
│   └── server.js            # Express API Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable Navbar, Footer, QuestionCard, and AnswerCards
│   │   ├── context/         # AuthContext sharing session states
│   │   ├── pages/           # Landing, Login, Register, and 404 pages
│   │   ├── services/        # API service fetch bindings
│   │   ├── styles/          # Custom stylesheets (no UI libraries)
│   │   ├── user/            # Student home, profile, asks, and questions details
│   │   ├── admin/           # Admin stats, reports, tags, and user rolls moderation
│   │   ├── App.jsx          # Route paths mapping
│   │   └── main.jsx         # App mounting DOM
│   └── index.html
│
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js installed locally.
- Local MongoDB server or MongoDB Atlas connection URI.

### Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install Node packages:
   ```bash
   npm install
   ```
3. Configure your local configuration inside `.env`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/campusquery
   JWT_SECRET=supersecretkeycampusquery2026
   NODE_ENV=development
   ```
4. Start the development backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Open a separate terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install packages:
   ```bash
   npm install
   ```
3. Start the Vite React client:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Verification
- Note: The **first registered user** in the database will automatically be granted the `admin` role for easy testing. All subsequent signups default to the `student` role.
