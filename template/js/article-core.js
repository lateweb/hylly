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
});
