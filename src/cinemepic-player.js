(function (global, factory) {
  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory();
  } else {
    global.CinemepicPlayer = factory();
  }
})(typeof window !== 'undefined' ? window : this, function () {
  const ICONS = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5.514a1 1 0 0 1 1.53-.848l7.5 5.486a1 1 0 0 1 0 1.696l-7.5 5.486A1 1 0 0 1 9 17.486V5.514Z"/></svg>',
    pause:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.75 5a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-1.5 0V5.75A.75.75 0 0 1 8.75 5Zm6.5 0a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-1.5 0V5.75a.75.75 0 0 1 .75-.75Z"/></svg>',
    volume:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.25 4.27a1 1 0 0 1 1.5.86v13.74a1 1 0 0 1-1.5.86l-5.2-3.17H5.5a1.5 1.5 0 0 1-1.5-1.5V9.94a1.5 1.5 0 0 1 1.5-1.5h2.55l5.2-4.17Z"/><path d="M17.86 8.07a1 1 0 0 1 1.38.28 7 7 0 0 1 0 7.3 1 1 0 1 1-1.66-1.1 5 5 0 0 0 0-5.1 1 1 0 0 1 .28-1.38Z"/><path d="M15.93 9.69a1 1 0 1 1 1.7-1 5.5 5.5 0 0 1 0 6.62 1 1 0 1 1-1.7-1 3.5 3.5 0 0 0 0-4.62Z"/></svg>',
    muted:
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 4.27a1 1 0 0 1 1.5.86V11l3.14-3.15a1 1 0 1 1 1.42 1.42L16.41 12l3.15 3.15a1 1 0 0 1-1.42 1.42L15 13.41v6.46a1 1 0 0 1-1.5.86l-5.2-3.17H5.5a1.5 1.5 0 0 1-1.5-1.5V9.94a1.5 1.5 0 0 1 1.5-1.5h2.8l5.2-4.17Z"/></svg>',
    next: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 5.46a1 1 0 0 1 1.5-.86l7.5 5.2a2 2 0 0 1 0 3.4l-7.5 5.2a1 1 0 0 1-1.5-.86V5.46Z"/></svg>',
  };

  const DEFAULT_OPTIONS = {
    playlist: [],
    autoplay: false,
    muted: false,
    loop: false,
    preload: 'metadata',
    controls: false,
    theme: {},
    videoAttributes: {},
    startAt: 0,
    nextLabel: 'Next',
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

      this._applyTheme(this.options.theme);

      this.videoWrapper = document.createElement('div');
      this.videoWrapper.className = 'cinemepic-player__video-wrapper';

      this.videoElement = document.createElement('video');
      this.videoElement.className = 'cinemepic-player__video';
      this.videoElement.preload = this.options.preload;
      this.videoElement.loop = this.options.loop;
      this.videoElement.muted = this.options.muted;
      this.videoElement.playsInline = true;
      this.videoElement.setAttribute('playsinline', '');
      this.videoElement.setAttribute('webkit-playsinline', '');
      this.videoElement.controls = Boolean(this.options.controls);

      Object.entries(this.options.videoAttributes || {}).forEach(([key, value]) => {
        if (value === false || value === null || value === undefined) return;
        if (value === true) {
          this.videoElement.setAttribute(key, '');
        } else {
          this.videoElement.setAttribute(key, value);
        }
      });

      this.videoWrapper.appendChild(this.videoElement);
      this.container.appendChild(this.videoWrapper);

      this.overlay = document.createElement('div');
      this.overlay.className = 'cinemepic-player__overlay';

      this.infoBlock = document.createElement('div');
      this.infoBlock.className = 'cinemepic-player__info';

      this.taglineEl = document.createElement('p');
      this.taglineEl.className = 'cinemepic-player__tagline';

      this.titleEl = document.createElement('h2');
      this.titleEl.className = 'cinemepic-player__title';

      this.descriptionEl = document.createElement('p');
      this.descriptionEl.className = 'cinemepic-player__description';

      this.infoBlock.appendChild(this.taglineEl);
      this.infoBlock.appendChild(this.titleEl);
      this.infoBlock.appendChild(this.descriptionEl);

      this.stepper = document.createElement('div');
      this.stepper.className = 'cinemepic-player__stepper';

      this.overlay.appendChild(this.infoBlock);
      this.overlay.appendChild(this.stepper);
      this.container.appendChild(this.overlay);

      this.playButton = document.createElement('button');
      this.playButton.className = 'cinemepic-player__play';
      this.playButton.type = 'button';
      this.playButton.setAttribute('aria-label', 'Play video');
      this.playIcon = document.createElement('span');
      this.playIcon.className = 'cinemepic-player__play-icon';
      this.playIcon.innerHTML = ICONS.play;
      this.playButton.appendChild(this.playIcon);

      this.muteButton = document.createElement('button');
      this.muteButton.className = 'cinemepic-player__mute';
      this.muteButton.type = 'button';
      this.muteButton.setAttribute('aria-label', 'Mute');
      this.muteButton.innerHTML = ICONS.volume;

      this.nextButton = document.createElement('button');
      this.nextButton.className = 'cinemepic-player__advance';
      this.nextButton.type = 'button';
      this.nextButton.setAttribute('aria-label', 'Next video');
      this.nextButton.innerHTML = ICONS.next;

      this.nextLabel = document.createElement('span');
      this.nextLabel.className = 'cinemepic-player__next-label';
      this.nextLabel.textContent = this.options.nextLabel || 'Next';

      this.container.appendChild(this.playButton);
      this.container.appendChild(this.muteButton);
      this.container.appendChild(this.nextButton);
      this.container.appendChild(this.nextLabel);

      this.root.innerHTML = '';
      this.root.appendChild(this.container);

      this._refreshPlaylist();
      this._bindEvents();
    }

    _bindEvents() {
      this.playButton.addEventListener('click', () => {
        if (this.container.classList.contains('cinemepic-player--has-embed')) {
          return;
        }

        if (this.videoElement.paused) {
          this.videoElement.play();
        } else {
          this.videoElement.pause();
        }
      });

      this.videoElement.addEventListener('play', () => this._syncPlayState());
      this.videoElement.addEventListener('pause', () => this._syncPlayState());
      this.videoElement.addEventListener('ended', () => {
        if (this.options.loop) return;
        this.next({ autoplay: true, wrap: false });
      });

      this.videoElement.addEventListener('click', () => {
        if (this.container.classList.contains('cinemepic-player--has-embed')) {
          return;
        }
        if (this.videoElement.paused) {
          this.videoElement.play();
        } else {
          this.videoElement.pause();
        }
      });

      this.nextButton.addEventListener('click', () => this.next({ autoplay: true }));

      this.muteButton.addEventListener('click', () => {
        this.videoElement.muted = !this.videoElement.muted;
        this.options.muted = this.videoElement.muted;
        this._syncMuteState();
      });
    }

    _refreshPlaylist() {
      this.stepper.innerHTML = '';
      if (!this.playlist.length) {
        return;
      }

      this.playlist.forEach((item, index) => {
        const stepButton = document.createElement('button');
        stepButton.type = 'button';
        stepButton.className = 'cinemepic-player__step';
        stepButton.dataset.index = String(index);

        const number = document.createElement('span');
        number.className = 'cinemepic-player__step-number';
        number.textContent = formatStepNumber(index + 1);

        const label = document.createElement('span');
        label.className = 'cinemepic-player__step-label';
        label.textContent = item.stepLabel || item.menuLabel || item.shortTitle || item.title || `Video ${index + 1}`;

        stepButton.appendChild(number);
        stepButton.appendChild(label);

        stepButton.addEventListener('click', () => this.load(index, { autoplay: true }));
        stepButton.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.load(index, { autoplay: true });
          }
        });

        this.stepper.appendChild(stepButton);
      });
    }

    _renderEmptyState() {
      this.taglineEl.textContent = '';
      this.titleEl.textContent = 'Awaiting footage';
      this.descriptionEl.textContent = 'Add playlist entries to mirror the Cinemepic sequence.';
      this.stepper.innerHTML = '';
      const empty = document.createElement('p');
      empty.className = 'cinemepic-player__empty';
      empty.textContent = 'No scenes loaded';
      this.stepper.appendChild(empty);

      this.playButton.disabled = true;
      this.playButton.setAttribute('aria-hidden', 'true');
      this.playButton.setAttribute('tabindex', '-1');
      this.muteButton.disabled = true;
      this.muteButton.setAttribute('aria-hidden', 'true');
      this.muteButton.setAttribute('tabindex', '-1');
      this.nextButton.disabled = true;
      this.nextButton.style.visibility = 'hidden';
      this.nextLabel.style.visibility = 'hidden';
    }

    load(index, { autoplay = false } = {}) {
      if (!this.playlist.length) return;
      const targetIndex = clampIndex(index, this.playlist.length);
      const item = this.playlist[targetIndex];
      if (!item) return;

      this.currentIndex = targetIndex;
      this.container.classList.remove('cinemepic-player--has-embed');

      const isEmbed = Boolean(item.embed);

      if (isEmbed) {
        this._loadEmbed(item);
      } else {
        this._loadVideo(item);
      }

      this._updateOverlay(item);
      this._updatePlaylistState();

      if (!isEmbed) {
        const shouldAutoplay = autoplay || item.autoplay || this.autoplayQueued;
        if (shouldAutoplay) {
          const playPromise = this.videoElement.play();
          if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(() => {
              this.autoplayQueued = true;
            });
          }
        } else {
          this.videoElement.pause();
        }
        this.autoplayQueued = false;
      }

      this.playButton.disabled = false;
      this.playButton.removeAttribute('tabindex');
      this.playButton.setAttribute('aria-hidden', 'false');
      this.muteButton.disabled = false;
      this.nextButton.disabled = this.playlist.length <= 1;
      this.nextButton.style.visibility = this.playlist.length <= 1 ? 'hidden' : '';
      this.nextLabel.style.visibility = this.playlist.length <= 1 ? 'hidden' : '';

      this.container.classList.toggle('cinemepic-player--has-embed', isEmbed);

      this._syncPlayState();
      this._syncMuteState();

      if (typeof this.options.onVideoChange === 'function') {
        this.options.onVideoChange({ item, index: this.currentIndex });
      }
    }

    _loadVideo(item) {
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

      if (Array.isArray(item.tracks)) {
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

      const controls = item.controls !== undefined ? item.controls : this.options.controls;
      this.videoElement.controls = Boolean(controls);

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
    }

    _loadEmbed(item) {
      this.videoElement.pause();
      this.videoElement.removeAttribute('src');
      while (this.videoElement.firstChild) {
        this.videoElement.removeChild(this.videoElement.firstChild);
      }
      this.videoElement.style.display = 'none';

      if (!this.embedElement) {
        this.embedElement = document.createElement('iframe');
        this.embedElement.className = 'cinemepic-player__embed';
        this.embedElement.allow = item.embed.allow || 'autoplay; fullscreen; picture-in-picture';
        this.embedElement.allowFullscreen = true;
        this.embedElement.referrerPolicy = 'strict-origin-when-cross-origin';
        this.videoWrapper.appendChild(this.embedElement);
      }

      this.embedElement.src = item.embed.src;
      if (item.embed.title) {
        this.embedElement.title = item.embed.title;
      }
    }

    _updateOverlay(item) {
      this.taglineEl.textContent = item.tagline || item.category || item.kicker || '';
      this.titleEl.textContent = item.title || 'Untitled scene';
      this.descriptionEl.textContent = item.description || '';
      this.descriptionEl.style.display = item.description ? '' : 'none';

      const accent = item.accent || item.accentColor || this.options.theme.accent;
      this._setAccent(accent);

      const nextLabel = item.nextLabel || this.options.nextLabel;
      if (nextLabel) {
        this.nextLabel.textContent = nextLabel;
      }
    }

    _updatePlaylistState() {
      const buttons = this.stepper.querySelectorAll('.cinemepic-player__step');
      buttons.forEach((button) => {
        const index = Number(button.dataset.index);
        const isActive = index === this.currentIndex;
        button.classList.toggle('cinemepic-player__step--active', isActive);
        if (isActive) {
          button.setAttribute('aria-current', 'true');
        } else {
          button.removeAttribute('aria-current');
        }
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
      this.videoElement?.pause();
      this.root.innerHTML = '';
      this.container = null;
      this.videoElement = null;
      this.stepper = null;
    }

    _syncPlayState() {
      const playing = !this.videoElement.paused && !this.videoElement.ended;
      this.container.classList.toggle('is-playing', playing);
      this.playIcon.innerHTML = playing ? ICONS.pause : ICONS.play;
      this.playButton.setAttribute('aria-label', playing ? 'Pause video' : 'Play video');

      const isEmbed = this.container.classList.contains('cinemepic-player--has-embed');
      if (isEmbed) {
        this.playButton.disabled = true;
        this.playButton.setAttribute('aria-hidden', 'true');
        this.playButton.setAttribute('tabindex', '-1');
      } else {
        this.playButton.disabled = false;
        this.playButton.setAttribute('aria-hidden', 'false');
        this.playButton.removeAttribute('tabindex');
      }
    }

    _syncMuteState() {
      const muted = this.videoElement.muted;
      this.muteButton.classList.toggle('is-muted', muted);
      this.muteButton.innerHTML = muted ? ICONS.muted : ICONS.volume;
      this.muteButton.setAttribute('aria-label', muted ? 'Unmute' : 'Mute');

      const isEmbed = this.container.classList.contains('cinemepic-player--has-embed');
      if (isEmbed) {
        this.muteButton.disabled = true;
        this.muteButton.setAttribute('aria-hidden', 'true');
        this.muteButton.setAttribute('tabindex', '-1');
      } else {
        this.muteButton.disabled = false;
        this.muteButton.setAttribute('aria-hidden', 'false');
        this.muteButton.removeAttribute('tabindex');
      }
    }

    _applyTheme(theme = {}) {
      if (!theme) return;
      const themeMap = {
        accent: '--cp-accent',
        background: '--cp-surface',
        text: '--cp-text-strong',
        mutedText: '--cp-text-muted',
        overlay: '--cp-overlay',
        shadow: '--cp-shadow',
      };

      Object.entries(theme).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        const cssVar = themeMap[key];
        if (cssVar) {
          this.container?.style.setProperty(cssVar, value);
        }
        if (key === 'accent') {
          this._setAccent(value);
        }
      });
    }

    _setAccent(color) {
      if (!color) return;
      this.container.style.setProperty('--cp-accent', color);
      const rgb = toRgbString(color);
      if (rgb) {
        this.container.style.setProperty('--cp-accent-rgb', rgb);
      }
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

  function formatStepNumber(value) {
    return String(value).padStart(2, '0');
  }

  function toRgbString(color) {
    if (Array.isArray(color)) {
      return color.join(' ');
    }

    if (typeof color === 'string') {
      const hex = color.trim();
      if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)) {
        const normalized = hex.length === 4
          ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
          : hex;
        const r = parseInt(normalized.slice(1, 3), 16);
        const g = parseInt(normalized.slice(3, 5), 16);
        const b = parseInt(normalized.slice(5, 7), 16);
        return `${r} ${g} ${b}`;
      }

      const rgbMatch = color.match(/rgba?\(([^)]+)\)/i);
      if (rgbMatch) {
        return rgbMatch[1]
          .split(',')
          .slice(0, 3)
          .map((segment) => segment.trim().replace(/%$/, ''))
          .join(' ');
      }
    }
    return null;
  }

  return CinemepicPlayer;
});
