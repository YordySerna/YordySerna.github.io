/* ══════════════════════════════════════════════════════════════════
   HAUSTIERE · Centro veterinario, Puerto Varas — demo CristalWeb
   JS clásico, un IIFE, sin dependencias.

   Sin JavaScript la página se lee entera: el diccionario de los ocho términos
   está escrito, las señales son dos listas y la
   dirección es texto. El JS sólo agrega las apariciones al scroll y
   arma el mensaje del caso.
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

  /* ── 2 · Apariciones ──
     Observer agregado desde acá, nunca la clase en el HTML; lo que ya
     está a la vista se muestra al tiro y hay barrido a los 6 s. */
  var piezas = [];
  ['.dicc .ancho', '.terminos', '.tajo__txt', '.servicios .ancho',
   '.cuando .ancho', '.cita__txt', '.mos .ancho', '.mos__grilla',
   '.esquina__cols > *', '.dueno__cols', '.dueno__cierre']
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

  /* ── 3 · Contar el caso ──
     El centro no publica teléfono y CristalWeb todavía no tiene
     WhatsApp propio, así que el flujo entrega TEXTO listo para pegar.
     Cuando aparezca el número, se cambia una sola línea. */
  var form = document.getElementById('form-caso');
  var salida = document.getElementById('salida');
  var btn = document.getElementById('btn-copiar');

  if (form && salida && btn) {
    var ids = ['f-animal', 'f-especie', 'f-que', 'f-desde'];
    var rot = ['Nombre', 'Especie y edad', 'Qué le pasa', 'Desde cuándo'];
    var campos = ids.map(function (id) { return document.getElementById(id); });

    var armar = function () {
      var partes = [];
      campos.forEach(function (c, i) {
        var v = c && c.value ? c.value.trim() : '';
        if (v) { partes.push(rot[i] + ': ' + v); }
      });
      if (!partes.length) { salida.textContent = ''; return ''; }
      var t = 'Hola, necesito atención veterinaria.\n' + partes.join('\n');
      salida.textContent = t;
      return t;
    };

    campos.forEach(function (c) { if (c) { c.addEventListener('input', armar); } });
    armar();

    btn.addEventListener('click', function () {
      var t = armar();
      if (!t) { salida.textContent = 'Escriba al menos el nombre del animal y qué le pasa.'; campos[0].focus(); return; }
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
