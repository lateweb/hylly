// app/js/converter.js
(function() {
  'use strict';

  const texInput = document.getElementById('texInput');
  const bibInput = document.getElementById('bibInput');
  const generateBtn = document.getElementById('generateBtn');
  const copyBtn = document.getElementById('copyBtn');
  const downloadBtn = document.getElementById('downloadBtn');

  let lastGeneratedHtml = '';

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

  function updateButtonsState() {
    const hasContent = texInput.value.trim().length > 0;
    generateBtn.disabled = !hasContent;
  }

  texInput.addEventListener('input', updateButtonsState);
  updateButtonsState();

  generateBtn.addEventListener('click', () => {
    const texSource = texInput.value;
    if (!texSource.trim()) {
      showToast('Please enter LaTeX source.');
      return;
    }

    let bibEntries = [];
    if (bibInput.value.trim()) {
      try {
        bibEntries = window.parseBibtex(bibInput.value);
      } catch (e) {
        showToast('Failed to parse BibTeX. Check syntax.');
        return;
      }
    }

    try {
      const articleHtml = window.latexToHTML(texSource, bibEntries);
      const fullHtml = window.generateStandaloneHtml(articleHtml, bibEntries);
      lastGeneratedHtml = fullHtml;
      copyBtn.disabled = false;
      downloadBtn.disabled = false;
      showToast('HTML generated successfully.');
    } catch (error) {
      console.error(error);
      showToast('Conversion error. Check your LaTeX syntax.');
    }
  });

  copyBtn.addEventListener('click', async () => {
    if (!lastGeneratedHtml) {
      showToast('Generate HTML first.');
      return;
    }
    try {
      await navigator.clipboard.writeText(lastGeneratedHtml);
      const original = copyBtn.textContent;
      copyBtn.textContent = 'Copied!';
      setTimeout(() => { copyBtn.textContent = original; }, 2000);
    } catch (err) {
      showToast('Copy failed.');
    }
  });

  downloadBtn.addEventListener('click', () => {
    if (!lastGeneratedHtml) {
      showToast('Generate HTML first.');
      return;
    }
    const blob = new Blob([lastGeneratedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'article.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
})();
