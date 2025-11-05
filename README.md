# Cinemepic hero video player

This repository packages a drop-in HTML5 video experience that mirrors the hero player used on [cinemepic.com](https://cinemepic.com/en). The layout recreates the dark radial lighting, floating triangular play button, right-edge navigation arrow, and numbered scene menu showcased on Cinemepic campaigns. You can embed the player on any site with a single script and stylesheet include and fully configure the playlist from JavaScript.

## Highlights

- Cinemepic-accurate overlay with headline, description, triangular play trigger, and floating mute/next controls.
- Floating Cinemepic-style play cue that follows the cursor when playback is paused.
- Horizontal scene navigator that uses Cinemepic's numbered tabs (`01 Kickstart`, `02 Strategy`, …) and updates automatically from your playlist.
- Accent-aware gradients that adapt to each scene, mirroring the shifting glow from the live site.
- Works with standard HTML5 sources or iframe embeds (e.g., Vimeo, YouTube).
- Multiple players can coexist on the same page with independent playlists and theming.

## Quick start

1. Copy `src/cinemepic-player.css` and `src/cinemepic-player.js` into your project (or serve them directly).
2. Add the container markup and instantiate the player:

   ```html
   <link rel="stylesheet" href="/path/to/cinemepic-player.css" />
   <div id="cinemepic-player"></div>
   <script src="/path/to/cinemepic-player.js"></script>
   <script>
     const player = new CinemepicPlayer('#cinemepic-player', {
       playlist: [
         {
           title: 'Analysis',
           tagline: 'In an analysis',
           description:
             'We take a close look at who your target group is and what goals you want to achieve.',
           stepLabel: 'Kickstart',
           src: 'https://cdn.example.com/video/analysis.mp4',
           poster: 'https://images.example.com/analysis-cover.jpg',
           accent: '#2c9dff',
         },
         {
           title: 'Strategy',
           tagline: '02',
           description: 'We craft the plan of action and define the cinematic language.',
           stepLabel: 'Strategy',
           src: 'https://cdn.example.com/video/strategy.mp4',
           accent: '#7a5cff',
         },
         // more scenes...
       ],
       autoplay: false,
       muted: true,
       theme: {
         background: '#05060f',
         text: '#ffffff',
         accent: '#2f92ff',
       },
     });
   </script>
   ```

3. Open your page in the browser. The player renders the Cinemepic layout around the supplied playlist.

See `demo/index.html` for an end-to-end example with multiple scenes, custom accents, and embed usage.

## Configuration

### Player options

Pass options when creating a `CinemepicPlayer` instance:

| Option | Type | Description |
| --- | --- | --- |
| `playlist` | `Array<PlaylistItem>` | Collection of scenes displayed in the numbered navigator. |
| `autoplay` | `boolean` | Starts playback immediately when the first video loads (subject to browser policy). |
| `muted` | `boolean` | Initial mute state for HTML5 videos. |
| `loop` | `boolean` | Loops the active video when it reaches the end. |
| `preload` | `"auto" \| "metadata" \| "none"` | Preload strategy for the `<video>` element. |
| `controls` | `boolean` | Expose native browser controls (defaults to Cinemepic-style custom controls only). |
| `videoAttributes` | `object` | Extra attributes for the `<video>` element (e.g., `{ playsinline: true }`). |
| `startAt` | `number` | Index of the first playlist item to load. |
| `nextLabel` | `string` | Caption shown near the right arrow (defaults to `Next`). |
| `theme` | `object` | Override CSS custom properties such as `{ accent, background, text, mutedText, overlay, shadow }`. |
| `onVideoChange` | `function` | Callback invoked with `{ item, index }` whenever a new scene loads. |

### Playlist items

Each playlist entry accepts the following keys:

```js
{
  title: 'Analysis',               // Main headline shown on the left
  tagline: 'In an analysis',       // Optional uppercase kicker line above the title
  description: 'Copy beside the video describing the scene.',
  stepLabel: 'Kickstart',          // Label for the numbered step (defaults to title)
  nextLabel: 'Next case',          // Optional label near the arrow for this scene
  accent: '#2f92ff',               // Per-scene accent color (updates gradients & triangle)
  src: 'https://example.com/video.mp4',
  sources: [                       // Optional multi-source definition
    { src: 'https://example.com/video-1080p.mp4', type: 'video/mp4' },
  ],
  poster: 'https://example.com/poster.jpg',
  tracks: [                        // Optional captions / subtitles
    { src: 'https://example.com/en.vtt', label: 'English', srclang: 'en', default: true }
  ],
  autoplay: false,                 // Override autoplay per scene
  loop: false,                     // Override loop per scene
  muted: false,                    // Override muted per scene
  controls: false                  // Override native controls per scene
}
```

To embed a third-party player, supply an `embed` object instead of `src`/`sources`:

```js
{
  title: 'Behind the scenes',
  description: 'Watch the shoot from a drone perspective.',
  stepLabel: 'Production',
  accent: '#ff7a59',
  embed: {
    src: 'https://player.vimeo.com/video/123456789',
    title: 'Vimeo player',
    allow: 'autoplay; fullscreen; picture-in-picture'
  }
}
```

When an embedded scene is active the Cinemepic UI hides the triangle play toggle and mute button, mirroring the behaviour on the reference site.

## API methods

```js
const player = new CinemepicPlayer('#hero', { playlist: [] });
player.load(2);          // Jump to a specific index
player.next();           // Advance to the next scene
player.previous();       // Go back
player.add(item);        // Append a new scene
player.replacePlaylist(items); // Replace the entire playlist
player.destroy();        // Tear down the instance
```

## Local demo

Serve the `demo/` directory with the bundled helper script to explore the Cinemepic experience locally without relying on any
framework build tools:

```bash
npm run serve:demo
```

For air-gapped or file-system testing, generate a single-file variant that inlines every stylesheet and script. The resulting
`demo/offline.html` can be opened directly in the browser with no CORS warnings:

```bash
npm run build:offline
```

No additional build chain is required—the CSS and JavaScript ship ready for production use.
