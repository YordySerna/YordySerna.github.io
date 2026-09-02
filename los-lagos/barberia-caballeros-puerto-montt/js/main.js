/* ══════════════════════════════════════════════════════════════════
   CABALLEROS · Barbería en Angelmó, Puerto Montt — demo CristalWeb
   JS clásico, un IIFE, sin dependencias.

   Sin JavaScript la página se lee entera: el tablero de cortes es una
   <table> normal, el horario y la dirección son texto, y el enlace al
   Instagram sigue abriendo. Lo único que agrega el JS es armar el
   mensaje de reserva y copiarlo.
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
     Observer agregado desde acá, nunca la clase en el HTML; se observa
     el contenedor y hay barrido de seguridad a los 6 s. */
  var piezas = [];
  ['.cifras', '.tablero .ancho', '.tab tbody', '.tajo__txt',
   '.barberos .ancho', '.ficha', '.local .ancho', '.cita__txt',
   '.mos .ancho', '.mos__grilla', '.hora__cols > *', '.dueno__cols', '.dueno__cierre']
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
     Instagram no acepta texto precargado en un enlace, así que se
     copia al portapapeles y se pega en el chat. Cuando la barbería
     publique un WhatsApp, esta función cambia de UNA línea:
       location.href = 'https://wa.me/<numero>?text=' + encodeURIComponent(t);
     El resto ya está escrito. */
  var form = document.getElementById('form-hora');
  var salida = document.getElementById('salida');
  var btn = document.getElementById('btn-copiar');

  if (form && salida && btn) {
    var nombre = document.getElementById('f-nombre');
    var serv   = document.getElementById('f-serv');
    var cuando = document.getElementById('f-cuando');
    var quien  = document.getElementById('f-quien');

    var armar = function () {
      var n = nombre && nombre.value ? nombre.value.trim() : '';
      var c = cuando && cuando.value ? cuando.value.trim() : '';
      if (!n && !c) { salida.textContent = ''; return ''; }
      var t = 'Hola, quiero pedir una hora.';
      if (n) { t += '\nNombre: ' + n; }
      if (serv && serv.value) { t += '\nServicio: ' + serv.value; }
      if (c) { t += '\nCuándo: ' + c; }
      if (quien && quien.value.trim()) { t += '\nCon: ' + quien.value.trim(); }
      salida.textContent = t;
      return t;
    };

    [nombre, serv, cuando, quien].forEach(function (c) {
      if (!c) { return; }
      c.addEventListener('input', armar);
      c.addEventListener('change', armar);
    });
    armar();

    btn.addEventListener('click', function () {
      var t = armar();
      if (!t) { salida.textContent = 'Escriba al menos su nombre y cuándo le acomoda.'; nombre.focus(); return; }
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
