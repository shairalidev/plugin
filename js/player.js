const playlist = [
  {
    title: 'Kickstart the Vision',
    tagline: '01 Discovery',
    stepLabel: 'Kickstart',
    description:
      'We begin by aligning on your goals, brand voice, and the cinematic language that will power the campaign.',
    nextLabel: 'Next: Strategy',
    accent: '#2da4da',
    sources: [
      {
        src: 'https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4',
        type: 'video/mp4',
      },
    ],
    poster: 'https://images.pexels.com/photos/2757549/pexels-photo-2757549.jpeg?auto=compress&cs=tinysrgb&w=1280',
  },
  {
    title: 'Strategy in Motion',
    tagline: '02 Storycraft',
    stepLabel: 'Strategy',
    description:
      'Script, shotlist, and mood boards fall into place so every frame strengthens your brand narrative.',
    nextLabel: 'Next: Production',
    accent: '#ff5f40',
    sources: [
      {
        src: 'https://storage.googleapis.com/coverr-main/mp4/Underwater_Bubbles.mp4',
        type: 'video/mp4',
      },
    ],
    poster: 'https://images.pexels.com/photos/3137063/pexels-photo-3137063.jpeg?auto=compress&cs=tinysrgb&w=1280',
  },
  {
    title: 'Production Day',
    tagline: '03 Lights. Camera. Action.',
    stepLabel: 'Production',
    description:
      'Our crew orchestrates every detail on set—from lighting to aerial shots—to capture emotive footage.',
    nextLabel: 'Next: Launch',
    accent: '#a56bff',
    sources: [
      {
        src: 'https://storage.googleapis.com/coverr-main/mp4/Footboys.mp4',
        type: 'video/mp4',
      },
    ],
    poster: 'https://images.pexels.com/photos/22185/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1280',
  },
  {
    title: 'Launch & Amplify',
    tagline: '04 Performance',
    stepLabel: 'Launch',
    description:
      'We edit, polish, and deliver optimized cuts while our marketing specialists launch with precision.',
    nextLabel: 'Back to Start',
    accent: '#ffc857',
    sources: [
      {
        src: 'https://storage.googleapis.com/coverr-main/mp4/Sunrise-Timelapse.mp4',
        type: 'video/mp4',
      },
    ],
    poster: 'https://images.pexels.com/photos/2531553/pexels-photo-2531553.jpeg?auto=compress&cs=tinysrgb&w=1280',
  },
];

const state = {
  currentIndex: 0,
  isMuted: true,
  isPlaying: false,
};

const video = document.querySelector('#hero-video');
const source = document.querySelector('#hero-video-source');
const hero = document.querySelector('.hero');
const title = document.querySelector('.hero__title');
const kicker = document.querySelector('.hero__kicker');
const description = document.querySelector('.hero__description');
const nextLabel = document.querySelector('.hero__next-label');
const scenesList = document.querySelector('.hero__scenes');
const playToggle = document.querySelector('#play-toggle');
const muteToggle = document.querySelector('#mute-toggle');
const nextButton = document.querySelector('#next-button');

function formatIndex(index) {
  return String(index + 1).padStart(2, '0');
}

function createSceneButton(item, index) {
  const li = document.createElement('li');
  li.className = 'hero__scene';
  li.dataset.index = index.toString();

  const indexEl = document.createElement('span');
  indexEl.className = 'hero__scene-index';
  indexEl.textContent = `${formatIndex(index)} ${item.stepLabel || item.title}`;

  const titleEl = document.createElement('h4');
  titleEl.className = 'hero__scene-title';
  titleEl.textContent = item.title;

  li.append(indexEl, titleEl);
  li.addEventListener('click', () => {
    loadScene(index);
    playCurrentScene(true);
  });
  return li;
}

function renderScenes() {
  scenesList.innerHTML = '';
  playlist.forEach((item, index) => {
    const scene = createSceneButton(item, index);
    scenesList.appendChild(scene);
  });
}

