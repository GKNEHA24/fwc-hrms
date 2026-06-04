#  FWC HRMS — AI-Powered Human Resource Management System

> **FWC IT Services Pvt Ltd · Hackathon Submission 2026**  
> Built for the FWC AI/ML Fullstack Engineer hiring hackathon

---

## Project Overview

A **next-generation HRMS** that leverages Claude AI to automate and streamline HR operations for modern workplaces. Built with a React frontend, Node.js backend, and MongoDB database — fully deployed and mobile responsive.

---

## AI Features (4 Required + Bonus)

| # | Feature | Description |
|---|---------|-------------|
| 1 | **AI Resume Screener** | Claude analyzes resumes against JD, scores 0-100, gives verdict, strengths, gaps & interview questions |
| 2 | **Bulk Resume Screening** | Screen ALL applicants for a job at once, auto-ranked by AI score |
| 3 | **ARIA — HR Chatbot** | Multi-turn conversational AI for employee HR queries (leaves, payroll, policies) |
| 4 | **AI Performance Insights** | Claude analyzes performance review history and generates personalized growth insights |
| 5 | **AI Interview Scheduler** | Generates professional interview emails, preparation tips, and suggested questions |
| 6 | **AI Job Description Generator** | Creates complete JDs for any role using Claude |

---

##  Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌──────────────┐
│   React.js      │────▶│  Node.js/Express│────▶│  MongoDB     │
│   Frontend      │     │  REST API       │     │  Atlas       │
│   (Vercel)      │     │  (Render)       │     │  (Free Tier) │
└─────────────────┘     └────────┬────────┘     └──────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │  Gemini API     │
                         (Google AI Studio)
                        └─────────────────┘
```

---

## Tech Stack

**Frontend:** React.js, React Router, Recharts, Lucide Icons, Axios  
**Backend:** Node.js, Express.js, JWT Authentication, Multer  
**Database:** MongoDB Atlas (free tier)  
**AI/ML:** Google Gemini API (gemini-2.0-flash-lite) with smart fallback system  
**Deployment:** Vercel (frontend) + Render (backend) — both free  
**Auth:** JWT with 4 role-based access levels  

---

##  User Roles & Access

| Role | Access |
|------|--------|
| **Admin** | Full access — employees, payroll, all modules, reports |
| **Senior Manager** | Team view, performance, attendance, analytics |
| **HR Recruiter** | Recruitment, leaves, AI tools, employee management |
| **Employee** | Own dashboard, attendance check-in/out, leaves, payroll slip |

---

##  Core Modules

-  Employee Management (CRUD, departments, roles)
- Attendance (check-in/out, monthly reports, manual entry)
-  Payroll (auto-calculation, HRA/PF/tax, mark as paid)
-  Leave Management (apply, approve/reject, balance tracker)
-  Performance Reviews (quarterly, ratings, AI insights)
-  Recruitment (job postings, applications, AI screening)
-  Role-based personalized dashboards
-  AI Chatbot (ARIA) for all employees
-  Mobile-responsive UI

---

##  Quick Start (Local)

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free) or local MongoDB
- Anthropic API key (get at console.anthropic.com)

### 1. Clone & Setup

```bash
git clone https://github.com/gkneha24/fwc-hrms.git
cd fwc-hrms
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MONGO_URI and ANTHROPIC_API_KEY
npm install
npm start
# Backend runs on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
# Frontend runs on http://localhost:3000
```

### 4. Seed Demo Data

Open browser → `http://localhost:3000/login` → click **"Seed demo users"**

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@fwc.co.in | Admin@123 |
| Senior Manager | manager@fwc.co.in | Manager@123 |
| HR Recruiter | hr@fwc.co.in | Hr@123456 |
| Employee | employee@fwc.co.in | Emp@12345 |

---

## Deployment Guide

### Frontend → Vercel

```bash
cd frontend
npm install -g vercel
vercel --prod
# Set environment variable: REACT_APP_API_URL=https://your-backend.onrender.com/api
```

### Backend → Render

1. Go to [render.com](https://render.com) → New Web Service
2. Connect your GitHub repo
3. Set root directory: `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables:
   - `MONGO_URI` = your MongoDB Atlas connection string
   - `JWT_SECRET` = any long random string
   - `ANTHROPIC_API_KEY` = your Claude API key
   - `NODE_ENV` = production

---

## Environment Variables

```env
# backend/.env
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/fwc_hrms
JWT_SECRET=your_super_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=development
```

---

## Project Structure

```
fwc-hrms/
├── backend/
│   ├── models/          # Mongoose schemas (User, Attendance, Payroll, etc.)
│   ├── routes/          # Express routes (auth, employees, ai, etc.)
│   ├── middleware/       # JWT auth middleware
│   ├── uploads/         # Resume file uploads
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── pages/       # All page components (Dashboard, Employees, AI tools)
│   │   ├── components/  # Shared layout (Sidebar, Topbar)
│   │   ├── context/     # Auth context
│   │   ├── utils/       # API helper (axios instance)
│   │   └── styles/      # Global CSS
│   └── build/           # Production build
└── README.md
```

---

##  Individual Contributions

**[G.K.NEHA]** — Solo submission  
- Designed complete system architecture
- Built all 5 MongoDB models (User, Attendance, Payroll, Performance, Job/Leave)
- Implemented JWT authentication with 4-role RBAC
- Built all 9 REST API route files (auth, employees, attendance, payroll, performance, leaves, recruitment, AI, dashboard)
- Integrated Claude AI for 4+ AI features (resume screening, chatbot, performance insights, scheduler)
- Built complete React frontend with 12 pages and role-based navigation
- Deployed on Vercel + Render with live demo link

---

## Scalability

- MongoDB Atlas supports horizontal scaling
- Stateless JWT auth enables load balancing
- Modular route architecture supports microservices migration
- Supports 5,000+ employee logins per JD requirement

---

## Contact

**FWC POC:** Yogavati (Manager) — yogavati@fwc.co.in  
**Submission:** Via email thread with GitHub ID + password

---

*Built with  for FWC IT Services Hackathon 2026 · June 1-7, 2026*
