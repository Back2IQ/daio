/* DAIO — Digital Estate Loss Clock
   Live ticker + form handler
   Author: Deniz Kiran / Back2IQ
   License: CC BY-NC-SA 4.0 */

(function () {
  'use strict';

  // ============ ASSET DATA ============
  // Sources: Chainalysis 2023 (crypto), Cerulli/BCG (projections),
  // industry estimates (gaming, social, business). Illustrative.
  const ASSETS = {
    crypto: {
      baseValue: 220e9,
      dailyLoss: 127e6,
      coins: {
        bitcoin:  { lost: 3700000 },
        ethereum: { lost: 24000000 },
        solana:   { lost: 80000000 }
      }
    },
    gaming:      { baseValue: 85e9,  dailyLoss: 23e6 },
    social:      { baseValue: 120e9, dailyLoss: 33e6 },
    business:    { baseValue: 200e9, dailyLoss: 55e6 },
    cloud:       { baseValue: 95e9,  dailyLoss: 26e6 },
    creative:    { baseValue: 80e9,  dailyLoss: 22e6 },
    communities: { baseValue: 15e9,  dailyLoss: 4e6 },
    loyalty:     { baseValue: 25e9,  dailyLoss: 7e6 }
  };

  // ============ HELPERS ============

  function formatEur(n) {
    return '\u20AC' + Math.floor(n).toLocaleString('de-DE');
  }

  function animateCounter(el, target, duration) {
    var start = performance.now();
    var from = 0;
    function step(now) {
      var t = Math.min((now - start) / duration, 1);
      var ease = 1 - Math.pow(1 - t, 3); // ease-out cubic
      el.textContent = formatEur(from + (target - from) * ease);
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ============ LIVE TICKER ============

  var cryptoPrices = null;
  var tickerInterval = null;
  var totalBase = 0;

  // Calculate base total from all categories
  Object.keys(ASSETS).forEach(function (k) { totalBase += ASSETS[k].baseValue; });

  var totalDailyLoss = 0;
  Object.keys(ASSETS).forEach(function (k) { totalDailyLoss += ASSETS[k].dailyLoss; });

  var perSecondLoss = totalDailyLoss / 86400;

  async function fetchCryptoPrices() {
    try {
      var r = await fetch('/api/crypto-prices');
      if (r.ok) {
        var data = await r.json();
        if (data && data.coins) cryptoPrices = data.coins;
      }
    } catch (_) { /* fallback to baseValue */ }
  }

  function getCryptoValue() {
    if (!cryptoPrices) return ASSETS.crypto.baseValue;
    var val = 0;
    var coins = ASSETS.crypto.coins;
    Object.keys(coins).forEach(function (coin) {
      var price = cryptoPrices[coin] && cryptoPrices[coin].price
        ? cryptoPrices[coin].price.eur
        : null;
      if (price) {
        val += coins[coin].lost * price;
      } else {
        val += ASSETS.crypto.baseValue / 3;
      }
    });
    return val;
  }

  function computeTotal() {
    var total = getCryptoValue();
    Object.keys(ASSETS).forEach(function (k) {
      if (k !== 'crypto') total += ASSETS[k].baseValue;
    });
    return total;
  }

  function initTicker() {
    var totalEl = document.getElementById('total-value');
    var perSecEl = document.getElementById('per-sec-value');
    var cryptoEl = document.getElementById('crypto-value');

    // Initial count-up animation
    if (totalEl) animateCounter(totalEl, totalBase, 2000);
    if (perSecEl) perSecEl.textContent = formatEur(perSecondLoss);

    // Fetch live crypto prices
    fetchCryptoPrices().then(function () {
      var liveTotal = computeTotal();
      if (totalEl) totalEl.textContent = formatEur(liveTotal);
      if (cryptoEl) cryptoEl.textContent = formatEur(getCryptoValue());
    });

    // Re-fetch every 60s
    setInterval(function () {
      fetchCryptoPrices().then(function () {
        if (cryptoEl) cryptoEl.textContent = formatEur(getCryptoValue());
      });
    }, 60000);

    // Live micro-tick every 100ms — total value creeps up
    var microOffset = 0;
    tickerInterval = setInterval(function () {
      microOffset += perSecondLoss * 0.1;
      var live = computeTotal() + microOffset;
      if (totalEl) totalEl.textContent = formatEur(live);
    }, 100);
  }

  // ============ LOSS REASON BARS ============

  function initBars() {
    var fills = document.querySelectorAll('.lr-fill[data-h]');
    if (!fills.length) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var pct = parseInt(entry.target.getAttribute('data-h'), 10);
          entry.target.style.height = (pct * 3) + 'px'; // 31% → 93px
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    fills.forEach(function (el) {
      el.style.height = '0';
      observer.observe(el);
    });
  }

  // ============ FORM ============

  function initForm() {
    var form = document.getElementById('nda-form');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      var origText = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Sending...';

      // Remove previous error
      var prevErr = form.querySelector('.co-err');
      if (prevErr) prevErr.remove();

      try {
        var payload = {
          fullName: form.fullName.value.trim(),
          email: form.email.value.trim(),
          company: form.company.value.trim(),
          timestamp: new Date().toISOString()
        };

        var r = await fetch('/api/nda-request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (r.ok) {
          form.innerHTML = '<div class="co-ok">Thank you. We will be in touch within 48 hours.</div>';
          trackEvent('introduction_requested', { email: payload.email });
        } else {
          throw new Error('Server error');
        }
      } catch (_) {
        btn.disabled = false;
        btn.textContent = origText;
        var err = document.createElement('p');
        err.className = 'co-err';
        err.textContent = 'Something went wrong. Please try again or contact dk@back2iq.com.tr directly.';
        form.appendChild(err);
      }
    });
  }

  // ============ SMOOTH SCROLL ============

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = this.getAttribute('href');
        if (id.length < 2) return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        var nav = document.querySelector('.n');
        var offset = nav ? nav.offsetHeight + 16 : 80;
        window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });

        // Close mobile nav if open
        var navLinks = document.getElementById('nav-links');
        if (navLinks) navLinks.classList.remove('open');
      });
    });
  }

  // ============ MOBILE NAV ============

  function initMobileNav() {
    var toggle = document.getElementById('nav-toggle');
    var links = document.getElementById('nav-links');
    if (!toggle || !links) return;

    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });
  }

  // ============ ANALYTICS ============

  function trackEvent(event, data) {
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: event, data: data, ts: new Date().toISOString() })
    }).catch(function () {});
  }

  // ============ INIT ============

  function init() {
    initTicker();
    initBars();
    initForm();
    initSmoothScroll();
    initMobileNav();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
