## ADDED Requirements

### Requirement: Send Message
The system SHALL allow team members to send text messages to their team. Messages MUST be 1-1000 characters. Each message includes sender, content, and timestamp. Only team members can send messages.

#### Scenario: Successful message send
- **WHEN** team member submits message to POST /teams/{id}/messages
- **THEN** message is stored with sender_id, content, created_at

#### Scenario: Message length validation
- **WHEN** user submits message over 1000 characters
- **THEN** system returns 400 Bad Request

#### Scenario: Empty message rejected
- **WHEN** user submits empty message
- **THEN** system returns 400 Bad Request

#### Scenario: Non-member cannot send
- **WHEN** non-member attempts POST /teams/{id}/messages
- **THEN** system returns 403 Forbidden

### Requirement: Get Message History
The system SHALL return messages for a team with optional filtering by timestamp (since parameter). New joiner SHALL see complete message history immediately upon joining. Client polls GET /teams/{id}/messages?since=<timestamp> every 5 seconds.

#### Scenario: Fetch all team messages
- **WHEN** team member calls GET /teams/{id}/messages
- **THEN** system returns array of all messages in chronological order

#### Scenario: Fetch messages since timestamp
- **WHEN** team member calls GET /teams/{id}/messages?since=2026-05-19T10:30:00Z
- **THEN** system returns only messages created after that timestamp

#### Scenario: New member sees all history
- **WHEN** new user joins team and calls GET /teams/{id}/messages
- **THEN** user can see all previous messages (no history limit)

#### Scenario: Non-member cannot view
- **WHEN** non-member calls GET /teams/{id}/messages
- **THEN** system returns 403 Forbidden

#### Scenario: Empty response
- **WHEN** GET /teams/{id}/messages?since= queries a time with no messages
- **THEN** system returns empty array

### Requirement: Delete Message
The system SHALL allow users to delete their own messages. Only the message author can delete. Returns 204 No Content on success.

#### Scenario: Author deletes message
- **WHEN** message author calls DELETE /messages/{id}
- **THEN** message is deleted, system returns 204 No Content

#### Scenario: Non-author cannot delete
- **WHEN** different user attempts DELETE /messages/{id}
- **THEN** system returns 403 Forbidden

#### Scenario: Non-member cannot delete
- **WHEN** non-member attempts DELETE /messages/{id}
- **THEN** system returns 403 Forbidden

### Requirement: Get Message Details
The system SHALL return full details for a specific message. Only team members can view message details.

#### Scenario: Retrieve message by ID
- **WHEN** team member calls GET /messages/{id}
- **THEN** system returns message object with id, user_id, content, created_at

#### Scenario: Non-member cannot view
- **WHEN** non-member calls GET /messages/{id}
- **THEN** system returns 403 Forbidden

### Requirement: Real-time Sync via Polling
The system SHALL support client-side polling every 5 seconds. Client calls GET /teams/{id}/messages?since=<last_received_timestamp> to fetch new messages. No WebSocket or server-sent events are used.

#### Scenario: Client polls for updates
- **WHEN** client polls GET /teams/{id}/messages?since=T1 after message posted at T2
- **THEN** system returns message posted at T2

#### Scenario: No new messages
- **WHEN** client polls but no new messages exist
- **THEN** system returns empty array immediately (no wait)

### Requirement: Message Content Persistence
The system SHALL guarantee zero message loss. Every POST /teams/{id}/messages that returns success MUST be retrievable in subsequent GET requests with 100% reliability.

#### Scenario: Message persistence
- **WHEN** POST /teams/{id}/messages returns 200 OK
- **THEN** subsequent GET /teams/{id}/messages includes that message

#### Scenario: Duplicate prevention
- **WHEN** message is posted
- **THEN** exact duplicate is not created on retry (idempotency via client timestamp or request ID)
