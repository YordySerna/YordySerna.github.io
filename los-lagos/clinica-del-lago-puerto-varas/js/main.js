/* ══════════════════════════════════════════════════════════════════
   CLÍNICA DEL LAGO · Odontología, Puerto Varas — demo CristalWeb
   JS clásico, un IIFE, sin dependencias.

   Sin JavaScript la página se lee entera: el esquema de placas es SVG
   escrito en el HTML, las seis etapas del tratamiento son texto y el
   teléfono es un enlace normal. El JS sólo agrega las apariciones al
   scroll y arma el mensaje de la evaluación.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  clearTimeout(window.__rescate);

  var TEL = '56966020873';   /* el que publican sus redes — confirmar */

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
     Observer agregado desde acá, nunca la clase en el HTML; se observa
     el contenedor y hay barrido de seguridad a los 6 s. */
  var piezas = [];
  ['.mapa .ancho', '.etapa', '.tajo__txt', '.armonia .ancho', '.arm__c',
   '.espec .ancho', '.cita__txt', '.mos .ancho', '.mos__grilla',
   '.evalua__cols > *', '.dueno__cols', '.dueno__cierre']
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

  /* ── 3 · Pedir la evaluación ── */
  var form = document.getElementById('form-eva');
  var salida = document.getElementById('salida');
  var btnW = document.getElementById('btn-wsp');
  var btnC = document.getElementById('btn-copiar');

  if (form && salida && btnW && btnC) {
    var nombre = document.getElementById('f-nombre');
    var tema   = document.getElementById('f-tema');
    var antes  = document.getElementById('f-antes');
    var cuando = document.getElementById('f-cuando');

    var armar = function () {
      var n = nombre && nombre.value ? nombre.value.trim() : '';
      if (!n) { salida.textContent = ''; return ''; }
      var t = 'Hola, quiero pedir una primera evaluación.';
      t += '\nNombre: ' + n;
      if (tema && tema.value)   { t += '\nMe interesa: ' + tema.value; }
      if (antes && antes.value) { t += '\nTratamiento previo: ' + antes.value; }
      if (cuando && cuando.value.trim()) { t += '\nMe acomoda: ' + cuando.value.trim(); }
      salida.textContent = t;
      return t;
    };

    [nombre, tema, antes, cuando].forEach(function (c) {
      if (!c) { return; }
      c.addEventListener('input', armar);
      c.addEventListener('change', armar);
    });
    armar();

    btnW.addEventListener('click', function () {
      var t = armar();
      if (!t) { salida.textContent = 'Escriba al menos su nombre.'; nombre.focus(); return; }
      window.open('https://wa.me/' + TEL + '?text=' + encodeURIComponent(t), '_blank', 'noopener');
    });

    btnC.addEventListener('click', function () {
      var t = armar();
      if (!t) { salida.textContent = 'Escriba al menos su nombre.'; nombre.focus(); return; }
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
