/* ============================================
   SCUBACUBA.CA — Main JavaScript
   Nav, Carousel, Lightbox, Filters, Forms
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ---- Mobile Navigation ----
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const menuOverlay = document.querySelector('.menu-overlay');

  function toggleMenu() {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    menuOverlay.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
  }

  if (hamburger) {
    hamburger.addEventListener('click', toggleMenu);
    menuOverlay.addEventListener('click', toggleMenu);
    // Close menu on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (mobileMenu.classList.contains('active')) toggleMenu();
      });
    });
  }

  // ---- Header scroll effect — adds .scrolled when past 60px ----
  const header = document.querySelector('.header');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    requestAnimationFrame(() => {
      header.classList.toggle('scrolled', window.scrollY > 60);
      ticking = false;
    });
    ticking = true;
  }, { passive: true });


  // ---- Testimonial Carousel ----
  const track = document.querySelector('.testimonial-track');
  const dots = document.querySelectorAll('.carousel-dot');

  if (track && dots.length) {
    let currentSlide = 0;
    let slidesPerView = 1;
    const cards = track.querySelectorAll('.testimonial-card');
    const totalSlides = cards.length;

    function getSlidesPerView() {
      if (window.innerWidth >= 1024) return 3;
      if (window.innerWidth >= 768) return 2;
      return 1;
    }

    function updateCarousel() {
      slidesPerView = getSlidesPerView();
      const maxSlide = Math.max(0, totalSlides - slidesPerView);
      if (currentSlide > maxSlide) currentSlide = maxSlide;
      const offset = -(currentSlide * (100 / slidesPerView));
      track.style.transform = `translateX(${offset}%)`;
      dots.forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
    }

    dots.forEach(dot => {
      dot.addEventListener('click', () => {
        currentSlide = parseInt(dot.dataset.index);
        updateCarousel();
      });
    });

    // Touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    track.addEventListener('touchend', e => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      const maxSlide = Math.max(0, totalSlides - getSlidesPerView());
      if (diff > 50 && currentSlide < maxSlide) {
        currentSlide++;
        updateCarousel();
      } else if (diff < -50 && currentSlide > 0) {
        currentSlide--;
        updateCarousel();
      }
    }, { passive: true });

    // Auto-advance every 5 seconds
    let autoPlay = setInterval(() => {
      const maxSlide = Math.max(0, totalSlides - getSlidesPerView());
      currentSlide = currentSlide < maxSlide ? currentSlide + 1 : 0;
      updateCarousel();
    }, 5000);

    track.addEventListener('mouseenter', () => clearInterval(autoPlay));
    track.addEventListener('touchstart', () => clearInterval(autoPlay), { passive: true });

    window.addEventListener('resize', updateCarousel);
    updateCarousel();
  }


  // ---- Diving Centers Filter ----
  const filterBtns = document.querySelectorAll('.filter-btn');
  const centerCards = document.querySelectorAll('.center-card');

  if (filterBtns.length && centerCards.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        centerCards.forEach(card => {
          if (filter === 'all' || card.dataset.region === filter) {
            card.style.display = '';
            card.style.animation = 'fadeIn 0.4s ease';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }


  // ---- Gallery Tabs ----
  const galleryTabs = document.querySelectorAll('.gallery-tab');
  const galleryItems = document.querySelectorAll('.gallery-item');

  if (galleryTabs.length && galleryItems.length) {
    galleryTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const filter = tab.dataset.tab;
        galleryTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        galleryItems.forEach(item => {
          if (filter === 'all' || item.dataset.category === filter) {
            item.style.display = '';
            item.style.animation = 'fadeIn 0.4s ease';
          } else {
            item.style.display = 'none';
          }
        });
      });
    });
  }


  // ---- Lightbox ----
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.querySelector('.lightbox-close');
  const lightboxPrev = document.querySelector('.lightbox-prev');
  const lightboxNext = document.querySelector('.lightbox-next');

  if (lightbox && galleryItems.length) {
    let lightboxIndex = 0;
    const visibleImages = () => Array.from(galleryItems).filter(item => item.style.display !== 'none');

    galleryItems.forEach((item, i) => {
      item.addEventListener('click', () => {
        const visible = visibleImages();
        lightboxIndex = visible.indexOf(item);
        const img = item.querySelector('img');
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
      lightboxImg.src = '';
    }

    function showPrev() {
      const visible = visibleImages();
      lightboxIndex = (lightboxIndex - 1 + visible.length) % visible.length;
      const img = visible[lightboxIndex].querySelector('img');
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
    }

    function showNext() {
      const visible = visibleImages();
      lightboxIndex = (lightboxIndex + 1) % visible.length;
      const img = visible[lightboxIndex].querySelector('img');
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
    }

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener('click', showPrev);
    if (lightboxNext) lightboxNext.addEventListener('click', showNext);

    lightbox.addEventListener('click', e => {
      if (e.target === lightbox) closeLightbox();
    });

    // Keyboard navigation
    document.addEventListener('keydown', e => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    });

    // Swipe in lightbox
    let lbTouchStartX = 0;
    lightbox.addEventListener('touchstart', e => {
      lbTouchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', e => {
      const diff = lbTouchStartX - e.changedTouches[0].screenX;
      if (diff > 50) showNext();
      else if (diff < -50) showPrev();
    }, { passive: true });
  }


  // ---- Quote Form Validation ----
  const quoteForm = document.getElementById('quote-form');
  const formSuccess = document.getElementById('form-success');

  if (quoteForm) {
    quoteForm.addEventListener('submit', e => {
      e.preventDefault();
      let valid = true;

      // Clear previous errors
      quoteForm.querySelectorAll('.form-group').forEach(g => g.classList.remove('error'));

      // Validate required fields
      quoteForm.querySelectorAll('[required]').forEach(input => {
        const group = input.closest('.form-group');
        if (!input.value.trim()) {
          if (group) group.classList.add('error');
          valid = false;
        }
        // Email validation
        if (input.type === 'email' && input.value.trim()) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(input.value.trim())) {
            if (group) group.classList.add('error');
            valid = false;
          }
        }
      });

      if (valid) {
        // Simulate form submission
        quoteForm.style.display = 'none';
        formSuccess.classList.add('show');
        window.scrollTo({ top: formSuccess.offsetTop - 100, behavior: 'smooth' });
      }
    });

    // Remove error on input
    quoteForm.querySelectorAll('input, select, textarea').forEach(input => {
      input.addEventListener('input', () => {
        const group = input.closest('.form-group');
        if (group) group.classList.remove('error');
      });
    });
  }


  // ---- Newsletter Form ----
  const newsletterForm = document.getElementById('newsletter-form');

  if (newsletterForm) {
    newsletterForm.addEventListener('submit', e => {
      e.preventDefault();
      const email = newsletterForm.querySelector('input[type="email"]');
      const consent = newsletterForm.querySelector('input[type="checkbox"]');

      if (!email.value.trim() || !consent.checked) {
        alert('Please enter your email and agree to receive communications.');
        return;
      }

      // Simulate subscription
      newsletterForm.innerHTML = `
        <div style="text-align: center; padding: 20px;">
          <div style="font-size: 2.5rem; margin-bottom: 12px;">&#10003;</div>
          <h3 style="color: var(--white); margin-bottom: 8px;">You're In!</h3>
          <p style="color: rgba(255,255,255,0.7); font-size: 0.938rem;">Welcome to the ScubaCuba.ca dive community. Check your email for a confirmation.</p>
        </div>
      `;
    });
  }


  // ---- Smooth scroll for anchor links ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });


  // ---- Reveal cards on scroll (skips elements already in viewport) ----
  if ('IntersectionObserver' in window) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    const initialViewport = window.innerHeight;
    document.querySelectorAll('.feature-card, .destination-card, .center-card, .partner-card, .gallery-item, .excursion-card, .spotlight-card').forEach(el => {
      // Skip animation for elements already above/within initial viewport — show them immediately.
      const rect = el.getBoundingClientRect();
      if (reduceMotion || rect.top < initialViewport) {
        el.classList.add('in-view');
        return;
      }
      el.classList.add('reveal');
      revealObserver.observe(el);
    });
  }

});

// ---- CSS Animation Keyframes (injected) ----
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(style);
