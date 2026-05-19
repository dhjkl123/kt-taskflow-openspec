## Why

Small teams struggle to track work and communicate in one place. Kanban boards scattered across tools and Slack conversations buried in noise create context switching and missed updates. TaskFlow MVP brings lightweight task management and real-time team chat into a single screen—enabling teams of 3-5 to see who's doing what and make quick decisions together.

## What Changes

- **New authentication system**: Sign up, login with JWT tokens, password hashing (bcrypt), session management
- **Team workspace creation**: Generate invite codes, add team members, manage membership
- **Kanban board**: TODO/DOING/DONE columns with drag-and-drop, task creation/editing/deletion
- **Team chat**: Real-time messaging via 5-second polling, message history per team
- **Vercel deployment**: One-command deployment for frontend + backend with Neon database

## Capabilities

### New Capabilities
- `user-auth`: User registration, login, JWT-based session management, password hashing with bcrypt
- `team-management`: Create teams, generate invite codes (format: XXXX-#### alphanumeric), join via code, view team members
- `kanban-board`: Display tasks in TODO/DOING/DONE columns, add/move/delete tasks, filter and sort, drag-and-drop status changes
- `chat-system`: Send and receive messages in team channels, 5-second polling for real-time sync, message history with timestamps
- `mobile-responsive`: Single-column layout for mobile (<768px), full responsive design for all features

### Modified Capabilities
<!-- No existing capabilities being modified in this MVP -->

## Impact

**New infrastructure**:
- FastAPI backend (Python)
- SQLite (local dev) / Neon Postgres (production)
- Vanilla JavaScript frontend with Tailwind CSS
- Vercel deployment for both frontend and backend

**Database schema**: 4 new tables (users, teams, tasks, messages) with ~15 columns total

**API scope**: 18 new endpoints across 4 domains (Auth, Team, Task, Chat)

**Frontend architecture**: Single-page app with polling for real-time updates, responsive design for mobile

**Out of scope**: Notifications, file attachments, search, granular permissions, WebSocket, automated test suites
