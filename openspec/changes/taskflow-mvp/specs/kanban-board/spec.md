## ADDED Requirements

### Requirement: Create Task
The system SHALL allow team members to create tasks. Tasks MUST have a title. Tasks are automatically assigned to the creator unless specified otherwise. Status defaults to TODO.

#### Scenario: Create task with title
- **WHEN** team member submits task title to POST /teams/{id}/tasks
- **THEN** task is created with title, status=TODO, creator_id set to current user

#### Scenario: Non-member cannot create
- **WHEN** non-member attempts POST /teams/{id}/tasks
- **THEN** system returns 403 Forbidden

#### Scenario: Missing authorization
- **WHEN** unauthenticated user attempts POST /teams/{id}/tasks
- **THEN** system returns 401 Unauthorized

### Requirement: Get Team Tasks
The system SHALL return all tasks for a team. Only team members can view tasks. Tasks display title, status (TODO/DOING/DONE), creator, assignee, and timestamps.

#### Scenario: List team tasks
- **WHEN** team member calls GET /teams/{id}/tasks
- **THEN** system returns array of tasks with all fields

#### Scenario: Non-member cannot view
- **WHEN** non-member calls GET /teams/{id}/tasks
- **THEN** system returns 403 Forbidden

#### Scenario: Task metadata
- **WHEN** tasks are returned
- **THEN** each task includes id, title, status, creator_id, assignee_id, created_at

### Requirement: Update Task Status
The system SHALL allow status transitions via PATCH /tasks/{id}/status. Status values are TODO, DOING, DONE. Only team members can change status. This endpoint enables drag-and-drop functionality.

#### Scenario: Transition to DOING
- **WHEN** team member sends PATCH /tasks/{id}/status with status=DOING
- **THEN** task status is updated to DOING

#### Scenario: Transition to DONE
- **WHEN** team member sends PATCH /tasks/{id}/status with status=DONE
- **THEN** task status is updated to DONE

#### Scenario: Non-member cannot change status
- **WHEN** non-member attempts PATCH /tasks/{id}/status
- **THEN** system returns 403 Forbidden

#### Scenario: Invalid status
- **WHEN** user sends invalid status value
- **THEN** system returns 400 Bad Request

### Requirement: Get Task Details
The system SHALL return full details for a specific task. Only team members can view task details.

#### Scenario: Retrieve task by ID
- **WHEN** team member calls GET /tasks/{id}
- **THEN** system returns task object with all fields

#### Scenario: Non-member cannot view
- **WHEN** non-member calls GET /tasks/{id}
- **THEN** system returns 403 Forbidden

### Requirement: Delete Task
The system SHALL allow task deletion. Only task creator or team owner can delete. Returns 204 No Content on success.

#### Scenario: Creator deletes own task
- **WHEN** task creator calls DELETE /tasks/{id}
- **THEN** task is deleted, system returns 204 No Content

#### Scenario: Owner deletes any task
- **WHEN** team owner calls DELETE /tasks/{id}
- **THEN** task is deleted, system returns 204 No Content

#### Scenario: Non-creator/non-owner cannot delete
- **WHEN** team member who didn't create task attempts DELETE /tasks/{id}
- **THEN** system returns 403 Forbidden

#### Scenario: Non-member cannot delete
- **WHEN** non-member attempts DELETE /tasks/{id}
- **THEN** system returns 403 Forbidden

### Requirement: Task Status Workflow
The system SHALL implement three-column kanban workflow: TODO (initial), DOING (in progress), DONE (completed). All tasks start in TODO. Status transitions are unrestricted (can go any direction).

#### Scenario: Default status on creation
- **WHEN** task is created
- **THEN** status defaults to TODO

#### Scenario: Status transitions
- **WHEN** task status can change from TODO → DOING → DONE or any other combination
- **THEN** system allows unrestricted transitions

### Requirement: Task Assignment
The system SHALL track task creator (creator_id) and assignee (assignee_id). assignee_id is nullable. Creator is set automatically; assignee is optional.

#### Scenario: Creator tracking
- **WHEN** task is created by user A
- **THEN** task.creator_id = A's user_id

#### Scenario: Optional assignee
- **WHEN** task is created without assignee specified
- **THEN** task.assignee_id is null
