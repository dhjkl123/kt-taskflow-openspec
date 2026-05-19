## ADDED Requirements

### Requirement: Create Team
The system SHALL allow authenticated users to create a new team. Upon creation, the creator becomes the team owner. A unique invite code with format XXXX-#### (alphanumeric) SHALL be generated automatically.

#### Scenario: Team creation
- **WHEN** authenticated user submits team name to POST /teams
- **THEN** team is created with creator as owner, invite code is generated

#### Scenario: Team owner is set
- **WHEN** team is created
- **THEN** creator's user.team_id is set to the new team ID

### Requirement: Get Team List
The system SHALL return a list of teams accessible to the authenticated user. For MVP (1 user = 1 team assumption), this returns the user's single team.

#### Scenario: List user's teams
- **WHEN** authenticated user calls GET /teams
- **THEN** system returns array of team(s) user belongs to

#### Scenario: Unauthenticated request
- **WHEN** unauthenticated user calls GET /teams
- **THEN** system returns 401 Unauthorized

### Requirement: Join Team with Invite Code
The system SHALL allow users to join a team by providing a valid invite code. Upon successful join, user's team_id is updated to the team. Only active team members can join via code.

#### Scenario: Valid invite code join
- **WHEN** user submits correct invite code to POST /teams/join
- **THEN** user.team_id is updated to the team, user is added as member

#### Scenario: Invalid invite code
- **WHEN** user submits invalid or expired invite code
- **THEN** system returns 400 Bad Request or 404 Not Found

#### Scenario: Already a member
- **WHEN** user attempts to join a team they're already a member of
- **THEN** system returns 409 Conflict

### Requirement: Get Team Members
The system SHALL return a list of team members. Only team members can view the member list (membersheip validation required).

#### Scenario: View team members
- **WHEN** team member calls GET /teams/{id}/members
- **THEN** system returns array of team members with id, email, role

#### Scenario: Non-member access denied
- **WHEN** non-member calls GET /teams/{id}/members
- **THEN** system returns 403 Forbidden

#### Scenario: Missing authorization
- **WHEN** unauthenticated user calls GET /teams/{id}/members
- **THEN** system returns 401 Unauthorized

### Requirement: Invite Code Generation
The system SHALL generate unique invite codes with format XXXX-#### where X is alphanumeric (uppercase letters and digits). Code format ensures uniqueness and readability.

#### Scenario: Code format compliance
- **WHEN** invite code is generated
- **THEN** code matches pattern ^[A-Z0-9]{4}-[0-9]{4}$

#### Scenario: Code uniqueness
- **WHEN** multiple teams are created
- **THEN** each team has a unique invite code
