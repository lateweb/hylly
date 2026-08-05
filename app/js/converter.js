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
      showToast('Conversion error. Check your LaTeX syntax or assets.');
      return null;
    }
  }

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
    } catch(err) {
      console.error(err);
      showToast('Download failed.');
    } finally {
      downloadBtn.textContent = original;
    }
  });
})();
