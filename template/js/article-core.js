// template/js/article-core.js
document.addEventListener('DOMContentLoaded', function() {
  if (window.MathJax && window.MathJax.typesetPromise) {
    MathJax.typesetPromise([document.getElementById('article-container')]).catch(function (err) {
      console.error("MathJax error:", err.message);
    }).then(function() {
      if (typeof window.buildTOC === 'function') window.buildTOC();
      if (typeof window.renderBibliography === 'function') {
        window.renderBibliography(typeof BIBLIOGRAPHY_ENTRIES !== 'undefined' ? BIBLIOGRAPHY_ENTRIES : []);
      }
    });
  } else {
    if (typeof window.buildTOC === 'function') window.buildTOC();
    if (typeof window.renderBibliography === 'function') {
      window.renderBibliography(typeof BIBLIOGRAPHY_ENTRIES !== 'undefined' ? BIBLIOGRAPHY_ENTRIES : []);
    }
  }
});
