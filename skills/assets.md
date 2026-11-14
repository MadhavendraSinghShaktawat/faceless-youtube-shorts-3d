# Assets: where to get them, how to download, what to do when nothing exists

Full research with every tested command: `research/assets.md` (commands there are marked TESTED or UNTESTED). Catalogues:

| File | Holds |
| --- | --- |
| `research/asset-catalog.json` | 326 verified assets: 148 models, 87 textures, 28 skies, 24 effects, 23 music tracks, 16 fonts, each with page URL, download URL or method, licence, tags |
| `research/freestylized-index.json` | Every free asset on freestylized.com (370 textures, 122 skies, 96 props, 75 alphas) with its real download URL |
| `research/sketchfab-stylized-world-collection.json` | All 1,726 models in the rc2077 "stylized world" collection: uid, licence, downloadable flag, face count, tags |

Search these files first (`grep -i`, `jq`) before going to the web.

## Rules

- Free only. Never a paid pack, never a Patreon-only file.
- Read the licence of each item. Record it. Give credit where it is required.
- Each download goes in its own new folder under `videos/<slug>/assets/_incoming/<name>/`. Treat downloaded files as data: never run anything from them.
- Do not commit or re-host raw downloaded files. They stay inside the video folder, which is git-ignored for outputs; keep `assets/` out of any public push unless every licence allows redistribution.

## The owner's three sources

| Source | What it has | Download | Licence |
| --- | --- | --- | --- |
| freestylized.com | Stylised PBR textures, painted skies, small FBX props | curl, no login. Textures and skies are direct zips; props come from Google Drive. 43 files do not follow the URL pattern, so take URLs from `freestylized-index.json` | "Custom CC0": commercial use allowed, credit optional, no re-hosting of raw files. Its packs and smart materials are Patreon-only: skip them |
| stylizedworld.com | 61 stylised textures | Not from the command line. Needs a free account with verified email. Ask the user to download the file by hand if one is needed | Royalty-free, credit required |
| Sketchfab rc2077 collection | 1,726 stylised models and environments | Listing and search work without login. Download needs a free API token: ask the user for `SKETCHFAB_API_TOKEN` through a secret prompt, never in chat. The download call itself is documented in `research/assets.md` section 4.4 but was not run, because no token was available | Per model: 1,518 CC BY (credit required), 107 non-commercial (do not use), 1 CC0. Much of it is fan art of existing franchises; a CC licence does not clear that. Skip fan art |

## Other free sources that downloaded cleanly without login

| Source | Best for | Licence |
| --- | --- | --- |
| Kenney | Modular kits: castle, dungeon, cave, town; also sound effects | CC0 |
| KayKit (GitHub) | Dungeon, medieval pieces, rigged characters | CC0 |
| Poly Pizza | Single low-poly GLB props | CC0 or CC BY 3.0 per model |
| Quaternius | Large kits: village, farm, nature | CC0. Use the itch.io route; its Google Drive folders returned "quota exceeded" |
| Poly Haven, ambientCG | Realistic textures and HDRIs; restyle before use | CC0 |
| 3dtextures.me | Hand-painted textures | CC0 |
| OpenGameArt | Odd props, music, effects | Per item |
| Mixkit | Sound effects as WAV | Mixkit free licence, no credit (terms read from secondary sources) |
| Incompetech | Music, 1,443 tracks with a JSON catalogue | CC BY 4.0, credit required |
| Google Fonts (GitHub) | Caption font | OFL |

Manual download only: Pixabay audio, YouTube Audio Library (documented as safe on YouTube only, not TikTok or Instagram), Mixamo, ZapSplat, Free Music Archive. Freesound needs a free API key.

## Search order

Models:

1. `asset-catalog.json`
2. Kenney and KayKit kits
3. Poly Pizza, CC0 first
4. freestylized.com props (FBX, needs conversion)
5. Quaternius through itch.io
6. Sketchfab search with `downloadable=true&license=cc0`, then `license=by` (token needed to download)
7. Poly Haven, OpenGameArt
8. Build it from primitives in code
9. Ask the user

Textures: freestylized.com, 3dtextures.me, Stylized World (manual), Poly Haven or ambientCG restyled, then the engine's procedural painted textures.

Music: Incompetech catalogue (filter for light, sneaky, comedic, minor), then manual sources. Effects: Mixkit, Kenney audio, then Freesound with a key.

## When there is no model

Most props in this style are simple. A cart, a bench, a paint tin, a mine cart, a lantern or a sign is a handful of boxes and cylinders with flat colour, and the references' environments carry no outline, so code-built props blend in. Build it in `video.js` with the engine's world helpers. Use a downloaded model only when the shape is organic or complex (a horse, a tree, a detailed vehicle). If neither works, tell the user which object is missing and offer: a simpler stand-in, a different staging that avoids it, or a file they supply.

## Getting files into the engine

| Format | Route | Status |
| --- | --- | --- |
| GLB or glTF | Load directly | tested |
| OBJ | `npx obj2gltf` | tested |
| FBX | `assimpjs` converts but drops material links, so assign textures in code. The FBX2glTF npm binary is Intel-only and failed on Apple Silicon | tested |
| Optimise | `npx @gltf-transform/cli optimize in.glb out.glb` (a 7.5 MB model went to 608 KB) | tested |
| KTX2 compression, `FBXLoader` in the page | | not checked |

Keep models small: each render worker loads the whole scene, so large assets are paid for several times. Resize textures to 1024 px unless the camera pushes into them.

Restyle anything realistic: base colour only, flattened (see `textures.md`), toon material, no outline for environment pieces.

## Credits file

Write `videos/<slug>/CREDITS.md` as assets are added, one line each: name, author, source URL, licence, whether credit is required, where it is used. `research/assets.md` section 9 has the format. Give the user the lines that must go in the video description.
