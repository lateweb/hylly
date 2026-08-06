// app/js/latex-to-html.js
(function(global) {
  'use strict';

  function extractTexMacro(src, macroName) {
    const regex = new RegExp('\\\\' + macroName + '\\s*\\{');
    const match = src.match(regex);
    if (!match) return '';
    let start = match.index + match[0].length;
    let depth = 1;
    let i = start;
    while (i < src.length && depth > 0) {
      if (src[i] === '\\') { i += 2; continue; }
      if (src[i] === '{') depth++;
      else if (src[i] === '}') depth--;
      i++;
    }
    return src.substring(start, i - 1).trim();
  }

  function cleanMetadata(text) {
    let clean = text.replace(/\\(?:textbf|textit|emph|underline)\{([^}]+)\}/g, '$1');
    let prev;
    do {
      prev = clean;
      clean = clean.replace(/\\[a-zA-Z]+\*?(?:\s*\[[^\]]*\])*(?:\s*\{[^{}]*\})*/g, '');
    } while (clean !== prev);
    clean = clean.replace(/\\([^a-zA-Z0-9])/g, '$1');
    return clean.trim();
  }

  function applyTypography(text) {
    if (!text) return '';
    return text.replace(/---/g, '—').replace(/--/g, '–').replace(/``/g, '“').replace(/''/g, '”');
  }

  function latexToHTML(source, bibEntries) {
    // --- 1. Extract metadata from a clean copy (comments removed) ---
    let tempSrc = source.replace(/\\%/g, '___PCT___').replace(/%.*/g, '').replace(/___PCT___/g, '\\%');
    let title = cleanMetadata(extractTexMacro(tempSrc, 'title'));
    let author = cleanMetadata(extractTexMacro(tempSrc, 'author'));
    let date = cleanMetadata(extractTexMacro(tempSrc, 'date'));

    title = applyTypography(title).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    author = applyTypography(author).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    date = applyTypography(date).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    let html = source;

    // --- 2. Protect all math (inline & display) with placeholders ---
    const mathStore = [];

    // Helper: replace all math delimiters with tokens
    function protectMath(str) {
      // Display math: \[ ... \]
      str = str.replace(/\\\[([\s\S]*?)\\\]/g, (match, p1) => {
        const token = `___MATH_D_${mathStore.length}___`;
        mathStore.push({ token, content: `\\[${p1}\\]`, isDisplay: true });
        return token;
      });
      // Display math: $$ ... $$
      str = str.replace(/\$\$([\s\S]*?)\$\$/g, (match, p1) => {
        const token = `___MATH_D_${mathStore.length}___`;
        mathStore.push({ token, content: `\\[${p1}\\]`, isDisplay: true });
        return token;
      });
      // Inline math: \( ... \)
      str = str.replace(/\\\(([\s\S]*?)\\\)/g, (match, p1) => {
        const token = `___MATH_I_${mathStore.length}___`;
        mathStore.push({ token, content: `\\(${p1}\\)`, isDisplay: false });
        return token;
      });
      // Inline math: $ ... $
      str = str.replace(/\$([^\$\n]+?)\$/g, (match, p1) => {
        const token = `___MATH_I_${mathStore.length}___`;
        mathStore.push({ token, content: `\\(${p1}\\)`, isDisplay: false });
        return token;
      });
      return str;
    }

    // --- 3. Protect special characters (to be restored later) ---
    html = html.replace(/\\&/g, '___ESC_AMP___');
    html = html.replace(/\\%/g, '___ESC_PCT___');
    html = html.replace(/\\\$/g, '___ESC_DOLLAR___');
    html = html.replace(/\\_/g, '___ESC_UNDERSCORE___');
    html = html.replace(/\\#/g, '___ESC_HASH___');
    html = html.replace(/\\\{/g, '___ESC_LBRACE___');
    html = html.replace(/\\\}/g, '___ESC_RBRACE___');

    // --- 4. Remove LaTeX comments (%) ---
    html = html.replace(/%.*/g, '');

    // --- 5. Protect math NOW (after comment removal, before any other processing) ---
    html = protectMath(html);

    // --- 6. HTML escape (safe to do now; math placeholders are untouched) ---
    html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // --- 7. Typography & quotes ---
    html = applyTypography(html);

    // --- 8. Strip preamble ---
    const beginDoc = html.indexOf('\\begin{document}');
    const endDoc = html.indexOf('\\end{document}');
    if (beginDoc !== -1 && endDoc !== -1 && endDoc > beginDoc) {
      html = html.substring(beginDoc + '\\begin{document}'.length, endDoc);
    }

    // --- 9. LaTeX structures (abstract, sections, etc.) ---
    html = html.replace(/\\begin\{abstract\}([\s\S]*?)\\end\{abstract\}/g, (_, content) => {
      return `\n\n<div class="abstract">\n\n${content.trim()}\n\n</div>\n\n`;
    });

    let chapNum = 0, secNum = 0, subsecNum = 0, subsubsecNum = 0;

    html = html.replace(/\\(chapter|section|subsection|subsubsection)(\*?)\{([^}]+)\}/g, (match, level, star, titleContent) => {
      let numStr = "";
      let tag;
      if (level === 'chapter') {
        if (!star) {
          chapNum++;
          secNum = 0; subsecNum = 0; subsubsecNum = 0;
          numStr = `${chapNum}. `;
        }
        tag = 'h2';
      } else if (level === 'section') {
        if (!star) {
          secNum++; subsecNum = 0; subsubsecNum = 0;
          if (chapNum > 0) {
            numStr = `${chapNum}.${secNum}. `;
          } else {
            numStr = `${secNum}. `;
          }
        }
        tag = 'h2';
      } else if (level === 'subsection') {
        if (!star) {
          subsecNum++; subsubsecNum = 0;
          if (chapNum > 0) {
            numStr = `${chapNum}.${secNum}.${subsecNum}. `;
          } else {
            numStr = `${secNum}.${subsecNum}. `;
          }
        }
        tag = 'h3';
      } else if (level === 'subsubsection') {
        if (!star) {
          subsubsecNum++;
          if (chapNum > 0) {
            numStr = `${chapNum}.${secNum}.${subsecNum}.${subsubsecNum}. `;
          } else {
            numStr = `${secNum}.${subsecNum}.${subsubsecNum}. `;
          }
        }
        tag = 'h4';
      }
      return `\n\n<${tag}>${numStr}${titleContent}</${tag}>\n\n`;
    });

    // --- 10. Basic LaTeX commands ---
    html = html.replace(/\\textbf\{([^}]+)\}/g, '<strong>$1</strong>');
    html = html.replace(/\\textit\{([^}]+)\}/g, '<em>$1</em>');
    html = html.replace(/\\emph\{([^}]+)\}/g, '<em>$1</em>');
    html = html.replace(/\\texttt\{([^}]+)\}/g, '<code>$1</code>');
    html = html.replace(/\\underline\{([^}]+)\}/g, '<u>$1</u>');
    html = html.replace(/\\url\{([^}]+)\}/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    html = html.replace(/\\href\{([^}]+)\}\{([^}]+)\}/g, '<a href="$1" target="_blank" rel="noopener">$2</a>');

    // Lists
    html = html.replace(/\\begin\{itemize\}([\s\S]*?)\\end\{itemize\}/g, (_, content) => {
      const items = content.replace(/\\item(?:\[[^\]]*\])?\s*/g, '</li><li>');
      return `\n\n<ul><li>${items}</li></ul>\n\n`;
    });
    html = html.replace(/\\begin\{enumerate\}([\s\S]*?)\\end\{enumerate\}/g, (_, content) => {
      const items = content.replace(/\\item(?:\[[^\]]*\])?\s*/g, '</li><li>');
      return `\n\n<ol><li>${items}</li></ol>\n\n`;
    });
    html = html.replace(/<li>\s*<\/li>/g, '');
    html = html.replace(/<(ul|ol)><li>/g, '<$1><li>');

    html = html.replace(/\\begin\{quote\}([\s\S]*?)\\end\{quote\}/g, '\n\n<blockquote>$1</blockquote>\n\n');

    // Tables
    html = html.replace(/\\begin\{tabular\}\{([^}]*)\}([\s\S]*?)\\end\{tabular\}/g, (_, colSpec, content) => {
      const rows = content.trim().split('\\\\').filter(row => row.trim() !== '' && !row.includes('\\hline'));
      let table = '<table>';
      rows.forEach(row => {
        const cells = row.split(/&amp;/).map(cell => cell.trim());
        table += '<tr>';
        cells.forEach(cell => { table += `<td>${cell}</td>`; });
        table += '</tr>';
      });
      table += '</table>';
      return `\n\n${table}\n\n`;
    });

    html = html.replace(/\\includegraphics(?:\[[^\]]*\])?\{([^}]+)\}/g, '<img src="$1" alt="Kuva">');
    html = html.replace(/\\begin\{figure\}(?:\[[^\]]*\])?([\s\S]*?)\\end\{figure\}/g, '\n\n<div class="figure">$1</div>\n\n');
    html = html.replace(/\\caption\{([^}]+)\}/g, '<div class="caption"><em>$1</em></div>');
    html = html.replace(/\\centering/g, '');

    // --- 11. Citations (using bibEntries) ---
    function getLastName(authorStr) {
      if (authorStr.includes(',')) {
        return authorStr.split(',')[0].trim();
      } else {
        const parts = authorStr.trim().split(/\s+/);
        return parts[parts.length - 1];
      }
    }

    function getAuthorYear(key) {
      const entry = bibEntries.find(e => e.key === key);
      if (!entry) return { author: key, year: '' };
      let authorField = entry.fields.author || '';
      let authors = authorField.split(/\s+(?:and|\\and)\s+/i).map(a => a.trim());
      let authorStr = key;
      if (authors.length > 0 && authors[0] !== '') {
        if (authors.length === 1) {
          authorStr = getLastName(authors[0]);
        } else if (authors.length === 2) {
          authorStr = getLastName(authors[0]) + ' & ' + getLastName(authors[1]);
        } else {
          authorStr = getLastName(authors[0]) + ' et al.';
        }
      }
      return { author: authorStr, year: entry.fields.year || '' };
    }

    function makeCite(keys, type) {
      const keyArray = keys.split(',').map(k => k.trim());
      if (type === 'paren') {
        const inner = keyArray.map(key => {
          const { author, year } = getAuthorYear(key);
          const text = year ? `${author}, ${year}` : author;
          return `<a href="#bib-${key}" class="cite-link" data-cite="${key}">${text}</a>`;
        }).join('; ');
        return `(${inner})`;
      } else if (type === 'text') {
        return keyArray.map(key => {
          const { author, year } = getAuthorYear(key);
          if (year) {
            return `${author} (<a href="#bib-${key}" class="cite-link" data-cite="${key}">${year}</a>)`;
          } else {
            return `<a href="#bib-${key}" class="cite-link" data-cite="${key}">${author}</a>`;
          }
        }).join(' ja ');
      }
      return `[${keys}]`;
    }

    html = html.replace(/\\(?:pcite|parencite)\{([^}]+)\}/g, (_, keys) => makeCite(keys, 'paren'));
    html = html.replace(/\\(?:tcite|textcite)\{([^}]+)\}/g, (_, keys) => makeCite(keys, 'text'));
    html = html.replace(/\\cite\{([^}]+)\}/g, (_, keys) => makeCite(keys, 'paren'));

    // --- 12. Remove unknown LaTeX commands (but NOT math placeholders) ---
    html = html.replace(/\\\\/g, '<br>');
    let prevHtml;
    do {
      prevHtml = html;
      html = html.replace(/\\[a-zA-Z]+\*?(?:\s*\[[^\]]*\])*(?:\s*\{[^{}]*\})*/g, '');
    } while (html !== prevHtml);

    // --- 13. Remove backslashes before non‑letter characters (but leave math placeholders untouched) ---
    // We use a negative lookahead to avoid matching our math placeholders.
    html = html.replace(/\\(?![a-zA-Z])(?=[^a-zA-Z])/g, ''); // This is safer than the original.

    // --- 14. Paragraph wrapping (skip block elements and math placeholders) ---
    const paragraphs = html.split(/\n\s*\n/);
    html = paragraphs.map(para => {
      let trimmed = para.trim();
      if (!trimmed) return '';
      // Skip block elements or math placeholders
      if (/^<\/?(h[1-6]|ul|ol|table|div|img|figure|pre|blockquote)/i.test(trimmed) || /^___MATH_/.test(trimmed)) {
        return trimmed;
      }
      trimmed = trimmed.replace(/\n/g, ' ');
      return `<p>${trimmed}</p>`;
    }).join('\n');

    // --- 15. Restore special characters ---
    html = html.replace(/___ESC_AMP___/g, '&amp;');
    html = html.replace(/___ESC_PCT___/g, '%');
    html = html.replace(/___ESC_DOLLAR___/g, '$');
    html = html.replace(/___ESC_UNDERSCORE___/g, '_');
    html = html.replace(/___ESC_HASH___/g, '#');
    html = html.replace(/___ESC_LBRACE___/g, '{');
    html = html.replace(/___ESC_RBRACE___/g, '}');

    // --- 16. Restore math placeholders ---
    html = html.replace(/___MATH_[ID]_(\d+)___/g, (match, index) => {
      // This regex is intentionally loose; we'll do a more precise replacement below.
      // We'll use a forEach loop to replace each token safely.
      // However, we can use a map and replace each token exactly.
      return match; // placeholder, we'll replace later
    });

    // Precise token replacement:
    mathStore.forEach(item => {
      html = html.split(item.token).join(item.content);
    });

    // --- 17. Build article header ---
    let headerHTML = '';
    if (title || author || date) {
      headerHTML += '<div class="article-header">';
      if (title) headerHTML += `<h1 class="article-title">${title}</h1>`;
      if (author) headerHTML += `<div class="article-author">${author}</div>`;
      if (date) headerHTML += `<div class="article-date">${date}</div>`;
      headerHTML += '</div>';
    }

    return headerHTML + html;
  }

  global.latexToHTML = latexToHTML;
})(window);
