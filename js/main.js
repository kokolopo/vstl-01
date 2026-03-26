/* ============================================
   VINTAGE WEDDING INVITATION - MAIN SCRIPT
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // ---- DOM Elements ----
  const cover = document.getElementById('cover');
  const btnOpen = document.getElementById('btn-open');
  const mainWrapper = document.getElementById('main-wrapper');
  const bgMusic = document.getElementById('bg-music');
  const musicToggle = document.getElementById('music-toggle');
  const bottomNav = document.getElementById('bottom-nav');
  const navItems = document.querySelectorAll('.nav-item');
  const btnGiftModal = document.getElementById('btn-gift-modal');
  const giftCards = document.getElementById('gift-cards');
  const btnCopies = document.querySelectorAll('.btn-copy');
  const rsvpForm = document.getElementById('rsvp-form');
  const rsvpComments = document.getElementById('rsvp-comments');

  // ---- State ----
  let isPlaying = false;
  let comments = JSON.parse(localStorage.getItem('wedding-comments') || '[]');

  // ---- Initialize ----
  init();

  function init() {
    renderComments();
    startCountdown();
  }

  // ============================================
  // COVER - BUKA UNDANGAN
  // ============================================
  btnOpen.addEventListener('click', () => {
    // Fade out cover
    cover.classList.add('fade-out');
    
    setTimeout(() => {
      cover.style.display = 'none';
      
      // Show main content
      mainWrapper.classList.remove('hidden');
      
      // Enable scrolling
      document.documentElement.classList.add('scrollable');
      
      // Show floating elements
      musicToggle.classList.remove('hidden');
      bottomNav.classList.remove('hidden');
      
      // Play music
      playMusic();
      
      // Initialize AOS
      AOS.init({
        duration: 800,
        easing: 'ease-out-cubic',
        once: true,
        offset: 50,
      });
      
      // Start observing sections for nav highlighting
      observeSections();
      
    }, 800);
  });

  // ============================================
  // MUSIC PLAYER
  // ============================================
  function playMusic() {
    bgMusic.play().then(() => {
      isPlaying = true;
      musicToggle.classList.add('playing');
    }).catch(() => {
      // Autoplay blocked by browser
      isPlaying = false;
      musicToggle.classList.remove('playing');
    });
  }

  musicToggle.addEventListener('click', () => {
    if (isPlaying) {
      bgMusic.pause();
      isPlaying = false;
      musicToggle.classList.remove('playing');
    } else {
      bgMusic.play();
      isPlaying = true;
      musicToggle.classList.add('playing');
    }
  });

  // ============================================
  // COUNTDOWN TIMER
  // ============================================
  function startCountdown() {
    const weddingDate = new Date('2025-12-30T10:00:00+07:00').getTime();
    
    function updateCountdown() {
      const now = new Date().getTime();
      const diff = weddingDate - now;
      
      if (diff <= 0) {
        document.getElementById('cd-days').textContent = '00';
        document.getElementById('cd-hours').textContent = '00';
        document.getElementById('cd-minutes').textContent = '00';
        document.getElementById('cd-seconds').textContent = '00';
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      document.getElementById('cd-days').textContent = String(days).padStart(2, '0');
      document.getElementById('cd-hours').textContent = String(hours).padStart(2, '0');
      document.getElementById('cd-minutes').textContent = String(minutes).padStart(2, '0');
      document.getElementById('cd-seconds').textContent = String(seconds).padStart(2, '0');
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  // ============================================
  // BOTTOM NAVIGATION
  // ============================================
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = item.getAttribute('href').substring(1);
      const targetEl = document.getElementById(targetId);
      
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      
      // Update active state
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
    });
  });

  function observeSections() {
    const sections = document.querySelectorAll('section[id]');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-section') === sectionId) {
              item.classList.add('active');
            }
          });
        }
      });
    }, {
      root: null,
      rootMargin: '-30% 0px -70% 0px',
      threshold: 0
    });
    
    sections.forEach(section => observer.observe(section));
  }

  // ============================================
  // WEDDING GIFT
  // ============================================
  btnGiftModal.addEventListener('click', () => {
    giftCards.classList.toggle('hidden');
    
    // Scroll to gift cards
    if (!giftCards.classList.contains('hidden')) {
      btnGiftModal.style.display = 'none';
      setTimeout(() => {
        giftCards.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  });

  // Copy to clipboard
  btnCopies.forEach(btn => {
    btn.addEventListener('click', () => {
      const textToCopy = btn.getAttribute('data-copy');
      
      navigator.clipboard.writeText(textToCopy).then(() => {
        btn.classList.add('copied');
        btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        showToast('Nomor rekening berhasil disalin!');
        
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.innerHTML = '<i class="fas fa-copy"></i> Copy';
        }, 2000);
      }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        btn.classList.add('copied');
        btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        showToast('Nomor rekening berhasil disalin!');
        
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.innerHTML = '<i class="fas fa-copy"></i> Copy';
        }, 2000);
      });
    });
  });

  // ============================================
  // RSVP / GUESTBOOK
  // ============================================
  rsvpForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('rsvp-name').value.trim();
    const attend = document.getElementById('rsvp-attend').value;
    const message = document.getElementById('rsvp-message').value.trim();
    
    if (!name || !message) {
      showToast('Mohon isi nama dan ucapan Anda');
      return;
    }
    
    const comment = {
      name,
      attend,
      message,
      time: new Date().toLocaleString('id-ID', {
        dateStyle: 'long',
        timeStyle: 'short'
      })
    };
    
    comments.unshift(comment);
    localStorage.setItem('wedding-comments', JSON.stringify(comments));
    
    renderComments();
    rsvpForm.reset();
    showToast('Terima kasih atas ucapan dan do\'a Anda! 🙏');
  });

  function renderComments() {
    if (comments.length === 0) {
      rsvpComments.innerHTML = '<p style="text-align:center;color:var(--text-light);font-size:0.85rem;">Belum ada ucapan. Jadilah yang pertama! 💝</p>';
      return;
    }
    
    rsvpComments.innerHTML = comments.map(c => {
      const attendLabel = getAttendLabel(c.attend);
      return `
        <div class="comment-item">
          <p class="comment-name">${escapeHtml(c.name)}</p>
          ${attendLabel ? `<p class="comment-attend"><i class="fas fa-circle"></i> ${attendLabel}</p>` : ''}
          <p class="comment-message">${escapeHtml(c.message)}</p>
          <p class="comment-time">${c.time}</p>
        </div>
      `;
    }).join('');
  }

  function getAttendLabel(value) {
    switch (value) {
      case 'hadir': return 'Hadir';
      case 'tidak': return 'Tidak Hadir';
      case 'mungkin': return 'Masih Ragu';
      default: return '';
    }
  }

  // ============================================
  // UTILITIES
  // ============================================
  function showToast(message) {
    // Remove existing toast
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 2500);
  }

  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
});
