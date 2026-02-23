# Implementation Plan: PDF Asset Integration

**Branch**: `003-pdf-asset-extraction` | **Date**: 2026-02-23 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-pdf-asset-extraction/spec.md`

**Note**: Extraction phase (US1-US4) is **COMPLETE**. 225 assets extracted and validated. This plan covers **integration phase only** (US5).

## Summary

**Primary Requirement**: Integrate 225 extracted PDF card images into TypeScript game data structures so players see official game components instead of custom UI widgets.

**Technical Approach**:
- Update TypeScript interfaces to include `cardImage` field paths
- Map extracted assets to game data (catalyzer cards, investigator questions, backgrounds, penalties)
- Update React components to display card images instead of building custom widgets
- Reduce UI complexity by using official game design directly

**Current Status**:
- ✅ 99 suspect cards extracted (33 human, 33 patient, 33 violent)
- ✅ 77 investigator cards extracted (11 cover, 33 primary, 33 secondary)
- ✅ 30 background cards + 18 penalty cards + 1 form extracted
- ✅ All assets copied to `public/assets/cards/` subdirectories
- ✅ Validation report generated showing 100% extraction success
- 🔄 TypeScript integration **IN PROGRESS**

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode enabled)
**Primary Dependencies**: React 18, Zustand (state), Vite (build)
**Storage**: Static PNG assets in `public/assets/cards/`, TypeScript data in `src/data/`
**Testing**: Vitest for unit tests, React Testing Library for components
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge), mobile responsive
**Project Type**: Web application (single-page React app)
**Performance Goals**: Bundle size < 500KB gzipped (constitution), card images lazy-loaded
**Constraints**: No network requests (offline-capable), 100% test coverage for game logic, WCAG AA compliance
**Scale/Scope**: 225 card images (~50MB total), 11 game modules, ~15 TypeScript data files to update

**Existing Codebase**:
- `src/data/catalyzerCards.ts` - 10 placeholder cards (need to add `cardImage` field)
- `src/data/packets.ts` - 3 modules with manually written questions (need `questionCardImage` fields)
- `src/data/backgrounds.ts` - 30 backgrounds (complete, optional image addition)
- `src/data/penalties.ts` - 18 penalties (complete, optional image addition)
- `src/components/` - React UI components that build custom widgets (need to display card images instead)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Legal Compliance ✅
- All extracted content from official Inhuman Conditions PDFs (licensed by creators)
- Attribution maintained in game footer
- No commercial use
- CC BY-NC-SA 4.0 compliance maintained

### Test-First Development ✅
- Unit tests for card image path mapping utilities
- Integration tests for UI components displaying card images
- Visual regression tests optional (but recommended for card display)
- 100% coverage for new mapping logic

### Accessibility ✅
- Card images require `alt` text describing content
- Keyboard navigation for card viewing
- Screen reader support for card descriptions
- Minimum contrast ratios maintained (4.5:1)

### No Network Dependencies ✅
- All assets bundled locally in `public/assets/cards/`
- No CDN or external image URLs
- Fully offline-capable after initial load

### Separation of Game Logic from UI ✅
- Card image paths are data (stored in `src/data/`)
- UI components are pure views (render card images from props)
- No game logic in React components
- Integration layer in `src/hooks/` if needed

**GATE RESULT**: ✅ **PASSED** - No violations, all gates satisfied

## Project Structure

### Documentation (this feature)

```text
specs/003-pdf-asset-extraction/
├── spec.md                    # Feature specification (complete)
├── plan.md                    # This file (IN PROGRESS)
├── research.md                # Phase 0 (SKIP - tech stack known)
├── data-model.md              # Phase 1 (integration data model)
├── contracts/                 # Phase 1 (TypeScript interface contracts)
│   ├── catalyzer-card.ts     # Updated CatalyzerCard interface
│   ├── packet.ts             # Updated Packet and Question interfaces
│   └── card-images.ts        # Card image path mapping utilities
├── quickstart.md              # Phase 1 (integration quickstart guide)
└── tasks.md                   # Phase 2 (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── data/                      # Game data (TypeScript)
│   ├── catalyzerCards.ts      # UPDATE: Add cardImage paths (99 cards)
│   ├── packets.ts             # UPDATE: Add questionCardImage, coverSheetImage
│   ├── backgrounds.ts         # UPDATE (optional): Add image paths
│   └── penalties.ts           # UPDATE (optional): Add image paths
│
├── types/                     # TypeScript interfaces
│   ├── catalyzer.ts           # UPDATE: CatalyzerCard interface
│   └── packet.ts              # UPDATE: Question, Packet interfaces
│
├── components/                # React UI components
│   ├── cards/                 # NEW: Card display components
│   │   ├── CatalyzerCardImage.tsx
│   │   ├── QuestionCardImage.tsx
│   │   └── BackgroundCardImage.tsx
│   └── game/                  # EXISTING: Update to use card images
│       ├── RoleReveal.tsx     # Display catalyzer card image
│       └── InterviewPhase.tsx # Display question card images
│
├── utils/                     # Utility functions
│   └── cardImagePaths.ts      # NEW: Card image path mapping helpers
│
└── hooks/                     # React hooks (integration layer)
    └── useCardImages.ts       # NEW: Hook for lazy-loading card images

