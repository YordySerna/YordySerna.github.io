/* ══════════════════════════════════════════════════════════════════
   FAMILY FITNESS · Puerto Varas — demo CristalWeb
   JS clásico, un IIFE, sin dependencias.

   Sin JavaScript la página se lee entera: las seis fases de las doce
   semanas son una lista ordenada normal con el porcentaje escrito al
   lado, los tres planes son texto y el enlace al Instagram sigue
   abriendo. El JS sólo agrega las apariciones al scroll y arma el
   mensaje de la evaluación.

   Las barras de avance son CSS puro —un ancho porcentual sobre una
   pista—: no las anima JavaScript, así que con el script apagado
   siguen mostrando exactamente el mismo porcentaje.
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
  ['.cifras', '.semanas .ancho', '.fases', '.tajo__txt', '.como .ancho',
   '.plan', '.horarios .ancho', '.cita__txt', '.mos .ancho', '.mos__grilla',
   '.empezar__cols > *', '.dueno__cols', '.dueno__cierre']
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

  /* ── 3 · Pedir la evaluación ──
     El centro agenda por Instagram y ahí no se puede precargar texto,
     así que se copia al portapapeles. Cuando publiquen un WhatsApp,
     esta función cambia de una línea. */
  var form = document.getElementById('form-emp');
  var salida = document.getElementById('salida');
  var btn = document.getElementById('btn-copiar');

  if (form && salida && btn) {
    var nombre = document.getElementById('f-nombre');
    var nivel  = document.getElementById('f-nivel');
    var plan   = document.getElementById('f-plan');
    var hora   = document.getElementById('f-hora');

    var armar = function () {
      var n = nombre && nombre.value ? nombre.value.trim() : '';
      if (!n) { salida.textContent = ''; return ''; }
      var t = 'Hola, quiero pedir una evaluación.';
      t += '\nNombre: ' + n;
      if (nivel && nivel.value) { t += '\nParte desde: ' + nivel.value; }
      if (plan && plan.value)   { t += '\nModalidad: ' + plan.value; }
      if (hora && hora.value.trim()) { t += '\nHorario: ' + hora.value.trim(); }
      salida.textContent = t;
      return t;
    };

    [nombre, nivel, plan, hora].forEach(function (c) {
      if (!c) { return; }
      c.addEventListener('input', armar);
      c.addEventListener('change', armar);
    });
    armar();

    btn.addEventListener('click', function () {
      var t = armar();
      if (!t) { salida.textContent = 'Escriba al menos su nombre.'; nombre.focus(); return; }
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
