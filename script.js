/* ============================================================
   MILLBROOK MANOR — Main Script
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  // --- Nav scroll effect ---
  const nav = document.querySelector('.nav');
  const hero = document.querySelector('.hero, .page-hero');

  function updateNav() {
    if (window.scrollY > 60) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
  }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  // --- Mobile menu ---
  const toggle = document.querySelector('.nav__toggle');
  const mobileMenu = document.querySelector('.nav__mobile');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        toggle.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // --- Scroll-driven video frame animation ---
  const heroCanvas = document.getElementById('hero-canvas');
  const heroBg = document.querySelector('.hero__bg');

  if (heroCanvas) {
    const ctx = heroCanvas.getContext('2d');
    const frameCount = 121;
    const frames = [];
    let loadedCount = 0;
    let currentFrame = 0;

    // Preload all frames
    for (let i = 1; i <= frameCount; i++) {
      const img = new Image();
      img.src = `images/frames/frame_${String(i).padStart(3, '0')}.jpg`;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === 1) {
          resizeCanvas();
          drawFrame(0);
          // Hide the static bg fallback once first frame is ready
          if (heroBg) heroBg.style.opacity = '0';
        }
      };
      frames.push(img);
    }

    function resizeCanvas() {
      const hero = heroCanvas.parentElement;
      heroCanvas.width = hero.offsetWidth;
      heroCanvas.height = hero.offsetHeight;
    }

    function drawFrame(index) {
      const img = frames[index];
      if (!img || !img.complete) return;

      const cw = heroCanvas.width;
      const ch = heroCanvas.height;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;

      // Cover fit
      const scale = Math.max(cw / iw, ch / ih);
      const sw = iw * scale;
      const sh = ih * scale;
      const sx = (cw - sw) / 2;
      const sy = (ch - sh) / 2;

      ctx.drawImage(img, sx, sy, sw, sh);
    }

    // Scroll handler: scrub through frames based on scroll position
    let frameTicking = false;
    window.addEventListener('scroll', () => {
      if (!frameTicking) {
        requestAnimationFrame(() => {
          const hero = heroCanvas.parentElement;
          const scrolled = window.scrollY;
          const maxScroll = hero.offsetHeight;
          const progress = Math.min(scrolled / maxScroll, 1);
          const frameIndex = Math.min(Math.floor(progress * (frameCount - 1)), frameCount - 1);

          if (frameIndex !== currentFrame && frames[frameIndex] && frames[frameIndex].complete) {
            currentFrame = frameIndex;
            drawFrame(frameIndex);
          }
          frameTicking = false;
        });
        frameTicking = true;
      }
    }, { passive: true });

    window.addEventListener('resize', () => {
      resizeCanvas();
      drawFrame(currentFrame);
    });
  } else if (heroBg) {
    // Fallback parallax for pages without canvas
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrolled = window.scrollY;
          heroBg.style.transform = `translateY(${scrolled * 0.35}px) scale(1.05)`;
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // Page hero parallax (subtler)
  const pageHeroBg = document.querySelector('.page-hero__bg');
  if (pageHeroBg) {
    let ticking2 = false;
    window.addEventListener('scroll', () => {
      if (!ticking2) {
        requestAnimationFrame(() => {
          const scrolled = window.scrollY;
          pageHeroBg.style.transform = `translateY(${scrolled * 0.25}px)`;
          ticking2 = false;
        });
        ticking2 = true;
      }
    }, { passive: true });
  }

  // --- Scroll reveal ---
  const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (reveals.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(el => observer.observe(el));
  }

  // --- Stagger children ---
  document.querySelectorAll('.stagger').forEach(container => {
    Array.from(container.children).forEach((child, i) => {
      child.style.setProperty('--i', i);
    });
  });

  // --- Lightbox ---
  const lightbox = document.querySelector('.lightbox');
  const lightboxImg = document.querySelector('.lightbox__img');
  const galleryItems = document.querySelectorAll('.photo-gallery__item');
  let currentLightboxIndex = 0;
  const galleryImages = [];

  if (lightbox && galleryItems.length) {
    galleryItems.forEach((item, i) => {
      const img = item.querySelector('img');
      if (img) {
        const fullSrc = img.dataset.full || img.src;
        galleryImages.push(fullSrc);
        item.addEventListener('click', () => {
          currentLightboxIndex = i;
          openLightbox(fullSrc);
        });
      }
    });

    const closeBtn = lightbox.querySelector('.lightbox__close');
    const prevBtn = lightbox.querySelector('.lightbox__nav--prev');
    const nextBtn = lightbox.querySelector('.lightbox__nav--next');

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (prevBtn) prevBtn.addEventListener('click', () => navigateLightbox(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => navigateLightbox(1));

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') navigateLightbox(-1);
      if (e.key === 'ArrowRight') navigateLightbox(1);
    });
  }

  function openLightbox(src) {
    lightboxImg.src = src;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function navigateLightbox(dir) {
    currentLightboxIndex = (currentLightboxIndex + dir + galleryImages.length) % galleryImages.length;
    lightboxImg.src = galleryImages[currentLightboxIndex];
  }

  // --- CTA band parallax ---
  const ctaBg = document.querySelector('.cta-band__bg');
  if (ctaBg) {
    // Fixed background handled by CSS background-attachment: fixed
  }

  // --- Smooth anchor scroll ---
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // --- Booking modal ---
  const bookingModal = document.getElementById('booking-modal');
  const bookNowBtns = document.querySelectorAll('#book-now-btn');

  if (bookingModal) {
    function openBookingModal() {
      bookingModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
    function closeBookingModal() {
      bookingModal.classList.remove('open');
      document.body.style.overflow = '';
    }

    bookNowBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openBookingModal();
      });
    });

    bookingModal.querySelector('.booking-modal__backdrop').addEventListener('click', closeBookingModal);
    bookingModal.querySelector('.booking-modal__close').addEventListener('click', closeBookingModal);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && bookingModal.classList.contains('open')) closeBookingModal();
    });

    // Booking modal date constraints
    const bookCheckin = document.getElementById('book-checkin');
    const bookCheckout = document.getElementById('book-checkout');
    if (bookCheckin && bookCheckout) {
      const today = new Date().toISOString().split('T')[0];
      bookCheckin.min = today;
      bookCheckout.min = today;
      bookCheckin.addEventListener('change', () => {
        bookCheckout.min = bookCheckin.value;
        if (bookCheckout.value && bookCheckout.value <= bookCheckin.value) bookCheckout.value = '';
      });
    }

    // Booking form submission
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
      bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = bookingForm.querySelector('#book-name').value;
        const email = bookingForm.querySelector('#book-email').value;
        const phone = bookingForm.querySelector('#book-phone').value || 'Not provided';
        const guests = bookingForm.querySelector('#book-guests').value || 'Not specified';
        const checkin = bookingForm.querySelector('#book-checkin').value;
        const checkout = bookingForm.querySelector('#book-checkout').value;
        const message = bookingForm.querySelector('#book-message').value || 'No additional message';
        const houses = Array.from(bookingForm.querySelectorAll('input[name="book-houses"]:checked'))
          .map(cb => cb.value).join(', ') || 'Not specified';

        const subject = `Booking Inquiry from ${name} — ${checkin} to ${checkout}`;
        const body = [
          'New booking inquiry from the Millbrook Manor website:',
          '',
          `Name: ${name}`,
          `Email: ${email}`,
          `Phone: ${phone}`,
          '',
          `Houses: ${houses}`,
          `Check-in: ${checkin}`,
          `Check-out: ${checkout}`,
          `Guests: ${guests}`,
          '',
          'Message:',
          message
        ].join('\n');

        window.location.href = `mailto:millbrookmanorlg@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        document.getElementById('booking-success').style.display = 'block';
      });
    }
  }

  // --- Set min dates on calendar inputs ---
  const checkinInput = document.getElementById('checkin');
  const checkoutInput = document.getElementById('checkout');
  if (checkinInput && checkoutInput) {
    const today = new Date().toISOString().split('T')[0];
    checkinInput.min = today;
    checkoutInput.min = today;
    checkinInput.addEventListener('change', () => {
      checkoutInput.min = checkinInput.value;
      if (checkoutInput.value && checkoutInput.value <= checkinInput.value) {
        checkoutInput.value = '';
      }
    });
  }

  // --- Inquiry form → mailto submission ---
  const form = document.getElementById('inquiry-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = form.querySelector('#name').value;
      const email = form.querySelector('#email').value;
      const phone = form.querySelector('#phone').value || 'Not provided';
      const guests = form.querySelector('#guests').value || 'Not specified';
      const checkin = form.querySelector('#checkin').value;
      const checkout = form.querySelector('#checkout').value;
      const message = form.querySelector('#message').value || 'No additional message';

      const houses = Array.from(form.querySelectorAll('input[name="houses"]:checked'))
        .map(cb => cb.value)
        .join(', ') || 'Not specified';

      const subject = `Inquiry from ${name} — ${checkin} to ${checkout}`;
      const body = [
        `New inquiry from the Millbrook Manor website:`,
        ``,
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
        ``,
        `Houses interested in: ${houses}`,
        `Check-in: ${checkin}`,
        `Check-out: ${checkout}`,
        `Number of guests: ${guests}`,
        ``,
        `Message:`,
        message
      ].join('\n');

      const mailtoLink = `mailto:millbrookmanorlg@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoLink;

      document.getElementById('form-success').style.display = 'block';
    });
  }
});
