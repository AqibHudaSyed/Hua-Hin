// PHO KAEW MASSAGE — Main JS

// ---- NAV scroll ----
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
  updateScrollButtons();
}, { passive: true });

// ---- Mobile nav toggle ----
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle?.addEventListener('click', () => {
  navToggle.classList.toggle('open');
  navLinks.classList.toggle('open');
});
navLinks?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navToggle.classList.remove('open');
    navLinks.classList.remove('open');
  });
});

// ============================================
//  FLOATING BUTTONS (Go to Top + Call Us)
// ============================================
function createFloatingButtons() {
  const wrap = document.createElement('div');
  wrap.className = 'floating-btns';
  wrap.innerHTML = `
    <a href="tel:+66818796538" class="float-btn float-call" title="Call Us" aria-label="Call Us">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
    </a>
    <button class="float-btn float-top" id="floatTop" title="Go to Top" aria-label="Go to top">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
    </button>
  `;
  document.body.appendChild(wrap);
  document.getElementById('floatTop').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}
createFloatingButtons();

function updateScrollButtons() {
  const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight);
  const show = pct > 0.75;
  document.querySelector('.floating-btns')?.classList.toggle('visible', show);
}

// ============================================
//  LIGHTBOX with focal zoom
// ============================================
let lightboxImages = [];
let lightboxIndex = 0;
let lightboxScale = 1;
let lightboxOffsetX = 0;
let lightboxOffsetY = 0;
let lbIsDragging = false;
let lbDragStart = { x: 0, y: 0, ox: 0, oy: 0 };
let lbPinchDist = 0;

