/* ═══════════════════════════════════════════════════════════════
   TOROFILA · orquestração premium vanilla
   ═══════════════════════════════════════════════════════════════ */

(() => {
  "use strict";

  /* ─────────────────────────────────────────────
     0. LOADING SCREEN
     ───────────────────────────────────────────── */
  const loader = document.getElementById("loader");
  const finishLoading = () => {
    if (!loader) return;
    loader.classList.add("is-done");
    document.body.classList.remove("is-loading");
  };
  window.addEventListener("load", () => setTimeout(finishLoading, 1100));
  setTimeout(finishLoading, 2400); // failsafe

  /* ─────────────────────────────────────────────
     1. CURSOR CUSTOM (dot + ring lerp)
     ───────────────────────────────────────────── */
  const cursor = document.querySelector(".cursor");
  const dot = document.querySelector(".cursor__dot");
  const ring = document.querySelector(".cursor__ring");

  if (cursor && window.matchMedia("(hover: hover)").matches) {
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;

    document.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    }, { passive: true });

    const animateRing = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(animateRing);
    };
    animateRing();

    document.querySelectorAll("a, button, .kit, .testimonial, .pain-card, .formula-card, .ritual-step, .faq-item__q").forEach((el) => {
      el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
    });
  }

  /* ─────────────────────────────────────────────
     2. PROGRESS BAR
     ───────────────────────────────────────────── */
  const progress = document.getElementById("progress");
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? window.scrollY / max : 0;
    if (progress) progress.style.transform = `scaleX(${Math.min(1, Math.max(0, p))})`;
  };

  /* ─────────────────────────────────────────────
     3. NAV scrolled state
     ───────────────────────────────────────────── */
  const nav = document.getElementById("nav");
  const updateNav = () => {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > 60);
  };

  /* ─────────────────────────────────────────────
     4. REVEAL via IntersectionObserver
     ───────────────────────────────────────────── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });

  document.querySelectorAll(".reveal").forEach((el) => {
    if (!el.classList.contains("hero")) revealObserver.observe(el);
  });

  /* ─────────────────────────────────────────────
     5. COUNT-UP nas estatísticas
     ───────────────────────────────────────────── */
  const animateCount = (el) => {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1800;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(target * eased);
      el.textContent = value.toLocaleString("pt-BR");
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  document.querySelectorAll("[data-count]").forEach((el) => countObserver.observe(el));

  /* ─────────────────────────────────────────────
     6. FAQ accordion
     ───────────────────────────────────────────── */
  document.querySelectorAll(".faq-item").forEach((item) => {
    const btn = item.querySelector(".faq-item__q");
    const ans = item.querySelector(".faq-item__a");
    if (!btn || !ans) return;

    btn.addEventListener("click", () => {
      const isOpen = item.classList.toggle("is-open");
      if (isOpen) {
        ans.style.maxHeight = ans.scrollHeight + "px";
      } else {
        ans.style.maxHeight = "0";
      }
    });
  });

  /* ─────────────────────────────────────────────
     7. SMOOTH ANCHORS
     ───────────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href").slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* ─────────────────────────────────────────────
     8. RITUAL JOURNEY · scroll-driven progress
     ───────────────────────────────────────────── */
  const journey = document.querySelector(".ritual-journey");
  const journeyFill = document.getElementById("ritualProgressFill");
  const journeyDots = document.querySelectorAll(".ritual-journey__dot");
  const journeySteps = document.querySelectorAll(".ritual-journey__step");
  const totalSteps = journeySteps.length;

  let lastActiveIdx = -1;
  let lastFillPct = -1;
  const updateJourney = () => {
    if (!journey) return;
    const rect = journey.getBoundingClientRect();
    const vh = window.innerHeight;

    // Skip work quando seção esta totalmente fora da viewport
    if (rect.bottom < 0 || rect.top > vh) return;

    const totalScrollable = journey.offsetHeight - vh;
    let progress = -rect.top / totalScrollable;
    progress = Math.max(0, Math.min(1, progress));

    // Barra horizontal: arredonda pra 0.5% pra evitar restyles a cada subpixel
    const pct = Math.round(progress * 200) / 2;
    if (journeyFill && pct !== lastFillPct) {
      journeyFill.style.width = pct + "%";
      lastFillPct = pct;
    }

    // So toca classes quando o step realmente muda
    const activeIdx = Math.min(totalSteps - 1, Math.floor(progress * totalSteps));
    if (activeIdx !== lastActiveIdx) {
      journeyDots.forEach((dot, i) => {
        dot.classList.toggle("is-active", i === activeIdx);
        dot.classList.toggle("is-completed", i < activeIdx);
      });
      journeySteps.forEach((step, i) => {
        step.classList.toggle("is-active", i === activeIdx);
      });
      lastActiveIdx = activeIdx;
    }
  };

  // Click manual nos dots: scrolla pra posição correspondente da jornada
  journeyDots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      if (!journey) return;
      const journeyTop = journey.offsetTop;
      const segment = (journey.offsetHeight - window.innerHeight) / totalSteps;
      window.scrollTo({ top: journeyTop + segment * i + 10, behavior: "smooth" });
    });
  });

  /* ─────────────────────────────────────────────
     9. rAF loop unificado para scroll
     ───────────────────────────────────────────── */
  let ticking = false;
  const onScroll = () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateProgress();
        updateNav();
        updateJourney();
        ticking = false;
      });
      ticking = true;
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  updateProgress();
  updateNav();
  updateJourney();

  /* ─────────────────────────────────────────────
     10. KIT visual parallax (sutil ao hover, rAF throttled)
     ───────────────────────────────────────────── */
  if (window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".kit").forEach((kit) => {
      const visual = kit.querySelector(".kit__visual-stack");
      if (!visual) return;

      let pendingX = 0, pendingY = 0, scheduled = false;
      const apply = () => {
        visual.style.transform = `translate3d(${pendingX}px, ${pendingY}px, 0)`;
        scheduled = false;
      };

      kit.addEventListener("mousemove", (e) => {
        const rect = kit.getBoundingClientRect();
        pendingX = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
        pendingY = ((e.clientY - rect.top) / rect.height - 0.5) * 8;
        if (!scheduled) { scheduled = true; requestAnimationFrame(apply); }
      }, { passive: true });

      kit.addEventListener("mouseleave", () => {
        visual.style.transform = "";
      });
    });
  }

})();
