# Free asset sources for the cartoon 3D director skill

Researched and tested 2026-11-14 on macOS arm64 (node 24, python 3.9, curl, ffmpeg; no Blender, no Rosetta).
Every claim below was checked against the live site or API that day. Commands are marked **TESTED** (ran here, produced the stated result) or **UNTESTED** (documented by the provider, could not be run, usually because it needs a login or token).

Companion files in this folder:

| File | What it is |
|---|---|
| `asset-catalog.json` | 326 curated, verified assets (texture, model, hdri, sfx, music, font) with page URL, download URL or method, licence, formats, tags |
| `freestylized-index.json` | Every free asset on freestylized.com: 370 textures, 122 skies, 96 models, 75 alphas, each with its real download URL |
| `sketchfab-stylized-world-collection.json` | 1,726 models of the rc2077 "stylized world" collection: name, uid, URL, author, licence, downloadable, faces, vertices, animation count, tags |

Nothing here costs money. Three sources need a free account or token (Sketchfab, Stylized World, Freesound) and a few are manual-download only (Pixabay, YouTube Audio Library, Mixamo, ZapSplat, Free Music Archive).

---

## 1. Decision table

| Source | Best for | Licence | CLI download? | Auth? |
|---|---|---|---|---|
| **freestylized.com** | Stylised PBR textures, painted skies, small props | Custom CC0: commercial OK, credit optional, no raw redistribution | Yes (curl, direct R2 / Drive links) | None |
| **stylizedworld.com** | A few stylised textures (61 assets total) | Royalty-free, **credit required** | No (login-gated) | Free account + verified email |
| **Sketchfab** (incl. rc2077 collection) | Hero models and whole stylised environments | Per model: mostly CC BY 4.0; some NC/ND, a few CC0 | Search yes; download only with token | Free API token |
| **Poly Pizza** | Single low-poly GLB props, instantly | Per model: CC0 or CC BY 3.0 | Yes (static GLB URL) | None (API needs a free key; not required) |
| **Kenney** | Modular low-poly kits (castle, dungeon, cave, town), SFX | CC0 | Yes (signed link endpoint, browser UA) | None |
| **KayKit** (GitHub) | Dungeon, medieval hex, rigged characters | CC0 | Yes (raw GitHub / repo zip) | None |
| **Quaternius** | Big CC0 kits: medieval village, farm, nature, characters | CC0 | Partly: itch.io free flow works; Drive folders often quota-blocked | None |
| **Poly Haven** | HDRI lighting, realistic props/textures | CC0 | Yes (JSON API) | None |
| **ambientCG** | Realistic PBR materials, HDRIs | CC0 | Yes (JSON API) | None |
| **3dtextures.me** | Hand-painted stylised textures | CC0 | Yes (public Drive folders) | None |
| **OpenGameArt** | Odd props, music, SFX | Per item: CC0 / CC BY / OGA-BY / GPL | Yes (direct file links) | None |
| **three.js examples** | Test rigs (RobotExpressive), small HDRs | Per file | Yes (raw GitHub) | None |
| **Mixamo** | Humanoid animations, auto-rigging | Adobe: royalty-free, no raw redistribution | No | Adobe ID (free), manual |
| **Mixkit** | SFX (WAV), some music | Mixkit Free License, no credit | Yes (direct asset URLs) | None |
| **Incompetech** | Music beds (1,443 tracks) | CC BY 4.0, **credit required** | Yes (direct mp3) | None |
| **Freesound** | Any specific sound | Per sound: CC0 / CC BY / CC BY-NC | Search + mp3 previews with token; originals need OAuth2 | Free API key |
| **Pixabay** (audio) | Music and SFX | Pixabay Content License, no credit | No (Cloudflare 403 to curl; API has no audio) | Manual |
| **Sonniss GDC bundles** | Pro SFX libraries | Royalty-free, no credit, no AI training | Impractical (9 to 48 GB per year) | None |
| **YouTube Audio Library** | Music safe from Content ID on YouTube | YouTube licence or CC BY | No | YouTube Studio sign-in |
| **Free Music Archive** | Music | Per track, many NC | No (manual) | Varies |
| **ZapSplat** | SFX | Standard licence, credit required on free tier | No | Account |
| **Google Fonts** | Caption fonts | OFL 1.1 / Apache 2.0 | Yes (raw GitHub TTF) | None |

### Recommended search order

Models:

1. `asset-catalog.json` (already verified)
2. Kenney and KayKit kits (CC0, GLB, consistent style, modular)
3. Poly Pizza search (CC0 first: Quaternius, Kay Lousberg, Kenney; then CC BY 3.0)
4. freestylized.com models (props; FBX, needs conversion)
5. Quaternius packs through itch.io
6. Sketchfab search API with `downloadable=true&license=cc0`, then `license=by` (needs `SKETCHFAB_API_TOKEN` to download)
7. Poly Haven / OpenGameArt
8. Kitbash from Three.js primitives
9. Ask the user

Textures: freestylized.com, then 3dtextures.me, then Stylized World (manual), then Poly Haven / ambientCG (realistic, restyle), then procedural canvas textures.

Skies: freestylized.com skybox (visible painted background) plus a Poly Haven pure-sky HDRI (lighting only), or a gradient sky shader.

SFX: Kenney audio, then Mixkit, then Freesound (CC0 filter, token), then Pixabay (manual).

Music: Incompetech (credit), then Mixkit, then Pixabay (manual), then YouTube Audio Library (manual, YouTube only).

---

## 2. freestylized.com

**What it is.** A WordPress site (Breakdance/Oxygen builder) publishing stylised, Substance-Designer-made PBR materials plus painted skyboxes, props and alpha brushes. No account is needed. The site's own words: "Without account requirements on website just download, all materials absolutely FREE".

**Counts on 2026-11-14** (from the WordPress REST API `X-WP-Total` header):

| Type | REST base | Count | Free download? |
|---|---|---|---|
| Textures (materials) | `material` | 370 | Yes: 1k, 2k, 4k zips |
| Skyboxes | `skybox` | 122 | Yes: 2k zip only (4k/8k are Patreon) |
| 3D models | `3d_models` | 96 | Yes: one zip on Google Drive |
| Alphas (brush/pattern masks) | `alpha` | 75 | Yes: one zip |
| Asset packs | `asset_pack` | 21 | **No**, Patreon tier 4 only |
| Smart materials | `smart_material` | 30 | **No**, Patreon tier 4 only |

The `.sbs`/`.sbsar` source files are also Patreon-only.

