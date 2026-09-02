/* ══════════════════════════════════════════════════════════════════
   HAIRDOG · Peluquería canina, Puerto Montt — demo CristalWeb
   JS clásico, un IIFE, sin dependencias.

   Sin JavaScript la página se lee entera: los cuatro mantos, los tres
   servicios y los pasos de la sesión están escritos, y el WhatsApp del
   bloque de contacto es un enlace normal que abre el chat. El JS sólo
   arma el texto del mensaje y lo manda ya escrito.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  clearTimeout(window.__rescate);

  var WSP = '56974676721';   /* el que publica su Facebook — confirmar antes de publicar */

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
  ['.manto .ancho', '.mantos', '.tajo__txt', '.servicios .ancho', '.serv__c',
   '.sesion .ancho', '.pasos li', '.cita__txt', '.mos .ancho', '.mos__grilla',
   '.pedirh__cols > *', '.dueno__cols', '.dueno__cierre']
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

  /* ── 3 · Armar el mensaje de la hora ──
     Acá SÍ hay número publicado, así que el botón principal abre el
     chat con el texto ya escrito. El de copiar queda de respaldo para
     quien prefiera pegarlo en otra parte. */
  var form = document.getElementById('form-hora');
  var salida = document.getElementById('salida');
  var btnW = document.getElementById('btn-wsp');
  var btnC = document.getElementById('btn-copiar');

  if (form && salida && btnW && btnC) {
    var perro = document.getElementById('f-perro');
    var tam   = document.getElementById('f-tam');
    var manto = document.getElementById('f-manto');
    var serv  = document.getElementById('f-serv');
    var nudos = document.getElementById('f-nudos');

    var armar = function () {
      var n = perro && perro.value ? perro.value.trim() : '';
      if (!n) { salida.textContent = ''; return ''; }
      var t = 'Hola, quiero pedir hora para ' + n + '.';
      if (tam && tam.value)   { t += '\nTamaño: ' + tam.value; }
      if (manto && manto.value) { t += '\nManto: ' + manto.value; }
      if (serv && serv.value) { t += '\nServicio: ' + serv.value; }
      if (nudos && nudos.value.trim()) { t += '\nNudos: ' + nudos.value.trim(); }
      salida.textContent = t;
      return t;
    };

    [perro, tam, manto, serv, nudos].forEach(function (c) {
      if (!c) { return; }
      c.addEventListener('input', armar);
      c.addEventListener('change', armar);
    });
    armar();

    btnW.addEventListener('click', function () {
      var t = armar();
      if (!t) { salida.textContent = 'Escriba al menos el nombre del perro.'; perro.focus(); return; }
      window.open('https://wa.me/' + WSP + '?text=' + encodeURIComponent(t), '_blank', 'noopener');
    });

    btnC.addEventListener('click', function () {
      var t = armar();
      if (!t) { salida.textContent = 'Escriba al menos el nombre del perro.'; perro.focus(); return; }
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
