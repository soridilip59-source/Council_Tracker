# CouncilTrack AI 🎯🤖 (Version 2.0)

> **Centralized Council Management & Daily Progress Tracking Platform**  
> **Organization:** NavGurukul Dantewada  
> **Document Reference:** PRD Version 2.0 & TRD Version 1.0 (22 November 2026)  
> *Full-Stack Web Application (Node.js Express + React 19 Vite Tailwind + Google Sheets API / Hybrid Local Store + Recharts)*

---

## 🌟 Product Overview & Core Architecture

CouncilTrack AI v2.0 centralizes council member administration, daily goals, evening reflections, automated weekly/monthly progress analytics, and public student feedback for NavGurukul Dantewada.

### 👥 Target Users & Roles
1. 🛡️ **Admin (`ADMIN`)**:
   - Manages councils and assigns multiple members with custom designations.
   - Activates and deactivates accounts.
   - Monitors all daily goals, completion statuses, and status audit histories.
   - Reviews evening reflections and automated weekly/monthly analytics.
   - Manages student feedback & complaints, updates complaint resolution status, and maintains private confidential administrative notes.
2. 🎯 **Council Member (`COUNCIL`)**:
   - Accesses personal council dashboard.
   - Creates and prioritizes daily goals (Version 2.0 strictly supports daily goals).
   - Submits mandatory evening reflections with goal status review (completed ✓ / incomplete ✕ with required reason).
   - Tracks personal weekly and monthly progress calculated automatically from daily records.
   - Views student feedback and complaints submitted specifically for their assigned council (private admin notes are concealed).
3. 🎓 **Students (Public — No Login Required)**:
   - Accesses one common public feedback link at `/feedback`.
   - Submits general feedback, suggestions, or complaints for any council.
   - Option to remain anonymous or provide contact details.
   - Zero login or registration friction.

---

## 📊 Google Sheets Database Blueprint (8 Worksheets)

The platform features a **Dual-Mode Database Architecture** (`backend/src/services/sheetsService.js`):
- Connects directly to Google Sheets API when `GOOGLE_SHEET_ID` and Service Account credentials are configured.
- Runs with persistent local JSON storage (`data/counciltrack_store.json`) for zero-friction local development and testing.

| Worksheet | Key Headers |
| :--- | :--- |
| **`Users`** | `userId`, `name`, `email`, `passwordHash`, `role`, `councilId`, `position`, `status`, `createdAt`, `updatedAt` |
| **`Councils`** | `councilId`, `councilName`, `description`, `status`, `createdAt`, `updatedAt` |
| **`Goals`** | `goalId`, `userId`, `councilId`, `title`, `description`, `expectedOutcome`, `priority`, `goalDate`, `status`, `incompleteReason`, `createdAt`, `updatedAt` |
| **`Reflections`** | `reflectionId`, `userId`, `reflectionDate`, `achievements`, `incompleteGoals`, `challenges`, `learnings`, `improvements`, `submittedAt`, `updatedAt` |
| **`Student_Feedback`** | `feedbackId`, `studentName`, `councilId`, `feedbackType`, `message`, `contact`, `status`, `adminNotes`, `submittedAt`, `updatedAt` |
| **`Goal_History`** | `historyId`, `goalId`, `userId`, `oldStatus`, `newStatus`, `action`, `changedAt` |
| **`Audit_Logs`** | `logId`, `actorId`, `action`, `entityType`, `entityId`, `details`, `createdAt` |
| **`Settings`** | `settingKey`, `settingValue`, `description`, `updatedAt` |

---

## 🚀 Quick Start Guide

### 1. Start the Backend API Server
```bash
cd counciltrack-ai/backend
npm run dev
```
- API Base URL: `http://localhost:4000/api/v1`
- Public Healthcheck: `http://localhost:4000/api/health`

### 2. Start the Frontend React Client
```bash
cd counciltrack-ai/frontend
npm run dev
```
- Web Application: `http://localhost:5173`

---

## 🔑 Demo Quick-Login Credentials

All test accounts come pre-configured with the default password: `Admin@123`

