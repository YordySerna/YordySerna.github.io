/* ══════════════════════════════════════════════════════════════════
   REPOSTERÍA HAGEMANN · Puerto Varas — demo CristalWeb
   JS clásico, un IIFE, sin dependencias.

   Sin JavaScript la página se lee entera: la vitrina con sus horas de
   horno es una lista normal, las cuatro señales del kuchen bien hecho
   son texto y el enlace al Instagram sigue abriendo. El JS sólo agrega
   las apariciones al scroll y arma el mensaje del encargo.
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
  var piezas = [];
  ['.cifras', '.vitrina .ancho', '.kuchen', '.tajo__txt', '.familia .ancho',
   '.masa .ancho', '.senales li', '.cita__txt', '.mos .ancho', '.mos__grilla',
   '.encargos__cols > *', '.dueno__cols', '.dueno__cierre']
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

  /* ── 3 · Armar el encargo ──
     La repostería agenda por Instagram y ahí no se puede precargar
     texto, así que se copia al portapapeles. Cuando publiquen un
     WhatsApp, esta función cambia de una línea. */
  var form = document.getElementById('form-enc');
  var salida = document.getElementById('salida');
  var btn = document.getElementById('btn-copiar');

  if (form && salida && btn) {
    var nombre   = document.getElementById('f-nombre');
    var que      = document.getElementById('f-que');
    var personas = document.getElementById('f-personas');
    var dia      = document.getElementById('f-dia');

    var armar = function () {
      var n = nombre && nombre.value ? nombre.value.trim() : '';
      var d = dia && dia.value ? dia.value.trim() : '';
      if (!n && !d) { salida.textContent = ''; return ''; }
      var t = 'Hola, quiero hacer un encargo.';
      if (n) { t += '\nNombre: ' + n; }
      if (que && que.value) { t += '\nQué: ' + que.value; }
      if (personas && personas.value) { t += '\nPara: ' + personas.value + ' personas'; }
      if (d) { t += '\nPara el día: ' + d; }
      salida.textContent = t;
      return t;
    };

    [nombre, que, personas, dia].forEach(function (c) {
      if (!c) { return; }
      c.addEventListener('input', armar);
      c.addEventListener('change', armar);
    });
    armar();

    btn.addEventListener('click', function () {
      var t = armar();
      if (!t) { salida.textContent = 'Escriba al menos su nombre y para qué día.'; nombre.focus(); return; }
      var avisar = function (ok) {
        btn.textContent = ok ? 'Copiado — péguelo en el chat' : 'No se pudo copiar — selecciónelo arriba';
        setTimeout(function () { btn.textContent = 'Copiar el mensaje'; }, 3000);
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
