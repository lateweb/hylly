// app/js/template-bundle.js
(function(global) {
  'use strict';

  // ---- Inlined CSS for the article output ----
  const ARTICLE_CSS = `
    /* app/css/base.css */
    :root {
      --bg-color: #ffffff;
      --text-color: #000000;
      --text-muted: #555555;
      --border-color: #cccccc;
    }

    [data-theme="dark"],
    html.dark,
    body.dark {
      --bg-color: #000000;
      --text-color: #ffffff;
      --text-muted: #aaaaaa;
      --border-color: #444444;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html {
      scroll-behavior: smooth;
    }

    body {
      background-color: var(--bg-color);
      color: var(--text-color);
      font-family: 'Open Sans', sans-serif;
      line-height: 1.6;
      font-size: 16px;
      transition: background-color 0.1s;
      overflow-x: hidden;
    }

    a {
      color: inherit;
      text-decoration: underline;
      text-underline-offset: 3px;
    }

    a:hover {
      text-decoration-thickness: 2px;
    }

    /* app/css/article.css */
    .article-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .article-title {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
      line-height: 1.2;
    }

    .article-author {
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .article-date {
      font-size: 0.95rem;
      color: var(--text-muted);
      font-style: italic;
    }

    .abstract {
      margin: 2rem 0 3rem;
      padding: 1.5rem 2rem;
      border: 1px solid var(--border-color);
    }

    .article-content {
      font-size: 1.05rem;
      line-height: 1.7;
    }

    .article-content p {
      margin-bottom: 1.5rem;
    }

    /* Sections: no line/border below title */
    .article-content h2 {
      font-size: 1.5rem;
      margin: 3rem 0 1rem;
      padding-bottom: 0;
      border-bottom: none;
      font-weight: 600;
      scroll-margin-top: 5rem;
    }

    .article-content h3 {
      font-size: 1.25rem;
      margin: 2rem 0 1rem;
      font-weight: 600;
      scroll-margin-top: 5rem;
    }

    .article-content h4 {
      scroll-margin-top: 5rem;
    }

    .article-content ul,
    .article-content ol {
      margin: 0 0 1.5rem 2rem;
    }

    .article-content li {
      margin-bottom: 0.5rem;
    }

    .article-content strong {
      font-weight: 700;
    }

    .article-content code {
      font-family: 'Courier New', Courier, monospace;
      padding: 0.1em 0.3em;
      border: 1px solid var(--border-color);
      font-size: 0.9em;
    }

    .article-content pre {
      border: 1px solid var(--border-color);
      padding: 1.5rem;
      overflow-x: auto;
      margin: 1.5rem 0;
    }

    .article-content pre code {
      border: none;
      padding: 0;
    }

    .article-content blockquote {
      margin: 1.5rem 0;
      padding: 1rem 1.5rem;
      border-left: 3px solid var(--text-color);
      color: var(--text-muted);
    }

    .article-content img {
      max-width: 100%;
      height: auto;
      display: block;
      margin: 2rem auto;
      border: 1px solid var(--border-color);
    }

    .article-content table {
      border-collapse: collapse;
      width: 100%;
      margin: 2rem 0;
    }

    .article-content th,
    .article-content td {
      border: 1px solid var(--border-color);
      padding: 0.75rem 1rem;
      text-align: left;
    }

    .article-content th {
      font-weight: 700;
      border-bottom: 2px solid var(--text-color);
    }

    /* === MATHJAX STYLES – no line breaking for inline math === */
    mjx-container {
      display: inline-block !important;
      white-space: nowrap !important;
      margin: 0 !important;
      padding: 0 !important;
      line-height: inherit !important;
      font-size: inherit !important;
      width: auto !important;
      max-width: 100% !important;
    }

    /* Inline math stays as normal, no forced wrapping */
    .math-inline mjx-container,
    .math-inline mjx-container mjx-math {
      display: inline !important;
      white-space: normal !important;
    }

    /* Scrollable display math */
    .math-scroll {
      overflow-x: auto;
      overflow-y: hidden;
      max-width: 100%;
      margin: 0.5em 0;
      white-space: nowrap !important;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: thin;
      cursor: default;
    }

    .math-scroll mjx-container {
      max-width: none !important;
      white-space: nowrap !important;
      display: inline-block !important;
      min-width: 100%;
    }

    /* Raw TeX styles (for potential future use) */
    .tex-raw-inline {
      display: inline;
      white-space: pre-wrap;
      word-break: break-word;
      cursor: text;
      font-family: 'Fira Code', monospace;
      color: #d63384;
      font-size: 1.05em;
    }

    .tex-raw-block {
      display: block;
      white-space: pre-wrap;
      word-break: break-word;
      cursor: text;
      margin: 0.5em 0;
      background: var(--bg-color);
      padding: 0.5em;
      border-radius: 4px;
      font-family: 'Fira Code', monospace;
      color: #d63384;
      font-size: 1.05em;
    }

    mjx-assistive-mml {
      display: none !important;
    }

    /* Prevent interaction on math elements (like visa) */
    mjx-container {
      pointer-events: auto;
      cursor: default;
    }

    /* app/css/layout.css */
    .top-nav {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 80;
      background-color: var(--bg-color);
      padding: 1rem 20px;
      border-bottom: 1px solid var(--border-color);
      margin: 0 auto 2rem auto;
      max-width: 750px;
    }

    .nav-right {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .nav-toggle-btn {
      position: fixed;
      top: 1.1rem;
      left: 1.5rem;
      z-index: 1001;
      background-color: var(--bg-color);
      color: var(--text-color);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 0.4rem 0.5rem;
      cursor: pointer;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s, color 0.2s;
    }

    .nav-toggle-btn:hover {
      background-color: var(--border-color);
    }

    .icon-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon-btn:hover {
      color: var(--text-color);
    }

    .article-wrapper {
      max-width: 750px;
      margin: 0 auto;
      padding: 0 20px 60px;
    }

    /* app/css/components.css */
    .toc-list {
      list-style: none;
      padding-left: 0;
    }
    .toc-item {
      margin-bottom: 0.5rem;
    }
    .toc-link {
      text-decoration: none;
      color: var(--text-color);
      display: block;
      line-height: 1.4;
    }
    .toc-h2 { margin-left: 0; font-weight: 600; margin-top: 1rem; }
    .toc-h3 { margin-left: 1rem; font-size: 0.95em; color: var(--text-muted); }
    .toc-h4 { margin-left: 2rem; font-size: 0.9em; color: var(--text-muted); }

    .toc-empty {
      font-style: italic;
      color: var(--text-muted);
    }

    .bib-list {
      list-style: none;
      padding-left: 0;
    }
    .bib-list li {
      margin-bottom: 1.5rem;
      font-size: 0.95rem;
      line-height: 1.5;
      padding: 0.5rem;
      transition: background-color 0.15s;
    }

    .highlight-bib {
      background-color: var(--border-color);
    }

    /* Sidebars */
    .sidebar {
      position: fixed;
      top: 0;
      bottom: 0;
      width: 320px;
      max-width: 90vw;
      background: var(--bg-color);
      z-index: 100;
      overflow-y: auto;
      padding: 2rem;
      transition: transform 0.2s ease-in-out;
    }

    .left-sidebar {
      left: 0;
      border-right: 1px solid var(--border-color);
      transform: translateX(-100%);
      padding-top: 4.5rem;
    }
    .left-sidebar.open {
      transform: translateX(0);
    }

    .right-sidebar {
      right: 0;
      border-left: 1px solid var(--border-color);
      transform: translateX(100%);
    }
    .right-sidebar.open {
      transform: translateX(0);
    }

    .sidebar-header-row {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 0.5rem;
    }

    @media (max-width: 768px) {
      .article-wrapper {
        padding: 0 15px 40px;
      }
      .article-title {
        font-size: 2rem;
      }
      .sidebar {
        width: 280px;
        padding: 1.5rem;
      }
      .left-sidebar {
        padding-top: 4rem;
      }
    }

    @media (max-width: 480px) {
      .top-nav {
        padding: 0.8rem 0;
        margin-bottom: 1.5rem;
      }
      body.has-hamburger .top-nav {
        padding-left: 3.5rem;
      }
      .nav-toggle-btn {
        top: 0.8rem;
        left: 1rem;
      }
      .article-wrapper {
        padding: 0 12px 30px;
      }
      .article-title {
        font-size: 1.6rem;
      }
      .article-content {
        font-size: 1rem;
      }
      .article-content h2 {
        font-size: 1.3rem;
        margin-top: 2rem;
      }
      .article-content h3 {
        font-size: 1.1rem;
      }
      .sidebar {
        width: 260px;
        padding: 1rem;
      }
      .left-sidebar {
        padding-top: 3.5rem;
      }
    }
  `;

  // ---- Inlined JavaScript for the article output ----
  const ARTICLE_JS = `
    // theme.js
    (function () {
      'use strict';
      const THEME_KEY = 'visa-theme';

      function systemPrefersDark() {
        return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
      }

      function getInitialTheme() {
        try {
          const saved = localStorage.getItem(THEME_KEY);
          if (saved === 'dark' || saved === 'light') return saved;
        } catch (e) {}
        return systemPrefersDark() ? 'dark' : 'light';
      }

      function persistTheme(theme) {
        try {
          localStorage.setItem(THEME_KEY, theme);
        } catch (e) {}
      }

      function updateIcons() {
        const isDark = document.documentElement.classList.contains('dark');
        const moon = document.getElementById('moon-icon');
        const sun = document.getElementById('sun-icon');

        if (moon && sun) {
          moon.style.display = isDark ? 'none' : 'inline';
          sun.style.display = isDark ? 'inline' : 'none';
        }
      }

      function applyTheme(theme, persist) {
        const isDark = theme === 'dark';
        document.documentElement.classList.toggle('dark', isDark);
        if (document.body) {
          document.body.classList.toggle('dark', isDark);
        }
        if (persist) {
          persistTheme(theme);
        }
        updateIcons();
      }

      function initToggle() {
        updateIcons();
        const toggle = document.getElementById('theme-toggle');
        if (toggle) {
          toggle.addEventListener('click', () => {
            const next = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
            applyTheme(next, true);
          });
        }
      }

      applyTheme(getInitialTheme(), false);
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initToggle);
      } else {
        initToggle();
      }
      window.addEventListener('storage', (event) => {
        if (event.key === THEME_KEY) {
          applyTheme(event.newValue === 'dark' ? 'dark' : 'light', false);
        }
      });
    })();

    // --- math interaction prevention (from visa) ---
    (function() {
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
    })();

    // --- math copy handler (from visa) ---
    (function() {
      function copyHandler(e) {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;
        const fragment = selection.getRangeAt(0).cloneContents();
        const mathContainers = fragment.querySelectorAll ? fragment.querySelectorAll('[data-tex]') : [];
        fragment.querySelectorAll('style, script, link[rel="stylesheet"]').forEach(el => el.remove());
        if (mathContainers.length > 0) {
          mathContainers.forEach(container => {
            const tex = container.getAttribute('data-tex');
            if (tex) {
              const isDisplay = container.getAttribute('data-display') === 'true' || container.getAttribute('display') === 'true' || container.classList.contains('math-scroll') || (container.parentElement && container.parentElement.classList.contains('math-scroll'));
              const formattedTex = isDisplay ? '\\\\[' + tex + '\\\\]' : '\\\\( ' + tex + '\\\\)';
              container.parentNode.replaceChild(document.createTextNode(formattedTex), container);
            }
          });
        }
        const plainText = fragment.textContent || '';
        if (plainText.trim()) {
          e.clipboardData.setData('text/plain', plainText);
          e.preventDefault();
        }
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
              if (math.math) tex = math.math;
              else {
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
        } catch (e) {}
      }

      document.addEventListener('DOMContentLoaded', function() {
        document.addEventListener('copy', copyHandler);
        if (window.MathJax?.startup?.promise) {
          window.MathJax.startup.promise.then(annotateAllMathWithTex);
        } else {
          setTimeout(annotateAllMathWithTex, 2000);
        }
      });
    })();

    // sidebar.js (includes TOC and bibliography rendering)
    (function(global) {
      'use strict';

      function buildTOC() {
        const container = document.getElementById('article-container');
        const tocContent = document.getElementById('toc-content');
        if (!container || !tocContent) return;

        const headers = container.querySelectorAll('h2, h3, h4');
        if (headers.length === 0) {
          tocContent.innerHTML = '<p class="toc-empty">Ei väliotsikoita.</p>';
          return;
        }

        const ul = document.createElement('ul');
        ul.className = 'toc-list';

        headers.forEach((header, index) => {
          if (!header.id) {
            header.id = 'sec-' + index;
          }
          const li = document.createElement('li');
          li.className = \`toc-item toc-\${header.tagName.toLowerCase()}\`;
          const a = document.createElement('a');
          a.href = '#' + header.id;
          a.textContent = header.textContent;
          a.className = 'toc-link';
          a.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.getElementById(header.id);
            if (target) {
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
              document.getElementById('toc-sidebar').classList.remove('open');
            }
          });
          li.appendChild(a);
          ul.appendChild(li);
        });

        tocContent.appendChild(ul);
      }

      function renderBibliography(entries) {
        const bibContent = document.getElementById('bib-content');
        if (!bibContent) return;

        if (!entries || entries.length === 0) {
          bibContent.innerHTML = '<p class="toc-empty">Ei lähteitä määritelty.</p>';
          return;
        }

        function getSortKey(entry) {
          let author = entry.fields.author || '';
          let firstAuthor = author.split(/\\s+(?:and|\\\\and)\\s+/i)[0].trim();
          if (!firstAuthor) {
            return entry.key.toLowerCase();
          }
          let lastName = firstAuthor;
          if (firstAuthor.includes(',')) {
            lastName = firstAuthor.split(',')[0].trim();
          } else {
            const parts = firstAuthor.split(/\\s+/);
            lastName = parts[parts.length - 1];
          }
          return lastName.toLowerCase();
        }

        const sorted = [...entries].sort((a, b) => {
          return getSortKey(a).localeCompare(getSortKey(b));
        });

        bibContent.innerHTML = '<ul class="bib-list">' +
          sorted.map(e => \`<li id="bib-\${e.key}">\${global.formatBibEntry(e)}</li>\`).join('') +
          '</ul>';

        document.querySelectorAll('.cite-link').forEach(link => {
          link.addEventListener('click', (e) => {
            e.preventDefault();
            const key = link.getAttribute('data-cite');
            const bibSidebar = document.getElementById('bib-sidebar');
            document.getElementById('toc-sidebar').classList.remove('open');
            bibSidebar.classList.add('open');

            if (key) {
              const target = document.getElementById(\`bib-\${key}\`);
              if (target) {
                setTimeout(() => {
                  target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  target.classList.add('highlight-bib');
                  setTimeout(() => target.classList.remove('highlight-bib'), 2000);
                }, 150);
              }
            }
          });
        });
      }

      function initSidebars() {
        const tocSidebar = document.getElementById('toc-sidebar');
        const bibSidebar = document.getElementById('bib-sidebar');
        const btnOpenToc = document.getElementById('toc-toggle-fixed');
        const btnCloseToc = document.getElementById('close-toc-btn');
        const btnCloseBib = document.getElementById('close-bib-btn');

        function closeAll() {
          if (tocSidebar) tocSidebar.classList.remove('open');
          if (bibSidebar) bibSidebar.classList.remove('open');
        }

        if (btnOpenToc) {
          btnOpenToc.addEventListener('click', () => {
            if (tocSidebar.classList.contains('open')) {
              closeAll();
            } else {
              closeAll();
              tocSidebar.classList.add('open');
            }
          });
        }

        if (btnCloseToc) btnCloseToc.addEventListener('click', closeAll);
        if (btnCloseBib) btnCloseBib.addEventListener('click', closeAll);
      }

      global.buildTOC = buildTOC;
      global.renderBibliography = renderBibliography;
      global.initSidebars = initSidebars;

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSidebars);
      } else {
        initSidebars();
      }
    })(window);

    // bib-parser.js (minimal - included for formatBibEntry)
    (function(global) {
      'use strict';
      function formatBibEntry(entry) {
        const f = entry.fields;
        let author = f.author || '';
        let title = f.title || '';
        let year = f.year || '';
        let journal = f.journal || f.booktitle || '';
        let volume = f.volume || '';
        let number = f.number || '';
        let pages = f.pages || '';
        let doi = f.doi || '';

        author = author.replace(/\\s+and\\s+/ig, ' & ');

        let formatted = '';
        if (author) formatted += '<strong>' + author + '</strong>. ';
        if (year) formatted += '(' + year + '). ';
        if (title) formatted += '<em>' + title + '</em>. ';
        if (journal) formatted += journal;
        if (volume) {
          formatted += ', ' + volume;
          if (number) formatted += '(' + number + ')';
        }
        if (pages) formatted += ', ' + pages;

        formatted = formatted.trim();
        if (!formatted.endsWith('.')) formatted += '.';

        if (doi) {
          doi = doi.replace(/\\\\url\\{([^}]+)\\}/g, '$1');
          formatted += ' DOI: <a href="https://doi.org/' + doi + '" target="_blank" rel="noopener">' + doi + '</a>';
        }

        formatted = formatted.replace(/---/g, '—').replace(/--/g, '–');
        formatted = formatted.replace(/\\\\([&%$#_{}])/g, '$1');

        return formatted;
      }
      global.formatBibEntry = formatBibEntry;
    })(window);

    // initialization after DOM
    document.addEventListener('DOMContentLoaded', function() {
      // typeset math
      if (window.MathJax && window.MathJax.typesetPromise) {
        MathJax.typesetPromise([document.getElementById('article-container')]).catch(function (err) {
          console.error("MathJax error:", err.message);
        }).then(function() {
          // After MathJax, build TOC and bibliography
          window.buildTOC();
          window.renderBibliography(BIBLIOGRAPHY_ENTRIES);
        });
      } else {
        window.buildTOC();
        window.renderBibliography(BIBLIOGRAPHY_ENTRIES);
      }
    });
  `;

  // ---- Main template function ----
  function generateStandaloneHtml(articleHtml, bibEntries) {
    const bibEntriesJson = JSON.stringify(bibEntries);
    const titleMatch = articleHtml.match(/<h1 class="article-title">([^<]*)<\/h1>/);
    const pageTitle = titleMatch ? titleMatch[1] + ' – TeXtoHTML' : 'TeXtoHTML Article';

    return `<!DOCTYPE html>
<html lang="fi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle}</title>

  <script>
    (function() {
      const saved = localStorage.getItem('visa-theme');
      const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (saved === 'dark' || (!saved && prefers)) {
        document.documentElement.classList.add('dark');
      }
    })();
  </script>

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet">

  <!-- MathJax 4 -->
  <script>
    window.MathJax = {
      loader: { load: ['input/tex', 'output/chtml', 'ui/menu'] },
      tex: {
        inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
        displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']],
        processEscapes: true
      },
      chtml: {
        matchFontHeight: false,
        linebreaks: { automatic: false }
      },
      startup: {
        typeset: false
      }
    };
  </script>
  <script src="https://cdn.jsdelivr.net/npm/mathjax@4/tex-chtml.js"></script>

  <style>
${ARTICLE_CSS}
  </style>
</head>
<body class="has-hamburger">

  <!-- TOC toggle -->
  <button id="toc-toggle-fixed" class="nav-toggle-btn" aria-label="Avaa/Sulje sisällysluettelo">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  </button>

  <!-- Left sidebar (TOC) -->
  <div id="toc-sidebar" class="sidebar left-sidebar">
    <div class="sidebar-header-row">
      <button id="close-toc-btn" class="icon-btn" aria-label="Sulje sisällysluettelo">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    <div id="toc-content"></div>
  </div>

  <!-- Right sidebar (Bib) -->
  <div id="bib-sidebar" class="sidebar right-sidebar">
    <div class="sidebar-header-row">
      <button id="close-bib-btn" class="icon-btn" aria-label="Sulje lähteet">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    <div id="bib-content"></div>
  </div>

  <div class="article-wrapper">
    <div class="top-nav article-nav">
      <div class="nav-right">
        <button id="theme-toggle" class="icon-btn" aria-label="Vaihda teemaa">
          <svg id="moon-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
          <svg id="sun-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" style="display: none;"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
        </button>
      </div>
    </div>

    <div id="article-container" class="article-content">
      ${articleHtml}
    </div>
  </div>

  <script>
    var BIBLIOGRAPHY_ENTRIES = ${bibEntriesJson};
  </script>
  <script>
${ARTICLE_JS}
  </script>
</body>
</html>`;
  }

  global.generateStandaloneHtml = generateStandaloneHtml;
})(window);