| Role | Name | Email | Password | Assigned Council & Position |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Admin User | `admin@counciltrack.org` | `Admin@123` | Platform Administrator |
| **Council Member** | Akanksha | `akanksha@counciltrack.org` | `Admin@123` | Discipline Council (Discipline Coordinator - Disco) |
| **Council Member** | Mohan | `mohan@counciltrack.org` | `Admin@123` | Discipline Council (Discipline Coordinator - Disco) |
| **Council Member** | Lalita | `lalita@counciltrack.org` | `Admin@123` | Workout Council (Workout Coordinator) |
| **Council Member** | Radheshyam | `radheshyam@counciltrack.org` | `Admin@123` | Workout Council (Workout Coordinator) |
| **Council Member** | Gungun | `gungun@counciltrack.org` | `Admin@123` | Academic Council - SOP (Academic Coordinator - SOP) |
| **Council Member** | Dinesh | `dinesh@counciltrack.org` | `Admin@123` | Academic Council - SOB (Academic Coordinator - SOB) |
| **Council Member** | Anjali | `anjali@counciltrack.org` | `Admin@123` | Academic Council - SOB (Academic Coordinator - SOB) |
| **Council Member** | Mukesh | `mukesh@counciltrack.org` | `Admin@123` | Academic Council - SOF (Academic Coordinator - SOF) |
| **Council Member** | Nikita | `nikita@counciltrack.org` | `Admin@123` | Academic Council - SOF (Academic Coordinator - SOF) |
| **Council Member** | Dilip | `dilip@counciltrack.org` | `Admin@123` | English Council (English Coordinator) |
| **Council Member** | Deepa | `deepa@counciltrack.org` | `Admin@123` | English Council (English Coordinator) |
| **Council Member** | Khushi | `khushi.it@counciltrack.org` | `Admin@123` | IT Council (IT Coordinator) |
| **Council Member** | Subhash | `subhash@counciltrack.org` | `Admin@123` | IT Council (IT Coordinator) |
| **Council Member** | Khushi | `khushi.health@counciltrack.org` | `Admin@123` | Health Council (Health Coordinator) |
| **Council Member** | Sahdev | `sahdev@counciltrack.org` | `Admin@123` | Health Council (Health Coordinator) |
| **Council Member** | Vikky Podiyam | `vikky@counciltrack.org` | `Admin@123` | Hackathon Council (Hackathon Coordinator) |
| **Council Member** | Himanshu | `himanshu@counciltrack.org` | `Admin@123` | Placement Council (Placement Coordinator) |
| **Council Member** | Aakashi | `aakashi@counciltrack.org` | `Admin@123` | Outreach Council (Outreach Coordinator) |
| **Council Member** | Sanjana | `sanjana@counciltrack.org` | `Admin@123` | Operations Council (Operations Coordinator - Ops) |
| **Council Member** | Ramlal | `ramlal@counciltrack.org` | `Admin@123` | Operations Council (Operations Coordinator - Ops) |
| **Council Member** | Kranti Kashyap | `kranti@counciltrack.org` | `Admin@123` | Culture Council (Culture Coordinator) |
| **Council Member** | Vidya | `vidya@counciltrack.org` | `Admin@123` | Culture Council (Culture Coordinator) |
| **Council Member** | Himani | `himani@counciltrack.org` | `Admin@123` | Culture Council (Culture Coordinator) |
| **Council Member** | Sona | `sona@counciltrack.org` | `Admin@123` | Induction Council (Induction Coordinator) |
| **Council Member** | Kajal | `kajal@counciltrack.org` | `Admin@123` | Induction Council (Induction Coordinator) |

*(Note: Council members can create daily morning goals, submit mandatory evening reflections, track their weekly progress, and view student feedback for their assigned councils).*

---

## 🧭 Application Routes

### Public Pages
- `/` — Landing Page with direct portals to Admin, Council, and Student Feedback.
- `/feedback` — Common Public Student Feedback Form (No authentication required).
- `/admin/login` — Dedicated Admin Login portal.
- `/council/login` — Dedicated Council Member Login portal.

### Admin Portal (`/admin/*`)
- `/admin/dashboard` — Section One: Total Council Dashboard & Members summary.
- `/admin/members` — Member Management: Add/edit members, assign to councils & positions.
- `/admin/councils` — Council Management: Create/edit councils and view assigned members.
- `/admin/goals` — Section Two: Council Goals Dashboard with council-wise goal cards & audit history.
- `/admin/overview` — Section Three: Automated weekly & monthly progress analytics with Recharts.
- `/admin/feedback` — Section Four: Student Feedback & Complaint Management with private admin notes.

### Council Member Portal (`/council/*`)
- `/council/dashboard` — Personal dashboard overview, today's goals checklist, and daily completion rate.
- `/council/goals` — My Daily Goals: Create daily goals with priorities and outcomes.
- `/council/reflection` — Evening Reflection: Mark completed/incomplete goals with mandatory reasons and answer reflection questions.
- `/council/weekly-progress` — Weekly progress calculations (Monday-to-Sunday) and daily breakdown charts.
- `/council/monthly-progress` — Monthly progress calculations and weekly consistency blocks.
- `/council/feedback` — Student feedback and complaints submitted for the assigned council (confidential admin notes concealed).

---

## 🧪 Verification & Automated Testing

To run the full end-to-end verification suite:
```bash
cd counciltrack-ai/backend
node scripts/verify_v2.js
```

Covers:
- Admin and Council authentication and role enforcement.
- Admin dashboard calculations.
- Council and Member creation.
- Daily goal creation, status transitions, and audit logging.
- Evening reflection atomic goal status synchronization.
- Public feedback submission without auth.
- Admin feedback resolution and private notes confidentiality.
- PRD Section 4.3 completion percentage formula: `(Completed / (Completed + Incomplete)) * 100`.
