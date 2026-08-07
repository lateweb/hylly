// app/js/bookshelf.js
(function() {
  'use strict';

  const LAST_READ_KEY = 'hylly-last-read-id';
  let ALL_BOOKS = [];

  function escapeHtml(text) {
    if (!text) return "";
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function openBook(book) {
    if (book && book.htmlContent) {
      const blob = new Blob([book.htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      // Store this as the last opened entry
      localStorage.setItem(LAST_READ_KEY, book.id);
    }
  }

  function renderBooks(books) {
    const shelf = document.getElementById('shelf');
    if (!shelf) return;

    if (books.length === 0) {
      shelf.innerHTML = '<div class="empty-shelf">Your shelf is empty. Click "+ Upload HTML" to add a document.</div>';
      return;
    }

    shelf.innerHTML = books.map(book => {
      const dateStr = book.date || '';
      const authorHtml = book.author ? `<div class="entry-author"><strong>${escapeHtml(book.author)}</strong></div>` : '';
      
      return `
        <div class="entry">
          <div class="entry-header">
            <a href="#" class="entry-title read-btn" data-id="${book.id}">${escapeHtml(book.title)}</a>
            <span class="entry-date">${escapeHtml(dateStr)}</span>
          </div>
          ${authorHtml}
          <div class="entry-actions">
            <button class="btn btn-secondary btn-sm read-btn" data-id="${book.id}">Read</button>
            <button class="btn btn-secondary btn-sm delete-btn" data-id="${book.id}" style="color: #ef4444; border-color: var(--border-color); background: transparent;">Delete</button>
          </div>
        </div>
      `;
    }).join('');

    // Wire up Read buttons
    document.querySelectorAll('.read-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const id = e.target.getAttribute('data-id');
        const book = await window.HyllyStorage.getBook(id);
        if (book) {
          openBook(book);
        }
      });
    });

    // Wire up Delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if (confirm('Are you sure you want to delete this entry?')) {
          const id = e.target.getAttribute('data-id');
          await window.HyllyStorage.deleteBook(id);
          // If we just deleted the last-read entry, clear the stored ID
          const lastRead = localStorage.getItem(LAST_READ_KEY);
          if (lastRead === id) {
            localStorage.removeItem(LAST_READ_KEY);
          }
          loadBookshelf(); 
        }
      });
    });
  }

  function filterBooks() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    const query = searchInput.value.toLowerCase().trim();
    const filtered = ALL_BOOKS.filter(book => {
      const title = (book.title || '').toLowerCase();
      const author = (book.author || '').toLowerCase();
      const date = (book.date || '').toLowerCase();
      return title.includes(query) || author.includes(query) || date.includes(query);
    });

    renderBooks(filtered);
  }

  function autoOpenLastRead() {
    const lastReadId = localStorage.getItem(LAST_READ_KEY);
    if (!lastReadId) return;

    // Find the book in the already loaded list
    const book = ALL_BOOKS.find(b => b.id === lastReadId);
    if (book) {
      // Open it after a tiny delay to ensure the page is fully rendered
      setTimeout(() => openBook(book), 300);
    } else {
      // The book might have been deleted, clear the stored ID
      localStorage.removeItem(LAST_READ_KEY);
    }
  }

  async function loadBookshelf() {
    const shelf = document.getElementById('shelf');
    if (!shelf) return;

    try {
      ALL_BOOKS = await window.HyllyStorage.getBooks();
      // Sort by newest first
      ALL_BOOKS.sort((a, b) => b.timestamp - a.timestamp);
      renderBooks(ALL_BOOKS);
      // After rendering, try to auto-open the last read entry
      autoOpenLastRead();
    } catch (error) {
      console.error("Error loading bookshelf:", error);
      shelf.innerHTML = '<div class="empty-shelf">Error loading library.</div>';
    }
  }

  function setupUpload() {
    const uploadInput = document.getElementById('uploadHtmlInput');
    const uploadBtn = document.getElementById('uploadHtmlBtn');
    
    if (!uploadBtn || !uploadInput) return;

    uploadBtn.addEventListener('click', () => uploadInput.click());

    uploadInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const stripTags = str => str.replace(/<[^>]+>/g, '').trim();

        // Extract metadata directly from the HTML payload
        const titleMatch = text.match(/<h1 class="article-title">([\s\S]*?)<\/h1>/i);
        const authorMatch = text.match(/<div class="article-author">([\s\S]*?)<\/div>/i);
        const dateMatch = text.match(/<div class="article-date">([\s\S]*?)<\/div>/i);

        let title = titleMatch ? stripTags(titleMatch[1]) : '';
        if (!title) {
          const headTitleMatch = text.match(/<title>([\s\S]*?)<\/title>/i);
          title = headTitleMatch ? stripTags(headTitleMatch[1]) : 'Uploaded Document';
        }

        const author = authorMatch ? stripTags(authorMatch[1]) : '';
        const date = dateMatch ? stripTags(dateMatch[1]) : '';

        const book = {
          id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : 'id-' + Date.now(),
          title: title,
          author: author,
          date: date,
          texSource: '',
          bibSource: '',
          htmlContent: text,
          timestamp: Date.now()
        };

        await window.HyllyStorage.saveBook(book);
        loadBookshelf();
      } catch (err) {
        console.error(err);
        alert('Failed to read the file.');
      }
      
      // Reset input to allow selecting the same file again
      uploadInput.value = '';
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', filterBooks);
    }
    setupUpload();
    loadBookshelf();
  });
})();
