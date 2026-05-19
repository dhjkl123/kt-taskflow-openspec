## 1. Backend Setup

- [ ] 1.1 Initialize FastAPI project with requirements.txt (fastapi, uvicorn, sqlalchemy, pydantic, bcrypt, pyjwt, python-dotenv)
- [ ] 1.2 Create .env.local and .env.production with DATABASE_URL and JWT_SECRET variables
- [ ] 1.3 Set up environment loader (load from .env.local in dev, use Vercel secrets in prod)
- [ ] 1.4 Create FastAPI app instance with CORS middleware (allow all origins for MVP)
- [ ] 1.5 Set up logging for debugging

## 2. Database Schema and Models

- [ ] 2.1 Create SQLAlchemy models for users table (id, email, password_hash, team_id, created_at)
- [ ] 2.2 Create SQLAlchemy models for teams table (id, name, invite_code, owner_id, created_at)
- [ ] 2.3 Create SQLAlchemy models for tasks table (id, team_id, title, status, creator_id, assignee_id, created_at)
- [ ] 2.4 Create SQLAlchemy models for messages table (id, team_id, user_id, content, created_at)
- [ ] 2.5 Create database initialization script (create_all() for local SQLite, migration for Neon)
- [ ] 2.6 Add unique constraint on teams.invite_code
- [ ] 2.7 Add unique constraint on users.email
- [ ] 2.8 Test schema creation on both SQLite and Neon

## 3. Authentication Endpoints

- [ ] 3.1 Implement POST /auth/signup with email/password validation, bcrypt hashing, user creation
- [ ] 3.2 Implement POST /auth/login with email/password authentication, JWT token generation
- [ ] 3.3 Implement GET /auth/me (protected) returning current user with id, email, team_id
- [ ] 3.4 Implement POST /auth/logout (protected) returning 200 OK
- [ ] 3.5 Create JWT middleware to validate token on protected routes
- [ ] 3.6 Create middleware to inject current_user into request context
- [ ] 3.7 Test signup with valid/invalid emails and duplicate emails
- [ ] 3.8 Test login with correct/incorrect credentials
- [ ] 3.9 Test protected endpoints with and without JWT token

## 4. Team Management Endpoints

