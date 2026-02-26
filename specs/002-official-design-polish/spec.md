# Feature Specification: Official Design Polish and Authentic Game Flow

**Feature Branch**: `002-official-design-polish`
**Created**: 2026-02-22
**Status**: Draft
**Input**: User description: "Polish MVP with official game design assets and proper game flow"

## Overview

Transform the MVP into an authentic Inhuman Conditions experience by extracting visual assets from official game PDFs, implementing the correct game flow from official rules, and applying the bureaucratic institutional aesthetic that defines the game's visual identity.

**Goals**:
1. Extract and incorporate fonts, images, vector graphics, and design patterns from official PDFs
2. Integrate typography from robots.management timer app
3. Fix game flow - timer starts AFTER role assignment and ready confirmation (not before)
4. Deep dive into robots.management official rules for authentic gameplay mechanics
5. Apply bureaucratic/institutional aesthetic: halftone patterns, monochrome design, geometric icons
6. Implement proper stage separation matching official rules
7. Match visual hierarchy and information architecture from official materials

## User Scenarios & Testing

### User Story 1 - Authentic Game Flow Stages (Priority: P1)

Players experience the correct game flow matching official Inhuman Conditions rules, where the interview timer only starts after both players have completed setup, know their roles, and confirmed readiness.

**Why this priority**: Critical for authentic gameplay. The current MVP starts the timer too early (during auto-advance), which breaks the game mechanics. Official rules require penalty calibration, role assignment, and ready confirmation BEFORE timing begins.

**Independent Test**: Can be tested by playing through the complete game flow and verifying that: (1) penalty calibration happens first, (2) roles are revealed second, (3) players confirm readiness third, (4) timer starts only after confirmation, and (5) each stage can be navigated at the players' pace.

**Acceptance Scenarios**:

1. **Given** a player has entered a valid seed, **When** they start the game, **Then** they see the penalty calibration stage with instructions and practice attempts
2. **Given** penalty calibration is complete, **When** the player advances, **Then** the Suspect sees their role (Human/Robot with specific fault) while Investigator sees waiting screen
3. **Given** both players have seen their role/instructions, **When** both indicate readiness, **Then** the 5-minute countdown timer starts and the interview begins
4. **Given** players are in penalty calibration stage, **When** they take time to discuss the penalty, **Then** no timer is running and they can proceed at their own pace
5. **Given** the Suspect is viewing their secret role, **When** they need time to understand their restrictions/tasks, **Then** the timer has not started yet

---

### User Story 2 - Official Visual Design System (Priority: P1)

Players see a game interface that matches the official Inhuman Conditions visual aesthetic extracted from Print & Play PDFs and website, featuring bureaucratic institutional styling with halftone patterns, monochrome color palette, and consistent typography hierarchy.

**Why this priority**: Visual authenticity is core to the Inhuman Conditions brand identity. Players expect the bureaucratic, dystopian aesthetic they know from the physical game. This establishes credibility and immersion.

**Independent Test**: Can be tested by comparing screenshots of the app against official PDF cards and robots.management website for visual consistency in color palette, typography, spacing, and overall aesthetic.

**Acceptance Scenarios**:

1. **Given** a player loads the application, **When** they view any screen, **Then** the color palette matches the official monochrome scheme (blacks, whites, muted grays) with high contrast
2. **Given** a player views question cards or role information, **When** they read the content, **Then** the typography hierarchy matches official PDFs (bold headers, regular body, consistent sizes)
3. **Given** a player navigates the interface, **When** they interact with cards and buttons, **Then** the design uses halftone dot patterns for texture and depth (matching PDF aesthetic)
4. **Given** a player views the game content, **When** they compare it to official materials, **Then** spacing, padding, and layout proportions feel consistent with the physical game
5. **Given** a player uses the interface, **When** they see interactive elements (buttons, cards, dividers), **Then** they use clean geometric shapes and subtle borders matching the bureaucratic style

---

### User Story 3 - Typography Integration from Official Sources (Priority: P2)

Players see text rendered in fonts matching the official game materials, creating visual consistency with the physical game and robots.management website.

**Why this priority**: Typography is a key component of visual identity. Using the correct fonts reinforces authenticity and shows attention to detail, but the game is functional without it (P2 instead of P1).

**Independent Test**: Can be tested by inspecting font families in the app and comparing against robots.management timer app and official PDFs to verify correct font usage.

**Acceptance Scenarios**:

