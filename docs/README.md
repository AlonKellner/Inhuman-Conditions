# Documentation Index

## Asset Documentation

### [ASSETS-robots-management.md](./ASSETS-robots-management.md)
**Comprehensive asset documentation** from the official Inhuman Conditions website (robots.management).

Includes:
- Complete catalog of all SVG icons and images
- Design tokens (colors, typography, CSS values)
- Downloadable game materials (PDFs)
- Licensing information (CC BY-NC-SA 4.0)
- Community open-source implementations
- Asset extraction techniques
- Outstanding questions and next steps

**Best for:** Understanding what assets exist, licensing requirements, and comprehensive background.

### [ASSETS-quick-reference.md](./ASSETS-quick-reference.md)
**Quick reference guide** with actionable information for developers.

Includes:
- Direct URLs for all downloadable assets
- CSS design tokens (copy-paste ready)
- Color palette and typography specifications
- Command-line scripts to download all SVG icons
- Browser DevTools method to extract timer audio
- Starter CSS template
- Open-source repository clone commands

**Best for:** Quick implementation, getting started immediately, copy-paste values.

## Bug Fixes & Technical Notes

### [BUGFIX-auto-advance.md](./BUGFIX-auto-advance.md)
Technical documentation for the auto-advance bug fix.

---

## Key Findings Summary

### ✅ Fully Accessible Assets

**11 Category Icons (SVG):**
- Small Talk, Creative, Imagination, Cooperation, Hopes & Dreams
- Body Language, Grief, Threat Assessment, Moral Dilemmas
- Self-Awareness, Recognition

**Branding & Decorative (SVG + PNG):**
- IC_header_4.svg (main logo)
- maze.svg, needle_shadow.svg, module.svg
- IHboxMockUpTransparent.png (product mockup)
- Creative Commons logo, navigation arrows

**Design System:**
- Color palette: `#6f6b6b`, `#646060`
- Typography: Arial, sans-serif with specific rendering optimizations
- Layout patterns: 45em max-width, black/white color scheme

**Game Content:**
- Print-and-play PDFs (rules, cards, forms)
- 22 game module PDFs
- Remote play adaptations

### ⚠️ Requires Manual Extraction

**Timer Audio Files:**
- Must use browser DevTools → Network tab → Media filter
- URLs not accessible via web scraping
- Alternative: Use royalty-free robot voice sound effects

### 📜 Licensing

**CC BY-NC-SA 4.0** covers:
- All game content (rules, cards, mechanics)
- Print-and-play materials

**Uncertain coverage:**
- Web-specific assets (timer application, website design)
- Audio files from timer
- Recommendation: Contact creators for explicit permission

### 🔗 External Resources

**Open Source Implementations:**
1. [dfabulich/inhuman-conditions-online](https://github.com/dfabulich/inhuman-conditions-online) - Single HTML file, Preact
2. [bellicapax/inhuman-conditions](https://github.com/bellicapax/inhuman-conditions) - Vue.js/Quasar (WIP)
3. [FTWinston/RobotInterrogation](https://github.com/FTWinston/RobotInterrogation) - TypeScript/C#
4. [Cops 'n' Robots](https://copsnrobots.github.io/) - Web implementation

**Free Audio Alternatives:**
- [Mixkit](https://mixkit.co/free-sound-effects/robot/) - 36 free robot sounds
- [Zapsplat](https://www.zapsplat.com/sound-effect-category/robots/) - 160K+ free robot sounds
- [Pixabay](https://pixabay.com/sound-effects/search/robot/) - Royalty-free, no attribution

---

## Quick Start

### 1. Download Assets
```bash
cd /Users/akellner/MyDir/Code/Other/Inhuman-Conditions
mkdir -p public/assets/icons

# Download all category icons
for icon in small_talk creative imagination coop hopes body grief threat moral self recognizing; do
  curl "https://robots.management/images/icons/${icon}.svg" -o "public/assets/icons/${icon}.svg"
done

# Download main logo and decorative elements
curl https://robots.management/images/IC_header_4.svg -o public/assets/IC_header_4.svg
curl https://robots.management/images/maze.svg -o public/assets/maze.svg
```

### 2. Extract Timer Audio (Manual)
1. Visit https://robots.management/timer/
2. Open DevTools (F12)
3. Network tab → Media filter
4. Start timer → Download audio files when they appear

### 3. Implement Design System
See CSS starter template in [ASSETS-quick-reference.md](./ASSETS-quick-reference.md#css-starter-template)

### 4. Add Attribution
```html
<!-- Include in your footer or credits -->
<p>
  Inhuman Conditions by Tommy Maranges and Cory O'Brien<br>
  Licensed under CC BY-NC-SA 4.0<br>
  <a href="https://robots.management/">https://robots.management/</a>
</p>
```

---

## Need Help?

1. **General questions:** See [ASSETS-robots-management.md](./ASSETS-robots-management.md)
2. **Quick implementation:** See [ASSETS-quick-reference.md](./ASSETS-quick-reference.md)
3. **Technical issues:** Check open-source implementations listed above
4. **Licensing questions:** Contact creators via newsletter signup at robots.management

---

**Documentation Created:** February 22, 2026
**Project:** Inhuman Conditions Web Implementation
