# Ringbearer (LotR-inspired title typeface)

The header "Lord of the Clicks" is wired up to use **Ringbearer**. The font is
commonly used in fan projects for a Lord of the Rings-inspired title treatment.

Drop the font here as `ringbearer.woff2` (or `ringbearer.ttf` directly) for older
browser support) and it will be picked up automatically by the `@font-face`
declaration in `src/index.css`.

```
public/fonts/ringbearer.woff2
public/fonts/ringbearer.woff   (optional fallback)
public/fonts/ringbearer.ttf    (also supported)
```

## Where to get it

- https://www.dafont.com/ringbearer.font
- https://www.fontspace.com/ringbearer-font-f2246

## Convert TTF to WOFF2 (recommended for the web)

The browser will load WOFF2 ~30% faster than TTF. Easiest way:

- Online: https://cloudconvert.com/ttf-to-woff2
- CLI: `npm i -g woff2-cli && woff2-cli compress Ringbearer.ttf` (produces `Ringbearer.woff2`)

Rename the output to lowercase `ringbearer.woff2` and place it in this folder.

## Fallback

Until you add the file, the title falls back to **MedievalSharp** (loaded from
Google Fonts), which is the closest free LotR-feel face on Google Fonts.
