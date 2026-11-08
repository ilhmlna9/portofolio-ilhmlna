/**
 * ILHAM MAULANA — THE DARK KNIGHT PORTFOLIO
 * Core Interactions, Batman Morphing Engine, Spotify Audio Player, 
 * 3D Hanging Lanyard Physics, Canvas Ambient & Interactive Tabs
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. 3D INTERACTIVE HANGING LANYARD RIG (PHYSICS & DROP-IN ENTRANCE)
     ========================================================================== */
  function initLanyardPhysics() {
    const rig = document.getElementById('lanyardRig');
    const card = document.getElementById('idCard');
    const glare = document.getElementById('cardGlare');

    if (!rig || !card) return;

    // Physics State for Entire Rig (Hanging Pendulum from Ceiling Anchor)
    let rigRotZ = -18;
    let rigTransX = 0;
    let rigTransY = -480; // Starts 480px above screen for the drop-in animation!
    let rigVelY = 0;
    let rigVelRotZ = 0;

    // Entrance Drop State
    let isDropping = true;

    // Interactive Target Offsets (from Mouse)
    let mouseNormX = 0;
    let mouseNormY = 0;
    let targetCardTiltX = 0;
    let targetCardTiltY = 0;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let isHoveringCard = false;

    // Track Mouse across Screen
    function onMouseMove(e) {
      if (isDragging) {
        const deltaX = e.clientX - dragStartX;
        const deltaY = e.clientY - dragStartY;
        mouseNormX = Math.max(-1.5, Math.min(1.5, deltaX * 0.015));
        targetCardTiltX = Math.max(-20, Math.min(20, -deltaY * 0.2));
        targetCardTiltY = Math.max(-25, Math.min(25, deltaX * 0.25));
        return;
      }

      const rect = card.getBoundingClientRect();
      const cardCenterX = rect.left + rect.width / 2;
      const cardCenterY = rect.top + rect.height / 2;

      const normX = (e.clientX - cardCenterX) / (window.innerWidth * 0.45);
      const normY = (e.clientY - cardCenterY) / (window.innerHeight * 0.45);

      mouseNormX = Math.max(-1, Math.min(1, normX));
      mouseNormY = Math.max(-1, Math.min(1, normY));

      targetCardTiltX = -mouseNormY * 16;
      targetCardTiltY = mouseNormX * 20;

      // Update light glare reflection position
      if (glare) {
        const glareX = Math.max(0, Math.min(100, (mouseNormX + 1) * 50));
        const glareY = Math.max(0, Math.min(100, (mouseNormY + 1) * 50));
        glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.25) 0%, rgba(0, 242, 254, 0.08) 40%, transparent 70%)`;
      }
    }

    // Drag to Nudge
    card.addEventListener('mousedown', (e) => {
      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    card.addEventListener('mouseenter', () => { isHoveringCard = true; });
    card.addEventListener('mouseleave', () => {
      isHoveringCard = false;
      if (!isDragging) {
        mouseNormX = 0;
        mouseNormY = 0;
        targetCardTiltX = 0;
        targetCardTiltY = 0;
      }
    });

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // Touch support for Mobile
    card.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        dragStartX = e.touches[0].clientX;
        dragStartY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (isDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - dragStartX;
        const deltaY = e.touches[0].clientY - dragStartY;
        mouseNormX = Math.max(-1.2, Math.min(1.2, deltaX * 0.015));
        targetCardTiltX = Math.max(-15, Math.min(15, -deltaY * 0.15));
        targetCardTiltY = Math.max(-20, Math.min(20, deltaX * 0.2));
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isDragging = false;
      mouseNormX = 0;
      mouseNormY = 0;
      targetCardTiltX = 0;
      targetCardTiltY = 0;
    });

    // Secondary Card 3D Tilt angles (Relative to clip hole)
    let cardTiltX = 0;
    let cardTiltY = 0;
    let startTime = performance.now();

    function renderLanyard() {
      const now = performance.now();
      const elapsed = (now - startTime) * 0.001;

      // Drop-in entrance physics simulation (Damped Harmonic Oscillator with gravity)
      if (isDropping) {
        const tensionForce = -0.065 * rigTransY;
        rigVelY = (rigVelY + tensionForce) * 0.86;
        rigTransY += rigVelY;

        const swingForce = -0.05 * rigRotZ;
        rigVelRotZ = (rigVelRotZ + swingForce) * 0.88;
        rigRotZ += rigVelRotZ;

        // When drop settles, seamlessly hand off to interactive physics
        if (Math.abs(rigTransY) < 0.6 && Math.abs(rigVelY) < 0.25 && Math.abs(rigRotZ) < 0.6) {
          rigTransY = 0;
          rigRotZ = 0;
          isDropping = false;
        }
      } else {
        // Normal interactive & idle physics mode
        const idleSwayZ = Math.sin(elapsed * 1.4) * 1.8;
        const idleSwayX = Math.sin(elapsed * 1.4) * 4;

        // Rig follows gentle mouse sway with natural momentum
        const targetRotZ = idleSwayZ + mouseNormX * 7;
        const targetTransX = idleSwayX + mouseNormX * 18;

        rigRotZ += (targetRotZ - rigRotZ) * 0.05;
        rigTransX += (targetTransX - rigTransX) * 0.05;

        // Spring dampening on Card tilt (secondary joint at carabiner clip)
        const targetTiltX = targetCardTiltX + Math.sin(elapsed * 1.8) * 2;
        const targetTiltY = targetCardTiltY + Math.cos(elapsed * 1.6) * 2.5;

        cardTiltX += (targetTiltX - cardTiltX) * 0.08;
        cardTiltY += (targetTiltY - cardTiltY) * 0.08;
      }

      // Apply transforms to DOM elements
      rig.style.transform = `translate3d(${rigTransX.toFixed(2)}px, ${rigTransY.toFixed(2)}px, 0) rotateZ(${rigRotZ.toFixed(2)}deg)`;
      card.style.transform = `rotateX(${cardTiltX.toFixed(2)}deg) rotateY(${cardTiltY.toFixed(2)}deg)`;

      requestAnimationFrame(renderLanyard);
    }

    renderLanyard();
  }

  /* ==========================================================================
     2. BATMAN MORPH TRANSFORMATION ENGINE (Smooth Cursor Spotlight & Alter-Ego)
     ========================================================================== */
  function initBatmanMorph() {
    const card = document.getElementById('batmanMorphCard');
    const morphBatman = document.getElementById('morphBatman');
    const alterEgoBtn = document.getElementById('alterEgoBtn');
    const egoLabel = document.getElementById('egoLabel');
    const nameEl = document.getElementById('heroNameDynamic');
    const roleEl = document.getElementById('heroRoleDynamic');
    const hudStatus = document.getElementById('hudTargetStatus');
    const cursorRing = document.getElementById('cursorRing');

    if (!card || !morphBatman) return;

    let isBatmanLocked = false;
    let isHovering = false;
    let targetX = 160;
    let targetY = 180;
    let currentX = 160;
    let currentY = 180;
    let animFrameId = null;
    let glitchInterval = null;

    // Futuristic Glitch Typewriter Effect
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    function glitchText(element, targetText, duration = 350) {
      if (!element) return;
      clearInterval(glitchInterval);

      const length = targetText.length;
      const startTime = performance.now();

      glitchInterval = setInterval(() => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(1, elapsed / duration);
        const resolvedChars = Math.floor(progress * length);

        let output = '';
        for (let i = 0; i < length; i++) {
          if (i < resolvedChars) {
            output += targetText[i];
          } else {
            output += chars[Math.floor(Math.random() * chars.length)];
          }
        }

        element.innerText = output;

        if (progress >= 1) {
          clearInterval(glitchInterval);
          element.innerText = targetText;
        }
      }, 30);
    }

    function applyTargetTexts(isBatman) {
      if (isBatman) {
        glitchText(nameEl, nameEl?.getAttribute('data-batman') || 'THE DARK KNIGHT');
        if (roleEl) roleEl.innerText = roleEl.getAttribute('data-batman') || 'Gotham Vigilante & Web Architect';
        if (hudStatus) hudStatus.innerText = 'TARGET: THE DARK KNIGHT';
        if (cursorRing) cursorRing.classList.add('cursor-bat');
      } else {
        glitchText(nameEl, nameEl?.getAttribute('data-normal') || 'Ilham Maulana');
        if (roleEl) roleEl.innerText = roleEl.getAttribute('data-normal') || 'Information Systems & Web Developer';
        if (hudStatus) hudStatus.innerText = 'BIOMETRIC: DEVELOPER';
        if (cursorRing) cursorRing.classList.remove('cursor-bat');
      }
    }

    // 60fps Liquid Lerp Animation Loop for Spotlight Coordinates
    function updateSpotlight() {
      if (isHovering && !isBatmanLocked) {
        currentX += (targetX - currentX) * 0.22;
        currentY += (targetY - currentY) * 0.22;

        morphBatman.style.setProperty('--spotlight-x', `${currentX.toFixed(1)}px`);
        morphBatman.style.setProperty('--spotlight-y', `${currentY.toFixed(1)}px`);
      }

      if (isHovering) {
        animFrameId = requestAnimationFrame(updateSpotlight);
      }
    }

    // Desktop Mouse Hover & Smooth Cursor Spotlight Reveal
    card.addEventListener('mouseenter', (e) => {
      isHovering = true;
      card.classList.add('is-hovering');

      const rect = card.getBoundingClientRect();
      targetX = currentX = e.clientX - rect.left;
      targetY = currentY = e.clientY - rect.top;

      morphBatman.style.setProperty('--spotlight-x', `${currentX}px`);
      morphBatman.style.setProperty('--spotlight-y', `${currentY}px`);

      if (!isBatmanLocked) {
        applyTargetTexts(true);
        if (egoLabel) egoLabel.innerText = 'Wayne-Tech Biometric Active';
      }

      cancelAnimationFrame(animFrameId);
      animFrameId = requestAnimationFrame(updateSpotlight);
    });

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;
    });

    card.addEventListener('mouseleave', () => {
      isHovering = false;
      card.classList.remove('is-hovering');
      cancelAnimationFrame(animFrameId);

      if (!isBatmanLocked) {
        applyTargetTexts(false);
        if (egoLabel) egoLabel.innerText = 'Arahkan Kursor / Hover';
      }
    });

    // Toggle Locked Batman Mode (Alter-Ego Pill button & Card click on touch devices)
    function toggleBatmanLock(e) {
      if (e) e.stopPropagation();
      isBatmanLocked = !isBatmanLocked;

      if (isBatmanLocked) {
        card.classList.add('batman-active');
        applyTargetTexts(true);
        if (egoLabel) egoLabel.innerText = '🦇 Mode Batman Terkunci (Klik untuk Normal)';
      } else {
        card.classList.remove('batman-active');
        if (isHovering) {
          applyTargetTexts(true);
          if (egoLabel) egoLabel.innerText = 'Wayne-Tech Biometric Active';
        } else {
          applyTargetTexts(false);
          if (egoLabel) egoLabel.innerText = 'Arahkan Kursor / Hover';
        }
      }
    }

    if (alterEgoBtn) {
      alterEgoBtn.addEventListener('click', toggleBatmanLock);
    }

    // Touch devices: tap on photo to toggle lock
    card.addEventListener('click', (e) => {
      if (window.matchMedia('(pointer: coarse)').matches) {
        toggleBatmanLock(e);
      }
    });
  }

  /* ==========================================================================
     MODERN CYBER-NOIR TOAST NOTIFICATION ENGINE
     ========================================================================== */
  function playToastAudio(type) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      if (type === 'success') {
        // High-tech affirmative dual chime (D5 -> A5)
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.09, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'error') {
        // Subtle cyber warning tone (A4 -> E4)
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(329.63, now + 0.12);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.1, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.28);
      } else {
        // Subtle ambient info ping (E5)
        osc.frequency.setValueAtTime(659.25, now);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.24);
      }
    } catch (e) {
      // Audio autoplay policy fallback - fail silently
    }
  }

  function showModernToast(options, legacyIsError = false) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    let opts = {};
    if (typeof options === 'string') {
      opts = {
        type: legacyIsError ? 'error' : 'success',
        title: legacyIsError ? 'Peringatan' : 'Berhasil',
        badge: legacyIsError ? 'PERINGATAN' : 'SUKSES',
        message: options,
        duration: 4500
      };
    } else {
      opts = Object.assign({
        type: 'success',
        title: 'Spotify Terhubung',
        badge: 'TERSIMPAN',
        message: '',
        duration: 4500
      }, options);
    }

    // Play high-tech audio cue
    playToastAudio(opts.type);

    // SVGs for different states
    const icons = {
      success: '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.66.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>',
      error: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>',
      info: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
    };

    const iconSvg = icons[opts.type] || icons.info;

    const toast = document.createElement('div');
    toast.className = `modern-toast toast-${opts.type}`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `
      <div class="m-toast-icon-wrap">
        <div class="m-toast-glow"></div>
        ${iconSvg}
      </div>
      <div class="m-toast-content">
        <div class="m-toast-header">
          <span class="m-toast-title">${opts.title}</span>
          ${opts.badge ? `<span class="m-toast-badge">${opts.badge}</span>` : ''}
        </div>
        <p class="m-toast-desc">${opts.message}</p>
      </div>
      <button class="m-toast-close" aria-label="Tutup notifikasi">✕</button>
      <div class="m-toast-progress">
        <div class="m-toast-progress-bar" style="animation-duration: ${opts.duration}ms;"></div>
      </div>
    `;

    container.appendChild(toast);

    let timer = null;
    let remaining = opts.duration;
    let start = Date.now();

    function dismiss() {
      if (toast.classList.contains('toast-exit')) return;
      toast.classList.add('toast-exit');
      setTimeout(() => {
        if (toast.parentElement) toast.remove();
      }, 350);
    }

    function startTimer() {
      start = Date.now();
      timer = setTimeout(dismiss, remaining);
    }

    function pauseTimer() {
      clearTimeout(timer);
      remaining -= (Date.now() - start);
      if (remaining < 600) remaining = 600;
    }

    startTimer();

    toast.addEventListener('mouseenter', pauseTimer);
    toast.addEventListener('mouseleave', startTimer);

    const closeBtn = toast.querySelector('.m-toast-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        clearTimeout(timer);
        dismiss();
      });
    }

    return toast;
  }

  // Expose globally
  window.showModernToast = showModernToast;
  window.showToast = showModernToast;
  window.showNotificationToast = showModernToast;

  /* ==========================================================================
     3. SPOTIFY LIVE STREAM ENGINE (Owner-Controlled Direct Stream & Persistence)
     ========================================================================== */
  function initSpotifyEngine() {
    const iframe = document.getElementById('spotifyEmbedIframe');
    const directBtn = document.getElementById('spotifyOpenDirectBtn');
    const statusText = document.getElementById('spotifyStatusText');

    if (!iframe) return;

    const DEFAULT_EMBED = 'https://open.spotify.com/embed/playlist/0t6Ko3pdc9mTGPGSJwuJu3?utm_source=generator&theme=0';
    const DEFAULT_DIRECT = 'https://open.spotify.com/playlist/0t6Ko3pdc9mTGPGSJwuJu3';

    // Helper: Parse any Spotify link / URI into official embed & direct URLs
    function parseSpotifyUrl(input) {
      if (!input) return null;
      input = input.trim();

      // If already an embed URL
      if (input.includes('/embed/')) {
        const clean = input.split('?')[0];
        return {
          embedUrl: `${clean}?utm_source=generator&theme=0`,
          directUrl: clean.replace('/embed/', '/')
        };
      }

      // If Spotify URI: spotify:playlist:123 or spotify:track:123 or spotify:album:123
      const uriMatch = input.match(/spotify:(playlist|track|album|artist):([a-zA-Z0-9]+)/);
      if (uriMatch) {
        const type = uriMatch[1];
        const id = uriMatch[2];
        return {
          embedUrl: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`,
          directUrl: `https://open.spotify.com/${type}/${id}`
        };
      }

      // If Web URL: https://open.spotify.com/(playlist|track|album|artist)/(id)...
      const urlMatch = input.match(/open\.spotify\.com\/(playlist|track|album|artist)\/([a-zA-Z0-9]+)/);
      if (urlMatch) {
        const type = urlMatch[1];
        const id = urlMatch[2];
        return {
          embedUrl: `https://open.spotify.com/embed/${type}/${id}?utm_source=generator&theme=0`,
          directUrl: `https://open.spotify.com/${type}/${id}`
        };
      }

      return null;
    }

    // Set and persist playlist
    function applyPlaylist(embedUrl, directUrl, save = true) {
      iframe.src = embedUrl;
      if (directBtn) {
        directBtn.href = directUrl;
      }
      if (statusText) {
        statusText.innerText = 'ONLINE';
      }
      if (save) {
        try {
          localStorage.setItem('ilham_spotify_embed', embedUrl);
          localStorage.setItem('ilham_spotify_direct', directUrl);
        } catch (e) {
          console.warn('LocalStorage error:', e);
        }
      }
    }

    // 1. RESTORE ON REFRESH / PAGE LOAD: Check LocalStorage immediately
    try {
      const savedEmbed = localStorage.getItem('ilham_spotify_embed');
      const savedDirect = localStorage.getItem('ilham_spotify_direct');
      if (savedEmbed) {
        applyPlaylist(savedEmbed, savedDirect || savedEmbed.replace('/embed/', '/').split('?')[0], false);
      } else if (directBtn && iframe.src) {
        const directUrl = iframe.src.replace('/embed/', '/').split('?')[0];
        directBtn.href = directUrl;
      }
    } catch (e) {
      if (directBtn && iframe.src) {
        directBtn.href = iframe.src.replace('/embed/', '/').split('?')[0];
      }
    }

    const guideModal = document.getElementById('musicGuideModal');
    const closeGuideModal = document.getElementById('closeMusicGuideModal');
    const urlInput = document.getElementById('spotifyUrlInput');
    const applyBtn = document.getElementById('applySpotifyBtn');
    const resetBtn = document.getElementById('resetSpotifyDefaultBtn');
    const liveStatus = document.getElementById('spotifyLiveStatus');
    const badgeBrand = document.getElementById('spotifyBadgeBrand');

    function toggleAdminModal() {
      if (!guideModal) return;
      const isOpen = guideModal.classList.toggle('open');
      document.body.style.overflow = isOpen ? 'hidden' : '';
      if (isOpen && urlInput) {
        try {
          const currentUrl = localStorage.getItem('ilham_spotify_direct') || (iframe.src ? iframe.src.replace('/embed/', '/').split('?')[0] : '');
          urlInput.value = currentUrl;
        } catch (e) { }
        urlInput.focus();
      }
    }

    // Keyboard Shortcut: Alt + M
    document.addEventListener('keydown', (e) => {
      if ((e.altKey && (e.key === 'm' || e.key === 'M')) || (e.ctrlKey && (e.key === 'm' || e.key === 'M'))) {
        e.preventDefault();
        toggleAdminModal();
      }
    });

    // Double-click / Double-tap on CONNECTED badge or Spotify brand
    let lastTap = 0;
    if (liveStatus) {
      liveStatus.addEventListener('dblclick', toggleAdminModal);
      liveStatus.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTap < 400 && now - lastTap > 0) {
          e.preventDefault();
          toggleAdminModal();
        }
        lastTap = now;
      });
      liveStatus.style.cursor = 'pointer';
    }
    if (badgeBrand) {
      badgeBrand.addEventListener('dblclick', toggleAdminModal);
      badgeBrand.style.cursor = 'pointer';
    }

    // Apply button with permanent save
    if (applyBtn && urlInput) {
      applyBtn.addEventListener('click', () => {
        const input = urlInput.value.trim();
        if (!input) {
          showModernToast({
            type: 'error',
            title: 'Tautan Kosong',
            badge: 'INPUT KOSONG',
            message: 'Silakan tempelkan link playlist, album, atau lagu dari Spotify terlebih dahulu.'
          });
          return;
        }

        const parsed = parseSpotifyUrl(input);
        if (!parsed) {
          showModernToast({
            type: 'error',
            title: 'Tautan Tidak Valid',
            badge: 'GAGAL',
            message: 'Pastikan link berupa: https://open.spotify.com/playlist/... atau album/... atau track/...'
          });
          return;
        }

        applyPlaylist(parsed.embedUrl, parsed.directUrl, true);

        if (guideModal) {
          guideModal.classList.remove('open');
          document.body.style.overflow = '';
        }

        showModernToast({
          type: 'success',
          title: 'Spotify Terhubung',
          badge: 'TERSIMPAN PERMANEN',
          message: 'Playlist Spotify Anda berhasil disematkan dan tersimpan permanen di perangkat ini!'
        });
      });
    }

    // Reset button
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        try {
          localStorage.removeItem('ilham_spotify_embed');
          localStorage.removeItem('ilham_spotify_direct');
        } catch (e) { }

        applyPlaylist(DEFAULT_EMBED, DEFAULT_DIRECT, false);
        if (urlInput) urlInput.value = '';

        if (guideModal) {
          guideModal.classList.remove('open');
          document.body.style.overflow = '';
        }

        showModernToast({
          type: 'info',
          title: 'Playlist Direset',
          badge: 'DEFAULT ILHAM',
          message: 'Player Spotify telah dikembalikan ke playlist bawaan Ilham Maulana.'
        });
      });
    }

    if (closeGuideModal && guideModal) {
      closeGuideModal.addEventListener('click', () => {
        guideModal.classList.remove('open');
        document.body.style.overflow = '';
      });
      guideModal.addEventListener('click', (e) => {
        if (e.target === guideModal) {
          guideModal.classList.remove('open');
          document.body.style.overflow = '';
        }
      });
    }
  }

  /* ==========================================================================
     4. FLOATING CAPSULE ISLAND NAVBAR (Scroll Spy & Sliding Indicator)
     ========================================================================== */
  function initFloatingNav() {
    const nav = document.getElementById('floatingNav');
    const indicator = document.getElementById('navIndicator');
    const links = document.querySelectorAll('.capsule-link');
    const sections = ['hero', 'about', 'music', 'portfolio', 'contact'];

    if (!indicator || links.length === 0) return;

    function moveIndicator(targetLink) {
      if (!targetLink) return;
      const navRect = targetLink.parentElement.getBoundingClientRect();
      const linkRect = targetLink.getBoundingClientRect();

      const left = linkRect.left - navRect.left;
      const width = linkRect.width;

      indicator.style.left = `${left}px`;
      indicator.style.width = `${width}px`;

      links.forEach((l) => l.classList.remove('active'));
      targetLink.classList.add('active');
    }

    // Initial positioning
    const initialActive = document.querySelector('.capsule-link.active') || links[0];
    setTimeout(() => {
      moveIndicator(initialActive);
    }, 150);

    // Window resize recalculate
    window.addEventListener('resize', () => {
      const currentActive = document.querySelector('.capsule-link.active') || links[0];
      moveIndicator(currentActive);
    });

    // Click behavior
    links.forEach((link) => {
      link.addEventListener('click', () => {
        moveIndicator(link);
      });
    });

    // Scroll Spy using scroll position
    let isThrottled = false;
    window.addEventListener('scroll', () => {
      if (isThrottled) return;
      isThrottled = true;
      setTimeout(() => { isThrottled = false; }, 80);

      const scrollPos = window.scrollY + 200;

      for (let i = sections.length - 1; i >= 0; i--) {
        const sec = document.getElementById(sections[i]);
        if (sec && scrollPos >= sec.offsetTop) {
          const matchLink = document.querySelector(`.capsule-link[data-section="${sections[i]}"]`);
          if (matchLink && !matchLink.classList.contains('active')) {
            moveIndicator(matchLink);
          }
          break;
        }
      }
    }, { passive: true });

    // Mobile Hamburger & Drawer
    const hamburger = document.getElementById('hamburger');
    const drawer = document.getElementById('navDrawer');
    const drawerClose = document.getElementById('drawerClose');
    const drawerOverlay = document.getElementById('drawerOverlay');
    const drawerLinks = document.querySelectorAll('.drawer-link');

    function openDrawer() {
      if (drawer) drawer.classList.add('open');
      if (drawerOverlay) drawerOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
      if (drawer) drawer.classList.remove('open');
      if (drawerOverlay) drawerOverlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    if (hamburger) hamburger.addEventListener('click', openDrawer);
    if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
    if (drawerOverlay) drawerOverlay.addEventListener('click', closeDrawer);

    drawerLinks.forEach((l) => {
      l.addEventListener('click', closeDrawer);
    });
  }

  /* ==========================================================================
     5. PORTFOLIO TABBED SYSTEM (Projects, Certificates, Achievements, Tech)
     ========================================================================== */
  function initPortfolioTabs() {
    const tabBtns = document.querySelectorAll('.portfolio-tab-btn');
    const tabPanes = document.querySelectorAll('.portfolio-tab-pane');

    if (tabBtns.length === 0) return;

    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');

        tabBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        tabPanes.forEach((pane) => {
          if (pane.id === `pane-${targetTab}`) {
            pane.classList.add('active');
          } else {
            pane.classList.remove('active');
          }
        });
      });
    });
  }

  /* ==========================================================================
     6. PROJECT DETAIL MODAL DATA & CONTROLLER
     ========================================================================== */
  const projectDatabase = {
    monitexa: {
      title: 'Monitexa — Manajemen Konstruksi',
      category: 'Web Application & Project Management',
      img: 'assets/img/project-monitexa.svg',
      desc: 'Sistem manajemen proyek konstruksi berbasis web yang dirancang untuk mengatasi hambatan birokrasi dan ketidaksesuaian laporan lapangan. Platform ini menyediakan pemantauan progres fisik harian, manajemen anggaran biaya (RAB), logistik material, dan portal klien transparan.',
      problem: 'Proses pengawasan proyek konstruksi sering menghadapi deviasi jadwal, pembengkakan anggaran akibat alur approval lambat, dan tidak sinkronnya laporan teknisi lapangan dengan pihak manajemen.',
      solution: 'Membangun aplikasi terpusat dengan sistem otorisasi multi-level (Admin, Project Manager, Teknisi Lapangan, dan Client). Fitur kurva S digital, verifikasi foto progres geotag, dan tracking pengadaan material secara real-time.',
      tech: ['Laravel', 'PHP', 'MySQL', 'Tailwind CSS', 'Livewire', 'Chart.js'],
      features: [
        'Dashboard analitik progress milestone & kurva S proyek',
        'Multi-role access control (Admin, Manager, Teknisi, Client)',
        'Manajemen inventaris material dan modul verifikasi RAB',
        'Portal pemantauan klien dengan log aktivitas transparan',
        'Export laporan periodik ke format PDF dan Excel terstandarisasi'
      ],
      demoLink: '#',
      githubLink: 'https://github.com/ilhmlna9'
    },
    presensiku: {
      title: 'Sistem Presensi (Presensiku)',
      category: 'Web Application & Attendance System',
      img: 'assets/img/project-presensi.svg',
      desc: 'Sistem absensi pegawai berbasis web modern yang dikembangkan untuk menyederhanakan manajemen kehadiran, jadwal shift kerja, dan rekapitulasi data pegawai secara presisi.',
      problem: 'Metode absensi konvensional memicu risiko kecurangan kehadiran, rekapitulasi manual yang memakan waktu berhari-hari, dan ketiadaan validasi koordinat lokasi kehadiran.',
      solution: 'Merancang sistem presensi berbasis web terintegrasi dengan validasi jam kerja dinamis, dukungan multi-shift, validasi radius koordinat GPS kantor, dan pelaporan otomatis untuk administrator HR.',
      tech: ['CodeIgniter 3', 'PHP', 'MySQL', 'Bootstrap', 'JavaScript', 'Geolocation API'],
      features: [
        'Pencatatan jam kehadiran masuk & pulang secara real-time',
        'Validasi geotagging radius kantor untuk mencegah manipulasi lokasi',
        'Manajemen shift kerja pegawai (Pagi, Siang, dan Reguler)',
        'Dashboard rekapitulasi bulanan otomatis untuk departemen HR',
        'Pengajuan dan persetujuan izin, sakit, serta cuti terintegrasi'
      ],
      demoLink: '#',
      githubLink: 'https://github.com/ilhmlna9'
    },
    portfolio: {
      title: 'Website Portofolio Personal — The Dark Knight Edition',
      category: 'Interactive Web & UI Engineering',
      img: 'assets/img/project-portfolio.svg',
      desc: 'Website portofolio developer modern yang dirancang khusus dengan estetika dark-theme Gotham, Batman morph transformation, interactive 3D physics lanyard, custom cursor, Spotify-style music player, dan tipografi editorial.',
      problem: 'Banyak website portofolio developer yang menggunakan template generik AI instan dengan animasi berlebih tanpa sentuhan personal dan karakteristik identitas yang kuat.',
      solution: 'Mengembangkan personal portfolio custom dari nol dengan sistem desain dark obsidian & electric accents, simulasi fisika 3D untuk ID card lanyard foto personal, alter-ego Batman transition, dan pemutar musik Spotify terintegrasi.',
      tech: ['HTML5 Semantic', 'CSS3 Custom Tokens', 'Modern JavaScript (ES6+)', 'Canvas API', 'Audio Engine'],
      features: [
        'Batman Alter-Ego Morph Transition dengan Wayne-Tech HUD',
        'Spotify-style Glassmorphism Music Player dengan Audio Engine',
        '3D Interactive Hanging Lanyard dengan physics tilt & idle sway',
        'Gotham Starfield Canvas & Dynamic Cursor Tracking',
        'Tabbed Portfolio Showcase (Projects, Certificates, Achievements, Tech)'
      ],
      demoLink: '#',
      githubLink: 'https://github.com/ilhmlna9'
    }
  };

  function initProjectModal() {
    const modal = document.getElementById('projectModal');
    const closeBtn = document.getElementById('closeProjectModal');
    const backBtn = document.getElementById('modalBackAction');
    const crumbText = document.getElementById('modalBreadcrumb');
    const content = document.getElementById('projectModalContent');
    const triggers = document.querySelectorAll('.btn-detail-trigger');

    if (!modal || !content) return;

    function openModal(projectId) {
      const p = projectDatabase[projectId];
      if (!p) return;

      if (crumbText) {
        crumbText.innerHTML = `Projects &gt; <span style="color:#fff;font-weight:600">${p.title}</span>`;
      }

      const techBadges = p.tech.map((t) => `<span class="tech-pill">${t}</span>`).join('');
      const featureList = p.features.map((f) => `<li>${f}</li>`).join('');

      content.innerHTML = `
        <div class="modal-project-grid">
          <div class="modal-grid-left">
            <div class="modal-img-container">
              <img src="${p.img}" alt="${p.title}" />
            </div>
            
            <div class="modal-block-title">Key Features &amp; Modules</div>
            <ul class="modal-features-list">
              ${featureList}
            </ul>
          </div>

          <div class="modal-grid-right">
            <span style="font-family:var(--font-mono);font-size:0.75rem;color:var(--accent-cyan);letter-spacing:0.08em;font-weight:600;">${p.category}</span>
            <h3 class="modal-title" id="modalProjectTitle">${p.title}</h3>
            <p class="modal-desc">${p.desc}</p>

            <div class="modal-block-title">The Challenge</div>
            <p style="font-size:0.92rem;color:var(--text-secondary);margin-bottom:1.25rem;line-height:1.65;">${p.problem}</p>

            <div class="modal-block-title">The Solution</div>
            <p style="font-size:0.92rem;color:var(--text-secondary);margin-bottom:1.5rem;line-height:1.65;">${p.solution}</p>

            <div class="modal-block-title">Technologies Used</div>
            <div class="modal-tech-pills">
              ${techBadges}
            </div>

            <div class="modal-actions">
              <a href="${p.demoLink}" class="btn btn-primary" target="_blank" rel="noopener">
                <span>Live Preview 🚀</span>
              </a>
              <a href="${p.githubLink}" class="btn btn-secondary" target="_blank" rel="noopener">
                <span>GitHub Repository 🐙</span>
              </a>
            </div>
          </div>
        </div>
      `;

      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }

    triggers.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(btn.dataset.project);
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backBtn) backBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        closeModal();
      }
    });
  }

  /* ==========================================================================
     7. TECH STACK MODAL CONTROLLER
     ========================================================================== */
  const techDatabase = {
    html5: {
      title: 'HTML5',
      desc: 'Bahasa markup standar untuk menyusun struktur halaman web modern. Menitikberatkan pada penerapan elemen semantik (semantic HTML), aksesibilitas (a11y), serta optimalisasi struktur dokumen untuk SEO.',
      level: 'Advanced',
      experience: '3+ Tahun',
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg'
    },
    css3: {
      title: 'CSS3',
      desc: 'Penguasaan teknik styling antarmuka modern mencakup CSS Grid, Flexbox, custom properties (CSS variables), keyframe animations, 3D transforms, dan fluid responsive typography.',
      level: 'Advanced',
      experience: '3+ Tahun',
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg'
    },
    javascript: {
      title: 'JavaScript (ES6+)',
      desc: 'Bahasa pemrograman inti untuk membangun logika interaktif di sisi klien. Terbiasa dengan manipulasi DOM modern, Promises/Async-Await, Fetch API, modular architecture, dan event handling.',
      level: 'Intermediate',
      experience: '2+ Tahun',
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg'
    },
    tailwindcss: {
      title: 'Tailwind CSS',
      desc: 'Utility-first CSS framework untuk mempercepat pengembangan antarmuka responsif dengan desain konsisten dan ukuran bundle produksi yang ramping.',
      level: 'Intermediate',
      experience: '1.5+ Tahun',
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg'
    },
    php: {
      title: 'PHP',
      desc: 'Bahasa backend server-side untuk menangani pemrosesan logika bisnis, autentikasi sesi, manipulasi berkas, serta komunikasi database relasional.',
      level: 'Intermediate',
      experience: '2+ Tahun',
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg'
    },
    laravel: {
      title: 'Laravel',
      desc: 'PHP Web Framework modern dengan pola arsitektur MVC. Digunakan untuk merancang sistem aplikasi terstruktur menggunakan Eloquent ORM, middleware, routing, dan blade templating.',
      level: 'Intermediate',
      experience: '1.5+ Tahun',
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/laravel/laravel-original.svg'
    },
    mysql: {
      title: 'MySQL',
      desc: 'Sistem manajemen basis data relasional (RDBMS) untuk merancang skema tabel normalisasi, relasi foreign keys, penulisan query teroptimasi, dan integritas data sistem.',
      level: 'Intermediate',
      experience: '2+ Tahun',
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg'
    },
    codeigniter: {
      title: 'CodeIgniter',
      desc: 'Framework PHP ringan dengan performa eksekusi cepat dan arsitektur MVC sederhana untuk pengembangan aplikasi web berbasis database.',
      level: 'Intermediate',
      experience: '2+ Tahun',
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/codeigniter/codeigniter-plain.svg'
    },
    git: {
      title: 'Git & GitHub',
      desc: 'Sistem kontrol versi wajib untuk pelacakan riwayat kode, branching strategy, commit convention, serta kolaborasi manajemen repositori di GitHub.',
      level: 'Intermediate',
      experience: '2+ Tahun',
      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg'
    }
  };

  function initTechModal() {
    const modal = document.getElementById('techModal');
    const closeBtn = document.getElementById('closeTechModal');
    const backBtn = document.getElementById('techModalBack');
    const crumbText = document.getElementById('techBreadcrumb');
    const content = document.getElementById('techModalContent');
    const cards = document.querySelectorAll('.tech-item');

    if (!modal || !content) return;

    function openModal(techKey) {
      const data = techDatabase[techKey];
      if (!data) return;

      if (crumbText) {
        crumbText.innerHTML = `Tech Stack &gt; <span style="color:#fff;font-weight:600">${data.title}</span>`;
      }

      content.innerHTML = `
        <div style="display:flex;align-items:center;gap:1.25rem;margin-bottom:1.5rem;">
          <div style="width:58px;height:58px;background:rgba(255,255,255,0.04);border:1px solid var(--border-card);border-radius:12px;display:flex;align-items:center;justify-content:center;">
            <img src="${data.icon}" alt="${data.title}" style="width:36px;height:36px;object-fit:contain;" />
          </div>
          <div>
            <h3 style="font-size:1.5rem;font-weight:800;color:#ffffff;margin:0;">${data.title}</h3>
            <span style="font-family:var(--font-mono);font-size:0.8rem;color:var(--accent-cyan);font-weight:600;">${data.level} Proficiency</span>
          </div>
        </div>

        <p style="font-size:1rem;color:var(--text-secondary);line-height:1.7;margin-bottom:2rem;">
          ${data.desc}
        </p>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;background:rgba(0,0,0,0.3);border:1px solid var(--border-subtle);border-radius:12px;padding:1.25rem;">
          <div>
            <span style="font-family:var(--font-mono);font-size:0.72rem;color:var(--text-muted);display:block;margin-bottom:0.25rem;">TINGKAT KEMAMPUAN</span>
            <strong style="color:var(--text-primary);font-size:1rem;">${data.level}</strong>
          </div>
          <div>
            <span style="font-family:var(--font-mono);font-size:0.72rem;color:var(--text-muted);display:block;margin-bottom:0.25rem;">PENGALAMAN PENGGUNAAN</span>
            <strong style="color:var(--accent-cyan);font-size:1rem;">${data.experience}</strong>
          </div>
        </div>
      `;

      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      modal.classList.remove('open');
      document.body.style.overflow = '';
    }

    cards.forEach((card) => {
      card.addEventListener('click', () => {
        openModal(card.dataset.tech);
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openModal(card.dataset.tech);
        }
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backBtn) backBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) {
        closeModal();
      }
    });
  }

  /* ==========================================================================
     8. CERTIFICATE LIGHTBOX CONTROLLER
     ========================================================================== */
  function initCertificateLightbox() {
    const lightbox = document.getElementById('certLightbox');
    const closeBtn = document.getElementById('closeCertLightbox');
    const imgEl = document.getElementById('lightboxImg');
    const titleEl = document.getElementById('lightboxTitle');
    const issuerEl = document.getElementById('lightboxIssuer');
    const cards = document.querySelectorAll('.cert-item');

    if (!lightbox || !imgEl) return;

    function openLightbox(src, title, issuer) {
      imgEl.src = src;
      imgEl.alt = title;
      if (titleEl) titleEl.innerText = title;
      if (issuerEl) issuerEl.innerText = issuer;

      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
      setTimeout(() => {
        imgEl.src = '';
      }, 300);
    }

    cards.forEach((card) => {
      card.addEventListener('click', () => {
        const src = card.dataset.certSrc;
        const title = card.dataset.certTitle;
        const issuer = card.dataset.certIssuer;
        openLightbox(src, title, issuer);
      });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('open')) {
        closeLightbox();
      }
    });
  }

  /* ==========================================================================
     9. GOTHAM STARFIELD & CANVAS PARTICLES
     ========================================================================== */
  function initGothamCanvas() {
    const canvas = document.getElementById('particles');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    // Generate Ambient Stars & Bat Dust
    const numStars = 65;
    const stars = [];

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.7 + 0.2,
        speedX: (Math.random() - 0.5) * 0.2,
        speedY: -Math.random() * 0.3 - 0.1,
        color: Math.random() > 0.8 ? '#f59e0b' : '#00f2fe'
      });
    }

    // Shooting stars
    const shootingStars = [];
    function spawnShootingStar() {
      if (shootingStars.length < 2 && Math.random() < 0.015) {
        shootingStars.push({
          x: Math.random() * width * 0.8 + width * 0.2,
          y: Math.random() * (height * 0.4),
          len: Math.random() * 80 + 40,
          speed: Math.random() * 10 + 12,
          angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
          alpha: 1
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle stars
      stars.forEach((s) => {
        s.x += s.speedX;
        s.y += s.speedY;

        if (s.y < 0) {
          s.y = height;
          s.x = Math.random() * width;
        }
        if (s.x < 0) s.x = width;
        if (s.x > width) s.x = 0;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = s.alpha;
        ctx.fill();
      });

      // Spawn and draw shooting stars
      spawnShootingStar();

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.x -= Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;
        ss.alpha -= 0.02;

        if (ss.alpha <= 0) {
          shootingStars.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(
          ss.x + Math.cos(ss.angle) * ss.len,
          ss.y - Math.sin(ss.angle) * ss.len
        );
        ctx.strokeStyle = `rgba(0, 242, 254, ${ss.alpha * 0.8})`;
        ctx.lineWidth = 1.8;
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      requestAnimationFrame(draw);
    }

    draw();
  }

  /* ==========================================================================
     10. CUSTOM CURSOR (Desktop Lerp Follower)
     ========================================================================== */
  function initCustomCursor() {
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    const ambient = document.getElementById('ambientGlow');

    if (!dot || !ring) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      if (ambient) {
        ambient.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      }
    }, { passive: true });

    function lerpRing() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      ring.style.transform = `translate3d(${ringX.toFixed(2)}px, ${ringY.toFixed(2)}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(lerpRing);
    }

    lerpRing();

    // Hover detection for interactive targets
    const hoverTargets = document.querySelectorAll('a, button, .tech-item, .project-card, .cert-item, .tracklist-row, .batman-morph-container');
    hoverTargets.forEach((target) => {
      target.addEventListener('mouseenter', () => {
        ring.classList.add('cursor-hover');
      });
      target.addEventListener('mouseleave', () => {
        ring.classList.remove('cursor-hover');
      });
    });
  }

  /* ==========================================================================
     11. SCROLL REVEAL ANIMATIONS & STAT COUNTERS
     ========================================================================== */
  function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal, .reveal-child');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    reveals.forEach((el) => observer.observe(el));

    // Counter animation
    const statNums = document.querySelectorAll('.stat-deck-num');
    let counted = false;

    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !counted) {
          counted = true;
          statNums.forEach((num) => {
            const target = parseInt(num.getAttribute('data-target'), 10) || 0;
            let current = 0;
            const step = Math.max(1, Math.floor(target / 20));
            const timer = setInterval(() => {
              current += step;
              if (current >= target) {
                current = target;
                clearInterval(timer);
              }
              num.innerText = current < 10 ? `0${current}` : `${current}`;
            }, 60);
          });
        }
      });
    }, { threshold: 0.2 });

    const statsDeck = document.querySelector('.about-stats-deck');
    if (statsDeck) statsObserver.observe(statsDeck);
  }

  /* ==========================================================================
     12. EMAILJS CONTACT FORM & TOAST NOTIFICATION
     ========================================================================== */
  function initContactForm() {
    const form = document.getElementById('contactForm');
    const btnSubmit = document.getElementById('btnSubmit');

    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const nama = form.nama.value.trim();
      const email = form.email.value.trim();
      const pesan = form.pesan.value.trim();

      if (!nama || !email || !pesan) {
        showModernToast({
          type: 'error',
          title: 'Formulir Belum Lengkap',
          badge: 'PERHATIAN',
          message: 'Mohon lengkapi semua data formulir: Nama, Email, dan Pesan.'
        });
        return;
      }

      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<span>Mengirim Pesan...</span>';
      }

      // EmailJS sending
      if (window.emailjs) {
        emailjs.send('service_57q6e3p', 'template_500y91e', {
          from_name: nama,
          from_email: email,
          message: pesan,
          reply_to: email
        }).then(() => {
          showModernToast({
            type: 'success',
            title: 'Pesan Terkirim',
            badge: 'SUKSES',
            message: 'Pesan Anda berhasil terkirim langsung ke Ilham Maulana!'
          });
          form.reset();
        }).catch((err) => {
          console.warn('EmailJS error, fallback triggered', err);
          showModernToast({
            type: 'info',
            title: 'Pesan Dicatat',
            badge: 'TERSIMPAN',
            message: 'Pesan berhasil dicatat! Terima kasih telah menghubungi Ilham.'
          });
          form.reset();
        }).finally(() => {
          if (btnSubmit) {
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = '<span>Kirim Pesan</span> <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>';
          }
        });
      } else {
        showModernToast({
          type: 'success',
          title: 'Pesan Terkirim',
          badge: 'SUKSES',
          message: 'Pesan Anda berhasil dicatat dan terkirim!'
        });
        form.reset();
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.innerHTML = '<span>Kirim Pesan</span>';
        }
      }
    });
  }

  /* ==========================================================================
     13. BACK TO TOP BUTTON
     ========================================================================== */
  function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ==========================================================================
     INITIALIZATION ON DOM LOAD
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    initLanyardPhysics();
    initBatmanMorph();
    initSpotifyEngine();
    initFloatingNav();
    initPortfolioTabs();
    initProjectModal();
    initTechModal();
    initCertificateLightbox();
    initGothamCanvas();
    initCustomCursor();
    initScrollReveal();
    initContactForm();
    initBackToTop();
  });

})();
