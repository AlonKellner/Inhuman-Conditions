# Inhuman Conditions - robots.management Asset Documentation

## Overview
This document catalogs all available assets from the official Inhuman Conditions website (https://robots.management/) and the timer application (https://robots.management/timer/), along with findings from related open-source implementations.

**Last Updated:** February 22, 2026
**Investigation Status:** Partial - Timer page assets not fully accessible via web scraping

---

## 1. Timer Page Assets (https://robots.management/timer/)

### Audio Assets
**Status:** NOT DIRECTLY ACCESSIBLE

The timer page is described as a "Companion timer app to the Inhuman Conditions tabletop game" with audio cues for the Suspect player during the five-minute game format. However, the specific audio files could not be extracted via web scraping methods.

**Known Information:**
- The timer includes pre-recorded voice notifications
- Audio files are used to notify players of time milestones during gameplay
- Format likely: MP3 or OGG (web-standard audio formats)

**Recommendations for Asset Extraction:**
1. Use browser DevTools (F12) → Network tab → filter for "media" or "audio"
2. Play the timer and monitor network requests for audio file URLs
3. Look for files with extensions: `.mp3`, `.wav`, `.ogg`
4. Check browser cache after using the timer

### Design Assets

**Fonts:**
- **Primary Font:** Helvetica (TTF format) - Referenced but commented out in CSS
- **Fallback Font:** Arial, sans-serif
- **Font Configuration:**
  - Font kerning: disabled (`font-kerning: normal`)
  - Text rendering: `optimizeLegibility`
  - Letter spacing: `0px`
  - Font weight: Normal
  - Ligatures: disabled (`font-variant-ligatures: none`)
  - Anti-aliasing: enabled via webkit

**Images:**
- **Icon/Logo:** `https://inhumanconditions.com/webimg/icon.png`
  - Used in schema.org markup
  - Represents the game brand

**CSS Design Values:**
- Emphasis on clean typography rendering
- Optimized for cross-platform compatibility
- System font fallbacks for reliability

### Technical Implementation
**Status:** Source code not fully accessible

The timer page HTML was incomplete when scraped. Key elements missing:
- JavaScript timer logic
- Complete DOM structure
- Audio element declarations
- Full stylesheet links

---

## 2. Main Website Assets (https://robots.management/)

### SVG Graphics

**Header & Branding:**
- `./images/IC_header_4.svg` - Main header logo
- `./images/Cc.svg` - Creative Commons logo

**Decorative Elements:**
- `./images/needle_shadow.svg` - Decorative element
- `./images/form_graphic_dark.svg` - Newsletter form graphic
- `./images/arrows_white_no_border.svg` - Navigation arrows
- `./images/maze.svg` - Decorative maze element
- `./images/module.svg` - Module icon

**Category Icons (11 Total):**
Located in `./images/icons/`:
- `small_talk.svg`
- `creative.svg`
- `imagination.svg`
- `coop.svg`
- `hopes.svg`
- `body.svg`
- `grief.svg`
- `threat.svg`
- `moral.svg`
- `self.svg`
- `recognizing.svg`

**Alternative CDN Locations:**
These same icons are also hosted on CodePen:
- Base URL: `https://assets.codepen.io/184748/`
- Files: `small_talk.svg`, `creative.svg`, `imagination.svg`, `coop.svg`, `hopes.svg`, `body.svg`, `grief.svg`, `threat.svg`, `moral.svg`, `self.svg`

### Raster Images
- `./images/IHboxMockUpTransparent.png` - Product box mockup

### External Assets
- **Shopify Buy Button:** Storefront graphics hosted on `sdks.shopifycdn.com`
- **Store:** `inhuman-conditions-store.myshopify.com`

### Typography
- **Font Family:** Arial, sans-serif
- **No Self-Hosted Fonts:** Website relies on system fonts

### Color Palette

**Button Styling:**
- Primary button background: `#6f6b6b` (warm gray)
- Button hover/focus state: `#646060` (darker gray)
- Overall aesthetic: Neutral tones, bureaucratic/institutional feel

**Design Notes:**
The color scheme reflects the game's theme of "a chilling bureaucracy" with muted, institutional grays.

### Downloadable Game Resources

**Print-and-Play Materials (Dropbox-hosted):**
- Complete card set (PDF)
- Rulebook (PDF)
- Investigator forms (PDF)

**Remote Play Adaptation (locally hosted in `./icremote/`):**
- Adapted rules
- Quickstart guide
- Penalty file
- Background cards

**Game Modules (22 PDF files total):**
11 investigator prompt modules + 11 robot catalyzer modules, including:
- Small Talk
- Creative Problem Solving
- Imagination
- Cooperation
- Hopes & Dreams
- Body Language
- Grief
- Threat Assessment
- Moral Dilemmas
- Self-Awareness
- Recognition

**Digital Form:**
- VK-82 Electronic Form (Google Forms integration)

---

## 3. Licensing & Legal

### Creative Commons BY-NC-SA 4.0

**Official Statement:**
"Inhuman Conditions is available for free under Creative Commons license BY-NC-SA 4.0."

**License Requirements:**
1. **BY (Attribution):** Must credit original creators (Tommy Maranges and Cory O'Brien)
2. **NC (Non-Commercial):** Cannot use for commercial purposes
3. **SA (Share-Alike):** Derivative works must use the same CC BY-NC-SA 4.0 license

**What This Covers:**
- Print-and-play PDF materials
- Game rules and mechanics
- Card content
- Graphics files in the downloadable resources

**What's UNCLEAR:**
- Whether the web timer application assets fall under CC BY-NC-SA 4.0
- Whether the website design elements (CSS, SVG icons) are included
- Whether audio files from the timer are covered

**Recommendation:**
For web assets specifically (timer code, audio files, website SVG icons), contact the creators for explicit permission if you intend to use them.

### Creators
- **Tommy Maranges** - Also known for: Secret Hitler, Philosophy Bro
- **Cory O'Brien** - Also known for: Myths Retold, Monster Prom
- **Contact:** No direct contact information on website; newsletter signup available

---

## 4. Community Implementations (Open Source)

Several developers have created web implementations of Inhuman Conditions. These may contain useful reference implementations for timer functionality and game assets.

### GitHub Repositories

#### 1. dfabulich/inhuman-conditions-online
- **URL:** https://github.com/dfabulich/inhuman-conditions-online
- **Play at:** https://inhumanconditions.net
- **License:** CC BY-NC-SA 4.0 (game content)
- **Tech Stack:**
  - Frontend: Preact + HTM with hooks
  - Backend: Express + socket.io
  - All client code in single `index.html` file
- **Assets:** Contains `maze.svg`
- **Notes:** Minimal external assets, lean architecture

#### 2. bellicapax/inhuman-conditions
- **URL:** https://github.com/bellicapax/inhuman-conditions
- **Status:** Work in Progress (WIP)
- **Tech Stack:** Quasar Vue.js application
  - 49.3% JavaScript
  - 37.6% Vue
  - 7.9% CSS
- **Config:** Uses PostCSS (`.postcssrc.js`)
- **Assets:** Not documented in README; would require repository clone to examine

#### 3. FTWinston/RobotInterrogation
- **URL:** https://github.com/FTWinston/RobotInterrogation
- **Play at:** https://interrogation.ftwinston.com
- **Tech Stack:**
  - TypeScript (58.9%)
  - C# (39.4%)
  - HTML (1.2%)
  - CSS (0.5%)
- **Notes:** More complex implementation with backend; asset details not visible from repository overview

#### 4. abyss/Void-Kampff
- **URL:** https://github.com/abyss/Void-Kampff
- **Type:** Discord bot for playing Inhuman Conditions
- **Notes:** Different platform implementation

#### 5. copsnrobots.github.io
- **URL:** https://copsnrobots.github.io/
- **License:** Graphics from `cards` directory extracted from Inhuman Conditions Print & Play
- **Design:**
  - Background: black
  - Text: white
  - Font: 'Lucida Sans Typewriter', monospace
  - Max-width: 45em
- **Pages:** `suspect.html` and `investigator.html` for respective roles

---

## 5. Asset Extraction Techniques

### For Timer Audio Files

**Method 1: Browser DevTools (Recommended)**
1. Open https://robots.management/timer/ in Chrome/Firefox
2. Open DevTools (F12 or Right-click → Inspect)
3. Navigate to **Network** tab
4. Click **Media** filter (or type "audio" in filter)
5. Start the timer and let it play
6. Watch for audio file requests (`.mp3`, `.ogg`, `.wav`)
7. Right-click the audio file → Open in new tab → Save

**Method 2: Browser Cache Inspection**
1. Use the timer application
2. Navigate to browser cache directory
3. Search for audio files by extension or MIME type

**Method 3: Page Source Inspection**
1. Right-click → View Page Source
2. Search for: `<audio`, `.mp3`, `.ogg`, `.wav`, `new Audio(`, `HTMLAudioElement`
3. Find direct URLs to audio assets

### For Images and SVG Files

**Direct Download from Website:**
All SVG and PNG files listed in Section 2 can be accessed via:
- `https://robots.management/images/[filename].svg`
- `https://robots.management/images/icons/[filename].svg`
- `https://robots.management/images/[filename].png`

**Examples:**
- `https://robots.management/images/IC_header_4.svg`
- `https://robots.management/images/icons/small_talk.svg`
- `https://robots.management/images/IHboxMockUpTransparent.png`

### For CSS Design Tokens

**Method:**
1. Open website in browser
2. Right-click → Inspect
3. Go to **Elements** (Chrome) or **Inspector** (Firefox)
4. Select elements to view computed styles
5. Copy color values, font families, spacing values

**Key Tokens Identified:**
- Button colors: `#6f6b6b`, `#646060`
- Font: Arial, sans-serif
- Typography: Optimized for legibility with disabled kerning and ligatures

### For Fonts

**Helvetica Font (Timer Page):**
The timer page references `img/Helvetica.ttf` but it's commented out. To extract:
1. Check if URL `https://robots.management/timer/img/Helvetica.ttf` exists
2. If accessible, download directly
3. Note: Helvetica is a commercial font; using it may require proper licensing

**Recommendation:** Use Arial (specified fallback) or a similar sans-serif font to avoid licensing issues.

---

## 6. Recommended Approach for Implementation

### For Timer Functionality

**Option 1: Reference Community Implementations**
Clone one of the open-source repositories and examine their timer implementation:
```bash
git clone https://github.com/dfabulich/inhuman-conditions-online.git
# Examine index.html for timer logic
```

**Option 2: Build Custom Timer with Generic Assets**
- Implement 5-minute countdown timer
- Use royalty-free robot voice sound effects from:
  - [Mixkit](https://mixkit.co/free-sound-effects/robot/) - 36 free robot sound effects
  - [Zapsplat](https://www.zapsplat.com/sound-effect-category/robots/) - 160,000+ free robot sounds (MP3/WAV)
  - [Pixabay](https://pixabay.com/sound-effects/search/robot/) - Royalty-free, no attribution required
  - [Uppbeat](https://uppbeat.io/sfx/category/robot) - Free robot sound effects

**Option 3: Contact Creators for Timer Assets**
For the authentic robots.management timer audio files, reach out to Tommy Maranges or Cory O'Brien for permission to use or access the original audio assets.

### For Visual Design

**Use Available SVG Assets:**
All SVG files from robots.management can be downloaded and used under CC BY-NC-SA 4.0 (assuming they fall under the same license as game materials).

**Color Scheme:**
Implement the bureaucratic aesthetic with the identified color palette:
- Primary: `#6f6b6b`
- Hover/Active: `#646060`
- Background: Consider black or dark gray
- Text: White or light gray for contrast

**Typography:**
- Use Arial or similar system sans-serif fonts
- Apply the identified text rendering optimizations for clarity

### For Game Content

**Download Official PDFs:**
All print-and-play materials are freely available via Dropbox links on robots.management. These include:
- Complete rulebook
- All game cards
- Investigator forms
- Remote play adaptations

These are explicitly covered under CC BY-NC-SA 4.0.

---

## 7. Outstanding Questions

### Unanswered Asset Questions

1. **Timer Audio Files:**
   - What are the specific audio cues used?
   - What do the voice notifications say?
   - How many audio files are there?
   - What format (MP3, OGG, WAV)?

2. **Timer Code:**
   - Is the timer open source?
   - What JavaScript framework/library does it use?
   - Is there a public repository for it?

3. **License Scope:**
   - Do web assets (timer, website SVGs) fall under CC BY-NC-SA 4.0?
   - Can website design elements be reused for derivative works?
   - Are audio files explicitly covered by the license?

4. **Font Licensing:**
   - Is the Helvetica.ttf file legally redistributable?
   - Should implementations use Arial instead?

### Recommended Next Steps

1. **Manual Browser Inspection:**
   Visit https://robots.management/timer/ and use browser DevTools to capture audio file URLs during timer operation.

2. **Creator Contact:**
   Reach out to Tommy Maranges or Cory O'Brien via:
   - Newsletter contact on robots.management
   - Social media (search for their known projects)
   - BoardGameGeek forums
   - GitHub issue on one of the community implementations

3. **Community Resources:**
   Check for discussions about timer implementation in:
   - Reddit (r/boardgames, r/tabletop)
   - BoardGameGeek forums
   - Discord servers for tabletop gaming

4. **Alternative Implementation:**
   Rather than extracting assets, create original assets inspired by the game's aesthetic while maintaining the CC BY-NC-SA 4.0 spirit.

---

## 8. Attribution Template

If using assets from robots.management in your implementation, include this attribution:

```
Inhuman Conditions by Tommy Maranges and Cory O'Brien
Licensed under CC BY-NC-SA 4.0
Original game: https://robots.management/

[Specify which assets were used: e.g., "Game icons and color scheme
inspired by the official website" or "Audio concept based on the
official timer application"]
```

---

## 9. Summary of Extractable Assets

### Fully Accessible
- ✅ SVG icons (11 category icons + decorative elements)
- ✅ PNG product mockup
- ✅ CSS color values (#6f6b6b, #646060)
- ✅ Typography specifications (Arial, sans-serif with specific rendering)
- ✅ Print-and-play PDF materials (via Dropbox)
- ✅ Game module PDFs

### Partially Accessible
- ⚠️ Timer page design (limited CSS information)
- ⚠️ Website layout structure (can be inspected but not documented)

### Not Accessible via Web Scraping
- ❌ Timer audio files (require browser DevTools inspection)
- ❌ Timer JavaScript code (page source incomplete)
- ❌ Helvetica font file (commented out reference)

### Legal Uncertainty
- ⚠️ Web-specific assets (timer, website icons) - unclear if covered by CC license
- ⚠️ Audio files - not explicitly mentioned in license statement

---

## Sources

This document was compiled from the following sources:

1. [Inhuman Conditions Official Website](https://robots.management/)
2. [Inhuman Conditions Timer](https://robots.management/timer/)
3. [dfabulich/inhuman-conditions-online](https://github.com/dfabulich/inhuman-conditions-online) - GitHub Repository
4. [bellicapax/inhuman-conditions](https://github.com/bellicapax/inhuman-conditions) - GitHub Repository
5. [FTWinston/RobotInterrogation](https://github.com/FTWinston/RobotInterrogation) - GitHub Repository
6. [Cops 'n' Robots](https://copsnrobots.github.io/) - Community Implementation
7. [Mixkit Free Robot Sound Effects](https://mixkit.co/free-sound-effects/robot/)
8. [Zapsplat Robot Sounds](https://www.zapsplat.com/sound-effect-category/robots/)
9. [Pixabay Robot Sound Effects](https://pixabay.com/sound-effects/search/robot/)

---

**Document Version:** 1.0
**Created:** February 22, 2026
**Project:** Inhuman Conditions Web Implementation
