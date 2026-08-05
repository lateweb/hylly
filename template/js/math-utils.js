// template/js/math-utils.js
(function() {
  'use strict';

  function preventMathInteraction() {
    window.addEventListener('click', function(ev) {
      const target = ev.target;
      if (!target) return;
      const isMath = target.closest('mjx-container') || target.closest('.tex-raw-inline') || target.closest('.tex-raw-block') || target.tagName.toLowerCase() === 'mjx-math';
      if (isMath && !target.closest('label, button, a, input, select, textarea')) {
        ev.stopPropagation();
        ev.stopImmediatePropagation();
        ev.preventDefault();
        return false;
      }
    }, { capture: true });
  }

  function setupMathCopyHandler() {
    document.addEventListener('copy', function(e) {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;
      const fragment = selection.getRangeAt(0).cloneContents();
      const mathContainers = fragment.querySelectorAll ? fragment.querySelectorAll('[data-tex]') : [];
      
      // Clean up styles and scripts from copied selection
      fragment.querySelectorAll('style, script, link[rel="stylesheet"]').forEach(el => el.remove());
      
      if (mathContainers.length > 0) {
        mathContainers.forEach(container => {
          const tex = container.getAttribute('data-tex');
          if (tex) {
            const isDisplay = container.getAttribute('data-display') === 'true' || 
                              container.getAttribute('display') === 'true' || 
                              container.classList.contains('math-scroll') || 
                              (container.parentElement && container.parentElement.classList.contains('math-scroll'));
            
            // Output standardized LaTeX formatting
            const formattedTex = isDisplay ? '\\[' + tex + '\\]' : '\\( ' + tex + '\\)';
            container.parentNode.replaceChild(document.createTextNode(formattedTex), container);
          }
        });
      }
      const plainText = fragment.textContent || '';
      if (plainText.trim()) {
        e.clipboardData.setData('text/plain', plainText);
        e.preventDefault();
      }
    });
  }

  function annotateAllMathWithTex() {
    try {
      if (!window.MathJax?.startup?.document) return;
      const doc = window.MathJax.startup.document;
      for (const math of doc.math) {
        const root = math.typesetRoot;
        if (!root) continue;
        const container = root.tagName.toLowerCase() === 'mjx-container' ? root : (root.closest('mjx-container') || root);
        if (!container.hasAttribute('data-tex')) {
          let tex = null;
          if (math.math) {
            tex = math.math;
          } else {
            try {
              const ann = root.querySelector('annotation') || root.querySelector('script[type="math/tex"]');
              if (ann) tex = ann.textContent || ann.innerText || null;
              if (!tex && root.getAttribute('data-tex')) tex = root.getAttribute('data-tex');
            } catch(e) {}
          }
          if (tex) {
            container.setAttribute('data-tex', tex);
            container.setAttribute('data-display', math.display ? 'true' : 'false');
          }
        }
      }
    } catch (e) {
      console.warn("MathJax annotation error: ", e);
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    preventMathInteraction();
    setupMathCopyHandler();
    
    const onMathJaxReady = () => annotateAllMathWithTex();
    if (window.MathJax?.startup?.promise) {
      window.MathJax.startup.promise.then(onMathJaxReady);
    } else {
      window.addEventListener('load', () => {
        if (window.MathJax?.startup?.promise) window.MathJax.startup.promise.then(onMathJaxReady);
        else setTimeout(onMathJaxReady, 1000);
      });
    }
    
    const obs = new MutationObserver((muts) => {
      if (muts.some(m => m.addedNodes && m.addedNodes.length)) setTimeout(annotateAllMathWithTex, 500);
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  });
})();
