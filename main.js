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

  /* ----------------------------------------------- Globo ------
     Esfera de puntos girando, en canvas 2D y sin librerías.
     Los vecinos se calculan UNA vez: la esfera es rígida, así que las
     parejas de puntos cercanos no cambian al rotar. Por fotograma sólo
     queda proyectar, que es barato.
     Se detiene si sale de pantalla o si la pestaña pasa a segundo
     plano — un bucle infinito invisible sólo gasta batería. */
  function initGlobe () {
    var cv = $("[data-globe]");
    if (!cv || !cv.getContext) return;
    var ctx = cv.getContext("2d", { alpha: true });
    if (!ctx) return;

    var small = matchMedia("(max-width: 899px)").matches;
    var N = small ? 230 : 380;
    var LINK = small ? 0.30 : 0.26;      // radio de vecindad (esfera unitaria)
    var MAX_LINKS = 900;
    var TILT = -0.38;
    var SPEED = 0.00016;                 // rad/ms — una vuelta ≈ 11 min

    // Distribución de Fibonacci: reparte los puntos parejo, sin
    // acumularlos en los polos como haría una malla lat/lon.
    var pts = [];
    var GA = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < N; i++) {
      var y = 1 - (i / (N - 1)) * 2;
      var r = Math.sqrt(Math.max(0, 1 - y * y));
      var th = i * GA;
      pts.push({ x: Math.cos(th) * r, y: y, z: Math.sin(th) * r });
    }

    var links = [];
    var lim2 = LINK * LINK;
    for (var a = 0; a < pts.length && links.length < MAX_LINKS; a++) {
      for (var b = a + 1; b < pts.length; b++) {
        var dx = pts[a].x - pts[b].x, dy = pts[a].y - pts[b].y, dz = pts[a].z - pts[b].z;
        if (dx * dx + dy * dy + dz * dz < lim2) {
          links.push(a, b);
          if (links.length >= MAX_LINKS * 2) break;
        }
      }
    }

    var dpr = 1, W = 0, H = 0, R = 0, cx = 0, cy = 0;
    function resize () {
      var box = cv.getBoundingClientRect();
      if (!box.width) return false;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = Math.round(box.width * dpr);
      H = Math.round(box.height * dpr);
      cv.width = W; cv.height = H;
      cx = W / 2; cy = H / 2;
      R = Math.min(W, H) * 0.40;
      return true;
    }
    if (!resize()) return;

    var mx = 0, my = 0, tmx = 0, tmy = 0;
    if (matchMedia("(hover: hover) and (pointer: fine)").matches) {
      window.addEventListener("mousemove", function (e) {
        tmx = (e.clientX / window.innerWidth - 0.5) * 26;
        tmy = (e.clientY / window.innerHeight - 0.5) * 18;
      }, { passive: true });
    }

    var st = Math.sin(TILT), ct = Math.cos(TILT);
    var px = new Float32Array(N), py = new Float32Array(N), pf = new Float32Array(N);

    function draw (ang) {
      var cs = Math.cos(ang), sn = Math.sin(ang);
      mx += (tmx - mx) * 0.05;
      my += (tmy - my) * 0.05;

      ctx.clearRect(0, 0, W, H);

      for (var i = 0; i < N; i++) {
        var p = pts[i];
        var x1 = p.x * cs - p.z * sn;
        var z1 = p.x * sn + p.z * cs;
        var y2 = p.y * ct - z1 * st;
        var z2 = p.y * st + z1 * ct;

        var k = 2.7 / (2.7 + z2);
        px[i] = cx + x1 * R * k + mx * dpr;
        py[i] = cy + y2 * R * k + my * dpr;
        pf[i] = (1 - z2) / 2;                 // 1 = al frente, 0 = al fondo
      }

      ctx.lineWidth = Math.max(1, 0.7 * dpr);
      for (var l = 0; l < links.length; l += 2) {
        var i1 = links[l], i2 = links[l + 1];
        var f = (pf[i1] + pf[i2]) / 2;
        if (f < 0.18) continue;               // no dibujar la cara trasera
        ctx.strokeStyle = "rgba(255,167,36," + (0.035 + f * f * 0.16).toFixed(3) + ")";
        ctx.beginPath();
        ctx.moveTo(px[i1], py[i1]);
        ctx.lineTo(px[i2], py[i2]);
        ctx.stroke();
      }

      for (var j = 0; j < N; j++) {
        var fr = pf[j];
        var rad = (0.5 + fr * 1.5) * dpr;
        ctx.fillStyle = fr > 0.72
          ? "rgba(255,196,107," + (0.20 + fr * 0.55).toFixed(3) + ")"
          : "rgba(255,167,36," + (0.07 + fr * 0.34).toFixed(3) + ")";
        ctx.beginPath();
        ctx.arc(px[j], py[j], rad, 0, 6.2832);
        ctx.fill();
      }
    }

    cv.classList.add("is-on");

    if (reduced) { draw(0.6); return; }       // un fotograma fijo, sin bucle

    var raf = null, last = 0, ang = 0, onScreen = true;

    function loop (t) {
      if (last) ang += (t - last) * SPEED;
      last = t;
      draw(ang);
      raf = requestAnimationFrame(loop);
    }
    function start () {
      if (raf || !onScreen || document.hidden) return;
      last = 0;
      raf = requestAnimationFrame(loop);
    }
    function stop () {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = null;
    }

    if (typeof IntersectionObserver !== "undefined") {
      new IntersectionObserver(function (es) {
        onScreen = es[0].isIntersecting;
        onScreen ? start() : stop();
      }, { threshold: 0 }).observe(cv);
    }
    document.addEventListener("visibilitychange", function () {
      document.hidden ? stop() : start();
    });

    var rt = null;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () { if (resize()) draw(ang); }, 180);
    }, { passive: true });

    start();
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
    safe(initGlobe, "initGlobe");
    safe(initSmoothScroll, "initSmoothScroll");
    safe(initYear, "initYear");
    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
