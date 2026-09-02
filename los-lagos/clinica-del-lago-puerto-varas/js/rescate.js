/* Rescate de la clase .js — regla 2 de la casa.
   Marca .js para que el CSS pueda esconder lo que va a animarse, y a los
   4 s la quita si main.js nunca llegó: sin esto, un error de red dejaría
   media página invisible para siempre. Va en archivo (no inline) porque la
   CSP con script-src 'self' bloquea todo script escrito en el HTML. */
(function () {
  var d = document.documentElement;
  d.classList.remove('no-js');
  d.classList.add('js');
  window.__rescate = setTimeout(function () { d.classList.remove('js'); }, 4000);
})();
