# Quick Reference: robots.management Assets

## Direct Asset URLs

### Images - Category Icons
```
https://robots.management/images/icons/small_talk.svg
https://robots.management/images/icons/creative.svg
https://robots.management/images/icons/imagination.svg
https://robots.management/images/icons/coop.svg
https://robots.management/images/icons/hopes.svg
https://robots.management/images/icons/body.svg
https://robots.management/images/icons/grief.svg
https://robots.management/images/icons/threat.svg
https://robots.management/images/icons/moral.svg
https://robots.management/images/icons/self.svg
https://robots.management/images/icons/recognizing.svg
```

### Images - Branding & Decorative
```
https://robots.management/images/IC_header_4.svg (main logo)
https://robots.management/images/Cc.svg (Creative Commons logo)
https://robots.management/images/needle_shadow.svg
https://robots.management/images/form_graphic_dark.svg
https://robots.management/images/arrows_white_no_border.svg
https://robots.management/images/maze.svg
https://robots.management/images/module.svg
https://robots.management/images/IHboxMockUpTransparent.png
```

### Alternative CDN (CodePen)
```
https://assets.codepen.io/184748/small_talk.svg
https://assets.codepen.io/184748/creative.svg
https://assets.codepen.io/184748/imagination.svg
https://assets.codepen.io/184748/coop.svg
https://assets.codepen.io/184748/hopes.svg
https://assets.codepen.io/184748/body.svg
https://assets.codepen.io/184748/grief.svg
https://assets.codepen.io/184748/threat.svg
https://assets.codepen.io/184748/moral.svg
https://assets.codepen.io/184748/self.svg
```

## Design Tokens

### Colors
```css
/* Primary button */
background-color: #6f6b6b;

/* Button hover/focus */
background-color: #646060;

/* Cops 'n' Robots color scheme */
background: black;
color: white;
```

### Typography
```css
/* Primary font stack */
font-family: Arial, sans-serif;

/* Cops 'n' Robots alternative */
font-family: 'Lucida Sans Typewriter', monospace;

/* Timer page optimizations */
font-kerning: normal;
text-rendering: optimizeLegibility;
letter-spacing: 0px;
font-variant-ligatures: none;
-webkit-font-smoothing: antialiased;
```

### Layout
```css
/* Cops 'n' Robots max-width */
max-width: 45em;
```

## How to Extract Timer Audio Files

### Method: Browser DevTools
1. Open https://robots.management/timer/
2. Press F12 (or Right-click → Inspect)
3. Go to **Network** tab
4. Click **Media** filter
5. Start the timer
6. Right-click audio file when it appears → "Open in new tab" → Save

### Alternative: View Page Source
1. Visit https://robots.management/timer/
2. Right-click → "View Page Source"
3. Search for: `<audio`, `.mp3`, `.ogg`, `new Audio(`
4. Copy URLs and download directly

## Free Alternative Audio Sources

If you need royalty-free robot voice sounds:

- **Mixkit**: https://mixkit.co/free-sound-effects/robot/ (36 free sounds)
- **Zapsplat**: https://www.zapsplat.com/sound-effect-category/robots/ (160K+ free)
- **Pixabay**: https://pixabay.com/sound-effects/search/robot/ (no attribution required)

## Open Source Reference Implementations

### Simplest (Single HTML file)
```bash
git clone https://github.com/dfabulich/inhuman-conditions-online.git
# Check index.html for timer implementation
```

### Vue.js Implementation
```bash
git clone https://github.com/bellicapax/inhuman-conditions.git
# Quasar Vue.js app (WIP)
```

### TypeScript/C# Implementation
```bash
git clone https://github.com/FTWinston/RobotInterrogation.git
# Complex implementation with backend
```

## License & Attribution

All game content is licensed under **CC BY-NC-SA 4.0**.

### Required Attribution
```
Inhuman Conditions by Tommy Maranges and Cory O'Brien
Licensed under CC BY-NC-SA 4.0
https://robots.management/
```

### License Requirements
- ✅ **Attribution** required (credit creators)
- ❌ **Non-Commercial** use only
- ✅ **Share-Alike** (derivatives must use same license)

### Uncertain Coverage
Web-specific assets (timer audio, website SVGs) may or may not be covered. Contact creators for explicit permission if using for production.

## Download Official Game Materials

All print-and-play PDFs are free on the website:
- Rules: https://robots.management/ (Dropbox links)
- Cards: Full card set available
- Forms: Investigator forms available
- Modules: 22 module PDFs (11 investigator + 11 robot)

## Quick Command: Download All SVG Icons

```bash
# Create assets directory
mkdir -p assets/icons

# Download all category icons
curl https://robots.management/images/icons/small_talk.svg -o assets/icons/small_talk.svg
curl https://robots.management/images/icons/creative.svg -o assets/icons/creative.svg
curl https://robots.management/images/icons/imagination.svg -o assets/icons/imagination.svg
curl https://robots.management/images/icons/coop.svg -o assets/icons/coop.svg
curl https://robots.management/images/icons/hopes.svg -o assets/icons/hopes.svg
curl https://robots.management/images/icons/body.svg -o assets/icons/body.svg
curl https://robots.management/images/icons/grief.svg -o assets/icons/grief.svg
curl https://robots.management/images/icons/threat.svg -o assets/icons/threat.svg
curl https://robots.management/images/icons/moral.svg -o assets/icons/moral.svg
curl https://robots.management/images/icons/self.svg -o assets/icons/self.svg
curl https://robots.management/images/icons/recognizing.svg -o assets/icons/recognizing.svg

# Download main logo
curl https://robots.management/images/IC_header_4.svg -o assets/IC_header_4.svg

# Download maze decoration
curl https://robots.management/images/maze.svg -o assets/maze.svg
```

## CSS Starter Template

```css
:root {
  /* Inhuman Conditions color palette */
  --ic-gray-primary: #6f6b6b;
  --ic-gray-dark: #646060;
  --ic-black: #000000;
  --ic-white: #ffffff;
}

body {
  font-family: Arial, sans-serif;
  font-kerning: normal;
  text-rendering: optimizeLegibility;
  letter-spacing: 0;
  font-variant-ligatures: none;
  -webkit-font-smoothing: antialiased;
  background-color: var(--ic-black);
  color: var(--ic-white);
}

.button-primary {
  background-color: var(--ic-gray-primary);
  transition: background-color 0.2s;
}

.button-primary:hover,
.button-primary:focus {
  background-color: var(--ic-gray-dark);
}

.content-container {
  max-width: 45em;
  margin: 0 auto;
}
```

## Next Steps

1. ✅ Download SVG assets using curl commands above
2. 🔍 Extract timer audio using DevTools method
3. 📖 Read full documentation: `docs/ASSETS-robots-management.md`
4. 💬 Contact creators if you need explicit permission for web assets
5. 🎨 Implement design using the color tokens and typography above

---

**See full documentation:** [ASSETS-robots-management.md](./ASSETS-robots-management.md)