**Licence** (verbatim from https://freestylized.com/disclaimer/):

> All Content provided on -freestylized.com- is added with the authors consent, allowing everyone to use the provided content FREE for their Commercial and Non-Commercial projects without any permission. Attribution to freestylized.com with your work [...] would be much appreciated, but not required. The Content is distributed under custom CC0 License allowing all CC0 attributions except the limits stated below. This license limits the redistribution of freestylized.com content with any individual or any organization's attribution other than freestylized.com or the authors of content. The redistribution of content on any other platform such as marketplaces and other sites is also prohibited, unless there are some key modifications [...] Note: The content provided on Patreon are products of FreeStylized.com, they are not under CC0 license.

So: use in monetised videos is fine, no credit required (credit anyway, it is polite), never re-host the raw zips.

**Formats** (confirmed by unzipping samples):

- Texture zip `roof_tiles_04_1k.zip` (4.4 MB): `*_color_1k.png`, `*_normal_gl_1k.png`, `*_normal_dx_1k.png`, `*_roughness_1k.png`, `*_ambient_occlusion_1k.png`, `*_height_1k.png`. Sizes: 1k is about 4 MB, 2k about 15 MB, 4k about 190 MB. Use 1k or 2k.
- Skybox zip `sky_27_2k.zip` (3.4 MB): `sky_27_2k.png` (2048x1024 equirectangular, LDR) and `sky_27_cubemap_2k/{px,nx,py,ny,pz,nz}.png` (512 px faces). These are painted LDR skies, not HDRIs.
- Model zip (8.6 MB for Fire Pit 01): `Source/*.fbx` and `Textures/*_Base_color.png, _Metallic.png, _Roughness.png, _Normal_GL.png, _Normal_DX.png` at 2k. FBX only, no glTF.

**URL patterns**

| Thing | Pattern |
|---|---|
| All-of-type pages | `/all-textures/`, `/all-skybox/`, `/all-3d-models/`, `/all-alphas/`, `/all-asset-packs/`, `/all-smart-materials/` |
| Category page | `/category/stylized-textures/<slug>/`, `/category/skybox/<slug>/`, `/category/3d-model/<slug>/` |
| Asset page | `/material/<slug>/`, `/skybox/<slug>/`, `/3d_models/<slug>/`, `/alpha/<slug>/` |
| Texture file | `https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Textures/{1k,2k,4k}/<slug>_{1k,2k,4k}.zip` |
| Skybox file | `https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Skybox/2k/<slug>_2k.zip` |
| Alpha file | `https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Alphas/fs_<slug>.zip` |
| Model file | `https://drive.google.com/uc?export=download&id=<driveId>` (id is only on the asset page) |
| Sitemaps | `/sitemap_index.xml` → `material-sitemap1.xml`, `material-sitemap2.xml`, `3d_models-sitemap.xml`, `skybox-sitemap.xml` |

The `<slug>` pattern holds for 331 of 370 textures and 118 of 122 skies. The other 43 use a different file name (for example page slug `bricks_wall_06` → file `bricks-wall-06_1k.zip`, `concrete_slab_03` → `concrete_slabs_03_1k.zip`, `decor_wall_01` → `Decor_wall_01_1k.zip`). **Do not guess: scrape the asset page for the `r2.dev` or `drive.google.com` href**, or read the resolved URL from `freestylized-index.json`.

**Categories** (slug, count):

- Textures: ground 106, wall_plaster 74, tiles 70, wood 67, bricks 27, metals 27, concrete 26, indoor_tiles 26, planks 26, roof_tiles 26, rock 25, stone_walls 25, paper 22, grass 14, bark 12, organic 12, industrial_scifi 11, cliff 9, textiles 9, snow 4
- Skies: cloudy_sky 91, anime 77, 90s_anime 30, golden_hour_sky 24, night_sky 22, sunny_sky 20, evening_dusk_sky 14
- Models: urban 55, industrial 46, medieval 41, wild_west 37, interior 22, farm 13, weapons 11, furniture 1

**How to search (TESTED)**

```bash
# keyword search across textures
curl -s 'https://freestylized.com/wp-json/wp/v2/material?search=stone+wall&per_page=20&_fields=slug,link,title' | jq -r '.[]|"\(.slug)\t\(.link)"'
# list a category (ids: curl -s 'https://freestylized.com/wp-json/wp/v2/categories?per_page=100')
curl -s 'https://freestylized.com/wp-json/wp/v2/material?categories=17&per_page=100&_fields=slug,link'   # 17 = stone_walls
curl -s 'https://freestylized.com/wp-json/wp/v2/3d_models?categories=109&per_page=100&_fields=slug,link' # 109 = wild_west
curl -s 'https://freestylized.com/wp-json/wp/v2/skybox?search=night&per_page=50&_fields=slug,link,title'
# or offline:
jq -r '.textures[]|select(.categories|index("stone_walls"))|"\(.name)\t\(.download["1k"])"' research/freestylized-index.json
```

Useful category ids: bricks 5, roof_tiles 6, concrete 7, metals 8, ground 9, grass 10, tiles 11, wood 12, planks 13, wall_plaster 16, stone_walls 17, bark 19, cliff 20, rock 21, textiles 117; skies: sunny 86, cloudy 87, night 88, golden hour 91, anime 94, 90s anime 95, evening/dusk 99; models: medieval 101, weapons 103, urban 104, industrial 105, farm 107, interior 108, wild west 109.

**How to download (TESTED)**

```bash
# resolve the real link from the asset page, then fetch (curl default UA works, no cookies)
page=https://freestylized.com/material/roof_tiles_04/
url=$(curl -sL "$page" | grep -oE 'https://pub-[a-z0-9]+\.r2\.dev/Textures/1k/[^"]+\.zip' | head -1)
mkdir -p assets/tex/roof_tiles_04 && curl -sL -o assets/tex/roof_tiles_04/1k.zip "$url" && unzip -q assets/tex/roof_tiles_04/1k.zip -d assets/tex/roof_tiles_04

# skybox
curl -sL -o sky.zip https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Skybox/2k/sky_27_2k.zip

# model (Google Drive). ALWAYS check the result is a zip: Drive answers HTTP 200 with an HTML "Quota exceeded" page when throttled.
id=$(curl -sL https://freestylized.com/3d_models/fire_pit_01_m15/ | grep -oE 'drive\.google\.com/uc\?[^"]*id=[A-Za-z0-9_-]+' | grep -oE 'id=[A-Za-z0-9_-]+' | cut -d= -f2 | head -1)
curl -sL -o model.zip "https://drive.usercontent.google.com/download?id=$id&export=download&confirm=t"
file model.zip | grep -q 'Zip archive' || echo 'NOT A ZIP: Drive quota or interstitial, retry later or ask the user to download in a browser'
```

**Representative catalogue** (97 assets; every URL below returned HTTP 200/206 on 2026-11-14, Drive ids were read from the asset pages; the full list is in `freestylized-index.json`)

**Stone walls**

| Asset | Page | 1k zip |
|---|---|---|
| Bricks Wall 07 | https://freestylized.com/material/bricks_wall_07/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Textures/1k/bricks_wall_07_1k.zip |
| Bricks Wall 08 | https://freestylized.com/material/bricks_wall_08/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Textures/1k/bricks_wall_08_1k.zip |
| Bricks Wall 09 | https://freestylized.com/material/bricks_wall_09/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Textures/1k/bricks_wall_09_1k.zip |
| Bricks Wall 10 | https://freestylized.com/material/bricks_wall_10/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Textures/1k/bricks_wall_10_1k.zip |
| Bricks Wall 11 | https://freestylized.com/material/bricks_wall_11/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Textures/1k/bricks_wall_11_1k.zip |

**Brick walls**

| Asset | Page | 1k zip |
|---|---|---|
| Bricks wall 01 | https://freestylized.com/material/bricks_wall_01/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Textures/1k/bricks_wall_01_1k.zip |
| Bricks wall 02 | https://freestylized.com/material/bricks_wall_02/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Textures/1k/bricks_wall_02_1k.zip |
| Bricks wall 03 | https://freestylized.com/material/bricks_wall_03/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Textures/1k/bricks_wall_03_1k.zip |
| Bricks wall 04 | https://freestylized.com/material/bricks_wall_04/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Textures/1k/bricks_wall_04_1k.zip |

**Ground / dirt / paths**

| Asset | Page | 1k zip |
|---|---|---|
| Cobblestone 01 | https://freestylized.com/material/cobblestone_01/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Textures/1k/cobblestone_01_1k.zip |
| Cobblestone 02 | https://freestylized.com/material/cobblestone_02/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Textures/1k/cobblestone_02_1k.zip |
| Concrete Ground 01 | https://freestylized.com/material/concrete_ground_01/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Textures/1k/concrete_ground_01_1k.zip |
| Concrete Tiles 02 | https://freestylized.com/material/concrete_tiles_02/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Textures/1k/concrete_tiles_02_1k.zip |
| Desert Ground with Rocks 01 | https://freestylized.com/material/desert_ground_with_rocks_01/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Textures/1k/desert_ground_with_rocks_01_1k.zip |

**Grass**

| Asset | Page | 1k zip |
|---|---|---|
| Grass 01 | https://freestylized.com/material/grass_01/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Textures/1k/grass_01_1k.zip |
| Grass 02 | https://freestylized.com/material/grass_02/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Textures/1k/grass_02_1k.zip |
| Grass 03 | https://freestylized.com/material/grass_03/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Textures/1k/grass_03_1k.zip |

**Rock and cliff**

| Asset | Page | 1k zip |
|---|---|---|
| Cliff Rocks 01 | https://freestylized.com/material/cliff_rocks_01/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Textures/1k/cliff_rocks_01_1k.zip |
| Cliff Rocks 02 | https://freestylized.com/material/cliff_rocks_02/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Textures/1k/cliff_rocks_02_1k.zip |
| Cliff Rocks 03 | https://freestylized.com/material/cliff_rocks_03/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Textures/1k/cliff_rocks_03_1k.zip |
| Cliff Rocks 04 | https://freestylized.com/material/cliff_rocks_04/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Textures/1k/cliff_rocks_04_1k.zip |
| Cliff Rocks 05 | https://freestylized.com/material/cliff_rocks_05/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Textures/1k/cliff_rocks_05_1k.zip |

**Wood and planks**

| Asset | Page | 1k zip |
|---|---|---|
| Roof Tiles 05 | https://freestylized.com/material/roof_tiles_05/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Textures/1k/roof_tiles_05_1k.zip |
| Roof Tiles 06 | https://freestylized.com/material/roof_tiles_06/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Textures/1k/roof_tiles_06_1k.zip |
| Roof Tiles 07 | https://freestylized.com/material/roof_tiles_07/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Textures/1k/roof_tiles_07_1k.zip |
| Wooden Planks 01 | https://freestylized.com/material/wood_planks_01/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Textures/1k/wood_planks_01_1k.zip |
| Wooden Planks 02 | https://freestylized.com/material/wood_planks_02/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Textures/1k/wood_planks_02_1k.zip |
| Wooden Planks 03 | https://freestylized.com/material/wood_planks_03/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Textures/1k/wood_planks_03_1k.zip |
| Bark 01 | https://freestylized.com/material/bark_01/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Textures/1k/bark_01_1k.zip |

**Roof tiles**

| Asset | Page | 1k zip |
|---|---|---|
| Hay Roof 01 | https://freestylized.com/material/hay_roof_01/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Textures/1k/hay_roof_01_1k.zip |
| Hay Roof 02 | https://freestylized.com/material/hay_roof_02/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Textures/1k/hay_roof_02_1k.zip |
| Metal Pattern 02 | https://freestylized.com/material/metal_pattern_02/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Textures/1k/metal_pattern_02_1k.zip |

**Metal**

| Asset | Page | 1k zip |
|---|---|---|
| corrugated metal 01 | https://freestylized.com/material/corrugated_metal_01/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Textures/1k/corrugated_metal_01_1k.zip |
| Metal 01 | https://freestylized.com/material/metal_01/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Textures/1k/metal_01_1k.zip |
| Metal 02 | https://freestylized.com/material/metal_02/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Textures/1k/metal_02_1k.zip |

**Fabric / textiles**

| Asset | Page | 1k zip |
|---|---|---|
| fabric 01 | https://freestylized.com/material/fabric_01/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Textures/1k/fabric_01_1k.zip |
| fabric 02 | https://freestylized.com/material/fabric_02/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Textures/1k/fabric_02_1k.zip |

**Concrete, plaster, tiles (prison, town)**

| Asset | Page | 1k zip |
|---|---|---|
| Concrete Pillar 01 | https://freestylized.com/material/concrete_pillar_01/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Textures/1k/concrete_pillar_01_1k.zip |
| Concrete Pillar 02 | https://freestylized.com/material/concrete_pillar_02/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Textures/1k/concrete_pillar_02_1k.zip |
| Concrete Slabs 03 | https://freestylized.com/material/concrete_slab_03/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Textures/1k/concrete_slabs_03_1k.zip |
| Bricks wall 05 | https://freestylized.com/material/bricks_wall_05/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Textures/1k/bricks_wall_05_1k.zip |
| Bricks wall 06 | https://freestylized.com/material/bricks_wall_06/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Textures/1k/bricks-wall-06_1k.zip |
| Bricks Wall 16 | https://freestylized.com/material/bricks_wall_16/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Textures/1k/bricks_wall_16_1k.zip |
| Ground Tiles with Sand 01 | https://freestylized.com/material/ground_tiles_with_sand_01/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Textures/1k/ground_tiles_with_sand_01_1k.zip |
| Floor Tiles 01 | https://freestylized.com/material/floor_tiles_01/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Textures/1k/floor_tiles_01_1k.zip |
| ice with grass 01 | https://freestylized.com/material/ice_with_grass_01/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Textures/1k/ice_with_grass_01_1k.zip |
| Floor Tiles 02 | https://freestylized.com/material/floor_tiles_02/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Textures/1k/floor_tiles_02_1k.zip |

**Skies (painted skyboxes, 2k free)**

| Asset | Mood tags | Page | 2k zip |
|---|---|---|---|
| FreeStylized Sky 130 | sunny, 360, cloudy, red, purple | https://freestylized.com/skybox/sky_130/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Skybox/2k/sky_130_2k.zip |
| FreeStylized Sky 128 | sunny, cloudy, blue, misty, horizon | https://freestylized.com/skybox/sky_128/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Skybox/2k/sky_128_2k.zip |
| FreeStylized Sky 124 | sunny, cloudy, blue, misty, horizon | https://freestylized.com/skybox/sky_124/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Skybox/2k/sky_124_2k.zip |
| FreeStylized Sky 133 | cloudy, cloudy, red, purple, horizon | https://freestylized.com/skybox/sky_133/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Skybox/2k/sky_133_2k.zip |
| FreeStylized Sky 131 | cloudy, dusk, golden hour, cloudy, red | https://freestylized.com/skybox/sky_131/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Skybox/2k/sky_131_2k.zip |
| FreeStylized Sky 129 | cloudy, dawn, cloudy, blue, sunny | https://freestylized.com/skybox/sky_129/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Skybox/2k/sky_129_2k.zip |
| FreeStylized Sky 117 | golden_hour, cloudy, red, purple, horizon | https://freestylized.com/skybox/sky_117/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Skybox/2k/sky_117_2k.zip |
| FreeStylized Sky 116 | golden_hour, dusk, golden hour, cloudy, red | https://freestylized.com/skybox/sky_116/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Skybox/2k/sky_116_2k.zip |
| FreeStylized Sky 132 | evening_dusk, dawn, cloudy, blue, sunny | https://freestylized.com/skybox/sky_132/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Skybox/2k/sky_132_2k.zip |
| FreeStylized Sky 111 | evening_dusk, dawn, cloudy, blue, sunny | https://freestylized.com/skybox/sky_111/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Skybox/2k/sky_111_2k.zip |
| FreeStylized Sky 98 | night, night, cloudy, blue, horizon | https://freestylized.com/skybox/sky_98/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Skybox/2k/sky_98_2k.zip |
| FreeStylized Sky 96 | night, night, cloudy, blue, horizon | https://freestylized.com/skybox/sky_96/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Skybox/2k/sky_96_2k.zip |
| FreeStylized Sky 127 | anime, cloudy, blue, misty, horizon | https://freestylized.com/skybox/sky_127/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Skybox/2k/sky_127_2k.zip |
| FreeStylized Sky 126 | anime, cloudy, blue, misty, horizon | https://freestylized.com/skybox/sky_126/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Skybox/2k/sky_126_2k.zip |
| FreeStylized Sky 125 | 90s_anime, cloudy, blue, yellow, horizon | https://freestylized.com/skybox/sky_125/ | https://pub-a67cbe8efa4c4ce3b56e525e91e4c311.r2.dev/Skybox/2k/sky_125_2k.zip |

**3D models (FBX + 2k PBR PNGs, Google Drive)**

| Asset | Themes | Page | Drive file id |
|---|---|---|---|
| Pick Axe 01 | farm, medieval, wild-west | https://freestylized.com/3d_models/pick_axe_01_m88/ | `16vX22jeEe1R8fGfnX6h7gXJ9U8PT4GAU` |
| Ornate key 01 | interior, medieval, wild-west | https://freestylized.com/3d_models/ornate_key_01_m78/ | `1G1MhyaSR3zTKpFY01pXAmvX5vj8un3kB` |
| Pad Lock 01 | industrial, interior, urban | https://freestylized.com/3d_models/pad_lock_01_m79/ | `11k0JeIb70ZwbyshZyWJ4dsv7uN10Gxht` |
| Key 01 | interior, urban | https://freestylized.com/3d_models/key_01_m72/ | `1FS18b9SN0pfAjQzj8QDqZCGBvjBNZxhz` |
| Iron Brazier 01 | medieval, wild-west | https://freestylized.com/3d_models/iron_brazier_01_m27/ | `1WGXYg1KuIEMwY0ECpnnVTQ9U_2ketUau` |
| Shield 01 | medieval, weapons, wild-west | https://freestylized.com/3d_models/shield_01_m25/ | `1HNh_zntN9GlNhqGNYOjpxBhbjpatke1a` |
| Armor 01 | medieval, weapons, wild-west | https://freestylized.com/3d_models/armor_01_m23/ | `1MJ4AbyqY-fEXuVNOmesRDxZP1s2thIcF` |
| Dagger 01 | medieval, weapons, wild-west | https://freestylized.com/3d_models/dagger_01_m24/ | `1mQqo1LTwencez1rfv6LZiQW5wQV2sJ5N` |
| Axe 01 | industrial, weapons, wild-west | https://freestylized.com/3d_models/axe_01_m22/ | `1PCsCDTAXZ44g9J6v1DNLqzzlUJ2Hw7qG` |
| Oil Barrel | industrial, medieval, urban, wild-west | https://freestylized.com/3d_models/oil_barrel_m56/ | `1dSdRAhDFJAiPspMG1wHmUXz8j-mV57zI` |
| Coffin | medieval, wild-west | https://freestylized.com/3d_models/coffin_m50/ | `1NAwbgqP24tpvHc5PGF0SwObnVHqzGemr` |
| Cartwheel | farm, medieval | https://freestylized.com/3d_models/cartwheel_m33/ | `1HUhlZMhje4PgGFuweJyfv1QX-kG2-y1N` |
| SignBoard 01 | medieval, wild-west | https://freestylized.com/3d_models/sign_board_01_m19/ | `1ZJImGlUT_cMh6SkMGit3L7RVZkQXYRyO` |
| NoticeBoard 01 | medieval, wild-west | https://freestylized.com/3d_models/notice_board_01_m18/ | `1UY9GyvS-eJDO5gvVduQrYEumIDwBHwqM` |
| StoneBench 01 | medieval, wild-west | https://freestylized.com/3d_models/stone_bench_01_m13/ | `1xZ-0XsrAeFmsJlq--VBLjrdb0ixmE3Fq` |
| Anvil 01 | industrial, medieval | https://freestylized.com/3d_models/anvil_01_m11/ | `18WyJiVx2HL9Os4k9x-xwp5bJrsC78opf` |
| CandleHolder 01 | medieval, wild-west | https://freestylized.com/3d_models/candle_holder_01_m12/ | `1VX2li9rkHQ3zI9VWw4YDKkJlMjcE2qt3` |
| FirePit 01 | industrial, medieval | https://freestylized.com/3d_models/fire_pit_01_m15/ | `1e2vC5ibvH086ewySOwDqRVQE-s7kR-4U` |
| MetalBucket 01 | farm, industrial, medieval, wild-west | https://freestylized.com/3d_models/metal_bucket_01_m20/ | `17xXzEdpkuwrUR8Q48Z1E6DBgrBgDlky_` |
| Cart | medieval | https://freestylized.com/3d_models/cart2_m10/ | `1oP2Or1OvxLsoKNWp-TA8Qy2IvrBZmv7Y` |
| TableBench | furniture, medieval | https://freestylized.com/3d_models/tablebench_m9/ | `1gLmzDCKdj861P4pqbnhz24E04DWy-KkA` |
| ClayPot | medieval | https://freestylized.com/3d_models/claypot_m8/ | `1YyzDf21XGDXsw7_qgDhrSbLtoXdiMJcW` |
| Barrel | medieval | https://freestylized.com/3d_models/barrel_m3/ | `1XhrqunA6ltNt2fexCKCivbEPbKhTHgkr` |
| CrateBase | medieval, wild-west | https://freestylized.com/3d_models/cratebase_m2/ | `15EUHLermXGODRjnUaaplQbjlGI3vbcrL` |
| BridgeDamage | medieval, wild-west | https://freestylized.com/3d_models/bridgedamage_m1/ | `1BLQASP5kyoPLbVeKMMkGkXI9K_33GqMl` |
| BigBox | medieval | https://freestylized.com/3d_models/bigbox_m5/ | `1LgA4UnvRB92GzQSdZ42k_Vkl26ChZebv` |
| Wheel Barrow 01 | industrial, urban, wild-west | https://freestylized.com/3d_models/wheel_barrow_01_m109/ | `107jJuBeTXLdutAMPpTjggj8zr35Mv8pj` |
| Vintage Sickle Scythe 01 | farm, medieval, wild-west | https://freestylized.com/3d_models/vintage_sickle_scythe_01_m106/ | `1ra-Jp0YJ-52AHUSGEPGxm1ebTSjKuqQZ` |
| Garden Fork 01 | farm, medieval, urban, wild-west | https://freestylized.com/3d_models/garden_fork_01_m64/ | `1WttmoFVvIj9idChXPYm3DqOdAah0Jefx` |
| Watering Can 01 | farm, medieval, wild-west | https://freestylized.com/3d_models/watering_can_01_m107/ | `1YA1S47OwJk2IcpNKOT1dfsXIJ9ooH8i3` |
| Sledge Hammer 01 | industrial, urban, weapons, wild-west | https://freestylized.com/3d_models/sledge_hammer_01_m95/ | `1aLJR9AHYSW83UztU8VNpcD2JXwst8d_2` |
| Rail Flat Bottom | industrial, urban | https://freestylized.com/3d_models/rail_flat_bottom_m41/ | `1XBXCGzOGpQuGwd9VpqGdPFAEurMiv5z9` |
| Steel Ladder | industrial, urban | https://freestylized.com/3d_models/steel_ladder_m58/ | `19VLzB7wj_gVLdO2a2-rdlMAUwKDzmuvl` |
| Roller Chain | industrial | https://freestylized.com/3d_models/roller_chain_m43/ | `1rmLUezISwhdxjj8T9heMnkyExURa9f41` |
| Wooden Boat | medieval | https://freestylized.com/3d_models/wooden_boat_m48/ | `1mtDxfWLo3RFRvDujdjFKfr0sdR46aQd6` |

---

## 3. stylizedworld.com

**What it is.** A small React single-page site ("Free, royalty-free stylized textures, 3D models, sound effects and game assets"). The public JSON API reports `{"totalAssets":61,"freeAssets":61}`: 44 stylised PBR textures, 16 MP3 sound effects, 1 model (Treasure Chest 01, glb + fbx). There are no skies or HDRIs. It is unrelated to freestylized.com and much smaller.

**Licence** (text extracted from the site's Licenses page bundle): "Stylized World License: a royalty-free license with mandatory attribution."

- Allowed: games, films, animations, videos, VFX, client work, unlimited projects, no revenue limit, editing and recolouring.
- Not allowed: redistributing or re-uploading the files as-is, selling them or lightly modified versions, including them in other asset libraries, claiming them as your own, **using them without crediting Stylized World**.
- Required credit, shown "in the game or film credits, the video description, the project page": `Textures by Stylized World — stylizedworld.com` (or `Assets by Stylized World`).

**Login.** "Downloading requires a free Stylized World account with a verified email address." Verified: `POST /api/assets/<slug>/download` with `{"file":"1k"}` returns `401 {"error":"Authentication required"}` without a session. Signup is protected by Cloudflare Turnstile. So this source is **manual download only**: the skill should give the user the asset page URL and ask them to drop the zip into the project.

**Formats.** Textures: zip of JPG maps at 1k, 2k, 4k, plus `.sbsar`. Zip sizes are listed as 2 to 15 MB. SFX: mp3. Model: glb and fbx.

**URL patterns**

| Thing | Pattern |
|---|---|
| Asset page | `https://stylizedworld.com/asset/<slug>` |
| Category page | `https://stylizedworld.com/category/<slug>` (stone, wall, bricks, tiles, water, woods, textures, 3d-assets, grass, sci-fi, roof, vfx, ground, environments, fabric, rocks, sounds) |
| List API | `GET /api/assets?page=N&limit=100&q=<kw>&category=<slug or id>&sort=newest` |
| Asset API | `GET /api/assets/<slug>` (returns `downloadUrls` file names, `fileSize`, `license`) |
| Categories API | `GET /api/categories` |
| Download API | `POST /api/assets/<id>/download` body `{"file":"1k"|"2k"|"4k"|"sbsar"|"model"|"soundEffect"}` → `{"url": ...}` (session cookie required) |
| Thumbnails (public) | `https://s3.eu-central-1.wasabisys.com/cdn.stylizedworld.com/media/assets/...webp` |

`robots.txt` asks for `Crawl-delay: 10`; keep API calls sparse.

**Search (TESTED)**

```bash
curl -s 'https://stylizedworld.com/api/assets?q=roof&limit=50' | jq -r '.items[]|"\(.title)\thttps://stylizedworld.com/asset/\(.slug)\t\(.downloadUrls|keys|join(","))"'
curl -s 'https://stylizedworld.com/api/assets?category=sounds&limit=50' | jq '.totalCount'   # 16
```

**Complete catalogue (61 assets, 2026-11-14)**

| Asset | Kind | Categories | Files | Page |
|---|---|---|---|---|
| Rock with Soil 01 | PBR texture | ground, rocks | 1k, 2k, 4k, sbsar | https://stylizedworld.com/asset/rock-with-soil-01 |
| Temple Wall 03 | PBR texture | wall | 1k, 2k, 4k, sbsar | https://stylizedworld.com/asset/temple-wall-03 |
| Stone Wall 02 | PBR texture | stone, wall | 1k, 2k, 4k, sbsar | https://stylizedworld.com/asset/stone-wall-02 |
| Stone Wall 01 | PBR texture | stone, wall | 1k, 2k, 4k, sbsar | https://stylizedworld.com/asset/stone-wall-01 |
| Wood Floor 04 | PBR texture | woods | 1k, 2k, 4k, sbsar | https://stylizedworld.com/asset/wood-floor-04 |
| Wood Floor 03 | PBR texture | woods | 1k, 2k, 4k, sbsar | https://stylizedworld.com/asset/wood-floor-03 |
| Temple Wall 02 | PBR texture | wall | 1k, 2k, 4k, sbsar | https://stylizedworld.com/asset/temple-wall-02 |
| Temple Wall 01 | PBR texture | wall | 1k, 2k, 4k, sbsar | https://stylizedworld.com/asset/temple-wall-01 |
| Rock and Grass 02 | PBR texture | grass, ground, rocks | 1k, 2k, 4k, sbsar | https://stylizedworld.com/asset/rock-and-grass-02 |
| Ruins Road 01 | PBR texture | ground | 1k, 2k, 4k, sbsar | https://stylizedworld.com/asset/ruins-road-01 |
| Snow Running 01 | SFX (mp3) | sounds | soundEffect | https://stylizedworld.com/asset/snow-running-01 |
| Motorcycle Idle 03 | SFX (mp3) | sounds | soundEffect | https://stylizedworld.com/asset/motorcycle-idle-03 |
| Motorcycle Idle 02 | SFX (mp3) | sounds | soundEffect | https://stylizedworld.com/asset/motorcycle-idle-02 |
| Backpack Zipper 01 | SFX (mp3) | sounds | soundEffect | https://stylizedworld.com/asset/backpack-zipper-01 |
| Rainy Weather 02 | SFX (mp3) | sounds | soundEffect | https://stylizedworld.com/asset/rainy-weather-02 |
| Rock 04 | PBR texture | rocks | 1k, 2k, 4k, sbsar | https://stylizedworld.com/asset/rock-04 |
| Rock 03 | PBR texture | rocks | 1k, 2k, 4k, sbsar | https://stylizedworld.com/asset/rock-03 |
| Rock and Grass 01 | PBR texture | grass, ground, rocks | 1k, 2k, 4k, sbsar | https://stylizedworld.com/asset/rock-and-grass-01 |
| Ice Floor 01 | PBR texture | ground, water | 1k, 2k, 4k, sbsar | https://stylizedworld.com/asset/ice-floor-01 |
| Sand 02 | PBR texture | ground | 1k, 2k, 4k, sbsar | https://stylizedworld.com/asset/sand-02 |
| Stone Tiles 01 | PBR texture | ground, tiles | 1k, 2k, 4k, sbsar | https://stylizedworld.com/asset/stone-tiles-01 |
| Skulls 01 | PBR texture | ground | 1k, 2k, 4k, sbsar | https://stylizedworld.com/asset/skulls-01 |
| Water 01 | PBR texture | water | 1k, 2k, 4k, sbsar | https://stylizedworld.com/asset/water-01 |
| Rock 02 | PBR texture | rocks | 1k, 2k, 4k, sbsar | https://stylizedworld.com/asset/rock-02 |
| Rock 01 | PBR texture | rocks | 1k, 2k, 4k, sbsar | https://stylizedworld.com/asset/rock-01 |
| Lava 04 | PBR texture | ground | 1k, 2k, 4k, sbsar | https://stylizedworld.com/asset/lava-04 |
| Grass 01 | PBR texture | grass, ground | 1k, 2k, 4k, sbsar | https://stylizedworld.com/asset/grass-01 |
| Wood Floor 02 | PBR texture | woods | 1k, 2k, 4k, sbsar | https://stylizedworld.com/asset/wood-floor-02 |
| Stone Floor 04 | PBR texture | ground | 1k, 2k, 4k, sbsar | https://stylizedworld.com/asset/stone-floor-04 |
| Wood Floor 01 | PBR texture | woods | 1k, 2k, 4k, sbsar | https://stylizedworld.com/asset/wood-floor-01 |
| Stone Floor 03 | PBR texture | ground | 1k, 2k, 4k, sbsar | https://stylizedworld.com/asset/stone-floor-03 |
| Stone Floor 02 | PBR texture | ground, tiles | 1k, 2k, 4k, sbsar | https://stylizedworld.com/asset/stone-floor-02 |
| Roof 05 | PBR texture | roof | 1k, 2k, 4k, sbsar | https://stylizedworld.com/asset/roof-05 |
| Roof 04 | PBR texture | roof | 1k, 2k, 4k, sbsar | https://stylizedworld.com/asset/roof-04 |
| Rainy Weather 01 | SFX (mp3) | sounds | soundEffect | https://stylizedworld.com/asset/rainy-weather-01 |
| Motorcycle Idle 01 | SFX (mp3) | sounds | soundEffect | https://stylizedworld.com/asset/motorcycle-idle-01 |
| Snow Walking 02 | SFX (mp3) | sounds | soundEffect | https://stylizedworld.com/asset/snow-walking-02 |
| Treasure Chest 01 | 3D model (glb, fbx) | 3d-assets | model | https://stylizedworld.com/asset/treasure-chest-01 |
| Lava 03 | PBR texture | ground | 1k, 2k, 4k, sbsar | https://stylizedworld.com/asset/lava-03 |
| Zombie Voice 04 | SFX (mp3) | sounds | soundEffect | https://stylizedworld.com/asset/zombie-voice-04 |
| Zombie Voice 03 | SFX (mp3) | sounds | soundEffect | https://stylizedworld.com/asset/zombie-voice-03 |
| Zombie Voice 02 | SFX (mp3) | sounds | soundEffect | https://stylizedworld.com/asset/zombie-voice-02 |
| Zombie Voice 01 | SFX (mp3) | sounds | soundEffect | https://stylizedworld.com/asset/zombie-voice-01 |
| Lava 02 | PBR texture | ground | 1k, 2k, 4k, sbsar | https://stylizedworld.com/asset/lava-02 |
| Roof 03 | PBR texture | roof | 1k, 2k, 4k, sbsar | https://stylizedworld.com/asset/roof-03 |
| Roof 02 | PBR texture | roof | 1k, 2k, 4k, sbsar | https://stylizedworld.com/asset/roof-02 |
| Brick 05 | PBR texture | bricks | 1k, 2k, 4k, sbsar | https://stylizedworld.com/asset/brick-05 |
| Plate Break 02 | SFX (mp3) | sounds | soundEffect | https://stylizedworld.com/asset/plate-break-02 |
| Snow Walking 01 | SFX (mp3) | sounds | soundEffect | https://stylizedworld.com/asset/snow-walking-01 |
| Plate Break 01 | SFX (mp3) | sounds | soundEffect | https://stylizedworld.com/asset/plate-break-01 |
| Brick 04 | PBR texture | bricks | 1k, 2k, 4k, sbsar | https://stylizedworld.com/asset/brick-04 |
| Stone Floor 01 | PBR texture | ground, tiles | 1k, 2k, 4k, sbsar | https://stylizedworld.com/asset/stone-floor-01 |
| Roof 01 | PBR texture | roof | 1k, 2k, 4k, sbsar | https://stylizedworld.com/asset/roof-01 |
| Sand 01 | PBR texture | ground | 1k, 2k, 4k, gltf, sbsar | https://stylizedworld.com/asset/sand-01 |
| Machine Gun Fire 01 | SFX (mp3) | sounds | soundEffect | https://stylizedworld.com/asset/machine-gun-fire-01 |
| Lava 01 | PBR texture | ground | 1k, 2k, 4k, gltf, sbsar | https://stylizedworld.com/asset/lava-01 |
| Desert 01 | PBR texture | ground | 1k, 2k, 4k, sbsar | https://stylizedworld.com/asset/desert-01 |
| Cliff 01 | PBR texture | rocks | 1k, 2k, 4k, sbsar | https://stylizedworld.com/asset/cliff-01 |
| Brick 03 | PBR texture | bricks, wall | 1k, 2k, 4k, sbsar | https://stylizedworld.com/asset/brick-03 |
| Brick 02 | PBR texture | bricks, wall | 1k, 2k, 4k, sbsar | https://stylizedworld.com/asset/brick-02 |
| Brick 01 | PBR texture | bricks | 1k, 2k, 4k, main, sbsar | https://stylizedworld.com/asset/brick-01 |

---

## 4. Sketchfab and the rc2077 "stylized world" collection

Collection: https://sketchfab.com/rc2077/collections/stylized-world-916230cd8cd849759ae5b3995a20fad5 (uid `916230cd8cd849759ae5b3995a20fad5`).

### 4.1 What is in it

The API reports `modelCount: 1732`; 1,726 could be enumerated (full list in `sketchfab-stylized-world-collection.json`).

| Measure | Value |
|---|---|
| Downloadable (`isDownloadable`) | 1,659 of 1,726 |
| Licence: CC BY | 1,518 |
| Licence: CC BY-NC / BY-NC-SA / BY-NC-ND (no monetised use) | 67 / 22 / 18 |
| Licence: CC BY-SA / CC BY-ND | 17 / 1 |
| Licence: CC0 | 1 |
| Sketchfab Store "Free Standard" / "Standard" / "Editorial" | 16 / 17 / 6 |
| No licence (not downloadable) | 43 |
| With a price (store items) | 23 |
| With at least one animation clip | 432 |
| Under 10k faces / under 100k faces / over 500k faces | 423 / 1,299 / 100 |

Top categories: Characters & Creatures 651, Cars & Vehicles 310, Architecture 300, Art & Abstract 228, Animals & Pets 201, Weapons & Military 175, Science & Technology 167, Furniture & Home 113, Nature & Plants 102, Places & Travel 77.

The collection description points to four narrower sibling collections by user `skyroket`: `stylized_scifi-453aa511ecc449f58684de9f6f33dc6c`, `stylize_nvrnmntnprops-fc95ecf1df6744fe8ec19fca81a8dd17` (environments and props, the most useful one here), `stylized_veh-12c3808f5dde4edca763ae0bddb87d87`, `stylized_coolchar-bf377738fbfe4657ad14bb1fac3726a4`.

The API does not expose a per-model "rigged" flag. `animationCount > 0` implies a skeleton or animated transforms; `rigged=true` exists only as a search filter.

A lot of the collection is fan art (Genshin, Blue Archive, Rick and Morty, Pokémon, Nintendo). A CC licence from the uploader does not clear the underlying IP. Skip anything tagged or named as fan art for monetised videos.

**Environment-relevant highlights** (keyword-filtered from the collection: downloadable, CC BY or CC0, free, under 200k faces, sorted by likes; check each page before use)

| Model | uid | Author | Licence | Faces | Anim clips | Likes |
|---|---|---|---|---|---|---|
| [Cloud Station](https://sketchfab.com/3d-models/cloud-station-26f81b24d83441ba88c7e80a52adbaaf) | `26f81b24d83441ba88c7e80a52adbaaf` | AlexaKruckenberg | by | 18742 | 1 | 2411 |
| [stylised sky player home dioroma](https://sketchfab.com/3d-models/stylised-sky-player-home-dioroma-6597e6c9a5184f07a638ac33c08c2ad5) | `6597e6c9a5184f07a638ac33c08c2ad5` | Sander.Vander.Meiren | by | 23379 | 0 | 2265 |
| [The Noble Craftsman](https://sketchfab.com/3d-models/the-noble-craftsman-0e8ff87ffaa24731b2474badebca870d) | `0e8ff87ffaa24731b2474badebca870d` | olmopotums | by | 6976 | 0 | 2172 |
| [" The Neko Stop-off " - Hand-painted Diorama](https://sketchfab.com/3d-models/the-neko-stop-off-hand-painted-diorama-a5ea0bf252884fceabf1007e8050f3fc) | `a5ea0bf252884fceabf1007e8050f3fc` | kid.in.the.dark | by | 7364 | 1 | 1801 |
| [Chunky knight](https://sketchfab.com/3d-models/chunky-knight-f1722ab650ad4d8dbe6fc4bf44e33d38) | `f1722ab650ad4d8dbe6fc4bf44e33d38` | thanhtp | by | 3688 | 0 | 1730 |
| [Low Poly Winter Scene](https://sketchfab.com/3d-models/low-poly-winter-scene-2ffe1ed449414cc184078dd1e2882284) | `2ffe1ed449414cc184078dd1e2882284` | Edwin3D | by | 66662 | 0 | 1482 |
| [Terrarium Bot](https://sketchfab.com/3d-models/terrarium-bot-2040185592db48b29b50d2d6e465bd7c) | `2040185592db48b29b50d2d6e465bd7c` | chrisleeX | by | 40012 | 0 | 1399 |
| [Stylized hand painted scene](https://sketchfab.com/3d-models/stylized-hand-painted-scene-30ddd6d6d8a6491d8b52975c19968099) | `30ddd6d6d8a6491d8b52975c19968099` | Sander.Vander.Meiren | by | 5387 | 1 | 1272 |
| ["The Drunk Troll" Tavern](https://sketchfab.com/3d-models/the-drunk-troll-tavern-6cdc0bdee2df457ebf9ac06a3a9910b8) | `6cdc0bdee2df457ebf9ac06a3a9910b8` | mrrobot | by | 48728 | 0 | 1172 |
| [Sir Frog - Chrono Trigger](https://sketchfab.com/3d-models/sir-frog-chrono-trigger-0af0c15e947143be8fab274841764bf1) | `0af0c15e947143be8fab274841764bf1` | Adrian.Carter3D | by | 167256 | 0 | 1142 |
| [Street Food Vendor Challenge - Kokorec](https://sketchfab.com/3d-models/street-food-vendor-challenge-kokorec-141db37d07fc4ccba84ab5f38a8181b5) | `141db37d07fc4ccba84ab5f38a8181b5` | berkgedik | by | 53516 | 0 | 1141 |
| [Village_Personal Assets](https://sketchfab.com/3d-models/village-personal-assets-9b1959fdbc774d65b75e62069bd82b19) | `9b1959fdbc774d65b75e62069bd82b19` | jakekieferwaddington | by | 33318 | 0 | 1087 |
| [Slum house](https://sketchfab.com/3d-models/slum-house-e902e0af80804d01924387da6af8eecf) | `e902e0af80804d01924387da6af8eecf` | designbureau | by | 127846 | 0 | 1005 |
| [Low Poly Farm V2](https://sketchfab.com/3d-models/low-poly-farm-v2-0e91a96ca6ee44569cf94972e30b5be4) | `0e91a96ca6ee44569cf94972e30b5be4` | Edwin3D | by | 48822 | 0 | 834 |
| [Log Cabin](https://sketchfab.com/3d-models/log-cabin-f4540e14dd8d447d958336e184ffcf8f) | `f4540e14dd8d447d958336e184ffcf8f` | chelC | by | 56811 | 0 | 719 |
| [Desert road](https://sketchfab.com/3d-models/desert-road-48b076dadec243cbb7b7d7d37de097d3) | `48b076dadec243cbb7b7d7d37de097d3` | dzhusione | by | 135150 | 0 | 711 |
| [Solarpunk Village](https://sketchfab.com/3d-models/solarpunk-village-60d34cf693084564848e64eb8eeae0b8) | `60d34cf693084564848e64eb8eeae0b8` | lowPolyBoy | by | 171408 | 0 | 664 |
| [Medieval Tavern (2k vertices) - free game asset](https://sketchfab.com/3d-models/medieval-tavern-2k-vertices-free-game-asset-a06dfdc919334bfc95de720ad98f4295) | `a06dfdc919334bfc95de720ad98f4295` | Andywoodhead | by | 3850 | 0 | 659 |
| [Ruined](https://sketchfab.com/3d-models/ruined-03419281d39d4242bf4d88f665e1035d) | `03419281d39d4242bf4d88f665e1035d` | msmangekyou49 | by | 71698 | 0 | 636 |
| [Pirate building](https://sketchfab.com/3d-models/pirate-building-158b1c2284464854b1ae5c333e9b0544) | `158b1c2284464854b1ae5c333e9b0544` | makcutka250 | by | 4112 | 0 | 630 |
| [Knight witch](https://sketchfab.com/3d-models/knight-witch-671a59e89e4a4299818c9548ab07cbf9) | `671a59e89e4a4299818c9548ab07cbf9` | coffe0wolf | by | 12729 | 0 | 619 |
| [Cocoon in forest](https://sketchfab.com/3d-models/cocoon-in-forest-8ad7aa1df8204fd9b2110811aaed6ad5) | `8ad7aa1df8204fd9b2110811aaed6ad5` | Raghavprasanna | by | 8920 | 0 | 614 |
| [guard](https://sketchfab.com/3d-models/guard-9d21df6ad131402cafb2fb5851683158) | `9d21df6ad131402cafb2fb5851683158` | adamnsexyname | by | 9746 | 0 | 605 |
| [Stylized Big Sword](https://sketchfab.com/3d-models/stylized-big-sword-5eaf1c40861648a98c20c53b4967667d) | `5eaf1c40861648a98c20c53b4967667d` | a_wilczek | by | 11139 | 0 | 598 |
| [Stylized House](https://sketchfab.com/3d-models/stylized-house-6bf3267787494d5283db04cd9aa6ff20) | `6bf3267787494d5283db04cd9aa6ff20` | vegzavr | by | 154392 | 0 | 592 |
| [Environment Taverna Low Poly GameReady assets](https://sketchfab.com/3d-models/environment-taverna-low-poly-gameready-assets-5249d045489941d981f4bc92a84b6877) | `5249d045489941d981f4bc92a84b6877` | kondyba | by | 70537 | 0 | 552 |
| [Arthrav the Catfolk](https://sketchfab.com/3d-models/arthrav-the-catfolk-07047d2c916c4a538878aa9012067a20) | `07047d2c916c4a538878aa9012067a20` | oscarkoraca | by | 61424 | 0 | 539 |
| [Traveler](https://sketchfab.com/3d-models/traveler-f86f5f2a779d496c95c9aca8ba13246f) | `f86f5f2a779d496c95c9aca8ba13246f` | maxpanysh | by | 12118 | 1 | 539 |
| [Medieval House Low Poly (For Gamedev)](https://sketchfab.com/3d-models/medieval-house-low-poly-for-gamedev-07b3c4f707eb4f419170563ede3557e4) | `07b3c4f707eb4f419170563ede3557e4` | dororolft | by | 188748 | 0 | 533 |
| [Knight Cat](https://sketchfab.com/3d-models/knight-cat-adb1d82f85f74ef6b2947b517b6987f6) | `adb1d82f85f74ef6b2947b517b6987f6` | muru | by | 3923 | 0 | 531 |
| [Stylized Tree](https://sketchfab.com/3d-models/stylized-tree-eb71371ebebd482e804b0f8b5a9b6b40) | `eb71371ebebd482e804b0f8b5a9b6b40` | Akishaqs | by | 14106 | 0 | 525 |
| [Tavern. Day 5. FINAL[XYZ School DAILY CHALLENGE]](https://sketchfab.com/3d-models/tavern-day-5-finalxyz-school-daily-challenge-c2f65086eac24c7c86fdb77ea8a418b4) | `c2f65086eac24c7c86fdb77ea8a418b4` | _SeF_ | by | 195637 | 0 | 511 |
| [Crystals](https://sketchfab.com/3d-models/crystals-a94b73bef86c4011ae0d49d6fc4fb1d9) | `a94b73bef86c4011ae0d49d6fc4fb1d9` | geneugene | by | 16202 | 0 | 500 |
| [Medieval house lifecycle](https://sketchfab.com/3d-models/medieval-house-lifecycle-1cb279d26f6347a1a53540e6f78a9b25) | `1cb279d26f6347a1a53540e6f78a9b25` | dmitry.budi | by | 99230 | 0 | 499 |
| [A Welcoming Sign](https://sketchfab.com/3d-models/a-welcoming-sign-10cc6cfc09db45d5b3ddb76ecd758ef5) | `10cc6cfc09db45d5b3ddb76ecd758ef5` | raneman | by | 14377 | 0 | 445 |
| [Egyptian stone mason's shop](https://sketchfab.com/3d-models/egyptian-stone-masons-shop-b709a8ae769345888211c1eeabe7b804) | `b709a8ae769345888211c1eeabe7b804` | gertbraeckman | by | 36258 | 0 | 440 |
| [The Haunted Altar](https://sketchfab.com/3d-models/the-haunted-altar-b4875b6700e24698b82a84a4fe3c9a93) | `b4875b6700e24698b82a84a4fe3c9a93` | orthemid | by | 5079 | 0 | 434 |
| [Stylized tree](https://sketchfab.com/3d-models/stylized-tree-b6fae70b2556459eafaf61f94e284c8b) | `b6fae70b2556459eafaf61f94e284c8b` | dung2606 | by | 10521 | 0 | 379 |
| [Medieval Plaza](https://sketchfab.com/3d-models/medieval-plaza-929e5033556c4b1784f4169d0127ecd5) | `929e5033556c4b1784f4169d0127ecd5` | pigfinite | by | 53278 | 0 | 377 |
| [Mushroom House](https://sketchfab.com/3d-models/mushroom-house-d99d60b4c61a426cb3f8d30599e0c267) | `d99d60b4c61a426cb3f8d30599e0c267` | nickheitzman | by | 167544 | 0 | 374 |
| [Stylized wagon](https://sketchfab.com/3d-models/stylized-wagon-f0647d381ae647a5a5e5f819a152955a) | `f0647d381ae647a5a5e5f819a152955a` | irinakostina | by | 5277 | 0 | 367 |
| [Mouse Warrior](https://sketchfab.com/3d-models/mouse-warrior-f5843cae2392474181f7ffb25bfdaa17) | `f5843cae2392474181f7ffb25bfdaa17` | emilyblane | by | 14470 | 0 | 365 |
| [Gunslinger](https://sketchfab.com/3d-models/gunslinger-ffdf2f4194954bef836b4aa0468062f7) | `ffdf2f4194954bef836b4aa0468062f7` | felipegall | by | 10158 | 0 | 363 |
| [The Tree's Dungeon](https://sketchfab.com/3d-models/the-trees-dungeon-e225326137524a5a94ce8eb756370d47) | `e225326137524a5a94ce8eb756370d47` | Joaquim.Falo | by | 9931 | 0 | 360 |
| [Medieval Fantasy Tavern](https://sketchfab.com/3d-models/medieval-fantasy-tavern-8fbec3f0adbc4376979214fbd46db2f0) | `8fbec3f0adbc4376979214fbd46db2f0` | rixael | by | 115286 | 1 | 359 |

### 4.2 Enumerating a collection (TESTED, no auth)

```bash
U=916230cd8cd849759ae5b3995a20fad5
curl -s "https://api.sketchfab.com/v3/collections/$U" | jq '{name,modelCount}'
curl -s "https://api.sketchfab.com/v3/collections/$U/models?count=24&sort_by=-collectedAt" \
 | jq -r '.next, (.results[]|[.uid,.name,.license.label,.isDownloadable,.faceCount,.animationCount]|@tsv)'
# follow .next (cursor pagination) until null
```

Pitfall found while testing: one page of this collection returns **HTTP 500 "Internal error" at `count=24`** on a fixed cursor, every time. Re-requesting the same cursor with a smaller `count` (12, then 6, 3, 1) gets past it. A paginator must halve `count` on a 500 instead of giving up. `sort_by` accepts `collectedAt` / `-collectedAt`; `-createdAt` and `-likeCount` return 500 on this endpoint.

Search inside a collection (TESTED): `GET /v3/search?type=models&collection=<uid>&q=castle&downloadable=true`.

### 4.3 Searching all of Sketchfab (TESTED, no auth)

```bash
curl -s 'https://api.sketchfab.com/v3/search?type=models&q=stylized+prison+cell&downloadable=true&license=by&max_face_count=150000&sort_by=-likeCount&count=10' \
 | jq -r '.results[]|[.uid,.name,.user.username,.license.label,.faceCount,.animationCount,.likeCount,(.archives.glb.size|tostring),.viewerUrl]|@tsv'
```

Parameters (from the official Swagger at `https://docs.sketchfab.com/data-api/v3/swagger.json`, each one exercised):

| Param | Values / notes |
|---|---|
| `q` | free text |
| `downloadable` | `true` (always set it) |
| `license` | exactly one of `cc0`, `by`, `by-sa`, `by-nd`, `by-nc`, `by-nc-sa`, `by-nc-nd`, `st`, `ed`. A comma list (`by,cc0`) returns HTTP 400: run two queries. |
| `tags` | tag slug, repeatable (`tags=handpainted&tags=medieval`) |
| `categories` | slug: `animals-pets architecture art-abstract cars-vehicles characters-creatures cultural-heritage-history electronics-gadgets fashion-style food-drink furniture-home music nature-plants news-politics people places-travel science-technology sports-fitness weapons-military` |
| `min_face_count`, `max_face_count` | integers |
| `animated`, `rigged`, `staffpicked`, `sound` | booleans |
| `pbr_type` | `metalness`, `specular`, `true`, `false` |
| `file_format` | source format, e.g. `fbx`, `blend` |
| `user`, `collection` | username, collection uid |
| `date` | `1`, `7`, `31` (days) |
| `sort_by` | `-likeCount`, `-viewCount`, `-publishedAt`, `-processedAt` (omit for relevance) |
| `archives_max_size`, `archives_max_face_count`, `archives_texture_max_resolution`, `available_archive_type` | filter on the downloadable archives |
| `archives_flavours` | `true` returns every archive flavour as arrays (changes `.archives.glb` from object to array) |
| `count`, `cursor` | page size (max 24) and cursor from `.next` |

Each result carries `archives.{glb,gltf,usdz,source}.size` in bytes, so file size can be checked before asking for a download. Note that search results give `license.label` (for example "CC Attribution") but no `license.slug`.

Searching for `license=cc0` returns far fewer hits than `by`; the user `Avramania` publishes a large "Low Poly Medieval, CC0" set (towers, haystacks, scarecrow, barrels) that fits fort and farm scenes.

### 4.4 Downloading (token required)

Verified: `GET https://api.sketchfab.com/v3/models/<uid>/download` returns `401 {"detail":"Authentication credentials were not provided."}` with no header and `401 {"detail":"Invalid API token"}` with a bad token. The Swagger lists security `Token` (header `Authorization`) and responses 200, 400 (not downloadable), 401, 403, 404, 429.

Flow (**UNTESTED** end to end, no token was available on this machine):

```bash
# 1. request temporary archive URLs
curl -s -H "Authorization: Token $SKETCHFAB_API_TOKEN" "https://api.sketchfab.com/v3/models/$UID/download" > dl.json
# documented response: {"gltf":{"url":"...","size":N,"expires":300}, "glb":{...}, "usdz":{...}, "source":{...}}
# 2. fetch within ~300 s; prefer glb (single file), else gltf (zip: scene.gltf, scene.bin, textures/, license.txt)
mkdir -p assets/models/$UID
url=$(jq -r '.glb.url // empty' dl.json)
if [ -n "$url" ]; then curl -sL -o assets/models/$UID/model.glb "$url"
else curl -sL -o assets/models/$UID/gltf.zip "$(jq -r .gltf.url dl.json)" && unzip -q assets/models/$UID/gltf.zip -d assets/models/$UID; fi
# 3. record attribution from GET /v3/models/$UID (name, user.username, viewerUrl, license.label, license.url)
```

OAuth2 apps use `Authorization: Bearer <access_token>` instead; a personal API token is enough for this skill.

**What the skill should ask the user for when `SKETCHFAB_API_TOKEN` is unset:**

> To download Sketchfab models I need your free API token. Sign in at sketchfab.com (free account), open https://sketchfab.com/settings/password, copy the value under "API Token", and give it to me as the environment variable `SKETCHFAB_API_TOKEN`. I only use it to fetch models you could download from the site yourself.

Without a token the skill can still search, shortlist with face counts and sizes, and hand the user the model page URLs to download manually ("Download 3D Model" → glTF or GLB).

**Licence handling.** Use `cc0` and `by` only. `by-nc*` cannot be used on monetised channels. `by-nd` forbids adaptations, and a re-lit, re-textured render is arguably one, so skip it. `by-sa` would put a share-alike question on the video, so skip it. `ed` (Editorial) is not for entertainment content. Sketchfab's suggested credit line: `"<Title>" (<viewerUrl>) by <author> is licensed under Creative Commons Attribution (http://creativecommons.org/licenses/by/4.0/).`

---

## 5. Other model, texture and sky sources

### 5.1 Poly Pizza (poly.pizza)

Low-poly models, every one a single GLB. Licence is per model and shown on the model page: `CC0 1.0` (Quaternius, Kay Lousberg, Kenney, many others) or `CC-BY 3.0` (everything from "Poly by Google", plus many individual artists).

- Official API `https://api.poly.pizza/v1.1/search/<kw>` returns `401 "You need an API key"`; keys are free with an account. Not needed.
- The site is server-rendered, and the GLB lives at `https://static.poly.pizza/<uuid>.glb`, where `<uuid>` is the same id as the card thumbnail `https://static.poly.pizza/<uuid>.webp`.

```bash
# TESTED: search → name, author, page, GLB URL
UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
curl -sL -A "$UA" 'https://poly.pizza/search/mine%20cart' | python3 -I -c '
import re,sys
s=sys.stdin.read()
for m in re.finditer(r"<a href=\"(/m/[^\"]+)\"><div class=\"MuiCardMedia-root\" title=\"([^\"]*)\".*?<img src=\"https://static\.poly\.pizza/([0-9a-f-]+)\.webp\".*?href=\"/u/([^\"]+)\"",s,flags=re.S):
    print(m.group(2), "|", m.group(4), "| https://poly.pizza"+m.group(1), "| https://static.poly.pizza/"+m.group(3)+".glb")'
# TESTED: licence of one model (must be read per model)
curl -sL -A "$UA" https://poly.pizza/m/ONdghDBByN -o /tmp/pp.html; grep -oE 'CC0 1\.0|CC-BY [0-9.]+' /tmp/pp.html | head -1
# TESTED: download (75 KB, valid glTF binary v2)
curl -sL -o barrel.glb https://static.poly.pizza/6d3e8847-bda4-4d6c-8004-7b03cf848b13.glb
```

Search pages return 32 cards. Author pages: `https://poly.pizza/u/Quaternius`, `/u/Kay%20Lousberg`, `/u/Kenney`.

### 5.2 Kenney (kenney.nl)

All CC0 ("You can use this content for personal, educational, and commercial purposes. Support by crediting 'Kenney' [...] (this is not a requirement)" in each `License.txt`). 50 3D packs and 10 audio packs were listed. Model zips contain `Models/GLB format`, `FBX format`, `OBJ format` and a shared `Textures/colormap.png`.

Relevant 3D packs: `castle-kit`, `fantasy-town-kit`, `modular-dungeon-kit`, `mini-dungeon`, `modular-cave-kit`, `graveyard-kit`, `survival-kit`, `nature-kit`, `pirate-kit`, `retro-fantasy-kit`, `train-kit`, `tower-defense-kit`, `modular-buildings`, `hexagon-kit`, `mini-characters`, `animated-characters-survivors`, `blocky-characters`. Audio: `rpg-audio`, `impact-sounds`, `interface-sounds`, `music-jingles`, `voiceover-pack`, `ui-audio`, `digital-audio`, `sci-fi-sounds`, `casino-audio`.

- The default curl User-Agent gets **403**; send a browser UA.
- Listing: `https://kenney.nl/assets/category:3D/page:N?sort=update` (also `category:Audio`, `tag:medieval`).
- The asset page's "Continue without donating" link calls `https://kenney.nl/download-link/<id>` where `<id>` is the hex encoding of `assets/<slug>`; it returns a signed, expiring URL.

```bash
# TESTED: castle-kit (2.2 MB, 79 GLB) and rpg-audio (0.9 MB of OGG)
UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
slug=castle-kit
id=$(printf 'assets/%s' "$slug" | xxd -p | tr -d '\n')
url=$(curl -s -A "$UA" -e "https://kenney.nl/assets/$slug" "https://kenney.nl/download-link/$id" | jq -r .url)
mkdir -p assets/kenney/$slug && curl -sL -A "$UA" -o assets/kenney/$slug/pack.zip "$url" && unzip -q assets/kenney/$slug/pack.zip -d assets/kenney/$slug
```

Kenney GLBs reference `Textures/colormap.png` by relative URI. Keep that folder beside the GLB, or embed it: `npx @gltf-transform/cli copy in.glb out.glb` (TESTED).

### 5.3 KayKit (Kay Lousberg)

CC0 (`LICENSE.txt` in every repo: "free to use in personal, educational and commercial projects"). The free tiers are on GitHub under `KayKit-Game-Assets`:

`KayKit-Dungeon-Remastered-1.0` (204 GLBs: walls, bars, barrels, torches, chests), `KayKit-Medieval-Hexagon-Pack-1.0`, `KayKit-Character-Pack-Adventures-1.0` and `KayKit-Character-Pack-Skeletons-1.0` (rigged, animated), `KayKit-City-Builder-Bits-1.0`, `KayKit-Furniture-Bits-1.0`, `KayKit-Restaurant-Bits-1.0`, `KayKit-Halloween-Bits-1.0`, `KayKit-Prototype-Bits-1.0`, `KayKit-Space-Base-Bits-1.0`.

```bash
# TESTED
R=KayKit-Game-Assets/KayKit-Dungeon-Remastered-1.0
curl -s "https://api.github.com/repos/$R/git/trees/main?recursive=1" | jq -r '.tree[]|select(.path|test("\\.glb$"))|.path' | grep -i barrel
curl -sL -o barrel_large.glb "https://raw.githubusercontent.com/$R/main/addons/kaykit_dungeon_remastered/Assets/gltf/barrel_large.gltf.glb"
# whole pack: https://github.com/$R/archive/refs/heads/main.zip
```

Unauthenticated GitHub API calls are limited to 60 per hour; raw file downloads are not.

### 5.4 Quaternius (quaternius.com)

84 packs, all CC0. Two download routes, depending on the pack (the pack page shows which):

- **itch.io (13 newer packs, include glTF)**: Medieval Village MegaKit (153 MB), Fantasy Props MegaKit, Stylized Nature MegaKit, Bestiary Dungeon Monsters Kit and others. Price is "name your own", minimum 0. The free flow works from the command line (TESTED up to the signed file URL, verified with a ranged request, `Content-Type: application/x-zip-compressed`):

```bash
#!/bin/sh
# itch_free.sh <game_url> list            → prints "<upload_id> | <file name> | <size>"
# itch_free.sh <game_url> <upload_id> <outfile>
# Only for pages with min_price 0. Do the steps back to back; the tokens are short-lived.
G="$1"; MODE="${2:-list}"; OUT="$3"
UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'
CJ=$(mktemp); PG=$(mktemp); DL=$(mktemp)
curl -sL -A "$UA" -c "$CJ" "$G" -o "$PG"
csrf=$(grep -oE 'name="csrf_token" value="[^"]+"' "$PG" | head -1 | sed 's/.*value="//;s/"//')
du=$(curl -s -A "$UA" -b "$CJ" -c "$CJ" -X POST --data-urlencode "csrf_token=$csrf" -e "$G" "$G/download_url" | jq -r .url)
[ -z "$du" ] || [ "$du" = "null" ] && { echo "no free download (paid or login-only)" >&2; exit 1; }
curl -sL -A "$UA" -b "$CJ" -c "$CJ" "$du" -o "$DL"
if [ "$MODE" = list ]; then
  python3 -I -c 'import re,sys
s=open(sys.argv[1],encoding="utf8",errors="ignore").read()
for m in re.finditer(r"data-upload_id=\"(\d+)\"",s):
    seg=s[m.start():m.start()+1500]; n=re.search(r"<strong[^>]*title=\"([^\"]+)\"",seg); z=re.search(r"file_size\"><span>([^<]+)",seg)
    print(m.group(1),"|",n.group(1) if n else "?","|",z.group(1) if z else "?")' "$DL"
else
  csrf2=$(grep -oE 'name="csrf_token" value="[^"]+"' "$DL" | head -1 | sed 's/.*value="//;s/"//')
  fu=$(curl -s -A "$UA" -b "$CJ" -X POST --data-urlencode "csrf_token=$csrf2" -e "$du" "$G/file/$MODE?source=game_download" | jq -r .url)
  [ -z "$fu" ] || [ "$fu" = "null" ] && exit 1
  curl -L -A "$UA" -o "$OUT" "$fu"
fi
rm -f "$CJ" "$PG" "$DL"
```

  Passing the `key=` query parameter from the download URL to the `/file/` call returns `{"errors":["invalid key"]}`; leave it out.

- **Public Google Drive folders (71 older packs, FBX/OBJ/Blend only)**: Farm Buildings, Farm Animals, Ultimate Crops, Modular Dungeons, Medieval Dungeon, Modular Medieval Buildings, Ultimate Modular Ruins, Ultimate Animated Character Pack, RPG Characters and others. Folder listing works (TESTED), but file downloads from the Farm Buildings folder returned Google's **"Quota exceeded"** HTML page on every attempt. Treat this route as unreliable.

  Better: the same Quaternius models are on Poly Pizza as ready-made GLBs (`https://poly.pizza/u/Quaternius`), one file each.

```bash
# TESTED: list a public Drive folder without auth
gdls(){ curl -sL -A "$UA" "https://drive.google.com/embeddedfolderview?id=$1#list" | python3 -I -c '
import re,sys,html
s=sys.stdin.read()
for m in re.finditer(r"href=\"https://drive\.google\.com/(file/d/|drive/folders/)([^/\"?]+)[^\"]*\".*?flip-entry-title\">([^<]+)",s,flags=re.S):
    print("DIR " if "folders" in m.group(1) else "FILE", m.group(2), html.unescape(m.group(3)))'; }
gdls 1gdZ39vcLML_ULU5sHirkKQ-gEkk458Ak        # Farm Buildings → Blend/ FBX/ OBJ/ License.txt
# fetch one file (TESTED OK on a 3dtextures.me PNG; quota-blocked on Quaternius FBX)
curl -sL -o file.bin "https://drive.usercontent.google.com/download?id=<fileId>&export=download&confirm=t"
```

### 5.5 Poly Haven (polyhaven.com)

CC0 ("Our assets are all licensed as CC0"). 997 HDRIs (59 "pure skies", 299 in category `skies`), 522 models, 869 textures. Realistic, not stylised: best used for image-based lighting and as detail maps.

```bash
# TESTED
curl -s 'https://api.polyhaven.com/assets?t=hdris&c=pure%20skies' | jq -r 'to_entries[]|"\(.key)\t\(.value.name)"'   # t = hdris|textures|models, c = category
curl -s 'https://api.polyhaven.com/categories/hdris'
curl -s 'https://api.polyhaven.com/files/kloofendal_48d_partly_cloudy_puresky' | jq -r '.hdri["1k"].hdr.url'
curl -sL -o sky_1k.hdr https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/kloofendal_48d_partly_cloudy_puresky_1k.hdr   # 1.4 MB Radiance HDR

# model as glTF: main file plus every "include" (bin + textures), keeping relative paths
id=wooden_barrels_01; mkdir -p assets/ph/$id
curl -s "https://api.polyhaven.com/files/$id" | jq -r --arg id "$id" '.gltf["1k"].gltf | "\(.url)\t\($id).gltf", (.include|to_entries[]|"\(.value.url)\t\(.key)")' \
 | while IFS="$(printf '\t')" read -r u p; do mkdir -p "assets/ph/$id/$(dirname "$p")"; curl -sL -o "assets/ph/$id/$p" "$u"; done

# texture maps
curl -s 'https://api.polyhaven.com/files/castle_brick_02_red' | jq -r '.Diffuse["1k"].jpg.url, .nor_gl["1k"].jpg.url, .Rough["1k"].jpg.url'
```

Poly Haven asks API users to send a descriptive `User-Agent` for anything beyond light use; a generic client name is enough.

### 5.6 ambientCG (ambientcg.com)

CC0 ("All ambientCG assets are provided under the Creative Commons CC0 1.0 Universal License"). The API reported 2,041 materials and 439 HDRIs. Realistic.

```bash
# TESTED
curl -s 'https://ambientcg.com/api/v2/full_json?type=Material&q=cobblestone&limit=5&sort=Popular&include=downloadData,tagData' \
 | jq -r '.foundAssets[]|.assetId as $id|.downloadFolders.default.downloadFiletypeCategories.zip.downloads[]|select(.attribute=="1K-JPG")|"\($id)\t\(.size)\t\(.downloadLink)"'
curl -sL -o PavingStones141_1K.zip 'https://ambientcg.com/get?file=PavingStones141_1K-JPG.zip'
# types: Material, HDRI, Decal, Atlas, Terrain, 3DModel, Substance
```

### 5.7 3dtextures.me

"All textures on this site are licensed as CC0." About 1,300 textures by João Paulo, many explicitly stylised and hand-painted (`https://3dtextures.me/tag/stylized/`, 2 pages: Stylized Bricks, Stone Floor, Cliff Rock, Terracotta Tiles and so on). Each post links one public Google Drive folder holding 1024 px PNGs: `*_basecolor.png`, `*_normal.png`, `*_roughness.png`, `*_ambientOcclusion.png`, `*_height.png`.

```bash
# TESTED: post → Drive folder id → file ids → download (basecolor PNG, 1.7 MB, 1024x1024)
fid=$(curl -sL -A "$UA" https://3dtextures.me/2024/08/21/stylized-bricks-005/ | grep -oE 'drive\.google\.com/drive/folders/[A-Za-z0-9_-]+' | head -1 | sed 's#.*/##')
gdls "$fid"     # function from 5.4
curl -sL -o basecolor.png "https://drive.usercontent.google.com/download?id=<fileId>&export=download"
```

### 5.8 OpenGameArt (opengameart.org)

No API. Each entry has its own licence, shown on the page: CC0, CC BY 3.0/4.0, CC BY-SA, OGA-BY, GPL. Filter for CC0 and CC BY; avoid GPL and BY-SA for video.

```bash
# TESTED: advanced search. art type: 9=2D 10=3D 14=Texture 12=Music 13=Sound Effect; licence: 4=CC0 2=CC-BY 3.0 17981=CC-BY 4.0 10310=OGA-BY 3.0
curl -sL -A "$UA" 'https://opengameart.org/art-search-advanced?keys=medieval&field_art_type_tid%5B%5D=10&field_art_licenses_tid%5B%5D=4&sort_by=count&sort_order=DESC' | grep -oE 'href="/content/[^"]+"' | sort -u
# files are plain links on the content page
curl -sL -A "$UA" https://opengameart.org/content/lowpoly-medieval-village-pack | grep -oE 'https://opengameart.org/sites/default/files/[^"]+\.(zip|blend|glb|ogg|wav|mp3)'
```

### 5.9 three.js example assets

`https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/models/gltf/<file>` (TESTED), also on jsDelivr: `https://cdn.jsdelivr.net/gh/mrdoob/three.js@r170/examples/models/gltf/Soldier.glb`. Licences vary per file and are stated in the example HTML or a README, not centrally:

| File | Licence |
|---|---|
| `RobotExpressive/RobotExpressive.glb` | CC0 1.0 (Tomás Laulhé, i.e. Quaternius). Rigged, many clips, morph-target faces. Safe placeholder character. |
| `Soldier.glb`, `Xbot.glb`, `Michelle.glb` | Mixamo characters (Adobe terms) |
| `LittlestTokyo.glb` | CC Attribution, Glen Fox. Draco-compressed. |
| `Horse.glb`, `Flamingo.glb`, `Parrot.glb`, `Stork.glb` | "model by mirada from rome": no licence stated, tests only |
| `examples/textures/equirectangular/*.hdr` | Poly Haven CC0 HDRIs at 1k (venice_sunset, blouberg_sunrise_2, spruit_sunrise, quarry_01, ...) |

### 5.10 Mixamo (mixamo.com)

- Needs an Adobe ID (free); downloads happen in the browser. `GET https://www.mixamo.com/api/v1/products` returns 403 without the site's client header, and exporting requires a logged-in bearer token. Treat as **manual**: the user uploads a character, picks animations and downloads "FBX for Unity, without skin" or "FBX Binary, with skin".
- Licence, per Adobe's Mixamo FAQ (page blocked direct fetching; confirmed through search results of helpx.adobe.com and Adobe community staff answers): characters and animations may be used royalty-free in personal, commercial and non-profit projects, including films and games; no credit required; raw character and animation files may not be redistributed; not for training ML models.
- Without Blender, load Mixamo FBX with Three.js `FBXLoader`, or convert with `assimpjs` (see section 8).
- CC0 alternatives that need no login: RobotExpressive, KayKit character packs, Quaternius "Ultimate Animated Character Pack", Kenney `mini-characters` and `animated-characters-*`.

---

## 6. Audio

"Monetised" below means YouTube Partner Program, TikTok and Instagram.

| Source | Licence | Credit | Monetised YouTube / TikTok / Instagram | CLI |
|---|---|---|---|---|
| Kenney audio | CC0 | No | Yes | Yes (section 5.2) |
| Mixkit SFX and music | Mixkit Free License | No | Yes per Mixkit ("commercial projects (YouTube videos, social media marketing, online ads, music videos)") | Yes |
| Incompetech (Kevin MacLeod) | CC BY 4.0 | **Yes**, exact format below | Yes ("you can monetize the videos. Be sure to credit me.") | Yes |
| Freesound | per sound | CC0 no; CC BY yes | CC0 and CC BY yes; CC BY-NC no | Token: search + mp3 previews. Originals need OAuth2 |
| Pixabay | Pixabay Content License | No | Yes, but Content ID claims happen | No |
| Sonniss #GameAudioGDC | Sonniss GDC licence v2.0 | No | Yes | Technically, but 9 to 48 GB per bundle |
| YouTube Audio Library | YouTube licence, or CC BY | Only CC BY tracks | YouTube: yes, safe from Content ID. Other platforms: not addressed, avoid | No |
| Free Music Archive | per track (CC BY, BY-SA, BY-NC, BY-ND, CC0...) | Yes unless CC0 | Only CC BY and CC0 tracks | No |
| ZapSplat | Standard licence | **Yes** on free accounts | Yes with credit | No (account, mp3, rate-limited) |
| OpenGameArt | per item | per item | CC0 / CC BY yes | Yes |
| Stylized World SFX | Stylized World License | **Yes** | Yes | No (login) |

### 6.1 Mixkit

SFX: `https://mixkit.co/free-sound-effects/<category>/` (door, metal, footsteps, whoosh, cartoon, chain, ambience, animals, ...). Each card exposes `data-audio-player-item-id-value="<id>"`; the files are:

- WAV: `https://assets.mixkit.co/active_storage/sfx/<id>/<id>.wav`
- MP3 preview: `https://assets.mixkit.co/active_storage/sfx/<id>/<id>-preview.mp3`
- Music: `https://assets.mixkit.co/music/<id>/<id>.mp3` (categories such as `/free-stock-music/cowboy-western/`, `/cinematic/`, `/children/`)

```bash
# TESTED: list ids + titles in a category, then download WAV (16-bit 44.1 kHz stereo)
curl -sL -A "$UA" https://mixkit.co/free-sound-effects/metal/ | python3 -I -c '
import re,sys,html
s=sys.stdin.read()
for m in re.finditer(r"data-audio-player-item-id-value=\"(\d+)\"",s):
    t=re.search(r"item-grid-card__title[^>]*>\s*(?:<a[^>]*>)?\s*([^<]+)",s[m.start():m.start()+3000]); print(m.group(1), html.unescape(t.group(1).strip()) if t else "?")'
curl -sL -o prison_door.wav https://assets.mixkit.co/active_storage/sfx/201/201.wav     # "Prison metal door close"
```

Verified ids: 201 Prison metal door close, 1523 Heavy sliding door, 195 Creaky door open, 194 Slamming a door, 197 Knocking on a thick wooden door, 833 Metal hammer hit, 2858 Gear metallic lock sound, 2160 Metallic sword strike, 543 Footsteps in a tunnel loop, 1269 Walking on stones loop, 532 Footsteps on tall grass, 1492 Cinematic whoosh fast transition, 744 Trombone disappoint, 473 Cartoon failure piano, 2894 Boing hit sound, 616 Cartoon toy whistle.

Licence caveat: the licence page (https://mixkit.co/license/) renders its text with JavaScript and could not be read by curl or the fetch tool. The summary above is from Mixkit's own `https://mixkit.co/llm-info/` page: "Free License: Allows use in commercial projects [...] No attribution required", items "cannot be resold in their original form". Mixkit also has a "Restricted License" on some items (personal use only): check the item page shows the Free License.

### 6.2 Incompetech

Catalogue JSON (TESTED, 1,443 tracks with title, filename, length, bpm, feel, instruments, ISRC):

```bash
curl -sL -A "$UA" https://incompetech.com/music/royalty-free/pieces.json -o pieces.json
jq -r '.[]|select((.feel+" "+.description)|test("medieval|humorous";"i"))|"\(.title)\t\(.length)\t\(.bpm)\t\(.feel)"' pieces.json
curl -sL -A "$UA" -o 'The Britons.mp3' 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/The%20Britons.mp3'   # 12 MB, 320 kbps
```

Required credit (from the site FAQ), in the video description or on screen:

```
<Title> Kevin MacLeod (incompetech.com)
Licensed under Creative Commons: By Attribution 4.0
https://creativecommons.org/licenses/by/4.0/
```

Fitting tracks (all verified present and downloadable): The Britons, Village Consort, Master of the Feast, Minstrel Guild, Thatched Villagers, Suonatore di Liuto (medieval); Wagon Wheel, Western Streets, Cowboy Sting, Desert City (old west); Sneaky Snitch, Marty Gots a Plan, Hidden Agenda, Investigations (scheming, prison break); Monkeys Spinning Monkeys, Fluffing a Duck, Run Amok, Le Grand Chase (comedy, chase); Crypto, Darkest Child (dark); Carefree (farm). These are among the most-used tracks on the internet; viewers will recognise them, which may or may not suit the piece.

### 6.3 Freesound

- `GET /apiv2/search/text/` without credentials returns 401 (verified). A free API key comes from https://freesound.org/apiv2/apply (account required). Send it as `?token=KEY` or `Authorization: Token KEY`.
- Token auth covers search and metadata, including `previews` (mp3/ogg preview URLs). "Download Sound (OAuth2 required)": the original file needs the OAuth2 flow. For short-video SFX the HQ mp3 preview is normally enough.

```bash
# UNTESTED (no key on this machine); syntax from the official docs
curl -s "https://freesound.org/apiv2/search/text/?query=cell+door&filter=license:%22Creative+Commons+0%22+duration:%5B0+TO+8%5D&sort=rating_desc&fields=id,name,license,username,duration,previews&token=$FREESOUND_API_KEY" \
 | jq -r '.results[]|"\(.id)\t\(.name)\t\(.username)\t\(.previews["preview-hq-mp3"])"'
```

Ask the user for `FREESOUND_API_KEY` only if Kenney and Mixkit do not have the sound.

### 6.4 Pixabay (music and SFX)

- Licence summary (https://pixabay.com/service/license-summary/): free use, no attribution required, modification allowed; not allowed: selling or distributing the content standalone.
- `curl https://pixabay.com/sound-effects/search/...` returns **403 with a Cloudflare "Just a moment" challenge** (verified). The official API (`https://pixabay.com/api/`) needs a key and covers images and videos only. So audio is **manual download**: give the user a search URL such as `https://pixabay.com/music/search/medieval%20comedy/` and ask for the mp3.
- Some Pixabay composers register tracks with YouTube Content ID, so a claim can appear on a legitimately licensed track. Pixabay offers a licence certificate next to the download button for logged-in users, to dispute the claim (secondary sources; not verified on Pixabay's own page).

### 6.5 Sonniss #GameAudioGDC

Licence v2.0 (effective 27 August 2026, https://sonniss.com/gdc-bundle-license/): "worldwide, non-exclusive, royalty-free", "personal and commercial projects without attribution"; may not be sold or redistributed as sound effects; "expressly prohibited from using any sound effects [...] for the purpose of training" AI. Bundles are direct zips on `downloads.sonniss.com` plus torrents, split in 5 to 14 parts: 2024 is 23.5 GB, 2021-2023 38.7 GB, 2020 48.2 GB, 2015 9 GB. The listing page returned 403 to curl (Cloudflare) but opened in the fetch tool. Verdict: excellent quality, wrong size for an automated per-video fetch. Use only if the user already has a bundle on disk.

### 6.6 YouTube Audio Library

"The Audio Library is found exclusively in YouTube Studio" (sign-in required, so manual). Two licence types: standard (no attribution) and Creative Commons ("you must credit the artist in your video's description"; Studio provides the text to copy). "Copyright-safe music and sound effects downloaded from the Audio Library won't be claimed by a rights holder through the Content ID system", and Partner Program members can monetise. The help page says nothing about use outside YouTube, so do not use these tracks for TikTok or Instagram cuts.

### 6.7 Free Music Archive and ZapSplat

- FMA: per-track Creative Commons licences. Only CC BY and CC0 tracks suit monetised video (BY-NC forbids commercial use, BY-ND forbids use in video, BY-SA forces share-alike). Credit must include title, artist, source and licence. Manual download.
- ZapSplat: licence page returned 403 to both curl and the fetch tool. From search results of zapsplat.com pages: a free (Basic) account is required to download, free members get MP3 only, must credit ZapSplat ("clear credit [...] wherever reasonably possible"), and download-rate limits apply; sources disagree on the exact limit. Manual, lowest priority.

---

## 7. Caption fonts (heavy rounded sans, black stroke)

All from the `google/fonts` GitHub repo, so one curl each (all returned HTTP 200; Lilita One downloaded and verified as TrueType). Base: `https://raw.githubusercontent.com/google/fonts/main/`. OFL 1.1 and Apache 2.0 both allow commercial use in video with no credit.

| Font | Path | Licence | Notes |
|---|---|---|---|
| Lilita One | `ofl/lilitaone/LilitaOne-Regular.ttf` | OFL | Best default: heavy, rounded, compact |
| Titan One | `ofl/titanone/TitanOne-Regular.ttf` | OFL | Fatter, more cartoon |
| Luckiest Guy | `apache/luckiestguy/LuckiestGuy-Regular.ttf` | Apache 2.0 | All-caps comic |
| Fredoka | `ofl/fredoka/Fredoka%5Bwdth,wght%5D.ttf` | OFL | Variable; use weight 700 |
| Baloo 2 | `ofl/baloo2/Baloo2%5Bwght%5D.ttf` | OFL | Variable; weight 800 |
| Nunito | `ofl/nunito/Nunito%5Bwght%5D.ttf` | OFL | Variable; weight 900 to 1000 |
| M PLUS Rounded 1c Black | `ofl/mplusrounded1c/MPLUSRounded1c-Black.ttf` | OFL | Wide language coverage |
| Sniglet ExtraBold | `ofl/sniglet/Sniglet-ExtraBold.ttf` | OFL | Bubbly |
| DynaPuff | `ofl/dynapuff/DynaPuff%5Bwdth,wght%5D.ttf` | OFL | Variable; puffy |
| Sour Gummy | `ofl/sourgummy/SourGummy%5Bwdth,wght%5D.ttf` | OFL | Variable |
| Paytone One | `ofl/paytoneone/PaytoneOne-Regular.ttf` | OFL | |
| Cherry Bomb One | `ofl/cherrybombone/CherryBombOne-Regular.ttf` | OFL | |
| Poetsen One | `ofl/poetsenone/PoetsenOne-Regular.ttf` | OFL | |
| Bowlby One | `ofl/bowlbyone/BowlbyOne-Regular.ttf` | OFL | Ultra heavy |
| Chango | `ofl/chango/Chango-Regular.ttf` | OFL | |
| Bangers | `ofl/bangers/Bangers-Regular.ttf` | OFL | Slanted comic caps |

```bash
# TESTED
curl -sL -o fonts/LilitaOne-Regular.ttf https://raw.githubusercontent.com/google/fonts/main/ofl/lilitaone/LilitaOne-Regular.ttf
# static TTF via the CSS API also works: curl -s 'https://fonts.googleapis.com/css2?family=Lilita+One' | grep -oE 'https://fonts.gstatic.com[^)]+'
```

`https://fonts.google.com/download?family=...` now returns an HTML app page, not a zip; do not use it. Luckiest Guy lives under `apache/`, not `ofl/`.

Stroke: in HTML/canvas overlays use `-webkit-text-stroke: 10px #000; paint-order: stroke fill;` (stroke behind the fill, so letters stay fat); in ffmpeg use `drawtext=fontfile=...:borderw=8:bordercolor=black`.

---

## 8. Pipeline: getting assets into Three.js without Blender

### 8.1 Format routes

| Source format | Route | Status |
|---|---|---|
| GLB / glTF | `GLTFLoader` directly | Preferred. Kenney, KayKit, Poly Pizza, Poly Haven, Sketchfab all provide it |
| glTF with external files | keep the folder structure, or pack: `npx @gltf-transform/cli copy in.gltf out.glb` | TESTED |
| OBJ (+MTL) | `npx obj2gltf -i in.obj -o out.glb` (v3.2.0) | TESTED on a Kenney OBJ |
| FBX | `assimpjs` (WebAssembly, v0.0.10) via the script below | TESTED on FreeStylized and Kenney FBX: geometry, UVs, normals convert; materials come out as `DefaultMaterial`, so assign textures in code |
| FBX | `FBX2glTF` from npm `fbx2gltf` (0.9.7-p1) | **FAILS here**: the bundled macOS binary is x86_64 and this Mac has no Rosetta ("bad CPU type in executable"). Works on Intel or with Rosetta installed. |
| FBX | Three.js `FBXLoader` at runtime | UNTESTED here; standard loader, the simplest route for Mixamo animation clips |
| `.blend`, `.sbsar` | none without Blender / Substance | pick another format |

`assimp` is not installed and Homebrew is present (`brew install assimp` would give the native CLI: UNTESTED).

```js
// assimp_convert.mjs  — TESTED:  npm i assimpjs && node assimp_convert.mjs in.fbx out.glb
import fs from 'node:fs'; import path from 'node:path'; import assimpjs from 'assimpjs';
const [,, input, output, ...extra] = process.argv;          // extra: .mtl or other sidecar files
const ajs = await assimpjs(); const list = new ajs.FileList();
for (const f of [input, ...extra]) list.AddFile(path.basename(f), new Uint8Array(fs.readFileSync(f)));
const res = ajs.ConvertFileList(list, output.endsWith('.glb') ? 'glb2' : 'gltf2');
if (!res.IsSuccess() || res.FileCount() === 0) { console.error('assimp failed:', res.GetErrorCode()); process.exit(1); }
fs.writeFileSync(output, res.GetFile(0).GetContent());
```

### 8.2 Optimising with glTF-Transform

`npx -y @gltf-transform/cli --help` works here (v4.5.1; first run installs in about a minute).

```bash
# all TESTED on the Poly Haven wooden_barrels_01 glTF (7.49 MB in)
npx -y @gltf-transform/cli inspect model.glb                                  # scenes, meshes, textures, vertex counts
npx -y @gltf-transform/cli optimize in.gltf out.glb --compress meshopt --texture-compress webp --texture-size 512   # → 608 KB
npx -y @gltf-transform/cli resize in.gltf out.glb --width 512 --height 512    # → 1.79 MB
npx -y @gltf-transform/cli draco in.glb out.glb                               # → 720 KB
npx -y @gltf-transform/cli validate out.glb
# other subcommands present: dedup prune weld simplify join flatten instance palette quantize center unlit metalrough etc1s uastc avif
```

Loader requirements in Three.js:

- `--compress meshopt` → `loader.setMeshoptDecoder(MeshoptDecoder)`
- `draco` → `DRACOLoader`
- WebP textures → nothing extra
- KTX2 (`etc1s`, `uastc`) → `KTX2Loader` plus the Basis transcoder, and the commands need the KTX-Software `ktx` CLI, which is **not installed here (UNTESTED)**. WebP is the practical choice for offline-rendered video.

For a rendered video, download size barely matters; optimise for GPU memory and load time. `--texture-size 1024` and no geometry compression is a sensible default. `simplify` only for models above about 300k faces.

### 8.3 Textures

```bash
# TESTED: resize / convert with macOS sips (no install)
sips -Z 512 -s format jpeg -s formatOptions 85 in.png --out out_512.jpg       # 1024 px PNG 1.2 MB → 60 KB
```

The ffmpeg build on this machine has no WebP encoder ("Default encoder for format webp is probably disabled", TESTED), so do WebP through gltf-transform (it bundles sharp) rather than ffmpeg.

Wiring a FreeStylized set to `MeshStandardMaterial`:

- `*_color*.png` → `map`, with `texture.colorSpace = THREE.SRGBColorSpace`
- `*_normal_gl*.png` → `normalMap` (use the **GL** file; the DX file has the green channel flipped)
- `*_roughness*.png` → `roughnessMap`; `*_ambient_occlusion*.png` → `aoMap`; `*_height*.png` → optional `displacementMap`
- every map: `wrapS = wrapT = THREE.RepeatWrapping`, set `repeat` by world size (about one tile per 2 m)
- for a flatter toon look, use only the colour map on `MeshToonMaterial` and skip normal and roughness

Skies:

- FreeStylized `sky_XX_2k.png` is equirectangular: `tex.mapping = THREE.EquirectangularReflectionMapping; tex.colorSpace = THREE.SRGBColorSpace; scene.background = tex`. Or load the six faces with `CubeTextureLoader` in the order `px, nx, py, ny, pz, nz`.
- It is LDR, so it will not light the scene well. Light with a Poly Haven `.hdr` through `RGBELoader` (called `HDRLoader` in recent three releases) and `PMREMGenerator` as `scene.environment`, or just use hemisphere and directional lights.

### 8.4 Audio

```bash
# TESTED
ffmpeg -v error -y -i doorClose_1.ogg -ar 48000 -ac 2 doorClose_1.wav
ffmpeg -v error -y -i 'The Britons.mp3' -t 20 -af 'loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=out:st=18:d=2' -c:a aac -b:a 192k bed_20s.m4a
```

### 8.5 "No model found" fallback ladder

1. **Catalogue**: grep `asset-catalog.json` by tag (`jq '.[]|select(.type=="model" and (.tags|index("prison")))'`).
2. **CC0 kits**: Kenney (`modular-dungeon-kit`, `castle-kit`, `modular-cave-kit`, `fantasy-town-kit`, `nature-kit`), KayKit Dungeon and Medieval Hexagon. Modular pieces cover walls, floors, bars, doors, towers.
3. **Poly Pizza search** with 2 or 3 synonyms (`jail`, `prison`, `cell bars`). Take CC0 first.
4. **FreeStylized models** via the REST search (props only).
5. **Quaternius** pack through the itch.io flow if a whole themed kit is needed (Medieval Village MegaKit, Stylized Nature MegaKit).
6. **Sketchfab search API**, `license=cc0` then `license=by`, `max_face_count=150000`, reject fan art. If `SKETCHFAB_API_TOKEN` is missing, ask for it once (text in 4.4) and meanwhile continue down the ladder.
7. **Poly Haven / OpenGameArt** for the remaining gaps (restyle realistic assets with flat or toon materials).
8. **Kitbash in Three.js**: most cartoon set pieces are primitives. Bars: `CylinderGeometry` array. Walls: `BoxGeometry` with a FreeStylized stone texture. Towers: cylinder plus `ConeGeometry` roof. Rails: extruded profile along a `CatmullRomCurve3`. Mine cart: box plus four cylinders. Fences and planks: instanced boxes with small random rotations. Rocks: `IcosahedronGeometry` (detail 1) with vertex noise and flat shading. Trees: cone stacks or icosphere blobs on a cylinder. Terrain: displaced `PlaneGeometry`. Add bevels (`RoundedBoxGeometry`), slight non-uniform scale and a toon ramp, and it reads as intentional style.
9. **Ask the user**: state exactly what is missing, offer the two closest candidates found, and give manual-download links (Stylized World, Pixabay, Mixamo, Sketchfab page) with the folder to drop the file into.

Stop at the first rung that gives an acceptable asset; do not mix a photoscanned Poly Haven prop into a flat-shaded Kenney scene without restyling it.

---

## 9. Attribution and the credits file

Every downloaded asset gets a row, including CC0 ones (it is the provenance record that answers a copyright claim). Write it at download time, not at the end.

`assets/CREDITS.json` (one per video project):

```json
[
  {
    "file": "assets/models/prison_cage.glb",
    "title": "Low-Poly Prison Cage – Free Game Asset",
    "author": "BuntyS",
    "source": "sketchfab.com",
    "page_url": "https://sketchfab.com/3d-models/...-133ab66f21de45f0848b2602e014a00f",
    "license": "CC BY 4.0",
    "license_url": "https://creativecommons.org/licenses/by/4.0/",
    "credit_required": true,
    "modified": "retextured, decimated",
    "downloaded": "2026-11-14",
    "used_in": ["scene_02"]
  }
]
```

Generate `CREDITS.txt` from it for the video description. Required lines only for `credit_required: true`; listing the rest under "Also used (CC0)" is optional.

```
3D models
"Low-Poly Prison Cage" (https://skfb.ly/...) by BuntyS, licensed under CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/). Modified.
"Saloon" by Poly by Google [CC BY 3.0] via Poly Pizza (https://poly.pizza/m/...)
Textures by Stylized World — stylizedworld.com

Music
Sneaky Snitch Kevin MacLeod (incompetech.com)
Licensed under Creative Commons: By Attribution 4.0
https://creativecommons.org/licenses/by/4.0/

Also used (no credit required): Kenney (kenney.nl), KayKit by Kay Lousberg, Quaternius, FreeStylized.com, Poly Haven, Mixkit
```

Credit duties by source:

| Duty | Sources |
|---|---|
| **Credit required** | Sketchfab CC BY (title, author, link, licence, "modified" if changed); Poly Pizza CC BY 3.0 models; Stylized World; Incompetech; Freesound CC BY; FMA; ZapSplat free tier; YouTube Audio Library CC tracks; LittlestTokyo |
| Credit optional | FreeStylized, Kenney, KayKit, Quaternius, Poly Haven, ambientCG, 3dtextures.me, Mixkit, Pixabay, Sonniss, Mixamo, Google Fonts |
| Never usable in monetised video | anything CC BY-NC*, Sketchfab "Editorial", Mixkit "Restricted License" items |

CC BY credits must be reachable from where the video is published: put them in the YouTube description; on TikTok and Instagram put them in the caption or a pinned comment (or an end card), since there is no long description field.

---

## 10. Pitfalls

1. **FreeStylized file names**: 43 assets do not follow the slug pattern. Scrape the page or use `freestylized-index.json`.
2. **FreeStylized 4k zips are about 190 MB**; skies are free only at 2k; asset packs and smart materials are Patreon-only and not CC0.
3. **Google Drive returns HTTP 200 with an HTML page** when a file hits its download quota (hit on Quaternius FBX files during testing). Always check the file type after download (`file x | grep -q 'Zip archive'`, or the `glTF` magic for GLB).
4. **Kenney blocks the default curl User-Agent** (403) and its download URLs are signed and expire: resolve and download in one step.
5. **Sketchfab collection pagination can 500**; halve `count` and retry. `license` takes one value only. Search results omit `license.slug`.
6. **Sketchfab downloads need a token**, and the archive URLs expire in about 300 seconds: request and download back to back.
7. **Fan art on Sketchfab** carries a CC licence from the uploader but not from the IP owner. Skip named franchises.
8. **Poly Pizza licences are per model**; "Poly by Google" is always CC BY 3.0 (credit needed).
9. **itch.io free flow**: tokens are short-lived (do all three requests back to back) and the `/file/` call must not carry the `key` parameter. Only for pages with minimum price 0.
10. **Stylized World and FreeStylized are different sites** with different rules: Stylized World requires credit and a login.
11. **FBX2glTF's npm binary is Intel-only**; on Apple Silicon without Rosetta use assimpjs or FBXLoader.
12. **assimpjs drops material/texture links** for FBX files with separate texture folders: build the material in code.
13. **Kenney GLBs have an external texture** (`Textures/colormap.png`): copying only the `.glb` gives an untextured model.
14. **Normal maps**: use `*_normal_gl` / `nor_gl` / `NormalGL` for Three.js, never the DX variant.
15. **Painted skies are LDR**: fine as background, not as the only light source.
16. **Draco / Meshopt / KTX2 need the matching decoder** set on `GLTFLoader` (LittlestTokyo is Draco-compressed).
17. **This ffmpeg build cannot encode WebP**; KTX tools are not installed.
18. **Pixabay and Sonniss pages are behind Cloudflare** (403 to curl). Pixabay's API has no audio endpoint.
19. **YouTube Audio Library tracks are only documented as safe on YouTube**; do not reuse them on TikTok or Instagram cuts.
20. **Content ID**: popular free tracks (Pixabay, even some CC BY music) can trigger claims. Keep `CREDITS.json` with page URL and download date as evidence; Incompetech tracks carry an ISRC in `pieces.json`.
21. **Mixkit licence text is JavaScript-rendered**; the "no attribution, commercial OK" statement is from Mixkit's own summary page, and some Mixkit items carry a personal-use-only "Restricted License".
22. **Rate limits and manners**: GitHub API 60 requests per hour unauthenticated; stylizedworld.com asks for a 10 second crawl delay; keep scraping loops slow and cache listings.
23. **Untrusted downloads**: unzip each archive into its own empty folder, never run anything from it, and check the extension and magic bytes before loading.

---

## 11. What was actually downloaded during testing

Each into its own folder under `research/_assets_test/`:

| Source | File | Result |
|---|---|---|
| FreeStylized texture | `roof_tiles_04_1k.zip` | 4.4 MB, 6 PNG maps (deleted) |
| FreeStylized skybox | `sky_27_2k.zip` | 3.4 MB, equirect + 6 faces (faces kept) |
| FreeStylized model | Fire Pit 01 via Google Drive | 8.6 MB zip, FBX + 5 PNGs (deleted; converted GLB kept) |
| Poly Haven | pure-sky HDR 1k; `wooden_barrels_01` glTF + 10 includes | OK (deleted; optimised GLBs kept) |
| ambientCG | `EveningSkyHDRI049B_1K.zip` | 2.6 MB (deleted) |
| Kenney | `castle-kit.zip`, `rpg-audio.zip` | 2.2 MB, 0.9 MB (zips deleted; sample tower and door sound kept) |
| KayKit | `barrel_large.gltf.glb` | 44 KB (kept) |
| Poly Pizza | Quaternius Barrel GLB | 75 KB (kept) |
| three.js | `RobotExpressive.glb` | 464 KB (kept) |
| 3dtextures.me | Stylized Bricks 005 basecolor via Drive | 1.7 MB PNG (deleted) |
| Quaternius via Drive | `Barn.fbx`, `Silo.fbx` | **failed**: "Quota exceeded" page |
| Quaternius via itch.io | Medieval Village MegaKit | signed URL resolved and range-checked (153 MB, not downloaded) |
| Mixkit | sfx 109 WAV + MP3 preview | OK (preview kept) |
| Incompetech | `The Britons.mp3` | 12 MB (deleted; 20 s AAC cut kept) |
| Google Fonts | `LilitaOne-Regular.ttf` | 28 KB (kept) |
| Stylized World, Sketchfab | download endpoints | 401 without login / token, as documented |
