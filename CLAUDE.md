# Inhuman-Conditions Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-02-22

## Active Technologies
- Python 3.11+ (for PDF processing, image manipulation, pattern matching) (003-pdf-asset-extraction)
- Local filesystem (PDFs in `extraction/pdfs/`, extracted assets in `extraction/output/`, labels in `extraction/labels/`) (003-pdf-asset-extraction)
- TypeScript 5.x (strict mode enabled) + React 18, Zustand (state), Vite (build) (003-pdf-asset-extraction)
- Static PNG assets in `public/assets/cards/`, TypeScript data in `src/data/` (003-pdf-asset-extraction)

- TypeScript 5.3+ with strict mode enabled (001-seed-synced-game)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.3+ with strict mode enabled: Follow standard conventions

## Recent Changes
- 003-pdf-asset-extraction: Added TypeScript 5.x (strict mode enabled) + React 18, Zustand (state), Vite (build)
- 003-pdf-asset-extraction: Added Python 3.11+ (for PDF processing, image manipulation, pattern matching)
- 002-official-design-polish: Added [if applicable, e.g., PostgreSQL, CoreData, files or N/A]


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
