/* ============================================
   AIR DUST ODOUR - Main JavaScript
   airdustodour.co.uk
   ============================================ */

(function () {
  'use strict';

  /* ---------- DOM Ready ---------- */
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initMobileNav();
    initStickyHeader();
    initScrollToTop();
    initFadeInObserver();
    initSmoothScroll();
    initFormValidation();
    setActiveNav();
  }

  /* ---------- Mobile Navigation ---------- */
  function initMobileNav() {
    const toggle = document.querySelector('.header__toggle');
    const nav = document.querySelector('.header__nav');

    if (!toggle || !nav) return;

    toggle.addEventListener('click', function () {
      const isOpen = nav.classList.toggle('open');
      toggle.classList.toggle('active');
      toggle.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on nav link click
    nav.querySelectorAll('.header__nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('open');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });

    // Close on escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    });
  }

  /* ---------- Sticky Header ---------- */
  function initStickyHeader() {
    const header = document.querySelector('.header');
    if (!header) return;

    var lastScroll = 0;

    window.addEventListener('scroll', function () {
      var currentScroll = window.pageYOffset;

      if (currentScroll > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      lastScroll = currentScroll;
    }, { passive: true });
  }

  /* ---------- Scroll to Top ---------- */
  function initScrollToTop() {
    const btn = document.querySelector('.scroll-top');
    if (!btn) return;

    window.addEventListener('scroll', function () {
      if (window.pageYOffset > 600) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }, { passive: true });

    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------- Fade-in Observer ---------- */
  function initFadeInObserver() {
    var fadeElements = document.querySelectorAll('.fade-in');
    if (!fadeElements.length) return;

    if (!('IntersectionObserver' in window)) {
      // Fallback: just show everything
      fadeElements.forEach(function (el) {
        el.classList.add('visible');
      });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    fadeElements.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---------- Smooth Scroll for Anchors ---------- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var targetId = this.getAttribute('href');
        if (targetId === '#') return;

        var target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }

  /* ---------- Form Validation ---------- */
  function initFormValidation() {
    var forms = document.querySelectorAll('.form');

    forms.forEach(function (form) {
      form.addEventListener('submit', function (e) {
        var isValid = true;
        var requiredFields = form.querySelectorAll('[required]');

        requiredFields.forEach(function (field) {
          removeError(field);

          if (!field.value.trim()) {
            isValid = false;
            showError(field, 'This field is required');
          } else if (field.type === 'email' && !isValidEmail(field.value)) {
            isValid = false;
            showError(field, 'Please enter a valid email address');
          } else if (field.type === 'tel' && field.value.trim() && !isValidPhone(field.value)) {
            isValid = false;
            showError(field, 'Please enter a valid phone number');
          }
        });

        if (!isValid) {
          e.preventDefault();
          // Focus the first invalid field
          var firstError = form.querySelector('.form__group--error');
          if (firstError) {
            firstError.querySelector('input, textarea, select').focus();
          }
        }
      });

      // Remove error on input
      form.querySelectorAll('input, textarea, select').forEach(function (field) {
        field.addEventListener('input', function () {
          removeError(this);
        });
      });
    });
  }

  function showError(field, message) {
    var group = field.closest('.form__group');
    if (!group) return;

    group.classList.add('form__group--error');

    var errorEl = document.createElement('span');
    errorEl.className = 'form__error';
    errorEl.textContent = message;
    errorEl.style.cssText = 'display:block;font-size:0.8125rem;color:#DC2626;margin-top:0.25rem;';
    group.appendChild(errorEl);

    field.style.borderColor = '#DC2626';
  }

  function removeError(field) {
    var group = field.closest('.form__group');
    if (!group) return;

    group.classList.remove('form__group--error');
    var errorEl = group.querySelector('.form__error');
    if (errorEl) errorEl.remove();

    field.style.borderColor = '';
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function isValidPhone(phone) {
    return /^[\d\s\+\-\(\)]{7,20}$/.test(phone);
  }

  /* ---------- Active Nav Link ---------- */
  function setActiveNav() {
    var path = window.location.pathname;
    var filename = path.split('/').pop() || 'index.html';

    document.querySelectorAll('.header__nav-link').forEach(function (link) {
      var href = link.getAttribute('href');
      if (href === filename || (filename === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

})();
