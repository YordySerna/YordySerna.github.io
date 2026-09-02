/* ══════════════════════════════════════════════════════════════════
   CIRUS BAR · Puerto Montt — demo CristalWeb
   JS clásico, un IIFE, sin dependencias.

   Sin JavaScript la página se lee entera: la línea de tiempo, la carta
   y los datos de contacto están escritos en el HTML. Lo único que se
   pierde es el armado automático del mensaje de reserva — y el
   teléfono de al lado es un enlace normal que sigue funcionando.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  clearTimeout(window.__rescate);

  var reduce = window.matchMedia &&
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1 · Cabecera que se despega al bajar ── */
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

  /* ── 2 · Apariciones al entrar en pantalla ──
     El observer se agrega desde acá, nunca la clase en el HTML. Y se
     observa el CONTENEDOR: un elemento recortado a área cero jamás
     dispara IntersectionObserver y se bloquea solo. */
  var piezas = [];
  ['.linea .ancho', '.hitos', '.tajo__txt', '.carta .ancho', '.platos',
   '.barrio .ancho', '.cita__txt', '.mos .ancho', '.mos__grilla',
   '.llegar__cols > *', '.dueno__cols', '.dueno__cierre', '.cifras']
    .forEach(function (sel) {
      Array.prototype.forEach.call(document.querySelectorAll(sel), function (el) {
        piezas.push(el);
      });
    });

  piezas.forEach(function (el) { el.classList.add('rev'); });
  /* ── 3 · La cifra que cuenta (regla 7 de movimiento-web) ──
     El valor final está ESCRITO en el HTML: sin JavaScript, con
     reduced-motion o si algo falla, el 80 se lee igual. Es la única
     excepción al «sin reloj» de la casa, y por eso el reloj es tiempo
     TRANSCURRIDO y no un contador de cuadros: en un teléfono lento la
     cuenta dura lo mismo que en un escritorio.
     Arranca 250 ms después de que la banda de cifras se destapa — a
     esa altura el titular ya terminó de entrar y no compiten. */
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
        var dur = 1100, t0 = 0;
        var paso = function (t) {
          if (!t0) { t0 = t; }
          var p = Math.min((t - t0) / dur, 1);
          /* expo.out escrita a mano: la misma curva que --salida usa en
             el CSS, para que la cifra y los reveals frenen igual. */
          var e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
          el.textContent = String(Math.round(fin * e));
          /* Crece un 5 % en el camino y vuelve a su tamaño al llegar. */
          el.style.transform = 'scale(' + (1 + 0.05 * Math.sin(Math.PI * p)).toFixed(4) + ')';
          if (p < 1) { requestAnimationFrame(paso); }
          else { el.textContent = String(fin); el.style.transform = ''; }
        };
        /* El '0' NO se escribe antes del primer cuadro: si rAF nunca corre
           —pestaña en segundo plano, panel oculto— la cifra real se queda
           en pantalla en vez de congelarse en cero. */
        requestAnimationFrame(paso);
        /* Y si aun así se queda a medias, a los 1,6 s el valor final gana. */
        setTimeout(function () { el.textContent = String(fin); el.style.transform = ''; }, dur + 500);
      });
    }, 250);
  };

  var destapar = function (el) {
    el.classList.add('ok');
    if (el.classList.contains('cifras')) { arrancarCuentas(el); }
  };

  if (!('IntersectionObserver' in window) || reduce) {
    piezas.forEach(destapar);
  } else {
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) { destapar(e.target); obs.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

    piezas.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) { destapar(el); }
      else { obs.observe(el); }
    });
    /* Barrido de seguridad: nada puede quedar invisible para siempre. */
    setTimeout(function () { piezas.forEach(destapar); }, 6000);
  }

  /* ── 4 · Reserva: armar el mensaje y copiarlo ──
     No hay número de WhatsApp de CristalWeb todavía, así que el flujo
     entrega TEXTO listo para pegar en vez de abrir un chat que no
     existe. Cuando el número exista, se cambia una sola línea. */
  var form = document.getElementById('form-reserva');
  var salida = document.getElementById('salida');
  var btn = document.getElementById('btn-copiar');

  if (form && salida && btn) {
    var campos = ['f-nombre', 'f-cuando', 'f-personas', 'f-nota'].map(function (id) {
      return document.getElementById(id);
    });

    var armar = function () {
      var nombre = (campos[0].value || '').trim();
      var cuando = (campos[1].value || '').trim();
      var personas = (campos[2].value || '').trim();
      var nota = (campos[3].value || '').trim();
      if (!nombre && !cuando) { salida.textContent = ''; return ''; }

      var t = 'Hola, quiero reservar una mesa en Cirus Bar.';
      if (nombre)   { t += '\nNombre: ' + nombre; }
      if (cuando)   { t += '\nDía y hora: ' + cuando; }
      if (personas) { t += '\nPersonas: ' + personas; }
      if (nota)     { t += '\nAviso: ' + nota; }
      salida.textContent = t;
      return t;
    };

    campos.forEach(function (c) {
      if (c) { c.addEventListener('input', armar); }
    });
    armar();

    btn.addEventListener('click', function () {
      var t = armar();
      if (!t) {
        salida.textContent = 'Escriba al menos el nombre y el día.';
        campos[0].focus();
        return;
      }
      var avisar = function (ok) {
        btn.textContent = ok ? 'Copiado' : 'No se pudo copiar — selecciónelo arriba';
        setTimeout(function () { btn.textContent = 'Copiar el mensaje'; }, 2600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(t).then(function () { avisar(true); },
                                             function () { avisar(false); });
      } else {
        /* Respaldo para navegadores viejos y para file:// */
        var ta = document.createElement('textarea');
        ta.value = t;
        ta.setAttribute('readonly', '');
        ta.style.position = 'absolute';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
        document.body.removeChild(ta);
        avisar(ok);
      }
    });
  }

})();
