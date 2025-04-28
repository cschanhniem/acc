# Icons forAI Contract Check Audio Player

This directory contains the icon sets used in theAI Contract Check audio player interface.

## Required Icon Sets

### Rain Icons
- [ ] `rain-96.png`
- [ ] `rain-128.png`
- [ ] `rain-192.png`
- [ ] `rain-256.png`

### Forest Icons
- [ ] `forest-96.png`
- [ ] `forest-128.png`
- [ ] `forest-192.png`
- [ ] `forest-256.png`

### Ocean Icons
- [ ] `ocean-96.png`
- [ ] `ocean-128.png`
- [ ] `ocean-192.png`
- [ ] `ocean-256.png`

### Music Icons
- [ ] `music-96.png`
- [ ] `music-128.png`
- [ ] `music-192.png`
- [ ] `music-256.png`

### Bell Icons
- [ ] `bell-96.png`
- [ ] `bell-128.png`
- [ ] `bell-192.png`
- [ ] `bell-256.png`

## Icon Requirements
- Format: PNG with transparency
- Resolution: Native resolution, no upscaling
- Color Scheme: Monochrome with:
  - Light theme color: `#1a1a1a`
  - Dark theme color: `#ffffff`
  - Active state color: Primary theme color
- Style: Minimalist, consistent across set
- Usage: Background audio player and media session controls

## Design Guidelines
1. Use simple, clear shapes
2. Maintain consistent stroke width
3. Center icons within their viewports
4. Test visibility at small sizes
5. Ensure crisp edges at target sizes

## Recommended Tools
- Figma
- Adobe Illustrator
- Inkscape (Open Source)

## Export Process
1. Design at largest size (256px)
2. Export at all required sizes
3. Verify pixel-perfect rendering
4. Test in both light and dark modes

## File Naming
Follow the exact naming convention:
`{sound-type}-{size}.png`

Example: `rain-96.png`

## Validation and Testing

### Validate Icons
Check if all icons meet the requirements using:
```bash
pnpm run validate-icons
```

The script checks:
- File existence
- Correct dimensions
- PNG format with transparency
- Full icon set completeness

### Preview in Player
Test icons in the audio player using:
```bash
pnpm run dev
