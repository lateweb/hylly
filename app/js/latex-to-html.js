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

  // --- Helper: parse authors (same as in bib-parser) ---
  function parseAuthors(authorStr) {
    if (!authorStr) return [];
    const parts = authorStr.split(/\s+(?:and|\\and)\s+/i);
    return parts.map(a => a.trim()).filter(a => a.length > 0).map(a => {
      let cleaned = a.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
      const tokens = cleaned.split(/\s+/);
      if (tokens.length === 0) return { last: '', first: '' };
      const last = tokens.pop();
      const first = tokens.map(t => t.charAt(0).toUpperCase() + '.').join(' ');
      return { last, first };
    });
  }

  function formatAuthors(authorStr) {
    const authors = parseAuthors(authorStr);
    if (authors.length === 0) return '';
    const formatted = authors.map(a => a.first ? `${a.last}, ${a.first}` : a.last);
    if (formatted.length === 1) return formatted[0];
    const last = formatted.pop();
    return formatted.join(', ') + ' & ' + last;
  }

  // --- Helper: process table content ---
  function processTableContent(content) {
    // content is the inside of a tabular or tabularx environment
    // Split rows by \\ (but avoid splitting on escaped newline)
    const rows = content.split(/\\\\/).map(r => r.trim()).filter(r => r.length > 0);
    let htmlRows = [];
    let inHeader = false;
    for (let row of rows) {
      // Remove \hline, \midrule, \toprule, \bottomrule, \addlinespace
      row = row.replace(/\\hline/g, '').replace(/\\midrule/g, '').replace(/\\toprule/g, '').replace(/\\bottomrule/g, '').replace(/\\addlinespace/g, '');
      row = row.trim();
      if (!row) continue;
      // Split cells by &
      const cells = row.split(/&/).map(c => c.trim());
      const cellHtml = cells.map(c => `<td>${c}</td>`).join('');
      // We'll add a class for rows that were separated by \midrule etc.
      // For simplicity, we just output <tr>
      htmlRows.push(`<tr>${cellHtml}</tr>`);
    }
    return htmlRows.join('\n');
  }

  function latexToHTML(source, bibEntries) {
    let tempSrc = source.replace(/\\%/g, '___PCT___').replace(/%.*/g, '').replace(/___PCT___/g, '\\%');
    let title = cleanMetadata(extractTexMacro(tempSrc, 'title'));
    let author = cleanMetadata(extractTexMacro(tempSrc, 'author'));
    let date = cleanMetadata(extractTexMacro(tempSrc, 'date'));

    title = applyTypography(title).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    author = applyTypography(author).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    date = applyTypography(date).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    let html = source;

    // 1. MASK TABLE ENVIRONMENTS (first, to protect them from other regexes)
    const tableStash = [];
    // match \begin{table}...\end{table} and \begin{table*}, etc.
    const tableRegex = /(?<!\\\\)\\begin\{table\*?\}([\s\S]*?)(?<!\\\\)\\end\{table\*?\}/g;
    html = html.replace(tableRegex, (match, inner) => {
      const token = `@@TABLE_${tableStash.length}@@`;
      // process inner to extract caption and tabular
      let caption = '';
      let tabularContent = '';
      // try to find \caption{...}
      const capMatch = inner.match(/\\caption\{([^}]*)\}/);
      if (capMatch) {
        caption = capMatch[1];
        inner = inner.replace(/\\caption\{[^}]*\}/, '');
      }
      // find \begin{tabular} or \begin{tabularx}
      const tabMatch = inner.match(/\\begin\{tabularx?\}([\s\S]*?)\\end\{tabularx?\}/);
      if (tabMatch) {
        tabularContent = tabMatch[1];
      } else {
        // maybe just \begin{tabular}
        const tabMatch2 = inner.match(/\\begin\{tabular\}([\s\S]*?)\\end\{tabular\}/);
        if (tabMatch2) {
          tabularContent = tabMatch2[1];
        }
      }
      // Build HTML table
      let tableHtml = '<table class="latex-table">';
      if (caption) {
        tableHtml += `<caption>${caption}</caption>`;
      }
      if (tabularContent) {
        const rows = processTableContent(tabularContent);
        tableHtml += rows;
      }
      tableHtml += '</table>';
      // wrap in a figure/div
      const wrapped = `<div class="table-wrap">${tableHtml}</div>`;
      tableStash.push({ token, content: wrapped });
      return `\n\n${token}\n\n`;
    });

    // 2. MASK MATH (same as before)
    const mathStash = [];
    const mathEnvs = ['equation', 'equation\\*', 'align', 'align\\*', 'gather', 'gather\\*', 'eqnarray', 'eqnarray\\*', 'multline', 'multline\\*', 'split'];
    const envRegex = new RegExp(`(?<!\\\\)\\\\begin\\{(${mathEnvs.join('|')})\\}([\\s\\S]*?)(?<!\\\\)\\\\end\\{\\1\\}`, 'g');
    html = html.replace(envRegex, (match, env, inner) => {
      const token = `@@MATH_D_${mathStash.length}@@`;
      const safeMath = inner.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      mathStash.push({ token, content: `<div class="math-scroll">\\begin{${env}}${safeMath}\\end{${env}}</div>` });
      return `\n\n${token}\n\n`;
    });

    html = html.replace(/(?<!\\)\\\[([\s\S]*?)(?<!\\)\\\]/g, (match, inner) => {
      const token = `@@MATH_D_${mathStash.length}@@`;
      const safeMath = inner.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      mathStash.push({ token, content: `<div class="math-scroll">\\[${safeMath}\\]</div>` });
      return `\n\n${token}\n\n`;
    });

    html = html.replace(/(?<!\\)\$\$([\s\S]*?)(?<!\\)\$\$/g, (match, inner) => {
      const token = `@@MATH_D_${mathStash.length}@@`;
      const safeMath = inner.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      mathStash.push({ token, content: `<div class="math-scroll">$$${safeMath}$$</div>` });
      return `\n\n${token}\n\n`;
    });

    html = html.replace(/(?<!\\)\\\(([\s\S]*?)(?<!\\)\\\)/g, (match, inner) => {
      const token = `@@MATH_I_${mathStash.length}@@`;
      const safeMath = inner.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      mathStash.push({ token, content: `<span class="math-inline">\\(${safeMath}\\)</span>` });
      return token;
    });

    html = html.replace(/(?<!\\)\$([^\$\n]+?)(?<!\\)\$/g, (match, inner) => {
      const token = `@@MATH_I_${mathStash.length}@@`;
      const safeMath = inner.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      mathStash.push({ token, content: `<span class="math-inline">$${safeMath}$</span>` });
      return token;
    });

    // 3. Protect special chars
    html = html.replace(/\\&/g, '___ESC_AMP___');
    html = html.replace(/\\%/g, '___ESC_PCT___');
    html = html.replace(/\\\$/g, '___ESC_DOLLAR___');
    html = html.replace(/\\_/g, '___ESC_UNDERSCORE___');
    html = html.replace(/\\#/g, '___ESC_HASH___');
    html = html.replace(/\\\{/g, '___ESC_LBRACE___');
    html = html.replace(/\\\}/g, '___ESC_RBRACE___');

    // 4. Remove comments
    html = html.replace(/%.*/g, '');

    // 5. HTML escape
    html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // 6. Typography
    html = applyTypography(html);

    // 7. Strip preamble
    const beginDoc = html.indexOf('\\begin{document}');
    const endDoc = html.indexOf('\\end{document}');
    if (beginDoc !== -1 && endDoc !== -1 && endDoc > beginDoc) {
      html = html.substring(beginDoc + '\\begin{document}'.length, endDoc);
    }

    // 8. LaTeX structures
    html = html.replace(/\\begin\{abstract\}([\s\S]*?)\\end\{abstract\}/g, (_, content) => {
      return `\n\n<div class="abstract">\n\n${content.trim()}\n\n</div>\n\n`;
    });

    // Theorems, proofs, etc. are now plain (no special border)
    const blocks = ['theorem', 'lemma', 'proposition', 'corollary', 'definition', 'remark', 'example', 'proof'];
    blocks.forEach(env => {
      const regex = new RegExp(`\\\\begin\\{${env}\\}([\\s\\S]*?)\\\\end\\{${env}\\}`, 'gi');
      html = html.replace(regex, (_, content) => {
        const Title = env.charAt(0).toUpperCase() + env.slice(1);
        const label = env === 'proof' ? `<em>${Title}.</em>` : `<strong>${Title}.</strong>`;
        return `\n\n<div class="article-block">\n\n${label} ${content.trim()}\n\n</div>\n\n`;
      });
    });

    let chapNum = 0, secNum = 0, subsecNum = 0, subsubsecNum = 0;
    html = html.replace(/\\(chapter|section|subsection|subsubsection)(\*?)\{([^}]+)\}/g, (match, level, star, titleContent) => {
      let numStr = "";
      let tag;
      if (level === 'chapter') {
        if (!star) { chapNum++; secNum = 0; subsecNum = 0; subsubsecNum = 0; numStr = `${chapNum}. `; }
        tag = 'h2';
      } else if (level === 'section') {
        if (!star) { secNum++; subsecNum = 0; subsubsecNum = 0; numStr = (chapNum > 0) ? `${chapNum}.${secNum}. ` : `${secNum}. `; }
        tag = 'h2';
      } else if (level === 'subsection') {
        if (!star) { subsecNum++; subsubsecNum = 0; numStr = (chapNum > 0) ? `${chapNum}.${secNum}.${subsecNum}. ` : `${secNum}.${subsecNum}. `; }
        tag = 'h3';
      } else if (level === 'subsubsection') {
        if (!star) { subsubsecNum++; numStr = (chapNum > 0) ? `${chapNum}.${secNum}.${subsecNum}.${subsubsecNum}. ` : `${secNum}.${subsecNum}.${subsubsecNum}. `; }
        tag = 'h4';
      }
      return `\n\n<${tag}>${numStr}${titleContent}</${tag}>\n\n`;
    });

    html = html.replace(/\\textbf\{([^}]+)\}/g, '<strong>$1</strong>');
    html = html.replace(/\\textit\{([^}]+)\}/g, '<em>$1</em>');
    html = html.replace(/\\emph\{([^}]+)\}/g, '<em>$1</em>');
    html = html.replace(/\\texttt\{([^}]+)\}/g, '<code>$1</code>');
    html = html.replace(/\\underline\{([^}]+)\}/g, '<u>$1</u>');
    html = html.replace(/\\url\{([^}]+)\}/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
    html = html.replace(/\\href\{([^}]+)\}\{([^}]+)\}/g, '<a href="$1" target="_blank" rel="noopener">$2</a>');

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

    // Tables are already handled above via masking, but we also have \begin{tabular} fallback
    // (we already masked table environment, but if there is a standalone tabular, process it)
    html = html.replace(/\\begin\{tabular\}([\s\S]*?)\\end\{tabular\}/g, (_, content) => {
      const rows = processTableContent(content);
      return `\n\n<table class="latex-table">${rows}</table>\n\n`;
    });

    html = html.replace(/\\includegraphics(?:\[[^\]]*\])?\{([^}]+)\}/g, '<img src="$1" alt="Kuva">');
    html = html.replace(/\\begin\{figure\}(?:\[[^\]]*\])?([\s\S]*?)\\end\{figure\}/g, '\n\n<div class="figure">$1</div>\n\n');
    html = html.replace(/\\caption\{([^}]+)\}/g, '<div class="caption"><em>$1</em></div>');
    html = html.replace(/\\centering/g, '');

    // Cites
    function getLastName(authorStr) {
      if (authorStr.includes(',')) return authorStr.split(',')[0].trim();
      const parts = authorStr.trim().split(/\s+/);
      return parts[parts.length - 1];
    }
    function getAuthorYear(key) {
      const entry = bibEntries.find(e => e.key === key);
      if (!entry) return { author: key, year: '' };
      let authorField = entry.fields.author || '';
      // Use the same formatting as bibliography to get author string
      let authorStr = formatAuthors(authorField);
      if (!authorStr) authorStr = key;
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
          if (year) { return `${author} (<a href="#bib-${key}" class="cite-link" data-cite="${key}">${year}</a>)`; }
          return `<a href="#bib-${key}" class="cite-link" data-cite="${key}">${author}</a>`;
        }).join(' ja ');
      }
      return `[${keys}]`;
    }
    html = html.replace(/\\(?:pcite|parencite)\{([^}]+)\}/g, (_, keys) => makeCite(keys, 'paren'));
    html = html.replace(/\\(?:tcite|textcite)\{([^}]+)\}/g, (_, keys) => makeCite(keys, 'text'));
    html = html.replace(/\\cite\{([^}]+)\}/g, (_, keys) => makeCite(keys, 'paren'));

    // 8. Remove unknown commands
    html = html.replace(/\\\\/g, '<br>');
    let prevHtml;
    do {
      prevHtml = html;
      html = html.replace(/\\[a-zA-Z]+\*?(?:\s*\[[^\]]*\])*(?:\s*\{[^{}]*\})*/g, '');
    } while (html !== prevHtml);
    html = html.replace(/\\([^a-zA-Z0-9])/g, '$1');

    // 9. Paragraph wrapping
    const paragraphs = html.split(/\n\s*\n/);
    html = paragraphs.map(para => {
      let trimmed = para.trim();
      if (!trimmed) return '';
      if (/^<\/?(h[1-6]|ul|ol|table|div|img|figure|pre|blockquote)/i.test(trimmed) || /^@@(TABLE|MATH)_/.test(trimmed)) {
        return trimmed;
      }
      trimmed = trimmed.replace(/\n/g, ' ');
      return `<p>${trimmed}</p>`;
    }).join('\n');

    // 10. UNMASK TABLE and MATH
    tableStash.forEach(m => {
      html = html.split(m.token).join(m.content);
    });
    mathStash.forEach(m => {
      html = html.split(m.token).join(m.content);
    });

    // 11. Restore special characters
    html = html.replace(/___ESC_AMP___/g, '&amp;');
    html = html.replace(/___ESC_PCT___/g, '%');
    html = html.replace(/___ESC_DOLLAR___/g, '$');
    html = html.replace(/___ESC_UNDERSCORE___/g, '_');
    html = html.replace(/___ESC_HASH___/g, '#');
    html = html.replace(/___ESC_LBRACE___/g, '{');
    html = html.replace(/___ESC_RBRACE___/g, '}');

    // 12. Article header
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
