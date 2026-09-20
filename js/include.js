/**
 * Minimaler HTML-Include-Loader.
 * Ersetzt jedes <div data-include="pfad.html"> durch den Inhalt der Datei.
 * Feuert am Ende das Event "partials:loaded" auf document.
 */
(function () {
  'use strict';

  async function loadPartial(host) {
    const url = host.getAttribute('data-include');
    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
      const html = await res.text();

      const tpl = document.createElement('template');
      tpl.innerHTML = html.trim();
      host.replaceWith(tpl.content);
    } catch (err) {
      console.error('[include] Failed to load "' + url + '":', err);
      host.innerHTML =
        '<p style="color:#b91c1c;font:14px/1.6 monospace">' +
        'Could not load ' + url + ' — serve the page over http://, not file://.</p>';
    }
  }

  async function run() {
    const hosts = Array.from(document.querySelectorAll('[data-include]'));
    // sequentiell, damit die Dokumentreihenfolge stabil bleibt
    for (const host of hosts) await loadPartial(host);

    const y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();

    document.dispatchEvent(new CustomEvent('partials:loaded'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();