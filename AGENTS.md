# Agent Guidelines for CouncilTrack AI v2.0 🎯🤖

> **Organization:** NavGurukul Dantewada  
> **Repository:** `Council_Tracker` (CouncilTrack AI v2.0)  
> **Reference:** PRD Version 2.0 & TRD Version 1.0  

This document serves as the human-like engineering instructions and strict quality guardrails for any AI agent or contributor working on this repository.

---

## 🏛️ 1. Architecture Awareness & Data Rules

1. **Dual-Mode Persistence Layer:**
   - All database mutations must go through `backend/src/services/sheetsService.js`.
   - Never write directly to `counciltrack_store.json` from controllers or routes.
   - Never introduce destructive fallback logic that overwrites the persistent store on parse errors.
2. **Strict Role & Status Enums:**
   - **Roles:** Strictly uppercase `"ADMIN"` and `"COUNCIL"`. (Never use deprecated v1 roles like `"council_member"`, `"super_admin"`, or `"viewer"`).
   - **Statuses:** Strictly uppercase `"ACTIVE"` and `"INACTIVE"`.
3. **Audit Trail & Confidentiality:**
   - Any goal transition must record an entry in `Goal_History`.
   - Any council/member modification must record an entry in `Audit_Logs`.
   - **Confidentiality Rule:** `adminNotes` from the `Student_Feedback` worksheet are strictly confidential. Never expose `adminNotes` to council members.

---

## 🔒 2. Security Guardrails

1. **No Authentication Backdoors:**
   - Never hardcode bypass passwords (e.g. `password === "Admin@123"`). Always verify credentials via `bcrypt.compare`.
2. **JWT Secret Management:**
   - Never fallback to predictable strings like `"default_counciltrack_secret"`. Fail fast if `JWT_SECRET` is missing in production.
3. **Input Validation:**
   - All API endpoints must be validated using Zod schemas defined in `backend/src/validators/index.js`.
   - All public endpoints (e.g. `/feedback`) must be protected by rate limiting.

---

## 🌿 3. Strict Git Collaboration & Branching Guardrails

1. **`main` Branch is Strictly Protected (Read-Only Baseline):**
   - **NEVER** edit, commit, or stage files directly on the `main` branch.
   - **NEVER** execute `git push origin main` or push directly to `main` under any circumstances.
2. **Isolated Feature / Bugfix Branches:**
   - Always create a dedicated branch off an up-to-date `main` for every task:
     ```bash
     git checkout main
     git pull origin main
     git checkout -b <type>/<descriptive-name>
     ```
   - Branch naming convention: `fix/...`, `feat/...`, `docs/...`, `chore/...` (e.g. `fix/cron-role-mismatch`).
3. **Smooth Local & Online Sync (Zero Conflicts & Clean History):**
   - Regularly fetch and rebase on `origin/main` to keep commit history clean, linear, and devoid of merge conflicts:
     ```bash
     git fetch origin
     git rebase origin/main
     ```
   - Never force-push or blindly resolve conflicts by overwriting teammate code; inspect diffs thoroughly.
4. **Pull Request (PR) Driven Delivery:**
   - Push changes **only** to the isolated feature branch:
     ```bash
     git push -u origin <type>/<descriptive-name>
     ```
   - Open a detailed Pull Request targeting `main`.
   - PR must include: Clear title, summary of changes, references to fixed issues, and automated verification test evidence.

---

## 🧪 4. Verification & Testing Protocol

Before proposing or finalizing any pull request or commit:
1. **Automated Verification:**
   ```bash
   node counciltrack-ai/backend/scripts/verify_v2.js
   ```
   All verification checks must pass with zero failures.
2. **Frontend Validation:**
   ```bash
   npm --prefix counciltrack-ai/frontend run lint
   npm --prefix counciltrack-ai/frontend run build
   ```
3. **Clean Conventional Commits:**
   Use standard commit prefixes:
   - `fix:` for bug fixes
   - `feat:` for new features
   - `docs:` for documentation updates
   - `chore:` for maintenance & dependency updates
   - `refactor:` for code restructuring without behavioral change

---

## 🗺️ 5. Prioritized Contribution Roadmap

- **Phase 1 (Critical Fixes):**
  - Fix role string mismatch in `backend/src/jobs/monthlyReportJob.js`.
  - Fix missing Discord webhook call in `backend/src/jobs/dailyReminderJob.js`.
  - Remove hardcoded backdoor checks in `backend/src/controllers/authController.js`.
  - Align port documentation (`PORT=4000`) in `.env.example`.
- **Phase 2 (Cleanup):**
  - Remove unmounted routes (`meetingRoutes.js`, `reportRoutes.js`, `progressRoutes.js`).
  - Purge unlinked v1 frontend pages in `frontend/src/pages/`.
  - Consolidate duplicate validation middlewares.
- **Phase 3 (CI/CD):**
  - Add GitHub Actions workflow (`.github/workflows/ci.yml`).
- **Phase 4 (Performance & Features):**
  - Implement route-based lazy loading (`React.lazy()`) in `frontend/src/App.jsx`.
  - Implement real-time Socket.io updates for goals and reflections.
