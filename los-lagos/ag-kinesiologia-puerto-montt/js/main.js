/* ══════════════════════════════════════════════════════════════════
   A&G KINESIOLOGÍA INTEGRAL · Puerto Montt — demo CristalWeb
   JS clásico, un IIFE, sin dependencias.

   Sin JavaScript la página se lee entera: las TRES vías de previsión
   están escritas y visibles con todos sus pasos, y el teléfono y el
   correo son enlaces normales. El JS sólo enciende el selector y
   atenúa las vías que no eligió — nunca las esconde.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  clearTimeout(window.__rescate);

  var TEL = '56973725439';   /* el que publica su Instagram — confirmar */

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

  /* ── 2 · Elegir previsión ──
     Atenúa, no esconde: el paciente que quiere comparar Fonasa con
     reembolso sigue teniendo las dos a la vista. */
  var elige = document.getElementById('elige');
  var vias = document.getElementById('vias');
  if (elige && vias) {
    var botones = Array.prototype.slice.call(elige.querySelectorAll('.elige__b'));
    var fichas = Array.prototype.slice.call(vias.querySelectorAll('.via'));

    var marcar = function (prev) {
      vias.classList.add('vias--filtra');
      botones.forEach(function (b) {
        var on = b.getAttribute('data-prev') === prev;
        b.classList.toggle('elige__b--on', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      fichas.forEach(function (f) {
        f.classList.toggle('via--on', f.getAttribute('data-prev') === prev);
      });
    };

    botones.forEach(function (b) {
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', function () { marcar(b.getAttribute('data-prev')); });
    });
  }
  /* ── 3 · El arco de la portada se dibuja (regla 6 de movimiento-web) ──
     El trazo necesita saber cuánto mide para poder «dibujarse» con
     stroke-dashoffset. getTotalLength() lo dice, y el valor se escribe
     como propiedad de estilo DESDE JS —CSSOM— que es lo único que la
     CSP de esta página permite: un atributo style="" en el HTML lo
     bloquearía sin avisar. Si el navegador no sabe medirlo, el arco se
     queda sin --largo y aparece entero: mejor un trazo sin animar que
     un trazo invisible. */
  var arco = document.querySelector('.escena__arco');
  if (arco) {
    var largoArco = 0;
    try { largoArco = arco.getTotalLength ? arco.getTotalLength() : 0; }
    catch (e) { largoArco = 0; }
    if (largoArco > 0) { arco.style.setProperty('--largo', largoArco.toFixed(1)); }
  }

  /* ── 4 · Apariciones ── */
  var piezas = [];
  ['.cuanto .ancho', '.vias', '.tajo__txt', '.trata .ancho', '.caso',
   '.sesion .ancho', '.cita__txt', '.mos .ancho', '.mos__grilla',
   '.horas__cols > *', '.dueno__cols', '.dueno__cierre']
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

  /* ── 5 · Armar el mensaje ──
     Acá sí hay teléfono publicado, así que el botón principal abre
     WhatsApp con el texto escrito. */
  var form = document.getElementById('form-hora');
  var salida = document.getElementById('salida');
  var btnW = document.getElementById('btn-wsp');
  var btnC = document.getElementById('btn-copiar');

  if (form && salida && btnW && btnC) {
    var nombre = document.getElementById('f-nombre');
    var prev   = document.getElementById('f-prev');
    var motivo = document.getElementById('f-motivo');
    var orden  = document.getElementById('f-orden');

    var armar = function () {
      var n = nombre && nombre.value ? nombre.value.trim() : '';
      var m = motivo && motivo.value ? motivo.value.trim() : '';
      if (!n && !m) { salida.textContent = ''; return ''; }
      var t = 'Hola, quiero pedir hora de kinesiología.';
      if (n) { t += '\nNombre: ' + n; }
      if (prev && prev.value)  { t += '\nPrevisión: ' + prev.value; }
      if (m) { t += '\nMotivo: ' + m; }
      if (orden && orden.value) { t += '\nOrden médica: ' + orden.value; }
      salida.textContent = t;
      return t;
    };

    [nombre, prev, motivo, orden].forEach(function (c) {
      if (!c) { return; }
      c.addEventListener('input', armar);
      c.addEventListener('change', armar);
    });
    armar();

    btnW.addEventListener('click', function () {
      var t = armar();
      if (!t) { salida.textContent = 'Escriba al menos su nombre y qué le pasa.'; nombre.focus(); return; }
      window.open('https://wa.me/' + TEL + '?text=' + encodeURIComponent(t), '_blank', 'noopener');
    });

    btnC.addEventListener('click', function () {
      var t = armar();
      if (!t) { salida.textContent = 'Escriba al menos su nombre y qué le pasa.'; nombre.focus(); return; }
      var avisar = function (ok) {
        btnC.textContent = ok ? 'Copiado' : 'No se pudo copiar — selecciónelo arriba';
        setTimeout(function () { btnC.textContent = 'Copiar el mensaje'; }, 2600);
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