tests/
├── unit/
│   └── utils/
│       └── cardImagePaths.test.ts  # Test card path mapping
└── integration/
    └── components/
        └── CatalyzerCardImage.test.tsx  # Test card display

public/assets/cards/           # Extracted PNG assets (COMPLETE)
├── suspect/                   # 99 suspect card images
├── investigator/              # 77 investigator card images
├── backgrounds/               # 30 background images
├── penalties/                 # 18 penalty images
└── forms/                     # 1 investigator form image

extraction/                    # Extraction tool (COMPLETE)
├── data/output/               # Original extracted PNGs
├── reports/
│   └── validation_report.html # Validation report
└── typescript_integration_guide.md  # Integration guide (reference)
```

**Structure Decision**: Single-page React web app with data-driven architecture. Game data in `src/data/` drives UI components. Card images stored in `public/assets/cards/` and referenced by path in TypeScript data structures.

## Complexity Tracking

**No violations** - Constitution gates all satisfied. Integration adds no new complexity beyond standard TypeScript interface updates and React component refactoring.

---

## Phase 0: Research & Technology Decisions

### Decision: Skip Research Phase

**Rationale**: Technology stack is already established and proven:
- TypeScript interfaces for data structures (existing)
- React components for UI (existing)
- Static asset hosting in `public/` (Vite standard)
- Image lazy-loading (native browser support)

**No unknowns to research** - all integration patterns are standard React/TypeScript practices.

---

## Phase 1: Design & Contracts

### Data Model

See [data-model.md](data-model.md) for complete entity definitions.

**Key Entities**:

1. **CatalyzerCard** (updated)
   - Add `cardImage?: string` field (path to full card PNG)
   - Example: `"/assets/cards/suspect/01_small_talk_suspect_p2_c01_patient-card.png"`

2. **Question** (updated)
   - Add `cardImage?: string` field (path to question card PNG)
   - Example: `"/assets/cards/investigator/01_small_talk_investigator_p2_c01_primary-prompts.png"`

3. **Packet** (updated)
   - Add `coverSheetImage?: string` field (path to cover sheet PNG)
   - Example: `"/assets/cards/investigator/01_small_talk_investigator_p1_c01_cover-sheet.png"`

4. **Background** (optional update)
   - Add `image?: string` field (path to background card PNG)

5. **Penalty** (optional update)
   - Add `image?: string` field (path to penalty card PNG)

### Interface Contracts

See [contracts/](contracts/) for TypeScript interface definitions.

**Primary Interfaces**:

```typescript
// contracts/catalyzer-card.ts
export interface CatalyzerCard {
  id: string;
  packetId: string;
  roleType: RoleType;
  fault?: RobotFault;
  description: string;
  traits?: string[];
  restrictions?: string[];
  tasks?: string[];
  inducerMazeImage: string;
  inducerSolution?: string;
  cardImage?: string;  // NEW: Full card image path
}

// contracts/packet.ts
export interface Question {
  id: string;
  type: 'primary' | 'secondary';
  text: string;
  examples: string[];
  cardImage?: string;  // NEW: Question card image path
}

