(function(){
  const videoWrap = document.getElementById('cpVideoWrap');
  const video = document.getElementById('cpVideo');
  const source = document.getElementById('cpVideoSrc');
  const muteBtn = document.getElementById('cpMuteBtn');
  const muteIcon = document.getElementById('cpMuteIcon');
  const pauseIndicator = document.getElementById('cpPauseIndicator');
  const sliderTrigger = document.getElementById('cpSliderTrigger');
  const sliderPanel = document.getElementById('cpSliderPanel');
  const topicsList = document.getElementById('cpTopics');
  const progress = document.getElementById('cpProgress');
  const sliderTitle = document.getElementById('cpSliderTitle');
  const backBtn = document.getElementById('cpReturnBtn');

  // Video history for back navigation
  let videoHistory = [];
  let lastActiveIndex = 0;
  backBtn.style.display = "none";

  /* Sync pause overlay */
  const syncPlayIcon = () => {
    pauseIndicator.classList.toggle('show', video.paused);
  };

  /* Video click to toggle play/pause */
  videoWrap.addEventListener('click', () => {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
    syncPlayIcon();
  });

  /* Also keep sync on state changes */
  ['play', 'pause', 'ended'].forEach(evt => {
    video.addEventListener(evt, syncPlayIcon);
  });

  /* Mute toggle button */
  muteBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    video.muted = !video.muted;

    if (video.muted) {
      // MUTE ICON
      muteIcon.innerHTML = `
        <path d="M11.38,2.82c-.59-.29-1,0-1.47.37C8.47,4.35,7,5.49,5.59,6.66a1.6,1.6,0,0,1-1.16.4c-1,0-2,0-3.06,0S0,7.48,0,8.39c0,2,0,4,0,6.07,0,.95.42,1.35,1.39,1.36s2,0,3,0a1.75,1.75,0,0,1,1.2.42c1.51,1.23,3,2.44,4.56,3.65a1,1,0,0,0,1.18.18,1.17,1.17,0,0,0,.71-1c0-.17,0-.35,0-.52v-7c0-2.41,0-4.81,0-7.22A1.36,1.36,0,0,0,11.38,2.82Z"/>
      `;
    } else {
      // UNMUTE ICON
      muteIcon.innerHTML = `
        <path d="M12 3L7 7H3v10h4l5 4V3zm5.54 3.46L16.12 7.9A5 5 0 0 1 17 12a5 5 0 0 1-.88 2.9l1.42 1.42A7 7 0 0 0 19 12a7 7 0 0 0-1.46-4.54z"/>
        <path d="M14.83 9.17l-1.41 1.41A1.98 1.98 0 0 1 13 12c0 .37.1.72.28 1.02l1.41 1.41A3.98 3.98 0 0 0 15 12c0-1.1-.45-2.1-1.17-2.83z"/>
      `;
    }
  });

  /* Progress bar update loop */
  const updateProgress = () => {
    if (!isFinite(video.duration) || video.duration === 0) return;
    const pct = (video.currentTime / video.duration) * 100;
    progress.value = pct;
    progress.style.background = `linear-gradient(to right, #2DA4DA ${pct}%, rgba(255,255,255,0.15) ${pct}%)`;
    requestAnimationFrame(updateProgress);
  };

  video.addEventListener('loadedmetadata', updateProgress);
  video.addEventListener('play', updateProgress);

  /* Scrubbing */
  const seekTo = () => {
    if (!isFinite(video.duration) || video.duration === 0) return;
    const pct = parseFloat(progress.value) || 0;
    video.currentTime = (pct / 100) * video.duration;
  };
  
  progress.addEventListener('input', seekTo);
  progress.addEventListener('change', seekTo);

  /* Slider toggle */
  const toggleSlider = () => {
    sliderPanel.classList.toggle('open');
    sliderTrigger.classList.toggle('active');
  };
  
  sliderTrigger.addEventListener('click', (e) => { 
    e.stopPropagation(); 
    toggleSlider(); 
  });

  document.addEventListener('click', (evt) => {
    const within = evt.target.closest('#cpSlider');
    if (!within) {
      sliderPanel.classList.remove('open');
      sliderTrigger.classList.remove('active');
    }
  });

  /* Topic switching */
  topicsList.addEventListener('click', (e) => {
    const btn = e.target.closest('.cp-topic-btn');
    if (!btn) return;

    const topics = [...topicsList.querySelectorAll('.cp-topic')];
    const activeTopic = btn.closest('.cp-topic');
    const activeIndex = topics.indexOf(activeTopic);

    // STORE current state before changing anything
    videoHistory.push({
      src: source.src,
      title: sliderTitle.textContent,
      lastIndex: lastActiveIndex,
      visibleStates: topics.map(li => li.style.display !== "none")
    });

    // UI Active State
    topics.forEach(li => li.classList.remove('active'));
    activeTopic.classList.add('active');

    // Progressive button removal
    if (activeIndex !== lastActiveIndex) {
      topics[lastActiveIndex].style.display = "none";
    }
    lastActiveIndex = activeIndex;

    // Now show Back Button
    if (videoHistory.length > 0) backBtn.style.display = "flex";

    // Video Change
    const nextSrc = btn.dataset.video;
    const nextTitle = btn.dataset.title;

    if (nextSrc && nextSrc !== source.src) {
      video.classList.add('fade-out');
      setTimeout(() => {
        source.src = nextSrc;
        video.load();
        video.currentTime = 0;
        video.play().catch(()=>{});
        sliderTitle.textContent = nextTitle;
        setTimeout(() => video.classList.remove('fade-out'), 120);
      }, 200);
    }

    pauseIndicator.classList.remove('show');
    sliderPanel.classList.remove('open');
    sliderTrigger.classList.remove('active');
  });

  backBtn.addEventListener('click', () => {
    if (videoHistory.length === 0) return;

    const last = videoHistory.pop();

    // Restore video
    video.classList.add('fade-out');
    setTimeout(() => {
      source.src = last.src;
      video.load();
      video.currentTime = 0;
      video.play().catch(()=>{});
      sliderTitle.textContent = last.title;
      setTimeout(() => video.classList.remove('fade-out'), 120);
    }, 200);

    // Restore buttons
    const topics = [...topicsList.querySelectorAll('.cp-topic')];
    topics.forEach((li, idx) => {
      li.style.display = last.visibleStates[idx] ? "flex" : "none";
    });

    // Restore index tracking
    lastActiveIndex = last.lastIndex;

    // Hide Back Button when back at original state
    if (videoHistory.length === 0) {
      backBtn.style.display = "none";
    }
  });
})();