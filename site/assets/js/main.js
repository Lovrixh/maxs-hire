/* Max's Hire, shared UI behaviour */
(function () {
  "use strict";

  /* Mobile nav toggle */
  var nav = document.querySelector(".nav");
  var toggle = document.querySelector(".nav__toggle");
  if (nav && toggle) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* Footer year */
  var y = document.querySelectorAll("[data-year]");
  y.forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Highlight active nav link by pathname */
  var here = location.pathname.replace(/index\.html$/, "").replace(/\/$/, "");
  document.querySelectorAll(".nav__links a").forEach(function (a) {
    var target = a.getAttribute("href").replace(/index\.html$/, "").replace(/\/$/, "");
    if (target && (here === target || (target !== "" && here.indexOf(target) === 0))) {
      a.classList.add("is-active");
    }
  });
})();

/* -------------------------------------------------------------------------
   Generator sizing calculator
   Runs only where #calc-form exists. Accounts for start-up surge on
   motor/compressor loads (surge factor baked into each appliance).
   ------------------------------------------------------------------------- */
(function () {
  "use strict";
  var form = document.getElementById("calc-form");
  if (!form) return;

  // running watts + surge multiplier for start-up (motors/compressors spike)
  var LOADS = {
    lights:        { w: 300,   surge: 1.0 },
    "phone-eftpos":{ w: 150,   surge: 1.0 },
    "coffee-machine":{ w: 1600, surge: 1.2 },
    fridge:        { w: 350,   surge: 3.0 },
    freezer:       { w: 400,   surge: 3.0 },
    "bain-marie":  { w: 1500,  surge: 1.0 },
    fryer:         { w: 2400,  surge: 1.0 },
    "food-truck":  { w: 3500,  surge: 1.6 },
    "power-tools": { w: 1400,  surge: 2.0 },
    compressor:    { w: 1800,  surge: 3.0 },
    "site-lights": { w: 1000,  surge: 1.0 },
    pump:          { w: 1200,  surge: 3.0 },
    "av-sound":    { w: 800,   surge: 1.2 },
    heater:        { w: 2000,  surge: 1.0 }
  };

  // fleet, smallest usable continuous output first (rated watts, w/ headroom)
  var FLEET = [
    { name: "Honda EU22i", kva: "2.2 kVA", max: 2200, cont: 1600, url: "#quote", img: "assets/img/honda-eu22i-1.jpg", note: "Ultra-quiet petrol inverter" },
    { name: "Honda EU32i", kva: "3.2 kVA", max: 3200, cont: 2600, url: "#quote", img: "assets/img/honda-eu32i-1.jpg", note: "Quiet petrol inverter" },
    { name: "Honda EU70is", kva: "7.0 kVA", max: 7000, cont: 5500, url: "#quote", img: "assets/img/honda-eu70is-1.jpg", note: "Electric-start petrol inverter" },
    { name: "Denyo 60US", kva: "60 kVA", max: 60000, cont: 48000, url: "#quote", img: "assets/img/denyo-60kva-1.jpg", note: "3-phase ultra-silent diesel" }
  ];

  var out = document.getElementById("calc-output");

  function calc() {
    var running = 0, peakSurge = 0;
    form.querySelectorAll(".appliance").forEach(function (row) {
      var cb = row.querySelector("input[type=checkbox]");
      if (!cb || !cb.checked) return;
      var key = cb.value;
      var qtyEl = row.querySelector(".a-qty");
      var qty = qtyEl ? Math.max(1, parseInt(qtyEl.value, 10) || 1) : 1;
      var load = LOADS[key];
      if (!load) return;
      var run = load.w * qty;
      running += run;
      // surge only applies to the single largest-starting item; approximate by
      // tracking the biggest single-unit surge delta on top of running total
      var surgeDelta = load.w * (load.surge - 1);
      if (surgeDelta > peakSurge) peakSurge = surgeDelta;
    });

    var required = Math.round(running + peakSurge);

    if (required <= 0) {
      out.innerHTML = '<p style="color:var(--on-ink-soft);margin:0">Select what you need to power and we\'ll size a generator for you.</p>';
      return;
    }

    // add 20% safety headroom, recommend smallest unit whose continuous rating covers it
    var withHeadroom = Math.round(required * 1.2);
    var pick = FLEET.find(function (g) { return g.cont >= withHeadroom; });

    var recHtml;
    if (pick) {
      recHtml =
        '<div class="calc__rec">' +
          '<img src="' + pick.img + '" alt="' + pick.name + '">' +
          '<div>' +
            '<div style="font-family:var(--font-head);font-weight:600;font-size:1.1rem;color:#fff">Recommended: ' + pick.name + ' (' + pick.kva + ')</div>' +
            '<div style="color:var(--on-ink-soft);font-size:.9rem">' + pick.note + ', comfortably covers your load with headroom.</div>' +
            '<a class="btn btn--primary" style="margin-top:.7rem" href="' + pick.url + '">Get a quote for this &rarr;</a>' +
          '</div>' +
        '</div>';
    } else {
      recHtml =
        '<div class="calc__rec"><div>' +
          '<div style="font-family:var(--font-head);font-weight:600;font-size:1.1rem;color:#fff">You need multiple units or a large 3-phase set</div>' +
          '<div style="color:var(--on-ink-soft);font-size:.9rem">Your load is beyond a single portable unit. Call us and we\'ll spec the right combination or our 60 kVA diesel.</div>' +
          '<a class="btn btn--primary" style="margin-top:.7rem" href="tel:+642108771003">Call 021 0877 1003</a>' +
        '</div></div>';
    }

    out.innerHTML =
      '<h3>Estimated power required</h3>' +
      '<div class="calc__watt">' + required.toLocaleString() + ' W <span style="font-size:1rem;color:var(--on-ink-soft)">peak (incl. start-up surge)</span></div>' +
      '<p style="color:var(--on-ink-soft);margin:.4rem 0 0;font-size:.9rem">Running load ' + running.toLocaleString() + ' W + start-up surge. We size with 20% headroom = ~' + withHeadroom.toLocaleString() + ' W.</p>' +
      recHtml;
  }

  form.addEventListener("change", calc);
  form.addEventListener("input", calc);
  calc();
})();

