## Context

TaskFlow MVP is a lightweight team collaboration tool for 3-5 person teams. The proposal establishes the mission (see-and-sync work + chat in one screen) and lists 5 capabilities. This design details the technical approach to implement those capabilities within the MVP's time and scope constraints.

**Key constraints**:
- Single team per user (users.team_id foreign key)
- No WebSocket or complex real-time infrastructure
- JWT-based auth with no refresh mechanism
- Stateless logout (no token blacklist)
- Simple permission model: team member vs. non-member
- Deployment target: Vercel (frontend + backend) + Neon (database)

**Key assumptions**:
- ≤5 concurrent users per team
- Modern browser only (Chrome/Safari latest 2 versions)
- Single time zone (KST)
- No migration from existing data (greenfield)

## Goals / Non-Goals

**Goals:**
- Enable small teams to see work status and communicate in a single screen
- Implement kanban workflow (TODO/DOING/DONE) with drag-and-drop
- Provide real-time team chat via polling (5-second interval)
- Support mobile devices with responsive layout (<768px breakpoint)
- Deploy backend and frontend to Vercel with Neon Postgres
- Ensure all permission checks prevent non-member access (403 responses)
- Guarantee message persistence (no message loss)

**Non-Goals:**
- Granular role-based permissions (admin, editor, viewer roles)
- WebSocket or persistent connection real-time sync
- Full-text search across tasks or messages
- File attachments or rich media
- Email/SMS notifications or push notifications
- Automated testing frameworks
- i18n or multi-language support
- Token refresh or sliding sessions

## Decisions

### Decision 1: REST API with Polling for Real-time Updates

**Choice**: Implement 5-second polling (GET requests) instead of WebSocket for real-time sync.

**Rationale**:
- Simpler infrastructure (HTTP-only, no connection state)
- Vercel Edge Function and serverless compute support HTTP natively
- Lower deployment complexity for MVP timeline
- 5-second latency is acceptable for team collaboration (not competitive gaming)
- Easier to debug (standard HTTP request/response)

**Alternatives considered**:
- WebSocket: Requires persistent connection, more complex deployment, higher infrastructure cost
- Server-Sent Events (SSE): Still requires persistent connections, similar complexity to WebSocket
- GraphQL subscriptions: Additional framework complexity without significant MVP benefit

**Implementation**: Client polls GET /teams/{id}/messages?since=<timestamp> and GET /teams/{id}/tasks every 5 seconds. Backend returns only new items since last fetch.

---

### Decision 2: Single-table User-Team Relationship (users.team_id)

**Choice**: Add team_id column to users table instead of many-to-many teams_users junction table.

**Rationale**:
- MVP constraint: 1 user = 1 team (assumption from proposal)
- Simplifies queries (no joins for team membership)
- Reduces schema complexity (4 tables → 2 tables, not 5)
- Permission checks become: WHERE user.team_id = target_team_id

**Alternatives considered**:
- Many-to-many (teams_users table): Future-proofs for multi-team users, but adds complexity not needed for MVP
- Organization model: Multiple levels (org > team > user), too complex for MVP scope

**Impact**: When user joins a new team via invite code, UPDATE users SET team_id = {new_team_id}. Switching teams requires re-authentication (no simultaneous multi-team access).

---

### Decision 3: JWT Without Refresh Tokens

**Choice**: Issue 24-hour JWT on login, no refresh mechanism, require re-login after expiration.

**Rationale**:
- Simplifies auth system (no refresh token storage/rotation)
- Matches MVP lifetime (sessions are task-focused, ~5-30 min per use)
- Reduces backend state (stateless, no token table)
- Acceptable UX: "Your session expired, please login" is acceptable for MVP

**Alternatives considered**:
- Refresh tokens: Adds session management table, token rotation logic
- Sliding sessions: Requires tracking last activity, more backend state
- No expiration: Security risk (stolen token is valid forever)

**Implementation**: POST /auth/login returns { token: "eyJ...", expires_in: 86400 }. Client stores in memory (not localStorage) or session storage. No automatic refresh; user must login again after 24 hours.

---

### Decision 4: Stateless Logout (No Blacklist)

**Choice**: POST /auth/logout returns 200 OK without server-side tracking. Client removes token from storage.

