# Inhuman Conditions: Implementation Discrepancy Report

**Date**: 2026-02-22
**Current Implementation**: MVP with content cycling feature
**Official Source**: robots.management PDFs and official game rules

---

## Executive Summary

The current implementation has **critical discrepancies** with the official Inhuman Conditions game rules. The most severe issues are:

1. **Suspect never sees their role/restrictions before the timer starts**
2. **Inducer puzzle (maze) is completely missing**
3. **Robot restrictions are placeholder text, not actual game restrictions**
4. **Game flow order violates official sequence**

---

## Critical Discrepancies

### 1. **MISSING: Role Reveal Phase for Suspect**

**Official Rules**:
- After penalty calibration, Suspect privately views their Robot Catalyzer card
- Suspect reads and understands their restrictions BEFORE any timer starts
- This is a separate, untimed phase where Suspect prepares their strategy
- In the official game, there's a "Robot Catalyzer" card that the Suspect draws and reads

**Current Implementation**:
- NO separate role reveal phase exists
- Suspect role is selected during `RoleSelection` state (lines 136-137 in GameStateMachine.tsx), which auto-advances in 300ms
- Suspect first sees their role DURING the interview (SuspectView.tsx:49-100)
- Role is hidden behind a "Show Role" button during the timed interview
- User explicitly stated: "The Suspect has no opportunity to read their restriction/role"

**Impact**: **CRITICAL** - Suspect enters timed interview without knowing what restrictions they must follow. This fundamentally breaks the game.

**Files Affected**:
- `src/components/GameStateMachine.tsx:136-137` - RoleSelection auto-advances
- `src/components/game/Interview/SuspectView.tsx` - Only place role is shown
- **MISSING**: No `RoleReveal` or `RobotCatalyzer` component

---

### 2. **MISSING: Inducer Pattern (Maze Puzzle)**

**Official Rules**:
- Robot players must solve an "Inducer Pattern" (maze puzzle) DURING the interview
- The Inducer pattern is a 5x5 grid with directional connections
- Robots must navigate the maze and report the solution path
- This is a core mechanic that helps Investigators identify robots
- The maze appears on the Robot Catalyzer card

**Current Implementation**:
- Inducer puzzle state exists (`GameState.InducerPuzzle`) but has NO UI
- Lines 137-146 in GameStateMachine.tsx show it just displays "Setting up your game..." and auto-advances
- User explicitly stated: "There is no maze"
- `src/lib/inducerPattern.ts` generates patterns but they're never displayed
- `src/lib/inducerPattern.test.ts` tests pattern generation, but no component uses it

**Impact**: **CRITICAL** - Removes a core game mechanic. Investigators have no behavioral marker to identify robots.

**Files Affected**:
- `src/components/GameStateMachine.tsx:137-146` - Auto-advances, no UI
- **MISSING**: No `InducerPuzzle` component
- `src/lib/inducerPattern.ts` - Generated but unused during gameplay

---

### 3. **BROKEN: Robot Restrictions are Placeholders**

**Official Rules**:
- Each Robot role has specific, detailed restrictions on what they can/cannot say
- Example restrictions from official cards:
  - "Cannot use words with the letter 'C'"
  - "Cannot answer with more than 5 words"
  - "Cannot make eye contact"
  - "Cannot acknowledge the interviewer's questions directly"
- Restrictions are the core challenge - Robots must avoid triggering them

**Current Implementation**:
- Hardcoded placeholder: `restrictions: ['Cannot mention certain topics']` (ContentSelector.ts:177, 241)
- User explicitly stated: "The Suspect restrictions are not elaborated"
- This placeholder appears for ALL patient robots regardless of their fault
- No actual restriction rules are defined in `src/data/packets.ts`

**Impact**: **CRITICAL** - The core tension of the game (can the Robot follow restrictions?) is missing.

**Files Affected**:
- `src/engine/ContentSelector.ts:177` - Hardcoded placeholder
- `src/engine/ContentSelector.ts:241` - Hardcoded placeholder
- `src/data/packets.ts` - PacketRole interface has no restrictions field
- `src/types/role.ts:45` - RoleAssignment has `restrictions?: string[]` but it's never populated with real data

---

### 4. **WRONG: Game Flow Order**

**Official Flow** (from robots.management rules):
```
1. Seed/Setup Entry
2. Module (Packet) Selection
3. Background Selection
4. Penalty Calibration (3 practice attempts) ← UNTIMED
5. Investigator Reviews Prompts ← UNTIMED, manual advance
6. Suspect Views Robot Catalyzer (if robot) ← UNTIMED
7. Cover Sheet Reading ← Investigator decides when ready
8. START TIMER ← Manual button click
9. Interview (5 minutes) ← Robot Inducer activates HERE
10. Determination
```

