# AssetFi UAE Infographics

## Files

- `assetfi-flow-ar.svg` - Complete visual guide to AssetFi UAE platform (Arabic/English)

## Converting SVG to PNG

To generate a PNG version of the infographic for printing or sharing:

### Option 1: Online Converters
- Visit https://cloudconvert.com/svg-to-png
- Upload `assetfi-flow-ar.svg`
- Set width to 1200px (or higher for better quality)
- Download as `assetfi-flow-ar.png`

### Option 2: Command Line (if you have librsvg installed)
```bash
rsvg-convert -w 2400 assetfi-flow-ar.svg -o assetfi-flow-ar.png
```

### Option 3: Using Inkscape
```bash
inkscape assetfi-flow-ar.svg --export-filename=assetfi-flow-ar.png --export-width=2400
```

### Option 4: Browser
1. Open `assetfi-flow-ar.svg` in a modern browser (Chrome/Firefox)
2. Right-click and select "Save As" or "Export as PNG"
3. Use browser extensions like "SVG Export" for better control

## Usage

Both SVG and PNG versions are linked from the `/how-it-works` page for download.
The SVG is recommended for web viewing, while PNG is better for printing or sharing on platforms that don't support SVG.

## Updating the Infographic

To update the infographic, edit `assetfi-flow-ar.svg` directly. The SVG uses inline styles and is self-contained.
After updating, regenerate the PNG using one of the methods above.
