// app/js/bookshelf.js
(function() {
  'use strict';

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

  function renderBooks(books) {
    const shelf = document.getElementById('shelf');
    if (!shelf) return;

    if (books.length === 0) {
      shelf.innerHTML = '<div class="empty-shelf">Your shelf is empty. Click "+ Add Book" to write or paste a document.</div>';
      return;
    }

    shelf.innerHTML = books.map(book => {
      const dateStr = book.date || new Date(book.timestamp).toLocaleDateString();
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
            <button class="btn btn-secondary btn-sm edit-btn" data-id="${book.id}">Edit</button>
            <button class="btn btn-secondary btn-sm delete-btn" data-id="${book.id}" style="color: #ef4444; border-color: var(--border-color); background: transparent;">Delete</button>
          </div>
        </div>
      `;
    }).join('');

    // Wire up Read buttons (Opens Blob URL in new tab)
    document.querySelectorAll('.read-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const id = e.target.getAttribute('data-id');
        const book = await window.HyllyStorage.getBook(id);
        if (book && book.htmlContent) {
          const blob = new Blob([book.htmlContent], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          window.open(url, '_blank');
        }
      });
    });

    // Wire up Edit buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        window.location.href = `converter.html?id=${id}`;
      });
    });

    // Wire up Delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        if (confirm('Are you sure you want to delete this book?')) {
          const id = e.target.getAttribute('data-id');
          await window.HyllyStorage.deleteBook(id);
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

  async function loadBookshelf() {
    const shelf = document.getElementById('shelf');
    if (!shelf) return;

    try {
      ALL_BOOKS = await window.HyllyStorage.getBooks();
      // Sort by newest first
      ALL_BOOKS.sort((a, b) => b.timestamp - a.timestamp);
      renderBooks(ALL_BOOKS);
    } catch (error) {
      console.error("Error loading bookshelf:", error);
      shelf.innerHTML = '<div class="empty-shelf">Error loading library.</div>';
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', filterBooks);
    }
    loadBookshelf();
  });
})();