function createLightbox() {
  const lb = document.createElement('div');
  lb.id = 'lightbox';
  lb.innerHTML = `
    <div class="lb-overlay"></div>
    <button class="lb-close" aria-label="Close">✕</button>
    <button class="lb-nav lb-prev" aria-label="Previous">&#8592;</button>
    <button class="lb-nav lb-next" aria-label="Next">&#8594;</button>
    <div class="lb-img-wrap" id="lbImgWrap">
      <img id="lbImg" src="" alt="" draggable="false" />
    </div>
    <div class="lb-zoom-controls">
      <button class="lb-zoom-btn" id="lbZoomIn" title="Zoom In">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
      </button>
      <button class="lb-zoom-btn" id="lbZoomOut" title="Zoom Out">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
      </button>
      <button class="lb-zoom-btn" id="lbReset" title="Reset View">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
      </button>
    </div>
    <div class="lb-counter" id="lbCounter"></div>
  `;
  document.body.appendChild(lb);

  const img = document.getElementById('lbImg');
  const wrap = document.getElementById('lbImgWrap');
  const counter = document.getElementById('lbCounter');

  function applyTransform() {
    img.style.transform = `translate(${lightboxOffsetX}px, ${lightboxOffsetY}px) scale(${lightboxScale})`;
  }

  function resetTransform() {
    lightboxScale = 1;
    lightboxOffsetX = 0;
    lightboxOffsetY = 0;
    applyTransform();
  }

  function zoomAt(cx, cy, newScale) {
    // cx, cy are relative to wrap center
    const clampedScale = Math.min(Math.max(newScale, 0.5), 5);
    const ratio = clampedScale / lightboxScale;
    // adjust offset so zoom is centred on cursor
    lightboxOffsetX = cx + (lightboxOffsetX - cx) * ratio;
    lightboxOffsetY = cy + (lightboxOffsetY - cy) * ratio;
    lightboxScale = clampedScale;
    applyTransform();
  }

  function updateLightbox() {
    img.src = lightboxImages[lightboxIndex];
    counter.textContent = (lightboxIndex + 1) + ' / ' + lightboxImages.length;
    resetTransform();
  }

  function openLightbox(images, index) {
    lightboxImages = images;
    lightboxIndex = index;
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
    updateLightbox();
  }

  function closeLightbox() {
    lb.classList.remove('active');
    document.body.style.overflow = '';
  }

  lb.querySelector('.lb-close').addEventListener('click', closeLightbox);
  lb.querySelector('.lb-overlay').addEventListener('click', closeLightbox);

  lb.querySelector('.lb-prev').addEventListener('click', () => {
    lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
    updateLightbox();
  });
  lb.querySelector('.lb-next').addEventListener('click', () => {
    lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
    updateLightbox();
  });

  document.getElementById('lbZoomIn').addEventListener('click', () => zoomAt(0, 0, lightboxScale + 0.5));
  document.getElementById('lbZoomOut').addEventListener('click', () => zoomAt(0, 0, lightboxScale - 0.5));
  document.getElementById('lbReset').addEventListener('click', resetTransform);

  // Mouse wheel zoom — focal point at cursor
  wrap.addEventListener('wheel', (e) => {
    if (!lb.classList.contains('active')) return;
    e.preventDefault();
    const rect = wrap.getBoundingClientRect();
    const cx = e.clientX - rect.left - rect.width / 2;
    const cy = e.clientY - rect.top - rect.height / 2;
    const delta = e.deltaY < 0 ? 0.2 : -0.2;
    zoomAt(cx, cy, lightboxScale + delta);
  }, { passive: false });

  // Mouse drag to pan
  wrap.addEventListener('mousedown', (e) => {
    if (lightboxScale <= 1) return;
    lbIsDragging = true;
    lbDragStart = { x: e.clientX, y: e.clientY, ox: lightboxOffsetX, oy: lightboxOffsetY };
    wrap.style.cursor = 'grabbing';
  });
  window.addEventListener('mousemove', (e) => {
    if (!lbIsDragging) return;
    lightboxOffsetX = lbDragStart.ox + (e.clientX - lbDragStart.x);
    lightboxOffsetY = lbDragStart.oy + (e.clientY - lbDragStart.y);
    applyTransform();
  });
  window.addEventListener('mouseup', () => {
    lbIsDragging = false;
    wrap.style.cursor = lightboxScale > 1 ? 'grab' : 'default';
  });

  // Keyboard nav
  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft' && lightboxScale <= 1) { lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length; updateLightbox(); }
    if (e.key === 'ArrowRight' && lightboxScale <= 1) { lightboxIndex = (lightboxIndex + 1) % lightboxImages.length; updateLightbox(); }
  });

  // Touch pinch zoom with focal point
  let lbTouches = [];
  wrap.addEventListener('touchstart', (e) => {
    lbTouches = Array.from(e.touches);
    if (e.touches.length === 2) {
      lbPinchDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    } else if (e.touches.length === 1) {
      lbDragStart = { x: e.touches[0].clientX, y: e.touches[0].clientY, ox: lightboxOffsetX, oy: lightboxOffsetY };
    }
  }, { passive: true });

  wrap.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const rect = wrap.getBoundingClientRect();
      const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left - rect.width / 2;
      const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top - rect.height / 2;
      const newScale = lightboxScale * (dist / lbPinchDist);
      zoomAt(midX, midY, newScale);
      lbPinchDist = dist;
    } else if (e.touches.length === 1 && lightboxScale > 1) {
      lightboxOffsetX = lbDragStart.ox + (e.touches[0].clientX - lbDragStart.x);
      lightboxOffsetY = lbDragStart.oy + (e.touches[0].clientY - lbDragStart.y);
      applyTransform();
    }
  }, { passive: false });

  // Swipe to change image (only when not zoomed)
  let lbSwipeX = 0;
  wrap.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) lbSwipeX = e.touches[0].clientX;
  }, { passive: true });
  wrap.addEventListener('touchend', (e) => {
    if (lightboxScale > 1) return;
    const diff = lbSwipeX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 60) {
      lightboxIndex = diff > 0
        ? (lightboxIndex + 1) % lightboxImages.length
        : (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
      updateLightbox();
    }
  });

  return openLightbox;
}

const openLightbox = createLightbox();

