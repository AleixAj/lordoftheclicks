# Aniron (LotR film title typeface)

The header "Lord of the Clicks" is wired up to use **Aniron** — the typeface
Pete Klassen designed to match the Lord of the Rings film logo. The font is
free for personal use.

Drop the font here as `aniron.woff2` (and optionally `aniron.woff` for older
browser support) and it will be picked up automatically by the `@font-face`
declaration in `src/index.css`.

```
public/fonts/aniron.woff2
public/fonts/aniron.woff   (optional fallback)
```

## Where to get it

- https://www.dafont.com/aniron.font (download the ZIP, you get `Aniron.ttf`)
- https://www.fontspace.com/aniron-font-f4286

## Convert TTF to WOFF2 (recommended for the web)

The browser will load WOFF2 ~30% faster than TTF. Easiest way:

- Online: https://cloudconvert.com/ttf-to-woff2
- CLI: `npm i -g woff2-cli && woff2-cli compress Aniron.ttf` (produces `Aniron.woff2`)

Rename the output to lowercase `aniron.woff2` and place it in this folder.

## Fallback

Until you add the file, the title falls back to **MedievalSharp** (loaded from
Google Fonts), which is the closest free LotR-feel face on Google Fonts.
