/* ══════════════════════════════════════════════════════════════════
   PUERTO DETAILER · Puerto Montt — demo CristalWeb
   JS clásico, un IIFE, sin dependencias.

   Sin JavaScript la página se lee entera: los tres comparadores quedan
   como pares lado a lado —que es exactamente la misma información— y
   los cuatro niveles con sus tiempos están escritos. El JS superpone
   las capas, enciende el deslizador y arma el mensaje de cotización.
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

  /* ── 2 · Comparadores antes/después ──
     El corte es un clip-path sobre la capa de arriba, movido por el
     input range. Quince líneas y cero librerías.
     El input existe en el HTML pero nace escondido: sólo se muestra
     cuando este script confirma que el comparador está vivo, para no
     ofrecer un control que no haría nada. */
  Array.prototype.forEach.call(document.querySelectorAll('.par'), function (par) {
    var caja = par.querySelector('.par__caja');
    var rango = par.querySelector('input[type="range"]');
    if (!caja || !rango) { return; }

    par.classList.add('par--vivo');

    var pintar = function (v) {
      par.style.setProperty('--corte', v + '%');
      rango.setAttribute('aria-valuetext', 'Después visible desde el ' + v + '%');
    };
    pintar(rango.value);

    /* Si el usuario ya tocó este comparador, la presentación automática
       no se hace —y si estaba corriendo, se corta en seco: mover el
       control que alguien está usando es lo peor que puede pasar acá. */
    var cancelar = function () {
      par.setAttribute('data-tocado', '1');
      par.classList.remove('par--presenta');
    };

    rango.addEventListener('input', function () { cancelar(); pintar(rango.value); });

    /* Arrastrar sobre la imagen misma: más natural que buscar la
       barra. Se usan eventos de puntero, que cubren mouse y dedo. */
    var arrastrando = false;
    var desdeEvento = function (e) {
      var r = caja.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width * 100;
      x = Math.max(0, Math.min(100, x));
      rango.value = Math.round(x);
      pintar(rango.value);
    };
    caja.addEventListener('pointerdown', function (e) {
      cancelar();
      arrastrando = true;
      caja.setPointerCapture(e.pointerId);
      desdeEvento(e);
    });
    caja.addEventListener('pointermove', function (e) {
      if (arrastrando) { desdeEvento(e); }
    });
    caja.addEventListener('pointerup', function (e) {
      arrastrando = false;
      if (caja.hasPointerCapture(e.pointerId)) { caja.releasePointerCapture(e.pointerId); }
    });
    caja.addEventListener('pointercancel', function () { arrastrando = false; });
  });

  /* ── 3 · Apariciones ──
     Se observa el CONTENEDOR de cada comparador, nunca las capas: una
     capa recortada con clip-path a área cero no dispara nunca el
     IntersectionObserver y se quedaría invisible para siempre. */
  var piezas = [];
  ['.cifras', '.comparador .ancho', '.pares', '.tajo__txt', '.niveles .ancho',
   '.niv', '.proceso .ancho', '.cita__txt', '.mos .ancho', '.mos__grilla',
   '.agenda__cols > *', '.dueno__cols', '.dueno__cierre']
    .forEach(function (sel) {
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) { piezas.push(el); });
    });

  piezas.forEach(function (el) { el.classList.add('rev'); });
  /* Los comparadores se presentan solos la primera vez que la fila
     entra en pantalla (regla: una entrada nunca se repite). Con
     reduced-motion no se presentan, y el que ya fue tocado tampoco:
     nadie quiere que se le mueva el control que está usando. */
  var presentado = false;
  var presentarPares = function () {
    if (presentado || reduce) { return; }
    presentado = true;
    Array.prototype.forEach.call(document.querySelectorAll('.par--vivo'), function (par) {
      if (par.getAttribute('data-tocado')) { return; }
      var capa = par.querySelector('.par__lado--despues');
      if (!capa) { return; }
      var soltar = function () { par.classList.remove('par--presenta'); };
      par.classList.add('par--presenta');
      capa.addEventListener('animationend', soltar);
      /* Red de seguridad: si la animación nunca corre —pestaña en
         segundo plano— la clase se cae igual y el corte vuelve al 50 %
         en vez de quedarse congelado en 0. */
      setTimeout(soltar, 3200);
    });
  };

  var destapar = function (el) {
    el.classList.add('ok');
    if (el.classList.contains('pares')) { presentarPares(); }
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

  /* ── 4 · Tilt de las tarjetas de nivel (profundidad.md § 3) ──
     Tres grados al cursor. La laca ES una superficie que refleja, y una
     tarjeta que se inclina lo dice sin una palabra. Sólo con puntero
     fino —en táctil no hay hover y el efecto únicamente estorba— y
     nunca con reduced-motion.
     El giro y su transición se escriben inline DESDE JS: eso es CSSOM,
     que la CSP sí permite, y así no pelean con la transición del
     reveal, que dura 0,6 s y dejaría el tilt pastoso. */
  var fino = window.matchMedia &&
             window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var tarjetas = document.querySelectorAll('.niv__i');
  if (fino && !reduce && tarjetas.length) {
    var lista = document.querySelector('.niv');
    if (lista) { lista.classList.add('niv--tilt'); }
    Array.prototype.forEach.call(tarjetas, function (el) {
      var GRADOS = 3;   /* 2–6; más de 8 se ve de juguete */
      el.addEventListener('pointerenter', function () {
        el.style.transition = 'transform .18s ease-out';
      });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'rotateX(' + (-y * GRADOS).toFixed(2) + 'deg) ' +
                             'rotateY(' + (x * GRADOS).toFixed(2) + 'deg)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  /* ── 5 · Cotización ──
     CristalWeb aún no tiene WhatsApp y el taller no publica teléfono:
     el flujo entrega TEXTO listo para pegar. */
  var form = document.getElementById('form-cot');
  var salida = document.getElementById('salida');
  var btn = document.getElementById('btn-copiar');

  if (form && salida && btn) {
    var ids = ['f-auto', 'f-color', 'f-estado', 'f-nivel'];
    var rot = ['Auto', 'Color', 'Estado de la pintura', 'Nivel que me interesa'];
    var campos = ids.map(function (id) { return document.getElementById(id); });

    var armar = function () {
      var partes = [];
      campos.forEach(function (c, i) {
        var v = c && c.value ? c.value.trim() : '';
        if (v) { partes.push(rot[i] + ': ' + v); }
      });
      if (!partes.length) { salida.textContent = ''; return ''; }
      var t = 'Hola, quiero cotizar un trabajo de detailing.\n' + partes.join('\n');
      salida.textContent = t;
      return t;
    };

    campos.forEach(function (c) {
      if (!c) { return; }
      c.addEventListener('input', armar);
      c.addEventListener('change', armar);
    });
    armar();

    btn.addEventListener('click', function () {
      var t = armar();
      if (!t) { salida.textContent = 'Escriba al menos el auto y el color.'; campos[0].focus(); return; }
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
