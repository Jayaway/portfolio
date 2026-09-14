(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const small = matchMedia("(max-width: 600px)");
  const nav = $("nav");
  const links = $("navLinks");
  const toggle = $("menuToggle");
  const dialog = $("filmDialog");
  const player = $("filmPlayer");
  let menuOpen = false;
  const lockScroll = () => {
    document.body.style.overflow = menuOpen || dialog.open ? "hidden" : "";
  };
  function setMenu(open, restoreFocus = false) {
    menuOpen = open;
    links.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
    lockScroll();
    if (open) links.querySelector("a").focus();
    else if (restoreFocus) toggle.focus();
  }
  toggle.addEventListener("click", () => setMenu(!menuOpen));
  links
    .querySelectorAll("a")
    .forEach((link) => link.addEventListener("click", () => setMenu(false)));
  small.addEventListener("change", () => setMenu(false));
  document.addEventListener("keydown", (event) => {
    if (!menuOpen) return;
    if (event.key === "Escape") setMenu(false, true);
    if (event.key !== "Tab") return;
    const first = links.querySelector("a");
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      toggle.focus();
    } else if (!event.shiftKey && document.activeElement === toggle) {
      event.preventDefault();
      first.focus();
    }
  });
  const updateNav = () => nav.classList.toggle("scrolled", scrollY > 40);
  addEventListener("scroll", updateNav, { passive: true });
  updateNav();
  if ("IntersectionObserver" in window) {
    const reveal = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            reveal.unobserve(entry.target);
          }
        }),
      { threshold: 0, rootMargin: "0px 0px -20px 0px" },
    );
    document.querySelectorAll(".reveal").forEach((el) => reveal.observe(el));
    document.documentElement.classList.add("js");
    const sectionObserver = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.querySelectorAll("a").forEach((link) => {
            if (link.hash === "#" + entry.target.id)
              link.setAttribute("aria-current", "location");
            else link.removeAttribute("aria-current");
          });
        }),
      { rootMargin: "-15% 0px -60% 0px" },
    );
    document
      .querySelectorAll("main section[id]")
      .forEach((el) => sectionObserver.observe(el));
  }
  $("copyEmail").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText("songsoc@126.com");
      $("copyStatus").textContent = "邮箱已复制";
    } catch {
      $("copyStatus").textContent = "请手动复制：songsoc@126.com";
    }
  });
  function mediaURL(value) {
    if (!value || typeof value !== "string") return "";
    try {
      const url = new URL(value, location.href);
      return ["https:", "http:"].includes(url.protocol) ? url.href : "";
    } catch {
      return "";
    }
  }
  let lastFilmButton;
  function openFilm(film, button) {
    lastFilmButton = button;
    $("filmTitle").textContent = film.title;
    $("filmDescription").textContent = [film.role, film.description]
      .filter(Boolean)
      .join(" · ");
    $("filmError").textContent = "";
    player.src = mediaURL(film.src);
    player.poster = mediaURL(film.poster);
    dialog.showModal();
    lockScroll();
    player.play().catch(() => {
      $("filmError").textContent = "点击播放器的播放按钮开始观看。";
    });
  }
  $("closeFilm").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      if (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
      )
        dialog.close();
    }
  });
  dialog.addEventListener("close", () => {
    player.pause();
    player.removeAttribute("src");
    player.load();
    lockScroll();
    lastFilmButton?.focus();
  });
  player.addEventListener("error", () => {
    if (player.hasAttribute("src"))
      $("filmError").textContent =
        "视频暂时无法加载，请稍后重试，或邮件联系获取作品。";
  });
  function renderFilms(films) {
    const entries = films.filter((film) => film.title && mediaURL(film.src));
    $("filmEmpty").hidden = entries.length > 0;
    for (const film of entries) {
      const card = document.createElement("article");
      card.className = "film-card";
      const button = document.createElement("button");
      button.className = "film-cover";
      button.setAttribute("aria-label", "播放：" + film.title);
      if (mediaURL(film.poster)) {
        const img = document.createElement("img");
        img.src = mediaURL(film.poster);
        img.alt = "";
        img.loading = "lazy";
        img.decoding = "async";
        button.append(img);
      }
      const play = document.createElement("span");
      play.className = "film-play";
      play.textContent = "▷";
      play.setAttribute("aria-hidden", "true");
      button.append(play);
      button.addEventListener("click", () => openFilm(film, button));
      const caption = document.createElement("div");
      caption.className = "film-caption";
      const title = document.createElement("h3");
      title.textContent = film.title;
      const meta = document.createElement("p");
      meta.textContent = [film.category, film.role, film.year]
        .filter(Boolean)
        .join(" / ");
      caption.append(title, meta);
      card.append(button, caption);
      $("filmGrid").append(card);
    }
  }
  function initBackground(config) {
    const video = $("backgroundVideo");
    const control = $("motionToggle");
    let manualPause = false;
    let failed = false;
    let target = 0;
    let previousX = null;
    const enabled = () => !manualPause && !reduced.matches && !failed;
    const seek = () => {
      if (
        !enabled() ||
        document.hidden ||
        video.seeking ||
        video.readyState < 1 ||
        !Number.isFinite(video.duration)
      )
        return;
      if (Math.abs(video.currentTime - target) > 0.035)
        video.currentTime = target;
    };
    const update = () => {
      previousX = null;
      control.textContent = failed
        ? "背景暂不可用"
        : reduced.matches
          ? "背景动效：已减少"
          : enabled()
            ? "背景动效：开启"
            : "背景动效：暂停";
      control.setAttribute("aria-pressed", String(!enabled()));
      control.disabled = reduced.matches || failed;
      if (enabled() && !video.getAttribute("src") && mediaURL(config.src))
        video.src = mediaURL(config.src);
    };
    video.poster = mediaURL(config.poster);
    video.muted = true;
    control.addEventListener("click", () => {
      manualPause = !manualPause;
      update();
    });
    reduced.addEventListener("change", update);
    video.addEventListener("seeked", seek);
    video.addEventListener("error", () => {
      failed = true;
      video.hidden = true;
      update();
    });
    addEventListener(
      "pointermove",
      (event) => {
        if (
          !enabled() ||
          dialog.open ||
          menuOpen ||
          document.hidden ||
          event.pointerType !== "mouse"
        ) {
          previousX = null;
          return;
        }
        if (previousX !== null && Number.isFinite(video.duration)) {
          const sensitivity = Number.isFinite(config.sensitivity)
            ? config.sensitivity
            : 0.8;
          target = Math.max(
            0,
            Math.min(
              Math.max(0, video.duration - 0.05),
              target +
                ((event.clientX - previousX) / innerWidth) *
                  sensitivity *
                  video.duration,
            ),
          );
          seek();
        }
        previousX = event.clientX;
      },
      { passive: true },
    );
    document.documentElement.addEventListener("pointerleave", () => {
      previousX = null;
    });
    document.addEventListener("visibilitychange", () => {
      previousX = null;
    });
    // Touch devices scrub with page progress without blocking vertical scrolling.
    addEventListener(
      "scroll",
      () => {
        if (
          !matchMedia("(pointer: coarse)").matches ||
          !enabled() ||
          !Number.isFinite(video.duration)
        )
          return;
        const distance = document.documentElement.scrollHeight - innerHeight;
        target =
          distance > 0
            ? Math.max(0, Math.min(1, scrollY / distance)) *
              Math.max(0, video.duration - 0.05)
            : 0;
        seek();
      },
      { passive: true },
    );
    update();
  }
  fetch("data/site.json")
    .then((response) => {
      if (!response.ok) throw new Error("Config unavailable");
      return response.json();
    })
    .then((config) => {
      renderFilms(Array.isArray(config.films) ? config.films : []);
      initBackground(config.background || {});
    })
    .catch(() => {
      $("motionToggle").textContent = "背景暂不可用";
      $("motionToggle").disabled = true;
    });
})();