export interface Packet {
  id: string;
  name: string;
  difficulty: string;
  icon: string;
  prompt: string;
  questions: Question[];
  roles: PacketRole[];
  coverSheetImage?: string;  // NEW: Cover sheet image path
}
```

### Integration Quickstart

See [quickstart.md](quickstart.md) for developer guide with code examples.

**Integration Steps**:
1. Update TypeScript interfaces (add `cardImage` fields)
2. Add image paths to data files (`catalyzerCards.ts`, `packets.ts`)
3. Create card display components (`CatalyzerCardImage.tsx`, etc.)
4. Update game UI to use card images instead of custom widgets
5. Add unit tests for card path mapping
6. Add integration tests for card display
7. Run TypeScript compilation and verify 0 errors
8. Test game in browser and verify cards display correctly

---

## Phase 2: Implementation

**See [tasks.md](tasks.md)** - Generated by `/speckit.tasks` command (not created by `/speckit.plan`).

**Expected Task Breakdown**:
- Setup: TypeScript interface updates
- Tests: Unit tests for card path utilities, integration tests for card display
- Core: Update data files with card image paths
- Components: Create card display components, update game UI
- Integration: Wire up card images in game flow
- Polish: Accessibility, performance optimization, visual regression tests

---

## Deployment Notes

### Pre-Integration Checklist
- [ ] All 225 assets present in `public/assets/cards/`
- [ ] Validation report reviewed (100% extraction success)
- [ ] TypeScript interfaces updated with `cardImage` fields
- [ ] Integration guide reviewed (`extraction/typescript_integration_guide.md`)

### Integration Checklist
- [ ] All data files updated with card image paths
- [ ] Card display components implemented
- [ ] Game UI updated to use card images
- [ ] Unit tests written and passing (100% coverage for utilities)
- [ ] Integration tests written and passing
- [ ] TypeScript compilation succeeds (0 errors)
- [ ] Accessibility tests pass (WCAG AA compliance)
- [ ] Visual review: Cards display correctly in game

### Post-Integration Verification
- [ ] Game runs without errors
- [ ] Suspect sees official catalyzer card image (not custom widget)
- [ ] Investigator sees question card images
- [ ] All 11 modules work correctly
- [ ] Performance targets met (bundle size < 500KB gzipped)
- [ ] Offline mode works (all assets bundled)

---

## Risk Assessment

### Risk 1: Bundle Size Increase
**Risk**: 225 card images (~50MB) may exceed bundle size target (500KB gzipped)
**Impact**: Slower initial load, failed Lighthouse performance score
**Mitigation**:
- Use lazy-loading for card images (load on demand)
- Optimize PNG compression (use tools like `pngquant`)
- Consider WebP format for smaller file sizes
- Only load cards for current game module (not all 225 upfront)

### Risk 2: Mobile Performance
**Risk**: Large card images may cause performance issues on mobile devices
**Impact**: Slow rendering, janky UI, poor user experience on phones
**Mitigation**:
- Use responsive image sizing (smaller images on mobile)
- Implement image caching strategy
- Test on actual mobile devices (iOS Safari, Chrome Android)
- Monitor performance metrics (Time to Interactive)

### Risk 3: Accessibility Impact
**Risk**: Card images may not be readable by screen readers or have poor contrast
**Impact**: WCAG AA compliance failure, excludes vision-impaired users
**Mitigation**:
- Add descriptive `alt` text for all card images
- Ensure text on cards meets contrast requirements
- Provide text fallback for critical information
- Test with screen readers (NVDA, VoiceOver)

### Risk 4: Breaking Existing Functionality
**Risk**: Refactoring UI to use card images may break existing game flow
**Impact**: Game crashes, incorrect state transitions, unplayable game
**Mitigation**:
- Comprehensive integration tests for game flow
- Manual testing of all game phases
- Keep existing UI as fallback during development
- Gradual rollout (one component at a time)

---

## Success Metrics

### Technical Metrics
- TypeScript compilation: 0 errors ✅
- Test coverage: 100% for card utilities, 80%+ for components ✅
- Bundle size: < 500KB gzipped (excluding lazy-loaded images) ✅
- Lighthouse score: > 90 ✅

### Functional Metrics
- All 99 catalyzer cards display correct card images ✅
- All 77 investigator question cards display correctly ✅
- Backgrounds and penalties optional (visual enhancement) ✅
- Game flow unaffected (all existing tests pass) ✅

### User Experience Metrics
- Card images render within 500ms (lazy-loaded) ✅
- Card text readable at mobile sizes (min 16px font) ✅
- Screen reader announces card content correctly ✅
- Keyboard navigation works for card viewing ✅

---

## References

**Extraction Work**:
- Validation report: `extraction/reports/validation_report.html`
- Integration guide: `extraction/typescript_integration_guide.md`
- Extracted assets: `public/assets/cards/` (225 PNGs)

**Existing Code**:
- Data structures: `src/data/catalyzerCards.ts`, `src/data/packets.ts`
- Type definitions: `src/types/catalyzer.ts`, `src/types/packet.ts`
- UI components: `src/components/game/`

**Constitution**:
- Constitution file: `.specify/memory/constitution.md`
- Key principles: Test-first, no network, WCAG AA, offline-capable

---

## Phase 1: Design & Contracts - COMPLETE ✅

**Generated Artifacts**:
- ✅ [data-model.md](data-model.md) - Integration data model with 5 entity definitions
- ✅ [contracts/catalyzer-card.ts](contracts/catalyzer-card.ts) - Updated CatalyzerCard interface with cardImage field
- ✅ [contracts/packet.ts](contracts/packet.ts) - Updated Question and Packet interfaces
- ✅ [contracts/card-images.ts](contracts/card-images.ts) - Card image path mapping utilities
- ✅ [quickstart.md](quickstart.md) - Developer integration guide with code examples
- ✅ Agent context updated (CLAUDE.md) with new technology stack

**Key Design Decisions**:
1. All image fields are optional (`?`) for backward compatibility
2. UI components check for `cardImage` presence before rendering
3. Fallback to custom widgets when `cardImage` is undefined
4. Utility functions generate consistent asset paths from entity metadata
5. Lazy-loading strategy for images to maintain bundle size < 500KB

---

**Status**: ✅ Phase 0 complete (research skipped - no unknowns)
**Status**: ✅ Phase 1 complete (data model, contracts, quickstart generated)
**Next**: Phase 2 - Implementation (use `/speckit.tasks` to generate task breakdown)