**Current Flow** (from GameStateMachine.tsx):
```
1. SeedEntry
2. ModeSelection (auto: 300ms)
3. RoleSelection (auto: 300ms) ← Suspect never sees role
4. PenaltyCalibration (manual: 3 attempts)
5. PacketDisplay (manual confirmation)
6. InducerPuzzle (auto: 300ms) ← No UI, just auto-advance
7. BackgroundDisplay (manual confirmation)
8. ReadyToStart (manual: Start Interview button)
9. START TIMER ← Happens too late, Suspect unprepared
10. Interview (5 minutes)
11. Conclusion
```

**Discrepancies**:
- Penalty calibration happens AFTER role selection (should be before Suspect sees role)
- No separate "Investigator Review" phase
- No separate "Suspect Role Reveal" phase
- Inducer puzzle is skipped
- Timer starts before Suspect has read their restrictions

**Impact**: **HIGH** - Game flow doesn't match official rules, creates confusion

**Files Affected**:
- `src/components/GameStateMachine.tsx` - Entire state machine order
- `src/types/game-state.ts` - State enum order

---

## Major Discrepancies

### 5. **Penalty Calibration: Placement is Wrong**

**Official Rules**:
- Penalty calibration happens BEFORE Suspect knows if they're human or robot
- Investigator sees how penalty looks when performed naturally (helps establish baseline)
- Happens during Form VK-82(e) pre-round checklist

**Current Implementation**:
- Penalty calibration is state #4 (after RoleSelection)
- In single-device mode, shows Suspect view (correct per current order)
- But if role is already selected, Suspect knows their role during calibration

**Impact**: **MEDIUM** - Affects game balance, but game is still playable

---

### 6. **MISSING: Cover Sheet Reading**

**Official Rules**:
- Before timer starts, Investigator reads a "Cover Sheet" out loud
- This is page 1 of the Investigator Prompts
- Sets the scene and context for the interview
- Suspect hears this before timer starts

**Current Implementation**:
- No cover sheet component exists
- No text is read before interview starts
- `ReadyToStart` component just shows "Start Interview" button

**Impact**: **MEDIUM** - Missing narrative/immersion element

**Files Affected**:
- **MISSING**: No cover sheet text or reading phase

---

### 7. **MISSING: Form VK-82(e) Pre-Round Checklist**

**Official Rules**:
- Form VK-82(e) is an explicit preparatory checklist
- Ensures both players understand rules before timed pressure begins
- Items include: penalty calibration, name recording, module selection, background confirmation

**Current Implementation**:
- No formal checklist exists
- Players navigate through states but no confirmation they understand the rules

**Impact**: **LOW** - Quality-of-life feature, not core gameplay

---

### 8. **Determination Mechanism: Missing Official Forms**

**Official Rules**:
- Investigator uses "two stamps" to make determination
- Physical game has Determination Form with stamps
- Explicit "Human" vs "Violent Robot" vs "Patient Robot" choices

**Current Implementation**:
- Simple "Human" or "Robot" buttons (Conclusion.tsx)
- Doesn't distinguish between Patient Robot and Violent Robot
- No stamp/form metaphor

**Impact**: **LOW** - UI aesthetic choice, doesn't affect core gameplay

---

## Minor Discrepancies

### 9. **Name Recording Missing**

**Official Rules**:
- Investigator asks "Could you state your name for the record?" before timer starts
- Part of Form VK-82(e) checklist

**Current Implementation**:
- No name recording step
- Background has a `name` field but it's not explicitly recorded

**Impact**: **LOW** - Minor immersion detail

---

### 10. **Module Icons: Not Matching Official Design**

**Official Icons** (from research.md):
- Telephone, Scissors, Unicorn, Tandem Bicycle, Sprout, Heart, Rose, Snake, Devil, Mirror, Water Spout
- Specific geometric/symbolic designs from official PDFs

**Current Implementation**:
- Using emoji placeholders: 📞, ✂️, 🦄, etc. (packets.ts)
- Not the official icon designs

**Impact**: **LOW** - Aesthetic issue, doesn't affect gameplay

---

### 11. **Background Description Not Always Shown**

**Official Rules**:
- Background cards have detailed character descriptions
- Suspect embodies this character during interview

**Current Implementation**:
- Backgrounds have descriptions (backgrounds.ts)
- BackgroundDisplay.tsx shows name and description (lines 29-30 in SuspectView.tsx)
- ✅ This is actually implemented correctly

**Impact**: **NONE** - Already correct

---

## Data Completeness Issues

### 12. **Incomplete Robot Catalyzer Data**

