/* ============================================================
   个人站 — 交互逻辑
   1. 移动端汉堡菜单
   2. 导航栏滚动效果
   3. 当前可视区块高亮导航
   4. 滚动渐入动画
   ============================================================ */

(function () {
  'use strict';

  /* ---- DOM 引用 ---- */
  const nav = document.getElementById('nav');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const allNavLinks = navLinks.querySelectorAll('a');
  const fadeElements = document.querySelectorAll('.fade-up');


  /* ============================================================
     1. 移动端汉堡菜单
     ============================================================ */

  function closeMenu() {
    navToggle.classList.remove('open');
    navLinks.classList.remove('open');
  }

  function openMenu() {
    navToggle.classList.add('open');
    navLinks.classList.add('open');
  }

  navToggle.addEventListener('click', function () {
    const isOpen = navLinks.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });

  // 点击导航链接后关闭菜单
  allNavLinks.forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // 点击页面其他区域关闭菜单
  document.addEventListener('click', function (e) {
    if (!nav.contains(e.target)) {
      closeMenu();
    }
  });


  /* ============================================================
     2. 导航栏滚动效果
     ============================================================ */

  function updateNavStyle() {
    if (window.scrollY > 20) {
      nav.classList.add('nav--scrolled');
    } else {
      nav.classList.remove('nav--scrolled');
    }
  }

  window.addEventListener('scroll', updateNavStyle, { passive: true });
  updateNavStyle(); // 初始检测（防止刷新时已在页面中部）


  /* ============================================================
     3. 可视区块检测 → 导航高亮
     ============================================================ */

  // 收集所有带 id 的 section
  var sectionIds = [];
  allNavLinks.forEach(function (link) {
    var href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      sectionIds.push(href.slice(1));
    }
  });

  // IntersectionObserver — 现代浏览器都支持
  if ('IntersectionObserver' in window) {
    var observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px', // 区块接近顶部时触发
      threshold: 0,
    };

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          // 移除所有 active
          allNavLinks.forEach(function (a) { a.classList.remove('active'); });
          // 高亮对应链接
          var activeLink = navLinks.querySelector('[href="#' + entry.target.id + '"]');
          if (activeLink) {
            activeLink.classList.add('active');
          }
        }
      });
    }, observerOptions);

    // 观察所有区块
    sectionIds.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }


  /* ============================================================
     4. 滚动渐入动画（fade-up）
     ============================================================ */

  if ('IntersectionObserver' in window && fadeElements.length > 0) {
    var fadeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          fadeObserver.unobserve(entry.target); // 只触发一次
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -40px 0px', // 元素底部进入视口前 40px 触发
      threshold: 0,
    });

    fadeElements.forEach(function (el) {
      fadeObserver.observe(el);
    });
  } else {
    // 兜底：不支持 IntersectionObserver 就直接显示
    fadeElements.forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* ============================================================
     5. Email 弹窗 & 复制
     ============================================================ */

  var btnEmail = document.getElementById('btnEmail');
  var emailModal = document.getElementById('emailModal');
  var btnModalClose = document.getElementById('btnModalClose');
  var btnCopyEmail = document.getElementById('btnCopyEmail');
  var copyToast = document.getElementById('copyToast');

  if (btnEmail && emailModal) {

    // 打开弹窗
    btnEmail.addEventListener('click', function () {
      emailModal.classList.add('open');
      // 重置 toast
      copyToast.classList.remove('show');
      copyToast.textContent = '✓ 已复制';
    });

    // 关闭弹窗
    function closeModal() {
      emailModal.classList.remove('open');
    }

    btnModalClose.addEventListener('click', closeModal);

    // 点击遮罩关闭
    emailModal.addEventListener('click', function (e) {
      if (e.target === emailModal) closeModal();
    });

    // ESC 关闭
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && emailModal.classList.contains('open')) {
        closeModal();
      }
    });

    // 复制到剪贴板
    if (btnCopyEmail) {
      btnCopyEmail.addEventListener('click', function () {
        var email = 'songsoc@126.com';
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(email).then(function () {
            copyToast.classList.add('show');
          }).catch(function () {
            // 降级方案
            fallbackCopy(email);
          });
        } else {
          fallbackCopy(email);
        }
      });
    }

    function fallbackCopy(text) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      ta.style.top = '-9999px';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try {
        var ok = document.execCommand('copy');
        copyToast.textContent = ok ? '✓ 已复制' : '✗ 复制失败，请手动复制';
        copyToast.classList.add('show');
      } catch (e) {
        copyToast.textContent = '✗ 复制失败，请手动复制';
        copyToast.classList.add('show');
      }
      document.body.removeChild(ta);
    }
  }

})();
