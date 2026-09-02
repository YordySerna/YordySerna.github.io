/* ══════════════════════════════════════════════════════════════════
   AUTOVALD TALLER AUTOMOTRIZ · Puerto Montt — demo CristalWeb
   JS clásico, un IIFE, sin dependencias.

   Sin JavaScript la página se lee entera: los CINCO paneles del auto
   están escritos y visibles uno tras otro, el esquema SVG se ve igual
   y los datos de contacto son texto. Lo único que el JS agrega es
   convertir los paneles en pestañas y armar el mensaje de la falla.
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

  /* ── 2 · El auto por dentro: paneles → pestañas ──
     El HTML trae los cinco paneles abiertos. Acá se cierra a uno solo
     y el esquema pasa a mandar. Es mejora, no contenido. */
  var auto = document.getElementById('auto');
  if (auto) {
    var zonas = Array.prototype.slice.call(auto.querySelectorAll('.zona'));
    var paneles = Array.prototype.slice.call(auto.querySelectorAll('.panel'));

    if (zonas.length && paneles.length) {
      auto.classList.add('auto--tabs');

      var elegir = function (z) {
        zonas.forEach(function (g) {
          var on = g.getAttribute('data-z') === z;
          g.classList.toggle('zona--on', on);
          g.setAttribute('aria-selected', on ? 'true' : 'false');
          g.setAttribute('tabindex', on ? '0' : '-1');
        });
        paneles.forEach(function (p) {
          p.classList.toggle('panel--on', p.getAttribute('data-z') === z);
        });
      };

      zonas.forEach(function (g, i) {
        g.setAttribute('role', 'tab');
        g.setAttribute('tabindex', i === 0 ? '0' : '-1');
        var z = g.getAttribute('data-z');
        g.addEventListener('click', function () { elegir(z); });
        /* Teclado: las zonas son SVG, así que el rol de pestaña y el
           manejo de flechas hay que ponerlos a mano. */
        g.addEventListener('keydown', function (e) {
          var k = e.key;
          if (k === 'Enter' || k === ' ') { e.preventDefault(); elegir(z); return; }
          var paso = (k === 'ArrowRight' || k === 'ArrowDown') ? 1 :
                     (k === 'ArrowLeft'  || k === 'ArrowUp')   ? -1 : 0;
          if (!paso) { return; }
          e.preventDefault();
          var j = (i + paso + zonas.length) % zonas.length;
          elegir(zonas[j].getAttribute('data-z'));
          zonas[j].focus();
        });
      });

      auto.querySelector('.esquema').setAttribute('role', 'tablist');
      elegir(zonas[0].getAttribute('data-z'));
    }
  }

  /* ── 3 · El corte se dibuja solo (regla 6 de movimiento-web) ──
     Cada trazo necesita saber cuánto mide para poder «dibujarse» con
     stroke-dashoffset. getTotalLength() lo dice, y el valor se escribe
     como propiedad de estilo DESDE JS —CSSOM— que es lo único que la
     CSP de esta página permite: un atributo style="" en el HTML lo
     bloquearía sin decir una palabra.
     Si un navegador no sabe medir un rect, ese trazo se queda sin
     --largo y se dibuja entero de una vez: mejor un trazo sin animar
     que un trazo invisible para siempre. */
  if (auto) {
    var trazos = auto.querySelectorAll(
      '.carro, .vidrio, .rueda, .rueda-in, .suelo, .zona rect');
    Array.prototype.forEach.call(trazos, function (el) {
      var largo = 0;
      try { largo = el.getTotalLength ? el.getTotalLength() : 0; }
      catch (e) { largo = 0; }
      if (largo > 0) { el.style.setProperty('--largo', largo.toFixed(1)); }
    });
  }

  /* ── 4 · Apariciones ──
     El observer se agrega desde acá, nunca la clase en el HTML, y se
     observa el contenedor: un elemento recortado a área cero jamás
     dispara IntersectionObserver. */
  var piezas = [];
  ['.cifras', '.dentro .ancho', '.auto', '.tajo__txt', '.hace .ancho',
   '.anios .ancho', '.cita__txt', '.mos .ancho', '.mos__grilla',
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

  /* ── 5 · Contar la falla ──
     CristalWeb todavía no tiene WhatsApp propio y el taller no publica
     teléfono, así que el flujo entrega TEXTO listo para pegar. Cuando
     el número exista se cambia una línea. */
  var form = document.getElementById('form-falla');
  var salida = document.getElementById('salida');
  var btn = document.getElementById('btn-copiar');

  if (form && salida && btn) {
    var ids = ['f-auto', 'f-falla', 'f-desde', 'f-km'];
    var rot = ['Auto', 'Qué hace', 'Desde cuándo', 'Kilometraje'];
    var campos = ids.map(function (id) { return document.getElementById(id); });

    var armar = function () {
      var partes = [];
      campos.forEach(function (c, i) {
        var v = c && c.value ? c.value.trim() : '';
        if (v) { partes.push(rot[i] + ': ' + v); }
      });
      if (!partes.length) { salida.textContent = ''; return ''; }
      var t = 'Hola, quiero llevar el auto al taller.\n' + partes.join('\n');
      salida.textContent = t;
      return t;
    };

    campos.forEach(function (c) { if (c) { c.addEventListener('input', armar); } });
    armar();

    btn.addEventListener('click', function () {
      var t = armar();
      if (!t) { salida.textContent = 'Escriba al menos el auto y qué hace.'; campos[0].focus(); return; }
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
