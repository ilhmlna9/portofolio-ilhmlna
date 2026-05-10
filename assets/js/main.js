/* ── Particle Background ── */
(function initParticles() {
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < 80; i++) {
    particles.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      o: Math.random() * 0.5 + 0.1
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,255,178,${p.o})`;
      ctx.fill();
      p.x += p.dx; p.y += p.dy;
      if (p.x < 0 || p.x > W) p.dx *= -1;
      if (p.y < 0 || p.y > H) p.dy *= -1;
    });

    // connect nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0,255,178,${0.08 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

/* ── Typewriter ── */
(function initTypewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;
  const words = ['Ilham Maulana', 'Mahasiswa Aktif', 'Web Developer', 'Problem Solver'];
  let wi = 0, ci = 0, deleting = false;

  function type() {
    const word = words[wi];
    if (!deleting) {
      el.textContent = word.slice(0, ++ci);
      if (ci === word.length) { deleting = true; setTimeout(type, 1800); return; }
    } else {
      el.textContent = word.slice(0, --ci);
      if (ci === 0) { deleting = false; wi = (wi + 1) % words.length; }
    }
    setTimeout(type, deleting ? 60 : 110);
  }
  type();
})();

/* ── Navbar ── */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const drawer = document.getElementById('navDrawer');
  const overlay = document.getElementById('drawerOverlay');
  const drawerLinks = document.querySelectorAll('.nav-drawer a');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    document.querySelector('.back-to-top').classList.toggle('visible', window.scrollY > 300);
  });

  function toggleDrawer(open) {
    drawer.classList.toggle('open', open);
    overlay.classList.toggle('open', open);
  }

  hamburger.addEventListener('click', () => toggleDrawer(!drawer.classList.contains('open')));
  overlay.addEventListener('click', () => toggleDrawer(false));
  drawerLinks.forEach(link => link.addEventListener('click', () => toggleDrawer(false)));

  // Scroll spy
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a, .nav-drawer a');

  function updateActive() {
    let current = '';
    sections.forEach(sec => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    navAnchors.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }
  window.addEventListener('scroll', updateActive);
  updateActive();
})();

/* ── Scroll Reveal ── */
(function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        // Animate progress bars if in skills section
        const bars = e.target.querySelectorAll('.progress-bar');
        bars.forEach(bar => { bar.style.width = bar.dataset.pct + '%'; });
        // Animate count-up
        const pcts = e.target.querySelectorAll('.skill-pct');
        pcts.forEach(pct => {
          const target = parseInt(pct.dataset.target);
          let count = 0;
          const interval = setInterval(() => {
            count += 2;
            pct.textContent = Math.min(count, target) + '%';
            if (count >= target) clearInterval(interval);
          }, 20);
        });
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal, .timeline-item, .project-card, .skill-item').forEach(el => {
    observer.observe(el);
  });
})();

/* ── Modals (Projects & Tech) ── */
(function initModals() {
  const modal = document.getElementById('projectModal');
  const closeBtn = document.getElementById('closeModal');
  const modalBack = document.getElementById('modalBack');
  const modalBody = document.getElementById('modalBody');
  const breadcrumbText = document.getElementById('modalBreadcrumbText');
  const detailBtns = document.querySelectorAll('.btn-detail');
  const techCards = document.querySelectorAll('.tech-card');

  if (!modal) return;

  const projectData = {
    presensiku: {
      title: 'Sistem Presensi (Presensiku)',
      desc: 'Sistem absensi pegawai berbasis web yang dikembangkan menggunakan CodeIgniter 3. Dilengkapi dengan fitur manajemen jadwal, pelaporan absensi, dan dashboard admin yang komprehensif.',
      learnings: '5', features: '8',
      tech: ['CodeIgniter 3', 'PHP', 'MySQL', 'Bootstrap', 'jQuery'],
      img: 'assets/img/project-presensi.png',
      featuresList: ['Real-time attendance tracking', 'Role-based access control', 'Automated report generation', 'Geolocation support']
    },
    monitexa: {
      title: 'Monitexa — Manajemen Konstruksi',
      desc: 'Sistem manajemen proyek konstruksi berbasis web yang kompleks. Menyediakan manajemen multi-role (Admin, Manager, Teknisi, Client) untuk melacak progress proyek secara real-time.',
      learnings: '8', features: '12',
      tech: ['Laravel', 'PHP', 'MySQL', 'Tailwind CSS', 'Livewire'],
      img: 'assets/img/project-monitexa.png',
      featuresList: ['Real-time progress tracking', 'Multi-level user roles', 'Task & material management', 'Client portal']
    },
    portfolio: {
      title: 'Website Portofolio',
      desc: 'Website portofolio personal yang dirancang dengan estetika modern dark theme. Memanfaatkan glassmorphism, micro-animations, dan particle.js untuk pengalaman visual yang memukau.',
      learnings: '3', features: '5',
      tech: ['HTML5', 'CSS3', 'JavaScript', 'Particle.js'],
      img: 'assets/img/project-portfolio.png',
      featuresList: ['Interactive particle background', 'Custom dark theme UI', 'Fully responsive layout', 'CSS Grid & Flexbox mastery']
    },
    design: {
      title: 'UI/UX Design System',
      desc: 'Kumpulan pedoman desain dan komponen antarmuka (UI kit) yang dibuat di Figma. Sistem ini memastikan konsistensi visual di berbagai aplikasi dan platform.',
      learnings: '4', features: '6',
      tech: ['Figma', 'Prototyping', 'Wireframing', 'Design Systems'],
      img: 'assets/img/project-design.png',
      featuresList: ['Comprehensive style guide', 'Reusable component library', 'Dark & Light mode ready', 'Interactive prototypes']
    }
  };

  const techData = {
    html5: {
      title: 'HTML5',
      desc: 'HTML5 adalah bahasa markup standar untuk membuat struktur halaman web. Saya menggunakan HTML5 untuk membangun fondasi website yang semantik, mudah diakses, dan ramah mesin pencari (SEO-friendly).',
      level: 'Advanced', experience: '3+ Tahun',
      img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg'
    },
    css3: {
      title: 'CSS3',
      desc: 'CSS3 digunakan untuk mendesain dan memperindah tampilan website. Saya menguasai berbagai fitur CSS3 modern seperti Flexbox, CSS Grid, serta animasi dan transisi tingkat lanjut.',
      level: 'Advanced', experience: '3+ Tahun',
      img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg'
    },
    javascript: {
      title: 'JavaScript',
      desc: 'JavaScript adalah bahasa pemrograman utama untuk membuat website interaktif. Saya terbiasa menggunakan ES6+, manipulasi DOM, AJAX/Fetch, serta pengelolaan state dinamis pada web.',
      level: 'Intermediate', experience: '2+ Tahun',
      img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg'
    },
    tailwindcss: {
      title: 'Tailwind CSS',
      desc: 'Tailwind CSS adalah utility-first framework. Saya menggunakannya untuk mempercepat proses styling dan membangun antarmuka yang sangat responsif dengan cepat.',
      level: 'Intermediate', experience: '1.5 Tahun',
      img: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg'
    },
    php: {
      title: 'PHP',
      desc: 'PHP adalah bahasa scripting server-side andalan untuk backend. Saya menggunakannya untuk memproses form, manajemen sesi, dan komunikasi dengan database MySQL.',
      level: 'Intermediate', experience: '2 Tahun',
      img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/php/php-original.svg'
    },
    laravel: {
      title: 'Laravel',
      desc: 'Laravel adalah framework PHP yang paling elegan. Saya menggunakan Laravel untuk membangun aplikasi web skala besar dengan memanfaatkan MVC, Eloquent ORM, dan sistem routing yang andal.',
      level: 'Intermediate', experience: '1 Tahun',
      img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/laravel/laravel-original.svg'
    },
    mysql: {
      title: 'MySQL',
      desc: 'MySQL adalah sistem manajemen database andalan saya. Saya memiliki keahlian dalam merancang relasi tabel, menulis query kompleks, dan optimasi database.',
      level: 'Intermediate', experience: '2+ Tahun',
      img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg'
    },
    codeigniter: {
      title: 'CodeIgniter',
      desc: 'CodeIgniter adalah framework PHP ringan yang sangat cepat. Saya menggunakan CI untuk proyek yang butuh kecepatan eksekusi tinggi dengan struktur MVC yang sederhana.',
      level: 'Intermediate', experience: '2 Tahun',
      img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/codeigniter/codeigniter-plain.svg'
    },
    git: {
      title: 'Git & GitHub',
      desc: 'Git adalah sistem kontrol versi wajib bagi developer. Saya menggunakannya untuk melacak perubahan kode, branching, serta kolaborasi melalui platform GitHub.',
      level: 'Intermediate', experience: '2 Tahun',
      img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg'
    },
    figma: {
      title: 'Figma',
      desc: 'Figma adalah tool desain UI/UX berbasis cloud. Saya menggunakannya untuk membuat wireframe, merancang sistem desain (Design System), dan memvisualisasikan ide sebelum proses koding.',
      level: 'Intermediate', experience: '1.5 Tahun',
      img: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg'
    }
  };

  function openProjectModal(id) {
    const data = projectData[id];
    if (!data) return;

    if (breadcrumbText) breadcrumbText.innerHTML = `Projects &nbsp;&gt;&nbsp; <span style="color:#fff;font-weight:600">${data.title}</span>`;

    let techHtml = data.tech.map(t => `<span class="tech-pill">${t}</span>`).join('');
    let featuresHtml = data.featuresList.map(f => `<li>${f}</li>`).join('');

    modalBody.innerHTML = `
      <div class="detail-grid">
        <div class="detail-left">
          <h2>${data.title}</h2>
          <p>${data.desc}</p>
          <div class="detail-stats">
            <div class="stat-box">
              <h4>${data.learnings}</h4>
              <span>Total learnings</span>
            </div>
            <div class="stat-box">
              <h4>${data.features}</h4>
              <span>Total features</span>
            </div>
          </div>
          <div class="detail-actions">
            <a href="#" class="btn-demo-modal">Live Demo 🚀</a>
            <a href="#" class="btn-github-modal">GitHub 🐙</a>
          </div>
          <div class="tech-used-title">Technologies Used</div>
          <div class="tech-used-list">
            ${techHtml}
          </div>
        </div>
        <div class="detail-right">
          <img src="${data.img}" alt="${data.title}" onerror="this.src='https://via.placeholder.com/600x400/0f1f35/00FFB2?text=Project+Image'">
          <div class="tech-used-title" style="margin-top: 2rem;">Key Features</div>
          <ul class="feature-list">
            ${featuresHtml}
          </ul>
        </div>
      </div>
    `;

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function openTechModal(id) {
    const data = techData[id];
    if (!data) return;

    if (breadcrumbText) breadcrumbText.innerHTML = `Tech Stack &nbsp;&gt;&nbsp; <span style="color:#fff;font-weight:600">${data.title}</span>`;

    modalBody.innerHTML = `
      <div class="detail-grid" style="align-items: center;">
        <div class="detail-left">
          <div style="display:flex; align-items:center; gap: 1rem; margin-bottom: 1.5rem;">
            <img src="${data.img}" alt="${data.title}" style="width:64px; height:64px; object-fit:contain;">
            <h2 style="margin:0;">${data.title}</h2>
          </div>
          <p style="font-size: 1.1rem;">${data.desc}</p>
          <div class="detail-stats" style="margin-top: 2.5rem;">
            <div class="stat-box">
              <h4 style="font-size: 1.3rem;">${data.level}</h4>
              <span>Tingkat Kemampuan</span>
            </div>
            <div class="stat-box">
              <h4 style="font-size: 1.3rem;">${data.experience}</h4>
              <span>Pengalaman</span>
            </div>
          </div>
        </div>
        <div class="detail-right" style="display:flex; align-items:center; justify-content:center; background: var(--card); border: 1px solid var(--card-border); border-radius: 20px; padding: 4rem; aspect-ratio: 1/1;">
          <img src="${data.img}" alt="${data.title}" style="width:100%; max-width: 220px; border:none; margin:0; filter: drop-shadow(0 15px 30px rgba(0,0,0,0.5));">
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

  detailBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openProjectModal(btn.dataset.id);
    });
  });

  techCards.forEach(card => {
    card.addEventListener('click', () => {
      openTechModal(card.dataset.tech);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (modalBack) modalBack.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
})();

/* ── Projects Filter ── */
(function initProjectFilter() {
  const tabs = document.querySelectorAll('.proj-tab');
  const cards = document.querySelectorAll('.project-card');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.dataset.filter;
      cards.forEach(card => {
        const show = filter === 'all' || card.dataset.cat === filter;
        card.style.display = show ? 'block' : 'none';
      });
    });
  });
})();

