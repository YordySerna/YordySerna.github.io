/* ==============================================================
   yordy.dev — comportamiento
   Patrón IIFE, sin módulos ni dependencias. Todo lo de acá es
   capa de acabado: el contenido ya está escrito en el HTML.
   ============================================================== */
(function () {
  "use strict";

  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $  (s, r) { return (r || document).querySelector(s); }
  function $$ (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function safe (fn, name) { try { fn(); } catch (e) { console.warn("[" + name + "]", e); } }

  /* ------------------------------------------------- Nav ----- */
  function initNav () {
    var nav = $("[data-nav]");
    if (!nav) return;
    var on = function () { nav.classList.toggle("is-stuck", window.scrollY > 20); };
    on();
    window.addEventListener("scroll", on, { passive: true });
  }

  /* --------------------------------------------- Revelados ----
     Dos mecanismos con una diferencia importante:

     .reveal usa opacidad/transform, que no altera la caja del
     elemento, así que se puede observar a sí mismo.

     .scan usa clip-path para el barrido. Ojo: un elemento recortado
     a `inset(0 100% 0 0)` tiene área visible CERO, y en ese estado
     IntersectionObserver lo reporta como no intersectante para
     siempre. Se bloquea solo: no puede aparecer porque está oculto.
     Por eso el barrido se dispara observando al contenedor. */
  function initReveals () {
    var scans = $$(".scan");
    var fades = $$(".reveal");
    if (!scans.length && !fades.length) return;

    if (typeof IntersectionObserver === "undefined") {
      scans.concat(fades).forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var ioFade = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("is-visible");
        ioFade.unobserve(e.target);
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -5% 0px" });

    fades.forEach(function (el, i) {
      el.style.transitionDelay = (Math.min(i % 4, 3) * 70) + "ms";
      ioFade.observe(el);
    });

    var ioScan = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        ioScan.unobserve(e.target);
        $$(".scan", e.target)
          .filter(function (el) { return el.parentElement === e.target; })
          .forEach(function (el, i) {
            el.style.transitionDelay = (i * 95) + "ms";
            el.classList.add("is-visible");
          });
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -6% 0px" });

    var seen = [];
    scans.forEach(function (el) {
      var p = el.parentElement;
      if (!p || seen.indexOf(p) !== -1) return;
      seen.push(p);
      ioScan.observe(p);
    });

    // Red de seguridad: si algo quedó atrás por lo que sea, se muestra.
    setTimeout(function () {
      $$(".scan:not(.is-visible), .reveal:not(.is-visible)").forEach(function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight * 1.5) {
          el.classList.add("is-visible");
        }
      });
    }, 5000);
  }

  /* ------------------------------------------- Decodificado ---
     El nombre se resuelve una sola vez al cargar. No se repite en
     hover: ahí sólo parpadearía y molesta más de lo que aporta. */
  function initDecode () {
    var targets = $$("[data-decode]");
    if (!targets.length) return;

    var GLYPHS = "0123456789ABCDEF#%$&/\\<>[]{}";

    targets.forEach(function (el, idx) {
      var final = el.textContent;
      if (!final.trim()) return;

      if (reduced) return;               // sin scramble: el texto ya está puesto

      var chars = final.split("");
      var start = null;
      var dur = 620 + idx * 140;
      var hold = 180 * idx;

      // Ancho fijo mientras baila, para que no salte el layout.
      el.style.minWidth = el.getBoundingClientRect().width + "px";
      el.setAttribute("aria-label", final);

      function frame (t) {
        if (start === null) start = t;
        var el_ms = t - start - hold;
        if (el_ms < 0) { requestAnimationFrame(frame); return; }

        var p = Math.min(el_ms / dur, 1);
        var settled = Math.floor(p * chars.length * 1.35);

        el.textContent = chars.map(function (c, i) {
          if (c === " ") return " ";
          if (i < settled) return c;
          return GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }).join("");

        if (p < 1) requestAnimationFrame(frame);
        else { el.textContent = final; el.style.minWidth = ""; }
      }
      requestAnimationFrame(frame);
    });
  }

  /* ----------------------------------------- Barra de estado --
     Sección actual, desplazamiento en hexadecimal y hora local.
     Es guiño, pero funciona de verdad. */
  function initStatusbar () {
    var secEl   = $("[data-sb-section]");
    var offEl   = $("[data-sb-offset]");
    var clockEl = $("[data-sb-clock]");

    if (offEl) {
      var tick = false;
      var paint = function () {
        var hex = Math.round(window.scrollY).toString(16).toUpperCase();
        offEl.textContent = "0x" + ("0000" + hex).slice(-4);
        tick = false;
      };
      paint();
      window.addEventListener("scroll", function () {
        if (tick) return;
        tick = true;
        requestAnimationFrame(paint);
      }, { passive: true });
    }

    if (clockEl) {
      var clock = function () {
        var d = new Date();
        clockEl.textContent =
          ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
      };
      clock();
      setInterval(clock, 20000);
    }

    if (secEl && typeof IntersectionObserver !== "undefined") {
      var LABELS = {
        perfil:   "00 perfil",
        enfoque:  "01 enfoque",
        trabajo:  "02 trabajo",
        oficio:   "03 oficio",
        contacto: "04 contacto"
      };
      var sections = $$("section[id]");
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          secEl.textContent = LABELS[e.target.id] || "00 perfil";
        });
      }, { rootMargin: "-45% 0px -45% 0px", threshold: 0 });
      sections.forEach(function (s) { io.observe(s); });
    }
  }

  /* ------------------------------------------ Scroll suave ---- */
  function initSmoothScroll () {
    document.addEventListener("click", function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var el = $(id);
      if (!el) return;
      e.preventDefault();
      var navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--nav-h"), 10) || 66;
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - navH - 12,
        behavior: reduced ? "auto" : "smooth"
      });
    });
  }

  /* ------------------------------------------------- Año ------ */
  function initYear () {
    var el = $("[data-year]");
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ------------------------------------------------ Boot ------ */
  function boot () {
    safe(initNav, "initNav");
    safe(initReveals, "initReveals");
    safe(initDecode, "initDecode");
    safe(initStatusbar, "initStatusbar");
    safe(initSmoothScroll, "initSmoothScroll");
    safe(initYear, "initYear");
    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
