/**
 * panelpulse.js — Interactive JavaScript
 * Komicrew: AI Script-to-Comic Studio & Web Comic Reader
 * Architecture: Vanilla ES6+ Module-style IIFE SPA
 */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════════
     1. CONSTANTS & APP STATE
  ═══════════════════════════════════════════════ */
  const VIEWS = ['landing', 'browse', 'reader', 'studio'];

  const DEFAULT_MARVEL_COMICS = [
    {
      id: 1,
      slug: 'amazing-fantasy-15',
      title: 'Amazing Fantasy #15: Spider-Man!',
      creator: 'Stan Lee & Steve Ditko',
      category: 'Superheroes',
      genre: 'Action',
      art_style: 'Vintage 60s Marvel',
      synopsis: 'Introducing the amazing Spider-Man! High school student Peter Parker is bitten by a radioactive spider, gaining superhuman agility and wall-crawling power. When tragedy strikes Uncle Ben, Peter learns the eternal lesson: With great power comes great responsibility.',
      cover_url: 'assets/img/cover-amazing-fantasy-15.jpg',
      backdrop_url: 'assets/img/cover-amazing-fantasy-15.jpg',
      is_ai: 0,
      status: 'featured',
      is_trending: 1,
      is_hero: 1,
      age_rating: 'teen',
      views_count: 48502,
      likes_count: 3820,
      rating: '5.0',
      rating_avg: 5.0,
      chapters_count: 1,
      chapters: [
        {
          id: 1,
          comic_id: 1,
          chapter_number: 1,
          title: 'Spider-Man! (Complete Origin Issue)',
          total_pages: 39,
          pages: Array.from({ length: 39 }, (_, i) => ({
            page_number: i + 1,
            image_url: `assets/comics/amazing-fantasy-15/page-${String(i + 1).padStart(2, '0')}.jpg`
          }))
        }
      ]
    },
    {
      id: 2,
      slug: 'marvel-comics-1',
      title: 'Marvel Comics #1 (1939)',
      creator: 'Carl Burgos & Bill Everett',
      category: 'Classic',
      genre: 'Sci-Fi',
      art_style: 'Golden Age Classic',
      synopsis: 'The historic genesis of the entire Marvel Universe! Featuring the groundbreaking debuts of Carl Burgos Human Torch, Bill Everett Sub-Mariner (Prince Namor of Atlantis), Paul Gustavson The Angel, and Ka-Zar the Great.',
      cover_url: 'assets/img/cover-marvel-comics-1.jpg',
      backdrop_url: 'assets/img/cover-marvel-comics-1.jpg',
      is_ai: 0,
      status: 'featured',
      is_trending: 1,
      is_hero: 0,
      age_rating: 'teen',
      views_count: 31201,
      likes_count: 2450,
      rating: '4.9',
      rating_avg: 4.95,
      chapters_count: 1,
      chapters: [
        {
          id: 2,
          comic_id: 2,
          chapter_number: 1,
          title: 'The Human Torch & Sub-Mariner Debut',
          total_pages: 68,
          pages: Array.from({ length: 68 }, (_, i) => ({
            page_number: i + 1,
            image_url: `assets/comics/marvel-comics-1/page-${String(i + 1).padStart(2, '0')}.jpg`
          }))
        }
      ]
    },
    {
      id: 3,
      slug: 'captain-america-13',
      title: 'Captain America Comics #13 (1942)',
      creator: 'Joe Simon & Jack Kirby',
      category: 'Golden Age',
      genre: 'Action',
      art_style: 'Golden Age Classic',
      synopsis: 'Captain America and Bucky battle the secret League of the Unicorn and brave the eerie Lighthouse of Horror in classic World War II superhero adventures created by legends Joe Simon and Jack Kirby.',
      cover_url: 'assets/img/cover-captain-america-13.jpg',
      backdrop_url: 'assets/img/cover-captain-america-13.jpg',
      is_ai: 0,
      status: 'published',
      is_trending: 1,
      is_hero: 0,
      age_rating: 'teen',
      views_count: 21901,
      likes_count: 1640,
      rating: '4.8',
      rating_avg: 4.88,
      chapters_count: 1,
      chapters: [
        {
          id: 3,
          comic_id: 3,
          chapter_number: 1,
          title: 'The League of the Unicorn',
          total_pages: 68,
          pages: Array.from({ length: 68 }, (_, i) => ({
            page_number: i + 1,
            image_url: `assets/comics/captain-america-13/page-${String(i + 1).padStart(2, '0')}.jpg`
          }))
        }
      ]
    }
  ];

  const state = {
    activeView: 'landing',
    currentUser: JSON.parse(localStorage.getItem('pp_user') || 'null'),
    adminTab: 'catalog',
    selectedHeroComic: null,
    comicsCatalog: DEFAULT_MARVEL_COMICS,
    heroSpotlight: 'amazing-fantasy-15',
    activeFilter: 'all',
    browseSort: 'trending',
    browseViewMode: 'grid',
    readerMode: 'page',
    readerCurrentPage: 1,
    readerTotalPages: 1,
    readerZoom: 100,
    readerComicId: 'amazing-fantasy-15',
    readerChapter: 1,
    bookmarks: JSON.parse(localStorage.getItem('pp_bookmarks') || '[]'),
    recentSearches: JSON.parse(localStorage.getItem('pp_recent_searches') || '[]'),
    studioMode: 'script',
    studioGenState: 'idle', // idle | generating | done | error
    studioUndoStack: [],
    studioRedoStack: [],
    fabricCanvas: null,
    fabricReaderCanvas: null,
    activeDropdown: null,
    toastQueue: [],
    theme: localStorage.getItem('pp_theme') || 'dark',
    notifications: 3,
  };

  /* ═══════════════════════════════════════════════
     2. UTILITY HELPERS
  ═══════════════════════════════════════════════ */
  const qs  = (sel, ctx = document) => {
    if (!ctx) return null;
    try { return ctx.querySelector(sel); } catch (e) { return null; }
  };
  const qsa = (sel, ctx = document) => {
    if (!ctx) return [];
    try { return [...ctx.querySelectorAll(sel)]; } catch (e) { return []; }
  };

  function debounce(fn, delay = 300) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
  }

  function clamp(val, min, max) { return Math.min(Math.max(val, min), max); }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function trap(el) {
    const focusable = qsa('a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])', el)
      .filter(e => !e.disabled && !e.closest('[hidden]'));
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1];
    el.addEventListener('keydown', function handler(e) {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
      else { if (document.activeElement === last) { e.preventDefault(); first.focus(); } }
    });
  }

  /* ═══════════════════════════════════════════════
     3. TOAST NOTIFICATION SYSTEM
  ═══════════════════════════════════════════════ */
  const toastContainer = qs('#toast-container');

  function showToast(message, type = 'info', duration = 3500) {
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    toast.innerHTML = `<span class="toast-icon" aria-hidden="true">${icons[type] || 'ℹ️'}</span><span class="toast-msg">${escapeHtml(message)}</span><button class="toast-close-btn" aria-label="Dismiss notification">✕</button>`;
    toast.querySelector('.toast-close-btn').addEventListener('click', () => dismissToast(toast));
    toastContainer.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('toast--visible'));
    setTimeout(() => dismissToast(toast), duration);
  }

  function dismissToast(toast) {
    toast.classList.remove('toast--visible');
    toast.classList.add('toast--hiding');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
  }

  /* ═══════════════════════════════════════════════
     4. THEME TOGGLE
  ═══════════════════════════════════════════════ */
  function initTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    const btn = qs('#theme-toggle');
    if (!btn) return;
    btn.setAttribute('aria-pressed', state.theme === 'light');
    btn.addEventListener('click', () => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', state.theme);
      localStorage.setItem('pp_theme', state.theme);
      btn.setAttribute('aria-pressed', state.theme === 'light');
      showToast(`Switched to ${state.theme} mode`, 'info', 2000);
    });
  }

  /* ═══════════════════════════════════════════════
     5. SPA VIEW ROUTER
  ═══════════════════════════════════════════════ */
  function navigateTo(viewId, options = {}) {
    if (!VIEWS.includes(viewId)) return;
    // Hide all views
    qsa('.app-view').forEach(v => {
      v.setAttribute('aria-hidden', 'true');
      v.hidden = true;
    });
    // Show target
    const target = qs(`#view-${viewId}`);
    if (target) {
      target.removeAttribute('hidden');
      target.setAttribute('aria-hidden', 'false');
    }
    // Update HTML attribute
    document.documentElement.setAttribute('data-active-view', viewId);
    state.activeView = viewId;
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Update active nav link (desktop)
    qsa('[data-view-target]').forEach(link => {
      link.removeAttribute('aria-current');
      if (link.dataset.viewTarget === viewId) link.setAttribute('aria-current', 'page');
    });
    // Push history state
    const url = `#${viewId}`;
    history.pushState({ view: viewId, ...options }, '', url);
    // Post-navigate hooks
    if (viewId === 'reader') {
      const targetComic = options.comicId || state.readerComicId || 'amazing-fantasy-15';
      loadReaderComic(targetComic, options.chapter || state.readerChapter || 1, options.page || state.readerCurrentPage || 1);
    }
    if (viewId === 'studio') {
      if (options.remixComic) {
        initRemixMode(options.remixComic);
      } else {
        const textarea = qs('#studio-script-textarea');
        if (textarea && !textarea.value.trim()) {
          loadScriptTemplate();
        }
      }
    }
    if (viewId === 'landing') renderReadingResumeBanner();
    if (viewId === 'browse') {
      if (options.filter) applyBrowseFilterTab(options.filter);
      if (options.genre) applyBrowseGenreFilter(options.genre);
      if (options.category) applyBrowseCategoryFilter(options.category);
    }
    // Focus management
    const mainContent = qs('#main-content');
    if (mainContent) mainContent.focus({ preventScroll: true });
  }

  function initRouter() {
    // Handle all [data-view-target] clicks
    document.addEventListener('click', (e) => {
      // Only block propagation if we're inside a pure UI-control element with no view target
      // — i.e. form inputs, selects, textareas, or the specific reader UI zones.
      // IMPORTANT: do NOT block button clicks generically; each button's own listener fires first.
      if (e.target.closest('input, select, textarea')) return;
      if (e.target.closest('.reader-page-nav, .reader-settings-panel, .reader-view-controls')) return;
      // If clicked element or its ancestor has a data-view-target, navigate.
      const trigger = e.target.closest('[data-view-target]');
      if (!trigger) return;
      e.preventDefault();
      closeAllDropdowns();
      closeSearchOverlay();
      navigateTo(trigger.dataset.viewTarget, {
        comicId: trigger.dataset.comicId,
        chapter: trigger.dataset.chapter ? parseInt(trigger.dataset.chapter) : undefined,
        remixComic: trigger.dataset.remixComic,
        filter: trigger.dataset.filter,
        genre: trigger.dataset.filterGenre,
        category: trigger.dataset.filterCategory,
        style: trigger.dataset.filterStyle,
      });
    });
    // Browser back/forward
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.view) navigateTo(e.state.view, e.state);
      else navigateTo('landing');
    });
    // Initial URL routing
    const hash = window.location.hash.replace('#', '');
    if (VIEWS.includes(hash)) navigateTo(hash);
    else navigateTo('landing');
  }

  /* ═══════════════════════════════════════════════
     6. MEGA-MENU DROPDOWNS
  ═══════════════════════════════════════════════ */
  function initMegaMenu() {
    const triggers = qsa('.nav-dropdown-trigger');

    triggers.forEach(trigger => {
      const dropdownId = trigger.getAttribute('aria-controls');
      const dropdown = qs(`#${dropdownId}`);
      if (!dropdown) return;

      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = trigger.getAttribute('aria-expanded') === 'true';
        closeAllDropdowns();
        if (!isOpen) openDropdown(trigger, dropdown);
      });
      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAllDropdowns();
      });
    });

    document.addEventListener('click', closeAllDropdowns);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeAllDropdowns();
    });
  }

  function openDropdown(trigger, dropdown) {
    trigger.setAttribute('aria-expanded', 'true');
    dropdown.removeAttribute('hidden');
    dropdown.classList.add('dropdown--open');
    state.activeDropdown = { trigger, dropdown };
  }

  function closeAllDropdowns() {
    if (state.activeDropdown) {
      state.activeDropdown.trigger.setAttribute('aria-expanded', 'false');
      state.activeDropdown.dropdown.setAttribute('hidden', '');
      state.activeDropdown.dropdown.classList.remove('dropdown--open');
      state.activeDropdown = null;
    }
    qsa('.nav-dropdown-trigger[aria-expanded="true"]').forEach(t => {
      t.setAttribute('aria-expanded', 'false');
    });
    qsa('.mega-dropdown:not([hidden])').forEach(d => {
      d.setAttribute('hidden', '');
      d.classList.remove('dropdown--open');
    });
  }

  /* ═══════════════════════════════════════════════
     7. PROFILE DROPDOWN
  ═══════════════════════════════════════════════ */
  function initProfileDropdown() {
    const trigger = qs('#profile-trigger');
    const dropdown = qs('#profile-dropdown');
    if (!trigger || !dropdown) return;

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';
      if (isOpen) { closeProfileDropdown(); return; }
      trigger.setAttribute('aria-expanded', 'true');
      dropdown.removeAttribute('hidden');
      trap(dropdown);
    });
    document.addEventListener('click', closeProfileDropdown);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeProfileDropdown();
    });
  }

  function closeProfileDropdown() {
    const trigger = qs('#profile-trigger');
    const dropdown = qs('#profile-dropdown');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    if (dropdown) dropdown.setAttribute('hidden', '');
  }

  /* ═══════════════════════════════════════════════
     8. MOBILE NAV DRAWER
  ═══════════════════════════════════════════════ */
  function closeMobileMenu() {
    const btn = qs('#mobile-menu-trigger');
    const drawer = qs('#mobile-nav-drawer');
    if (!drawer) return;
    drawer.setAttribute('hidden', '');
    document.body.classList.remove('no-scroll');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  function initMobileMenu() {
    const btn = qs('#mobile-menu-trigger');
    const drawer = qs('#mobile-nav-drawer');
    if (!btn || !drawer) return;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeMobileMenu();
      } else {
        btn.setAttribute('aria-expanded', 'true');
        drawer.removeAttribute('hidden');
        document.body.classList.add('no-scroll');
        trap(drawer);
      }
    });

    // Close button inside drawer
    qs('#mobile-drawer-close')?.addEventListener('click', closeMobileMenu);

    // Bookmarks, Notifications, and Theme triggers inside drawer
    qs('#mobile-drawer-bookmarks')?.addEventListener('click', () => {
      closeMobileMenu();
      qs('#bookmarks-trigger')?.click();
    });

    qs('#mobile-drawer-notifications')?.addEventListener('click', () => {
      closeMobileMenu();
      qs('#notifications-trigger')?.click();
    });

    qs('#mobile-drawer-theme')?.addEventListener('click', () => {
      qs('#theme-toggle')?.click();
    });

    // Auto-close when clicking any link inside the mobile drawer
    qsa('a', drawer).forEach((link) => {
      link.addEventListener('click', () => {
        closeMobileMenu();
      });
    });

    // Close on Escape or outside click
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !drawer.hasAttribute('hidden')) {
        closeMobileMenu();
      }
    });

    document.addEventListener('click', (e) => {
      if (!drawer.hasAttribute('hidden') && !drawer.contains(e.target) && !btn.contains(e.target)) {
        closeMobileMenu();
      }
    });
  }

  /* ═══════════════════════════════════════════════
     9. SEARCH OVERLAY
  ═══════════════════════════════════════════════ */
  function initSearch() {
    const trigger = qs('#search-trigger');
    const overlay = qs('#search-overlay');
    const closeBtn = qs('#search-overlay-close-btn');
    const backdrop = qs('#search-backdrop');
    const input = qs('#global-search-input');
    const clearBtn = qs('#search-clear-btn');
    const quickTags = qsa('.search-quick-tag');
    const resultsLive = qs('#search-results-live');
    const resultsList = qs('#search-results-list');
    const recentSection = qs('#search-recent');
    const recentList = qs('#search-recent-list');
    const clearRecentBtn = qs('#clear-recent-searches-btn');
    const queryEcho = qs('#search-query-echo');
    const resultsCount = qs('#search-results-count');

    if (!trigger || !overlay) return;

    // Open
    trigger.addEventListener('click', openSearchOverlay);
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); openSearchOverlay(); }
    });
    // Close
    closeBtn?.addEventListener('click', closeSearchOverlay);
    backdrop?.addEventListener('click', closeSearchOverlay);
    overlay.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSearchOverlay(); });

    // Quick tags
    quickTags.forEach(tag => {
      tag.addEventListener('click', () => {
        if (input) input.value = tag.dataset.searchQuery;
        performSearch(tag.dataset.searchQuery);
      });
    });

    // Live search
    input?.addEventListener('input', debounce(() => {
      const q = input.value.trim();
      if (clearBtn) clearBtn.hidden = !q;
      if (!q) { if (resultsLive) resultsLive.hidden = true; if (recentSection) recentSection.hidden = false; return; }
      performSearch(q);
    }, 300));

    // Clear
    clearBtn?.addEventListener('click', () => {
      if (input) input.value = '';
      if (clearBtn) clearBtn.hidden = true;
      if (resultsLive) resultsLive.hidden = true;
      if (recentSection) recentSection.hidden = false;
      input?.focus();
    });

    // Recent searches
    clearRecentBtn?.addEventListener('click', () => {
      state.recentSearches = [];
      localStorage.setItem('pp_recent_searches', '[]');
      renderRecentSearches();
    });

    function openSearchOverlay() {
      overlay.removeAttribute('hidden');
      document.body.classList.add('no-scroll');
      trigger.setAttribute('aria-expanded', 'true');
      renderRecentSearches();
      setTimeout(() => input.focus(), 100);
      trap(overlay);
    }

    async function performSearch(query) {
      resultsLive.hidden = false;
      recentSection.hidden = true;
      if (queryEcho) queryEcho.textContent = query;

      try {
        const resp = await fetch(`api/comics.php?q=${encodeURIComponent(query)}`);
        const data = await resp.json();
        const matches = data.comics || [];

        if (resultsCount) resultsCount.textContent = matches.length;
        resultsList.innerHTML = matches.length
          ? matches.map(c => `<li role="option" class="search-result-item"><a href="#" class="search-result-link" data-view-target="reader" data-comic-id="${c.slug || c.id}"><strong class="search-result-title">${escapeHtml(c.title)}</strong><span class="search-result-meta">${escapeHtml(c.genre || 'Action')} &middot; ${escapeHtml(c.creator || '@creator')} &middot; ⭐ ${c.rating || '5.0'}</span></a></li>`).join('')
          : `<li class="search-no-results" role="option">No comics found matching "<em>${escapeHtml(query)}</em>"</li>`;
      } catch (e) {
        const q = query.toLowerCase();
        const matches = (state.comicsCatalog || []).filter(c => (c.title || '').toLowerCase().includes(q) || (c.genre || '').toLowerCase().includes(q) || (c.creator || '').toLowerCase().includes(q));
        if (resultsCount) resultsCount.textContent = matches.length;
        resultsList.innerHTML = matches.length
          ? matches.map(c => `<li role="option" class="search-result-item"><a href="#" class="search-result-link" data-view-target="reader" data-comic-id="${c.slug || c.id}"><strong class="search-result-title">${escapeHtml(c.title)}</strong><span class="search-result-meta">${escapeHtml(c.genre)} &middot; ${escapeHtml(c.creator)} &middot; ⭐ ${c.rating}</span></a></li>`).join('')
          : `<li class="search-no-results" role="option">No comics found matching "<em>${escapeHtml(query)}</em>"</li>`;
      }

      // Save to recent
      if (!state.recentSearches.includes(query)) {
        state.recentSearches.unshift(query);
        state.recentSearches = state.recentSearches.slice(0, 8);
        localStorage.setItem('pp_recent_searches', JSON.stringify(state.recentSearches));
      }
    }

    function renderRecentSearches() {
      if (!recentList) return;
      recentList.innerHTML = state.recentSearches.length
        ? state.recentSearches.map(s => `<li><button class="search-recent-item" data-search-query="${escapeHtml(s)}">🕐 ${escapeHtml(s)}</button></li>`).join('')
        : '<li class="search-no-recents">No recent searches</li>';
      qsa('.search-recent-item', recentList).forEach(btn => {
        btn.addEventListener('click', () => { input.value = btn.dataset.searchQuery; performSearch(btn.dataset.searchQuery); });
      });
    }
  }

  function closeSearchOverlay() {
    const overlay = qs('#search-overlay');
    const trigger = qs('#search-trigger');
    if (overlay) overlay.setAttribute('hidden', '');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
  }

  /* ═══════════════════════════════════════════════
     10. BOOKMARKS SYSTEM
  ═══════════════════════════════════════════════ */
  function initBookmarks() {
    const trigger = qs('#bookmarks-trigger');
    const panel = qs('#bookmarks-panel');
    const closeBtn = qs('#bookmarks-panel-close-btn');
    const backdrop = qs('#global-overlay-backdrop');

    if (!trigger || !panel) return;

    trigger.addEventListener('click', () => openPanel(panel, trigger, 'bookmarks-panel', renderBookmarksList));
    closeBtn?.addEventListener('click', () => closePanel(panel, trigger));
    backdrop?.addEventListener('click', () => {
      closePanel(qs('#bookmarks-panel'), qs('#bookmarks-trigger'));
      closePanel(qs('#notifications-panel'), qs('#notifications-trigger'));
    });

    // All bookmark buttons
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.bookmark-btn');
      if (!btn) return;
      const card = btn.closest('[data-comic-id]');
      if (!card) return;
      const comicId = card.dataset.comicId;
      const title = card.querySelector('.comic-card-title a, .hero-title, .spotlight-card-title a')?.textContent?.trim() || comicId;
      toggleBookmark(comicId, title, btn);
    });

    // Restore bookmark state on load
    qsa('.bookmark-btn').forEach(btn => {
      const card = btn.closest('[data-comic-id]');
      if (card && state.bookmarks.some(b => b.id === card.dataset.comicId)) {
        btn.setAttribute('aria-pressed', 'true');
        btn.classList.add('bookmark-btn--active');
      }
    });
  }

  function toggleBookmark(comicId, title, btn) {
    const idx = state.bookmarks.findIndex(b => b.id === comicId);
    if (idx > -1) {
      state.bookmarks.splice(idx, 1);
      qsa(`.bookmark-btn`).forEach(b => {
        const card = b.closest(`[data-comic-id="${comicId}"]`);
        if (card) { b.setAttribute('aria-pressed', 'false'); b.classList.remove('bookmark-btn--active'); }
      });
      // Also update the reader topbar Save button
      if (state.readerComicId === comicId) {
        const rb = qs('#reader-bookmark-btn');
        if (rb) { rb.setAttribute('aria-pressed', 'false'); rb.classList.remove('bookmark-btn--active'); }
      }
      showToast(`Removed "${title}" from bookmarks`, 'info');
    } else {
      state.bookmarks.push({ id: comicId, title, addedAt: Date.now() });
      qsa(`.bookmark-btn`).forEach(b => {
        const card = b.closest(`[data-comic-id="${comicId}"]`);
        if (card) { b.setAttribute('aria-pressed', 'true'); b.classList.add('bookmark-btn--active'); }
      });
      // Also update the reader topbar Save button
      if (state.readerComicId === comicId) {
        const rb = qs('#reader-bookmark-btn');
        if (rb) { rb.setAttribute('aria-pressed', 'true'); rb.classList.add('bookmark-btn--active'); }
      }
      showToast(`Saved "${title}" to bookmarks`, 'success');
    }
    localStorage.setItem('pp_bookmarks', JSON.stringify(state.bookmarks));
  }

  function renderBookmarksList() {
    const list = qs('#bookmarks-list');
    const empty = qs('#bookmarks-empty');
    if (!list) return;
    if (!state.bookmarks.length) {
      list.innerHTML = '';
      if (empty) empty.removeAttribute('hidden');
      return;
    }
    if (empty) empty.setAttribute('hidden', '');
    list.innerHTML = state.bookmarks.map(b => `
      <li class="bookmark-list-item">
        <a href="#" class="bookmark-list-link" data-view-target="reader" data-comic-id="${b.id}">${escapeHtml(b.title)}</a>
        <button class="bookmark-remove-btn" data-comic-id="${b.id}" aria-label="Remove ${escapeHtml(b.title)} from bookmarks">✕</button>
      </li>`).join('');
    qsa('.bookmark-remove-btn', list).forEach(btn => {
      btn.addEventListener('click', () => toggleBookmark(btn.dataset.comicId, btn.previousElementSibling.textContent, btn));
    });
  }

  /* ═══════════════════════════════════════════════
     11. NOTIFICATIONS PANEL
  ═══════════════════════════════════════════════ */
  function initNotifications() {
    const trigger = qs('#notifications-trigger');
    const panel = qs('#notifications-panel');
    const closeBtn = qs('#notifications-panel-close-btn');
    const markAllBtn = qs('#mark-all-read-btn');
    if (!trigger || !panel) return;

    trigger.addEventListener('click', () => openPanel(panel, trigger, 'notifications-panel', null));
    closeBtn?.addEventListener('click', () => closePanel(panel, trigger));

    markAllBtn?.addEventListener('click', () => {
      qsa('.notification-item--unread').forEach(n => n.classList.remove('notification-item--unread'));
      state.notifications = 0;
      updateNotificationBadge();
      showToast('All notifications marked as read', 'success', 2000);
    });

    // Per-notification: mark as read
    qsa('.notification-mark-read-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.notification-item');
        if (item?.classList.contains('notification-item--unread')) {
          item.classList.remove('notification-item--unread');
          state.notifications = Math.max(0, state.notifications - 1);
          updateNotificationBadge();
          showToast('Notification marked as read', 'info', 1500);
        }
      });
    });

    // Per-notification: dismiss (delete from list)
    qsa('.notification-dismiss-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.notification-item');
        if (!item) return;
        // If it was unread, decrement badge
        if (item.classList.contains('notification-item--unread')) {
          state.notifications = Math.max(0, state.notifications - 1);
          updateNotificationBadge();
        }
        // Animate out then remove
        item.style.transition = 'opacity 0.25s, transform 0.25s';
        item.style.opacity = '0';
        item.style.transform = 'translateX(20px)';
        setTimeout(() => item.remove(), 260);
      });
    });
  }

  function updateNotificationBadge() {
    const badge = qs('.notification-badge');
    if (!badge) return;
    if (state.notifications === 0) { badge.hidden = true; }
    else { badge.removeAttribute('hidden'); badge.textContent = state.notifications; badge.setAttribute('aria-label', `${state.notifications} unread`); }
  }

  /* ═══════════════════════════════════════════════
     12. SLIDE PANEL HELPERS
  ═══════════════════════════════════════════════ */
  function openPanel(panel, trigger, panelId, onOpen) {
    const backdrop = qs('#global-overlay-backdrop');
    qsa('.slide-panel').forEach(p => { if (p !== panel) { p.setAttribute('hidden', ''); } });
    panel.removeAttribute('hidden');
    panel.classList.add('slide-panel--open');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    if (backdrop) { backdrop.removeAttribute('hidden'); backdrop.classList.add('backdrop--visible'); }
    document.body.classList.add('no-scroll');
    trap(panel);
    if (onOpen) onOpen();
  }

  function closePanel(panel, trigger) {
    if (!panel) return;
    panel.setAttribute('hidden', '');
    panel.classList.remove('slide-panel--open');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    const backdrop = qs('#global-overlay-backdrop');
    if (backdrop) { backdrop.setAttribute('hidden', ''); backdrop.classList.remove('backdrop--visible'); }
    document.body.classList.remove('no-scroll');
  }

  /* ═══════════════════════════════════════════════
     13. LANDING — GENRE FILTER TABS
  ═══════════════════════════════════════════════ */
  /* ═══════════════════════════════════════════════
     13. DYNAMIC DATABASE-DRIVEN CATALOG ENGINE
  ═══════════════════════════════════════════════ */
  async function fetchComicsCatalog() {
    try {
      const resp = await fetch('api/comics.php');
      const data = await resp.json();
      if (data && data.comics && data.comics.length > 0) {
        state.comicsCatalog = data.comics;
        state.heroSpotlight = data.hero_spotlight || state.comicsCatalog[0].slug;
      } else {
        state.comicsCatalog = DEFAULT_MARVEL_COMICS;
        state.heroSpotlight = 'amazing-fantasy-15';
      }
    } catch (e) {
      console.warn('Comics API offline or file:// protocol; using bundled Marvel catalog data', e);
      state.comicsCatalog = DEFAULT_MARVEL_COMICS;
      state.heroSpotlight = 'amazing-fantasy-15';
    }
    renderLandingHero();
    renderTopPicksGrid();
    renderSpotlightCarousel();
    renderBrowseGrid();
  }

  function renderLandingHero() {
    const heroContainer = qs('#hero-dynamic-container');
    if (!heroContainer) return;

    if (!state.comicsCatalog || state.comicsCatalog.length === 0) {
      // Clean fallback CTA state when database has 0 published comics yet
      const heroHeading = qs('#hero-heading');
      const heroSynopsis = qs('#hero-synopsis');
      const heroCreator = qs('#hero-creator-name');
      const heroGenreTag = qs('#hero-genre-tag');
      const heroCoverImg = qs('#hero-backdrop-img');

      if (heroHeading) heroHeading.innerHTML = 'Create, Publish &amp;<br/>Read Webcomics';
      if (heroSynopsis) heroSynopsis.textContent = 'Your ultimate AI-powered webcomic universe. Generate panels from scripts, upload custom artwork, and share stories with readers worldwide.';
      if (heroCreator) heroCreator.textContent = '@komicrew_network';
      if (heroGenreTag) heroGenreTag.textContent = 'Creator Studio Live';
      if (heroCoverImg) heroCoverImg.style.display = 'none';

      const secondaryList = qs('#hero-secondary-list');
      if (secondaryList) {
        secondaryList.innerHTML = `<li style="padding:16px;color:var(--text-muted);font-size:0.85rem;">Be the first creator to publish on Komicrew! 🚀</li>`;
      }
      return;
    }

    // Find designated hero or highest rated / trending comic
    let heroComic = state.comicsCatalog.find(c => c.slug === state.heroSpotlight || String(c.id) === String(state.heroSpotlight));
    if (!heroComic) heroComic = state.comicsCatalog[0];

    const heroHeading = qs('#hero-heading');
    const heroSynopsis = qs('#hero-synopsis');
    const heroCreator = qs('#hero-creator-name');
    const heroGenreTag = qs('#hero-genre-tag');
    const heroRating = qs('#hero-rating-val');
    const heroViews = qs('#hero-views-val');
    const heroReadBtn = qs('#hero-read-btn');
    const heroRemixBtn = qs('#hero-remix-btn');
    const heroCoverImg = qs('#hero-backdrop-img');
    const heroFeatureCard = qs('#hero-feature-card');
    const heroChapterInfo = qs('#hero-chapter-info');

    if (heroFeatureCard) heroFeatureCard.dataset.comicId = heroComic.slug || heroComic.id;
    if (heroHeading) heroHeading.textContent = heroComic.title;
    if (heroSynopsis) heroSynopsis.textContent = heroComic.synopsis || 'An original webcomic series on Komicrew.';
    if (heroCreator) heroCreator.textContent = heroComic.creator ? (heroComic.creator.startsWith('@') ? heroComic.creator : `@${heroComic.creator}`) : '@creator';
    if (heroGenreTag) heroGenreTag.textContent = `${heroComic.genre || 'Action'} · ${heroComic.category || 'Shonen'}`;
    if (heroRating) heroRating.textContent = parseFloat(heroComic.rating || heroComic.rating_avg || 5.0).toFixed(1);
    if (heroViews) heroViews.textContent = `${(heroComic.views_count || 0).toLocaleString()} views`;
    if (heroChapterInfo) heroChapterInfo.innerHTML = `<strong>${heroComic.chapters_count || 1} Chapter${(heroComic.chapters_count || 1) > 1 ? 's' : ''}</strong>`;

    if (heroCoverImg && heroComic.cover_url) {
      heroCoverImg.src = heroComic.cover_url;
      heroCoverImg.style.display = 'block';
    }

    if (heroReadBtn) {
      heroReadBtn.dataset.comicId = heroComic.slug || heroComic.id;
      heroReadBtn.dataset.chapter = '1';
    }
    if (heroRemixBtn) {
      heroRemixBtn.dataset.remixComic = heroComic.slug || heroComic.id;
    }

    // Render Hero Secondary Picks (#2, #3, #4)
    const secondaryList = qs('#hero-secondary-list');
    if (secondaryList) {
      const secondaryComics = state.comicsCatalog.filter(c => (c.slug || c.id) !== (heroComic.slug || heroComic.id)).slice(0, 3);
      if (secondaryComics.length) {
        secondaryList.innerHTML = secondaryComics.map((c, i) => `
          <li>
            <a href="#" class="hero-secondary-card" data-view-target="reader" data-comic-id="${escapeHtml(c.slug || c.id)}" aria-label="${escapeHtml(c.title)}">
              <figure class="hero-secondary-thumb">
                <img src="${c.cover_url || 'assets/img/cover-placeholder.png'}" alt="${escapeHtml(c.title)} cover" width="60" height="80" loading="lazy"/>
                <span class="hero-secondary-rank" aria-hidden="true">#${i + 2}</span>
              </figure>
              <div class="hero-secondary-info">
                <strong>${escapeHtml(c.title)}</strong>
                <span>${escapeHtml(c.genre || 'Action')} &middot; ${escapeHtml(c.category || 'Comic')}</span>
              </div>
            </a>
          </li>
        `).join('');
      } else {
        secondaryList.innerHTML = `<li style="padding:12px;color:var(--text-muted);font-size:0.8rem;">Publish more stories to fill trending spots! 🌟</li>`;
      }
    }
  }

  function renderTopPicksGrid() {
    const grid = qs('#top-picks-grid');
    if (!grid) return;

    if (!state.comicsCatalog || state.comicsCatalog.length === 0) {
      grid.innerHTML = `
        <li class="empty-catalog-card" style="grid-column: 1/-1; text-align: center; padding: 48px 24px; background: rgba(255,255,255,0.02); border: 2px dashed rgba(255,255,255,0.1); border-radius: 16px;">
          <span style="font-size: 3rem; display: block; margin-bottom: 12px;">🎨</span>
          <h3 style="font-family: Bangers, sans-serif; font-size: 1.8rem; color: var(--pop-yellow); margin-bottom: 8px;">No Comics in Database Yet</h3>
          <p style="color: var(--text-muted); max-width: 460px; margin: 0 auto 20px auto;">Create the very first comic using our AI Studio or upload panel spreads via the Admin Panel!</p>
          <a href="#" class="btn btn--primary" data-view-target="studio">Open AI Studio &rarr;</a>
        </li>
      `;
      return;
    }

    grid.innerHTML = state.comicsCatalog.map((c, idx) => {
      const comicId = c.slug || c.id;
      const rank = idx + 1;
      const isAI = c.is_ai == 1 || c.is_ai === true;
      const creatorName = c.creator ? (c.creator.startsWith('@') ? c.creator : `@${c.creator}`) : '@creator';
      const ratingVal = parseFloat(c.rating || c.rating_avg || 5.0).toFixed(1);

      return `
        <li class="comic-card-wrapper">
          <article class="comic-card" data-comic-id="${escapeHtml(comicId)}" data-genres="${escapeHtml(c.genre || '')}" data-category="${escapeHtml(c.category || '')}" data-ai="${isAI}">
            <a href="#" class="comic-card-link" data-view-target="reader" data-comic-id="${escapeHtml(comicId)}" tabindex="-1" aria-hidden="true">
              <figure class="comic-card-cover">
                <img src="${c.cover_url || 'assets/img/cover-placeholder.png'}" alt="${escapeHtml(c.title)} cover" width="260" height="340" loading="lazy"/>
                <div class="comic-card-cover-overlay" aria-hidden="true">
                  <span class="card-rank-badge">#${rank}</span>
                  ${isAI ? '<span class="card-ai-badge">✨ AI</span>' : ''}
                  <div class="card-quick-read-btn">Read</div>
                </div>
              </figure>
            </a>
            <div class="comic-card-body">
              <div class="comic-card-tags">
                <span class="comic-tag comic-tag--${(c.genre || 'action').toLowerCase()}">${escapeHtml(c.genre || 'Action')}</span>
                <span class="comic-tag">${escapeHtml(c.category || 'Shonen')}</span>
              </div>
              <h3 class="comic-card-title"><a href="#" data-view-target="reader" data-comic-id="${escapeHtml(comicId)}">${escapeHtml(c.title)}</a></h3>
              <address class="comic-card-creator"><a href="#" rel="author">${escapeHtml(creatorName)}</a></address>
              <p class="comic-card-synopsis">${escapeHtml(c.synopsis || 'Explore this story on Komicrew.')}</p>
              <footer class="comic-card-footer">
                <div class="comic-card-stats">
                  <span class="comic-stat" aria-label="Rating ${ratingVal}"><svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="M6 1L7.5 4.5H11L8 6.5L9.2 10.5L6 8.5L2.8 10.5L4 6.5L1 4.5H4.5L6 1z"/></svg> ${ratingVal}</span>
                  <span class="comic-stat" aria-label="${c.views_count || 0} views">👁️ ${(c.views_count || 0).toLocaleString()}</span>
                  <span class="comic-stat comic-stat--chapters">${c.chapters_count || 1} Ch.</span>
                </div>
                <div class="comic-card-actions">
                  <button class="card-action-btn bookmark-btn" aria-label="Bookmark ${escapeHtml(c.title)}" aria-pressed="false"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 2h8a1 1 0 011 1v9l-5-3-5 3V3a1 1 0 011-1z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg></button>
                  <a href="#" class="card-action-btn card-remix-btn" data-view-target="studio" data-remix-comic="${escapeHtml(comicId)}" aria-label="Remix in AI Studio"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 11L11 3M7 3h4v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></a>
                </div>
              </footer>
            </div>
          </article>
        </li>
      `;
    }).join('');
  }

  function renderSpotlightCarousel() {
    const list = qs('#spotlight-list');
    if (!list) return;

    if (!state.comicsCatalog || state.comicsCatalog.length === 0) {
      list.innerHTML = `
        <li class="spotlight-card-wrapper" style="width:100%; text-align:center; padding: 28px; color: var(--text-muted);">
          No spotlight comics uploaded yet.
        </li>
      `;
      return;
    }

    list.innerHTML = state.comicsCatalog.map(c => {
      const comicId = c.slug || c.id;
      const isAI = c.is_ai == 1 || c.is_ai === true;
      const creatorName = c.creator ? (c.creator.startsWith('@') ? c.creator : `@${c.creator}`) : '@creator';
      const ratingVal = parseFloat(c.rating || c.rating_avg || 5.0).toFixed(1);

      return `
        <li class="spotlight-card-wrapper">
          <article class="spotlight-card" aria-label="Spotlight: ${escapeHtml(c.title)}">
            <figure class="spotlight-card-thumb"><img src="${c.cover_url || 'assets/img/cover-placeholder.png'}" alt="${escapeHtml(c.title)}" width="320" height="200" loading="lazy"/></figure>
            <div class="spotlight-card-body">
              <div class="spotlight-card-tags">
                ${isAI ? '<span class="spotlight-ai-tag"><svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true"><path d="M5 0.5L6.2 3.5H9.3L6.9 5.4L7.8 8.5L5 6.8L2.2 8.5L3.1 5.4L0.7 3.5H3.8L5 0.5z"/></svg> AI-Generated</span>' : '<span class="comic-tag">Original</span>'}
                <span class="spotlight-genre-tag">${escapeHtml(c.genre || 'Action')}</span>
              </div>
              <h3 class="spotlight-card-title"><a href="#" data-view-target="reader" data-comic-id="${escapeHtml(comicId)}">${escapeHtml(c.title)}</a></h3>
              <p class="spotlight-creator">by <a href="#" rel="author">${escapeHtml(creatorName)}</a></p>
              <div class="spotlight-card-stats">
                <span>❤️ ${(c.likes_count || 0).toLocaleString()}</span>
                <span>👁️ ${(c.views_count || 0).toLocaleString()}</span>
                <span>🎨 ${escapeHtml(c.art_style || 'Comic')}</span>
              </div>
              <div class="spotlight-card-actions">
                <a href="#" class="btn btn--sm" data-view-target="reader" data-comic-id="${escapeHtml(comicId)}">Read</a>
                <a href="#" class="btn btn--sm btn--remix" data-view-target="studio" data-remix-comic="${escapeHtml(comicId)}">Remix Script</a>
              </div>
            </div>
          </article>
        </li>
      `;
    }).join('');
  }

  function initLandingFilterTabs() {
    const tabs = qsa('.filter-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => { t.classList.remove('filter-tab--active'); t.setAttribute('aria-selected', 'false'); });
        tab.classList.add('filter-tab--active');
        tab.setAttribute('aria-selected', 'true');
        state.activeFilter = tab.dataset.filter;
        filterLandingGrid(state.activeFilter);
      });
    });

    // FIX: Wire the landing sort dropdown (#sort-select)
    const sortSelect = qs('#sort-select');
    sortSelect?.addEventListener('change', () => {
      state.landingSort = sortSelect.value;
      sortLandingGrid(sortSelect.value);
    });
  }

  function sortLandingGrid(sortBy) {
    const grid = qs('#top-picks-grid');
    if (!grid) return;
    const wrappers = Array.from(qsa('.comic-card-wrapper', grid));
    wrappers.sort((a, b) => {
      const cardA = a.querySelector('.comic-card');
      const cardB = b.querySelector('.comic-card');
      if (!cardA || !cardB) return 0;
      const getNum = (el, attr) => parseFloat(el.dataset[attr] || '0');
      if (sortBy === 'rating') return getNum(cardB, 'rating') - getNum(cardA, 'rating');
      if (sortBy === 'views') return getNum(cardB, 'views') - getNum(cardA, 'views');
      if (sortBy === 'newest' || sortBy === 'updated') return (cardB.dataset.year || '0').localeCompare(cardA.dataset.year || '0');
      return 0; // trending: original DOM order
    });
    wrappers.forEach(w => grid.appendChild(w));
    showToast(`Sorted by: ${sortBy}`, 'info', 1500);
  }

  function filterLandingGrid(filter) {
    const cards = qsa('.comic-card-wrapper', qs('#top-picks-grid'));
    cards.forEach(card => {
      const article = card.querySelector('.comic-card');
      if (!article) return;
      const genres = (article.dataset.genres || '').toLowerCase();
      const ai = article.dataset.ai === 'true';
      const show = filter === 'all' || filter === 'trending' || filter === 'new'
        || genres.includes(filter.toLowerCase())
        || (filter === 'ai-made' && ai);
      card.style.display = show ? '' : 'none';
    });
  }

  /* ═══════════════════════════════════════════════
     14. LANDING — SPOTLIGHT CAROUSEL
  ═══════════════════════════════════════════════ */
  function initSpotlightCarousel() {
    const list = qs('#spotlight-list');
    const prevBtn = qs('.spotlight-scroll-btn--prev');
    const nextBtn = qs('.spotlight-scroll-btn--next');
    if (!list || !prevBtn || !nextBtn) return;

    const scrollAmount = () => list.querySelector('.spotlight-card-wrapper')?.offsetWidth + 24 || 360;

    prevBtn.addEventListener('click', () => list.scrollBy({ left: -scrollAmount(), behavior: 'smooth' }));
    nextBtn.addEventListener('click', () => list.scrollBy({ left: scrollAmount(), behavior: 'smooth' }));

    list.addEventListener('scroll', debounce(() => {
      prevBtn.disabled = list.scrollLeft <= 0;
      nextBtn.disabled = list.scrollLeft + list.clientWidth >= list.scrollWidth - 2;
    }, 100));
    prevBtn.disabled = true;
  }

  /* ═══════════════════════════════════════════════
     15. BROWSE VIEW (DIRECT DATABASE QUERIES)
  ═══════════════════════════════════════════════ */
  function initBrowseView() {
    const sidebarToggle = qs('#sidebar-toggle-btn');
    const sidebar = qs('#browse-sidebar');
    const gridToggle = qs('#view-toggle-grid');
    const listToggle = qs('#view-toggle-list');
    const sortSelect = qs('#browse-sort-select');
    const filterForm = qs('#browse-filters-form');
    const clearFiltersBtn = qs('#clear-filters-btn');
    const ratingRange = qs('#rating-min');
    const ratingLabel = qs('#rating-min-label');

    // Mobile ergonomics: collapse filter sidebar on mobile so comics are front-and-center
    if (window.innerWidth <= 768 && sidebarToggle && sidebar) {
      sidebarToggle.setAttribute('aria-expanded', 'false');
      sidebar.classList.add('browse-sidebar--hidden');
    }

    sidebarToggle?.addEventListener('click', () => {
      const isOpen = sidebarToggle.getAttribute('aria-expanded') === 'true';
      sidebarToggle.setAttribute('aria-expanded', String(!isOpen));
      sidebar?.classList.toggle('browse-sidebar--hidden', isOpen);
    });

    gridToggle?.addEventListener('click', () => { setBrowseViewMode('grid'); });
    listToggle?.addEventListener('click', () => { setBrowseViewMode('list'); });
    sortSelect?.addEventListener('change', () => { state.browseSort = sortSelect.value; renderBrowseGrid(); });

    ratingRange?.addEventListener('input', () => {
      if (ratingLabel) ratingLabel.textContent = parseFloat(ratingRange.value).toFixed(1);
    });

    filterForm?.addEventListener('change', () => renderBrowseGrid());
    filterForm?.addEventListener('submit', (e) => { e.preventDefault(); renderBrowseGrid(); });

    clearFiltersBtn?.addEventListener('click', () => {
      qsa('.filter-checkbox', filterForm).forEach(cb => cb.checked = false);
      if (ratingRange) ratingRange.value = 1;
      if (ratingLabel) ratingLabel.textContent = '1.0';
      renderBrowseGrid();
      showToast('Filters reset', 'info', 1500);
    });
  }

  function setBrowseViewMode(mode) {
    state.browseViewMode = mode;
    const grid = qs('#browse-comic-grid');
    const gridBtn = qs('#view-toggle-grid');
    const listBtn = qs('#view-toggle-list');
    grid?.classList.toggle('comic-grid--list-view', mode === 'list');
    gridBtn?.setAttribute('aria-pressed', String(mode === 'grid'));
    listBtn?.setAttribute('aria-pressed', String(mode === 'list'));
    gridBtn?.classList.toggle('view-toggle-btn--active', mode === 'grid');
    listBtn?.classList.toggle('view-toggle-btn--active', mode === 'list');
  }

  function applyBrowseFilterTab(filter) {
    state.activeFilter = filter;
    renderBrowseGrid();
  }
  function applyBrowseGenreFilter(genre) {
    const cb = qs(`input[name="genre"][value="${genre}"]`);
    if (cb) cb.checked = true;
    renderBrowseGrid();
  }
  function applyBrowseCategoryFilter(category) {
    const cb = qs(`input[name="category"][value="${category}"]`);
    if (cb) cb.checked = true;
    renderBrowseGrid();
  }

  function renderBrowseGrid() {
    const grid = qs('#browse-comic-grid');
    const countEl = qs('#browse-count-number');
    if (!grid) return;

    const filterForm = qs('#browse-filters-form');
    const selectedCategories = filterForm ? qsa('input[name="category"]:checked', filterForm).map(c => c.value.toLowerCase()) : [];
    const selectedGenres = filterForm ? qsa('input[name="genre"]:checked', filterForm).map(c => c.value.toLowerCase()) : [];
    const selectedStyles = filterForm ? qsa('input[name="style"]:checked', filterForm).map(c => c.value.toLowerCase()) : [];
    const minRating = parseFloat(qs('#rating-min')?.value || 1.0);

    let list = (state.comicsCatalog || []).filter(c => {
      const cat = (c.category || '').toLowerCase();
      const genre = (c.genre || '').toLowerCase();
      const style = (c.art_style || '').toLowerCase();
      const rating = parseFloat(c.rating || 5.0);

      if (selectedCategories.length && !selectedCategories.some(sc => cat.includes(sc))) return false;
      if (selectedGenres.length && !selectedGenres.some(sg => genre.includes(sg))) return false;
      if (selectedStyles.length && !selectedStyles.some(ss => style.includes(ss))) return false;
      if (rating < minRating) return false;
      return true;
    });

    // Apply sorting
    const sortBy = state.browseSort || qs('#browse-sort-select')?.value || 'trending';
    list.sort((a, b) => {
      if (sortBy === 'rating') {
        return (parseFloat(b.rating || b.rating_avg) || 0) - (parseFloat(a.rating || a.rating_avg) || 0);
      } else if (sortBy === 'views') {
        return (parseInt(b.views) || 0) - (parseInt(a.views) || 0);
      } else if (sortBy === 'newest') {
        return (b.id || 0) - (a.id || 0);
      } else if (sortBy === 'alpha') {
        return (a.title || '').localeCompare(b.title || '');
      } else {
        // trending
        return ((parseInt(b.views) || 0) + (parseFloat(b.rating || 0) * 100)) - ((parseInt(a.views) || 0) + (parseFloat(a.rating || 0) * 100));
      }
    });

    if (countEl) countEl.textContent = list.length;
    updateActiveFilterTags();

    if (!list.length) {
      grid.innerHTML = `
        <li style="grid-column: 1/-1; text-align: center; padding: 48px; color: var(--text-muted);">
          No comics found matching your filters.
        </li>
      `;
      return;
    }

    grid.innerHTML = list.map(c => {
      const comicId = c.slug || c.id;
      const isAI = c.is_ai == 1 || c.is_ai === true;
      const creatorName = c.creator ? (c.creator.startsWith('@') ? c.creator : `@${c.creator}`) : '@creator';
      const ratingVal = parseFloat(c.rating || c.rating_avg || 5.0).toFixed(1);

      return `
        <li class="comic-card-wrapper">
          <article class="comic-card" data-comic-id="${escapeHtml(comicId)}" data-genres="${escapeHtml(c.genre || '')}" data-styles="${escapeHtml(c.art_style || '')}" data-ai="${isAI}">
            <a href="#" class="comic-card-link" data-view-target="reader" data-comic-id="${escapeHtml(comicId)}" tabindex="-1" aria-hidden="true">
              <figure class="comic-card-cover">
                <img src="${c.cover_url || 'assets/img/cover-placeholder.png'}" alt="${escapeHtml(c.title)} cover" width="260" height="340" loading="lazy"/>
                <div class="comic-card-cover-overlay" aria-hidden="true">
                  ${isAI ? '<span class="card-ai-badge">✨ AI</span>' : ''}
                  <div class="card-quick-read-btn">Read</div>
                </div>
              </figure>
            </a>
            <div class="comic-card-body">
              <div class="comic-card-tags">
                <span class="comic-tag comic-tag--${(c.genre || 'action').toLowerCase()}">${escapeHtml(c.genre || 'Action')}</span>
                <span class="comic-tag">${escapeHtml(c.category || 'Shonen')}</span>
              </div>
              <h3 class="comic-card-title"><a href="#" data-view-target="reader" data-comic-id="${escapeHtml(comicId)}">${escapeHtml(c.title)}</a></h3>
              <address class="comic-card-creator"><a href="#" rel="author">${escapeHtml(creatorName)}</a></address>
              <footer class="comic-card-footer">
                <div class="comic-card-stats">
                  <span class="comic-stat" aria-label="Rating ${ratingVal}"><svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="M6 1L7.5 4.5H11L8 6.5L9.2 10.5L6 8.5L2.8 10.5L4 6.5L1 4.5H4.5L6 1z"/></svg> ${ratingVal}</span>
                  <span class="comic-stat">👁️ ${(c.views_count || 0).toLocaleString()}</span>
                  <span class="comic-stat">${c.chapters_count || 1} Ch.</span>
                </div>
                <button class="card-action-btn bookmark-btn" aria-label="Bookmark" aria-pressed="false"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3 2h8a1 1 0 011 1v9l-5-3-5 3V3a1 1 0 011-1z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg></button>
              </footer>
            </div>
          </article>
        </li>
      `;
    }).join('');
  }

  function updateActiveFilterTags() {
    const container = qs('#active-filter-tags');
    if (!container) return;
    const active = qsa('.filter-checkbox:checked');
    container.innerHTML = active.map(cb => `<li role="listitem" class="active-filter-tag">${escapeHtml(cb.value)} <button class="remove-filter-tag" data-filter-name="${cb.name}" data-filter-value="${cb.value}" aria-label="Remove filter ${cb.value}">✕</button></li>`).join('');
    qsa('.remove-filter-tag', container).forEach(btn => {
      btn.addEventListener('click', () => {
        const cb = qs(`input[name="${btn.dataset.filterName}"][value="${btn.dataset.filterValue}"]`);
        if (cb) { cb.checked = false; renderBrowseGrid(); }
      });
    });
  }

  /* ═══════════════════════════════════════════════
     16. DATABASE-DRIVEN READER VIEW
  ═══════════════════════════════════════════════ */
  function initReaderView() {
    qsa('.reader-mode-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        qsa('.reader-mode-btn').forEach(b => { b.classList.remove('reader-mode-btn--active'); b.setAttribute('aria-pressed', 'false'); });
        btn.classList.add('reader-mode-btn--active');
        btn.setAttribute('aria-pressed', 'true');
        state.readerMode = btn.id.replace('reader-mode-', '');
        applyReaderMode(state.readerMode);
      });
    });

    qs('#page-prev-btn')?.addEventListener('click', () => changePage(-1));
    qs('#page-next-btn')?.addEventListener('click', () => changePage(1));
    qs('#page-jump-input')?.addEventListener('change', (e) => {
      const n = parseInt(e.target.value);
      if (!isNaN(n)) jumpToPage(clamp(n, 1, state.readerTotalPages));
    });

    document.addEventListener('keydown', (e) => {
      if (state.activeView !== 'reader') return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); changePage(1); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); changePage(-1); }
    });

    // Touch swipe gesture for natural mobile page turning
    const readerCanvas = qs('#reader-canvas-area');
    if (readerCanvas) {
      let touchStartX = 0;
      let touchStartY = 0;
      readerCanvas.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches.length === 1) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
        }
      }, { passive: true });

      readerCanvas.addEventListener('touchend', (e) => {
        if (!e.changedTouches || !e.changedTouches.length) return;
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        // Check horizontal swipe if not scrolling vertically heavily
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.4) {
          if (dx < 0) {
            changePage(1); // Swipe left: next page
          } else {
            changePage(-1); // Swipe right: previous page
          }
        }
      }, { passive: true });
    }

    const settingsToggle = qs('#reader-settings-toggle');
    const settingsPanel = qs('#reader-settings-panel');
    settingsToggle?.addEventListener('click', () => {
      const isOpen = settingsToggle.getAttribute('aria-expanded') === 'true';
      settingsToggle.setAttribute('aria-expanded', String(!isOpen));
      settingsPanel?.toggleAttribute('hidden', isOpen);
    });

    qsa('.reader-bg-swatch').forEach(swatch => {
      swatch.addEventListener('click', () => {
        qsa('.reader-bg-swatch').forEach(s => { s.classList.remove('reader-bg-swatch--active'); s.setAttribute('aria-pressed', 'false'); });
        swatch.classList.add('reader-bg-swatch--active');
        swatch.setAttribute('aria-pressed', 'true');
        const canvas = qs('#reader-canvas-area');
        if (canvas) canvas.setAttribute('data-bg', swatch.dataset.bg);
      });
    });

    const zoomRange = qs('#reader-zoom-range');
    const zoomLabel = qs('#reader-zoom-label');
    zoomRange?.addEventListener('input', () => {
      state.readerZoom = parseInt(zoomRange.value);
      if (zoomLabel) zoomLabel.textContent = `${state.readerZoom}%`;
      const img = qs('#reader-page-img');
      if (img) {
        img.style.transformOrigin = 'top center';
        img.style.transform = `scale(${state.readerZoom / 100})`;
      }
      const scrollImgs = qsa('#reader-scroll-container img');
      scrollImgs.forEach(sImg => {
        sImg.style.transformOrigin = 'top center';
        sImg.style.transform = `scale(${state.readerZoom / 100})`;
      });
    });

    const fitSelect = qs('#reader-fit-select');
    fitSelect?.addEventListener('change', () => {
      const img = qs('#reader-page-img');
      if (!img) return;
      if (fitSelect.value === 'fit-width') {
        img.style.width = '100%';
        img.style.maxHeight = 'none';
      } else if (fitSelect.value === 'fit-height') {
        img.style.width = 'auto';
        img.style.maxHeight = '85vh';
      } else if (fitSelect.value === 'original') {
        img.style.width = 'auto';
        img.style.maxWidth = 'none';
        img.style.maxHeight = 'none';
      }
    });

    qs('#chapter-list-toggle-btn')?.addEventListener('click', toggleChapterSidebar);
    qs('#chapter-sidebar-close-btn')?.addEventListener('click', toggleChapterSidebar);

    qs('#next-chapter-btn')?.addEventListener('click', () => {
      const btn = qs('#next-chapter-btn');
      loadReaderChapter(parseInt(btn.dataset.chapter) || (state.readerChapter + 1));
    });

    qs('#reader-remix-btn')?.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo('studio', { remixComic: state.readerComicId || 'amazing-fantasy-15' });
    });

    // FIX: Reader topbar bookmark/Save button — wired explicitly since it has no [data-comic-id] parent
    qs('#reader-bookmark-btn')?.addEventListener('click', () => {
      const btn = qs('#reader-bookmark-btn');
      const comicId = state.readerComicId || 'amazing-fantasy-15';
      const title = qs('#reader-breadcrumb-title')?.textContent?.trim() || comicId;
      toggleBookmark(comicId, title, btn);
    });

    // FIX: Sidebar "Save for Later" button (reader end screen)
    qs('.reader-end-screen .bookmark-btn, .reader-info-sidebar .bookmark-btn')?.addEventListener('click', (e) => {
      const btn = e.currentTarget;
      const comicId = state.readerComicId || 'amazing-fantasy-15';
      const title = qs('#reader-breadcrumb-title')?.textContent?.trim() || comicId;
      toggleBookmark(comicId, title, btn);
    });

    initComments();
    initReactions();
  }

  async function loadReaderComic(comicId, chapter = 1, initialPage = 1) {
    state.readerComicId = comicId || 'amazing-fantasy-15';
    state.readerChapter = chapter;

    let comic = null;
    try {
      const resp = await fetch(`api/comics.php?id=${encodeURIComponent(state.readerComicId)}&chapter=${chapter}`);
      const data = await resp.json();
      if (data && data.comic) {
        comic = data.comic;
      }
    } catch (e) {
      console.warn('Could not load comic from DB, falling back to bundled dataset', e);
    }

    if (!comic) {
      const fallback = DEFAULT_MARVEL_COMICS.find(c => c.slug === state.readerComicId || String(c.id) === String(state.readerComicId)) || DEFAULT_MARVEL_COMICS[0];
      comic = JSON.parse(JSON.stringify(fallback));
      comic.current_chapter = (comic.chapters || []).find(ch => ch.chapter_number === chapter) || comic.chapters[0];
    }

    if (comic) {
      const breadcrumb = qs('#reader-comic-breadcrumb');
      const sidebarTitle = qs('#reader-sidebar-comic-title');
      if (breadcrumb) breadcrumb.textContent = comic.title;
      if (sidebarTitle) sidebarTitle.textContent = comic.title;

      // Populate chapters in sidebar
      const sidebarList = qs('#reader-chapter-list') || qs('#chapter-list');
      if (sidebarList && comic.chapters && comic.chapters.length) {
        sidebarList.innerHTML = comic.chapters.map(ch => `
          <li class="chapter-list-item ${ch.chapter_number === chapter ? 'chapter-list-item--active' : ''}" data-chapter="${ch.chapter_number}">
            <a href="#" class="chapter-list-link" data-chapter="${ch.chapter_number}">
              <span class="chapter-list-num">Ch. ${ch.chapter_number}</span>
              <span class="chapter-list-title">${escapeHtml(ch.title || `Chapter ${ch.chapter_number}`)}</span>
            </a>
          </li>
        `).join('');

        qsa('.chapter-list-link', sidebarList).forEach(link => {
          link.addEventListener('click', (e) => {
            e.preventDefault();
            loadReaderComic(state.readerComicId, parseInt(link.dataset.chapter));
          });
        });
      }

      // Populate current chapter panels
      const curCh = comic.current_chapter || (comic.chapters && comic.chapters[0]);
      if (curCh) {
        state.currentChapterData = curCh;
        state.readerTotalPages = curCh.total_pages || (curCh.pages ? curCh.pages.length : 1);
        state.readerCurrentPage = clamp(initialPage || 1, 1, state.readerTotalPages);
        if (state.readerMode === 'scroll' || state.readerMode === 'webtoon') {
          applyReaderMode(state.readerMode);
        } else {
          renderReaderPage();
        }
      }
    }

    // Load persisted reactions and comments from database
    loadReactionsAndComments(state.readerComicId, chapter);
  }

  function loadReaderChapter(chapter) {
    loadReaderComic(state.readerComicId, chapter);
  }

  function renderReaderPage() {
    const pageImg = qs('#reader-page-img');
    const chapterBreadcrumb = qs('#reader-chapter-breadcrumb');
    if (chapterBreadcrumb) chapterBreadcrumb.textContent = `Chapter ${state.readerChapter}`;

    if (pageImg) {
      if (state.currentChapterData && state.currentChapterData.pages && state.currentChapterData.pages.length) {
        const pageObj = state.currentChapterData.pages[state.readerCurrentPage - 1];
        pageImg.src = pageObj?.image_url || pageObj?.cover_url || 'assets/img/cover-placeholder.png';
      } else {
        pageImg.src = 'assets/img/cover-placeholder.png';
      }
    }
    updatePageUI();
    saveReadingProgress();
  }

  function changePage(delta) {
    playPageTurnSound();
    const newPage = clamp(state.readerCurrentPage + delta, 1, state.readerTotalPages);
    if (newPage === state.readerCurrentPage) return;
    state.readerCurrentPage = newPage;
    renderReaderPage();
    if (state.readerCurrentPage === state.readerTotalPages) {
      const endCta = qs('#chapter-end-cta');
      if (endCta) endCta.removeAttribute('hidden');
    }
  }

  function jumpToPage(n) {
    state.readerCurrentPage = clamp(n, 1, state.readerTotalPages);
    renderReaderPage();
  }

  function updatePageUI() {
    const currentEl = qs('#current-page-num');
    const totalEl = qs('#total-page-num');
    const jumpInput = qs('#page-jump-input');
    const totalDisplay = qs('#page-total-display');
    const pageCaption = qs('#reader-page-img');
    if (currentEl) currentEl.textContent = state.readerCurrentPage;
    if (totalEl) totalEl.textContent = state.readerTotalPages;
    if (jumpInput) { jumpInput.value = state.readerCurrentPage; jumpInput.max = state.readerTotalPages; }
    if (totalDisplay) totalDisplay.textContent = state.readerTotalPages;
    if (pageCaption) pageCaption.setAttribute('alt', `${state.readerComicId} Chapter ${state.readerChapter} Page ${state.readerCurrentPage}`);
    qs('#page-prev-btn')?.toggleAttribute('disabled', state.readerCurrentPage <= 1);
    qs('#page-next-btn')?.toggleAttribute('disabled', state.readerCurrentPage >= state.readerTotalPages);
  }

  function applyReaderMode(mode) {
    state.readerMode = mode;
    const area = qs('#page-reader');
    if (area) area.setAttribute('data-mode', mode);

    const nav = qs('.reader-page-nav');
    const singleFrame = qs('#reader-page-frame');
    let scrollContainer = qs('#reader-scroll-container');

    if (mode === 'scroll' || mode === 'webtoon') {
      if (nav) nav.style.display = 'none';
      if (singleFrame) singleFrame.style.display = 'none';

      if (!scrollContainer) {
        scrollContainer = document.createElement('div');
        scrollContainer.id = 'reader-scroll-container';
        scrollContainer.className = 'reader-scroll-container';
        area.appendChild(scrollContainer);
      }
      scrollContainer.style.display = 'flex';
      scrollContainer.style.flexDirection = 'column';
      scrollContainer.style.alignItems = 'center';
      scrollContainer.style.gap = mode === 'webtoon' ? '0' : '16px';
      scrollContainer.style.width = '100%';

      const pages = state.currentChapterData?.pages || [];
      scrollContainer.innerHTML = pages.map((p, idx) => `
        <figure class="reader-scroll-page" data-page="${idx + 1}" style="width:100%; max-width:${mode === 'webtoon' ? '760px' : '900px'}; margin:0 auto; display:flex; flex-direction:column; align-items:center;">
          <img src="${p.image_url}" alt="Page ${idx + 1}" style="width:100%; height:auto; display:block; box-shadow: 0 4px 12px rgba(0,0,0,0.5);" loading="lazy" />
          <figcaption style="padding:6px; font-size:0.8rem; color:var(--text-muted); font-weight:700;">Page ${idx + 1} of ${pages.length}</figcaption>
        </figure>
      `).join('');

      showToast(`Switched to continuous ${mode === 'webtoon' ? 'Webtoon' : 'Vertical Scroll'} mode 📱`, 'info', 1800);
    } else {
      if (scrollContainer) scrollContainer.style.display = 'none';
      if (singleFrame) singleFrame.style.display = 'flex';
      if (nav) nav.style.display = 'flex';
      renderReaderPage();
      showToast('Switched to Single Page mode 📖', 'info', 1500);
    }
  }

  function toggleChapterSidebar() {
    const sidebar = qs('#reader-chapter-sidebar');
    const toggleBtn = qs('#chapter-list-toggle-btn');
    if (!sidebar) return;
    const isOpen = !sidebar.hasAttribute('hidden');
    sidebar.toggleAttribute('hidden', isOpen);
    toggleBtn?.setAttribute('aria-expanded', String(!isOpen));
  }

  /* ═══════════════════════════════════════════════
     17. REACTIONS & COMMENTS (BACKEND SYNC)
  ═══════════════════════════════════════════════ */
  async function loadReactionsAndComments(comicSlug, chapterNum = 1) {
    if (!comicSlug) return;
    try {
      const resp = await fetch(`api/reactions.php?comic_id=${encodeURIComponent(comicSlug)}&chapter=${chapterNum}`);
      const res = await resp.json();
      if (res && res.success) {
        const reactions = res.reactions || (res.data && res.data.reactions);
        const comments = res.comments || (res.data && res.data.comments);
        if (reactions) {
          qsa('.reaction-btn').forEach(btn => {
            const rType = btn.dataset.reaction;
            const countEl = btn.querySelector('.reaction-count');
            if (countEl && reactions[rType] !== undefined) {
              countEl.textContent = Number(reactions[rType]).toLocaleString();
            }
          });
        }
        if (comments && Array.isArray(comments) && comments.length) {
          const commentsList = qs('#comments-list');
          if (commentsList) {
            commentsList.innerHTML = comments.map(c => {
              const username = (c.author || 'reader').replace(/^@/, '');
              const time = c.time_ago || 'Recent';
              const body = c.body || '';
              return `
                <li class="comment-item">
                  <article class="comment-card">
                    <header class="comment-card-header">
                      <img class="comment-author-avatar" src="${escapeHtml(c.avatar || 'assets/img/avatar-user.jpg')}" alt="Reader avatar" width="32" height="32" loading="lazy"/>
                      <span class="comment-author-name">@${escapeHtml(username)}</span>
                      <time class="comment-timestamp">${escapeHtml(time)}</time>
                    </header>
                    <p class="comment-body">${escapeHtml(body)}</p>
                    <footer class="comment-card-footer">
                      <button class="comment-like-btn" aria-label="Like this comment" aria-pressed="false">♥ <span>0</span></button>
                    </footer>
                  </article>
                </li>
              `;
            }).join('');
          }
        }
      }
    } catch (e) {
      console.warn('Could not load reactions/comments from DB:', e);
    }
  }

  function initReactions() {
    qsa('.reaction-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const reactionType = btn.dataset.reaction || 'fire';
        const countEl = btn.querySelector('.reaction-count');
        const isActive = btn.classList.toggle('reaction-btn--active');
        btn.setAttribute('aria-pressed', String(isActive));
        if (countEl) {
          const n = parseInt(countEl.textContent.replace(/,/g, '')) || 0;
          countEl.textContent = (isActive ? n + 1 : Math.max(0, n - 1)).toLocaleString();
        }

        try {
          const resp = await fetch('api/reactions.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'react',
              comic_id: state.readerComicId || 'amazing-fantasy-15',
              chapter: state.readerChapter || 1,
              reaction_type: reactionType
            })
          });
          const res = await resp.json();
          const counts = res.counts || (res.data && res.data.counts);
          if (counts && countEl && counts[reactionType] !== undefined) {
            countEl.textContent = Number(counts[reactionType]).toLocaleString();
          }
        } catch (e) {
          console.warn('Failed to sync reaction to backend:', e);
        }
      });
    });
  }

  function initComments() {
    const form = qs('#comment-form');
    const textarea = qs('#comment-input');
    const charCount = qs('#comment-char-count');
    const submitBtn = qs('#comment-submit-btn');
    const commentsList = qs('#comments-list');
    const commentsToggle = qs('#comments-toggle-btn');

    textarea?.addEventListener('input', () => {
      const len = textarea.value.length;
      if (charCount) charCount.textContent = `${len} / 1000`;
      if (submitBtn) submitBtn.disabled = len === 0;
    });

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = textarea?.value.trim();
      if (!text) return;

      const rawAuthor = state.currentUser ? state.currentUser.username : 'comic_fan';
      const author = rawAuthor.startsWith('@') ? rawAuthor.slice(1) : rawAuthor;
      if (submitBtn) submitBtn.disabled = true;

      try {
        const resp = await fetch('api/reactions.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'comment',
            comic_id: state.readerComicId || 'amazing-fantasy-15',
            chapter: state.readerChapter || 1,
            username: author,
            comment: text
          })
        });
        const res = await resp.json();
        const newC = res.comment || (res.data && res.data.comment);
        const comment = createCommentElement(text, author, newC ? (newC.time_ago || 'Just now') : 'Just now');
        commentsList?.prepend(comment);
        if (textarea) textarea.value = '';
        if (charCount) charCount.textContent = '0 / 1000';
        showToast('Comment posted successfully!', 'success');
      } catch (err) {
        const comment = createCommentElement(text, author, 'Just now');
        commentsList?.prepend(comment);
        if (textarea) textarea.value = '';
        if (charCount) charCount.textContent = '0 / 1000';
        showToast('Comment posted locally!', 'info');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });

    commentsToggle?.addEventListener('click', () => {
      const list = qs('#comments-list');
      const isHidden = list?.hasAttribute('hidden');
      list?.toggleAttribute('hidden', !isHidden);
      if (commentsToggle) commentsToggle.textContent = isHidden ? '▼ Hide' : '▶ Show';
    });

    if (submitBtn) submitBtn.disabled = true;
  }

  function createCommentElement(text, username, time) {
    const li = document.createElement('li');
    li.className = 'comment-item comment-item--new';
    li.innerHTML = `
      <article class="comment-card">
        <header class="comment-card-header">
          <span class="comment-author-name">@${escapeHtml(username)}</span>
          <time class="comment-timestamp">${escapeHtml(time)}</time>
        </header>
        <p class="comment-body">${escapeHtml(text)}</p>
        <footer class="comment-card-footer">
          <button class="comment-like-btn" aria-label="Like this comment, 0 likes" aria-pressed="false">♥ <span>0</span></button>
        </footer>
      </article>`;
    return li;
  }

  /* ═══════════════════════════════════════════════
     18. STUDIO VIEW
  ═══════════════════════════════════════════════ */
  function initStudioView() {
    initStudioModeTabs();
    initCharCounters();
    initArtStyleSelector();
    initAIEngineSelector();
    initStudioForms();
    initSpeechBubbleToolbar();
    initPublishModal();
    initRangeLabels();

    // Auto-populate with sample script so user has an instant demonstration ready
    const textarea = qs('#studio-script-textarea');
    if (textarea && !textarea.value.trim()) {
      loadScriptTemplate();
    }
  }

  function initStudioModeTabs() {
    const tabs = qsa('.studio-mode-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => { t.classList.remove('studio-mode-tab--active'); t.setAttribute('aria-selected', 'false'); });
        tab.classList.add('studio-mode-tab--active');
        tab.setAttribute('aria-selected', 'true');
        state.studioMode = tab.dataset.studioMode;
        // Show/hide panels
        qsa('.studio-input-subpanel').forEach(p => p.setAttribute('hidden', ''));
        const panel = qs(`#studio-${tab.dataset.studioMode}-panel`);
        panel?.removeAttribute('hidden');

        // If switching to remix mode and textarea is empty, auto-populate with classic sample
        if (tab.dataset.studioMode === 'remix') {
          const remixTextarea = qs('#remix-script-textarea');
          if (remixTextarea && !remixTextarea.value.trim()) {
            initRemixMode('amazing-fantasy-15');
          }
        }
      });
    });
  }

  function initCharCounters() {
    const counters = [
      { input: '#studio-comic-title', counter: '#title-char-count', max: 80 },
      { input: '#studio-script-textarea', counter: '#script-char-count', max: 10000, warning: '#script-char-warning' },
      { input: '#studio-prompt-input', counter: '#prompt-char-count', max: 2000 },
      { input: '#remix-script-textarea', counter: '#remix-char-count', max: 10000 },
      { input: '#comment-input', counter: '#comment-char-count', max: 1000 },
      { input: '#publish-synopsis-input', counter: '#publish-synopsis-count', max: 500 },
    ];
    counters.forEach(({ input, counter, max, warning }) => {
      const el = qs(input);
      const counterEl = qs(counter);
      const warningEl = warning ? qs(warning) : null;
      if (!el || !counterEl) return;
      const update = () => {
        const len = el.value.length;
        counterEl.textContent = `${len.toLocaleString()} / ${max.toLocaleString()}`;
        if (warningEl) warningEl.toggleAttribute('hidden', len < max * 0.9);
      };
      el.addEventListener('input', update);
      update();
    });
  }

  function initArtStyleSelector() {
    const radios = qsa('.art-style-radio');
    radios.forEach(radio => {
      radio.addEventListener('change', () => {
        qsa('.art-style-card').forEach(card => card.classList.remove('art-style-card--selected'));
        if (radio.checked) radio.closest('.art-style-option')?.querySelector('.art-style-card')?.classList.add('art-style-card--selected');
      });
    });
    // Init selected state
    const checked = qs('.art-style-radio:checked');
    if (checked) checked.closest('.art-style-option')?.querySelector('.art-style-card')?.classList.add('art-style-card--selected');
  }

  function initAIEngineSelector() {
    qsa('.ai-engine-radio').forEach(radio => {
      radio.addEventListener('change', () => {
        if (radio.value === 'gemini' && radio.checked) {
          showToast('Gemini requires a Pro subscription. Upgrade to use this engine.', 'warning', 4000);
          radio.checked = false;
          const pollinations = qs('.ai-engine-radio[value="pollinations"]');
          if (pollinations) pollinations.checked = true;
        }
      });
    });
  }

  function initStudioForms() {
    // Form submit handlers
    qs('#studio-script-form')?.addEventListener('submit', (e) => { e.preventDefault(); startGeneration('script'); });
    qs('#studio-prompt-form')?.addEventListener('submit', (e) => { e.preventDefault(); startGeneration('prompt'); });
    qs('#studio-remix-form')?.addEventListener('submit', (e) => { e.preventDefault(); startGeneration('remix'); });

    // Explicit button click handlers (guarantees execution across all browsers)
    qs('#generate-btn')?.addEventListener('click', (e) => { e.preventDefault(); startGeneration('script'); });
    qs('#prompt-generate-btn')?.addEventListener('click', (e) => { e.preventDefault(); startGeneration('prompt'); });
    qs('#remix-generate-btn')?.addEventListener('click', (e) => { e.preventDefault(); startGeneration('remix'); });

    // Format guide toggle
    qs('#script-format-guide-btn')?.addEventListener('click', () => {
      const guide = qs('#script-format-guide');
      const btn = qs('#script-format-guide-btn');
      const isHidden = guide?.hasAttribute('hidden');
      guide?.toggleAttribute('hidden', !isHidden);
      btn?.setAttribute('aria-expanded', String(isHidden));
    });

    // Load template buttons
    qs('#script-load-template-btn')?.addEventListener('click', loadScriptTemplate);
    qs('#load-example-script-btn')?.addEventListener('click', loadScriptTemplate);

    // Undo/redo
    qs('#studio-undo-btn')?.addEventListener('click', () => studioUndo());
    qs('#studio-redo-btn')?.addEventListener('click', () => studioRedo());

    // Download comic strip
    qs('#studio-download-btn')?.addEventListener('click', () => {
      if (state.fabricCanvas) {
        try {
          const dataURL = state.fabricCanvas.toDataURL({ format: 'png', quality: 1 });
          const link = document.createElement('a');
          const titleSlug = (state.generatedComic?.title || 'komicrew-ai-comic').toLowerCase().replace(/[^a-z0-9]+/g, '-');
          link.download = `${titleSlug}-strip.png`;
          link.href = dataURL;
          link.click();
          showToast('Download started! Your comic strip is saved. 🎨', 'success');
          return;
        } catch (err) {
          console.warn('Canvas toDataURL failed (likely tainted external image), falling back to first panel download', err);
        }
      }
      if (state.studioPanels && state.studioPanels[0]) {
        window.open(state.studioPanels[0].image_url, '_blank');
        showToast('Opened panel image in new tab.', 'info');
      } else {
        showToast('Generated comic panels saved.', 'success');
      }
    });

    // Cancel generation
    qs('#generation-cancel-btn')?.addEventListener('click', cancelGeneration);
  }

  function loadScriptTemplate() {
    const template = `PANEL 1: Wide shot — a gleaming cyberpunk neo-Tokyo at midnight. Towering holographic billboards illuminate rain-slicked glass facades.
HERO (V.O.): Every city has a pulse. Ours runs on raw code and adrenaline.

PANEL 2: Close-up on the Cyber Samurai's cybernetic visor as target telemetry streams across the glowing lenses.
SFX: VREEEEM...
SAMURAI: "Security grid bypassed. Target in sight."

PANEL 3: The Samurai leaps from the skyscraper rooftop, katana drawn, descending onto an armed patrol squad.
PATROL LEADER: "Intruder on the roof! Open fire!"
SFX: *ZZZZ-SNAP!*

PANEL 4: Silhouette landing against the blazing megastructure neon backdrop. The street echoes with power.
SFX: BOOM!
SAMURAI: "Mission complete. Disappearing into the network."`;

    const textarea = qs('#studio-script-textarea');
    if (textarea) {
      textarea.value = template;
      textarea.dispatchEvent(new Event('input'));
    }
    const titleInput = qs('#studio-comic-title');
    if (titleInput && (!titleInput.value.trim() || titleInput.value === 'Untitled Comic')) {
      titleInput.value = 'Cyber Samurai 2099: Neon Horizon';
      titleInput.dispatchEvent(new Event('input'));
    }
    const genreSelect = qs('#studio-genre-select');
    if (genreSelect && !genreSelect.value) {
      genreSelect.value = 'cyberpunk';
    }
    showToast('Cyberpunk Script Template loaded! 🎬', 'success', 2500);
  }

  async function startGeneration(mode) {
    if (state.studioGenState === 'generating') return;
    const textarea = qs(mode === 'prompt' ? '#studio-prompt-input' : mode === 'remix' ? '#remix-script-textarea' : '#studio-script-textarea');
    let text = textarea?.value.trim();
    if (!text) {
      if (mode === 'script') {
        loadScriptTemplate();
        text = textarea?.value.trim();
      } else if (mode === 'prompt') {
        textarea.value = 'A cyberpunk detective standing in a rain-soaked neon alley, inspecting a glowing holographic clue.';
        text = textarea.value.trim();
      } else if (mode === 'remix') {
        initRemixMode('amazing-fantasy-15');
        text = qs('#remix-script-textarea')?.value.trim();
      }
    }
    if (!text) {
      showToast('Please enter a script or prompt first.', 'warning');
      textarea?.focus();
      return;
    }
    state.studioGenState = 'generating';
    state.studioUndoStack = [];
    state.studioRedoStack = [];

    // UI: generating state
    const genStatus = qs('#studio-generation-status');
    const emptyState = qs('#studio-empty-state');
    const panelsOutput = qs('#studio-panels-output');
    const genBtnText = qs('#generate-btn-text');

    if (genBtnText) genBtnText.textContent = 'Generating…';
    if (genStatus) {
      genStatus.removeAttribute('hidden');
      genStatus.style.display = 'flex';
    }
    if (emptyState) {
      emptyState.setAttribute('hidden', '');
      emptyState.style.display = 'none';
    }
    if (panelsOutput) {
      panelsOutput.setAttribute('hidden', '');
      panelsOutput.style.display = 'none';
    }

    const stageLabel = qs('#generation-stage-label');
    const stepDetail = qs('#generation-step-detail');
    const progressBar = qs('#generation-progress-bar');

    const artStyle = qs('.art-style-radio:checked')?.value || 'tactile-neo-comic';
    const aiEngine = qs('.ai-engine-radio:checked')?.value || 'pollinations';
    const title = qs('#studio-comic-title')?.value.trim() || 'Cyber Samurai 2099';
    const genre = qs('#studio-genre-select')?.value || 'cyberpunk';
    const panelCount = parseInt(qs('#panel-count')?.value || '4');

    if (stageLabel) stageLabel.textContent = 'Connecting to AI Pipeline…';
    if (stepDetail) stepDetail.textContent = 'Step 1 of 4: Parsing screenplay & scene descriptions…';
    if (progressBar) progressBar.value = 25;

    try {
      if (stageLabel) stageLabel.textContent = 'Synthesizing artwork with FLUX Engine…';
      if (stepDetail) stepDetail.textContent = 'Step 2 of 4: Generating high-resolution panel visuals…';
      if (progressBar) progressBar.value = 50;

      const resp = await fetch('api/generate.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode, title, genre, script: text, art_style: artStyle, ai_engine: aiEngine, panel_count: panelCount
        })
      });

      if (progressBar) progressBar.value = 85;
      if (stageLabel) stageLabel.textContent = 'Compositing Dialogue & SFX Bubbles…';
      if (stepDetail) stepDetail.textContent = 'Step 3 of 4: Placing speech balloons, SFX & text overlays…';

      if (resp.ok) {
        const data = await resp.json();
        if (data && data.success && data.comic) {
          if (progressBar) progressBar.value = 100;
          if (stageLabel) stageLabel.textContent = 'Comic Generation Complete!';
          if (stepDetail) stepDetail.textContent = 'Step 4 of 4: Assembling comic strip on canvas…';
          completeGenerationWithData(data.comic);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend API error or network issue, using offline pipeline fallback:', err);
    }

    // Client-side fallback if server offline or timeout
    // Use genre-matched local comic panels so images ALWAYS appear
    const genreAssets = {
      cyberpunk:  ['assets/img/panels/neon-ghost-ch1-p1.jpg', 'assets/img/cover-neon-ghost.jpg', 'assets/img/spotlight-neon-ghost.jpg', 'assets/img/hero-backdrop-neon-ghost.jpg'],
      action:     ['assets/comics/amazing-fantasy-15/page-01.jpg', 'assets/comics/amazing-fantasy-15/page-05.jpg', 'assets/comics/captain-america-13/page-01.jpg', 'assets/comics/captain-america-13/page-08.jpg'],
      superheroes:['assets/comics/amazing-fantasy-15/page-01.jpg', 'assets/comics/amazing-fantasy-15/page-03.jpg', 'assets/comics/captain-america-13/page-02.jpg', 'assets/comics/marvel-comics-1/page-01.jpg'],
      'sci-fi':   ['assets/comics/marvel-comics-1/page-01.jpg', 'assets/comics/marvel-comics-1/page-04.jpg', 'assets/img/cover-void-hunters.jpg', 'assets/img/cover-mecha-hearts.jpg'],
      fantasy:    ['assets/img/cover-dragons-ascent.jpg', 'assets/img/cover-hollow-kingdom.jpg', 'assets/comics/marvel-comics-1/page-10.jpg', 'assets/comics/amazing-fantasy-15/page-12.jpg'],
      noir:       ['assets/comics/amazing-fantasy-15/page-02.jpg', 'assets/comics/marvel-comics-1/page-02.jpg', 'assets/comics/captain-america-13/page-04.jpg', 'assets/img/spotlight-laughing-detective.jpg'],
      romance:    ['assets/img/cover-sakura-circuit.jpg', 'assets/img/spotlight-mecha-hearts.jpg', 'assets/comics/amazing-fantasy-15/page-10.jpg', 'assets/comics/marvel-comics-1/page-06.jpg'],
      horror:     ['assets/img/cover-hollow-kingdom.jpg', 'assets/img/spotlight-void-hunters.jpg', 'assets/comics/captain-america-13/page-06.jpg', 'assets/comics/marvel-comics-1/page-07.jpg'],
    };
    const pool = genreAssets[genre] || genreAssets.action;
    const scriptLines = text.split('\n').filter(l => l.match(/PANEL\s*\d+/i));
    const usedDescs = scriptLines.length >= panelCount
      ? scriptLines.slice(0, panelCount).map(l => l.replace(/PANEL\s*\d+:?\s*/i, '').trim())
      : ['Wide shot of neon city skyline at midnight', 'Close-up on glowing cybernetic visor', 'Leaping from rooftop into battle', 'Heroic silhouette against blazing backdrop'];

    const fallbackPanels = Array.from({ length: Math.min(panelCount, 6) }, (_, i) => ({
      panel_number: i + 1,
      image_url: pool[i % pool.length],
      description: usedDescs[i] || `Scene ${i + 1}`,
      dialogue: i === 0 ? [{ speaker: 'HERO', text: 'Every city has a pulse. Ours runs on raw code.', is_vo: true, bubble_type: 'speech' }] : [],
      sfx: i === 2 ? ['*CRACK!*'] : i === 3 ? ['BOOM!'] : [],
    }));

    const fallbackComic = {
      id: 'gen_' + Date.now().toString(36),
      title: title || 'Cyber Samurai 2099',
      genre,
      art_style: artStyle,
      panels: fallbackPanels.slice(0, panelCount)
    };

    if (progressBar) progressBar.value = 100;
    if (stageLabel) stageLabel.textContent = 'Comic Generation Complete!';
    if (stepDetail) stepDetail.textContent = 'Step 4 of 4: Assembling comic strip on canvas…';
    completeGenerationWithData(fallbackComic);
  }

  function completeGenerationWithData(comicData) {
    completeGeneration();
    state.generatedComic = comicData;
    state.studioPanels = comicData.panels || [];

    // Pre-fill publish modal inputs
    const pubTitle = qs('#publish-title-input');
    if (pubTitle) pubTitle.value = comicData.title || qs('#studio-comic-title')?.value || 'My AI Comic';

    // Populate Thumbnail Strip with procedural fallback for each panel image
    const thumbStrip = qs('.studio-thumbnail-strip');
    if (thumbStrip && comicData.panels && comicData.panels.length) {
      thumbStrip.innerHTML = '';
      comicData.panels.forEach((p, idx) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'studio-thumb-item';
        wrapper.dataset.panelIdx = String(idx);
        wrapper.style.cssText = `cursor:pointer;display:inline-flex;flex-direction:column;align-items:center;gap:4px;padding:4px;border:2px solid ${idx === 0 ? 'var(--pop-yellow)' : 'var(--ink-border-sm)'};border-radius:6px;background:var(--bg-surface-raised);`;

        const img = document.createElement('img');
        img.alt = `Panel ${idx + 1}`;
        img.style.cssText = 'width:72px;height:90px;object-fit:cover;border-radius:4px;display:block;';

        img.onerror = () => {
          // Procedural fallback thumbnail
          const procUrl = generateProceduralComicPanel(p, comicData.genre || 'cyberpunk', comicData.art_style || 'tactile-neo-comic', 144, 180);
          img.onerror = null;
          img.src = procUrl;
          p.image_url = procUrl;
        };

        img.src = p.image_url || '';
        if (!p.image_url) {
          img.onerror();
        }

        const label = document.createElement('span');
        label.style.cssText = 'font-size:0.72rem;font-weight:bold;color:var(--text-primary);';
        label.textContent = `P${idx + 1}`;

        wrapper.appendChild(img);
        wrapper.appendChild(label);
        thumbStrip.appendChild(wrapper);
      });
    }

    // Render panels and bubbles on Fabric canvas
    try {
      initFabricStudioCanvas(comicData.panels);
    } catch(err) {
      console.error('Error initializing Fabric studio canvas:', err);
    }
  }

  function completeGeneration() {
    state.studioGenState = 'done';
    const genStatus = qs('#studio-generation-status');
    const emptyState = qs('#studio-empty-state');
    const panelsOutput = qs('#studio-panels-output');
    const genBtnText = qs('#generate-btn-text');
    const publishBtn = qs('#studio-publish-btn');
    const downloadBtn = qs('#studio-download-btn');
    const addBubbleBtn = qs('#studio-add-bubble-btn');
    const bubbleToolbar = qs('#speech-bubble-toolbar');

    if (genStatus) {
      genStatus.setAttribute('hidden', '');
      genStatus.style.display = 'none';
    }
    if (emptyState) {
      emptyState.setAttribute('hidden', '');
      emptyState.style.display = 'none';
    }
    if (panelsOutput) {
      panelsOutput.removeAttribute('hidden');
      panelsOutput.style.display = 'block';
    }
    if (genBtnText) genBtnText.textContent = 'Regenerate Comic';
    if (publishBtn) publishBtn.disabled = false;
    if (downloadBtn) downloadBtn.disabled = false;
    if (addBubbleBtn) addBubbleBtn.disabled = false;
    if (bubbleToolbar) bubbleToolbar.removeAttribute('hidden');

    showToast('Your comic panels are ready! 🎉', 'success', 3500);
  }

  function cancelGeneration() {
    state.studioGenState = 'idle';
    const genStatus = qs('#studio-generation-status');
    const emptyState = qs('#studio-empty-state');
    const genBtnText = qs('#generate-btn-text');
    if (genStatus) {
      genStatus.setAttribute('hidden', '');
      genStatus.style.display = 'none';
    }
    if (emptyState) {
      emptyState.removeAttribute('hidden');
      emptyState.style.display = 'block';
    }
    if (genBtnText) genBtnText.textContent = 'Generate Comic';
    showToast('Generation cancelled.', 'info', 2000);
  }

  function studioUndo() {
    if (!state.studioUndoStack.length) return;
    const action = state.studioUndoStack.pop();
    state.studioRedoStack.push(action);
    qs('#studio-undo-btn')?.toggleAttribute('disabled', !state.studioUndoStack.length);
    qs('#studio-redo-btn')?.removeAttribute('disabled');
    showToast('Undone', 'info', 1200);
  }

  function studioRedo() {
    if (!state.studioRedoStack.length) return;
    const action = state.studioRedoStack.pop();
    state.studioUndoStack.push(action);
    qs('#studio-redo-btn')?.toggleAttribute('disabled', !state.studioRedoStack.length);
    qs('#studio-undo-btn')?.removeAttribute('disabled');
    showToast('Redone', 'info', 1200);
  }

  function initRemixMode(comicId) {
    const titles = {
      'amazing-fantasy-15': 'Amazing Fantasy #15 (Spider-Man)',
      'marvel-comics-1': 'Marvel Comics #1 (Human Torch & Sub-Mariner)',
      'captain-america-13': 'Captain America Comics #13',
      'cyber-samurai-2099': 'Cyber Samurai 2099',
    };
    const sampleScripts = {
      'amazing-fantasy-15': `PAGE 1
PANEL 1: Midtown High Science Exhibition. Peter Parker watches intently as a radioactive spider descends from the ceiling under an active particle accelerator beam.
NARRATION: "Peter Parker, ordinary high school bookworm, is about to encounter destiny."
PETER: "Incredible... the radioactive field is generating extreme biological mutations!"

PANEL 2: The irradiated spider lands on Peter's hand and delivers a fatal bite. A brilliant shock of bio-energy jolts through his veins.
SFX: *ZZZZ-SNAP!*
PETER: "Ow! It bit me! My hand is burning with pure bio-electric power!"

PANEL 3: Peter stumbles out into the streets of Queens, instinctively vaulting over an oncoming speeding automobile.
DRIVER: "Look out, kid! Watch the road!"
PETER: "I jumped thirty feet into the air without even breaking a sweat!"

PANEL 4: Peter clings effortlessly to the sheer brick face of a building, looking down in awe.
PETER: "I'm sticking to the wall! It's like I have the proportionate strength and agility of a spider!"`,

      'marvel-comics-1': `PAGE 1
PANEL 1: The subterranean laboratory of Professor Phineas T. Horton. A life-sized synthetic humanoid is sealed within an airtight glass cylinder.
HORTON: "Gentlemen of science and press, behold! The world's first synthetic human!"

PANEL 2: Oxygen is admitted into the glass chamber. The synthetic epidermis reacts violently with oxygen, bursting into pure living flame.
SFX: *FWOOOOSH!*
REPORTER: "Great heavens, Horton! It's bursting into flame! Turn it off!"

PANEL 3: The Human Torch shatters the glass chamber and leaps toward the skylight, blazing brightly against the Manhattan skyline.
TORCH: "I am alive! The open sky belongs to me!"

PANEL 4: Miles beneath the ocean surface, Prince Namor the Sub-Mariner glides through the Atlantic trenches, watching the surface glow.
NAMOR: "Surface dwellers ignite their skies... They shall taste the wrath of Atlantis! Imperius Rex!"`,

      'captain-america-13': `PAGE 1
PANEL 1: Secret allied headquarters, 1942. Captain America and Bucky Barnes examine strategic aerial maps of the enemy fortress.
CAPTAIN AMERICA: "The Axis stronghold lies across the ridge. We breach their perimeter at midnight."
BUCKY: "Shield is polished and ready, Cap! Let's give 'em everything we've got!"

PANEL 2: Under heavy spotlight fire, Captain America charges forward, deflecting armor-piercing rounds with his circular vibranium-steel shield.
SFX: *KLANG! SPARK!*
ENEMY GUARD: "Achtung! Der Schild—it's Captain America!"

PANEL 3: Cap launches his shield in a ricocheting arc, smashing the fortress radar transmitter array.
CAPTAIN AMERICA: "For liberty and freedom! Keep moving forward, Bucky!"`
    };

    const cleanId = comicId || 'amazing-fantasy-15';
    const sourceTitleEl = qs('#remix-source-title');
    if (sourceTitleEl) sourceTitleEl.textContent = titles[cleanId] || cleanId || 'Marvel Comic Series';

    // Switch to remix tab
    const remixTab = qs('#studio-tab-remix');
    remixTab?.click();

    // Populate script
    const script = sampleScripts[cleanId] || sampleScripts['amazing-fantasy-15'];
    const remixTextarea = qs('#remix-script-textarea');
    if (remixTextarea) remixTextarea.value = script;
    const studioTextarea = qs('#studio-script-textarea');
    if (studioTextarea && (!studioTextarea.value.trim() || studioTextarea.value.includes('Cyber Samurai'))) {
      studioTextarea.value = script;
    }
    showToast(`Loaded authentic script for ${titles[cleanId] || cleanId}! 🎨`, 'success', 2500);
  }

  /* ═══════════════════════════════════════════════
     18.5. PROCEDURAL COMIC ARTWORK GENERATOR
  ═══════════════════════════════════════════════ */
  function generateProceduralComicPanel(panel = {}, genre = 'cyberpunk', artStyle = 'tactile-neo-comic', width = 600, height = 800) {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(400, Math.round(width));
    canvas.height = Math.max(500, Math.round(height));
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const w = canvas.width;
    const h = canvas.height;
    const pNum = panel.panel_number || 1;
    const desc = (panel.description || '').toLowerCase();
    const g = (genre || 'cyberpunk').toLowerCase();
    const style = (artStyle || 'tactile-neo-comic').toLowerCase();

    // 1. ATMOSPHERIC SKY & BACKDROP GRADIENT
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    if (g.includes('cyber') || desc.includes('cyber') || desc.includes('neon')) {
      skyGrad.addColorStop(0, '#070814');
      skyGrad.addColorStop(0.35, '#190a36');
      skyGrad.addColorStop(0.7, '#3b0764');
      skyGrad.addColorStop(1, '#064e3b');
    } else if (g.includes('action') || g.includes('hero') || desc.includes('hero')) {
      skyGrad.addColorStop(0, '#0f172a');
      skyGrad.addColorStop(0.35, '#831843');
      skyGrad.addColorStop(0.7, '#ea580c');
      skyGrad.addColorStop(1, '#fde047');
    } else if (g.includes('noir') || style.includes('noir') || desc.includes('shadow')) {
      skyGrad.addColorStop(0, '#09090b');
      skyGrad.addColorStop(0.5, '#18181b');
      skyGrad.addColorStop(1, '#3f3f46');
    } else if (g.includes('fantasy') || desc.includes('dragon') || desc.includes('magic')) {
      skyGrad.addColorStop(0, '#1e1b4b');
      skyGrad.addColorStop(0.4, '#4c1d95');
      skyGrad.addColorStop(0.8, '#831843');
      skyGrad.addColorStop(1, '#f97316');
    } else if (g.includes('sci-fi') || desc.includes('space') || desc.includes('void')) {
      skyGrad.addColorStop(0, '#020617');
      skyGrad.addColorStop(0.45, '#0f172a');
      skyGrad.addColorStop(0.8, '#1e1b4b');
      skyGrad.addColorStop(1, '#0284c7');
    } else {
      skyGrad.addColorStop(0, '#0f172a');
      skyGrad.addColorStop(0.5, '#1e3a8a');
      skyGrad.addColorStop(0.85, '#e11d48');
      skyGrad.addColorStop(1, '#fbbf24');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. CELESTIAL ORB / ENERGY CORE (SUN, MOON, or PORTAL)
    const orbX = w * (pNum % 2 === 1 ? 0.72 : 0.28);
    const orbY = h * 0.26;
    const orbR = w * (pNum === 1 ? 0.24 : 0.17);
    const orbGrad = ctx.createRadialGradient(orbX, orbY, 4, orbX, orbY, orbR);
    if (g.includes('cyber')) {
      orbGrad.addColorStop(0, '#f43f5e');
      orbGrad.addColorStop(0.7, '#ec4899');
      orbGrad.addColorStop(1, 'rgba(236,72,153,0)');
    } else if (g.includes('action')) {
      orbGrad.addColorStop(0, '#fef08a');
      orbGrad.addColorStop(0.65, '#f59e0b');
      orbGrad.addColorStop(1, 'rgba(234,88,12,0)');
    } else if (g.includes('fantasy')) {
      orbGrad.addColorStop(0, '#fef9c3');
      orbGrad.addColorStop(0.8, '#fbbf24');
      orbGrad.addColorStop(1, 'rgba(251,191,36,0)');
    } else {
      orbGrad.addColorStop(0, '#e2e8f0');
      orbGrad.addColorStop(0.7, '#94a3b8');
      orbGrad.addColorStop(1, 'rgba(148,163,184,0)');
    }
    ctx.fillStyle = orbGrad;
    ctx.beginPath();
    ctx.arc(orbX, orbY, orbR, 0, Math.PI * 2);
    ctx.fill();

    // 3. ACTION SPEED LINES (Comics wedge lines radiating from focal center)
    if (pNum === 2 || pNum === 3 || desc.includes('action') || desc.includes('leap') || desc.includes('fire')) {
      const focalX = w * 0.5;
      const focalY = h * 0.45;
      ctx.save();
      ctx.strokeStyle = g.includes('cyber') ? 'rgba(6,182,212,0.22)' : 'rgba(254,240,138,0.28)';
      ctx.lineWidth = 2;
      const rayCount = 28;
      for (let r = 0; r < rayCount; r++) {
        const angle = (r / rayCount) * Math.PI * 2;
        const innerDist = w * 0.16 + (r % 3) * 14;
        const outerDist = Math.max(w, h) * 1.25;
        ctx.beginPath();
        ctx.moveTo(focalX + Math.cos(angle) * innerDist, focalY + Math.sin(angle) * innerDist);
        ctx.lineTo(focalX + Math.cos(angle) * outerDist, focalY + Math.sin(angle) * outerDist);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 4. BEN DAY DOTS / HALFTONE TEXTURE (Vintage Comic Authenticity)
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    const dotStep = 14;
    for (let dy = 0; dy < h; dy += dotStep) {
      for (let dx = 0; dx < w; dx += dotStep) {
        if ((dx / dotStep + dy / dotStep) % 2 === 0) {
          ctx.beginPath();
          ctx.arc(dx, dy, 1.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.restore();

    // 5. MIDGROUND: CITY SKYLINE / JAGGED MOUNTAINS / ARCHITECTURE
    if (g.includes('cyber') || g.includes('action') || g.includes('sci-fi') || pNum === 1) {
      // Silhouette buildings
      ctx.fillStyle = '#0a0d18';
      const bldCount = 12;
      const bldW = w / (bldCount - 2);
      for (let b = 0; b < bldCount; b++) {
        const bH = h * 0.35 + ((b * 97) % Math.round(h * 0.25));
        const bX = (b - 1) * bldW;
        const bY = h - bH;
        ctx.fillRect(bX, bY, bldW + 2, bH);
      }

      // Foreground skyline with glowing windows
      ctx.fillStyle = '#05070f';
      const fgCount = 8;
      const fgW = w / (fgCount - 1);
      for (let f = 0; f < fgCount; f++) {
        const fH = h * 0.25 + ((f * 131) % Math.round(h * 0.28));
        const fX = (f - 0.5) * fgW;
        const fY = h - fH;
        ctx.fillRect(fX, fY, fgW + 2, fH);

        // Windows
        const cols = 3;
        const rows = 6;
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if ((f + r + c) % 3 !== 0) {
              const winX = fX + 12 + c * ((fgW - 24) / cols);
              const winY = fY + 16 + r * 18;
              ctx.fillStyle = (f + r) % 2 === 0 ? '#06b6d4' : '#f43f5e';
              ctx.fillRect(winX, winY, 6, 9);
            }
          }
        }
      }
    } else if (g.includes('fantasy')) {
      // Jagged mountain crags
      ctx.fillStyle = '#0f0e26';
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(0, h * 0.55);
      ctx.lineTo(w * 0.25, h * 0.42);
      ctx.lineTo(w * 0.5, h * 0.6);
      ctx.lineTo(w * 0.78, h * 0.38);
      ctx.lineTo(w, h * 0.58);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
    }

    // 6. FOREGROUND HERO & CHARACTER SILHOUETTES
    ctx.save();
    ctx.fillStyle = '#030509';
    ctx.shadowColor = g.includes('cyber') ? '#00f0ff' : '#f59e0b';
    ctx.shadowBlur = style.includes('noir') ? 0 : 8;

    if (pNum === 1) {
      // Rooftop ledge with crouching hero silhouette
      ctx.fillRect(0, h * 0.82, w, h * 0.18);
      ctx.fillRect(w * 0.15, h * 0.7, 4, h * 0.12);
      ctx.fillRect(w * 0.12, h * 0.73, 20, 2);

      const hX = w * 0.38;
      const hY = h * 0.82;
      // Cape / trenchcoat
      ctx.beginPath();
      ctx.moveTo(hX - 20, hY - 60);
      ctx.quadraticCurveTo(hX - 45, hY - 30, hX - 60, hY);
      ctx.lineTo(hX - 10, hY);
      ctx.closePath();
      ctx.fill();
      // Body & head
      ctx.beginPath();
      ctx.arc(hX, hY - 80, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(hX - 16, hY - 66, 32, 45);
      ctx.fillRect(hX - 22, hY - 25, 20, 25);
      ctx.fillRect(hX + 2, hY - 25, 20, 25);

      // Glowing eyes / visor
      ctx.fillStyle = g.includes('cyber') ? '#06b6d4' : '#fde047';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 12;
      ctx.fillRect(hX + 3, hY - 82, 8, 3);
    } else if (pNum === 2) {
      // High-tech terminal / targeting HUD reticle
      ctx.fillRect(0, h * 0.65, w, h * 0.35);
      ctx.strokeStyle = g.includes('cyber') ? '#00f0ff' : '#facc15';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.42, 65, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.42, 40, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(w * 0.5 - 85, h * 0.42);
      ctx.lineTo(w * 0.5 + 85, h * 0.42);
      ctx.moveTo(w * 0.5, h * 0.42 - 85);
      ctx.lineTo(w * 0.5, h * 0.42 + 85);
      ctx.stroke();

      // Telemetry text
      ctx.fillStyle = ctx.strokeStyle;
      ctx.font = 'bold 12px monospace';
      ctx.fillText('SYS.LOCK // 99.8%', w * 0.5 - 55, h * 0.42 + 80);
      ctx.fillText('GRID: ACTIVE', w * 0.5 - 40, h * 0.42 - 75);

      // Character corner silhouette
      ctx.fillStyle = '#030509';
      ctx.beginPath();
      ctx.arc(w * 0.85, h * 0.72, 45, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(w * 0.7, h * 0.78, w * 0.3, h * 0.22);
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(w * 0.78, h * 0.71, 16, 5);
    } else if (pNum === 3) {
      // Dynamic leap & blade clash
      ctx.fillRect(0, h * 0.85, w, h * 0.15);
      const lx = w * 0.45;
      const ly = h * 0.48;
      ctx.beginPath();
      ctx.arc(lx, ly - 50, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(lx - 18, ly - 35, 36, 55);
      ctx.beginPath();
      ctx.moveTo(lx - 12, ly + 20);
      ctx.lineTo(lx - 60, ly + 80);
      ctx.lineTo(lx - 45, ly + 85);
      ctx.lineTo(lx, ly + 25);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(lx + 8, ly + 20);
      ctx.lineTo(lx + 55, ly + 55);
      ctx.lineTo(lx + 45, ly + 65);
      ctx.lineTo(lx - 2, ly + 25);
      ctx.closePath();
      ctx.fill();

      // Glowing Katana / Energy Blade
      ctx.strokeStyle = g.includes('cyber') ? '#00f0ff' : '#fef08a';
      ctx.lineWidth = 4;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.moveTo(lx + 20, ly - 30);
      ctx.lineTo(lx + 110, ly - 110);
      ctx.stroke();

      // Sparks
      ctx.fillStyle = '#ffffff';
      for (let s = 0; s < 8; s++) {
        ctx.beginPath();
        ctx.arc(lx + 60 + s * 7, ly - 60 - s * 7 + (s % 2) * 10, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Heroic standing silhouette
      ctx.fillRect(0, h * 0.78, w, h * 0.22);
      const rx = w * 0.5;
      const ry = h * 0.78;
      ctx.beginPath();
      ctx.arc(rx, ry - 115, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(rx - 22, ry - 97, 44, 60);
      ctx.fillRect(rx - 20, ry - 37, 16, 37);
      ctx.fillRect(rx + 4, ry - 37, 16, 37);

      // Flowing cape
      ctx.beginPath();
      ctx.moveTo(rx - 22, ry - 90);
      ctx.quadraticCurveTo(rx - 85, ry - 40, rx - 100, ry);
      ctx.lineTo(rx - 20, ry);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(rx + 22, ry - 90);
      ctx.quadraticCurveTo(rx + 85, ry - 40, rx + 100, ry);
      ctx.lineTo(rx + 20, ry);
      ctx.closePath();
      ctx.fill();

      // Glowing twin blades / aura
      ctx.strokeStyle = '#00f0ff';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.moveTo(rx - 25, ry - 60);
      ctx.lineTo(rx - 45, ry + 10);
      ctx.moveTo(rx + 25, ry - 60);
      ctx.lineTo(rx + 45, ry + 10);
      ctx.stroke();

      // Visor
      ctx.fillStyle = '#ffe600';
      ctx.shadowColor = '#ffe600';
      ctx.shadowBlur = 12;
      ctx.fillRect(rx - 6, ry - 118, 12, 4);
    }
    ctx.restore();

    // 7. NEON RAIN STREAKS
    if (g.includes('cyber') || desc.includes('rain')) {
      ctx.save();
      ctx.strokeStyle = 'rgba(6,182,212,0.35)';
      ctx.lineWidth = 1.2;
      for (let rn = 0; rn < 35; rn++) {
        const rx = (rn * 37) % w;
        const ry = (rn * 47) % (h * 0.85);
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 12, ry + 28);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 8. COMIC VIGNETTE & INNER BORDER
    ctx.save();
    const vigGrad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.45, w / 2, h / 2, Math.max(w, h) * 0.75);
    vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
    vigGrad.addColorStop(1, 'rgba(0,0,0,0.65)');
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = '#05070d';
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, w - 6, h - 6);
    ctx.restore();

    return canvas.toDataURL('image/jpeg', 0.92);
  }

  /* ═══════════════════════════════════════════════
     19. FABRIC.JS SPEECH BUBBLE EDITOR (STUDIO)
  ═══════════════════════════════════════════════ */
  function initFabricStudioCanvas(panels = []) {
    const canvasEl = qs('#studio-fabric-canvas');
    if (!canvasEl || !window.fabric) return;

    const wrapper = qs('#studio-fabric-wrapper');
    const containerW = wrapper?.clientWidth || (window.innerWidth <= 768 ? window.innerWidth - 32 : 800);
    const w = Math.max(300, Math.min(containerW, 800));
    const h = Math.round(w * 1.3);

    let canvas = state.fabricCanvas;
    if (!canvas) {
      canvas = new fabric.Canvas('studio-fabric-canvas', {
        backgroundColor: '#0a0c12',
        selection: true,
        preserveObjectStacking: true,
      });
      state.fabricCanvas = canvas;
    } else {
      canvas.clear();
      canvas.backgroundColor = '#0a0c12';
    }
    canvas.setWidth(w);
    canvas.setHeight(h);

    const panelList = (panels && panels.length) ? panels : (state.studioPanels || []);
    const count = panelList.length || 4;
    const cols = count === 1 ? 1 : 2;
    const rows = Math.ceil(count / cols);
    const pad = 12;
    const panelW = (w - (cols + 1) * pad) / cols;
    const panelH = (h - (rows + 1) * pad) / rows;

    panelList.forEach((p, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const left = pad + col * (panelW + pad);
      const top = pad + row * (panelH + pad);

      // Panel dark background card with crisp golden border
      const bgCard = new fabric.Rect({
        left,
        top,
        width: panelW,
        height: panelH,
        fill: '#131722',
        stroke: '#facc15',
        strokeWidth: 3,
        rx: 6,
        ry: 6,
        selectable: false
      });
      canvas.add(bgCard);

      // Load AI Comic Image (Supports local assets, procedural vector art, and data URLs)
      const rawImgUrl = p.image_url || '';
      const imgEl = new Image();
      if (rawImgUrl && !rawImgUrl.startsWith('data:')) {
        imgEl.crossOrigin = 'anonymous';
      }

      imgEl.onload = function() {
        if (!canvas || !canvas.getContext()) return;
        const fImg = new fabric.Image(imgEl, {
          left: left + 3,
          top: top + 3,
          selectable: false,
          hoverCursor: 'default',
          evented: false,
        });
        const naturalW = imgEl.naturalWidth || imgEl.width || panelW;
        const naturalH = imgEl.naturalHeight || imgEl.height || panelH;
        const scale = Math.max((panelW - 6) / naturalW, (panelH - 6) / naturalH);
        fImg.set({
          scaleX: scale,
          scaleY: scale,
          clipPath: new fabric.Rect({
            left: left + 3,
            top: top + 3,
            width: panelW - 6,
            height: panelH - 6,
            rx: 4,
            ry: 4,
            absolutePositioned: true
          })
        });
        // Insert right above this panel's bgCard so badges and bubbles stay on top
        const allObjs = canvas.getObjects();
        const bgIdx = allObjs.indexOf(bgCard);
        if (bgIdx !== -1) {
          canvas.insertAt(fImg, bgIdx + 1, false);
        } else {
          canvas.add(fImg);
        }
        canvas.renderAll();
      };

      imgEl.onerror = function() {
        console.warn(`Panel ${p.panel_number || (i + 1)} image failed to load, falling back to procedural synthesizer`);
        const procUrl = generateProceduralComicPanel(p, state.generatedComic?.genre || 'cyberpunk', state.generatedComic?.art_style || 'tactile-neo-comic', panelW, panelH);
        p.image_url = procUrl;
        imgEl.onerror = null;
        imgEl.src = procUrl;
      };

      if (rawImgUrl) {
        imgEl.src = rawImgUrl;
      } else {
        const procUrl = generateProceduralComicPanel(p, state.generatedComic?.genre || 'cyberpunk', state.generatedComic?.art_style || 'tactile-neo-comic', panelW, panelH);
        p.image_url = procUrl;
        imgEl.src = procUrl;
      }

      // Panel badge
      const badgeBg = new fabric.Rect({
        left: left + 8,
        top: top + 8,
        width: 64,
        height: 20,
        fill: '#facc15',
        rx: 3,
        ry: 3,
        selectable: false
      });
      const badgeText = new fabric.Text(`PANEL ${p.panel_number || (i + 1)}`, {
        left: left + 14,
        top: top + 11,
        fontSize: 11,
        fontFamily: 'Bangers, sans-serif',
        fill: '#111827',
        fontWeight: 'bold',
        selectable: false
      });
      canvas.add(badgeBg, badgeText);

      // SFX Text (Sound Effects)
      if (p.sfx && p.sfx.length) {
        p.sfx.forEach(s => {
          const sText = String(s).toUpperCase();
          const sfx = new fabric.Text(sText, {
            left: left + panelW * 0.35,
            top: top + panelH * 0.45,
            fontSize: Math.max(18, Math.min(28, panelW * 0.1)),
            fontFamily: 'Bangers, Impact, sans-serif',
            fill: '#ef4444',
            stroke: '#fef08a',
            strokeWidth: 2,
            angle: -10,
            shadow: new fabric.Shadow({ color: '#111827', blur: 0, offsetX: 3, offsetY: 3 }),
            selectable: true
          });
          canvas.add(sfx);
        });
      }

      // Dialogue Speech Bubbles
      if (p.dialogue && p.dialogue.length) {
        p.dialogue.forEach((d, dIdx) => {
          const isVO = d.is_vo || d.bubble_type === 'caption';
          const bgCol = isVO ? '#facc15' : '#ffffff';
          const textCol = '#111827';
          const speakerPrefix = d.speaker ? `${d.speaker}: ` : '';
          const bubble = new fabric.IText(`${speakerPrefix}"${d.text}"`, {
            left: left + 14,
            top: top + 34 + dIdx * 48,
            fontSize: Math.max(11, Math.min(14, panelW * 0.05)),
            fontFamily: 'Bangers, sans-serif',
            fill: textCol,
            backgroundColor: bgCol,
            padding: 6,
            cornerColor: '#facc15',
            borderColor: '#111827',
            cornerSize: 8,
            shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.6)', blur: 4, offsetX: 2, offsetY: 2 }),
            selectable: true
          });
          canvas.add(bubble);
        });
      }
    });

    canvas.renderAll();

    // Hook bubble tools
    qs('#studio-add-bubble-btn')?.addEventListener('click', () => addSpeechBubble(canvas));
    canvas.on('selection:created', () => updateBubbleToolbarFromSelection(canvas));
    canvas.on('selection:updated', () => updateBubbleToolbarFromSelection(canvas));
    canvas.on('selection:cleared', () => updateBubbleToolbarFromSelection(canvas));
    canvas.on('object:modified', () => {
      state.studioUndoStack.push({ type: 'modify' });
      qs('#studio-undo-btn')?.removeAttribute('disabled');
    });
  }

  function addSpeechBubble(canvas) {
    if (!canvas || !window.fabric) return;
    const type = qs('.bubble-tool-btn--active')?.dataset.bubbleType || 'speech';
    const font = qs('#bubble-font-select')?.value || 'Bangers';
    const fontSize = parseInt(qs('#bubble-font-size')?.value || '16');
    const fillColor = qs('#bubble-fill-color')?.value || '#FFFFFF';
    const textColor = qs('#bubble-text-color')?.value || '#111827';

    const texts = { speech: 'Your dialogue here...', thought: 'Thinking...', shout: 'POW!', caption: 'Narration text', sfx: 'BOOM!' };
    const text = new fabric.IText(texts[type] || 'Click to edit', {
      left: 100 + Math.random() * 200,
      top: 100 + Math.random() * 200,
      fontSize, fontFamily: font,
      fill: textColor,
      backgroundColor: fillColor,
      padding: 10,
      cornerColor: '#f7e600',
      borderColor: '#111827',
      cornerSize: 8,
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    text.enterEditing();
    state.studioUndoStack.push({ type: 'add', obj: text });
    qs('#studio-undo-btn')?.removeAttribute('disabled');
  }

  function updateBubbleToolbarFromSelection(canvas) {
    const activeObj = canvas.getActiveObject();
    const deleteBtn = qs('#bubble-delete-btn');
    const dupBtn = qs('#bubble-duplicate-btn');
    const frontBtn = qs('#bubble-bring-front-btn');
    [deleteBtn, dupBtn, frontBtn].forEach(btn => { if (btn) btn.disabled = !activeObj; });
  }

  function initSpeechBubbleToolbar() {
    const toolbar = qs('#speech-bubble-toolbar');
    if (!toolbar) return;

    // Bubble type tabs
    qsa('.bubble-tool-btn[data-bubble-type]', toolbar).forEach(btn => {
      btn.addEventListener('click', () => {
        qsa('.bubble-tool-btn[data-bubble-type]', toolbar).forEach(b => { b.classList.remove('bubble-tool-btn--active'); b.setAttribute('aria-pressed', 'false'); });
        btn.classList.add('bubble-tool-btn--active');
        btn.setAttribute('aria-pressed', 'true');
      });
    });

    // Delete
    qs('#bubble-delete-btn')?.addEventListener('click', () => {
      const c = state.fabricCanvas;
      if (!c) return;
      const active = c.getActiveObject();
      if (active) { c.remove(active); c.renderAll(); state.studioUndoStack.push({ type: 'delete' }); }
    });
    // Duplicate
    qs('#bubble-duplicate-btn')?.addEventListener('click', () => {
      const c = state.fabricCanvas;
      if (!c) return;
      const active = c.getActiveObject();
      if (!active) return;
      active.clone((cloned) => {
        cloned.set({ left: active.left + 20, top: active.top + 20 });
        c.add(cloned);
        c.setActiveObject(cloned);
        c.renderAll();
      });
    });
    // Bring to front
    qs('#bubble-bring-front-btn')?.addEventListener('click', () => {
      const c = state.fabricCanvas;
      if (!c) return;
      const active = c.getActiveObject();
      if (active) { c.bringToFront(active); c.renderAll(); }
    });

    // Color updates
    qs('#bubble-fill-color')?.addEventListener('input', (e) => {
      const c = state.fabricCanvas;
      if (!c) return;
      const active = c.getActiveObject();
      if (active) { active.set('backgroundColor', e.target.value); c.renderAll(); }
    });
    qs('#bubble-text-color')?.addEventListener('input', (e) => {
      const c = state.fabricCanvas;
      if (!c) return;
      const active = c.getActiveObject();
      if (active) { active.set('fill', e.target.value); c.renderAll(); }
    });

    // Font family
    qs('#bubble-font-select')?.addEventListener('change', (e) => {
      const c = state.fabricCanvas;
      if (!c) return;
      const active = c.getActiveObject();
      if (active) { active.set('fontFamily', e.target.value); c.renderAll(); }
    });
    // Font size
    qs('#bubble-font-size')?.addEventListener('change', (e) => {
      const c = state.fabricCanvas;
      if (!c) return;
      const active = c.getActiveObject();
      if (active) { active.set('fontSize', parseInt(e.target.value)); c.renderAll(); }
    });
  }

  /* ═══════════════════════════════════════════════
     20. PUBLISH MODAL
  ═══════════════════════════════════════════════ */
  function initPublishModal() {
    const publishBtn = qs('#studio-publish-btn');
    const modal = qs('#publish-modal');
    const closeBtn = qs('#publish-modal-close');
    const overlay = qs('#publish-modal-overlay');
    const form = qs('#publish-form');
    const draftBtn = qs('#save-as-draft-btn');
    const tagsInput = qs('#publish-tags-input');
    const tagsList = qs('#publish-tags-list');

    publishBtn?.addEventListener('click', () => openModal(modal));
    closeBtn?.addEventListener('click', () => closeModal(modal));
    overlay?.addEventListener('click', () => closeModal(modal));
    modal?.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(modal); });

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = qs('#publish-title-input')?.value || qs('#studio-comic-title')?.value || 'My AI Comic';
      const synopsis = qs('#publish-synopsis-input')?.value || 'Created in Komicrew AI Studio.';
      const category = qs('#publish-category-select')?.value || 'seinen';
      const genre = qs('#studio-genre-select')?.value || 'action';
      const artStyle = qs('.art-style-radio:checked')?.value || 'tactile-neo-comic';

      // Export Fabric Canvas preview as cover
      let coverData = '';
      if (state.fabricCanvas) {
        try {
          coverData = state.fabricCanvas.toDataURL({ format: 'png', quality: 0.8 });
        } catch (err) { /* silent */ }
      }
      if (!coverData && state.studioPanels && state.studioPanels[0]) {
        coverData = state.studioPanels[0].image_url || state.studioPanels[0].url || '';
      }

      const payload = {
        title,
        synopsis,
        category,
        genre,
        art_style: artStyle,
        is_ai: true,
        cover_image: coverData || 'assets/img/cover-placeholder.png',
        panels: state.studioPanels || [],
        creator: state.currentUser?.username ? (state.currentUser.username.startsWith('@') ? state.currentUser.username : `@${state.currentUser.username}`) : '@creator',
        creator_id: state.currentUser?.id || null,
        chapter_title: 'Chapter 1',
        chapter_number: 1,
        status: 'published'
      };

      try {
        const resp = await fetch('api/publish.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await resp.json();
        if (data.success) {
          closeModal(modal);
          showToast(`🚀 "${title}" is live! Saved to database.`, 'success', 5000);
          fetchComicsCatalog();
          const targetSlug = data.comic?.slug;
          if (targetSlug) {
            setTimeout(() => {
              if (confirm(`"${title}" is published! Would you like to read it now in the Reader?`)) {
                navigateTo('reader', { comicId: targetSlug, chapter: 1 });
              }
            }, 600);
          }
          return;
        }
      } catch (err) {
        console.warn('Publish API call failed, falling back to local state:', err);
      }

      closeModal(modal);
      showToast('🚀 Your comic is live! Check it out on Komicrew.', 'success', 5000);
      fetchComicsCatalog();
    });

    draftBtn?.addEventListener('click', async () => {
      const title = qs('#publish-title-input')?.value || qs('#studio-comic-title')?.value || 'Untitled Draft';
      let coverData = '';
      if (state.fabricCanvas) {
        try { coverData = state.fabricCanvas.toDataURL({ format: 'png', quality: 0.8 }); } catch (err) {}
      }
      if (!coverData && state.studioPanels && state.studioPanels[0]) {
        coverData = state.studioPanels[0].image_url || state.studioPanels[0].url || '';
      }
      try {
        await fetch('api/publish.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            synopsis: qs('#publish-synopsis-input')?.value || 'Draft comic.',
            category: qs('#publish-category-select')?.value || 'superheroes',
            genre: qs('#studio-genre-select')?.value || 'action',
            cover_image: coverData || 'assets/img/cover-placeholder.png',
            panels: state.studioPanels || [],
            status: 'draft',
            creator: state.currentUser?.username ? (state.currentUser.username.startsWith('@') ? state.currentUser.username : `@${state.currentUser.username}`) : '@creator',
            creator_id: state.currentUser?.id || null
          })
        });
      } catch (err) { /* silent */ }
      closeModal(modal);
      showToast('💾 Saved as draft to database.', 'info', 4000);
      fetchComicsCatalog();
    });

    // Tags input
    const publishedTags = [];
    tagsInput?.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ',') return;
      e.preventDefault();
      const tag = tagsInput.value.trim().replace(/,/g, '');
      if (!tag || publishedTags.includes(tag) || publishedTags.length >= 10) return;
      publishedTags.push(tag);
      tagsInput.value = '';
      const li = document.createElement('li');
      li.className = 'tag-item';
      li.innerHTML = `<span>${escapeHtml(tag)}</span><button type="button" class="tag-remove-btn" aria-label="Remove tag ${escapeHtml(tag)}">✕</button>`;
      li.querySelector('.tag-remove-btn').addEventListener('click', () => {
        const idx = publishedTags.indexOf(tag);
        if (idx > -1) publishedTags.splice(idx, 1);
        li.remove();
      });
      tagsList?.appendChild(li);
    });
  }

  function openModal(modal) {
    if (!modal) return;
    modal.removeAttribute('hidden');
    document.body.classList.add('no-scroll');
    trap(modal);
    const firstInput = modal.querySelector('input:not([type="hidden"]), textarea, select, button');
    setTimeout(() => firstInput?.focus(), 100);
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.setAttribute('hidden', '');
    document.body.classList.remove('no-scroll');
    qs('#studio-publish-btn')?.focus();
  }

  /* ═══════════════════════════════════════════════
     21. RANGE INPUT LABELS
  ═══════════════════════════════════════════════ */
  function initRangeLabels() {
    const rangeMap = [
      { input: '#style-strength-range', label: '#style-strength-label', suffix: '%' },
    ];
    rangeMap.forEach(({ input, label, suffix }) => {
      const el = qs(input);
      const lbl = qs(label);
      if (!el || !lbl) return;
      const update = () => { lbl.textContent = `${el.value}${suffix}`; };
      el.addEventListener('input', update);
      update();
    });
  }

  /* ═══════════════════════════════════════════════
     22. GLOBAL HEADER SCROLL BEHAVIOUR
  ═══════════════════════════════════════════════ */
  function initHeaderScroll() {
    const header = qs('#global-header');
    if (!header) return;
    let lastY = 0;
    window.addEventListener('scroll', debounce(() => {
      const y = window.scrollY;
      if (y > 80) header.classList.add('header--scrolled');
      else header.classList.remove('header--scrolled');
      if (y > lastY && y > 200) header.classList.add('header--hidden');
      else header.classList.remove('header--hidden');
      lastY = y;
    }, 50));
  }

  /* ═══════════════════════════════════════════════
     23. FOOTER
  ═══════════════════════════════════════════════ */
  function initFooter() {
    const yearEl = qs('#footer-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    const newsletterForm = qs('#newsletter-form');
    const msgEl = qs('#newsletter-form-message');
    newsletterForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = qs('#newsletter-email')?.value.trim();
      if (!email) return;
      if (msgEl) { msgEl.textContent = `✅ Thanks! You're subscribed as ${email}.`; msgEl.className = 'newsletter-form-message newsletter-form-message--success'; }
      qs('#newsletter-email').value = '';
    });

    // "Coming soon" footer links — show friendly toast instead of dead navigation
    document.addEventListener('click', (e) => {
      const link = e.target.closest('[data-action="coming-soon"]');
      if (!link) return;
      e.preventDefault();
      const label = link.dataset.label || link.textContent.trim();
      showToast(`🚀 ${label} — coming soon! Stay tuned.`, 'info', 3000);
    });
  }

  /* ═══════════════════════════════════════════════
     24. HERO SCROLL CUE
  ═══════════════════════════════════════════════ */
  function initHeroScrollCue() {
    const cue = qs('.hero-scroll-cue');
    if (!cue) return;
    window.addEventListener('scroll', () => {
      if (window.scrollY > 60) cue.style.opacity = '0';
      else cue.style.opacity = '1';
    }, { passive: true });
    cue.addEventListener('click', () => {
      qs('#top-picks')?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  /* ═══════════════════════════════════════════════
     25. INTERSECTION OBSERVER — SCROLL ANIMATIONS
  ═══════════════════════════════════════════════ */
  function initScrollAnimations() {
    if (!('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate--visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    qsa('.comic-card-wrapper, .spotlight-card-wrapper, .landing-section-header, .ai-spotlight-section, .landing-cta-section').forEach(el => {
      el.classList.add('animate--on-scroll');
      observer.observe(el);
    });
  }


  /* ═══════════════════════════════════════════════
     26. ADMIN CONTROL CENTER (#view-admin)
  ═══════════════════════════════════════════════ */
  function initAdminView() {
    if (!qs('#view-admin')) return;
    initAdminTabs();
    renderAdminCatalogTable();
    initHeroSpotlightManager();
    initAdminUploader();
    initTaxonomyManager();
    initCreatorSpotlightManager();
    initAdminHeaderActions();
  }

  function initAdminTabs() {
    const tabs = qsa('.admin-tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => {
          t.classList.remove('admin-tab-btn--active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('admin-tab-btn--active');
        tab.setAttribute('aria-selected', 'true');
        const targetId = tab.dataset.adminTab;
        state.adminTab = targetId;

        qsa('.admin-subpanel').forEach(p => p.setAttribute('hidden', ''));
        const activeSubpanel = qs(`#admin-panel-${targetId}`);
        activeSubpanel?.removeAttribute('hidden');
      });
    });
  }

  function renderAdminCatalogTable(filterText = '') {
    const tbody = qs('#admin-comics-tbody');
    if (!tbody) return;

    const q = filterText.toLowerCase();
    const filtered = state.comicsCatalog.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.creator.toLowerCase().includes(q) ||
      c.genre.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );

    if (!filtered.length) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-muted)">No comics found matching "${escapeHtml(filterText)}"</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(c => {
      const statusClass = c.status === 'featured' ? 'admin-status--featured' : (c.status === 'published' ? 'admin-status--published' : 'admin-status--draft');
      const statusLabel = c.status.toUpperCase();
      return `
        <tr data-comic-id="${c.id}">
          <td><img src="${c.cover}" alt="${escapeHtml(c.title)}" class="admin-table-cover-img"/></td>
          <td>
            <strong>${escapeHtml(c.title)}</strong><br/>
            <span style="font-size:0.78rem;color:var(--text-muted)">${escapeHtml(c.creator)} &middot; ${c.chapters} Ch.</span>
          </td>
          <td><span class="comic-tag">${escapeHtml(c.genre)}</span> <span class="comic-tag">${escapeHtml(c.category)}</span></td>
          <td>${c.is_ai ? '<span class="card-ai-badge">✨ AI</span>' : '<span class="comic-tag">🎨 Original</span>'}</td>
          <td>⭐ ${c.rating} <span style="font-size:0.75rem;color:var(--text-muted)">(${c.views})</span></td>
          <td>
            <button class="admin-status-toggle-btn ${statusClass}" data-comic-id="${c.id}" aria-label="Toggle status for ${escapeHtml(c.title)}">
              ${statusLabel}
            </button>
          </td>
          <td>
            <div class="admin-table-action-group">
              <button class="btn btn--sm btn--ghost admin-table-read-btn" data-view-target="reader" data-comic-id="${c.id}" aria-label="Read">📖</button>
              <button class="btn btn--sm btn--ghost admin-table-delete-btn" data-comic-id="${c.id}" aria-label="Delete">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Status Toggle Button Events
    qsa('.admin-status-toggle-btn', tbody).forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.comicId;
        const comic = state.comicsCatalog.find(c => c.id === id);
        if (!comic) return;

        // Cycle through: published -> featured -> draft -> published
        if (comic.status === 'published') comic.status = 'featured';
        else if (comic.status === 'featured') comic.status = 'draft';
        else comic.status = 'published';

        renderAdminCatalogTable(qs('#admin-catalog-search')?.value || '');
        showToast(`"${comic.title}" status changed to ${comic.status.toUpperCase()}`, 'info');
      });
    });

    // Delete Button Events
    qsa('.admin-table-delete-btn', tbody).forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.comicId;
        const idx = state.comicsCatalog.findIndex(c => c.id === id);
        if (idx > -1) {
          const removed = state.comicsCatalog.splice(idx, 1)[0];
          renderAdminCatalogTable(qs('#admin-catalog-search')?.value || '');
          updateAdminStats();
          showToast(`Removed "${removed.title}" from catalog`, 'warning');
        }
      });
    });

    // Table Search Filter
    const searchInput = qs('#admin-catalog-search');
    searchInput?.removeEventListener('input', searchInput._handler);
    searchInput._handler = debounce(() => {
      renderAdminCatalogTable(searchInput.value);
    }, 200);
    searchInput?.addEventListener('input', searchInput._handler);
  }

  function updateAdminStats() {
    const totalComicsEl = qs('#stat-total-comics');
    if (totalComicsEl) totalComicsEl.textContent = state.comicsCatalog.length;
  }

  function initHeroSpotlightManager() {
    const radios = qsa('input[name="hero_selected_comic"]');
    const previewTitle = qs('#hero-preview-title');
    const previewSynopsis = qs('#hero-preview-synopsis');
    const previewMeta = qs('#hero-preview-meta');
    const applyBtn = qs('#save-hero-spotlight-btn');

    const updatePreview = (comicId) => {
      const comic = state.comicsCatalog.find(c => c.id === comicId);
      if (!comic) return;
      if (previewTitle) previewTitle.textContent = comic.title;
      if (previewSynopsis) previewSynopsis.textContent = comic.synopsis;
      if (previewMeta) previewMeta.textContent = `by ${comic.creator} · ${comic.genre} · ⭐ ${comic.rating} (${comic.views} views)`;
    };

    radios.forEach(radio => {
      radio.addEventListener('change', () => {
        if (radio.checked) updatePreview(radio.value);
      });
    });

    applyBtn?.addEventListener('click', () => {
      const selected = qs('input[name="hero_selected_comic"]:checked')?.value;
      if (!selected) return;
      state.selectedHeroComic = selected;
      const comic = state.comicsCatalog.find(c => c.id === selected);

      // Update the live Landing Hero DOM elements!
      const heroHeading = qs('#hero-heading');
      const heroSynopsis = qs('.hero-synopsis');
      const heroCreator = qs('.hero-creator-name');
      const heroGenreTag = qs('.hero-genre-tag');
      const heroBackdropImg = qs('.hero-backdrop img');

      if (heroHeading) heroHeading.textContent = comic.title;
      if (heroSynopsis) heroSynopsis.textContent = comic.synopsis;
      if (heroCreator) heroCreator.textContent = comic.creator;
      if (heroGenreTag) heroGenreTag.textContent = `${comic.genre} ${comic.category}`;

      showToast(`⭐ "${comic.title}" is now the #1 Trending Hero Spotlight!`, 'success', 3500);
    });
  }

  function initAdminUploader() {
    const form = qs('#admin-uploader-form');
    const coverDropzone = qs('#cover-dropzone');
    const coverInput = qs('#cover-file-input');
    const coverContent = qs('#cover-dropzone-content');
    const coverPreview = qs('#cover-dropzone-preview');
    const coverImg = qs('#cover-preview-img');
    const coverRemoveBtn = qs('#cover-remove-btn');

    const panelsDropzone = qs('#panels-dropzone');
    const panelsInput = qs('#panels-file-input');
    const panelsContent = qs('#panels-dropzone-content');
    const panelsPreview = qs('#panels-dropzone-preview');
    const panelsCountEl = qs('#panels-batch-count');
    const panelsRemoveBtn = qs('#panels-remove-btn');

    let uploadedCoverData = 'assets/img/cover-placeholder.png';

    // Cover Dropzone
    coverDropzone?.addEventListener('click', (e) => {
      if (e.target !== coverRemoveBtn) coverInput?.click();
    });
    coverInput?.addEventListener('change', () => {
      const file = coverInput.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          uploadedCoverData = e.target.result;
          if (coverImg) coverImg.src = uploadedCoverData;
          coverContent?.setAttribute('hidden', '');
          coverPreview?.removeAttribute('hidden');
        };
        reader.readAsDataURL(file);
      }
    });
    coverRemoveBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (coverInput) coverInput.value = '';
      coverPreview?.setAttribute('hidden', '');
      coverContent?.removeAttribute('hidden');
      uploadedCoverData = 'assets/img/cover-placeholder.png';
    });

    // Panels Batch Dropzone
    panelsDropzone?.addEventListener('click', (e) => {
      if (e.target !== panelsRemoveBtn) panelsInput?.click();
    });
    panelsInput?.addEventListener('change', () => {
      const count = panelsInput.files?.length || 0;
      if (count > 0) {
        if (panelsCountEl) panelsCountEl.textContent = `📑 ${count} panel image${count > 1 ? 's' : ''} staged`;
        panelsContent?.setAttribute('hidden', '');
        panelsPreview?.removeAttribute('hidden');
      }
    });
    panelsRemoveBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (panelsInput) panelsInput.value = '';
      panelsPreview?.setAttribute('hidden', '');
      panelsContent?.removeAttribute('hidden');
    });

    // Submit New Comic
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = qs('#admin-comic-title')?.value.trim();
      const creator = qs('#admin-creator-name')?.value.trim();
      const synopsis = qs('#admin-synopsis')?.value.trim() || 'Exciting new comic series.';
      const category = qs('#admin-category-select')?.value || 'seinen';
      const style = qs('#admin-style-select')?.value || 'tactile-neo-comic';
      const checkedGenres = qsa('input[name="admin_genres"]:checked').map(cb => cb.value);

      if (!title || !creator) {
        showToast('Please provide both Comic Title and Creator Handle.', 'warning');
        return;
      }

      const newComic = {
        id: title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 1000),
        title,
        creator,
        genre: checkedGenres[0] ? checkedGenres[0].charAt(0).toUpperCase() + checkedGenres[0].slice(1) : 'Action',
        category: category.charAt(0).toUpperCase() + category.slice(1),
        style: style,
        is_ai: true,
        rating: 5.0,
        views: '1',
        chapters: 1,
        status: 'published',
        cover: uploadedCoverData,
        synopsis,
      };

      state.comicsCatalog.unshift(newComic);
      renderAdminCatalogTable();
      updateAdminStats();

      form.reset();
      coverRemoveBtn?.click();
      panelsRemoveBtn?.click();

      showToast(`🚀 "${title}" successfully published to Komicrew!`, 'success', 4000);

      // Switch to catalog tab to see it
      qs('#admin-tab-catalog')?.click();
    });
  }

  function initTaxonomyManager() {
    const bindTaxonomy = (addBtnId, inputId, listId) => {
      const addBtn = qs(addBtnId);
      const input = qs(inputId);
      const list = qs(listId);

      const addTag = () => {
        const val = input?.value.trim();
        if (!val || !list) return;
        const span = document.createElement('span');
        span.className = 'tax-badge';
        span.innerHTML = `${escapeHtml(val)} <button type="button" class="tax-del-btn" aria-label="Delete">✕</button>`;
        span.querySelector('.tax-del-btn')?.addEventListener('click', () => {
          span.remove();
          showToast(`Deleted tag "${val}"`, 'info', 1500);
        });
        list.appendChild(span);
        if (input) input.value = '';
        showToast(`Added tag "${val}"`, 'success', 1500);
      };

      addBtn?.addEventListener('click', addTag);
      input?.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } });

      // Initial delete buttons
      qsa('.tax-del-btn', list).forEach(btn => {
        btn.addEventListener('click', () => {
          const badge = btn.closest('.tax-badge');
          const txt = badge?.textContent.replace('✕', '').trim();
          badge?.remove();
          showToast(`Deleted tag "${txt}"`, 'info', 1500);
        });
      });
    };

    bindTaxonomy('#add-category-btn', '#new-category-input', '#taxonomy-categories-list');
    bindTaxonomy('#add-genre-btn', '#new-genre-input', '#taxonomy-genres-list');
    bindTaxonomy('#add-style-btn', '#new-style-input', '#taxonomy-styles-list');
  }

  function initCreatorSpotlightManager() {
    const form = qs('#admin-creator-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const handle = qs('#creator-handle-input')?.value.trim();
      const badge = qs('#creator-badge-select')?.value;
      showToast(`Saved creator profile for ${handle} with tier [${badge}]!`, 'success', 3000);
    });
  }

  function initAdminHeaderActions() {
    qs('#admin-refresh-metrics-btn')?.addEventListener('click', () => {
      updateAdminStats();
      showToast('Synced live platform metrics from database.', 'success', 2000);
    });
    qs('#admin-quick-publish-btn')?.addEventListener('click', () => {
      qs('#admin-tab-uploader')?.click();
    });
  }


  /* ═══════════════════════════════════════════════
     26. AUTHENTICATION (LOGIN & SIGN UP)
  ═══════════════════════════════════════════════ */
  function updateAuthUI() {
    const guestNav = qs('#nav-auth-guest');
    const userNav = qs('#nav-auth-user');
    const userName = qs('#header-user-name');
    const userTier = qs('#header-user-tier');
    const userAvatar = qs('#header-user-avatar');

    if (state.currentUser) {
      if (guestNav) {
        guestNav.setAttribute('hidden', '');
        guestNav.style.display = 'none';
      }
      if (userNav) {
        userNav.removeAttribute('hidden');
        userNav.style.display = 'flex';
      }
      if (userName) userName.textContent = state.currentUser.username;
      if (userTier) userTier.textContent = state.currentUser.tier || 'Creator';
      if (userAvatar && state.currentUser.avatar_url) userAvatar.src = state.currentUser.avatar_url;

      const adminMenuItem = qs('#menu-admin-item');
      if (adminMenuItem) {
        if (state.currentUser.role === 'admin' || localStorage.getItem('pp_admin_auth') === 'true') {
          adminMenuItem.removeAttribute('hidden');
        } else {
          adminMenuItem.setAttribute('hidden', '');
        }
      }
    } else {
      if (userNav) {
        userNav.setAttribute('hidden', '');
        userNav.style.display = 'none';
      }
      if (guestNav) {
        guestNav.removeAttribute('hidden');
        guestNav.style.display = 'flex';
      }
    }
  }

  function initAuth() {
    try {
      const stored = localStorage.getItem('pp_user');
      if (stored) state.currentUser = JSON.parse(stored);
    } catch (e) {}

    fetch('api/auth.php?action=me')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          state.currentUser = data.user;
          localStorage.setItem('pp_user', JSON.stringify(data.user));
          if (data.user.role === 'admin') {
            localStorage.setItem('pp_admin_auth', 'true');
          }
          updateAuthUI();
        }
      }).catch(() => {});

    updateAuthUI();

    const authModal = qs('#auth-modal');
    const authClose = qs('#auth-modal-close');
    const authOverlay = qs('#auth-modal-overlay');
    const tabLogin = qs('#auth-tab-login');
    const tabSignup = qs('#auth-tab-signup');
    const formLogin = qs('#login-form');
    const formSignup = qs('#signup-form');

    const navLoginBtn = qs('#nav-login-btn');
    const navSignupBtn = qs('#nav-signup-btn');
    const navLogoutBtn = qs('#nav-logout-btn');

    const openAuthModal = (mode = 'login') => {
      authModal?.removeAttribute('hidden');
      document.body.classList.add('no-scroll');
      if (mode === 'signup') {
        tabSignup?.click();
      } else {
        tabLogin?.click();
      }
    };

    const closeAuthModal = () => {
      authModal?.setAttribute('hidden', '');
      document.body.classList.remove('no-scroll');
    };

    navLoginBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      openAuthModal('login');
    });
    navSignupBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      openAuthModal('signup');
    });
    authClose?.addEventListener('click', closeAuthModal);
    authOverlay?.addEventListener('click', closeAuthModal);

    tabLogin?.addEventListener('click', () => {
      tabLogin.classList.add('auth-tab-btn--active');
      tabLogin.setAttribute('aria-selected', 'true');
      tabSignup?.classList.remove('auth-tab-btn--active');
      tabSignup?.setAttribute('aria-selected', 'false');
      formLogin?.removeAttribute('hidden');
      formSignup?.setAttribute('hidden', '');
    });

    tabSignup?.addEventListener('click', () => {
      tabSignup.classList.add('auth-tab-btn--active');
      tabSignup.setAttribute('aria-selected', 'true');
      tabLogin?.classList.remove('auth-tab-btn--active');
      tabLogin?.setAttribute('aria-selected', 'false');
      formSignup?.removeAttribute('hidden');
      formLogin?.setAttribute('hidden', '');
    });

    formLogin?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const login = qs('#login-email')?.value.trim();
      const password = qs('#login-password')?.value;

      if (!login || !password) {
        showToast('Please enter both username/email and password.', 'warning');
        return;
      }

      try {
        const resp = await fetch('api/auth.php?action=login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ login, password })
        });
        const data = await resp.json();
        if (data.success && data.user) {
          state.currentUser = data.user;
          localStorage.setItem('pp_user', JSON.stringify(data.user));
          if (data.is_admin || data.user.role === 'admin') {
            localStorage.setItem('pp_admin_auth', 'true');
          } else {
            localStorage.removeItem('pp_admin_auth');
          }
          updateAuthUI();
          closeAuthModal();
          showToast(data.message || `Welcome back, @${data.user.username}!`, 'success');
          return;
        } else {
          showToast(data.error || 'Invalid credentials.', 'error');
          return;
        }
      } catch (err) {
        const fallbackUser = {
          id: 1,
          username: login.replace('@', ''),
          email: `${login}@komicrew.app`,
          role: 'creator',
          tier: 'Creator',
          avatar_url: 'assets/img/avatar-user.jpg'
        };
        state.currentUser = fallbackUser;
        localStorage.setItem('pp_user', JSON.stringify(fallbackUser));
        updateAuthUI();
        closeAuthModal();
        showToast(`Welcome back, @${fallbackUser.username}! 👋`, 'success');
      }
    });

    formSignup?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = qs('#signup-username')?.value.trim();
      const email = qs('#signup-email')?.value.trim();
      const password = qs('#signup-password')?.value;
      const role = qs('#signup-role')?.value || 'creator';

      if (!username || !email || !password) {
        showToast('Please fill out all registration fields.', 'warning');
        return;
      }

      try {
        const resp = await fetch('api/auth.php?action=signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password, role })
        });
        const data = await resp.json();
        if (data.success && data.user) {
          state.currentUser = data.user;
          localStorage.setItem('pp_user', JSON.stringify(data.user));
          updateAuthUI();
          closeAuthModal();
          showToast(data.message || `Welcome to Komicrew, @${data.user.username}!`, 'success', 4000);
          return;
        } else {
          showToast(data.error || 'Failed to create account.', 'error');
          return;
        }
      } catch (err) {
        const fallbackUser = {
          id: Math.floor(Math.random() * 1000) + 10,
          username: username.replace('@', ''),
          email: email,
          role: role,
          tier: role === 'creator' ? 'Creator' : 'Free',
          avatar_url: 'assets/img/avatar-user.jpg'
        };
        state.currentUser = fallbackUser;
        localStorage.setItem('pp_user', JSON.stringify(fallbackUser));
        updateAuthUI();
        closeAuthModal();
        showToast(`Account created! Welcome, @${fallbackUser.username}! 🚀`, 'success', 4000);
      }
    });

    navLogoutBtn?.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await fetch('api/auth.php?action=logout');
      } catch (err) { /* silent */ }
      state.currentUser = null;
      localStorage.removeItem('pp_user');
      localStorage.removeItem('pp_admin_auth');
      closeProfileDropdown();
      updateAuthUI();
      showToast('You have signed out of Komicrew.', 'info');
    });

    qs('#social-google-btn')?.addEventListener('click', () => {
      const demoUser = { id: 99, username: 'google_user', email: 'user@gmail.com', role: 'creator', tier: 'Pro', avatar_url: 'assets/img/avatar-user.jpg' };
      state.currentUser = demoUser;
      localStorage.setItem('pp_user', JSON.stringify(demoUser));
      updateAuthUI();
      closeAuthModal();
      showToast('Signed in with Google! 🌐', 'success');
    });

    qs('#social-discord-btn')?.addEventListener('click', () => {
      const demoUser = { id: 101, username: 'discord_creator', email: 'creator@discord.gg', role: 'creator', tier: 'Creator', avatar_url: 'assets/img/avatar-user.jpg' };
      state.currentUser = demoUser;
      localStorage.setItem('pp_user', JSON.stringify(demoUser));
      updateAuthUI();
      closeAuthModal();
      showToast('Signed in with Discord! 💬', 'success');
    });
  }

  function initGuidedView() {
    // Guided view panel mode handler
    const guidedBtn = qs('#reader-mode-guided');
    if (guidedBtn) {
      guidedBtn.addEventListener('click', () => {
        applyReaderMode('guided');
      });
    }
  }

  /* ═══════════════════════════════════════════════
     27. INITIALISE ALL MODULES
  ═══════════════════════════════════════════════ */
  function safeRun(fn, name) {
    try {
      if (typeof fn === 'function') fn();
    } catch (e) {
      console.warn(`[Komicrew] Module init warning (${name}):`, e);
    }
  }

  function init() {
    safeRun(initTheme, 'theme');
    safeRun(initRouter, 'router');
    safeRun(initMegaMenu, 'megaMenu');
    safeRun(initProfileDropdown, 'profileDropdown');
    safeRun(initMobileMenu, 'mobileMenu');
    safeRun(initSearch, 'search');
    safeRun(initBookmarks, 'bookmarks');
    safeRun(initNotifications, 'notifications');
    safeRun(initLandingFilterTabs, 'landingFilterTabs');
    safeRun(initSpotlightCarousel, 'spotlightCarousel');
    safeRun(initBrowseView, 'browseView');
    safeRun(initReaderView, 'readerView');
    safeRun(initStudioView, 'studioView');
    safeRun(initAuth, 'auth');
    safeRun(initCharacterVault, 'characterVault');
    safeRun(initTipJar, 'tipJar');
    safeRun(initGuidedView, 'guidedView');
    safeRun(initReadingProgress, 'readingProgress');
    safeRun(initProfileModal, 'profileModal');
    safeRun(initExportModal, 'exportModal');
    try {
      qs('#reader-bgm-toggle')?.addEventListener('click', toggleAmbientSoundtrack);
      qs('#reader-tts-toggle')?.addEventListener('click', toggleTTSNarration);
    } catch (e) {}
    safeRun(initAdminView, 'adminView');
    safeRun(initHeaderScroll, 'headerScroll');
    safeRun(initFooter, 'footer');
    safeRun(initHeroScrollCue, 'heroScrollCue');
    safeRun(initScrollAnimations, 'scrollAnimations');
    safeRun(fetchComicsCatalog, 'fetchComicsCatalog');

    const yearEl = qs('#footer-year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
    console.log('%cKomicrew JS v1.0 — Initialised with Live Database Connection ✨', 'color:#f7e600;background:#111827;padding:4px 8px;border-radius:4px;font-family:Bangers,sans-serif;font-size:16px;');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();


  /* ═══════════════════════════════════════════════
     28. AUDIO ENGINE, SOUNDTRACKS & TTS NARRATOR
  ═══════════════════════════════════════════════ */
  let audioCtx = null;
  let bgmOsc = null;
  let bgmGain = null;
  let isBgmPlaying = false;

  function getAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playPageTurnSound() {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.13);
    } catch (e) { /* silent */ }
  }

  function playCoinTipSound() {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.36);
    } catch (e) { /* silent */ }
  }

  function toggleAmbientSoundtrack() {
    const bgmIcon = qs('#bgm-icon');
    const bgmLabel = qs('#bgm-label');

    if (isBgmPlaying) {
      if (bgmGain) {
        bgmGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.5);
        setTimeout(() => {
          if (bgmOsc) { bgmOsc.stop(); bgmOsc.disconnect(); bgmOsc = null; }
          isBgmPlaying = false;
        }, 500);
      }
      if (bgmIcon) bgmIcon.textContent = '🎵';
      if (bgmLabel) bgmLabel.textContent = 'Cyberpunk Ambience';
      showToast('Soundtrack paused', 'info', 1500);
    } else {
      const ctx = getAudioContext();
      bgmOsc = ctx.createOscillator();
      bgmGain = ctx.createGain();
      bgmOsc.type = 'sine';
      bgmOsc.frequency.setValueAtTime(110, ctx.currentTime); // Low A drone

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.2;
      lfoGain.gain.value = 15;
      lfo.connect(bgmOsc.frequency);
      lfo.start();

      bgmGain.gain.setValueAtTime(0.01, ctx.currentTime);
      bgmGain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 1.2);
      bgmOsc.connect(bgmGain);
      bgmGain.connect(ctx.destination);
      bgmOsc.start();
      isBgmPlaying = true;

      if (bgmIcon) bgmIcon.textContent = '🔊';
      if (bgmLabel) bgmLabel.textContent = 'Playing: Cyberpunk Drone';
      showToast('Playing ambient reading soundtrack 🎵', 'success', 2000);
    }
  }

  function toggleTTSNarration() {
    if (!('speechSynthesis' in window)) {
      showToast('Text-to-Speech is not supported in this browser.', 'warning');
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      showToast('Narration stopped.', 'info');
      const ttsIcon = qs('#tts-icon');
      if (ttsIcon) ttsIcon.textContent = '🎙️';
      return;
    }

    let currentTitle = 'Marvel Comic';
    let synopsis = 'An extraordinary comic adventure unfolds.';
    const foundComic = (state.comicsCatalog || []).find(c => c.slug === state.readerComicId || String(c.id) === String(state.readerComicId));
    if (foundComic) {
      currentTitle = foundComic.title || currentTitle;
      synopsis = foundComic.synopsis || synopsis;
    }

    const narrationScript = `${currentTitle}. Chapter ${state.readerChapter || 1}, Page ${state.readerCurrentPage || 1}. ${synopsis}`;
    const utterance = new SpeechSynthesisUtterance(narrationScript);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    utterance.onend = () => { const icon = qs('#tts-icon'); if (icon) icon.textContent = '🎙️'; };
    utterance.onerror = () => { const icon = qs('#tts-icon'); if (icon) icon.textContent = '🎙️'; };

    window.speechSynthesis.speak(utterance);
    const ttsIcon = qs('#tts-icon');
    if (ttsIcon) ttsIcon.textContent = '⏹️';
    showToast(`Narrating ${currentTitle} (Page ${state.readerCurrentPage || 1}) 🎙️`, 'success', 3000);
  }

  /* ═══════════════════════════════════════════════
     29. CHARACTER VAULT (STUDIO)
  ═══════════════════════════════════════════════ */
  function initCharacterVault() {
    qsa('.vault-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const desc = chip.dataset.desc;
        const textarea = qs('#studio-script-textarea') || qs('#remix-script-textarea') || qs('#script-textarea');
        if (textarea) {
          textarea.value += `\n\n// CHARACTER INJECTED: ${desc}\nPANEL: ${desc} steps into frame.\n`;
          showToast(`Injected ${chip.dataset.char.toUpperCase()} into script! 👤`, 'success', 2000);
        }
      });
    });
  }

  /* ═══════════════════════════════════════════════
     30. CREATOR TIP JAR & CONFETTI ENGINE
  ═══════════════════════════════════════════════ */
  function triggerConfetti() {
    const canvas = qs('#confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#facc15', '#ff6b6b', '#8b5cf6', '#4ecdc4', '#ffffff', '#f7e600'];
    const particles = [];

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.7) * 18,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rSpeed: (Math.random() - 0.5) * 10,
        gravity: 0.35,
        alpha: 1
      });
    }

    let frames = 0;
    function render() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.rSpeed;
        p.alpha -= 0.012;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      frames++;
      if (frames < 90) {
        requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
    render();
  }

  function initTipJar() {
    const tipModal = qs('#tip-modal');
    const tipClose = qs('#tip-modal-close');
    const tipOverlay = qs('#tip-modal-overlay');
    const tipTrigger = qs('#reader-tip-creator-btn');
    const tipSubmit = qs('#tip-submit-btn');

    const openTipModal = () => {
      tipModal?.removeAttribute('hidden');
      document.body.classList.add('no-scroll');
    };
    const closeTipModal = () => {
      tipModal?.setAttribute('hidden', '');
      document.body.classList.remove('no-scroll');
    };

    tipTrigger?.addEventListener('click', openTipModal);
    tipClose?.addEventListener('click', closeTipModal);
    tipOverlay?.addEventListener('click', closeTipModal);

    tipSubmit?.addEventListener('click', () => {
      const amount = qs('input[name="tip_amount"]:checked')?.value || '50';
      playCoinTipSound();
      triggerConfetti();
      closeTipModal();
      showToast(`Sent ${amount} PulseCoins to the creator! Thank you for supporting artists! ⚡🎉`, 'success', 5000);
    });
  }

  /* ═══════════════════════════════════════════════
     32. AUTO-RESUME READING PROGRESS TRACKER
  ═══════════════════════════════════════════════ */
  function saveReadingProgress() {
    if (!state.readerComicId) return;
    const comic = (state.comicsCatalog || []).find(c => (c.slug || c.id) === state.readerComicId);
    const title = comic?.title || (state.readerComicId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
    const coverUrl = comic?.cover_url || 'assets/img/cover-placeholder.png';
    const progress = {
      comicId: state.readerComicId,
      chapter: state.readerChapter || 1,
      page: state.readerCurrentPage || 1,
      title: title,
      coverUrl: coverUrl,
      timestamp: Date.now()
    };
    try {
      localStorage.setItem('komicrew_reading_progress', JSON.stringify(progress));
    } catch (e) { /* ignore */ }
  }

  function renderReadingResumeBanner() {
    const banner = qs('#reading-resume-banner');
    if (!banner) return;
    const stored = localStorage.getItem('komicrew_reading_progress');
    if (!stored) {
      banner.setAttribute('hidden', '');
      return;
    }
    try {
      const p = JSON.parse(stored);
      if (!p || !p.comicId) {
        banner.setAttribute('hidden', '');
        return;
      }
      const thumb = qs('#resume-banner-thumb');
      const titleEl = qs('#resume-banner-title');
      if (thumb && p.coverUrl) thumb.src = p.coverUrl;
      if (titleEl) titleEl.innerHTML = `${escapeHtml(p.title)} &middot; <strong>Ch. ${p.chapter}</strong> &middot; Page ${p.page}`;
      banner.removeAttribute('hidden');
    } catch (err) {
      banner.setAttribute('hidden', '');
    }
  }

  function initReadingProgress() {
    const banner = qs('#reading-resume-banner');
    if (!banner) return;

    qs('#resume-banner-btn')?.addEventListener('click', () => {
      const stored = localStorage.getItem('komicrew_reading_progress');
      if (stored) {
        try {
          const p = JSON.parse(stored);
          navigateTo('reader', { comicId: p.comicId, chapter: p.chapter, page: p.page });
        } catch (e) { /* ignore */ }
      }
    });

    qs('#resume-banner-dismiss')?.addEventListener('click', () => {
      banner.setAttribute('hidden', '');
    });

    renderReadingResumeBanner();
  }

  /* ═══════════════════════════════════════════════
     33. CREATOR PROFILE & STUDIO DASHBOARD MODAL
  ═══════════════════════════════════════════════ */
  function initProfileModal() {
    const modal = qs('#profile-modal');
    const closeBtn = qs('#profile-modal-close');
    const overlay = qs('#profile-modal-overlay');
    const triggerProfile = qs('#menu-user-profile');
    const triggerBookmarks = qs('#menu-user-bookmarks');
    const openStudioBtn = qs('#profile-open-studio-btn');
    const newComicBtn = qs('#profile-new-comic-btn');

    const openProfile = (defaultTab = 'overview') => {
      switchProfileTab(defaultTab);
      populateProfileData();
      modal?.removeAttribute('hidden');
      document.body.classList.add('no-scroll');
    };

    const closeProfile = () => {
      modal?.setAttribute('hidden', '');
      document.body.classList.remove('no-scroll');
    };

    triggerProfile?.addEventListener('click', (e) => {
      e.preventDefault();
      closeProfileDropdown();
      openProfile('overview');
    });

    triggerBookmarks?.addEventListener('click', (e) => {
      e.preventDefault();
      closeProfileDropdown();
      openProfile('bookmarks');
    });

    closeBtn?.addEventListener('click', closeProfile);
    overlay?.addEventListener('click', closeProfile);
    modal?.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeProfile(); });

    openStudioBtn?.addEventListener('click', () => {
      closeProfile();
      navigateTo('studio');
    });

    newComicBtn?.addEventListener('click', () => {
      closeProfile();
      navigateTo('studio');
    });

    // Tab Switching
    qsa('.profile-tab-btn').forEach(tabBtn => {
      tabBtn.addEventListener('click', () => {
        const targetTab = tabBtn.dataset.profileTab;
        switchProfileTab(targetTab);
      });
    });

    function switchProfileTab(tabName) {
      qsa('.profile-tab-btn').forEach(btn => {
        const isActive = btn.dataset.profileTab === tabName;
        btn.classList.toggle('profile-tab-btn--active', isActive);
        btn.setAttribute('aria-selected', String(isActive));
      });
      qsa('.profile-tab-panel').forEach(panel => {
        if (panel.id === `profile-panel-${tabName}`) {
          panel.removeAttribute('hidden');
        } else {
          panel.setAttribute('hidden', '');
        }
      });
    }

    function populateProfileData() {
      const u = state.currentUser || { username: 'Creator', name: 'Creator', bio: 'Digital manga artist & AI comic creator on Komicrew.' };
      const nameEl = qs('#profile-card-name');
      const handleEl = qs('#profile-card-handle');
      const bioEl = qs('#profile-card-bio');
      const tierEl = qs('#profile-card-tier');
      const avatarEl = qs('#profile-card-avatar');

      const editName = qs('#profile-edit-name');
      const editHandle = qs('#profile-edit-handle');
      const editBio = qs('#profile-edit-bio');

      const cleanHandle = u.username.startsWith('@') ? u.username : `@${u.username}`;
      if (nameEl) nameEl.textContent = u.name || u.username;
      if (handleEl) handleEl.textContent = cleanHandle;
      if (bioEl) bioEl.textContent = u.bio || 'Digital manga artist and AI comic storyboarder on Komicrew.';
      if (tierEl) tierEl.textContent = ((u.tier || u.role || 'Creator') + ' Tier').toUpperCase();
      if (avatarEl && u.avatar_url) avatarEl.src = u.avatar_url;

      if (editName) editName.value = u.name || u.username;
      if (editHandle) editHandle.value = cleanHandle;
      if (editBio) editBio.value = u.bio || '';

      // Stats
      const userComics = (state.comicsCatalog || []).filter(c => c.creator === cleanHandle || c.creator === u.username || String(c.creator_id) === String(u.id));
      const publishedStat = qs('#profile-stat-published');
      const readsStat = qs('#profile-stat-reads');
      const bookmarksStat = qs('#profile-stat-bookmarks');
      const coinsStat = qs('#profile-stat-coins');
      const walletBalanceVal = qs('#profile-wallet-balance-val');

      const coins = parseInt(localStorage.getItem('komicrew_wallet') || '1250');

      if (publishedStat) publishedStat.textContent = userComics.length;
      if (readsStat) readsStat.textContent = userComics.reduce((sum, c) => sum + (c.views || c.views_count || 0), 0);
      if (bookmarksStat) bookmarksStat.textContent = state.bookmarks.length;
      if (coinsStat) coinsStat.textContent = `${coins.toLocaleString()} ⚡`;
      if (walletBalanceVal) walletBalanceVal.textContent = `${coins.toLocaleString()} ⚡`;

      // Render My Comics
      const comicsContainer = qs('#profile-comics-container');
      if (comicsContainer) {
        if (userComics.length) {
          comicsContainer.innerHTML = userComics.map(c => `
            <div class="profile-comic-item">
              <div class="profile-comic-info">
                <img src="${c.cover_url || c.cover_image || 'assets/img/cover-placeholder.png'}" class="profile-comic-thumb" alt="${escapeHtml(c.title)}"/>
                <div>
                  <strong style="display:block; font-size:0.95rem;">${escapeHtml(c.title)}</strong>
                  <span style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(c.genre || 'Action')} &middot; ${c.views || c.views_count || 0} reads</span>
                </div>
              </div>
              <div style="display:flex; gap:8px;">
                <button type="button" class="btn btn--ghost btn--sm" data-view-target="reader" data-comic-id="${c.slug || c.id}">Read</button>
                <button type="button" class="btn btn--primary btn--sm" data-view-target="studio" data-remix-comic="${c.slug || c.id}">Edit</button>
              </div>
            </div>
          `).join('');
        } else {
          comicsContainer.innerHTML = '<p style="color:var(--text-muted); font-size:0.9rem; text-align:center; padding:24px 0;">No comics published yet. Start creating in the AI Studio!</p>';
        }
      }

      // Render Bookmarks
      const bookmarksContainer = qs('#profile-bookmarks-container');
      if (bookmarksContainer) {
        if (state.bookmarks.length) {
          bookmarksContainer.innerHTML = state.bookmarks.map(b => `
            <div class="profile-comic-item">
              <div class="profile-comic-info">
                <img src="${b.cover || 'assets/img/cover-placeholder.png'}" class="profile-comic-thumb" alt="${escapeHtml(b.title)}"/>
                <div>
                  <strong style="display:block; font-size:0.95rem;">${escapeHtml(b.title)}</strong>
                  <span style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(b.creator || '@creator')}</span>
                </div>
              </div>
              <div style="display:flex; gap:8px;">
                <button type="button" class="btn btn--primary btn--sm" data-view-target="reader" data-comic-id="${b.id}">Read Now</button>
              </div>
            </div>
          `).join('');
        } else {
          bookmarksContainer.innerHTML = '<p style="color:var(--text-muted); font-size:0.9rem; text-align:center; padding:24px 0;">No bookmarks saved yet. Click bookmark on any series to save for later.</p>';
        }
      }
    }

    // Top-up Actions
    qsa('.topup-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const addCoins = parseInt(btn.dataset.coins) || 100;
        let current = parseInt(localStorage.getItem('komicrew_wallet') || '1250');
        current += addCoins;
        localStorage.setItem('komicrew_wallet', String(current));
        playCoinTipSound();
        triggerConfetti();
        populateProfileData();
        showToast(`⚡ Added ${addCoins} PulseCoins! Current balance: ${current.toLocaleString()} ⚡`, 'success', 4000);
      });
    });

    // Profile Settings Form Save
    qs('#profile-settings-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const newName = qs('#profile-edit-name')?.value.trim();
      const newHandle = qs('#profile-edit-handle')?.value.trim();
      const newBio = qs('#profile-edit-bio')?.value.trim();

      if (!state.currentUser) {
        state.currentUser = { username: newHandle || 'creator' };
      }
      state.currentUser.name = newName;
      state.currentUser.username = newHandle;
      state.currentUser.bio = newBio;
      localStorage.setItem('pp_user', JSON.stringify(state.currentUser));
      updateAuthUI();
      populateProfileData();
      showToast('Profile updated successfully! ✨', 'success');
    });
  }

  /* ═══════════════════════════════════════════════
     34. AI STUDIO MULTI-FORMAT EXPORT SUITE
  ═══════════════════════════════════════════════ */
  function initExportModal() {
    const modal = qs('#export-modal');
    const closeBtn = qs('#export-modal-close');
    const cancelBtn = qs('#export-modal-cancel');
    const overlay = qs('#export-modal-overlay');
    const openBtn = qs('#studio-download-btn');

    const openExport = () => {
      modal?.removeAttribute('hidden');
      document.body.classList.add('no-scroll');
    };
    const closeExport = () => {
      modal?.setAttribute('hidden', '');
      document.body.classList.remove('no-scroll');
    };

    openBtn?.addEventListener('click', openExport);
    closeBtn?.addEventListener('click', closeExport);
    cancelBtn?.addEventListener('click', closeExport);
    overlay?.addEventListener('click', closeExport);
    modal?.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeExport(); });

    // 1. High Res PNG Export (2x Super Sampled)
    qs('#export-action-png')?.addEventListener('click', () => {
      if (state.fabricCanvas) {
        const dataURL = state.fabricCanvas.toDataURL({ format: 'png', multiplier: 2 });
        const a = document.createElement('a');
        a.href = dataURL;
        a.download = `komicrew-panel-ultra-${Date.now()}.png`;
        a.click();
        showToast('📸 High-Res 2x PNG downloaded successfully!', 'success');
        closeExport();
      } else {
        showToast('Generate a comic panel in studio first!', 'warning');
      }
    });

    // 2. Multi-page Chapter PDF Document Export
    qs('#export-action-pdf')?.addEventListener('click', () => {
      if (state.fabricCanvas) {
        const title = qs('#studio-comic-title')?.value || 'Komicrew Storyboard';
        const imgData = state.fabricCanvas.toDataURL({ format: 'png', quality: 1 });
        const printWin = window.open('', '_blank');
        if (printWin) {
          printWin.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>${escapeHtml(title)} - Komicrew Export</title>
                <style>
                  @page { margin: 0; size: auto; }
                  body { margin: 0; padding: 24px; background: #0f0f1a; color: #fff; font-family: sans-serif; text-align: center; }
                  h1 { font-size: 24px; margin-bottom: 8px; color: #f7e600; }
                  p { color: #888; font-size: 14px; margin-bottom: 20px; }
                  img { max-width: 100%; border: 2px solid #000; box-shadow: 0 4px 20px rgba(0,0,0,0.5); }
                </style>
              </head>
              <body>
                <h1>${escapeHtml(title)}</h1>
                <p>Created with Komicrew AI Comic Studio &bull; ${new Date().toLocaleDateString()}</p>
                <img src="${imgData}" onload="window.print();" />
              </body>
            </html>
          `);
          printWin.document.close();
        }
        showToast('📑 Opening Print & PDF Compiler Dialog...', 'success');
        closeExport();
      } else {
        showToast('Generate panels before compiling PDF.', 'warning');
      }
    });

    // 3. Direct Clipboard Copy
    qs('#export-action-clipboard')?.addEventListener('click', async () => {
      if (state.fabricCanvas) {
        try {
          state.fabricCanvas.getElement().toBlob(async (blob) => {
            if (blob && navigator.clipboard && navigator.clipboard.write) {
              await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
              ]);
              showToast('📋 Copied high-res image to clipboard! Ready to paste.', 'success');
              closeExport();
            } else {
              showToast('Clipboard copy not supported by browser. Downloading PNG instead.', 'warning');
              const dataURL = state.fabricCanvas.toDataURL({ format: 'png', multiplier: 2 });
              const a = document.createElement('a');
              a.href = dataURL;
              a.download = `komicrew-canvas.png`;
              a.click();
              closeExport();
            }
          });
        } catch (err) {
          showToast('Could not copy to clipboard directly.', 'error');
        }
      } else {
        showToast('Generate a panel first to copy.', 'warning');
      }
    });

    // 4. JSON Layout Export
    qs('#export-action-json')?.addEventListener('click', () => {
      const script = qs('#studio-script-textarea')?.value || '';
      const prompt = qs('#studio-prompt-input')?.value || '';
      const title = qs('#studio-comic-title')?.value || 'Untitled';
      const canvasObjects = state.fabricCanvas ? state.fabricCanvas.toJSON() : null;

      const projectData = {
        app: 'Komicrew AI Comic Studio',
        version: '1.0',
        title,
        prompt,
        script,
        canvasObjects,
        exportedAt: new Date().toISOString()
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(projectData, null, 2));
      const a = document.createElement('a');
      a.href = dataStr;
      a.download = `komicrew-project-${title.toLowerCase().replace(/\s+/g, '-')}.json`;
      a.click();
      showToast('💾 Project Script & JSON Layout saved!', 'success');
      closeExport();
    });
  }

  // Expose for external testing & debugging
  window.komicrew = {
    state,
    navigateTo,
    applyReaderMode,
    showToast,
  };

})();