1. **Given** the application loads, **When** fonts are rendered, **Then** headers use the same font family as robots.management timer app
2. **Given** a player views body text, **When** they read questions or role descriptions, **Then** the font matches the official PDF typography
3. **Given** fonts cannot be loaded (network failure), **When** the app falls back to system fonts, **Then** the fallback maintains similar visual hierarchy and readability
4. **Given** a player on a slow connection, **When** the page loads, **Then** fonts load progressively without causing layout shifts

---

### User Story 4 - Module Icons and Official Visual Elements (Priority: P2)

Players see geometric module icons (telephone, scissors, unicorn, etc.) and visual design elements extracted from official PDFs, enhancing the visual polish and brand consistency.

**Why this priority**: Icons and visual elements add polish and brand recognition. They're important for the complete experience but not critical for core gameplay (hence P2).

**Independent Test**: Can be tested by verifying that question packets display their corresponding module icons from official PDFs and that design elements (borders, dividers, decorative patterns) match official card layouts.

**Acceptance Scenarios**:

1. **Given** a player views the packet selection or questions, **When** they see packet information, **Then** each module displays its geometric icon (telephone for Small Talk, scissors for Problem Solving, etc.)
2. **Given** a player views cards or containers, **When** they see borders and dividers, **Then** these elements use the decorative patterns from official PDFs
3. **Given** a player navigates the interface, **When** they see section separators, **Then** visual dividers match the style from official game materials
4. **Given** icons and graphics are unavailable, **When** the app renders without them, **Then** the layout remains functional with text labels as fallback

---

### User Story 5 - Enhanced Visual Polish and Micro-interactions (Priority: P3)

Players experience smooth transitions, subtle animations, and polished micro-interactions that feel appropriate for the bureaucratic aesthetic without being distracting.

**Why this priority**: Nice-to-have polish that enhances the experience but isn't essential for authentic gameplay. Lower priority than getting the core flow and visual design right.

**Independent Test**: Can be tested by navigating through the game and observing transitions between states, button interactions, and card reveals for smooth, appropriate animations.

**Acceptance Scenarios**:

1. **Given** a player advances between game stages, **When** the screen transitions, **Then** transitions are smooth (fade, slide) and feel deliberate (not jarring)
2. **Given** a player reveals their secret role, **When** the role information appears, **Then** it animates in a way that builds anticipation (subtle fade/slide)
3. **Given** a player hovers over or interacts with buttons, **When** they provide input, **Then** visual feedback is immediate but subtle (matching bureaucratic aesthetic)
4. **Given** a player prefers reduced motion, **When** they have that accessibility setting enabled, **Then** animations are minimized or removed

---

### Edge Cases

- What happens when official PDF assets cannot be extracted or are corrupted?
- How does the app handle missing or unavailable fonts (web font loading failures)?
- What if a player tries to skip required stages (penalty calibration, role reveal) to start the timer early?
- How does the interface adapt if halftone patterns cause accessibility issues (low contrast)?
- What happens when module icons are missing for a specific packet?
- How does the design scale to very small screens (mobile) while maintaining visual consistency?
- What if a player needs high contrast mode that conflicts with the monochrome aesthetic?

## Requirements

### Functional Requirements

#### Game Flow and Stage Management

- **FR-001**: System MUST prevent the interview timer from starting until penalty calibration is completed
- **FR-002**: System MUST prevent the interview timer from starting until both players have viewed their role assignments
- **FR-003**: System MUST require explicit ready confirmation from both players before starting the timer
- **FR-004**: System MUST allow players to spend unlimited time on penalty calibration stage
- **FR-005**: System MUST allow the Suspect unlimited time to read and understand their secret role
- **FR-006**: System MUST display clear stage progression indicators showing current position in setup flow
- **FR-007**: System MUST implement the official penalty calibration flow: Investigator reads penalty, Suspect practices 3 times, both confirm understanding

#### Visual Design Assets

- **FR-008**: System MUST extract halftone dot patterns from official PDFs for use as background textures
- **FR-009**: System MUST use the monochrome color palette from official materials (blacks, whites, specific gray values)
- **FR-010**: System MUST extract and display module icons (geometric symbols) from official PDFs for all 11 question packets
- **FR-011**: System MUST apply typography hierarchy matching official PDF card layouts (header sizes, weights, spacing)
- **FR-012**: System MUST use decorative border and divider patterns extracted from official materials
- **FR-013**: System MUST maintain high visual contrast for accessibility while preserving the monochrome aesthetic

