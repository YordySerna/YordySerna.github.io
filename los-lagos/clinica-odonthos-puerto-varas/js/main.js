/* ══════════════════════════════════════════════════════════════════
   CLÍNICA ODONTHOS · Puerto Varas — demo CristalWeb
   JS clásico, un IIFE, sin dependencias.

   Sin JavaScript la página se lee entera: los seis tramos de la
   primera cita son una lista ordenada normal, las especialidades son
   texto y el enlace al Instagram sigue abriendo. El JS sólo agrega las
   apariciones al scroll y arma el mensaje para agendar.

   La página compite contra una plantilla: por eso este archivo no
   carga nada, no mide nada y no manda nada a ninguna parte.
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
  ['.cita-s .ancho', '.reloj-l', '.tajo__txt', '.espec .ancho',
   '.equipo .ancho', '.ficha', '.propia .ancho', '.cita__txt',
   '.mos .ancho', '.mos__grilla', '.specs', '.agenda__cols > *', '.dueno__cols', '.dueno__cierre']
    .forEach(function (sel) {
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) { piezas.push(el); });
    });

  piezas.forEach(function (el) { el.classList.add('rev'); });
  /* ── La cifra que cuenta (regla 7 de movimiento-web) ──
     El valor final está ESCRITO en el HTML: sin JavaScript, con
     reduced-motion o si algo falla, el 100 % se lee igual. Es la única
     excepción al «sin reloj» de la casa, y por eso el reloj es tiempo
     TRANSCURRIDO y no un contador de cuadros.
     Sólo cuenta lo que tiene sentido contar: de los cuatro .specs, tres
     valen 0, 0 y 1 —contar de cero a cero es un no-op y de cero a uno es
     un parpadeo—, así que sólo lleva data-cuenta el 100 %. El sufijo
     («%») se guarda aparte y se vuelve a pegar en cada cuadro. */
  var cuentaHecha = false;
  var arrancarCuentas = function (caja) {
    if (cuentaHecha || reduce || !window.requestAnimationFrame) { return; }
    var numeros = caja.querySelectorAll('[data-cuenta]');
    if (!numeros.length) { return; }
    cuentaHecha = true;

    setTimeout(function () {
      Array.prototype.forEach.call(numeros, function (el) {
        var fin = parseInt(el.getAttribute('data-cuenta'), 10);
        if (!(fin > 0)) { return; }
        var texto = el.textContent;
        var sufijo = texto.replace(/^[\d.,\s]+/, '');
        var dur = 1000, t0 = 0;
        var paso = function (t) {
          if (!t0) { t0 = t; }
          var p = Math.min((t - t0) / dur, 1);
          /* expo.out escrita a mano: la misma curva --salida del CSS. */
          var e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
          el.textContent = String(Math.round(fin * e)) + sufijo;
          /* Crece un 4 % en el camino y vuelve a su tamaño al llegar. */
          el.style.transform = 'scale(' + (1 + 0.04 * Math.sin(Math.PI * p)).toFixed(4) + ')';
          if (p < 1) { requestAnimationFrame(paso); }
          else { el.textContent = texto; el.style.transform = ''; }
        };
        /* El 0 NO se escribe antes del primer cuadro: si rAF nunca corre
           —pestaña en segundo plano— la cifra real se queda en pantalla
           en vez de congelarse en cero. */
        requestAnimationFrame(paso);
        setTimeout(function () { el.textContent = texto; el.style.transform = ''; }, dur + 500);
      });
    }, 200);
  };

  var destapar = function (el) {
    el.classList.add('ok');
    if (el.classList.contains('specs')) { arrancarCuentas(el); }
  };

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

  /* ── 3 · Armar el mensaje ──
     La clínica agenda por Instagram y ahí no se puede precargar texto,
     así que se copia al portapapeles. Cuando publiquen un WhatsApp,
     esta función cambia de una línea. */
  var form = document.getElementById('form-ag');
  var salida = document.getElementById('salida');
  var btn = document.getElementById('btn-copiar');

  if (form && salida && btn) {
    var nombre = document.getElementById('f-nombre');
    var motivo = document.getElementById('f-motivo');
    var prev   = document.getElementById('f-prev');
    var cuando = document.getElementById('f-cuando');

    var armar = function () {
      var n = nombre && nombre.value ? nombre.value.trim() : '';
      if (!n) { salida.textContent = ''; return ''; }
      var t = 'Hola, quiero agendar una hora.';
      t += '\nNombre: ' + n;
      if (motivo && motivo.value) { t += '\nMotivo: ' + motivo.value; }
      if (prev && prev.value)     { t += '\nPrevisión: ' + prev.value; }
      if (cuando && cuando.value.trim()) { t += '\nMe acomoda: ' + cuando.value.trim(); }
      salida.textContent = t;
      return t;
    };

    [nombre, motivo, prev, cuando].forEach(function (c) {
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