**Rationale**:
- Eliminates token blacklist table
- Fits serverless deployment (no persistent session state)
- MVP behavior: Client-side token removal is sufficient for single-device use
- Reduces logout latency (no database writes)

**Alternatives considered**:
- Redis blacklist: Adds infrastructure dependency
- Token revocation table: Requires querying on every request, performance impact

**Limitation**: Stolen token before logout is still valid. Mitigated by short 24-hour expiration and HTTPS-only transmission.

**Implementation**: Frontend deletes token from memory on logout. Backend accepts logout request but performs no validation—always returns 200.

---

### Decision 5: Separated Status Update Endpoint (PATCH /tasks/{id}/status)

**Choice**: Provide dedicated PATCH /tasks/{id}/status endpoint separate from PUT /tasks/{id} (which may be used for other fields later).

**Rationale**:
- Drag-and-drop UX requires rapid status updates (no full task re-fetch)
- Semantically correct REST: PATCH for partial updates
- Enables future title/assignee updates via PUT without conflicting

**Alternatives considered**:
- Single PUT for all updates: Requires sending full task object on every drag
- Implicit status from task position: Frontend-only state, no backend sync

**Impact**: Frontend calls PATCH /tasks/{id}/status with { status: "DOING" } instead of drag payload.

---

### Decision 6: Nullable assignee_id vs. Creator-only Task Ownership

