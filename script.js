// ===== Mobile nav toggle =====
const toggle = document.querySelector('.nav-toggle');
const links = document.querySelector('.nav-links');

toggle.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});

// Close mobile menu when a link is tapped
links.querySelectorAll('a').forEach((a) => {
  a.addEventListener('click', () => {
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  });
});

// ===== Dynamic footer year =====
document.getElementById('year').textContent = new Date().getFullYear();

// ===== Background jingle + on-page player =====
(function () {
  const audio = document.getElementById('jingle');
  if (!audio) return;

  const fab = document.getElementById('soundToggle');
  const playBtn = document.getElementById('playBtn');
  const muteBtn = document.getElementById('muteBtn');
  const seek = document.getElementById('seek');
  const vol = document.getElementById('vol');
  const curTime = document.getElementById('curTime');
  const durTime = document.getElementById('durTime');

  audio.volume = parseFloat(vol.value);

  const fmt = (s) => {
    if (!isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  // Keep every control in sync with the real playback state
  function syncUI() {
    const playing = !audio.paused;
    playBtn.classList.toggle('playing', playing);
    fab.classList.toggle('is-paused', !playing);
    fab.setAttribute('aria-pressed', String(playing));
    fab.setAttribute('aria-label', playing ? 'Pause background music' : 'Play background music');
    muteBtn.classList.toggle('muted', audio.muted || audio.volume === 0);
  }

  function togglePlay() {
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }

  // ----- Autoplay on arrival, with first-interaction fallback -----
  // Browsers block audible autoplay until the user interacts with the page,
  // so attempt playback now and, if blocked, start on the first interaction.
  let armed = false;
  function armFirstInteraction() {
    if (armed) return;
    armed = true;
    const start = () => {
      audio.play().catch(() => {});
      ['pointerdown', 'keydown', 'touchstart', 'scroll'].forEach((ev) =>
        window.removeEventListener(ev, start)
      );
    };
    ['pointerdown', 'keydown', 'touchstart', 'scroll'].forEach((ev) =>
      window.addEventListener(ev, start, { passive: true })
    );
  }

  function attemptAutoplay() {
    const p = audio.play();
    if (p && typeof p.catch === 'function') p.catch(() => armFirstInteraction());
  }

  // ----- Event wiring -----
  audio.addEventListener('play', syncUI);
  audio.addEventListener('pause', syncUI);
  audio.addEventListener('volumechange', syncUI);

  audio.addEventListener('loadedmetadata', () => {
    durTime.textContent = fmt(audio.duration);
  });

  audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
      seek.value = (audio.currentTime / audio.duration) * 100;
      curTime.textContent = fmt(audio.currentTime);
    }
  });

  fab.addEventListener('click', togglePlay);
  playBtn.addEventListener('click', togglePlay);

  muteBtn.addEventListener('click', () => {
    audio.muted = !audio.muted;
    if (!audio.muted && audio.paused) audio.play().catch(() => {});
    syncUI();
  });

  seek.addEventListener('input', () => {
    if (audio.duration) audio.currentTime = (seek.value / 100) * audio.duration;
  });

  vol.addEventListener('input', () => {
    audio.volume = parseFloat(vol.value);
    if (audio.volume > 0) audio.muted = false;
  });

  // Kick things off
  attemptAutoplay();
  syncUI();
})();