// ============================================
//  GALLERY SLIDER — faster auto-slide + new images
// ============================================
function initGallerySlider() {
  const track = document.getElementById('sliderTrack');
  if (!track) return;

  const slides = track.querySelectorAll('.slide');
  const dotsContainer = document.getElementById('sliderDots');
  const galleryImages = Array.from(slides).map(s => s.querySelector('img').src);
  let current = 0;
  let autoTimer = null;
  let isHovered = false;

  function getSPV() {
    return window.innerWidth <= 600 ? 1 : window.innerWidth <= 900 ? 2 : 3;
  }
  let spv = getSPV();
  let maxIndex = slides.length - spv;

  function buildDots() {
    dotsContainer.innerHTML = '';
    spv = getSPV();
    maxIndex = slides.length - spv;
    for (let i = 0; i <= maxIndex; i++) {
      const dot = document.createElement('button');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    }
  }
  buildDots();

  function goTo(idx) {
    current = Math.max(0, Math.min(idx, maxIndex));
    const pct = (100 / spv) * current;
    track.style.transform = `translateX(-${pct}%)`;
    dotsContainer?.querySelectorAll('.dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => {
      if (!isHovered) goTo(current < maxIndex ? current + 1 : 0);
    }, 1800); // faster: 1.8s
  }

  const sliderWrap = track.closest('.slider-wrap') || track.parentElement.parentElement;
  sliderWrap.addEventListener('mouseenter', () => { isHovered = true; });
  sliderWrap.addEventListener('mouseleave', () => { isHovered = false; });

  document.querySelector('.slider-prev')?.addEventListener('click', () => goTo(current - 1));
  document.querySelector('.slider-next')?.addEventListener('click', () => goTo(current + 1));

  slides.forEach((slide, i) => {
    slide.style.cursor = 'pointer';
    slide.addEventListener('click', () => openLightbox(galleryImages, i));
  });

  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(current + (diff > 0 ? 1 : -1));
  });

  window.addEventListener('resize', () => { buildDots(); goTo(0); });
  goTo(0);
  startAuto();
}

// ============================================
//  REVIEWS SLIDER — fixed alignment + faster
// ============================================
function initReviewsSlider() {
  const track = document.getElementById('reviewsTrack');
  if (!track) return;

  const cards = Array.from(track.querySelectorAll('.review-card'));
  const dotsContainer = document.getElementById('reviewDots');
  let current = 0;
  let autoTimer = null;
  let isHovered = false;

  function getSPV() {
    return window.innerWidth <= 600 ? 1 : window.innerWidth <= 900 ? 2 : 3;
  }
  let spv = getSPV();
  let maxIndex = Math.max(0, cards.length - spv);

  function getCardWidth() {
    return cards[0].getBoundingClientRect().width + 16;
  }

  function buildDots() {
    dotsContainer.innerHTML = '';
    spv = getSPV();
    maxIndex = Math.max(0, cards.length - spv);
    for (let i = 0; i <= maxIndex; i++) {
      const dot = document.createElement('button');
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    }
  }
  buildDots();

  function goTo(idx) {
    current = Math.max(0, Math.min(idx, maxIndex));
    const w = getCardWidth();
    track.style.transform = `translateX(-${current * w}px)`;
    dotsContainer?.querySelectorAll('.dot').forEach((d, i) => d.classList.toggle('active', i === current));
    cards.forEach((c, i) => c.classList.toggle('visible', i >= current && i < current + spv));
  }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => {
      if (!isHovered) goTo(current < maxIndex ? current + 1 : 0);
    }, 2200); // faster: 2.2s
  }

  const revWrap = track.closest('.reviews-slider-wrap') || track.parentElement.parentElement;
  revWrap.addEventListener('mouseenter', () => { isHovered = true; });
  revWrap.addEventListener('mouseleave', () => { isHovered = false; });

  document.querySelector('.rev-prev')?.addEventListener('click', () => goTo(current - 1));
  document.querySelector('.rev-next')?.addEventListener('click', () => goTo(current + 1));

  let startX = 0;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(current + (diff > 0 ? 1 : -1));
  });

  window.addEventListener('resize', () => { buildDots(); goTo(0); });
  goTo(0);
  startAuto();
}

