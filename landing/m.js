/* DAIO — Viral Score Calculator & KYCE2IQ Mechanics */

(function() {
  'use strict';
  
  // KYCE2IQ-inspired Score Calculation
  // F = d × p × s
  // Then normalized to 0-1000
  
  const state = {
    d: 0,      // Direction (0, 0.5, 1)
    p: 150,    // Position (clients)
    s: 0,      // Sequence (asset types, 0-1)
    score: 0,
    badge: 'at-risk'
  };
  
  function init() {
    initCalculator();
    initCountdown();
    initCounters();
    initForm();
    initLangSwitch();
    initSmoothScroll();
  }
  
  // Viral Score Calculator
  function initCalculator() {
    const dSelect = document.getElementById('calc-d');
    const pRange = document.getElementById('calc-p');
    const pVal = document.getElementById('calc-p-val');
    const sChecks = document.querySelectorAll('.calc-s');
    const scoreDisplay = document.getElementById('score-display');
    const badgeDisplay = document.getElementById('score-badge');
    const rankDisplay = document.getElementById('rank-display');
    const shareBtn = document.getElementById('btn-share');
    const shareOpts = document.getElementById('share-options');
    
    if (!dSelect) return;
    
    function calculate() {
      // Get values
      state.d = parseFloat(dSelect.value);
      state.p = parseInt(pRange.value);
      
      // Calculate s (sum of checked boxes, max 1.0)
      let sSum = 0;
      sChecks.forEach(cb => {
        if (cb.checked) sSum += parseFloat(cb.value);
      });
      state.s = Math.min(sSum, 1.0);
      
      // KYCE2IQ F-Score formula: F = d × p × s
      // But p needs to be normalized (0-1)
      const pNormalized = Math.min(state.p / 500, 1.0); // 500 clients = max
      const fScore = state.d * pNormalized * state.s;
      
      // Convert to 0-1000 scale
      state.score = Math.round(fScore * 1000);
      
      // Determine badge (KYCE2IQ Shield Levels)
      if (state.score >= 850) {
        state.badge = 'bulletproof';
        badgeDisplay.textContent = '🛡️ Bulletproof';
        badgeDisplay.className = 'sc-badge bulletproof';
      } else if (state.score >= 650) {
        state.badge = 'fortress';
        badgeDisplay.textContent = '🔒 Fortress';
        badgeDisplay.className = 'sc-badge fortress';
      } else {
        state.badge = 'at-risk';
        badgeDisplay.textContent = '⚠️ At Risk';
        badgeDisplay.className = 'sc-badge at-risk';
      }
      
      // Update display
      scoreDisplay.textContent = state.score;
      pVal.textContent = state.p;
      
      // Calculate rank (simulated percentile)
      const rank = calculateRank(state.score);
      rankDisplay.textContent = rank;
      
      // Enable sharing if score > 0
      if (state.score > 0) {
        shareBtn.disabled = false;
        shareBtn.innerHTML = '🚀 Share My Score';
        shareBtn.onclick = () => {
          shareOpts.style.display = 'block';
          shareBtn.style.display = 'none';
        };
      }
      
      // Update form hidden fields
      const formScore = document.getElementById('form-score');
      const formBadge = document.getElementById('form-badge');
      if (formScore) formScore.value = state.score;
      if (formBadge) formBadge.value = state.badge;
      
      // Update hero badge
      updateHeroBadge();
    }
    
    // Event listeners
    dSelect.addEventListener('change', calculate);
    pRange.addEventListener('input', calculate);
    sChecks.forEach(cb => cb.addEventListener('change', calculate));
    
    // Initial calc
    calculate();
  }
  
  function calculateRank(score) {
    // Simulated distribution based on KYCE2IQ principles
    // Only 3% score > 700
    // 15% score > 500
    // 40% score > 300
    if (score >= 850) return 'Top 1%';
    if (score >= 700) return 'Top 3%';
    if (score >= 500) return 'Top 15%';
    if (score >= 300) return 'Top 40%';
    if (score >= 100) return 'Top 65%';
    return 'Top 87%';
  }
  
  function updateHeroBadge() {
    const heroBadge = document.getElementById('hero-badge');
    if (!heroBadge) return;
    
    if (state.score >= 850) {
      heroBadge.innerHTML = '<span class="bp-s">🏆</span><span class="bp-t">Bulletproof</span>';
      heroBadge.style.background = 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)';
    } else if (state.score >= 650) {
      heroBadge.innerHTML = '<span class="bp-s">🔒</span><span class="bp-t">Fortress</span>';
      heroBadge.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
    } else {
      heroBadge.innerHTML = '<span class="bp-s">⚠️</span><span class="bp-t">At Risk</span>';
      heroBadge.style.background = 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)';
    }
  }
  
  // Sharing Functions
  window.share = function(platform) {
    const url = `https://daio.back2iq.com/?ref=score&score=${state.score}&badge=${state.badge}`;
    const text = `My Digital Estate Score: ${state.score}/1000 (${calculateRank(state.score)})\nHow does your estate infrastructure rank?`;
    
    if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    }
    
    // Track share
    trackEvent('share', { platform, score: state.score, badge: state.badge });
  };
  
  window.copyLink = function() {
    const url = `https://daio.back2iq.com/?ref=score&score=${state.score}&badge=${state.badge}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copied to clipboard!');
    });
    trackEvent('copy_link', { score: state.score });
  };
  
  window.sendChallenge = function() {
    const ref1 = document.getElementById('ref1')?.value;
    const ref2 = document.getElementById('ref2')?.value;
    
    if (!ref1 && !ref2) {
      alert('Please enter at least one email address.');
      return;
    }
    
    // In production: Send to backend
    alert(`Challenge sent!\n\nWhen they complete the assessment, you'll unlock the "Network Guardian" badge (+50 score bonus).`);
    
    trackEvent('send_challenge', { ref1: !!ref1, ref2: !!ref2 });
  };
  
  // Viral Counters
  function initCounters() {
    // Animate counters
    animateCounter('bulletproof-counter', 1247, 2000);
    animateCounter('atrisk-counter', 4.2, 2000, true); // true = decimal
  }
  
  function animateCounter(id, target, duration, isDecimal = false) {
    const el = document.getElementById(id);
    if (!el) return;
    
    const start = 0;
    const startTime = performance.now();
    
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = start + (target - start) * ease;
      
      if (isDecimal) {
        el.textContent = '€' + current.toFixed(1) + 'B';
      } else {
        el.textContent = Math.floor(current).toLocaleString();
      }
      
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    
    requestAnimationFrame(update);
  }
  
  // Countdown Timer
  function initCountdown() {
    const daysEl = document.getElementById('challenge-days');
    if (!daysEl) return;
    
    // Random but consistent countdown
    let days = 47;
    
    function update() {
      daysEl.textContent = days;
      if (days > 0) {
        // Slow countdown for effect
        setTimeout(() => {
          days--;
          update();
        }, 86400000); // Once per day in reality, here just static
      }
    }
    
    update();
  }
  
  // Form Handling
  function initForm() {
    const form = document.getElementById('nda-form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const btn = form.querySelector('button[type="submit"]');
      const data = {
        fullName: form.fullName.value,
        email: form.email.value,
        company: form.company.value,
        score: state.score,
        badge: state.badge,
        timestamp: new Date().toISOString()
      };
      
      btn.disabled = true;
      btn.textContent = 'Joining Challenge...';
      
      fetch('/api/nda-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      .then(r => {
        if (r.ok) {
          form.innerHTML = `
            <div style="text-align:center;padding:3rem;">
              <h3 style="color:#22c55e;margin-bottom:1rem;">🎯 Challenge Accepted!</h3>
              <p style="color:#9ca3af;margin-bottom:1rem;">Your starting score: <strong>${state.score}</strong></p>
              <p style="color:#c9a227;font-size:1.25rem;">Goal: Reach 850+ in 90 days</p>
              <p style="color:#6b7280;font-size:0.875rem;margin-top:1rem;">Check your email for the NDA and onboarding details.</p>
            </div>
          `;
          trackEvent('challenge_accepted', { score: state.score, badge: state.badge });
        } else {
          throw new Error('Server error');
        }
      })
      .catch(() => {
        btn.disabled = false;
        btn.textContent = 'Start Bulletproof Challenge';
        alert('Error. Please contact daio@back2iq.com');
      });
    });
  }
  
  // Analytics / Tracking
  function trackEvent(event, data) {
    // In production: Send to analytics
    console.log('Event:', event, data);
    
    // Could be replaced with proper analytics
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event, data, timestamp: new Date().toISOString() })
    }).catch(() => {});
  }
  
  // Language Switch
  function initLangSwitch() {
    const btn = document.getElementById('lang-switch');
    if (!btn) return;
    
    btn.addEventListener('click', () => {
      // Simple reload for now - in production would switch without reload
      const current = document.documentElement.lang;
      const next = current === 'en' ? 'de' : 'en';
      alert(`Switching to ${next === 'de' ? 'German' : 'English'}... (Full i18n in production)`);
    });
  }
  
  // Smooth Scroll
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const nav = document.querySelector('.n');
          const navH = nav ? nav.offsetHeight : 0;
          const pos = target.getBoundingClientRect().top + window.pageYOffset - navH;
          window.scrollTo({ top: pos, behavior: 'smooth' });
        }
      });
    });
  }
  
  // Check for referral parameters
  function checkReferral() {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    const score = params.get('score');
    const badge = params.get('badge');
    
    if (ref === 'score' && score) {
      // Show welcome back message
      console.log('Referred user with score:', score, badge);
    }
  }
  
  // Universal Digital Asset Loss Ticker (LIVE via Worker API)
  async function initBtcTicker() {
    // Verlust-Daten nach Kategorie
    const ASSETS = {
      // Live von API
      crypto: {
        coins: {
          bitcoin: { lost: 3700000, dailyLoss: 4.2 },
          ethereum: { lost: 24000000, dailyLoss: 28 },
          solana: { lost: 80000000, dailyLoss: 95 }
        },
        baseValue: 220000000000, // Fallback
        dailyLoss: 127000000 // ~€127M pro Tag
      },
      // Statische Schätzungen (können erweitert werden)
      gaming: {
        baseValue: 85000000000,
        dailyLoss: 23000000 // Skins, Items, etc.
      },
      social: {
        baseValue: 120000000000,
        dailyLoss: 33000000 // Monetized accounts
      },
      business: {
        baseValue: 200000000000,
        dailyLoss: 55000000 // SaaS, Domains, etc.
      },
      cloud: {
        baseValue: 95000000000,
        dailyLoss: 26000000 // Subscriptions, data
      },
      creative: {
        baseValue: 80000000000,
        dailyLoss: 22000000 // Royalties, IP
      }
    };
    
    const totalLostEl = document.getElementById('total-lost-value');
    const perSecEl = document.getElementById('total-per-sec');
    
    if (!totalLostEl) return;
    
    let cryptoPrices = {};
    let microOffset = 0;
    
    // Crypto Preise vom Worker holen
    async function fetchCryptoPrices() {
      try {
        const res = await fetch('/api/crypto-prices');
        if (res.ok) {
          const data = await res.json();
          cryptoPrices = data.coins || {};
          updateDisplay();
        }
      } catch (e) {
        console.log('Price fetch failed');
      }
    }
    
    function updateDisplay() {
      let totalValue = 0;
      let totalPerSecond = 0;
      
      // Crypto berechnen (live)
      let cryptoValue = 0;
      for (const [key, coin] of Object.entries(ASSETS.crypto.coins)) {
        const price = cryptoPrices[key]?.price?.eur || 0;
        if (price > 0) {
          cryptoValue += coin.lost * price;
        } else {
          // Fallback auf geschätzten Wert anteilig
          cryptoValue += ASSETS.crypto.baseValue / 3;
        }
      }
      
      // Crypto DOM updaten
      const cryptoValueEl = document.getElementById('crypto-value');
      if (cryptoValueEl) {
        cryptoValueEl.textContent = '€' + Math.floor(cryptoValue).toLocaleString('de-DE');
      }
      
      totalValue += cryptoValue;
      totalPerSecond += ASSETS.crypto.dailyLoss / 86400;
      
      // Andere Kategorien (statisch, aber mit kleiner Variation für Animation)
      for (const [key, asset] of Object.entries(ASSETS)) {
        if (key === 'crypto') continue;
        
        totalValue += asset.baseValue;
        totalPerSecond += asset.dailyLoss / 86400;
        
        // DOM updaten
        const valueEl = document.getElementById(`${key}-value`);
        if (valueEl) {
          valueEl.textContent = '€' + Math.floor(asset.baseValue).toLocaleString('de-DE');
        }
      }
      
      // Gesamtwert anzeigen (ohne microOffset für init)
      if (totalLostEl) {
        totalLostEl.textContent = '€' + Math.floor(totalValue).toLocaleString('de-DE') + '+';
      }
      if (perSecEl) {
        perSecEl.textContent = '€' + Math.floor(totalPerSecond).toLocaleString('de-DE');
      }
      
      return totalPerSecond;
    }
    
    // Initial fetch
    await fetchCryptoPrices();
    const basePerSecond = updateDisplay() || 25347; // Fallback: ~€25k/sec
    
    // Crypto Preise alle 60s aktualisieren
    setInterval(fetchCryptoPrices, 60000);
    
    // Animation alle 100ms
    setInterval(() => {
      microOffset += basePerSecond * 0.1; // 100ms = 0.1s
      
      // Berechne aktuellen Crypto-Wert
      let currentCryptoValue = 0;
      for (const [key, coin] of Object.entries(ASSETS.crypto.coins)) {
        const price = cryptoPrices[key]?.price?.eur || 0;
        if (price > 0) {
          currentCryptoValue += coin.lost * price;
        } else {
          currentCryptoValue += ASSETS.crypto.baseValue / 3;
        }
      }
      
      // Addiere statische Werte + Micro-Offset
      const staticValue = Object.values(ASSETS).reduce((sum, asset) => {
        if (asset.baseValue && asset !== ASSETS.crypto) return sum + asset.baseValue;
        return sum;
      }, 0);
      
      const currentTotal = currentCryptoValue + staticValue + microOffset;
      
      if (totalLostEl) {
        totalLostEl.textContent = '€' + Math.floor(currentTotal).toLocaleString('de-DE') + '+';
      }
    }, 100);
  }
  
  // Start BTC Ticker
  initBtcTicker();

  // Initialize
  init();
  checkReferral();
  
})();
