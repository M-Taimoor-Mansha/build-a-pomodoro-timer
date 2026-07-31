(function initPomodoro() {
  function run() {
    // ============================================================
    // STATE & SETTINGS
    // ============================================================
    const DEFAULT_SETTINGS = {
      durations: { focus: 25, short: 5, long: 15, cycle: 4 },
      sound: true,
      notif: false,
    };

    let settings = loadJSON('pomo_settings', DEFAULT_SETTINGS);
    settings = {
      ...DEFAULT_SETTINGS,
      ...settings,
      durations: { ...DEFAULT_SETTINGS.durations, ...(settings.durations || {}) },
    };

    let currentMode   = 'pomodoro';
    let timeLeft       = settings.durations.focus * 60;
    let totalTime      = timeLeft;
    let isRunning      = false;
    let timerInterval  = null;
    let pomodoroCount  = 0;
    let audioCtx       = null;

    const timerModes = () => ({
      pomodoro:   (settings.durations.focus || 25) * 60,
      short:      (settings.durations.short || 5) * 60,
      long:       (settings.durations.long || 15) * 60,
    });

    // ============================================================
    // DOM REFS
    // ============================================================
    const $ = id => document.getElementById(id);

    const timeDisplay       = $('time-display');
    const modeLabel         = $('current-mode-display');
    const startBtn          = $('start-pause-button');
    const resetBtn          = $('reset-button');
    const playIcon          = $('play-icon');
    const pauseIcon         = $('pause-icon');
    const btnLabel          = $('btn-label');
    const quoteText         = $('quote-text');
    const progressCircle    = $('progress-ring-circle');
    const timerVisual       = $('timer-visual-container');
    const sessionDots       = $('session-dots');
    const pomodoroCount$    = $('pomodoro-count');
    const canvas            = $('bg-canvas');

    if (!timeDisplay || !startBtn || !progressCircle) {
      console.error('Pomodoro Timer: Required DOM elements missing');
      return;
    }

    // SVG Ring Calculations
    let radius = 82;
    if (progressCircle.r && progressCircle.r.baseVal) {
      radius = progressCircle.r.baseVal.value;
    } else {
      radius = parseFloat(progressCircle.getAttribute('r')) || 82;
    }
    const circumference = 2 * Math.PI * radius;
    progressCircle.style.strokeDasharray  = `${circumference} ${circumference}`;
    progressCircle.style.strokeDashoffset = '0';

    // ============================================================
    // QUOTES
    // ============================================================
    const quotes = [
      '"Focus is the art of knowing what to ignore."',
      '"The secret of getting ahead is getting started." — Mark Twain',
      '"Your focus determines your reality." — Qui-Gon Jinn',
      '"Small daily improvements over time lead to stunning results."',
      '"Deep work is the superpower of the 21st century." — Cal Newport',
      '"Do what you can, with what you have, where you are."',
      '"Discipline is choosing between what you want now and what you want most."',
      '"Energy flows where attention goes."',
      '"Every moment of resistance to temptation is a victory." — Frederick W. Faber',
      '"The ability to focus attention on important things is a defining characteristic of intelligence."',
    ];

    function rotateQuote() {
      if (!quoteText) return;
      quoteText.style.opacity = '0';
      setTimeout(() => {
        quoteText.textContent = quotes[Math.floor(Math.random() * quotes.length)];
        quoteText.style.opacity = '1';
      }, 300);
    }
    if (quoteText) quoteText.style.transition = 'opacity 0.3s';

    // ============================================================
    // TICK MARKS
    // ============================================================
    (() => {
      const g = $('tick-marks');
      if (!g) return;
      g.innerHTML = '';
      const cx = 100, cy = 100, r = 95;
      for (let i = 0; i < 60; i++) {
        const angle = (i * 6 - 90) * Math.PI / 180;
        const major = i % 5 === 0;
        const inner = r - (major ? 7 : 4);
        const x1 = cx + inner * Math.cos(angle);
        const y1 = cy + inner * Math.sin(angle);
        const x2 = cx + r * Math.cos(angle);
        const y2 = cy + r * Math.sin(angle);
        const ln = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        ln.setAttribute('x1', x1); ln.setAttribute('y1', y1);
        ln.setAttribute('x2', x2); ln.setAttribute('y2', y2);
        ln.classList.add('tick-mark');
        if (major) ln.classList.add('major');
        g.appendChild(ln);
      }
    })();

    // ============================================================
    // ANIMATED BG (particles)
    // ============================================================
    if (canvas && canvas.getContext) {
      const ctx = canvas.getContext('2d');
      let particles = [];

      function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
      resizeCanvas();
      window.addEventListener('resize', resizeCanvas);

      function spawnParticles() {
        const n = Math.min(50, Math.floor(canvas.width * canvas.height / 18000));
        particles = Array.from({ length: Math.max(15, n) }, () => ({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          r: Math.random() * 1.8 + 0.4,
          a: Math.random() * 0.25 + 0.04,
        }));
      }
      spawnParticles();

      function getAccentRGB() {
        const style = getComputedStyle(document.documentElement);
        const h = parseFloat(style.getPropertyValue('--accent-h')) || 355;
        const s = parseFloat(style.getPropertyValue('--accent-s')) || 85;
        const l = parseFloat(style.getPropertyValue('--accent-l')) || 62;
        return hslToRgb(h, s, l);
      }

      function hslToRgb(h, s, l) {
        s /= 100; l /= 100;
        const a = s * Math.min(l, 1 - l);
        const f = (n) => {
          const k = (n + h / 30) % 12;
          return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        };
        return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
      }

      (function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const [r, g, b] = getAccentRGB();
        particles.forEach(p => {
          p.x = (p.x + p.vx + canvas.width) % canvas.width;
          p.y = (p.y + p.vy + canvas.height) % canvas.height;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r},${g},${b},${p.a})`;
          ctx.fill();
        });
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 110) {
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.strokeStyle = `rgba(${r},${g},${b},${0.03 * (1 - d / 110)})`;
              ctx.lineWidth = 0.5;
              ctx.stroke();
            }
          }
        }
        requestAnimationFrame(draw);
      })();
    }

    // ============================================================
    // TIMER DISPLAY
    // ============================================================
    function updateDisplay() {
      const m = Math.floor(Math.max(0, timeLeft) / 60);
      const s = Math.floor(Math.max(0, timeLeft) % 60);
      const fmt = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      if (timeDisplay) timeDisplay.textContent = fmt;
      document.title = `${fmt} — Focus`;

      const progress = totalTime > 0 ? timeLeft / totalTime : 1;
      const offset = circumference - progress * circumference;
      if (progressCircle) progressCircle.style.strokeDashoffset = offset;
    }

    // ============================================================
    // MODE SWITCHING
    // ============================================================
    const modeLabels = { pomodoro: 'Focus', short: 'Short Break', long: 'Long Break' };

    function switchMode(newMode) {
      currentMode = newMode;
      const modes = timerModes();
      timeLeft  = modes[newMode] || 1500;
      totalTime = timeLeft;
      pauseTimer();
      updateDisplay();
      updateModeTabs();
      updateModeBodyClass();
      if (modeLabel) modeLabel.textContent = modeLabels[newMode] || 'Focus';
      rotateQuote();
    }

    function updateModeTabs() {
      document.querySelectorAll('.mode-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === currentMode);
      });
    }

    function updateModeBodyClass() {
      document.body.classList.remove('mode-short-break', 'mode-long-break');
      if (currentMode === 'short') document.body.classList.add('mode-short-break');
      if (currentMode === 'long')  document.body.classList.add('mode-long-break');
    }

    // ============================================================
    // SESSION DOTS
    // ============================================================
    function updateDots() {
      if (!sessionDots) return;
      const dots = sessionDots.querySelectorAll('.dot');
      const cycle = settings.durations.cycle || 4;
      const filled = pomodoroCount % cycle;
      dots.forEach((d, i) => d.classList.toggle('filled', i < filled));
    }

    function rebuildDots() {
      if (!sessionDots) return;
      sessionDots.innerHTML = '';
      const n = settings.durations.cycle || 4;
      for (let i = 0; i < n; i++) {
        const s = document.createElement('span');
        s.className = 'dot';
        sessionDots.appendChild(s);
      }
      updateDots();
    }

    // ============================================================
    // NATIVE WEB AUDIO (No external libraries required)
    // ============================================================
    function getAudioContext() {
      if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) audioCtx = new AudioContextClass();
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      return audioCtx;
    }

    function playSound() {
      if (!settings.sound) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const notes = [659.25, 783.99, 987.77]; // E5, G5, B5 chime
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.14);
          gain.gain.setValueAtTime(0.15, now + idx * 0.14);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.14 + (idx === 2 ? 0.35 : 0.12));
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.14);
          osc.stop(now + idx * 0.14 + (idx === 2 ? 0.35 : 0.12));
        });
      } catch (e) {
        console.warn('Audio play exception:', e);
      }
    }

    // ============================================================
    // NOTIFICATIONS
    // ============================================================
    function sendNotification() {
      if (!settings.notif || typeof Notification === 'undefined') return;
      if (Notification.permission === 'granted') {
        new Notification('Pomodoro Timer', {
          body: currentMode === 'pomodoro'
            ? 'Focus session complete! Take a break.'
            : 'Break over — time to focus!',
        });
      }
    }

    // ============================================================
    // START / PAUSE / RESET
    // ============================================================
    function startTimer() {
      if (isRunning) return;

      // Unlock AudioContext on user interaction
      getAudioContext();

      isRunning = true;
      if (playIcon) playIcon.classList.add('hidden');
      if (pauseIcon) pauseIcon.classList.remove('hidden');
      if (btnLabel) btnLabel.textContent = 'PAUSE';
      if (timerVisual) timerVisual.classList.add('timer-running');

      timerInterval = setInterval(() => {
        timeLeft--;
        updateDisplay();
        if (timeLeft <= 0) handleTimerEnd();
      }, 1000);
    }

    function pauseTimer() {
      isRunning = false;
      if (timerInterval) clearInterval(timerInterval);
      timerInterval = null;
      if (playIcon) playIcon.classList.remove('hidden');
      if (pauseIcon) pauseIcon.classList.add('hidden');
      if (btnLabel) btnLabel.textContent = 'START';
      if (timerVisual) timerVisual.classList.remove('timer-running');
    }

    function resetTimer() {
      pauseTimer();
      const modes = timerModes();
      timeLeft  = modes[currentMode] || 1500;
      totalTime = timeLeft;
      updateDisplay();
    }

    function handleTimerEnd() {
      pauseTimer();
      playSound();
      sendNotification();

      if (currentMode === 'pomodoro') {
        pomodoroCount++;
        if (pomodoroCount$) pomodoroCount$.textContent = pomodoroCount;
        updateDots();

        const cycle = settings.durations.cycle || 4;
        const nextBreak = pomodoroCount % cycle === 0 ? 'long' : 'short';
        switchMode(nextBreak);
      } else {
        switchMode('pomodoro');
      }
    }

    // ============================================================
    // EVENT LISTENERS
    // ============================================================
    startBtn.addEventListener('click', () => isRunning ? pauseTimer() : startTimer());
    if (resetBtn) resetBtn.addEventListener('click', resetTimer);

    document.querySelectorAll('.mode-tab').forEach(btn => {
      btn.addEventListener('click', () => switchMode(btn.dataset.mode));
    });

    // Keyboard shortcuts: Space = Start/Pause, R = Reset
    document.addEventListener('keydown', e => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'Space') { e.preventDefault(); isRunning ? pauseTimer() : startTimer(); }
      if (e.code === 'KeyR')  { e.preventDefault(); resetTimer(); }
    });

    // ============================================================
    // HELPERS
    // ============================================================
    function loadJSON(key, def) {
      try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; }
      catch { return def; }
    }

    // ============================================================
    // INIT
    // ============================================================
    rebuildDots();
    updateDisplay();
    updateModeTabs();
    updateModeBodyClass();
    rotateQuote();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();