/**
 * Mohamed Hamdy | Advanced Interactive Portfolio Script
 * Refined for Silky-Smooth Scrolling, Responsive Animation Timing & Touch Optimization
 * Tech Stack:
 * - Lenis (Smooth Scroll - Ultra-Fluid Lerp Interpolation)
 * - GSAP 3 & ScrollTrigger (Buttery Power3.out Scroll Reveals)
 * - Vanilla-tilt.js (3D Dynamic Perspective - Desktop Only, Disabled on Touch/Mobile)
 * - Dark / Light Dual Theme Engine with LocalStorage Persistence
 * - Interactive Timeline Filtering, Contact Form Validation & Clipboard Tooling
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ------------------------------------------------------------------------
     1. Dark / Light Mode Theme Engine
     ------------------------------------------------------------------------ */
  const htmlEl = document.documentElement;
  const themeToggleBtn = document.getElementById('themeToggle');

  // Retrieve saved preference or default to dark
  const savedTheme = localStorage.getItem('portfolio-theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'dark');

  setTheme(initialTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = htmlEl.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
      showToast(`Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} Mode`);
    });
  }

  function setTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);
  }

  /* ------------------------------------------------------------------------
     2. Initialize Lenis Smooth Scroll & Sync with GSAP ScrollTrigger
     ------------------------------------------------------------------------ */
  let lenis = null;

  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      lerp: 0.08,             // Buttery soft and fluid interpolation
      wheelMultiplier: 0.95,   // Natural wheel speed
      touchMultiplier: 1.5,    // Responsive touch handling
      smoothWheel: true,       // Fluid desktop scrolling
      smoothTouch: false,      // Preserves 120Hz native touch responsiveness on mobile
      infinite: false
    });

    // Connect Lenis to GSAP ScrollTrigger
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);

      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });

      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }

  // Ensure native and touch scrolling triggers ScrollTrigger updates on mobile
  window.addEventListener('scroll', () => {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.update();
    }
  }, { passive: true });

  /* ------------------------------------------------------------------------
     3. Navbar Scroll State & Active Section Spy
     ------------------------------------------------------------------------ */
  const navbarWrapper = document.querySelector('.navbar-wrapper');
  const navLinks = document.querySelectorAll('.nav-links .nav-link');
  const sections = document.querySelectorAll('main section');
  const backToTopBtn = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Navbar Scrolled Glass Effect
    if (navbarWrapper) {
      if (scrollY > 40) {
        navbarWrapper.classList.add('scrolled');
      } else {
        navbarWrapper.classList.remove('scrolled');
      }
    }

    // Back to Top Button Visibility
    if (backToTopBtn) {
      if (scrollY > 350) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }

    // ScrollSpy: Highlight active link
    let currentSectionId = '';
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });

  // Back to Top Smooth Click
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      if (lenis) {
        lenis.scrollTo(0, { duration: 1.1 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  /* ------------------------------------------------------------------------
     4. Mobile Navigation Drawer
     ------------------------------------------------------------------------ */
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.contains('open');
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    // Close when clicking any nav link
    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        closeMobileMenu();
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        closeMobileMenu();
      }
    });
  }

  function openMobileMenu() {
    navMenu.classList.add('open');
    menuToggle.classList.add('active');
    menuToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    navMenu.classList.remove('open');
    menuToggle.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  /* ------------------------------------------------------------------------
     5. Smooth Anchor Scrolling via Lenis
     ------------------------------------------------------------------------ */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId.startsWith('#')) return;

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(targetEl, { offset: -60, duration: 1.1 });
        } else {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  /* ------------------------------------------------------------------------
     6. GSAP Animations & ScrollTrigger Reveals (Zero Mobile Blank Space)
     ------------------------------------------------------------------------ */
  if (typeof gsap !== 'undefined') {
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    const isMobile = window.innerWidth <= 768;
    const initialOpacity = isMobile ? 1 : 0;
    const triggerStart = isMobile ? 'top 96%' : 'top 88%';

    // Hero Section Entrance Timeline
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.75 } });

    if (isMobile) {
      // Mobile: Keep all content completely visible without blank screens
      heroTl
        .from('.status-badge', { y: -10, duration: 0.4 })
        .from('.hero-title', { y: 15, duration: 0.5 }, '-=0.25')
        .from('.hero-subtitle', { y: 12, duration: 0.45 }, '-=0.3')
        .from('.hero-actions .btn', { y: 10, stagger: 0.05, duration: 0.4 }, '-=0.25')
        .from('.hero-stats', { y: 10, duration: 0.4 }, '-=0.2')
        .add(() => {
          animateCounters();
        }, '-=0.2');
    } else {
      heroTl
        .from('.status-badge', { y: -15, opacity: 0, duration: 0.55 })
        .from('.hero-title', { y: 25, opacity: 0, duration: 0.8 }, '-=0.35')
        .from('.hero-subtitle', { y: 20, opacity: 0, duration: 0.65 }, '-=0.45')
        .from('.hero-tags .tag', { scale: 0.9, opacity: 0, stagger: 0.06, duration: 0.45 }, '-=0.35')
        .from('.hero-actions .btn', { y: 15, opacity: 0, stagger: 0.08, duration: 0.55 }, '-=0.3')
        .from('.hero-stats', { y: 20, opacity: 0, duration: 0.6 }, '-=0.35')
        .from('.profile-card-wrapper', { scale: 0.94, opacity: 0, duration: 0.85, ease: 'back.out(1.2)' }, '-=0.65')
        .from('.floating-badge', { y: 15, opacity: 0, stagger: 0.15, duration: 0.55 }, '-=0.35')
        .add(() => {
          animateCounters();
        }, '-=0.4');
    }

    // ScrollTrigger Early Reveals
    if (typeof ScrollTrigger !== 'undefined') {
      // Section Headers
      gsap.utils.toArray('.section-header').forEach((header) => {
        gsap.from(header, {
          scrollTrigger: {
            trigger: header,
            start: triggerStart,
            toggleActions: 'play none none none'
          },
          y: isMobile ? 12 : 28,
          opacity: initialOpacity,
          duration: 0.65,
          ease: 'power3.out'
        });
      });

      // About Section Cards
      gsap.from('.about-bio-card', {
        scrollTrigger: {
          trigger: '.about-grid',
          start: triggerStart
        },
        y: isMobile ? 12 : 25,
        opacity: initialOpacity,
        duration: 0.7,
        ease: 'power3.out'
      });

      gsap.from('.pillar-card', {
        scrollTrigger: {
          trigger: '.about-pillars',
          start: triggerStart
        },
        y: isMobile ? 12 : 25,
        opacity: initialOpacity,
        stagger: isMobile ? 0.04 : 0.12,
        duration: 0.6,
        ease: 'power3.out'
      });

      // Timeline Items (Work History)
      gsap.utils.toArray('.timeline-item').forEach((item) => {
        gsap.from(item, {
          scrollTrigger: {
            trigger: item,
            start: triggerStart
          },
          y: isMobile ? 12 : 30,
          opacity: initialOpacity,
          duration: 0.6,
          ease: 'power3.out'
        });
      });

      // Education Card
      gsap.from('.education-card', {
        scrollTrigger: {
          trigger: '.education-grid',
          start: triggerStart
        },
        y: isMobile ? 12 : 30,
        scale: isMobile ? 1 : 0.98,
        opacity: initialOpacity,
        duration: 0.65,
        ease: 'power3.out'
      });

      // Skills Cards & Progress Bar Fill
      gsap.utils.toArray('.skill-card').forEach((card) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: triggerStart
          },
          y: isMobile ? 12 : 28,
          opacity: initialOpacity,
          duration: 0.6,
          ease: 'power3.out',
          onComplete: () => {
            const fills = card.querySelectorAll('.progress-fill');
            fills.forEach((fill) => {
              const targetWidth = fill.style.width;
              fill.style.width = '0%';
              requestAnimationFrame(() => {
                fill.style.width = targetWidth;
              });
            });
          }
        });
      });

      // Contact Panel & Form
      gsap.from('.contact-info-panel .contact-card', {
        scrollTrigger: {
          trigger: '.contact-grid',
          start: triggerStart
        },
        y: isMobile ? 10 : 22,
        opacity: initialOpacity,
        stagger: isMobile ? 0.04 : 0.1,
        duration: 0.55,
        ease: 'power3.out'
      });

      gsap.from('.contact-form-panel', {
        scrollTrigger: {
          trigger: '.contact-grid',
          start: triggerStart
        },
        y: isMobile ? 10 : 25,
        opacity: initialOpacity,
        duration: 0.65,
        ease: 'power3.out'
      });

      // Refresh triggers after load
      ScrollTrigger.refresh();
      window.addEventListener('load', () => {
        ScrollTrigger.refresh();
      });
    }
  }

  /* ------------------------------------------------------------------------
     7. Animated Numbers / Stats Counter
     ------------------------------------------------------------------------ */
  function animateCounters() {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach((counter) => {
      const target = +counter.getAttribute('data-target') || 0;
      const duration = 1400; // ms
      const startTime = performance.now();

      function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentVal = Math.floor(easeOut * target);

        counter.textContent = currentVal;

        if (progress < 1) {
          requestAnimationFrame(updateNumber);
        } else {
          counter.textContent = target;
        }
      }

      requestAnimationFrame(updateNumber);
    });
  }

  /* ------------------------------------------------------------------------
     8. Vanilla-Tilt 3D Hover Effect (Disabled on Mobile & Touch Devices)
     ------------------------------------------------------------------------ */
  const isTouchOrMobile = window.matchMedia('(pointer: coarse)').matches || 
                          window.innerWidth <= 768 || 
                          ('ontouchstart' in window);

  if (!isTouchOrMobile && typeof VanillaTilt !== 'undefined') {
    const tiltElements = document.querySelectorAll(
      '.profile-card-wrapper, .pillar-card, .timeline-card, .skill-card, .project-card, .cert-card, .contact-card, .education-card'
    );

    VanillaTilt.init(tiltElements, {
      max: 8,
      speed: 450,
      glare: true,
      'max-glare': 0.15,
      scale: 1.01,
      perspective: 1000
    });
  }

  /* ------------------------------------------------------------------------
     9. Timeline Experience Filter Tabs
     ------------------------------------------------------------------------ */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const timelineItems = document.querySelectorAll('.timeline-item');

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter');

      timelineItems.forEach((item) => {
        const itemCategory = item.getAttribute('data-category');

        if (filterVal === 'all' || itemCategory === filterVal) {
          item.classList.remove('hide-item');
          if (typeof gsap !== 'undefined') {
            gsap.fromTo(item, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out' });
          }
        } else {
          item.classList.add('hide-item');
        }
      });

      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
    });
  });

  /* ------------------------------------------------------------------------
     10. Interactive Contact Form with Validation & WhatsApp Integration
     ------------------------------------------------------------------------ */
  const contactForm = document.getElementById('contactForm');
  const formFeedback = document.getElementById('formFeedback');
  const submitBtn = document.getElementById('submitBtn');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('name');
      const emailInput = document.getElementById('email');
      const subjectInput = document.getElementById('subject');
      const messageInput = document.getElementById('message');

      let isValid = true;
      clearErrors();

      if (!nameInput.value.trim()) {
        showError('nameError', 'Please enter your name.');
        isValid = false;
      }

      if (!emailInput.value.trim()) {
        showError('emailError', 'Please enter your email.');
        isValid = false;
      } else if (!isValidEmail(emailInput.value.trim())) {
        showError('emailError', 'Please enter a valid email address.');
        isValid = false;
      }

      if (!subjectInput.value.trim()) {
        showError('subjectError', 'Please specify a subject.');
        isValid = false;
      }

      if (!messageInput.value.trim() || messageInput.value.trim().length < 10) {
        showError('messageError', 'Please enter a message (at least 10 characters).');
        isValid = false;
      }

      if (!isValid) return;

      const originalBtnHTML = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Sending Message...</span>';

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> <span>Message Sent!</span>';

        if (formFeedback) {
          formFeedback.style.display = 'flex';
          formFeedback.className = 'form-feedback success';
          formFeedback.innerHTML = `
            <i class="fa-solid fa-circle-check"></i>
            <div>
              <strong>Thank you, ${escapeHTML(nameInput.value.trim())}!</strong>
              <p>Your message has been composed. You can also send this directly via WhatsApp for an immediate response.</p>
            </div>
          `;
        }

        const waText = encodeURIComponent(
          `*New Message from Portfolio Website*\n\n` +
          `*Name:* ${nameInput.value.trim()}\n` +
          `*Email:* ${emailInput.value.trim()}\n` +
          `*Subject:* ${subjectInput.value.trim()}\n` +
          `*Message:* ${messageInput.value.trim()}`
        );
        const waUrl = `https://wa.me/201553268880?text=${waText}`;

        setTimeout(() => {
          if (confirm('Would you like to send this message directly to Mohamed Hamdy on WhatsApp?')) {
            window.open(waUrl, '_blank');
          }
        }, 500);

        contactForm.reset();
        setTimeout(() => {
          submitBtn.innerHTML = originalBtnHTML;
        }, 3000);
      }, 900);
    });
  }

  function showError(elementId, msg) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = msg;
  }

  function clearErrors() {
    document.querySelectorAll('.error-msg').forEach((el) => {
      el.textContent = '';
    });
    if (formFeedback) formFeedback.style.display = 'none';
  }

  function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, (tag) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  /* ------------------------------------------------------------------------
     11. Clipboard Copy Tooling
     ------------------------------------------------------------------------ */
  document.querySelectorAll('.copy-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const textToCopy = btn.getAttribute('data-copy');
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          const originalHTML = btn.innerHTML;
          btn.innerHTML = '<i class="fa-solid fa-check text-green"></i> Copied!';
          showToast(`Copied "${textToCopy}" to clipboard!`);
          setTimeout(() => {
            btn.innerHTML = originalHTML;
          }, 2000);
        }).catch(() => {
          showToast('Failed to copy text.');
        });
      }
    });
  });

  /* ------------------------------------------------------------------------
     12. Toast Notification System
     ------------------------------------------------------------------------ */
  const toast = document.getElementById('toast');
  let toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2200);
  }

  /* ------------------------------------------------------------------------
     13. Dynamic Copyright Year
     ------------------------------------------------------------------------ */
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});
