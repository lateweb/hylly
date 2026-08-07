// app/js/converter.js
(function() {
  'use strict';

  const texInput = document.getElementById('texInput');
  const bibInput = document.getElementById('bibInput');
  const saveBtn = document.getElementById('saveBtn');
  const copyBtn = document.getElementById('copyBtn');
  const downloadBtn = document.getElementById('downloadBtn');

  // Parse URL parameters to check if we are editing an existing book
  const urlParams = new URLSearchParams(window.location.search);
  const currentBookId = urlParams.get('id');

  // Load existing book data if editing
  if (currentBookId) {
    window.HyllyStorage.getBook(currentBookId).then(book => {
      if (book) {
        texInput.value = book.texSource || '';
        bibInput.value = book.bibSource || '';
      }
    }).catch(err => {
      console.error("Failed to load book for editing:", err);
      showToast('Failed to load book data.');
    });
  }

  function showToast(message) {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `<span>${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function generateId() {
    return typeof crypto.randomUUID === 'function' ? 
      crypto.randomUUID() : 
      'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  }

  // Reliably fetch metadata from the final generated HTML string
  function extractMetadataFromHtml(html) {
    const stripTags = str => str.replace(/<[^>]+>/g, '').trim();
    
    const titleMatch = html.match(/<h1 class="article-title">([\s\S]*?)<\/h1>/i);
    const authorMatch = html.match(/<div class="article-author">([\s\S]*?)<\/div>/i);
    const dateMatch = html.match(/<div class="article-date">([\s\S]*?)<\/div>/i);
    
    return {
      title: titleMatch ? stripTags(titleMatch[1]) : 'Untitled Document',
      author: authorMatch ? stripTags(authorMatch[1]) : '',
      date: dateMatch ? stripTags(dateMatch[1]) : ''
    };
  }

  async function generateHtml() {
    const texSource = texInput.value;
    if (!texSource.trim()) {
      showToast('Please enter LaTeX source.');
      return null;
    }

    let bibEntries = [];
    if (bibInput.value.trim()) {
      try {
        bibEntries = window.parseBibtex(bibInput.value);
      } catch (e) {
        showToast('Failed to parse BibTeX. Check syntax.');
        return null;
      }
    }

    try {
      const articleHtml = window.latexToHTML(texSource, bibEntries);
      return await window.generateStandaloneHtml(articleHtml, bibEntries);
    } catch (error) {
      console.error(error);
      showToast('Conversion error. Check your LaTeX syntax.');
      return null;
    }
  }

  saveBtn.addEventListener('click', async () => {
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Saving...';
    saveBtn.disabled = true;

    try {
      const html = await generateHtml();
      if (!html) throw new Error('HTML generation failed');

      // Extract metadata from the generated HTML payload directly
      const meta = extractMetadataFromHtml(html);
      
      const book = {
        id: currentBookId || generateId(),
        title: meta.title,
        author: meta.author,
        date: meta.date,
        texSource: texInput.value,
        bibSource: bibInput.value,
        htmlContent: html,
        timestamp: Date.now()
      };

      await window.HyllyStorage.saveBook(book);
      showToast('Saved to Library!');
      
      // Redirect back to bookshelf after a short delay
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 800);

    } catch (err) {
      console.error(err);
      showToast('Failed to save book.');
      saveBtn.textContent = originalText;
      saveBtn.disabled = false;
    }
  });

  copyBtn.addEventListener('click', async () => {
    const original = copyBtn.textContent;
    copyBtn.textContent = 'Generating...';
    try {
      const html = await generateHtml();
      if (!html) {
        copyBtn.textContent = original;
        return;
      }
      await navigator.clipboard.writeText(html);
      copyBtn.textContent = 'Copied!';
    } catch (err) {
      showToast('Copy failed.');
      copyBtn.textContent = 'Failed';
    } finally {
      setTimeout(() => { copyBtn.textContent = original; }, 2000);
    }
  });

  downloadBtn.addEventListener('click', async () => {
    const original = downloadBtn.textContent;
    downloadBtn.textContent = 'Generating...';
    try {
      const html = await generateHtml();
      if (!html) {
        downloadBtn.textContent = original;
        return;
      }

      let filename = prompt('Enter a name for the HTML file:', 'book.html');
      if (filename === null) {
        downloadBtn.textContent = original;
        return;
      }
      let finalName = filename.trim() || 'book.html';
      if (!finalName.endsWith('.html') && !finalName.endsWith('.htm')) {
        finalName += '.html';
      }

      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = finalName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Download started.');
    } catch(err) {
      console.error(err);
      showToast('Download failed.');
    } finally {
      downloadBtn.textContent = original;
    }
  });
})();