/* ── Contact Form ── */
(function initContact() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  function showToast(msg, type) {
    const container = document.querySelector('.toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.innerHTML = (type === 'success' ? '✅ ' : '❌ ') + msg;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  function validate(input) {
    const hint = input.parentElement.querySelector('.form-hint');
    let valid = true;
    if (!input.value.trim()) { valid = false; if (hint) hint.textContent = 'Field ini wajib diisi'; }
    else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
      valid = false; if (hint) hint.textContent = 'Format email tidak valid';
    } else { if (hint) hint.textContent = ''; }
    input.classList.toggle('error', !valid);
    return valid;
  }

  form.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('blur', () => validate(el));
    el.addEventListener('input', () => { el.classList.remove('error'); const h = el.parentElement.querySelector('.form-hint'); if (h) h.textContent = ''; });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputs = form.querySelectorAll('input, textarea');
    let ok = true;
    inputs.forEach(el => { if (!validate(el)) ok = false; });

    if (ok) {
      const btnSend = form.querySelector('.btn-send-modern');
      const originalText = btnSend.innerHTML;
      btnSend.innerHTML = 'Sending...';
      btnSend.disabled = true;

      // Parameter sesuai dengan id input di form (nama, email, pesan)
      const templateParams = {
        from_name: document.getElementById('nama').value,
        reply_to: document.getElementById('email').value,
        message: document.getElementById('pesan').value
      };

      // Menggunakan Service ID dan Template ID dari Anda
      emailjs.send('service_appqlyj', 'template_dtwuhiu', templateParams)
        .then(function (response) {
          showToast('Pesan berhasil dikirim! Terima kasih 🎉', 'success');
          form.reset();
          btnSend.innerHTML = originalText;
          btnSend.disabled = false;
        }, function (error) {
          showToast('Gagal mengirim pesan. Cek konsol log.', 'error');
          console.error('EmailJS Error:', error);
          btnSend.innerHTML = originalText;
          btnSend.disabled = false;
        });
    } else {
      showToast('Harap isi semua field dengan benar.', 'error');
    }
  });
})();

/* ── Back to top ── */
document.querySelector('.back-to-top').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
