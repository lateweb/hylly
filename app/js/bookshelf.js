// app/js/bookshelf.js
(function() {
  'use strict';

  function escapeHtml(text) {
    if (!text) return "";
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  async function loadBookshelf() {
    const grid = document.getElementById('books-grid');
    if (!grid) return;

    try {
      const books = await window.HyllyStorage.getBooks();

      if (books.length === 0) {
        grid.innerHTML = '<div class="empty-shelf">Your shelf is empty. Click "+ Add Book" to write or paste a document.</div>';
        return;
      }

      // Sort by newest first
      books.sort((a, b) => b.timestamp - a.timestamp);

      grid.innerHTML = books.map(book => `
        <div class="book-card">
          <div class="book-title">${escapeHtml(book.title)}</div>
          <div class="book-date">Added: ${new Date(book.timestamp).toLocaleDateString()}</div>
          <div class="book-actions">
            <button class="btn btn-primary btn-sm read-btn" data-id="${book.id}">Read</button>
            <button class="btn btn-secondary btn-sm edit-btn" data-id="${book.id}">Edit</button>
            <button class="btn btn-secondary btn-sm delete-btn" data-id="${book.id}" style="color: #ef4444; border-color: var(--border-color);">Delete</button>
          </div>
        </div>
      `).join('');

      // Wire up Read buttons (Opens Blob URL in new tab)
      document.querySelectorAll('.read-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = e.target.getAttribute('data-id');
          const book = await window.HyllyStorage.getBook(id);
          if (book && book.htmlContent) {
            const blob = new Blob([book.htmlContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
          }
        });
      });

      // Wire up Edit buttons (Routes to converter page with ID)
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
            loadBookshelf(); // Refresh grid
          }
        });
      });

    } catch (error) {
      console.error("Error loading bookshelf:", error);
      grid.innerHTML = '<div class="empty-shelf">Error loading library.</div>';
    }
  }

  document.addEventListener('DOMContentLoaded', loadBookshelf);
})();
