# GuGong-Beijing · 北京中轴线三维模型

**English** · [中文](README.zh-CN.md)

An interactive 3D model of the Forbidden City (故宫) and the whole Beijing Central Axis, from Yongdingmen in the south to the Bell Tower in the north (about 7.8 km), built at 1:1 in metres with three.js.

**[Launch the model](https://shanem73.github.io/GuGong-Beijing/)**

## What is in it

All 15 components of the "Beijing Central Axis" World Heritage listing are modelled, south to north:

- Yongdingmen, the southern road section and Tianqiao
- Temple of Heaven: Hall of Prayer for Good Harvests, Danbi Bridge, Imperial Vault of Heaven with the Echo Wall, Circular Mound Altar, Fasting Palace
- Altar of the God of Agriculture (Xiannongtan): Taisui Hall, the altar, Guangeng Platform, Divine Granary, Qingcheng Palace
- Zhengyangmen gate tower and arrow tower
- Tian'anmen Square: Monument to the People's Heroes, Chairman Mao Memorial Hall, Great Hall of the People, National Museum of China
- Outer Golden Water Bridges, Tian'anmen, Duanmen
- Imperial Ancestral Temple (Taimiao) and Altar of Land and Grain (Shejitan)
- The Forbidden City: walls, moat, Meridian Gate, corner towers, the three great halls on their three-tier terrace, the three rear palaces, the six eastern and six western palaces, Imperial Garden, Ningshou Palace area, Cining Palace area and more
- Jingshan, Di'anmen wing buildings, Wanning Bridge, Drum Tower and Bell Tower

## How to use it

- Drag to rotate, pinch or scroll to zoom, tap a building for its name, dimensions, a short history and estimated coordinates.
- The strip along the bottom flies to each landmark, ordered south to north.
- Buildings marked with a gold dot can be entered (Go inside): Hall of Supreme Harmony, Palace of Heavenly Purity, Hall of Mental Cultivation, Hall of Prayer for Good Harvests, Drum Tower and others. Interiors have the column grid, throne, screen, name plaque and coffered ceiling.
- Roofs off hides every roof so you can look down into the halls; Labels and Shadows toggle names and sun shadows; Axis and Palace switch between the whole axis and the Forbidden City.

The interface opens in English. Switch to 中文, 日本語 or 한국어 with the buttons under the title; the choice is remembered on that device, and `?lang=zh` (or `ja`, `ko`, `en`) in the URL opens a given language. Building names, categories, dimensions and descriptions are translated; the plaques inside the halls keep their original Chinese inscriptions.

## Accuracy

- Checked against published figures: the palace footprint (961 m × 753 m), moat width (52 m), wall height (10 m), Meridian Gate platform (12 m), three-tier terrace (8.13 m), corner towers (27.5 m); the axis length (7.8 km) and its 15 components; Tian'anmen Square (762 m × 280 m); the Hall of Prayer for Good Harvests and its terrace; Danbi Bridge and the Echo Wall.
- From commonly published figures, not individually verified: dimensions of the main palace halls, the gate towers, the Drum and Bell Towers and the monument; the axis bearing (about 2° west of north); the centre coordinates.
- Approximate: positions along the axis are laid out from typical spacings rather than survey coordinates, so they can be off by tens of metres; the east–west offsets of the Temple of Heaven and Xiannongtan may be off by more. Secondary courtyards are placed approximately.
- Schematic only: the grey city fabric, the lakes west of the axis, the White Dagoba, bracket sets and painted decoration (textures), and the massing of the 1950s buildings on the square.

## Build

`index.html` is the built, self-contained page; open it directly or serve the repository root.

```bash
npm install
npm run build   # bundles src/ into index.html
```

- `src/model.js` builds all geometry and the list of selectable sites.
- `src/main.js` is the viewer: camera, picking, labels, interior mode, UI.
- `src/i18n.js` holds the English, Japanese and Korean translations (Chinese is the source text in `src/model.js`) and the interface strings for all four languages.
- `template.html` holds the page markup and styles.

three.js r160 is loaded from jsDelivr; display fonts are Noto Serif SC, JP and KR from Google Fonts (JP and KR load only when chosen).

## License

MIT, see [LICENSE](LICENSE).