**Official Game Content** (from robots.management):
- 60 Robot Catalyzer cards total
- Each robot type (Patient/Violent) has multiple catalyzer variants per module
- Each catalyzer has specific restrictions and behaviors

**Current Implementation**:
- Only 2-3 robot variants per packet defined (packets.ts)
- No detailed restriction rules
- Example from packets.ts lines 60-81: only 3 roles defined for Small Talk packet

**Impact**: **MEDIUM** - Limited replayability, not enough variety

---

### 13. **Question Types: Secondary Questions Underused**

**Official Rules**:
- Investigator Prompts have Primary Questions (must ask) and Secondary Questions (optional)
- Primary questions advance the core investigation
- Secondary questions probe deeper

**Current Implementation**:
- Questions have `type: 'primary' | 'secondary'` field (packets.ts:10)
- But there's no UI distinction or enforcement
- InvestigatorView.tsx shows all questions equally

**Impact**: **LOW** - Minor UX improvement needed

---

## Architecture/Code Issues

### 14. **Single-Device Mode: Passing Device is Awkward**

**Official Game**:
- Physical cards are private - Investigator can't see Robot Catalyzer
- Digital implementation using "pass device" is necessary but awkward

**Current Implementation**:
- Single-device mode shows both views on same screen (GameStateMachine.tsx:117-127)
- "Pass device to Suspect" message shown (line 122)
- This is technically correct but UX could be better

**Impact**: **LOW** - Inherent limitation of digital single-device implementation

---

### 15. **Timer: No Warning at 1 Minute Remaining**

**Official Rules**:
- Many implementations give a warning at 1 minute remaining
- Helps players pace the interview

**Current Implementation**:
- CountdownTimer component shows time but no audio/visual warning

**Impact**: **LOW** - Nice-to-have feature

---

## Summary of Critical Issues

### Must Fix (Game-Breaking):
1. ❌ **No Role Reveal Phase** - Suspect enters interview without seeing restrictions
2. ❌ **No Inducer Puzzle UI** - Core robot identification mechanic missing
3. ❌ **Placeholder Restrictions** - Actual robot restrictions not implemented

### Should Fix (Significantly Impacts Gameplay):
4. ⚠️ **Wrong Flow Order** - Doesn't match official sequence
5. ⚠️ **No Cover Sheet** - Missing narrative setup
6. ⚠️ **Incomplete Robot Data** - Need full catalyzer cards with real restrictions

### Could Fix (Quality-of-Life):
7. 🔵 **No Form VK-82(e)** - No formal checklist
8. 🔵 **No Name Recording** - Minor immersion detail
9. 🔵 **Emoji Icons** - Should use official geometric designs

---

## Recommended Fix Priority

### Phase 1: Critical Gameplay Fixes
1. Implement Role Reveal component (shows Robot Catalyzer BEFORE timer)
2. Implement Inducer Puzzle UI (display maze, accept solution input)
3. Add real restriction rules to robot data
4. Reorder game states to match official flow

### Phase 2: Complete Robot Mechanics
5. Expand robot catalyzer data (60 cards total)
6. Implement restriction checking/penalty triggers
7. Add cover sheet reading phase

### Phase 3: Polish
8. Form VK-82(e) checklist
9. Replace emoji icons with official geometric designs
10. Timer warnings
11. Distinction between Patient/Violent robots in determination

---

## Files Requiring Changes

### New Components Needed:
- `src/components/game/RoleReveal.tsx` - Show Robot Catalyzer to Suspect
- `src/components/game/InducerPuzzleDisplay.tsx` - Show maze and collect solution
- `src/components/game/CoverSheet.tsx` - Display cover sheet text

### Major Modifications Needed:
- `src/components/GameStateMachine.tsx` - Reorder states, add Role Reveal and Inducer UI
- `src/engine/ContentSelector.ts` - Remove placeholder restrictions, use real data
- `src/data/packets.ts` - Add restriction rules to PacketRole definitions
- `src/types/game-state.ts` - Possibly add new states for Cover Sheet reading

### Data Expansion Needed:
- Expand robot catalyzer definitions (currently ~20, need 60+)
- Add actual restriction text for each robot type
- Define restriction-checking logic

---

## Conclusion

The current implementation is a functional MVP but **deviates significantly from official Inhuman Conditions rules**. The three critical issues are:

1. **Suspect never sees their role before the timer starts** (game-breaking)
2. **Inducer maze puzzle is completely missing** (removes core mechanic)
3. **Robot restrictions are placeholder text** (removes core challenge)

These issues make the current implementation **not a faithful adaptation** of the official game. Players familiar with the physical game would be confused and frustrated.

**Recommendation**: Prioritize implementing the Role Reveal phase, Inducer puzzle UI, and real restriction data before any further feature development.
