// template/js/article-core.js
document.addEventListener('DOMContentLoaded', function() {
  // 1. Build TOC and Bibliography first, so they copy raw innerHTML 
  // (which will include untypeset MathJax tokens like <span class="math-inline">).
  if (typeof window.buildTOC === 'function') window.buildTOC();
  if (typeof window.renderBibliography === 'function') {
    window.renderBibliography(typeof BIBLIOGRAPHY_ENTRIES !== 'undefined' ? BIBLIOGRAPHY_ENTRIES : []);
  }

  // 2. Instruct MathJax to typeset the ENTIRE document.
  // This allows the newly created sidebar elements to get perfectly rendered MathJax.
  if (window.MathJax && window.MathJax.typesetPromise) {
    MathJax.typesetPromise().catch(function (err) {
      console.error("MathJax error:", err.message);
    });
  }

  // 3. Bookmark feature with visual feedback
  (function() {
    const BOOKMARK_KEY = 'visa-bookmark';

    function getCurrentSectionId() {
      const headings = document.querySelectorAll('h2, h3, h4');
      let current = null;
      for (const h of headings) {
        const rect = h.getBoundingClientRect();
        if (rect.top <= 100) { // within top 100px of viewport
          current = h.id;
        } else if (rect.top > 100) {
          break;
        }
      }
      return current;
    }

    function showToast(message) {
      const existing = document.querySelector('.bookmark-toast');
      if (existing) existing.remove();
      const toast = document.createElement('div');
      toast.className = 'bookmark-toast';
      toast.textContent = message;
      toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--bg-color);
        color: var(--text-color);
        padding: 10px 20px;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        z-index: 9999;
        font-family: 'Open Sans', sans-serif;
        font-size: 14px;
        opacity: 0;
        transition: opacity 0.3s;
      `;
      document.body.appendChild(toast);
      requestAnimationFrame(() => { toast.style.opacity = '1'; });
      setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }, 2000);
    }

    function updateBookmarkIcon(hasBookmark) {
      const emptyIcon = document.getElementById('bookmark-empty');
      const filledIcon = document.getElementById('bookmark-filled');
      if (emptyIcon && filledIcon) {
        emptyIcon.style.display = hasBookmark ? 'none' : 'inline';
        filledIcon.style.display = hasBookmark ? 'inline' : 'none';
      }
    }

    function hasExistingBookmark() {
      try {
        return localStorage.getItem(BOOKMARK_KEY) !== null;
      } catch (e) {
        return false;
      }
    }

    function saveBookmark() {
      const scrollY = window.scrollY;
      const sectionId = getCurrentSectionId();
      const bookmark = { scrollY, sectionId };
      try {
        localStorage.setItem(BOOKMARK_KEY, JSON.stringify(bookmark));
        updateBookmarkIcon(true);
        showToast('Kirjanmerkki tallennettu!');
      } catch (e) {
        showToast('Kirjanmerkin tallennus epäonnistui.');
      }
    }

    function clearBookmark() {
      try {
        localStorage.removeItem(BOOKMARK_KEY);
        updateBookmarkIcon(false);
        showToast('Kirjanmerkki poistettu.');
      } catch (e) {
        showToast('Kirjanmerkin poisto epäonnistui.');
      }
    }

    function restoreBookmark() {
      try {
        const data = localStorage.getItem(BOOKMARK_KEY);
        if (!data) return;
        const bookmark = JSON.parse(data);
        if (typeof bookmark.scrollY === 'number') {
          window.scrollTo({ top: bookmark.scrollY, behavior: 'smooth' });
          if (bookmark.sectionId) {
            const el = document.getElementById(bookmark.sectionId);
            if (el) {
              el.style.transition = 'background-color 0.3s';
              el.style.backgroundColor = 'var(--border-color)';
              setTimeout(() => el.style.backgroundColor = '', 2000);
            }
          }
        }
        // update icon to filled
        updateBookmarkIcon(true);
      } catch (e) {
        // ignore
      }
    }

    const bookmarkBtn = document.getElementById('bookmark-btn');
    if (bookmarkBtn) {
      // Set initial icon state
      updateBookmarkIcon(hasExistingBookmark());

      bookmarkBtn.addEventListener('click', function() {
        const hasBookmark = hasExistingBookmark();
        if (hasBookmark) {
          clearBookmark();
        } else {
          saveBookmark();
        }
      });
    }

    // Restore bookmark after a short delay to let MathJax and layout settle
    setTimeout(restoreBookmark, 600);
  })();
});
