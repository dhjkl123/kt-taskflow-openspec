## ADDED Requirements

### Requirement: User Registration
The system SHALL allow users to create an account with email and password. Passwords MUST be hashed using bcrypt before storage. Duplicate email addresses SHALL be rejected with appropriate error message.

#### Scenario: Successful registration
- **WHEN** user submits signup form with valid email and password
- **THEN** account is created, password is hashed, and user can login

#### Scenario: Duplicate email rejected
- **WHEN** user attempts to register with email that already exists
- **THEN** system returns 409 Conflict error

#### Scenario: Password requirements
- **WHEN** user submits registration with empty password
- **THEN** system returns 400 Bad Request error

### Requirement: User Login
The system SHALL authenticate users with email/password and issue a JWT token with 24-hour expiration. No token refresh mechanism is provided.

#### Scenario: Successful login
- **WHEN** user submits correct email and password
- **THEN** system returns JWT token with 24-hour expiration

#### Scenario: Failed authentication
- **WHEN** user submits incorrect password
- **THEN** system returns 401 Unauthorized error

#### Scenario: Nonexistent user
- **WHEN** user attempts login with email that doesn't exist
- **THEN** system returns 401 Unauthorized error

### Requirement: JWT Token Management
The system SHALL issue JWT tokens upon successful login. Each token SHALL contain user ID and team ID. Tokens expire after 24 hours with no refresh mechanism.

#### Scenario: Token contains user context
- **WHEN** user decodes valid JWT token
- **THEN** token contains user_id and team_id claims

#### Scenario: Token validation
- **WHEN** client sends request with valid JWT
- **THEN** system authenticates the request

#### Scenario: Expired token rejection
- **WHEN** client sends request with token older than 24 hours
- **THEN** system returns 401 Unauthorized

### Requirement: Get Current User
The system SHALL provide an authenticated endpoint to retrieve current user details (id, email, team_id).

#### Scenario: Retrieve current user
- **WHEN** authenticated user calls GET /auth/me
- **THEN** system returns user object with id, email, team_id

#### Scenario: Unauthenticated request
- **WHEN** unauthenticated request calls GET /auth/me
- **THEN** system returns 401 Unauthorized

### Requirement: Logout
The system SHALL accept logout requests and return 200 OK. No token blacklist mechanism is implemented—logout is stateless.

#### Scenario: Logout endpoint
- **WHEN** authenticated user calls POST /auth/logout
- **THEN** system returns 200 OK (client-side token removal is user's responsibility)
