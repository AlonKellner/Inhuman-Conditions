# Feature Specification: Seed-Synced Inhuman Conditions Web Game

**Feature Branch**: `001-seed-synced-game`
**Created**: 2026-02-22
**Status**: Draft
**Input**: User description: "Static web version of Inhuman Conditions game with seed-based synchronization"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Single Device Gameplay (Priority: P1)

Two players sitting together use one device to play a complete 5-minute interrogation game. They pass the device back and forth, with secret information (Suspect's role) hidden/revealed as needed.

**Why this priority**: This is the minimum viable product - a fully playable game experience that demonstrates all core mechanics without requiring multiple devices or complex synchronization. Delivers immediate value and validates game mechanics.

**Independent Test**: Can be fully tested by two people completing one game session from seed entry to conclusion, demonstrating that all game states work and role information is properly managed.

**Acceptance Scenarios**:

1. **Given** two players with one device, **When** they enter a 4-letter seed, **Then** the game initializes with deterministic content (same seed = same question packet, penalty, background, role)
2. **Given** game has started, **When** players advance through penalty calibration, inducer puzzle, and background selection, **Then** each state displays appropriate instructions for current player
3. **Given** interview phase begins, **When** 5-minute timer starts, **Then** Investigator sees questions and Suspect sees their role with traits/restrictions
4. **Given** Suspect has secret role information, **When** device is passed between players, **Then** role is hidden until Suspect manually reveals it
5. **Given** timer expires, **When** Investigator makes determination (Human/Robot), **Then** actual role is revealed and outcome shown (correct/incorrect)

---

### User Story 2 - Multi-Device Synchronized Gameplay (Priority: P2)

Two players on separate devices (or more with spectators) play simultaneously by entering the same 4-letter seed. They manually coordinate state transitions through verbal communication.

**Why this priority**: Enables remote play and social sharing while maintaining zero network dependencies. Builds on P1 core mechanics with additional synchronization UX.

**Independent Test**: Can be tested with two devices entering the same seed, advancing through all states together, and verifying identical game content appears on both devices.

**Acceptance Scenarios**:

1. **Given** two players on different devices, **When** both enter seed "ABCD", **Then** both see identical packet, penalty, role, and background
2. **Given** multi-device mode active, **When** each player selects their role (Investigator/Suspect/Spectator), **Then** role-appropriate views are shown
3. **Given** players are at different game states, **When** they check sync status, **Then** visual indicators show current state mismatch
4. **Given** players advance through states, **When** Investigator and Suspect both click "Ready", **Then** interview timer starts simultaneously
5. **Given** timer is running, **When** Investigator sees question list, **Then** Suspect sees same questions in same order with role information

---

### User Story 3 - First-Time Player Tutorial (Priority: P2)

A new visitor accesses the game for the first time and is automatically guided through an interactive tutorial explaining seed synchronization, role selection, and game flow.

**Why this priority**: Critical for onboarding and reducing friction for new players who are unfamiliar with seed-based synchronization concept. Without tutorial, players may not understand how to coordinate devices.

**Independent Test**: Can be tested by opening game in fresh browser session (no cookies) and completing tutorial walkthrough with shortened timer (30 seconds instead of 5 minutes).

**Acceptance Scenarios**:

1. **Given** user visits site for first time, **When** page loads, **Then** tutorial automatically starts
2. **Given** tutorial is active, **When** user completes all steps, **Then** tutorial completion is saved (cookie) and won't show again
3. **Given** user has completed tutorial once, **When** they return to site, **Then** game starts normally without tutorial
4. **Given** user wants to replay tutorial, **When** they access settings and enable tutorial mode, **Then** tutorial becomes active again

---

### User Story 4 - Automatic Seed Generation (Priority: P3)

Players who don't want to manually coordinate a seed can use auto-generated seeds based on current UTC time rounded to 5-minute intervals, enabling spontaneous synchronized play worldwide.

**Why this priority**: Convenience feature that enables "pick-up games" where players just start playing at roughly the same time without pre-coordinating a specific seed. Reduces friction but not essential for core functionality.

**Independent Test**: Can be tested by loading game at different times within same 5-minute window and verifying identical default seeds are suggested.

**Acceptance Scenarios**:

1. **Given** current UTC time is 14:32, **When** player loads seed entry screen, **Then** default seed corresponding to 14:30-14:35 interval is displayed
2. **Given** two players load game at 14:31 and 14:34, **When** both accept default seed, **Then** both get identical game content
3. **Given** player loads game at 14:36, **When** default seed is displayed, **Then** it corresponds to 14:35-14:40 interval (different from 14:30-14:35)
4. **Given** default seed is shown, **When** player manually enters different seed, **Then** manual seed overrides default
5. **Given** player is on seed entry screen, **When** they click "Randomize Seed" button, **Then** system generates completely random 4-letter seed (not time-based)

---

### User Story 5 - Timer-Only Mode (Priority: P3)

Players using physical cards want a simple 5-minute countdown timer on a dedicated device without seeing game content.

**Why this priority**: Supports hybrid physical/digital play for users who own the physical game but want digital timer. Lower priority as it's a simple utility feature.

**Independent Test**: Can be tested by accessing timer-only URL and verifying countdown works independently of game logic.

**Acceptance Scenarios**:

1. **Given** user selects timer-only mode, **When** they start timer, **Then** 5-minute countdown displays without questions or roles
2. **Given** timer is running, **When** it reaches 0:00, **Then** visual/audible alert indicates time expired
3. **Given** timer-only mode active, **When** user wants full game, **Then** they can switch to normal mode

---

### User Story 6 - Spectator Observation (Priority: P3)

Additional players want to follow along with an ongoing game without seeing secret information or affecting gameplay.

**Why this priority**: Enhances social aspect and enables teaching/demonstration scenarios. Not required for core 2-player gameplay.

**Independent Test**: Can be tested by a third device entering same seed, selecting spectator role, and verifying read-only view of questions without role information.

**Acceptance Scenarios**:

1. **Given** spectator enters same seed as active game, **When** they select spectator role, **Then** they see questions but not Suspect's role
2. **Given** spectator is viewing game, **When** Investigator reorders questions, **Then** spectator sees same order (if synchronized)
3. **Given** game concludes, **When** role is revealed, **Then** spectator sees outcome

---

### Edge Cases

- What happens when players enter different seeds on their devices? (Show clear seed mismatch warning with instructions to verify seed)
- How does system handle browser refresh mid-game? (State is lost, players must restart - acceptable for static app)
- What happens if timer expires during penalty calibration or other pre-interview states? (Timer only runs during interview phase)
- How are seeds validated? (Must be exactly 4 uppercase letters A-Z, show error for invalid format)
- What happens if players skip calibrating penalty? (Allowed - calibration is recommended but not enforced)
- How does single-device mode prevent accidental role revelation? (Role hidden by default, requires explicit "Show Role" button press)
- Can players restart a game with same seed? (Yes, "Play Again" option resets to seed entry with same seed pre-filled)
- What if spectator tries to take actions? (Spectator view is completely read-only, no interactive elements shown)

## Requirements *(mandatory)*

### Functional Requirements

#### Seed System

- **FR-001**: System MUST accept 4-letter seeds composed only of uppercase letters A-Z
- **FR-002**: System MUST generate default seed based on current UTC time rounded to nearest 5-minute interval
- **FR-003**: System MUST provide "Randomize Seed" button that generates completely random 4-letter seed using cryptographically secure randomness
- **FR-004**: System MUST produce identical game content (packet, penalty, role, background, question order) for same seed across all devices
- **FR-005**: System MUST validate seed format and display error for invalid seeds (not 4 letters, contains lowercase/numbers/special characters)

#### Game Content Selection

- **FR-006**: System MUST select one of 11 question packets deterministically based on seed
- **FR-007**: System MUST select one of 18 penalties deterministically based on seed
- **FR-008**: System MUST select one of 30 suspect backgrounds deterministically based on seed
- **FR-009**: System MUST assign role (Human 33%, Patient Robot 50%, Violent Robot 17%) deterministically based on seed
- **FR-010**: System MUST generate interference pattern (inducer puzzle) deterministically based on seed
- **FR-011**: System MUST shuffle question order within packet deterministically based on seed

#### Play Modes

- **FR-012**: System MUST support single-device mode where device is passed between players
- **FR-013**: System MUST support multi-device mode where each device has independent role
- **FR-014**: System MUST support timer-only mode showing only countdown without game content
- **FR-015**: System MUST allow role selection (Investigator, Suspect, Spectator) in multi-device mode

#### Game Flow

- **FR-016**: System MUST present states in order: Seed Entry → Mode Selection → Role Selection → Penalty Calibration → Packet Display → Inducer Puzzle → Background Display → Ready to Start → Interview → Conclusion
- **FR-017**: System MUST allow manual advancement through each state (no auto-progression)
- **FR-018**: System MUST track penalty calibration progress (3 attempts)
- **FR-019**: System MUST display appropriate instructions for current player at each state

#### Interview Phase

- **FR-020**: System MUST run 5-minute (300 second) countdown timer during interview
- **FR-021**: System MUST display questions to Investigator with primary/secondary indicators
- **FR-022**: System MUST display role, traits, tasks, and background to Suspect
- **FR-023**: System MUST hide Suspect role from Investigator view
- **FR-024**: System MUST enable determination buttons only when timer expires or early robot determination
- **FR-025**: System MUST reveal actual role and show outcome (correct/incorrect) after determination

#### Secret Information Management

- **FR-026**: In single-device mode, system MUST hide Suspect role by default
- **FR-027**: In single-device mode, system MUST provide "Show Role" / "Hide Role" toggle for Suspect
- **FR-028**: In multi-device mode, system MUST show role only to player who selected Suspect
- **FR-029**: System MUST never reveal Suspect role to Investigator or Spectators before conclusion

#### Synchronization & State Management

- **FR-030**: System MUST display current state indicator (e.g., "Step 3 of 8")
- **FR-031**: System MUST provide "Sync Check" feature displaying state hash for debugging desyncs
- **FR-032**: System MUST provide "Reset Game" option to return to seed entry
- **FR-033**: System MUST save no data to server (fully client-side)

#### Tutorial

- **FR-034**: System MUST auto-display tutorial on first visit (no tutorial cookie present)
- **FR-035**: System MUST save tutorial completion status in browser cookie (365 day expiry)
- **FR-036**: System MUST provide manual tutorial re-enable option in settings
- **FR-037**: Tutorial MUST use shortened timer (30 seconds) instead of full 5 minutes
- **FR-038**: Tutorial MUST use fixed demo seed to ensure consistent experience

#### Accessibility & Compliance

- **FR-039**: System MUST display attribution to original creators (Tommy Maranges, Cory O'Brien, Mac Schubert)
- **FR-040**: System MUST display CC BY-NC-SA 4.0 license notice in footer
- **FR-041**: System MUST provide link to GitHub repository for issue reporting
- **FR-042**: System MUST work offline after initial load (no network requests during gameplay)
- **FR-043**: System MUST support keyboard navigation for all interactive elements
- **FR-044**: System MUST maintain minimum 4.5:1 color contrast for text

### Key Entities

- **Seed**: 4-letter uppercase string that determines all random game content
- **Game Mode**: Single-device, Multi-device, or Timer-only
- **Player Role**: Investigator, Suspect, or Spectator
- **Game State**: Current phase of game flow (10 total states from seed entry to conclusion)
- **Packet**: Themed question set containing name, difficulty, questions, and role variants
- **Question**: Interview question with primary/secondary type and example prompts
- **Role**: Character type (Human, Patient Robot, Violent Robot) with specific faults and traits
- **Penalty**: Behavioral action Suspect must perform when violating restriction
- **Background**: Suspect's character identity (e.g., "Reality TV Contestant")
- **Inducer Pattern**: Maze puzzle shown to Suspect before interview
- **Determination**: Investigator's final decision (Human or Robot)
- **Outcome**: Game result (Correct/Incorrect identification)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Two players can complete full game session (seed entry through conclusion) in under 10 minutes
- **SC-002**: Same seed produces identical game content on 100% of attempts across different devices
- **SC-003**: Players can synchronize multi-device game without verbal coordination errors in 90% of sessions
- **SC-004**: New players complete tutorial in under 5 minutes on 95% of attempts
- **SC-005**: 5-minute interview timer counts down accurately within 1 second of system clock
- **SC-006**: Application loads and becomes interactive in under 3 seconds on 3G connection
- **SC-007**: Application bundle size is under 500KB (gzipped)
- **SC-008**: Application achieves Lighthouse score above 90 for performance, accessibility, best practices
- **SC-009**: Application works offline after initial load without degradation
- **SC-010**: Secret role information is never accidentally revealed to wrong player in 100% of sessions
- **SC-011**: 90% of first-time users successfully complete their first game without errors
- **SC-012**: Seed validation catches 100% of invalid seed formats before game initialization
- **SC-013**: Players can restart game with different seed in under 5 seconds
- **SC-014**: Application meets WCAG 2.1 Level AA accessibility standards on automated testing
- **SC-015**: Zero network requests are made during gameplay (after initial page load)

## Assumptions

1. **Browser Support**: Assume modern evergreen browsers (Chrome, Firefox, Safari, Edge) with JavaScript enabled
2. **Screen Size**: Assume minimum viewport of 320px width (iPhone SE) for mobile support
3. **Player Coordination**: Assume players can verbally coordinate in multi-device mode (no built-in chat/voice)
4. **Physical Interaction**: Assume players can physically pass device in single-device mode
5. **Network**: Assume players have internet connection for initial load only, not during gameplay
6. **Time Sync**: Assume device clocks are accurate for UTC-based seed generation (±5 minute tolerance)
7. **Cookie Storage**: Assume cookies are enabled for tutorial persistence
8. **Local Storage**: Assume localStorage not required for MVP (future enhancement for notes/history)
9. **Audio**: Assume visual indicators sufficient, audio alerts optional enhancement
10. **Language**: Assume English language only for MVP (i18n future enhancement)

## Constraints

1. **Legal**: Must comply with CC BY-NC-SA 4.0 license (attribution, non-commercial, share-alike)
2. **Legal**: Cannot submit to app stores without original creator approval
3. **Legal**: Must credit original designers and illustrator in footer
4. **Technical**: Must be fully static (no server-side code, no database)
5. **Technical**: Must work offline after initial load (service worker optional)
6. **Technical**: Must use deterministic PRNG (seedrandom library)
7. **Performance**: Initial load must be under 3 seconds on 3G
8. **Performance**: Bundle size must be under 500KB gzipped
9. **Accessibility**: Must meet WCAG 2.1 Level AA standards
10. **Compatibility**: Must support browsers: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+, iOS Safari 14+, Chrome Android 90+

## Out of Scope (Future Enhancements)

1. URL seed parameter (e.g., `/game/ABCD`)
2. QR code generation for seed sharing
3. Game history (recent seeds played in localStorage)
4. Custom packet upload via JSON
5. Sound effects (timer beeps, role reveal)
6. Notes persistence (Investigator notes saved to localStorage)
7. Statistics tracking (games played, win rate)
8. Internationalization (multiple languages)
9. Dark mode theme toggle
10. Print-friendly views for questions/roles
11. Automated desync detection and correction
12. In-app chat or voice communication
13. Animated timer visualization (beyond basic countdown)
14. Mobile app version (iOS/Android native)
15. Social media sharing integration
