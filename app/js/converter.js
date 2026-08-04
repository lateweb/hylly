// app/js/converter.js
(function() {
  'use strict';

  const texInput = document.getElementById('texInput');
  const bibInput = document.getElementById('bibInput');
  const copyBtn = document.getElementById('copyBtn');
  const downloadBtn = document.getElementById('downloadBtn');

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

  function generateHtml() {
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
      return window.generateStandaloneHtml(articleHtml, bibEntries);
    } catch (error) {
      console.error(error);
      showToast('Conversion error. Check your LaTeX syntax.');
      return null;
    }
  }

  copyBtn.addEventListener('click', async () => {
    const html = generateHtml();
    if (!html) return;
    try {
      await navigator.clipboard.writeText(html);
      const original = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      setTimeout(() => { copyBtn.textContent = original; }, 2000);
    } catch (err) {
      showToast('Copy failed.');
    }
  });

  downloadBtn.addEventListener('click', () => {
    const html = generateHtml();
    if (!html) return;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'article.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Download started.');
  });
})();