**Choice**: Track both creator_id (who created) and assignee_id (who's working on it, nullable). "My tasks" = WHERE assignee_id = user_id.

**Rationale**:
- Separate creation from assignment (team lead creates, assignee works)
- Creator ≠ assignee (common workflow: plan in standups, assign tasks)
- Nullable assignee allows unassigned tasks (planning phase)
- Matches kanban UX: drag task to DOING, assign to yourself

**Alternatives considered**:
- Creator only: Everyone works on their own tasks, less team flexibility
- Assignee required: Forces assignment immediately, workflow friction

**Permission model**:
- Delete: creator OR team owner (prevents accidental deletion by assignee)
- Update status: any team member (encourages DOING/DONE transitions)

---

### Decision 7: Vercel + Neon for Backend and Database

**Choice**: Deploy FastAPI backend to Vercel serverless (Python support via Custom Runtimes or edge functions), SQLite for local dev, Neon Postgres for production.

**Rationale**:
- Vercel supports Python deployments (via requirements.txt + serverless runtime)
- Neon provides free PostgreSQL tier for MVP
- Single deploy platform (FE + BE on Vercel)
- DATABASE_URL environment variable enables local/prod switching
- No additional infrastructure cost

**Alternatives considered**:
- Railway/Render: Simpler Python deployments, but separate FE platform
- AWS Lambda: More complex setup, less integrated with Vercel FE
- Heroku: Free tier recently removed

**Local development**: FastAPI + SQLite with `DATABASE_URL=sqlite:///taskflow.db`. Production: Vercel environment variable sets `DATABASE_URL=postgresql://...` pointing to Neon.

---

### Decision 8: Vanilla JavaScript + Tailwind CSS (No Frontend Framework)

**Choice**: Use vanilla JavaScript with Tailwind CSS instead of React/Vue/Svelte.

**Rationale**:
- MVP scope doesn't justify framework overhead
- 4 simple screens (login, team select, kanban, chat)
- Faster initial load time
- Smaller bundle size
- Direct DOM manipulation is sufficient for polling-based updates

**Alternatives considered**:
- React: More overhead for complexity not present in MVP
- Alpine.js: Lighter, but less familiar to teams coming from React
- Htmx: Requires different architecture (server-rendered templates)

**Architecture**: index.html as single entry point. Vanilla JS handles routing via URL fragments (#/login, #/kanban), state via window variables, DOM updates via querySelector and innerHTML/appendChild.

---

### Decision 9: Invite Code Format (XXXX-#### Pattern)

**Choice**: Generate invite codes as 4 alphanumeric + dash + 4 numeric (e.g., FRNT-2026).

**Rationale**:
- Memorable without checksum complexity (easier than UUID)
- Case-insensitive input (users type FRNT-2026 or frnt-2026, both work)
- Readable in chat/email (clear separation with dash)
- Collision-resistant at MVP scale (24^4 * 10^4 ≈ 330 billion combinations)

**Pattern**: ^[A-Z0-9]{4}-[0-9]{4}$ (uppercase on generation, case-insensitive on validation).

**Uniqueness**: Check constraint (UNIQUE) on teams.invite_code, regenerate on collision (extremely rare).

---

### Decision 10: Three-column Kanban with Unrestricted Transitions

**Choice**: TODO → DOING → DONE columns, but allow backward transitions (e.g., DOING → TODO if needed).

**Rationale**:
- Simple workflow for quick pivots
- No state machine complexity
- Matches real team behavior (tasks can bounce back if dependencies change)
- Drag-and-drop UX allows any transition

**Alternatives considered**:
- Strict workflow (TODO → DOING → DONE only): Prevents legitimate reverts
- Multiple columns (TODO, BLOCKED, REVIEW, DONE): Overkill for MVP

---

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| **5-second polling latency** → Message appears 0-5 seconds delayed | Acceptable for team discussion (not real-time comms), documented in chat UX |
| **No refresh tokens** → Users must re-login after 24 hours | 24 hours covers typical work sessions; acceptable trade-off for simplicity |
| **Stateless logout** → Stolen token valid until expiration | Mitigated by HTTPS-only, short 24-hour TTL, assumption of trusted devices |
| **Vanilla JS** → Harder to scale frontend as features grow | Acceptable for MVP; refactor to framework if features expand post-MVP |
| **Single team per user** → Cannot belong to multiple teams simultaneously | Assumption from proposal; future work if multi-team support needed |
| **No WebSocket** → CPU/memory lighter, but higher latency | 5-second polling is acceptable for MVP; upgrade to WebSocket if latency becomes UX issue |
| **Neon free tier limits** → Potential for hitting connection/storage limits at high load | Monitor usage; scale to paid Neon plan if needed |
| **SQLite locally, Postgres in prod** → Schema differences possible | Use Neon locally in dev to ensure parity (pay for dev instance or use shadow database) |

---

## Migration Plan

**Phase 1: Local Development Setup**
1. Create FastAPI project with uvicorn
2. Create SQLite database locally with 4-table schema
3. Implement 18 API endpoints with JWT middleware
4. Create vanilla JS frontend with HTML/CSS/JS
5. Test locally with curl and browser

**Phase 2: Environment Configuration**
1. Set up Neon Postgres instance
2. Create .env.local (DATABASE_URL=sqlite://...) and .env.production (DATABASE_URL=postgresql://...)
3. Test connection switching (local → prod schema)
4. Verify migrations run correctly on Neon

**Phase 3: Vercel Deployment**
1. Create Vercel project, link GitHub repo
2. Configure environment variables (DATABASE_URL, JWT_SECRET)
3. Deploy FastAPI backend as serverless function
4. Deploy vanilla JS frontend
5. Run smoke tests (signup, login, create team, create task, send message)

**Phase 4: Post-Launch Monitoring**
1. Monitor API response times (target <100ms for all endpoints)
2. Monitor kanban drag response (<50ms for drag-drop perception)
3. Monitor message delivery (100% persistence check)
4. Monitor Neon connection limits and costs
5. Scale vertical (Neon plan) or add caching if needed

**Rollback Strategy**:
- If critical bug in production: Revert to last working commit, redeploy to Vercel
- If database migration breaks: Restore from Neon backup (if enabled)
- No zero-downtime strategy needed for MVP (small user base, acceptable downtime)

---

## Open Questions

1. **JWT_SECRET management**: Should we use environment variable or Vercel secrets? → Vercel secrets is safest
2. **Message idempotency**: How to prevent duplicate messages on network retry? → Option A: Client generates message_id, server deduplicates. Option B: Server assigns ID and client tracks. → Recommend Option A (client-driven UUID)
3. **Neon connection pooling**: Does Vercel serverless handle Neon connection pooling or do we need Neon's built-in pooler? → Test both; likely need Neon pooler for reliability
4. **SQLite local → Neon prod migration**: Should we version migrations or use Alembic? → For MVP, manual migration script; upgrade to Alembic if schema changes frequently
5. **CORS for Vercel deployment**: Frontend and backend on same Vercel project—do we need CORS headers? → Likely no, since both serve from same origin; test in deployment
