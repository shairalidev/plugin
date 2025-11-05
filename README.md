# Cinemepic-style HTML5 player

This repository contains an embeddable HTML5 video player inspired by the Cinemepic layout. It provides a cinematic theme with a video area on the left and a configurable playlist menu on the right. You can drop the player into any page with a single script and stylesheet include and control it entirely via JavaScript.

## Features

- HTML5 video playback with optional iframe embeds.
- Customizable playlist with thumbnails, durations, and descriptions.
- Cinematic styling with dark and light themes plus CSS custom properties.
- Responsive layout that collapses the playlist below the video on smaller screens.
- Built-in previous/next controls and programmatic playlist management.
- Supports multiple player instances on the same page.

## Getting started

1. Copy the bundled CSS and JS files from the `src/` directory into your project (or install the package and import them).
2. Add the markup below where you want the player to appear:

   ```html
   <link rel="stylesheet" href="/path/to/cinemepic-player.css" />
   <div id="my-player"></div>
   <script src="/path/to/cinemepic-player.js"></script>
   <script>
     const player = new CinemepicPlayer('#my-player', {
       playlist: [
         {
           title: 'Voyage Beyond the Stars',
           description: 'A slow pan through a neon-lit metropolis floating above the clouds.',
           duration: '02:15',
           src: 'https://example.com/video.mp4',
           poster: 'https://example.com/poster.jpg',
           thumbnail: 'https://example.com/thumb.jpg'
         },
         // Additional videos here...
       ],
       autoplay: false,
       playlistTitle: 'Featured Trailers',
       theme: {
         primary: '#fcd34d',
         background: '#04040a',
         text: '#f5f5fa',
         muted: '#9090a0'
       }
     });
   </script>
   ```

3. (Optional) Review the `demo/index.html` file for a complete working example with multiple player configurations.

## Configuration

Pass any of the options below when instantiating `CinemepicPlayer`:

| Option | Type | Description |
| --- | --- | --- |
| `playlist` | `Array<PlaylistItem>` | Collection of videos to display. Each item can include `title`, `description`, `duration`, `src`, `sources`, `poster`, `thumbnail`, `tracks`, `embed`, `autoplay`, `loop`, and `muted`. |
| `playlistTitle` | `string` | Heading displayed above the menu. |
| `autoplay` | `boolean` | Whether to play the first item immediately after load. |
| `muted` | `boolean` | Default mute state for videos. |
| `loop` | `boolean` | Loop the active video when it ends. |
| `controls` | `boolean` | Show native browser controls on the `<video>` element. |
| `preload` | `string` | Value passed to the video `preload` attribute (`auto`, `metadata`, or `none`). |
| `layout` | `"default"` \| `"minimal"` | Toggle a denser playlist menu without descriptions. |
| `floating` | `boolean` | Adds a floating shadow effect to the player. |
| `theme` | `object` | Override CSS variables (`primary`, `background`, `videoBackground`, `text`, `muted`, `menuWidth`, `borderRadius`) or apply presets like `{ preset: 'light' }`. |
| `videoAttributes` | `object` | Additional attributes for the `<video>` element (e.g. `{ playsinline: true }`). |
| `startAt` | `number` | Index of the first video to load. |
| `onVideoChange` | `function` | Callback invoked with `{ item, index }` whenever a new video loads. |

### Playlist items

Each `PlaylistItem` can be either a regular HTML5 video source or an embedded iframe.

```js
{
  title: 'Sample video',
  description: 'Optional text beneath the title',
  duration: '03:32',
  src: 'https://example.com/video.mp4',
  sources: [
    { src: 'https://example.com/video-1080p.mp4', type: 'video/mp4' },
    { src: 'https://example.com/video.webm', type: 'video/webm' }
  ],
  poster: 'https://example.com/poster.jpg',
  thumbnail: 'https://example.com/thumb.jpg',
  tracks: [
    { src: 'https://example.com/en.vtt', label: 'English', srclang: 'en', default: true }
  ],
  autoplay: false,
  loop: false,
  muted: false
}
```

To embed external players, use the `embed` key:

```js
{
  title: 'YouTube trailer',
  embed: {
    src: 'https://www.youtube.com/embed/XXXXXXXX',
    title: 'YouTube player',
    allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
  },
  thumbnail: 'https://example.com/thumb.jpg'
}
```

### API methods

```js
const player = new CinemepicPlayer('#player', { playlist: [] });
player.load(2);        // Load a specific index
player.next();         // Advance to the next item
player.previous();     // Go back to the previous item
player.add(item);      // Push a new item to the playlist
player.replacePlaylist(newItems); // Replace the entire playlist
player.destroy();      // Tear down the instance
```

## Development

Open the demo file directly in your browser to explore the player locally:

```bash
npx serve demo
```

No build step is required; the CSS and JS files ship ready for distribution.
