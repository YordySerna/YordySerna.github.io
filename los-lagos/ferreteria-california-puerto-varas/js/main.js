/* ══════════════════════════════════════════════════════════════════
   FERRETERÍA CALIFORNIA · Av. Colón, Puerto Varas — demo CristalWeb
   JS clásico, un IIFE, sin dependencias.

   Sin JavaScript la página se lee entera: el plano del local es SVG
   escrito en el HTML, las tres tablas de mostrador son listas y la
   temporada es una lista de meses. El JS sólo agrega las apariciones
   al scroll y arma el mensaje de la consulta.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  clearTimeout(window.__rescate);

  var reduce = window.matchMedia &&
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1 · Cabecera ── */
  var cab = document.getElementById('cab');
  if (cab) {
    var flota = false;
    var mirar = function () {
      var abajo = window.pageYOffset > 40;
      if (abajo !== flota) { flota = abajo; cab.classList.toggle('cab--flota', abajo); }
    };
    window.addEventListener('scroll', mirar, { passive: true });
    mirar();
  }

  /* ── 2 · Apariciones ── */
  /* ── El plano se dibuja (regla 6 de movimiento-web) ──
     Cada trazo necesita saber cuánto mide para «dibujarse» con
     stroke-dashoffset. getTotalLength() lo dice y el valor se escribe
     como propiedad de estilo DESDE JS —CSSOM—, que es lo único que la
     CSP de esta página permite: un atributo style="" en el HTML lo
     bloquearía sin avisar. Si algún trazo no se puede medir se queda
     sin --largo y aparece entero, que es mejor que aparecer invisible. */
  Array.prototype.forEach.call(
    document.querySelectorAll('.plano__muro, .plano__z rect'),
    function (el) {
      var largo = 0;
      try { largo = el.getTotalLength ? el.getTotalLength() : 0; }
      catch (e) { largo = 0; }
      if (largo > 0) { el.style.setProperty('--largo', largo.toFixed(1)); }
    }
  );

  var piezas = [];
  ['.most .ancho', '.mostradores', '.tajo__txt', '.hoja .ancho', '.temp .ancho',
   '.meses', '.cita__txt', '.mos .ancho', '.mos__grilla',
   '.donde__cols > *', '.dueno__cols', '.dueno__cierre']
    .forEach(function (sel) {
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) { piezas.push(el); });
    });

  piezas.forEach(function (el) { el.classList.add('rev'); });
  var destapar = function (el) { el.classList.add('ok'); };

  if (!('IntersectionObserver' in window) || reduce) {
    piezas.forEach(destapar);
  } else {
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { destapar(e.target); obs.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    piezas.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) { destapar(el); } else { obs.observe(el); }
    });
    setTimeout(function () { piezas.forEach(destapar); }, 6000);
  }

  /* ── 3 · Preguntar antes de ir ──
     El local no publica teléfono y CristalWeb todavía no tiene
     WhatsApp propio: el flujo entrega TEXTO listo para pegar. */
  var form = document.getElementById('form-preg');
  var salida = document.getElementById('salida');
  var btn = document.getElementById('btn-copiar');

  if (form && salida && btn) {
    var most   = document.getElementById('f-most');
    var que    = document.getElementById('f-que');
    var cuando = document.getElementById('f-cuando');

    var armar = function () {
      var q = que && que.value ? que.value.trim() : '';
      if (!q) { salida.textContent = ''; return ''; }
      var t = 'Hola, una consulta.';
      if (most && most.value) { t += '\nMostrador: ' + most.value; }
      t += '\nNecesito: ' + q;
      if (cuando && cuando.value.trim()) { t += '\nPara: ' + cuando.value.trim(); }
      salida.textContent = t;
      return t;
    };

    [most, que, cuando].forEach(function (c) {
      if (!c) { return; }
      c.addEventListener('input', armar);
      c.addEventListener('change', armar);
    });
    armar();

    btn.addEventListener('click', function () {
      var t = armar();
      if (!t) { salida.textContent = 'Escriba qué necesita.'; que.focus(); return; }
      var avisar = function (ok) {
        btn.textContent = ok ? 'Copiado' : 'No se pudo copiar — selecciónelo arriba';
        setTimeout(function () { btn.textContent = 'Copiar el mensaje'; }, 2600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(t).then(function () { avisar(true); }, function () { avisar(false); });
      } else {
        var ta = document.createElement('textarea');
        ta.value = t; ta.setAttribute('readonly', '');
        ta.style.position = 'absolute'; ta.style.left = '-9999px';
        document.body.appendChild(ta); ta.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
        document.body.removeChild(ta);
        avisar(ok);
      }
    });
  }

})();
