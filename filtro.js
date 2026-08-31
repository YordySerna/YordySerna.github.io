/* Filtro de proyectos por rubro — se movió desde el <head> del index
   por la misma razón que rescate.js: la CSP no permite scripts en
   línea. Va con defer al final, después de main.js. */
/* Filtro de proyectos por rubro. Va inline y sin defer porque no
   depende de main.js: si aquel falla, el filtro sigue andando.
   Renumera las fichas visibles para que el 01, 02, 03 no quede con
   saltos al ocultar una. */
(function () {
  'use strict';
  var barra = document.querySelector('[data-filtros]');
  var lista = document.querySelector('[data-dossier]');
  if (!barra || !lista) return;

  /* El filtro recorre los dos niveles: los destacados y las filas del
     archivo. Antes sólo existía .entry, que ya no está. El número NO se
     renumera al filtrar: es el identificador del proyecto, no su posición,
     y renumerarlo hacía que el mismo proyecto cambiara de número según el
     filtro activo. */
  var fichas  = Array.prototype.slice.call(document.querySelectorAll('.dest, .fila'));
  var cuenta  = document.querySelector('[data-cuenta]');
  var botones = Array.prototype.slice.call(barra.querySelectorAll('.filtro'));

  function aplicar(cat) {
    var n = 0;
    fichas.forEach(function (f) {
      var calza = (cat === 'todos') || (f.getAttribute('data-cat') === cat);
      f.hidden = !calza;
      if (calza) {
        n++;
      }
    });
    botones.forEach(function (b) {
      var on = b.getAttribute('data-filtro') === cat;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    if (cuenta) cuenta.textContent = n + (n === 1 ? ' proyecto' : ' proyectos');
  }

  botones.forEach(function (b) {
    b.addEventListener('click', function () {
      aplicar(b.getAttribute('data-filtro'));
    });
  });
})();