#### Typography and Fonts

- **FR-014**: System MUST use the same font family as robots.management timer app for all header text
- **FR-015**: System MUST use the same font family as official PDFs for body text and questions
- **FR-016**: System MUST provide fallback fonts that maintain similar visual hierarchy if web fonts fail to load
- **FR-017**: System MUST prevent font-loading from causing layout shifts during page load

#### Visual Elements and Icons

- **FR-018**: System MUST display the correct module icon for each question packet (telephone, scissors, unicorn, bicycle, sprout, heart, rose, snake, devil, mirror, water spout)
- **FR-019**: System MUST use vector formats for icons to ensure crisp rendering at all sizes
- **FR-020**: System MUST provide text fallbacks if icon graphics are unavailable

#### Visual Polish and Interactions

- **FR-021**: System MUST implement smooth transitions between game stages (fade or slide animations)
- **FR-022**: System MUST provide visual feedback for button interactions matching the bureaucratic aesthetic
- **FR-023**: System MUST respect user's reduced motion preferences and disable animations accordingly
- **FR-024**: System MUST use subtle animations for role reveals and secret information display

### Key Entities

**Design Assets Collection**: Represents the extracted visual elements from official PDFs, including halftone patterns (images), module icons (vector graphics), typography specifications (font families, sizes, weights), color values (hex codes for monochrome palette), and layout measurements (spacing, padding, borders)

**Game Stage**: Represents a distinct phase in the setup process (Penalty Calibration, Role Assignment, Ready Confirmation) with properties including stage name, completion status, required actions, and whether timer should be running

**Visual Theme**: Represents the bureaucratic aesthetic configuration including color palette values, typography hierarchy rules, spacing system, icon mappings, and animation preferences

## Success Criteria

### Measurable Outcomes

- **SC-001**: Players can complete penalty calibration at their own pace without time pressure (no timer running during this stage)
- **SC-002**: 100% of players see their role assignment BEFORE the interview timer starts
- **SC-003**: Visual comparison shows 90%+ consistency with official PDF card layouts in terms of color palette, typography, and spacing
- **SC-004**: Font loading completes within 2 seconds on standard connections without causing layout shifts
- **SC-005**: All 11 module icons display correctly and are recognizable as matching the official game materials
- **SC-006**: Players with reduced motion preferences experience the full game without animations
- **SC-007**: Game maintains WCAG AA contrast ratios while using the monochrome color palette
- **SC-008**: Transitions between game stages feel smooth and deliberate (subjective: "not jarring" feedback from 80% of testers)
- **SC-009**: Players report the app "looks and feels like the official game" (subjective: 80%+ agreement in user testing)
- **SC-010**: All game stages are navigable at the players' preferred pace (no forced timing outside the interview itself)

## Assumptions

1. **Asset Extraction**: Official game PDFs are available and can be legally used for extracting design assets under CC BY-NC-SA 4.0 license
2. **Font Licensing**: Fonts used on robots.management are either freely available or can be legally included in the web app (will verify during implementation)
3. **Browser Support**: Modern browsers support web fonts, vector graphics (SVG), and CSS features needed for halftone patterns
4. **File Size**: Extracted assets (fonts, images, icons) will have reasonable file sizes (<2MB total) for web delivery
5. **Visual Consistency**: The "bureaucratic institutional aesthetic" can be achieved with CSS and web-safe techniques without requiring complex image processing
6. **Game Flow**: The official rules as described on robots.management represent the canonical game flow to be implemented
7. **Stage Timing**: Players prefer to control their own pacing through setup stages rather than having forced delays or automatic progression
8. **Accessibility**: The monochrome aesthetic can coexist with WCAG AA compliance through careful contrast management

## Dependencies

- Access to official Inhuman Conditions PDF files for asset extraction
- Analysis of robots.management website for typography and font identification
- Review of official game rules for canonical game flow specifications
- Design tools for extracting colors, fonts, patterns from PDFs (e.g., PDF viewers, image editors, color pickers)

## Out of Scope

- Creating new visual designs that deviate from official materials
- Implementing the full tutorial system (this is a separate user story from the previous spec)
- Multi-device synchronization features (future work)
- Animated character illustrations or complex graphics beyond what exists in official materials
- Sound effects or audio design
- Internationalization or multiple language support
- Custom theme creator or user-selectable color schemes
