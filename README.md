# CouncilTrack AI 🎯🤖

> **Council Goal Management, Progress Tracking & Performance Analysis Platform**  
> *Full-Stack Web Application (Node.js Express + Socket.IO + React Vite Tailwind + Google Sheets API / Hybrid Local Store + Discord Webhooks + AI Engine)*

---

## 🌟 Key Features

1. **Role-Based Governance (4 Strict Roles)**:
   - 👑 **Super Admin**: Complete platform control, user directory management, council creation, Discord/AI config, AI evaluation approval.
   - 🛡️ **Admin**: Council supervision, progress monitoring, meeting scheduling, student feedback review, report approval.
   - 🎯 **Council Member**: Daily & weekly goal setting, progress check-ins (0-100%), evening daily reflections, weekly learning journals, performance review.
   - 🎓 **Student**: Public goal transparency, council leadership directory, monthly feedback submission with 5-star ratings & suggestions.

2. **Dual-Mode Database Architecture (Google Sheets + Persistent Local Store)**:
   - Centralized in `backend/src/services/sheetsService.js`.
   - Adheres to the exact 9-worksheet schema specified in TRD Section 12: `Users`, `Councils`, `Goals`, `Progress`, `Reflections`, `Student_Feedback`, `Meetings`, `AI_Reports`, `Notifications`.
   - Automatically synchronizes with Google Sheets API when `GOOGLE_SHEET_ID` and Service Account credentials are provided.
   - Runs out-of-the-box in local persistence mode if credentials have not yet been added.

3. **Evidence-Grounded AI Performance Analysis**:
   - Transparent 5-parameter mathematical model:
     - **Goal Achievement**: 35%
     - **Consistency**: 20%
     - **Reflection Quality**: 15%
     - **Student Feedback**: 20%
     - **Improvement & Initiative**: 10%
   - Missing data protection: Explicitly identifies missing evidence rather than penalizing scores to zero.
   - Multi-provider AI support (Google Gemini 1.5, OpenAI, or integrated Rule-Based Heuristic engine).
   - Administrative review & approval workflow before report publication.

4. **Discord Webhook Automation**:
   - Channel routing: `#council-goals`, `#goal-completions`, `#weekly-reflections`, `#announcements`, `#meetings`, `#council-performance`.
   - Retry queue, deduplication, and notification logging.
   - Zero confidential data leakage (passwords, private reflections, and unapproved reports are never published).

5. **Real-Time Updates & Scheduling**:
   - Socket.IO live events: `goal:created`, `goal:completed`, `progress:updated`, `meeting:scheduled`, `report:approved`.
   - Automated cron jobs in `Asia/Kolkata` timezone: 8:00 AM daily goal prompt, 8:00 PM reflection prompt, meeting reminders, monthly report batch.

---

## 🚀 Quick Start Guide

### 1. Start the Backend API Server
```bash
cd counciltrack-ai/backend
npm run dev
```
- API Base URL: `http://localhost:4000/api/v1`
- Socket.IO URL: `http://localhost:4000`

### 2. Start the Frontend React Client
```bash
cd counciltrack-ai
npm run dev
```
- Web Application: `http://localhost:5173`

---

## 🔑 Demo Quick-Login Credentials

All test accounts come pre-configured with the default password: `Admin@123`

| Role | Email | Password |
| :--- | :--- | :--- |
| **Super Admin** | `superadmin@counciltrack.org` | `Admin@123` |
| **Academic Admin** | `admin@counciltrack.org` | `Admin@123` |
| **Council Member (Discipline)** | `rahul@counciltrack.org` | `Admin@123` |
| **Council Member (English)** | `priya@counciltrack.org` | `Admin@123` |
| **Student** | `student@counciltrack.org` | `Admin@123` |

*(Note: The Login page also features quick 1-click test buttons for each role).*

---

## 📁 Repository Directory Structure

```
Council_tracker/
│
├── package.json                   # Root workspace scripts
├── README.md                      # Platform documentation
│
└── counciltrack-ai/
    ├── package.json               # Frontend dependencies & Vite scripts
    ├── vite.config.js             # Vite + Tailwind CSS config
    │
    ├── backend/                   # TRD Section 10 Modular Backend
    │   ├── src/
    │   │   ├── config/            # googleSheets.js, discord.js, ai.js
    │   │   ├── controllers/       # 9 Controllers (auth, user, council, goal, etc.)
    │   │   ├── middleware/        # authMiddleware, roleMiddleware, errorMiddleware, validation
    │   │   ├── routes/            # 9 Express Routers mounted at /api/v1
    │   │   ├── services/          # sheetsService, discordService, aiService, performanceService
    │   │   ├── jobs/              # dailyReminderJob, meetingReminderJob, monthlyReportJob (Asia/Kolkata)
    │   │   ├── utils/             # generateToken, generateId, responseHandler, socketEmitter
    │   │   ├── app.js             # Express app setup
    │   │   └── server.js          # HTTP Server + Socket.IO initialization
    │   ├── credentials/           # Service account key directory
    │   ├── .env                   # Environment secrets
    │   └── package.json
    │
    └── src/                       # TRD Section 11 Frontend React App
        ├── components/
        │   ├── common/
        │   ├── layout/
        │   ├── dashboard/
        │   └── Navbar.jsx         # Live Socket.io notifications & identity badge
        ├── context/
        │   ├── AuthContext.jsx    # Session management & demo fast-switching
        │   ├── CouncilContext.jsx # Live councils state
        │   └── SocketContext.jsx  # Real-time WebSocket connection
        ├── pages/
        │   ├── Home.jsx           # Landing page
        │   ├── Login.jsx          # Secure login with 1-click test buttons
        │   ├── Dashboard.jsx      # Dynamic role-based router
        │   ├── SuperAdminDashboard.jsx # Platform metrics & user directory
        │   ├── AdminDashboard.jsx      # Council progress & meeting scheduling
        │   ├── CouncilDashboard.jsx    # Personal goals & reflection submission
        │   ├── StudentDashboard.jsx    # Public goal visibility & feedback form
        │   ├── Goals.jsx          # Comprehensive goal tracking & progress modal
        │   ├── Reflections.jsx    # Private reflections journal
        │   ├── Feedback.jsx       # Student feedback repository
        │   ├── Meetings.jsx       # Scheduled meetings & Discord notifications
        │   └── Reports.jsx        # AI Performance Analysis & score radar
        ├── routes/
        │   └── ProtectedRoute.jsx # Authentication guard
        └── services/
            └── api.js             # Centralized Axios client
```
