(function (global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else {
    global.CinemepicPlayer = factory();
  }
})(typeof window !== 'undefined' ? window : this, function () {
  const DEFAULT_OPTIONS = {
    playlist: [],
    playlistTitle: 'Now Playing',
    autoplay: false,
    muted: false,
    loop: false,
    controls: true,
    preload: 'metadata',
    layout: 'default',
    floating: false,
    theme: {},
    videoAttributes: {},
    onVideoChange: null,
  };

  class CinemepicPlayer {
    constructor(root, options = {}) {
      this.root = typeof root === 'string' ? document.querySelector(root) : root;
      if (!this.root) {
        throw new Error('CinemepicPlayer: container element not found.');
      }

      this.options = mergeOptions(DEFAULT_OPTIONS, options);
      this.playlist = Array.isArray(this.options.playlist) ? this.options.playlist.slice() : [];
      this.currentIndex = -1;
      this.autoplayQueued = false;

      this._render();
      if (this.playlist.length > 0) {
        const startingIndex = clampIndex(this.options.startAt || 0, this.playlist.length);
        this.load(startingIndex, { autoplay: this.options.autoplay });
      } else {
        this._renderEmptyState();
      }
    }

    _render() {
      this.container = document.createElement('div');
      this.container.className = 'cinemepic-player';
      if (this.options.layout === 'minimal') {
        this.container.classList.add('cinemepic-player--minimal');
      }
      if (this.options.floating) {
        this.container.classList.add('cinemepic-player--floating');
      }
      if (this.options.theme && this.options.theme.preset) {
        this.container.dataset.theme = this.options.theme.preset;
      }

      this._applyTheme(this.options.theme);

      this.videoWrapper = document.createElement('div');
      this.videoWrapper.className = 'cinemepic-player__video-wrapper';

      this.videoElement = document.createElement('video');
      this.videoElement.className = 'cinemepic-player__video';
      this.videoElement.controls = this.options.controls;
      this.videoElement.preload = this.options.preload;
      this.videoElement.muted = this.options.muted;
      this.videoElement.loop = this.options.loop;

      Object.entries(this.options.videoAttributes || {}).forEach(([key, value]) => {
        if (value === false || value === null || value === undefined) return;
        if (value === true) {
          this.videoElement.setAttribute(key, '');
        } else {
          this.videoElement.setAttribute(key, value);
        }
      });

      this.videoOverlay = document.createElement('div');
      this.videoOverlay.className = 'cinemepic-player__video-overlay';

      this.videoControls = this._createControls();

      this.videoWrapper.appendChild(this.videoElement);
      this.videoWrapper.appendChild(this.videoOverlay);
      this.videoWrapper.appendChild(this.videoControls);

      this.playlistElement = document.createElement('aside');
      this.playlistElement.className = 'cinemepic-player__playlist';

      this.playlistHeader = document.createElement('header');
      this.playlistHeader.className = 'cinemepic-player__playlist-header';
      this.playlistTitle = document.createElement('h2');
      this.playlistTitle.textContent = this.options.playlistTitle;
      this.playlistHeader.appendChild(this.playlistTitle);

      this.playlistItems = document.createElement('ul');
      this.playlistItems.className = 'cinemepic-player__playlist-items';

      this.playlistElement.appendChild(this.playlistHeader);
      this.playlistElement.appendChild(this.playlistItems);

      this.container.appendChild(this.videoWrapper);
      this.container.appendChild(this.playlistElement);

      this.root.innerHTML = '';
      this.root.appendChild(this.container);

      this._refreshPlaylist();
      this._bindEvents();
    }

    _createControls() {
      const controls = document.createElement('div');
      controls.className = 'cinemepic-player__video-controls';

      this.prevButton = this._createControlButton('Previous', `
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 5a1 1 0 0 1 2 0v5.382l7.447-4.47A1 1 0 0 1 17 6.764v10.472a1 1 0 0 1-1.553.852L8 13.618V19a1 1 0 1 1-2 0V5Z" /></svg>
      `);
      this.playPauseButton = this._createControlButton('Play/Pause', `
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5a1 1 0 0 1 1 1v12a1 1 0 1 1-2 0V6a1 1 0 0 1 1-1Zm6 0a1 1 0 0 1 1 1v12a1 1 0 1 1-2 0V6a1 1 0 0 1 1-1Z" /></svg>
      `);
      this.nextButton = this._createControlButton('Next', `
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 5a1 1 0 1 1 2 0v14a1 1 0 1 1-2 0v-5.382l-7.447 4.47A1 1 0 0 1 9 17.236V6.764a1 1 0 0 1 1.553-.852L18 10.382V5Z" /></svg>
      `);

      controls.appendChild(this.prevButton);
      controls.appendChild(this.playPauseButton);
      controls.appendChild(this.nextButton);

      return controls;
    }

    _createControlButton(label, icon) {
      const button = document.createElement('button');
      button.className = 'cinemepic-player__control-button';
      button.type = 'button';
      button.innerHTML = icon;
      button.setAttribute('aria-label', label);
      return button;
    }

    _bindEvents() {
      this.playPauseButton.addEventListener('click', () => {
        if (this.videoElement.paused) {
          this.videoElement.play();
        } else {
          this.videoElement.pause();
        }
      });

      this.prevButton.addEventListener('click', () => this.previous());
      this.nextButton.addEventListener('click', () => this.next());

      this.videoElement.addEventListener('play', () => this._syncPlayState());
      this.videoElement.addEventListener('pause', () => this._syncPlayState());

      this.videoElement.addEventListener('ended', () => {
        if (this.options.loop) return;
        this.next({ autoplay: true, wrap: false });
      });
    }

    _syncPlayState() {
      if (this.videoElement.paused) {
        this.playPauseButton.innerHTML = `
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5a1 1 0 0 1 1.52-.854l9 6a1 1 0 0 1 0 1.708l-9 6A1 1 0 0 1 8 17.5v-12Z" /></svg>
        `;
      } else {
        this.playPauseButton.innerHTML = `
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5a1 1 0 0 1 1 1v12a1 1 0 1 1-2 0V6a1 1 0 0 1 1-1Zm6 0a1 1 0 0 1 1 1v12a1 1 0 1 1-2 0V6a1 1 0 0 1 1-1Z" /></svg>
        `;
      }
    }

    _applyTheme(theme = {}) {
      if (!theme) return;
      const themeMap = {
        primary: '--cp-primary',
        background: '--cp-background',
        videoBackground: '--cp-video-background',
        text: '--cp-text',
        muted: '--cp-muted',
        menuWidth: '--cp-menu-width',
        borderRadius: '--cp-border-radius',
      };

      Object.entries(theme).forEach(([key, value]) => {
        const cssVar = themeMap[key];
        if (cssVar && value) {
          this.container?.style.setProperty(cssVar, value);
        }
      });
    }

    _refreshPlaylist() {
      this.playlistItems.innerHTML = '';
      if (!this.playlist.length) return;

      this.playlist.forEach((item, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'cinemepic-player__playlist-item';
        listItem.tabIndex = 0;
        listItem.dataset.index = String(index);
        listItem.innerHTML = this._playlistItemTemplate(item);
        listItem.addEventListener('click', () => this.load(index, { autoplay: true }));
        listItem.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.load(index, { autoplay: true });
          }
        });
        this.playlistItems.appendChild(listItem);
      });
    }

    _renderEmptyState() {
      const empty = document.createElement('div');
      empty.className = 'cinemepic-player__empty';
      empty.textContent = 'Add videos to your playlist to start using the player.';
      this.playlistItems.appendChild(empty);
    }

    _playlistItemTemplate(item) {
      const thumb = item.thumbnail || item.poster || '';
      const description = item.description || '';
      const duration = item.duration || '';
      return `
        <div class="cinemepic-player__thumb">
          ${thumb ? `<img src="${thumb}" alt="${escapeHtml(item.title || 'Video thumbnail')}">` : ''}
        </div>
        <div class="cinemepic-player__meta">
          <p class="cinemepic-player__title">${escapeHtml(item.title || 'Untitled video')}</p>
          ${duration ? `<p class="cinemepic-player__duration">${escapeHtml(duration)}</p>` : ''}
          ${description ? `<p class="cinemepic-player__description">${escapeHtml(description)}</p>` : ''}
        </div>
      `;
    }

    load(index, { autoplay = false } = {}) {
      if (!this.playlist.length) return;
      const targetIndex = clampIndex(index, this.playlist.length);
      const item = this.playlist[targetIndex];
      if (!item) return;

      this.currentIndex = targetIndex;
      this._updatePlaylistState();

      const isEmbed = Boolean(item.embed);

      if (isEmbed) {
        this._loadEmbed(item);
      } else {
        this._loadVideo(item);
      }

      if (!isEmbed) {
        const shouldAutoplay = autoplay || item.autoplay || this.autoplayQueued;
        if (shouldAutoplay) {
          const playPromise = this.videoElement.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {
              this.autoplayQueued = true;
            });
          }
        }
        this.autoplayQueued = false;
      }

      if (typeof this.options.onVideoChange === 'function') {
        this.options.onVideoChange({ item, index: this.currentIndex });
      }
    }

    _loadVideo(item) {
      this.videoWrapper.classList.remove('cinemepic-player__video-wrapper--embed');
      this.videoElement.style.display = '';
      if (this.embedElement) {
        this.embedElement.remove();
        this.embedElement = null;
      }

      this.videoElement.pause();
      this.videoElement.removeAttribute('src');
      while (this.videoElement.firstChild) {
        this.videoElement.removeChild(this.videoElement.firstChild);
      }

      if (item.poster) {
        this.videoElement.poster = item.poster;
      } else {
        this.videoElement.removeAttribute('poster');
      }

      if (Array.isArray(item.sources) && item.sources.length) {
        item.sources.forEach((source) => {
          const sourceEl = document.createElement('source');
          sourceEl.src = source.src;
          if (source.type) {
            sourceEl.type = source.type;
          }
          this.videoElement.appendChild(sourceEl);
        });
      } else if (item.src) {
        this.videoElement.src = item.src;
      }

      if (item.tracks && Array.isArray(item.tracks)) {
        item.tracks.forEach((track) => {
          const trackEl = document.createElement('track');
          trackEl.kind = track.kind || 'subtitles';
          trackEl.label = track.label || '';
          trackEl.srclang = track.srclang || '';
          trackEl.src = track.src;
          if (track.default) {
            trackEl.default = true;
          }
          this.videoElement.appendChild(trackEl);
        });
      }

      if (item.muted !== undefined) {
        this.videoElement.muted = item.muted;
      } else {
        this.videoElement.muted = this.options.muted;
      }

      if (item.loop !== undefined) {
        this.videoElement.loop = item.loop;
      } else {
        this.videoElement.loop = this.options.loop;
      }

      this.videoElement.load();
      this._syncPlayState();
    }

    _loadEmbed(item) {
      this.videoWrapper.classList.add('cinemepic-player__video-wrapper--embed');
      this.videoElement.pause();
      this.videoElement.removeAttribute('src');
      while (this.videoElement.firstChild) {
        this.videoElement.removeChild(this.videoElement.firstChild);
      }
      this.videoElement.style.display = 'none';

      if (!this.embedElement) {
        this.embedElement = document.createElement('iframe');
        this.embedElement.allow = item.embed.allow || 'autoplay; fullscreen; picture-in-picture';
        this.embedElement.allowFullscreen = true;
        this.embedElement.referrerPolicy = 'strict-origin-when-cross-origin';
        this.embedElement.className = 'cinemepic-player__embed';
        this.videoWrapper.insertBefore(this.embedElement, this.videoOverlay);
      }

      this.embedElement.src = item.embed.src;
      if (item.embed.title) {
        this.embedElement.title = item.embed.title;
      }

      this._syncPlayState();
    }

    _updatePlaylistState() {
      const items = this.playlistItems.querySelectorAll('.cinemepic-player__playlist-item');
      items.forEach((item) => {
        const index = Number(item.dataset.index);
        item.classList.toggle('cinemepic-player__playlist-item--active', index === this.currentIndex);
      });
    }

    next({ autoplay = true, wrap = true } = {}) {
      if (!this.playlist.length) return;
      const nextIndex = this.currentIndex + 1;
      if (nextIndex < this.playlist.length) {
        this.load(nextIndex, { autoplay });
      } else if (wrap) {
        this.load(0, { autoplay });
      }
    }

    previous({ autoplay = true, wrap = true } = {}) {
      if (!this.playlist.length) return;
      const prevIndex = this.currentIndex - 1;
      if (prevIndex >= 0) {
        this.load(prevIndex, { autoplay });
      } else if (wrap) {
        this.load(this.playlist.length - 1, { autoplay });
      }
    }

    add(item) {
      this.playlist.push(item);
      this._refreshPlaylist();
      if (this.playlist.length === 1) {
        this.load(0);
      }
    }

    replacePlaylist(items) {
      this.playlist = Array.isArray(items) ? items.slice() : [];
      this.currentIndex = -1;
      this._refreshPlaylist();
      if (this.playlist.length) {
        this.load(0);
      } else {
        this._renderEmptyState();
      }
    }

    destroy() {
      this.root.innerHTML = '';
      this.videoElement?.pause();
      this.container = null;
      this.videoElement = null;
      this.playlistElement = null;
      this.playlistItems = null;
    }
  }

  function mergeOptions(base, extra) {
    const result = { ...base };
    Object.keys(extra || {}).forEach((key) => {
      const value = extra[key];
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = { ...(base[key] || {}), ...value };
      } else {
        result[key] = value;
      }
    });
    return result;
  }

  function clampIndex(index, length) {
    if (typeof index !== 'number' || Number.isNaN(index)) return 0;
    if (index < 0) return 0;
    if (index >= length) return length - 1;
    return index;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  return CinemepicPlayer;
});