initGallerySlider();
initReviewsSlider();

// ---- Fade-in on scroll ----
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.service-card, .treatment-card, .contact-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// ============================================================
// FULLY DYNAMIC GOOGLE SHEETS ENGINE (AUTO ROW ADD/REMOVE)
// ============================================================

const RANDOM_TIME = new Date().getTime();
const SHEET_API_URL = `https://docs.google.com/spreadsheets/d/1MPwqE6CKjFnKGNRQvDCMfwxqVkw1u6al-aNokKYhZ4M/gviz/tq?tqx=out:json&cache_bust=${RANDOM_TIME}`;

async function loadDynamicServices() {
  const tableBody = document.getElementById('dynamic-services-body');
  if (!tableBody) return;

  try {
    const response = await fetch(SHEET_API_URL);
    const text = await response.text();
    
    const jsonString = text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1);
    const jsonResult = JSON.parse(jsonString);
    
    const rows = jsonResult.table.rows;
    let htmlContent = '';
    let isHighlight = false; // Alternating rows ke premium design ke liye

    rows.forEach(row => {
      const id = row.c[0] ? row.c[0].v : null;
      const rawTreatment = row.c[1] ? row.c[1].v : '';
      const p1 = row.c[2] ? row.c[2].v : '—';
      const p15 = row.c[3] ? row.c[3].v : '—';

      // Agar ID 'id' (header) hai ya poori row khali hai, toh skip karo
      if (!id || id === 'id') return;

      // Body Scrub ke liye special static handle (Kyunki isme call option hai)
      if (id === 'body_scrub' || id === 'scrub') {
        htmlContent += `
          <tr class="${isHighlight ? 'highlight' : ''}">
            <td>
              <span class="th-name">สครับผิว</span>
              <span class="en-name">Body Scrub</span>
            </td>
            <td colspan="2" class="ask-price">
              <a href="tel:+66818796538" style="color:var(--gold);text-decoration:none;font-weight:600;">📞 Call Us for Pricing</a>
            </td>
          </tr>
        `;
        isHighlight = !isHighlight;
        return;
      }

      // Baaki normal massages ke liye Thai aur English name ko '+' ya break points se split karna
      // Client sheet me bas aise likhegi: "นวดไทย / Thai Massage" ya "นวดไทย + ยาหม่อง / Thai Massage + Balm"
      let thaiName = rawTreatment;
      let engName = '';
      
      if (rawTreatment.includes('/')) {
        const parts = rawTreatment.split('/');
        thaiName = parts[0].trim();
        engName = parts[1].trim();
      } else {
        // Agar galti se client ne sirf ek hi naam likha slash (/) ke bina
        thaiName = rawTreatment;
        engName = id.replace('_', ' ').toUpperCase(); 
      }

      // Ek naya dynamic Row framework taiyar karna
      htmlContent += `
        <tr class="${isHighlight ? 'highlight' : ''}">
          <td>
            <span class="th-name">${thaiName}</span>
            <span class="en-name">${engName}</span>
          </td>
          <td>${p1 !== '—' && typeof p1 === 'number' ? '฿' + p1 : p1}</td>
          <td>${p15 !== '—' && typeof p15 === 'number' ? '฿' + p15 : p15}</td>
        </tr>
      `;

      isHighlight = !isHighlight; // Agli row ka background color badalne ke liye
    });

    // Khali table me saara dynamic content ek baar me inject karna
    tableBody.innerHTML = htmlContent;

  } catch (error) {
    console.warn("Dynamic Sync failed, showing error message.", error);
    tableBody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:red;">Unable to load pricing. Please try again later.</td></tr>`;
  }
}

window.addEventListener('DOMContentLoaded', loadDynamicServices);