/* Rescate de la clase .js — se carga sin defer desde el <head>.
   Vivía en línea dentro del HTML; se movió a este archivo para poder
   declarar una Content-Security-Policy con script-src 'self', que
   bloquea todo script en línea. El comportamiento es idéntico. */
/* La clase .js activa los estados ocultos previos a cada animación.
   Se pone acá (y no en main.js) para que no haya parpadeo de contenido.
   El temporizador es el seguro: si main.js no alcanza a arrancar
   —red caída, archivo en caché corrupto, error de sintaxis— se quita
   la clase y la página se muestra completa igual. */
(function () {
  var h = document.documentElement;
  h.classList.add("js");
  setTimeout(function () {
    if (!h.classList.contains("is-ready")) h.classList.remove("js");
  }, 2500);
})();