/* Reviews carousel: prev/next buttons + gentle autoplay, pause on hover */
(function () {
  "use strict";
  var rc = document.getElementById("reviews");
  if (!rc) return;
  var track = rc.querySelector(".rc__track");
  var slide = rc.querySelector(".rc__slide");
  if (!track || !slide) return;
  function step() { return slide.getBoundingClientRect().width + 22; }
  document.querySelectorAll("[data-rc]").forEach(function (b) {
    b.addEventListener("click", function () {
      track.scrollBy({ left: (b.getAttribute("data-rc") === "next" ? 1 : -1) * step(), behavior: "smooth" });
    });
  });
  var timer = setInterval(auto, 5000), paused = false;
  function auto() {
    if (paused) return;
    if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 4) {
      track.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      track.scrollBy({ left: step(), behavior: "smooth" });
    }
  }
  rc.addEventListener("mouseenter", function () { paused = true; });
  rc.addEventListener("mouseleave", function () { paused = false; });
})();

/* Prefill the quote form's unit dropdown from ?unit= or ?item= (from fleet/equipment CTAs) */
(function () {
  "use strict";
  var sel = document.getElementById("unit");
  if (!sel) return;
  var params = new URLSearchParams(location.search);
  var want = params.get("unit") || params.get("item");
  if (!want) return;
  for (var i = 0; i < sel.options.length; i++) {
    if (sel.options[i].value === want) { sel.selectedIndex = i; break; }
  }
  if (params.get("urgent")) {
    var u = document.querySelector('input[name="urgent"]');
    if (u) u.checked = true;
  }
})();
