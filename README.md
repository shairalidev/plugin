# Cinemepic-style hero demo

This repository provides a single-page demo that recreates the signature Cinemepic hero section with a custom HTML5 video player and numbered scene navigation. The page ships as ready-to-host static assets—no build step or framework required.

## What’s included

- `index.html` – page markup with the hero, feature highlights, and CTA copy.
- `css/styles.css` – gradient-heavy look and feel inspired by Cinemepic.
- `js/player.js` – lightweight playlist controller with custom play, mute, and next actions.

## Running the demo locally

1. Clone or download the project.
2. Serve the directory with any static server (for example `python -m http.server`).
3. Open `http://localhost:8000` in your browser.

Opening the file directly from the file system can prevent the browser from loading the fonts and videos because of CORS restrictions. Using a local web server avoids those issues.

## Customising the playlist

`js/player.js` exports a playlist array. Each entry supports:

- `title`, `tagline`, and `stepLabel` for the copy shown next to the video.
- `description` for the main body text.
- `accent` to tint the gradients and controls.
- `sources` or `src` for one or more HTML5 video URLs.
- `poster` for the preview image.
- `nextLabel` for the caption beside the “next” arrow.

Swap in your own footage or embed URLs to adapt the hero to your campaign.

## Browser support

The player relies on modern browser features such as CSS grid, `aspect-ratio`, and ES modules. It’s been tested on recent versions of Chrome, Edge, Safari, and Firefox.