function applyAccent(accent) {
  hero.style.setProperty('--color-accent', accent);
  hero.style.setProperty('--color-accent-strong', accent);
}

function setSceneActive(index) {
  scenesList.querySelectorAll('.hero__scene').forEach((node) => {
    node.classList.toggle('is-active', Number(node.dataset.index) === index);
  });
}

function loadScene(index) {
  state.currentIndex = index;
  const item = playlist[index];
  applyAccent(item.accent || getComputedStyle(hero).getPropertyValue('--color-accent'));
  kicker.textContent = item.tagline || `0${index + 1}`;
  title.textContent = item.title;
  description.textContent = item.description;
  nextLabel.textContent = item.nextLabel || 'Next';
  const preferredSource = item.sources?.[0];
  if (preferredSource) {
    source.src = preferredSource.src;
    source.type = preferredSource.type || 'video/mp4';
  } else if (item.src) {
    source.src = item.src;
    source.type = item.type || 'video/mp4';
  }
  video.poster = item.poster || '';
  video.load();
  setSceneActive(index);
}

function playCurrentScene(userInitiated = false) {
  if (userInitiated) {
    state.isPlaying = true;
  }
  const playPromise = video.play();
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        state.isPlaying = true;
        updatePlayButton();
      })
      .catch(() => {
        state.isPlaying = false;
        updatePlayButton();
      });
  }
}

function togglePlay() {
  if (video.paused) {
    playCurrentScene(true);
  } else {
    video.pause();
    state.isPlaying = false;
    updatePlayButton();
  }
}

function updatePlayButton() {
  playToggle.setAttribute('aria-pressed', state.isPlaying ? 'true' : 'false');
  playToggle.innerHTML = state.isPlaying
    ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3v14H7zm7 0h3v14h-3z"/></svg>'
    : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
}

function updateMuteButton() {
  muteToggle.setAttribute('aria-pressed', state.isMuted ? 'true' : 'false');
  muteToggle.innerHTML = state.isMuted
    ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.5 12c0-1.77-.77-3.36-2-4.47v8.94c1.23-1.11 2-2.7 2-4.47z"/><path d="M19 12c0 2.65-1.03 5.05-2.69 6.83L15.2 17.7c1.14-1.2 1.8-2.84 1.8-4.7s-.66-3.5-1.8-4.7l1.11-1.12C17.97 6.95 19 9.35 19 12z"/><path d="M12 4.5v15l-4.5-4.5H5v-6h2.5z"/></svg>'
    : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 5V4l-5 5H4zm13.5 3c0-1.77-.77-3.36-2-4.47v8.94c1.23-1.11 2-2.7 2-4.47z"/><path d="M19 12c0 2.65-1.03 5.05-2.69 6.83L15.2 17.7c1.14-1.2 1.8-2.84 1.8-4.7s-.66-3.5-1.8-4.7l1.11-1.12C17.97 6.95 19 9.35 19 12z"/></svg>';
}

function toggleMute() {
  state.isMuted = !state.isMuted;
  video.muted = state.isMuted;
  updateMuteButton();
}

function goToNextScene() {
  const nextIndex = (state.currentIndex + 1) % playlist.length;
  loadScene(nextIndex);
  playCurrentScene(true);
}

video.addEventListener('ended', () => {
  goToNextScene();
});

video.addEventListener('play', () => {
  state.isPlaying = true;
  updatePlayButton();
});

video.addEventListener('pause', () => {
  state.isPlaying = false;
  updatePlayButton();
});

playToggle.addEventListener('click', () => togglePlay());
muteToggle.addEventListener('click', () => toggleMute());
nextButton.addEventListener('click', () => goToNextScene());

renderScenes();
loadScene(0);
video.muted = state.isMuted;
updateMuteButton();
updatePlayButton();

// Autoplay the first scene when the video becomes interactable.
window.addEventListener('DOMContentLoaded', () => {
  playCurrentScene();
});
