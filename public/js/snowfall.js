/**
 * SNOW'S ARENA - Snowfall Engine
 * Renders physics-based snowflakes on any number of canvases.
 *  - #snowCanvas (page backdrop): falls behind the intro, registration and lobby screens.
 *  - #introSnowCanvas (intro splash): a denser blizzard for the opening title card.
 * Flakes are pre-rendered to small sprites once, so each frame is a cheap drawImage
 * (no per-frame text layout or shadow blur), keeping lab laptops cool.
 */
(function () {
  "use strict";

  const FLAKE_CHARS = ["❄", "❅", "❆", "•", "*"];
  const SIZE_BUCKETS = [8, 12, 16, 22, 28];
  const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Sprite cache: one glowing flake bitmap per (char, size) pair
  const spriteCache = new Map();
  function getSprite(char, size) {
    const key = char + "|" + size;
    if (spriteCache.has(key)) return spriteCache.get(key);
    const pad = 8;
    const dim = size + pad * 2;
    const c = document.createElement("canvas");
    c.width = dim;
    c.height = dim;
    const g = c.getContext("2d");
    g.font = size + "px serif";
    g.textAlign = "center";
    g.textBaseline = "middle";
    g.shadowColor = "rgba(150, 210, 255, 0.75)";
    g.shadowBlur = 6;
    g.fillStyle = "rgb(220, 238, 255)";
    g.fillText(char, dim / 2, dim / 2);
    spriteCache.set(key, c);
    return c;
  }

  function SnowField(canvas, options) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.density = options.density || 1;
    this.flakes = [];
    this.active = false;
    this.rafId = null;
    this.lastTs = 0;
    this._loop = this._loop.bind(this);
  }

  SnowField.prototype.resize = function () {
    const rect = this.canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width || window.innerWidth));
    const height = Math.max(1, Math.round(rect.height || window.innerHeight));
    if (this.canvas.width === width && this.canvas.height === height) return;
    this.canvas.width = width;
    this.canvas.height = height;
    this.populate();
  };

  SnowField.prototype.targetCount = function () {
    // Scale flake count with screen area, capped for low-power machines
    const area = this.canvas.width * this.canvas.height;
    const base = Math.min(140, Math.max(40, Math.round(area / 14000)));
    return Math.round(base * this.density * (reducedMotion ? 0.35 : 1));
  };

  SnowField.prototype.makeFlake = function (fromTop) {
    const size = SIZE_BUCKETS[Math.floor(Math.random() * SIZE_BUCKETS.length)];
    const depth = size / 28; // bigger flakes feel closer: faster and brighter
    return {
      x: Math.random() * this.canvas.width,
      y: fromTop ? -size - Math.random() * 40 : Math.random() * this.canvas.height,
      size: size,
      sprite: getSprite(FLAKE_CHARS[Math.floor(Math.random() * FLAKE_CHARS.length)], size),
      speed: 18 + depth * 55 + Math.random() * 20, // px per second
      sway: 10 + Math.random() * 25,
      swayFreq: 0.4 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2,
      spin: Math.random() * Math.PI * 2,
      spinSpeed: (Math.random() - 0.5) * 1.2,
      opacity: 0.35 + depth * 0.5,
      twinkle: Math.random() * Math.PI * 2
    };
  };

  SnowField.prototype.populate = function () {
    const count = this.targetCount();
    this.flakes = [];
    for (let i = 0; i < count; i++) this.flakes.push(this.makeFlake(false));
  };

  SnowField.prototype.start = function () {
    if (this.active) return;
    this.active = true;
    this.resize();
    if (this.flakes.length === 0) this.populate();
    this.lastTs = 0;
    this.rafId = requestAnimationFrame(this._loop);
  };

  SnowField.prototype.stop = function () {
    this.active = false;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  };

  SnowField.prototype._loop = function (ts) {
    if (!this.active) return;
    // Clamp delta so a backgrounded tab doesn't teleport every flake on return
    const dt = this.lastTs ? Math.min(0.05, (ts - this.lastTs) / 1000) : 0.016;
    this.lastTs = ts;

    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < this.flakes.length; i++) {
      const f = this.flakes[i];
      f.phase += f.swayFreq * dt;
      f.twinkle += dt * 2;
      f.spin += f.spinSpeed * dt;
      f.y += f.speed * dt;
      f.x += Math.sin(f.phase) * f.sway * dt;

      if (f.y > h + f.size) Object.assign(f, this.makeFlake(true));
      if (f.x < -f.size) f.x = w + f.size;
      else if (f.x > w + f.size) f.x = -f.size;

      ctx.globalAlpha = f.opacity * (0.75 + 0.25 * Math.sin(f.twinkle));
      const half = f.sprite.width / 2;
      ctx.setTransform(Math.cos(f.spin), Math.sin(f.spin), -Math.sin(f.spin), Math.cos(f.spin), f.x, f.y);
      ctx.drawImage(f.sprite, -half, -half);
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;

    this.rafId = requestAnimationFrame(this._loop);
  };

  // ---------------------------------------------------------------
  // Wiring: which screens get snow
  // ---------------------------------------------------------------
  const fields = [];

  const backdropCanvas = document.getElementById("snowCanvas");
  const backdropField = backdropCanvas ? new SnowField(backdropCanvas, { density: 1 }) : null;
  if (backdropField) fields.push(backdropField);

  const introCanvas = document.getElementById("introSnowCanvas");
  const introField = introCanvas ? new SnowField(introCanvas, { density: 1.4 }) : null;
  if (introField) fields.push(introField);

  const introSplash = document.getElementById("introSplash");
  const snowyScreens = ["viewRegister", "viewLobby"]
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  function isShown(el) {
    return el && !el.classList.contains("hidden");
  }

  function refresh() {
    if (document.hidden) {
      fields.forEach(function (f) { f.stop(); });
      return;
    }
    if (introField) {
      isShown(introSplash) ? introField.start() : introField.stop();
    }
    if (backdropField) {
      const wantSnow = !isShown(introSplash) && snowyScreens.some(isShown);
      wantSnow ? backdropField.start() : backdropField.stop();
    }
  }

  const observer = new MutationObserver(refresh);
  snowyScreens.concat(introSplash ? [introSplash] : []).forEach(function (el) {
    observer.observe(el, { attributes: true, attributeFilter: ["class"] });
  });

  document.addEventListener("visibilitychange", refresh);

  let resizeTimer = null;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      fields.forEach(function (f) { if (f.active) f.resize(); });
    }, 150);
  });

  refresh();

  window.snowfall = { refresh: refresh };
})();
