/**
 * admin.js — Operations HQ Controller (Direct Database Connection)
 * Komicrew Admin Control Center
 */

(function () {
  'use strict';

  const qs  = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function debounce(fn, delay = 250) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
  }

  // Toast System
  const toastContainer = qs('#toast-container');
  function showToast(message, type = 'info', duration = 3500) {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    toast.innerHTML = `<span class="toast-icon" aria-hidden="true">${icons[type] || 'ℹ️'}</span><span class="toast-msg">${escapeHtml(message)}</span><button class="toast-close-btn" aria-label="Dismiss">✕</button>`;
    toast.querySelector('.toast-close-btn').addEventListener('click', () => toast.remove());
    toastContainer.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('toast--visible'));
    setTimeout(() => {
      toast.classList.remove('toast--visible');
      toast.classList.add('toast--hiding');
      toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    }, duration);
  }

  // Theme Init
  function initTheme() {
    const saved = localStorage.getItem('pp_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    const btn = qs('#theme-toggle');
    btn?.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('pp_theme', next);
    });
  }

  // Admin State (Real Database State)
  const state = {
    activeTab: 'catalog',
    comics: [],
    users: [],
    uploads: [],
    taxonomies: [],
    heroSpotlight: null
  };

  // 1. Admin Tabs
  function initTabs() {
    const tabs = qsa('.admin-tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => {
          t.classList.remove('admin-tab-btn--active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('admin-tab-btn--active');
        tab.setAttribute('aria-selected', 'true');
        const target = tab.dataset.adminTab;
        state.activeTab = target;

        qsa('.admin-subpanel').forEach(p => p.setAttribute('hidden', ''));
        const subpanel = qs(`#admin-panel-${target}`);
        subpanel?.removeAttribute('hidden');

        if (target === 'catalog') fetchCatalog();
        if (target === 'users') fetchUsers();
        if (target === 'hero') fetchHeroSpotlightOptions();
        if (target === 'uploads') fetchUploadsGallery();
        if (target === 'taxonomies') fetchTaxonomies();
        if (target === 'creators') initCreators();
      });
    });
  }

  // 2. Fetch & Render Catalog from Database
  async function fetchCatalog(search = '') {
    const tbody = qs('#admin-comics-tbody');
    if (!tbody) return;

    try {
      const res = await fetch('api/admin.php?action=catalog');
      const data = await res.json();
      state.comics = data.comics || [];
    } catch (e) {
      console.warn('Database fetch failed, checking local state', e);
    }

    renderCatalog(search);
    updateStats();
  }

  function renderCatalog(search = '') {
    const tbody = qs('#admin-comics-tbody');
    if (!tbody) return;

    const q = search.toLowerCase();
    const list = state.comics.filter(c =>
      (c.title || '').toLowerCase().includes(q) ||
      (c.creator || '').toLowerCase().includes(q) ||
      (c.genre || '').toLowerCase().includes(q)
    );

    if (!list.length) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--text-muted)">No comics found in database. Upload the first comic series using the Comic Uploader tab! 🚀</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(c => {
      const status = (c.status || 'published').toLowerCase();
      const statusClass = status === 'featured' ? 'admin-status--featured' : (status === 'published' ? 'admin-status--published' : 'admin-status--draft');
      const cover = c.cover_url || 'assets/img/cover-placeholder.png';
      const isTrending = parseInt(c.is_trending || 0) === 1;

      return `
        <tr data-comic-id="${escapeHtml(c.slug || c.id)}">
          <td><img src="${escapeHtml(cover)}" alt="${escapeHtml(c.title)}" class="admin-table-cover-img" onerror="this.src='assets/favicon.svg'"/></td>
          <td>
            <strong>${escapeHtml(c.title)}</strong><br/>
            <span style="font-size:0.78rem;color:var(--text-muted)">${escapeHtml(c.creator)} &middot; ID: #${c.id}</span>
          </td>
          <td><span class="comic-tag">${escapeHtml(c.genre || 'Action')}</span> <span class="comic-tag">${escapeHtml(c.category || 'Seinen')}</span></td>
          <td>${c.is_ai ? '<span class="card-ai-badge">✨ AI</span>' : '<span class="comic-tag">🎨 Original</span>'}</td>
          <td>
            <button class="admin-status-toggle-btn ${statusClass}" data-comic-id="${escapeHtml(c.slug || c.id)}" data-current-status="${status}">
              ${status.toUpperCase()}
            </button>
          </td>
          <td>
            <button class="btn btn--sm ${isTrending ? 'btn--coral' : 'btn--ghost'} admin-trending-toggle-btn" data-comic-id="${escapeHtml(c.slug || c.id)}" data-trending="${isTrending ? 1 : 0}">
              ${isTrending ? '⭐ ON TRENDING' : '☆ Not Trending'}
            </button>
          </td>
          <td>
            <div class="admin-table-action-group">
              <a href="index.html#reader?comicId=${escapeHtml(c.slug || c.id)}" class="btn btn--sm btn--ghost" target="_blank" aria-label="Read">📖</a>
              <button class="btn btn--sm btn--ghost admin-table-delete-btn" data-comic-id="${escapeHtml(c.slug || c.id)}" aria-label="Delete">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Status Toggle Button
    qsa('.admin-status-toggle-btn', tbody).forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.comicId;
        const current = btn.dataset.currentStatus;
        const next = current === 'published' ? 'featured' : (current === 'featured' ? 'draft' : 'published');

        try {
          const res = await fetch('api/admin.php?action=toggle_status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comic_id: id, status: next })
          });
          const data = await res.json();
          showToast(data.message || `Status updated to ${next.toUpperCase()}`, 'info');
          fetchCatalog(qs('#admin-catalog-search')?.value || '');
        } catch (e) {
          showToast('Failed to update status in database', 'error');
        }
      });
    });

    // Trending Toggle Button
    qsa('.admin-trending-toggle-btn', tbody).forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.comicId;
        const current = parseInt(btn.dataset.trending || 0);
        const next = current === 1 ? 0 : 1;

        try {
          const res = await fetch('api/admin.php?action=toggle_trending', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comic_id: id, is_trending: next })
          });
          const data = await res.json();
          showToast(data.message, 'success');
          fetchCatalog(qs('#admin-catalog-search')?.value || '');
        } catch (e) {
          showToast('Failed to update trending status', 'error');
        }
      });
    });

    // Delete Action
    qsa('.admin-table-delete-btn', tbody).forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.comicId;
        if (!confirm(`Are you sure you want to permanently delete this comic from the database?`)) return;

        try {
          const res = await fetch('api/admin.php?action=delete_comic', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comic_id: id })
          });
          const data = await res.json();
          showToast(data.message || 'Comic deleted.', 'warning');
          fetchCatalog(qs('#admin-catalog-search')?.value || '');
        } catch (e) {
          showToast('Failed to delete comic', 'error');
        }
      });
    });

    // Search filter
    const searchInput = qs('#admin-catalog-search');
    searchInput?.removeEventListener('input', searchInput._handler);
    searchInput._handler = debounce(() => {
      renderCatalog(searchInput.value);
    }, 200);
    searchInput?.addEventListener('input', searchInput._handler);
  }

  // 3. User & Premium Tier Management
  async function fetchUsers(search = '') {
    const tbody = qs('#admin-users-tbody');
    if (!tbody) return;

    try {
      const res = await fetch('api/admin.php?action=users');
      const data = await res.json();
      state.users = data.users || [];
    } catch (e) {
      console.warn('User fetch failed', e);
    }

    renderUsers(search);
  }

  function renderUsers(search = '') {
    const tbody = qs('#admin-users-tbody');
    if (!tbody) return;

    const q = search.toLowerCase();
    const list = state.users.filter(u =>
      (u.username || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.role || '').toLowerCase().includes(q) ||
      (u.tier || '').toLowerCase().includes(q)
    );

    if (!list.length) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-muted)">No registered users found in database.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(u => {
      const tier = u.tier || 'Free';
      const tierBadge = tier === 'Pro' ? 'color:var(--pop-yellow);font-weight:bold;' : (tier === 'Superadmin' || tier === 'Staff' ? 'color:var(--pop-coral);font-weight:bold;' : 'color:var(--text-secondary);');

      return `
        <tr data-user-id="${u.id}">
          <td>
            <div style="display:flex; align-items:center; gap:8px;">
              <img src="${escapeHtml(u.avatar_url || 'assets/img/avatar-user.jpg')}" alt="avatar" style="width:28px;height:28px;border-radius:50%;border:1px solid var(--ink);"/>
              <strong>@${escapeHtml(u.username)}</strong>
            </div>
          </td>
          <td><code>${escapeHtml(u.email)}</code></td>
          <td>
            <select class="select-input user-role-select" data-user-id="${u.id}" style="padding:4px 8px;font-size:0.8rem;">
              <option value="reader" ${u.role === 'reader' ? 'selected' : ''}>Reader</option>
              <option value="creator" ${u.role === 'creator' ? 'selected' : ''}>Creator</option>
              <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
            </select>
          </td>
          <td>
            <select class="select-input user-tier-select" data-user-id="${u.id}" style="padding:4px 8px;font-size:0.8rem;${tierBadge}">
              <option value="Free" ${tier === 'Free' ? 'selected' : ''}>Free</option>
              <option value="Creator" ${tier === 'Creator' ? 'selected' : ''}>Creator Tier</option>
              <option value="Pro" ${tier === 'Pro' ? 'selected' : ''}>⭐ Pro Pass</option>
              <option value="Superadmin" ${tier === 'Superadmin' ? 'selected' : ''}>🛡️ Superadmin</option>
            </select>
          </td>
          <td style="font-size:0.8rem;color:var(--text-muted);">${escapeHtml((u.created_at || '').substring(0, 10))}</td>
          <td>
            <button class="btn btn--sm ${tier === 'Pro' ? 'btn--ghost' : 'btn--primary'} user-grant-pro-btn" data-user-id="${u.id}" data-current-tier="${tier}">
              ${tier === 'Pro' ? 'Downgrade to Free' : '⚡ Grant Pro Access'}
            </button>
          </td>
          <td>
            <button class="btn btn--sm btn--ghost admin-user-delete-btn" data-user-id="${u.id}" ${parseInt(u.id) === 1 ? 'disabled title="Cannot delete primary admin"' : ''}>
              🗑️
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Role select change
    qsa('.user-role-select', tbody).forEach(sel => {
      sel.addEventListener('change', async () => {
        const userId = sel.dataset.userId;
        const tierSel = qs(`.user-tier-select[data-user-id="${userId}"]`);
        await updateUserAccess(userId, sel.value, tierSel ? tierSel.value : 'Free');
      });
    });

    // Tier select change
    qsa('.user-tier-select', tbody).forEach(sel => {
      sel.addEventListener('change', async () => {
        const userId = sel.dataset.userId;
        const roleSel = qs(`.user-role-select[data-user-id="${userId}"]`);
        await updateUserAccess(userId, roleSel ? roleSel.value : 'reader', sel.value);
      });
    });

    // Quick Grant Pro
    qsa('.user-grant-pro-btn', tbody).forEach(btn => {
      btn.addEventListener('click', async () => {
        const userId = btn.dataset.userId;
        const currentTier = btn.dataset.currentTier;
        const nextTier = currentTier === 'Pro' ? 'Free' : 'Pro';
        const roleSel = qs(`.user-role-select[data-user-id="${userId}"]`);
        await updateUserAccess(userId, roleSel ? roleSel.value : 'reader', nextTier);
      });
    });

    // User Delete
    qsa('.admin-user-delete-btn', tbody).forEach(btn => {
      btn.addEventListener('click', async () => {
        const userId = btn.dataset.userId;
        if (!confirm('Are you sure you want to delete this user from database?')) return;
        try {
          const res = await fetch('api/admin.php?action=delete_user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId })
          });
          const data = await res.json();
          showToast(data.message || 'User deleted', 'warning');
          fetchUsers();
        } catch (e) {
          showToast('Failed to delete user', 'error');
        }
      });
    });

    // Search input
    const userSearch = qs('#admin-users-search');
    userSearch?.removeEventListener('input', userSearch._handler);
    userSearch._handler = debounce(() => renderUsers(userSearch.value), 200);
    userSearch?.addEventListener('input', userSearch._handler);
  }

  async function updateUserAccess(userId, role, tier) {
    try {
      const res = await fetch('api/admin.php?action=update_user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, role, tier })
      });
      const data = await res.json();
      showToast(data.message || 'User updated in database.', 'success');
      fetchUsers(qs('#admin-users-search')?.value || '');
      updateStats();
    } catch (e) {
      showToast('Failed to update user access', 'error');
    }
  }

  // 4. Hero & Trending Spotlight Manager
  async function fetchHeroSpotlightOptions() {
    const container = qs('#hero-radio-container');
    if (!container) return;

    if (!state.comics.length) {
      await fetchCatalog();
    }

    if (!state.comics.length) {
      container.innerHTML = `<p style="color:var(--text-muted);font-size:0.9rem;">No comics available in database. Create a comic first in Comic Uploader!</p>`;
      return;
    }

    container.innerHTML = state.comics.map((c, i) => {
      const isHero = parseInt(c.is_hero || 0) === 1 || (i === 0 && !state.comics.some(x => parseInt(x.is_hero || 0) === 1));
      return `
        <label class="hero-select-radio-card" style="cursor:pointer;">
          <input type="radio" name="hero_selected_comic" value="${escapeHtml(c.slug || c.id)}" ${isHero ? 'checked' : ''} class="hero-radio-input"/>
          <div class="hero-radio-card-body">
            <img src="${escapeHtml(c.cover_url || 'assets/favicon.svg')}" alt="${escapeHtml(c.title)}" width="48" height="64" class="hero-radio-thumb" style="object-fit:cover;border-radius:4px;"/>
            <div class="hero-radio-meta">
              <strong>${escapeHtml(c.title)}</strong>
              <span>${escapeHtml(c.genre || 'Action')} &middot; ${escapeHtml(c.creator || '@creator')}</span>
            </div>
            ${isHero ? '<span class="hero-current-badge">ACTIVE #1</span>' : ''}
          </div>
        </label>
      `;
    }).join('');

    initHeroRadioEvents();
  }

  function initHeroRadioEvents() {
    const radios = qsa('input[name="hero_selected_comic"]');
    const previewTitle = qs('#hero-preview-title');
    const previewSynopsis = qs('#hero-preview-synopsis');
    const previewMeta = qs('#hero-preview-meta');
    const applyBtn = qs('#save-hero-spotlight-btn');

    const updatePreview = (comicSlug) => {
      const c = state.comics.find(x => (x.slug || x.id) == comicSlug);
      if (!c) return;
      if (previewTitle) previewTitle.textContent = c.title;
      if (previewSynopsis) previewSynopsis.textContent = c.synopsis || 'No synopsis provided.';
      if (previewMeta) previewMeta.textContent = `by ${c.creator} · ${c.genre} · ⭐ ${c.rating_avg || 5.0}`;
    };

    radios.forEach(r => {
      if (r.checked) updatePreview(r.value);
      r.addEventListener('change', () => { if (r.checked) updatePreview(r.value); });
    });

    applyBtn?.addEventListener('click', async () => {
      const selected = qs('input[name="hero_selected_comic"]:checked')?.value;
      if (!selected) return;

      try {
        const res = await fetch('api/admin.php?action=set_hero', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ comic_id: selected })
        });
        const data = await res.json();
        showToast(data.message || `⭐ Spotlight set to ${selected}!`, 'success', 4000);
        fetchHeroSpotlightOptions();
        fetchCatalog();
      } catch (e) {
        showToast('Failed to apply hero spotlight in database', 'error');
      }
    });
  }

  // 5. Uploaded Images & Panels Gallery Auditor
  async function fetchUploadsGallery() {
    const gallery = qs('#admin-uploads-gallery');
    if (!gallery) return;

    gallery.innerHTML = `<p style="color:var(--text-muted)">Loading uploaded assets from database...</p>`;

    try {
      const res = await fetch('api/admin.php?action=uploads');
      const data = await res.json();
      state.uploads = data.uploads || [];
    } catch (e) {
      console.warn('Uploads fetch failed', e);
    }

    renderUploadsGallery();
  }

  function renderUploadsGallery() {
    const gallery = qs('#admin-uploads-gallery');
    if (!gallery) return;

    if (!state.uploads.length) {
      gallery.innerHTML = `
        <div style="grid-column: 1 / -1; text-align:center; padding: 40px; background:var(--bg-surface-raised); border:2px dashed var(--ink); border-radius:var(--radius-md);">
          <span style="font-size:2rem; display:block; margin-bottom:8px;">🖼️</span>
          <strong style="font-size:1.1rem; color:var(--text-primary);">No User Uploaded Panels Found</strong>
          <p style="color:var(--text-muted); font-size:0.85rem; margin-top:4px;">When users create AI comics or authors batch-upload chapter panels, they will appear here for review & moderation.</p>
        </div>
      `;
      return;
    }

    gallery.innerHTML = state.uploads.map(p => {
      return `
        <div class="admin-panel-card" style="background:var(--bg-surface-raised); border:2px solid var(--ink); border-radius:var(--radius-sm); overflow:hidden; box-shadow:var(--shadow-sm);">
          <div style="position:relative; width:100%; height:180px; background:#000;">
            <img src="${escapeHtml(p.image_url)}" alt="Panel" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='assets/favicon.svg'"/>
            <span style="position:absolute; top:6px; left:6px; background:var(--ink); color:#fff; font-size:0.7rem; font-weight:800; padding:2px 6px; border-radius:4px;">P.${p.panel_number || 1}</span>
          </div>
          <div style="padding:10px;">
            <strong style="font-size:0.85rem; color:var(--text-primary); display:block; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">${escapeHtml(p.comic_title || 'Comic')}</strong>
            <span style="font-size:0.75rem; color:var(--text-muted); display:block; margin-top:2px;">by ${escapeHtml(p.creator || '@user')}</span>
            <button class="btn btn--sm btn--ghost admin-delete-panel-btn" data-panel-id="${p.panel_id}" style="margin-top:8px; width:100%; border-color:var(--pop-coral); color:var(--pop-coral);">
              🗑️ Delete Panel
            </button>
          </div>
        </div>
      `;
    }).join('');

    qsa('.admin-delete-panel-btn', gallery).forEach(btn => {
      btn.addEventListener('click', async () => {
        const panelId = btn.dataset.panelId;
        if (!confirm('Are you sure you want to delete this panel from database?')) return;
        try {
          const res = await fetch('api/admin.php?action=delete_panel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ panel_id: panelId })
          });
          showToast('Panel deleted from database.', 'warning');
          fetchUploadsGallery();
        } catch (e) {
          showToast('Failed to delete panel', 'error');
        }
      });
    });
  }

  // 6. Comic Uploader
  function initUploader() {
    const form = qs('#admin-uploader-form');
    const coverDropzone = qs('#cover-dropzone');
    const coverInput = qs('#cover-file-input');
    const coverContent = qs('#cover-dropzone-content');
    const coverPreview = qs('#cover-dropzone-preview');
    const coverImg = qs('#cover-preview-img');
    const coverRemoveBtn = qs('#cover-remove-btn');

    let uploadedCover = '';

    coverDropzone?.addEventListener('click', (e) => {
      if (e.target !== coverRemoveBtn) coverInput?.click();
    });
    coverInput?.addEventListener('change', () => {
      const file = coverInput.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          uploadedCover = e.target.result;
          if (coverImg) coverImg.src = uploadedCover;
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
      uploadedCover = '';
    });

    form?.addEventListener('submit', async (e) => {
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

      const newComicPayload = {
        title,
        creator,
        genre: checkedGenres[0] ? checkedGenres[0].charAt(0).toUpperCase() + checkedGenres[0].slice(1) : 'Action',
        category: category.charAt(0).toUpperCase() + category.slice(1),
        style: style,
        is_ai: 1,
        status: 'published',
        cover: uploadedCover || 'assets/favicon.svg',
        synopsis,
      };

      try {
        const res = await fetch('api/publish.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newComicPayload)
        });
        const data = await res.json();
        if (data.success) {
          showToast(`🚀 "${title}" published to live database!`, 'success', 4000);
          form.reset();
          coverRemoveBtn?.click();
          qs('#admin-tab-catalog')?.click();
          fetchCatalog();
        } else {
          showToast(data.error || 'Failed to publish comic', 'error');
        }
      } catch (err) {
        showToast('Error connecting to publish backend', 'error');
      }
    });
  }

  // 7. Taxonomy Manager
  async function fetchTaxonomies() {
    try {
      const res = await fetch('api/admin.php?action=taxonomies');
      const data = await res.json();
      state.taxonomies = data.taxonomies || [];
    } catch (e) {
      console.warn('Taxonomy fetch failed', e);
    }
  }

  function initTaxonomies() {
    const bind = (btnId, inputId, listId, type) => {
      const btn = qs(btnId);
      const input = qs(inputId);
      const list = qs(listId);

      const add = async () => {
        const val = input?.value.trim();
        if (!val || !list) return;

        try {
          await fetch('api/admin.php?action=add_taxonomy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, name: val })
          });
        } catch (e) {}

        const span = document.createElement('span');
        span.className = 'tax-badge';
        span.innerHTML = `${escapeHtml(val)} <button type="button" class="tax-del-btn">✕</button>`;
        span.querySelector('.tax-del-btn')?.addEventListener('click', () => {
          span.remove();
          showToast(`Deleted "${val}"`, 'info', 1500);
        });
        list.appendChild(span);
        if (input) input.value = '';
        showToast(`Added "${val}" to ${type}`, 'success', 1500);
      };

      btn?.addEventListener('click', add);
      input?.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } });

      qsa('.tax-del-btn', list).forEach(delBtn => {
        delBtn.addEventListener('click', () => {
          const badge = delBtn.closest('.tax-badge');
          const txt = badge?.textContent.replace('✕', '').trim();
          badge?.remove();
          showToast(`Deleted "${txt}"`, 'info', 1500);
        });
      });
    };

    bind('#add-category-btn', '#new-category-input', '#taxonomy-categories-list', 'category');
    bind('#add-genre-btn', '#new-genre-input', '#taxonomy-genres-list', 'genre');
    bind('#add-style-btn', '#new-style-input', '#taxonomy-styles-list', 'style');
  }

  // 8. Stats & Header Sync
  async function updateStats() {
    try {
      const res = await fetch('api/admin.php?action=stats');
      if (res.ok) {
        const data = await res.json();
        if (data.stats) {
          if (qs('#stat-total-comics')) qs('#stat-total-comics').textContent = data.stats.total_comics;
          if (qs('#stat-total-panels')) qs('#stat-total-panels').textContent = data.stats.total_panels.toLocaleString();
          if (qs('#stat-active-readers')) qs('#stat-active-readers').textContent = data.stats.total_users;
          if (qs('#stat-storage-used')) qs('#stat-storage-used').textContent = `${data.stats.pro_users} Pro Users`;
        }
      }
    } catch (e) {}
  }

  function initCreators() {
    const form = qs('#admin-creator-form');
    if (!form || form.dataset.bound) return;
    form.dataset.bound = 'true';

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const rawHandle = qs('#creator-handle-input')?.value.trim();
      const badge = qs('#creator-badge-select')?.value || 'featured';
      const bio = qs('#creator-bio-input')?.value.trim();

      if (!rawHandle) {
        showToast('Please provide a creator handle.', 'warning');
        return;
      }
      const handle = rawHandle.replace(/^@/, '');

      try {
        const res = await fetch('api/admin.php?action=users');
        const data = await res.json();
        const users = data.users || [];
        const user = users.find(u => u.username.toLowerCase() === handle.toLowerCase());

        if (user) {
          const updRes = await fetch('api/admin.php?action=update_user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: user.id,
              role: 'creator',
              tier: badge.charAt(0).toUpperCase() + badge.slice(1),
              bio: bio || user.bio
            })
          });
          const updData = await updRes.json();
          showToast(`Verified & featured @${handle} as ${badge} creator! 🌟`, 'success', 4000);
          form.reset();
          fetchUsers();
          updateStats();
        } else {
          showToast(`User @${handle} not found in database. Check the Users tab.`, 'warning');
        }
      } catch (err) {
        showToast('Failed to update creator profile.', 'error');
      }
    });
  }

  function initHeaderActions() {
    qs('#admin-refresh-metrics-btn')?.addEventListener('click', async () => {
      await updateStats();
      await fetchCatalog();
      showToast('Synced live platform metrics from database.', 'success', 2000);
    });

    qs('#admin-quick-publish-btn')?.addEventListener('click', () => {
      qs('#admin-tab-uploader')?.click();
    });

    qs('#admin-refresh-uploads-btn')?.addEventListener('click', fetchUploadsGallery);
  }

  // Auth Guard
  function checkAdminAuth() {
    const isAuth = localStorage.getItem('pp_admin_auth') === 'true';
    if (!isAuth) {
      window.location.href = 'admin_login.html';
      return false;
    }
    return true;
  }

  function init() {
    if (!checkAdminAuth()) return;
    initTheme();

    qs('#admin-logout-btn')?.addEventListener('click', () => {
      localStorage.removeItem('pp_admin_auth');
      showToast('Signed out of Operations HQ.', 'info');
      setTimeout(() => { window.location.href = 'admin_login.html'; }, 600);
    });

    initTabs();
    fetchCatalog();
    fetchUsers();
    initUploader();
    initTaxonomies();
    initHeaderActions();
    console.log('%cKomicrew Operations HQ Live Connected 🛡️', 'color:#8b5cf6;background:#111827;padding:4px 8px;font-weight:bold;');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

})();
