/**
 * ILHAM MAULANA — PERSONAL PORTFOLIO
 * Core Interactions, 3D Hanging Lanyard Physics, Canvas Ambient, and Modals
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

        const targetRigRotZ = (mouseNormX * 10) + idleSwayZ;
        const targetRigTransX = (mouseNormX * 14) + idleSwayX;
        const targetRigTransY = Math.abs(mouseNormX) * -3; // Pendulum arc lifts slightly

        rigRotZ += (targetRigRotZ - rigRotZ) * 0.06;
        rigTransX += (targetRigTransX - rigTransX) * 0.06;
        rigTransY += (targetRigTransY - rigTransY) * 0.06;
      }

      // Secondary Card 3D Tilt (Pivoting around the clip hole)
      cardTiltX += (targetCardTiltX - cardTiltX) * 0.08;
      cardTiltY += (targetCardTiltY - cardTiltY) * 0.08;

      // Parallax scroll shift
      const scrollOffset = window.scrollY * 0.08;

      // 1. Transform the entire assembly: Strap, Hook, and Card all swing together!
      rig.style.transform = `
        translate3d(${rigTransX.toFixed(2)}px, ${(rigTransY + scrollOffset).toFixed(2)}px, 0)
        rotateZ(${rigRotZ.toFixed(2)}deg)
      `;

      // 2. Transform the card in 3D around its top clip hole (Never separates from the hook!)
      const liftZ = isHoveringCard ? 30 : 0;
      card.style.transform = `
        translate3d(0, 0, ${liftZ}px)
        rotateX(${cardTiltX.toFixed(2)}deg)
        rotateY(${cardTiltY.toFixed(2)}deg)
      `;

      requestAnimationFrame(renderLanyard);
    }

    requestAnimationFrame(renderLanyard);
  }

  /* ==========================================================================
     2. AMBIENT PARTICLES CANVAS
     ========================================================================== */
  function initAmbientParticles() {
    const canvas = document.getElementById('particles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H;
    let particles = [];
    const count = window.innerWidth < 768 ? 35 : 70;

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.4 + 0.4,
        dx: (Math.random() - 0.5) * 0.35,
        dy: (Math.random() - 0.5) * 0.35,
        o: Math.random() * 0.45 + 0.1
      });
    }

    function render() {
      ctx.clearRect(0, 0, W, H);

      // Draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 242, 254, ${p.o})`;
        ctx.fill();

        p.x += p.dx;
        p.y += p.dy;

        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
      }

      // Connecting thin lines between nearby particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 85) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 242, 254, ${0.06 * (1 - dist / 85)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
  }

  /* ==========================================================================
     3. CUSTOM CURSOR & AMBIENT GLOW (DESKTOP)
     ========================================================================== */
  function initCustomCursor() {
    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');
    const glow = document.getElementById('ambientGlow');

    if (!dot || !ring) return;

    // Check if pointer device supports hover
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let glowX = -100;
    let glowY = -100;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    }, { passive: true });

    function renderCursor() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.transform = `translate(${ringX}px, ${ringY}px)`;

      if (glow) {
        glowX += (mouseX - glowX) * 0.08;
        glowY += (mouseY - glowY) * 0.08;
        glow.style.transform = `translate(${glowX}px, ${glowY}px)`;
      }

      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    // Hover interactive state
    const interactables = document.querySelectorAll(
      'a, button, .btn, .tech-item, .cert-card-item, .project-showcase-card, .id-card-frame, .filter-btn, input, textarea'
    );

    interactables.forEach((el) => {
      el.addEventListener('mouseenter', () => ring.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('cursor-hover'));
    });
  }

  /* ==========================================================================
     4. NAVBAR, SCROLLSPY & MOBILE DRAWER
     ========================================================================== */
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const drawer = document.getElementById('navDrawer');
    const overlay = document.getElementById('drawerOverlay');
    const drawerClose = document.getElementById('drawerClose');
    const navLinks = document.querySelectorAll('.nav-links .nav-link');
    const drawerLinks = document.querySelectorAll('.drawer-link');
    const backToTop = document.getElementById('backToTop');
    const sections = document.querySelectorAll('section[id]');

    function onScroll() {
      const scrollY = window.scrollY;

      // Scrolled navbar state
      if (navbar) {
        navbar.classList.toggle('scrolled', scrollY > 40);
      }

      // Back to top button
      if (backToTop) {
        backToTop.classList.toggle('visible', scrollY > 350);
      }

      // ScrollSpy
      let currentSection = '';
      sections.forEach((sec) => {
        const top = sec.offsetTop - 150;
        const height = sec.offsetHeight;
        if (scrollY >= top && scrollY < top + height) {
          currentSection = sec.getAttribute('id');
        }
      });

      if (currentSection) {
        navLinks.forEach((a) => {
          a.classList.toggle('active', a.getAttribute('href') === `#${currentSection}`);
        });
        drawerLinks.forEach((a) => {
          a.classList.toggle('active', a.getAttribute('href') === `#${currentSection}`);
        });
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Drawer Toggles
    function openDrawer() {
      drawer.classList.add('open');
      overlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
      drawer.classList.remove('open');
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    }

    if (hamburger) hamburger.addEventListener('click', openDrawer);
    if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
    if (overlay) overlay.addEventListener('click', closeDrawer);

    drawerLinks.forEach((link) => {
      link.addEventListener('click', closeDrawer);
    });

    if (backToTop) {
      backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  /* ==========================================================================
     5. SCROLL REVEAL & STATS COUNTER ANIMATION
     ========================================================================== */
  function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal, .reveal-child');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');

          // Trigger number counter if contains stat-number
          const counters = entry.target.querySelectorAll('.stat-number');
          counters.forEach((numEl) => {
            if (numEl.dataset.animated) return;
            numEl.dataset.animated = 'true';
            const target = parseInt(numEl.dataset.target, 10);
            if (isNaN(target)) return;

            let count = 0;
            const duration = 1200;
            const stepTime = Math.max(20, Math.floor(duration / target));

            const timer = setInterval(() => {
              count += 1;
              numEl.textContent = count < 10 ? `0${count}` : `${count}`;
              if (count >= target) {
                clearInterval(timer);
                numEl.textContent = numEl.dataset.target.includes('+')
                  ? `${numEl.dataset.target}`
                  : (target < 10 ? `0${target}` : `${target}`);
              }
            }, stepTime);
          });
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    reveals.forEach((el) => observer.observe(el));
  }

  /* ==========================================================================
     6. PROJECT SHOWCASE FILTERING (MOBILE PROJECT EXCLUDED)
     ========================================================================== */
  function initProjectFilters() {
    const filterBtns = document.querySelectorAll('.project-filters .filter-btn');
    const projectCards = document.querySelectorAll('.project-showcase-card');

    filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;

        projectCards.forEach((card) => {
          const category = card.dataset.category;
          if (filter === 'all' || category === filter) {
            card.style.display = '';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            }, 50);
          } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(15px)';
            setTimeout(() => {
              card.style.display = 'none';
            }, 250);
          }
        });
      });
    });
  }

  /* ==========================================================================
     7. PROJECT DETAIL MODAL DATA & CONTROLLER
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
      title: 'Website Portofolio Personal',
      category: 'Interactive Web & UI Engineering',
      img: 'assets/img/project-portfolio.svg',
      desc: 'Website portofolio personal developer modern yang dirancang khusus dengan estetika dark-theme editorial, elemen 3D interactive physics lanyard, micro-interactions halus, dan performa tinggi.',
      problem: 'Banyak website portofolio developer yang menggunakan template generik AI instan dengan animasi berlebih tanpa sentuhan personal dan karakteristik identitas yang kuat.',
      solution: 'Mengembangkan personal portfolio custom dari nol dengan sistem desain dark navy & electric cyan, simulasi fisika 3D untuk ID card lanyard foto personal, dan kode semantik yang bersih tanpa dependensi berlebih.',
      tech: ['HTML5 Semantic', 'CSS3 Custom Tokens', 'Modern JavaScript (ES6+)', 'Canvas API', 'EmailJS'],
      features: [
        '3D Interactive Hanging Lanyard dengan physics tilt & idle sway',
        'Particle canvas background & dynamic cursor tracking',
        'Layout editorial asimetris untuk showcase proyek terpilih',
        'Formulir kontak terintegrasi langsung ke inbox via EmailJS',
        'Performa 60fps, responsif penuh, dan ramah aksesibilitas'
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
     8. TECH STACK MODAL CONTROLLER
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
     9. CERTIFICATE LIGHTBOX MODAL
     ========================================================================== */
  function initCertificateLightbox() {
    const lightbox = document.getElementById('certLightbox');
    const closeBtn = document.getElementById('closeCertLightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const titleEl = document.getElementById('lightboxTitle');
    const issuerEl = document.getElementById('lightboxIssuer');
    const certCards = document.querySelectorAll('.cert-card-item');

    if (!lightbox || !lightboxImg) return;

    function openLightbox(src, title, issuer) {
      lightboxImg.src = src;
      lightboxImg.alt = title;
      if (titleEl) titleEl.textContent = title;
      if (issuerEl) issuerEl.textContent = issuer;

      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
      setTimeout(() => {
        lightboxImg.src = '';
      }, 300);
    }

    certCards.forEach((card) => {
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
     10. TOAST NOTIFICATIONS HELPER
     ========================================================================== */
  function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span>${type === 'success' ? '✅' : '❌'}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-30px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  /* ==========================================================================
     11. CONTACT FORM & EMAILJS INTEGRATION
     ========================================================================== */
  function initContactForm() {
    const form = document.getElementById('contactForm');
    const btnSubmit = document.getElementById('btnSubmit');

    if (!form || !btnSubmit) return;

    function validateField(input) {
      const hint = input.closest('.form-group').querySelector('.form-hint');
      let isValid = true;
      let msg = '';

      if (!input.value.trim()) {
        isValid = false;
        msg = 'Kolom ini wajib diisi.';
      } else if (input.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input.value.trim())) {
          isValid = false;
          msg = 'Format alamat email tidak valid.';
        }
      }

      input.classList.toggle('error', !isValid);
      if (hint) hint.textContent = msg;
      return isValid;
    }

    form.querySelectorAll('.form-input, .form-textarea').forEach((input) => {
      input.addEventListener('blur', () => validateField(input));
      input.addEventListener('input', () => {
        if (input.classList.contains('error')) {
          validateField(input);
        }
      });
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('nama');
      const emailInput = document.getElementById('email');
      const messageInput = document.getElementById('pesan');

      const isNameValid = validateField(nameInput);
      const isEmailValid = validateField(emailInput);
      const isMessageValid = validateField(messageInput);

      if (!isNameValid || !isEmailValid || !isMessageValid) {
        showToast('Harap periksa dan lengkapi kolom formulir dengan benar.', 'error');
        return;
      }

      const originalText = btnSubmit.innerHTML;
      btnSubmit.innerHTML = '<span>Mengirim Pesan...</span>';
      btnSubmit.disabled = true;

      const templateParams = {
        from_name: nameInput.value.trim(),
        reply_to: emailInput.value.trim(),
        message: messageInput.value.trim()
      };

      // EmailJS configuration preserved
      if (typeof emailjs !== 'undefined') {
        emailjs.send('service_appqlyj', 'template_dtwuhiu', templateParams)
          .then(() => {
            showToast('Pesan berhasil terkirim! Terima kasih telah menghubungi saya 🎉', 'success');
            form.reset();
            btnSubmit.innerHTML = originalText;
            btnSubmit.disabled = false;
          })
          .catch((err) => {
            console.error('EmailJS Error:', err);
            showToast('Gagal mengirim pesan melalui server email. Silakan coba lagi atau kirim via email langsung.', 'error');
            btnSubmit.innerHTML = originalText;
            btnSubmit.disabled = false;
          });
      } else {
        showToast('Layanan pengiriman email sedang tidak tersedia.', 'error');
        btnSubmit.innerHTML = originalText;
        btnSubmit.disabled = false;
      }
    });
  }

  /* ==========================================================================
     INITIALIZATION ON DOM CONTENT LOADED
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    initLanyardPhysics();
    initAmbientParticles();
    initCustomCursor();
    initNavbar();
    initScrollReveal();
    initProjectFilters();
    initProjectModal();
    initTechModal();
    initCertificateLightbox();
    initContactForm();
  });
})();