- [ ] 4.1 Implement POST /teams with team name, create team, set creator as owner, generate invite code
- [ ] 4.2 Implement GET /teams (protected) returning user's teams
- [ ] 4.3 Implement POST /teams/join with invite code, validate code, update user.team_id
- [ ] 4.4 Implement GET /teams/{id}/members (protected) returning team member list with membership validation
- [ ] 4.5 Create invite code generation utility (XXXX-#### format)
- [ ] 4.6 Create team membership validation middleware
- [ ] 4.7 Test team creation and invite code format
- [ ] 4.8 Test join with valid/invalid/expired codes
- [ ] 4.9 Test member list access (member vs. non-member)

## 5. Kanban/Task Endpoints

- [ ] 5.1 Implement POST /teams/{id}/tasks with title, create task, set creator, default status TODO, validate membership
- [ ] 5.2 Implement GET /teams/{id}/tasks returning all team tasks with membership validation
- [ ] 5.3 Implement GET /tasks/{id} returning task details with membership validation
- [ ] 5.4 Implement PATCH /tasks/{id}/status with status validation (TODO/DOING/DONE)
- [ ] 5.5 Implement DELETE /tasks/{id} with creator OR owner permission check
- [ ] 5.6 Create status transition validation (no invalid states)
- [ ] 5.7 Create permission check for task operations (non-member 403, creator/owner for delete)
- [ ] 5.8 Test task creation and status transitions
- [ ] 5.9 Test delete permissions (creator, owner, non-member)
- [ ] 5.10 Test task list filtering and ordering

## 6. Chat Endpoints

- [ ] 6.1 Implement POST /teams/{id}/messages with content validation (1-1000 chars), create message, validate membership
- [ ] 6.2 Implement GET /teams/{id}/messages with optional since parameter, return messages since timestamp, validate membership
- [ ] 6.3 Implement GET /messages/{id} returning message details with membership validation
- [ ] 6.4 Implement DELETE /messages/{id} with author-only permission check
- [ ] 6.5 Create message content length validation
- [ ] 6.6 Create permission check for message operations (non-member 403, author for delete)
- [ ] 6.7 Test message creation and retrieval
- [ ] 6.8 Test message deletion permissions
- [ ] 6.9 Test since parameter filtering (timestamp accuracy)

## 7. Error Handling and Validation

- [ ] 7.1 Implement global error handler (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Server Error)
- [ ] 7.2 Add input validation for all endpoints (pydantic schemas)
- [ ] 7.3 Test all error scenarios from spec (duplicate email, invalid token, non-member access, invalid status, etc.)

## 8. Frontend Scaffolding

- [ ] 8.1 Create index.html with basic layout (header, main content area, footer)
- [ ] 8.2 Create styles.css with Tailwind CSS base setup
- [ ] 8.3 Create app.js with router (hash-based: #/login, #/teams, #/kanban, #/chat)
- [ ] 8.4 Create api.js with fetch wrapper for all 18 endpoints
- [ ] 8.5 Create state.js for global state (currentUser, currentTeam, tasks, messages)
- [ ] 8.6 Create utils.js with helper functions (formatDate, generateCode, etc.)

## 9. Authentication UI (Frontend)

- [ ] 9.1 Create login page HTML with email/password form
- [ ] 9.2 Create signup page HTML with email/password/confirm form
- [ ] 9.3 Implement login form submission, call POST /auth/login, store JWT
- [ ] 9.4 Implement signup form submission, call POST /auth/signup, redirect to login
- [ ] 9.5 Implement logout button, clear JWT from storage, redirect to login
- [ ] 9.6 Add client-side password validation (non-empty, reasonable length)
- [ ] 9.7 Test login/signup flow end-to-end (browser)

## 10. Team Selection UI (Frontend)

- [ ] 10.1 Create team selection page HTML (create team form, join team form with code)
- [ ] 10.2 Implement team creation form, call POST /teams, get invite code, show to user
- [ ] 10.3 Implement join team form with code input, call POST /teams/join, set current team
- [ ] 10.4 Implement GET /teams on page load, display user's current team
- [ ] 10.5 Add navigation to kanban/chat after team selection
- [ ] 10.6 Test team creation and join flow end-to-end

## 11. Kanban Board UI (Frontend)

- [ ] 11.1 Create kanban HTML with 3 columns (TODO, DOING, DONE) and task cards
- [ ] 11.2 Implement task list fetching (GET /teams/{id}/tasks) and rendering
- [ ] 11.3 Implement add task form with title input, call POST /teams/{id}/tasks
- [ ] 11.4 Implement drag-and-drop between columns (native HTML drag events)
- [ ] 11.5 Implement status update on drop (PATCH /tasks/{id}/status)
- [ ] 11.6 Implement delete task button with confirmation, call DELETE /tasks/{id}
- [ ] 11.7 Add task creation to multiple users, verify permissions
- [ ] 11.8 Test kanban drag-drop response time (<50ms perception)
- [ ] 11.9 Test delete permissions (creator can delete, assignee cannot)

## 12. Chat UI (Frontend)

- [ ] 12.1 Create chat HTML with message list and input form
- [ ] 12.2 Implement message list fetching (GET /teams/{id}/messages), render with sender and timestamp
- [ ] 12.3 Implement polling logic (GET /teams/{id}/messages?since=...) every 5 seconds
- [ ] 12.4 Implement message form submission (POST /teams/{id}/messages)
- [ ] 12.5 Implement message deletion button for own messages (DELETE /messages/{id})
- [ ] 12.6 Add auto-scroll to latest message when new messages arrive
- [ ] 12.7 Add message character counter (1-1000 chars)
- [ ] 12.8 Test message persistence (sent messages appear in subsequent polls)
- [ ] 12.9 Test polling latency (message appears within 5 seconds)

## 13. Mobile Responsiveness

- [ ] 13.1 Add mobile viewport meta tag to index.html
- [ ] 13.2 Implement responsive CSS with Tailwind breakpoints (<768px: mobile, ≥768px: desktop)
- [ ] 13.3 Implement hamburger menu for mobile navigation
- [ ] 13.4 Implement single-column kanban for mobile with swipe/scroll between columns
- [ ] 13.5 Implement touch-friendly button sizes (44×44px minimum)
- [ ] 13.6 Implement chat input with visualViewport API to detect soft keyboard
- [ ] 13.7 Test on mobile browser (iOS Safari, Android Chrome) with actual touch
- [ ] 13.8 Test orientation change (portrait ↔ landscape)

## 14. Vercel Deployment Setup

- [ ] 14.1 Create Vercel project and link to GitHub repository
- [ ] 14.2 Create vercel.json with configuration for FastAPI serverless deployment
- [ ] 14.3 Set up environment variables in Vercel (DATABASE_URL, JWT_SECRET)
- [ ] 14.4 Create Neon Postgres project and note connection string
- [ ] 14.5 Test DATABASE_URL switching between .env.local (SQLite) and Vercel (Postgres)
- [ ] 14.6 Deploy backend to Vercel serverless functions
- [ ] 14.7 Deploy frontend to Vercel static hosting
- [ ] 14.8 Update frontend API_BASE_URL to production endpoint

## 15. Integration Testing

- [ ] 15.1 Test full auth flow (signup → login → get me → logout)
- [ ] 15.2 Test team creation and invite flow (create team → get invite code → join team → view members)
- [ ] 15.3 Test kanban flow (create task → move between columns → delete task)
- [ ] 15.4 Test chat flow (send message → poll → receive message → delete message)
- [ ] 15.5 Test permission enforcement (non-member gets 403 on all team endpoints)
- [ ] 15.6 Test mobile UI on actual phone/tablet (responsive layout, touch interactions)
- [ ] 15.7 Test message persistence (send 10 messages, refresh page, verify all 10 appear)

## 16. Performance Validation

- [ ] 16.1 Verify API response time <100ms for all endpoints (use browser DevTools)
- [ ] 16.2 Verify kanban drag-drop response <50ms (drag animation smoothness)
- [ ] 16.3 Verify chat polling latency ~5 seconds (message appears within window)
- [ ] 16.4 Check frontend bundle size (should be <1MB for vanilla JS)

## 17. Documentation and Knowledge Transfer

- [ ] 17.1 Write README with setup instructions (clone, pip install, DATABASE_URL setup, npm start)
- [ ] 17.2 Document API endpoints with curl examples for each 18 endpoints
- [ ] 17.3 Document environment variables (DATABASE_URL, JWT_SECRET, etc.)
- [ ] 17.4 Document deployment steps (Vercel, Neon)

## 18. Post-Launch Checklist

- [ ] 18.1 Enable Neon backups for data protection
- [ ] 18.2 Set up monitoring/logging for API errors (optional: Sentry/LogRocket)
- [ ] 18.3 Create status dashboard (optional: uptime monitoring)
- [ ] 18.4 Document known limitations and future work
- [ ] 18.5 Plan post-MVP features (WebSocket, search, notifications, multi-team support)
