/**
 * Scroll-Progress-Rail: Ticks, Section-Marker, Labels und Live-Cursor.
 * Wartet auf das Event "partials:loaded", da die Sections erst dann existieren.
 */
(function () {
  'use strict';

  function init() {
    const rail      = document.getElementById('rail');
    const cursor    = document.getElementById('cursor');
    const cursorNum = document.getElementById('cursorNum');
    if (!rail || !cursor) return;

    const TICK_GAP  = 10;   // px zwischen Hintergrund-Ticks
    const LABEL_OFF = -6;   // vertikaler Versatz des Labels
    const sections  = Array.from(document.querySelectorAll('section[data-rail-label]'));
    let labels = [], railH = 0;

    function buildTicks() {
      rail.querySelectorAll('.tick').forEach(n => n.remove());
      railH = rail.clientHeight;
      const frag  = document.createDocumentFragment();
      const count = Math.floor(railH / TICK_GAP);

      for (let i = 0; i <= count; i++) {
        const y = i * TICK_GAP;
        const tick = document.createElement('div');
        tick.className = 'tick';
        tick.style.setProperty('--position', y + 'px');
        tick.dataset.dim = (i === 0) ? 'true' : 'false';
        tick.innerHTML = '<div class="tick-line"></div><div class="tick-hit"></div>';

        tick.addEventListener('click', () => {
          const frac = y / railH;
          const max  = document.documentElement.scrollHeight - window.innerHeight;
          window.scrollTo({ top: frac * max, behavior: 'smooth' });
        });
        frag.appendChild(tick);
      }
      rail.insertBefore(frag, cursor);
    }

    function buildLabels() {
      rail.querySelectorAll('.marker, .rail-label').forEach(n => n.remove());
      labels = [];
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;

      sections.forEach((sec, i) => {
        const frac   = Math.min(sec.offsetTop / max, 1);
        const y      = frac * railH;
        const indent = (i % 2 === 0) ? 16 : 12;

        const marker = document.createElement('div');
        marker.className = 'marker';
        marker.style.setProperty('--yPosition', y + 'px');
        marker.style.setProperty('--indent', indent + 'px');
        rail.insertBefore(marker, cursor);

        const label = document.createElement('div');
        label.className = 'rail-label';
        label.style.setProperty('--yPosition', (y + LABEL_OFF) + 'px');
        label.style.setProperty('--indent', (indent + 20) + 'px');
        label.style.transitionDelay = (i * 50) + 'ms';
        label.innerHTML = '<a href="#' + sec.id + '">' + sec.dataset.railLabel + '</a>';
        label.dataset.section = sec.id;
        rail.insertBefore(label, cursor);
        labels.push(label);
      });
    }

    function update() {
      const max  = document.documentElement.scrollHeight - window.innerHeight;
      const frac = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;

      cursor.style.top = (frac * railH) + 'px';
      if (cursorNum) cursorNum.textContent = frac.toFixed(2);

      const mid = window.scrollY + window.innerHeight * 0.35;
      let activeId = sections.length ? sections[0].id : null;
      sections.forEach(s => { if (s.offsetTop <= mid) activeId = s.id; });
      labels.forEach(l => { l.dataset.active = String(l.dataset.section === activeId); });
    }

    function rebuild() { buildTicks(); buildLabels(); update(); }

    let raf = null;
    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(() => { update(); raf = null; });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', rebuild);
    if ('ResizeObserver' in window) new ResizeObserver(rebuild).observe(document.body);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(rebuild);
    rebuild();
  }

  document.addEventListener('partials:loaded', init);
})();