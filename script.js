/**
 * Mohamed Hamdy | Advanced Interactive Portfolio Script
 * Tech Stack:
 * - Lenis (Smooth Scroll)
 * - GSAP 3 & ScrollTrigger (Cinematic Scroll & Reveal Animations)
 * - Vanilla-tilt.js (3D Dynamic Perspective & Glare Effects)
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

  // Retrieve saved preference or default to system or dark
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
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
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
      if (scrollY > 50) {
        navbarWrapper.classList.add('scrolled');
      } else {
        navbarWrapper.classList.remove('scrolled');
      }
    }

    // Back to Top Button Visibility
    if (backToTopBtn) {
      if (scrollY > 400) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }

    // ScrollSpy: Highlight active link
    let currentSectionId = '';
    sections.forEach((section) => {
      const sectionTop = section.offsetTop - 140;
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
  });

  // Back to Top Smooth Click
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      if (lenis) {
        lenis.scrollTo(0, { duration: 1.2 });
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
          lenis.scrollTo(targetEl, { offset: -70, duration: 1.2 });
        } else {
          targetEl.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  /* ------------------------------------------------------------------------
     6. GSAP Animations & ScrollTrigger Reveals
     ------------------------------------------------------------------------ */
  if (typeof gsap !== 'undefined') {
    // Register ScrollTrigger plugin if available
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    // Hero Section Entrance Timeline
    const heroTl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.8 } });

    heroTl
      .from('.status-badge', { y: -20, opacity: 0, duration: 0.6 })
      .from('.hero-title', { y: 30, opacity: 0, duration: 0.9 }, '-=0.3')
      .from('.hero-subtitle', { y: 25, opacity: 0, duration: 0.7 }, '-=0.5')
      .from('.hero-tags .tag', { scale: 0.85, opacity: 0, stagger: 0.08, duration: 0.5 }, '-=0.4')
      .from('.hero-actions .btn', { y: 20, opacity: 0, stagger: 0.1, duration: 0.6 }, '-=0.3')
      .from('.hero-stats', { y: 25, opacity: 0, duration: 0.7 }, '-=0.4')
      .from('.profile-card-wrapper', { scale: 0.9, opacity: 0, duration: 1, ease: 'back.out(1.4)' }, '-=0.8')
      .from('.floating-badge', { y: 20, opacity: 0, stagger: 0.2, duration: 0.6 }, '-=0.4')
      .add(() => {
        animateCounters();
      }, '-=0.5');

    // ScrollTrigger Reveals for Each Section Header & Content
    if (typeof ScrollTrigger !== 'undefined') {
      // Section Headers
      gsap.utils.toArray('.section-header').forEach((header) => {
        gsap.from(header, {
          scrollTrigger: {
            trigger: header,
            start: 'top 85%',
            toggleActions: 'play none none none'
          },
          y: 35,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out'
        });
      });

      // About Section Cards
      gsap.from('.about-bio-card', {
        scrollTrigger: {
          trigger: '.about-grid',
          start: 'top 80%'
        },
        x: -40,
        opacity: 0,
        duration: 0.85,
        ease: 'power2.out'
      });

      gsap.from('.pillar-card', {
        scrollTrigger: {
          trigger: '.about-pillars',
          start: 'top 80%'
        },
        x: 40,
        opacity: 0,
        stagger: 0.15,
        duration: 0.7,
        ease: 'power2.out'
      });

      // Timeline Items (Work History)
      gsap.utils.toArray('.timeline-item').forEach((item) => {
        gsap.from(item, {
          scrollTrigger: {
            trigger: item,
            start: 'top 85%'
          },
          y: 40,
          opacity: 0,
          duration: 0.7,
          ease: 'power2.out'
        });
      });

      // Education Card
      gsap.from('.education-card', {
        scrollTrigger: {
          trigger: '.education-grid',
          start: 'top 80%'
        },
        y: 40,
        scale: 0.97,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out'
      });

      // Skills Cards & Progress Bar Fill
      gsap.utils.toArray('.skill-card').forEach((card) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: 'top 85%'
          },
          y: 35,
          opacity: 0,
          duration: 0.7,
          ease: 'power2.out',
          onComplete: () => {
            // Trigger progress fill
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

      // Project / Milestone Cards
      gsap.from('.project-card', {
        scrollTrigger: {
          trigger: '.projects-grid',
          start: 'top 80%'
        },
        y: 45,
        opacity: 0,
        stagger: 0.18,
        duration: 0.75,
        ease: 'power2.out'
      });

      // Certification Cards
      gsap.from('.cert-card', {
        scrollTrigger: {
          trigger: '.certifications-grid',
          start: 'top 80%'
        },
        scale: 0.95,
        opacity: 0,
        stagger: 0.2,
        duration: 0.8,
        ease: 'power2.out'
      });

      // Contact Panel & Form
      gsap.from('.contact-info-panel .contact-card', {
        scrollTrigger: {
          trigger: '.contact-grid',
          start: 'top 80%'
        },
        x: -35,
        opacity: 0,
        stagger: 0.12,
        duration: 0.65,
        ease: 'power2.out'
      });

      gsap.from('.contact-form-panel', {
        scrollTrigger: {
          trigger: '.contact-grid',
          start: 'top 80%'
        },
        x: 35,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out'
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
      const duration = 1600; // ms
      const startTime = performance.now();

      function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Easing out cubic
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
     8. Vanilla-Tilt 3D Hover Effect Initialization
     ------------------------------------------------------------------------ */
  if (typeof VanillaTilt !== 'undefined') {
    // Select cards to apply 3D tilt
    const tiltElements = document.querySelectorAll(
      '.profile-card-wrapper, .pillar-card, .timeline-card, .skill-card, .project-card, .cert-card, .contact-card, .education-card'
    );

    VanillaTilt.init(tiltElements, {
      max: 10,
      speed: 400,
      glare: true,
      'max-glare': 0.18,
      scale: 1.015,
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
      // Active state
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const filterVal = btn.getAttribute('data-filter');

      timelineItems.forEach((item) => {
        const itemCategory = item.getAttribute('data-category');

        if (filterVal === 'all' || itemCategory === filterVal) {
          item.classList.remove('hide-item');
          if (typeof gsap !== 'undefined') {
            gsap.fromTo(item, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4 });
          }
        } else {
          item.classList.add('hide-item');
        }
      });

      // Refresh ScrollTrigger calculations after DOM change
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

      // Reset errors
      clearErrors();

      // Validate Name
      if (!nameInput.value.trim()) {
        showError('nameError', 'Please enter your name.');
        isValid = false;
      }

      // Validate Email
      if (!emailInput.value.trim()) {
        showError('emailError', 'Please enter your email.');
        isValid = false;
      } else if (!isValidEmail(emailInput.value.trim())) {
        showError('emailError', 'Please enter a valid email address.');
        isValid = false;
      }

      // Validate Subject
      if (!subjectInput.value.trim()) {
        showError('subjectError', 'Please specify a subject.');
        isValid = false;
      }

      // Validate Message
      if (!messageInput.value.trim() || messageInput.value.trim().length < 10) {
        showError('messageError', 'Please enter a message (at least 10 characters).');
        isValid = false;
      }

      if (!isValid) return;

      // Loading State
      const originalBtnHTML = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Sending Message...</span>';

      setTimeout(() => {
        // Success feedback
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

        // WhatsApp direct link generator
        const waText = encodeURIComponent(
          `*New Message from Portfolio Website*\n\n` +
          `*Name:* ${nameInput.value.trim()}\n` +
          `*Email:* ${emailInput.value.trim()}\n` +
          `*Subject:* ${subjectInput.value.trim()}\n` +
          `*Message:* ${messageInput.value.trim()}`
        );
        const waUrl = `https://wa.me/201553268880?text=${waText}`;

        // Prompt to open WhatsApp
        setTimeout(() => {
          if (confirm('Would you like to send this message directly to Mohamed Hamdy on WhatsApp?')) {
            window.open(waUrl, '_blank');
          }
        }, 600);

        // Reset form after delay
        contactForm.reset();
        setTimeout(() => {
          submitBtn.innerHTML = originalBtnHTML;
        }, 3000);
      }, 1000);
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
    }, 2500);
  }

  /* ------------------------------------------------------------------------
     13. Dynamic Copyright Year
     ------------------------------------------------------------------------ */
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
});
