# Blockzilla 2 — Promo Site

Statische Promo‑Webseite für **Blockzilla II — Die Rückkehr** mit Trailer, Charakteren, Hintergrund‑Video und integriertem Karaoke‑Hörbuch‑Player.

## Inhalt

```
.
├── index.html                 # Hauptseite (alles in einer Datei: HTML + CSS + JS)
├── karaoke.js                 # Hörbuch‑Player mit synchroner Text‑Anzeige
└── assets/
    ├── poster_9x16.png        # Hero‑Poster + Hörbuch‑Cover
    ├── peter_portrait.png     # Charakter Peter (freigestellt)
    ├── eduard_portrait.png    # Charakter Eduard (freigestellt)
    ├── elisaweta_portrait.png # Charakter Elisaweta (freigestellt)
    ├── blockzilla_portrait.png# Blockzilla Poster‑Frame (Video‑Fallback)
    ├── blockzilla_scene.mp4   # Blockzilla Hintergrund‑Video (5 MB, 480p, lazy‑load)
    ├── youtube_thumb.png      # Thumbnail für den „Watch"‑Block
    └── audio/
        ├── chapter_01.mp3     # Kapitel‑Audio
        ├── chapter_01.json    # Wort‑Timings für Highlighting
        └── …                  # 12 Kapitel insgesamt
```

## Lokal testen

Doppelklick auf `index.html` öffnet die Seite im Browser.

> **Hinweis:** Manche Browser blockieren auf `file://` das automatische Laden der Audio‑JSONs (CORS) und Audio‑Autoplay mit Ton. Für ein realistisches Test‑Erlebnis lokal einen kleinen Webserver starten:
>
> ```sh
> # Python 3
> cd Blockzilla_2_Promo_Export
> python3 -m http.server 8000
> # → http://localhost:8000/
> ```

## Deployen

Die Seite ist 100 % statisch — einfach den gesamten Ordner auf einen beliebigen Webspace hochladen:

- **GitHub Pages** — Repo → Settings → Pages → Branch & Folder wählen
- **Netlify / Vercel / Cloudflare Pages** — Drag‑and‑drop des Ordners
- **Klassischer Webspace** — Ordnerinhalt per FTP/SFTP hochladen

Es gibt keinen Build‑Step. Schriften (Bungee, Press Start 2P, Inter) werden von Google Fonts geladen — dafür ist Online‑Zugriff nötig, sonst greift der System‑Sans‑Serif Fallback.

## Externe Links — TODO

Aktuell sind folgende Links Platzhalter (`href="#"`) und müssen vor dem Live‑Gang in `index.html` eingetragen werden:

| Stelle | Was |
|---|---|
| Watch‑Section | YouTube‑URL der Folge 02, Trailer |
| Hörbuch‑Section | Spotify‑Link, Apple‑Podcasts‑Link |
| Social‑Section | YouTube‑Channel, TikTok, Instagram, Discord |

Suche im HTML nach `href="#"` — alle Vorkommen außer den `#`‑Anker‑Links (z. B. `#story`, `#watch`, `#audiobook`) sind Platzhalter.

## Tech‑Notes

- **Zero Dependencies** — kein Framework, kein Bundler, kein NPM. Plain HTML + Vanilla JS.
- **Hintergrund‑Video** lädt lazy via `IntersectionObserver` — startet automatisch mit Ton sobald der Blockzilla‑Block 50 % sichtbar ist, pausiert beim Rausscrollen. Falls der Browser Audio‑Autoplay blockiert, läuft das Video stumm und ein Sound‑Button erscheint.
- **Karaoke‑Player** liest pro Kapitel ein JSON mit Wort‑Timings (`{ words: [{t, d, w}, …] }`) und hebt das aktuell gesprochene Wort hervor.
- **Schriften:** Bungee (Display), Press Start 2P (Mono‑Akzent), Inter (Body).
- **Farb‑Palette:** Violet/Bedrock + Ember‑Akzent — siehe `:root` Variablen oben in der HTML.

## Story

Folge 2 der **Blockzilla**‑Serie. Peter (10) und Eduard (7) lernen, das Portal absichtlich zu öffnen — aber Blockzillas Bedrock‑Herz hat den letzten Kampf überlebt. Drei Helden — Peter, Eduard und die kleine Elisaweta (3) — müssen herausfinden, dass man Bedrock nicht mit Gewalt zerschlagen kann.
