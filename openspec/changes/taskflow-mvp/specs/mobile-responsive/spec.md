## ADDED Requirements

### Requirement: Responsive Layout Breakpoints
The system SHALL provide different layouts based on screen size. Desktop (≥768px) shows multi-column layout. Mobile (<768px) shows single-column layout. All functionality MUST be available on mobile.

#### Scenario: Desktop layout
- **WHEN** viewport width is ≥768px
- **THEN** kanban displays 3 columns side-by-side, chat is adjacent or below

#### Scenario: Mobile layout
- **WHEN** viewport width is <768px
- **THEN** kanban displays 1 column with horizontal scroll/swipe, navigation is hamburger menu

#### Scenario: Responsive text sizing
- **WHEN** viewport is mobile
- **THEN** font sizes are adjusted for readability without pinch-zoom

### Requirement: Mobile Kanban Navigation
The system SHALL support swipe navigation between kanban columns on mobile. User can swipe left/right to move between TODO, DOING, DONE columns. Column width adjusts to viewport width.

#### Scenario: Swipe to next column
- **WHEN** user swipes right on TODO column
- **THEN** view scrolls to DOING column

#### Scenario: Swipe to previous column
- **WHEN** user swipes left on DOING column
- **THEN** view scrolls to TODO column

#### Scenario: Drag-drop on mobile
- **WHEN** user performs drag-drop gesture on mobile
- **THEN** task moves between columns with <50ms response time

### Requirement: Mobile Chat Input
The system SHALL display chat input at bottom of screen. Visual viewport API SHALL detect keyboard appearance and adjust input position to stay above keyboard.

#### Scenario: Input above keyboard
- **WHEN** soft keyboard appears on mobile
- **THEN** chat input field moves above keyboard using visualViewport API

#### Scenario: Send on mobile
- **WHEN** user taps send button on mobile
- **THEN** message is sent, input is cleared, focus returns to input

#### Scenario: Message list scrolls
- **WHEN** new message arrives while user is typing
- **THEN** chat history is accessible by scrolling up, new message appears at bottom

### Requirement: Mobile Navigation Menu
The system SHALL provide a hamburger menu on mobile for team/account navigation. Desktop shows full navigation bar. Menu includes team selector, team settings, logout.

#### Scenario: Hamburger menu on mobile
- **WHEN** viewport is <768px
- **THEN** three-line hamburger menu appears in top-left

#### Scenario: Menu opens/closes
- **WHEN** user taps hamburger menu
- **THEN** menu slides in from left, covers content, includes team/account links

#### Scenario: Desktop navigation
- **WHEN** viewport is ≥768px
- **THEN** full navigation bar is visible, no hamburger menu

### Requirement: Touch-friendly Interactions
The system SHALL use touch-friendly click targets (minimum 44×44px). Button spacing and form fields are optimized for finger input on mobile devices.

#### Scenario: Button size on mobile
- **WHEN** buttons are rendered on mobile
- **THEN** touch target is at least 44×44 CSS pixels

#### Scenario: Form field sizing
- **WHEN** input fields are rendered on mobile
- **THEN** height is at least 44px for comfortable touch input

### Requirement: Same API for All Devices
The system SHALL use identical REST API endpoints for mobile and desktop. No device-specific API paths or responses. Responsive UI only—backend is device-agnostic.

#### Scenario: Mobile uses same endpoints
- **WHEN** mobile client calls GET /teams/{id}/tasks
- **THEN** response is identical to desktop client

#### Scenario: No device detection
- **WHEN** backend processes requests
- **THEN** no User-Agent based routing or response modification occurs
