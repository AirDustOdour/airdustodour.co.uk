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
  // A .fade-in block is revealed as soon as any part of it is on screen
  // (threshold 0). A ratio threshold such as 0.1 can never be reached by a
  // block taller than about ten screens, which left long articles and the
  // glossary stuck at opacity 0.
  function initFadeInObserver() {
    var fadeElements = document.querySelectorAll('.fade-in');
    if (!fadeElements.length) return;

    function revealAll() {
      document.querySelectorAll('.fade-in:not(.visible)').forEach(function (el) {
        el.classList.add('visible');
      });
    }

    // Never print blank sections
    window.addEventListener('beforeprint', revealAll);

    if (!('IntersectionObserver' in window)) {
      // Fallback: just show everything
      revealAll();
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting || entry.intersectionRatio > 0) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0
    });

    fadeElements.forEach(function (el) {
      observer.observe(el);
    });

    // Safety net: 2 seconds after the page has fully loaded, show anything
    // the observer has not revealed, so no content can stay hidden.
    function scheduleSafetyNet() {
      window.setTimeout(function () {
        observer.disconnect();
        revealAll();
      }, 2000);
    }

    if (document.readyState === 'complete') {
      scheduleSafetyNet();
    } else {
      window.addEventListener('load', scheduleSafetyNet);
    }
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
          // Formspree control fields (_gotcha honeypot, _subject) are never validated
          if (field.name && field.name.charAt(0) === '_') return;

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
        } else {
          trackLead(form);
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

  /* ---------- GA4 Lead Event ---------- */
  // Fires the generate_lead key event only once validation has passed, so
  // rejected submissions are not counted. Each lead form carries a
  // data-form-id attribute (quote_form on get-a-quote.html, contact_form on
  // contact.html). A filled-in honeypot means a bot, so it is not counted.
  function trackLead(form) {
    var formId = form.getAttribute('data-form-id');
    if (!formId || typeof gtag !== 'function') return;

    var honeypot = form.querySelector('input[name="_gotcha"]');
    if (honeypot && honeypot.value) return;

    gtag('event', 'generate_lead', { form_id: formId });
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
