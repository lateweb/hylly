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
    let tempSrc = source.replace(/\\%/g, '___PCT___').replace(/%.*/g, '').replace(/___PCT___/g, '\\%');
    let title = cleanMetadata(extractTexMacro(tempSrc, 'title'));
    let author = cleanMetadata(extractTexMacro(tempSrc, 'author'));
    let date = cleanMetadata(extractTexMacro(tempSrc, 'date'));

    title = applyTypography(title).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    author = applyTypography(author).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    date = applyTypography(date).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    let html = source;

    // 1. MASK MATH (Protecting all math from greedy command stripping)
    const mathStash = [];
    
    // Protect math environments (align, equation, gather, etc.)
    const mathEnvs = ['equation', 'equation\\*', 'align', 'align\\*', 'gather', 'gather\\*', 'eqnarray', 'eqnarray\\*', 'multline', 'multline\\*', 'split'];
    const envRegex = new RegExp(`(?<!\\\\)\\\\begin\\{(${mathEnvs.join('|')})\\}([\\s\\S]*?)(?<!\\\\)\\\\end\\{\\1\\}`, 'g');
    html = html.replace(envRegex, (match, env, inner) => {
      const token = `@@MATH_D_${mathStash.length}@@`;
      const safeMath = inner.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      // Reconstruct exactly to prevent character drops
      mathStash.push({ token, content: `<div class="math-scroll">\\begin{${env}}${safeMath}\\end{${env}}</div>` });
      return `\n\n${token}\n\n`;
    });

    // Display math \[ ... \]
    html = html.replace(/(?<!\\)\\\[([\s\S]*?)(?<!\\)\\\]/g, (match, inner) => {
      const token = `@@MATH_D_${mathStash.length}@@`;
      const safeMath = inner.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      mathStash.push({ token, content: `<div class="math-scroll">\\[${safeMath}\\]</div>` });
      return `\n\n${token}\n\n`;
    });

    // Display math $$ ... $$
    html = html.replace(/(?<!\\)\$\$([\s\S]*?)(?<!\\)\$\$/g, (match, inner) => {
      const token = `@@MATH_D_${mathStash.length}@@`;
      const safeMath = inner.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      mathStash.push({ token, content: `<div class="math-scroll">$$${safeMath}$$</div>` });
      return `\n\n${token}\n\n`;
    });

    // Inline math \( ... \)
    html = html.replace(/(?<!\\)\\\(([\s\S]*?)(?<!\\)\\\)/g, (match, inner) => {
      const token = `@@MATH_I_${mathStash.length}@@`;
      const safeMath = inner.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      mathStash.push({ token, content: `<span class="math-inline">\\(${safeMath}\\)</span>` });
      return token;
    });

    // Inline math $ ... $
    html = html.replace(/(?<!\\)\$([^\$\n]+?)(?<!\\)\$/g, (match, inner) => {
      const token = `@@MATH_I_${mathStash.length}@@`;
      const safeMath = inner.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      mathStash.push({ token, content: `<span class="math-inline">$${safeMath}$</span>` });
      return token;
    });

    // 2. Protect special chars
    html = html.replace(/\\&/g, '___ESC_AMP___');
    html = html.replace(/\\%/g, '___ESC_PCT___');
    html = html.replace(/\\\$/g, '___ESC_DOLLAR___');
    html = html.replace(/\\_/g, '___ESC_UNDERSCORE___');
    html = html.replace(/\\#/g, '___ESC_HASH___');
    html = html.replace(/\\\{/g, '___ESC_LBRACE___');
    html = html.replace(/\\\}/g, '___ESC_RBRACE___');

    // 3. Remove comments
    html = html.replace(/%.*/g, '');

    // 4. HTML escape
    html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // 5. Typography
    html = applyTypography(html);

    // 6. Strip preamble
    const beginDoc = html.indexOf('\\begin{document}');
    const endDoc = html.indexOf('\\end{document}');
    if (beginDoc !== -1 && endDoc !== -1 && endDoc > beginDoc) {
      html = html.substring(beginDoc + '\\begin{document}'.length, endDoc);
    }

    // 7. LaTeX structures
    html = html.replace(/\\begin\{abstract\}([\s\S]*?)\\end\{abstract\}/g, (_, content) => {
      return `\n\n<div class="abstract">\n\n${content.trim()}\n\n</div>\n\n`;
    });

    // Preserve Theorems, proofs, lemmas, etc., stopping them from being stripped
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
      let authors = authorField.split(/\s+(?:and|\\and)\s+/i).map(a => a.trim());
      let authorStr = key;
      if (authors.length > 0 && authors[0] !== '') {
        if (authors.length === 1) { authorStr = getLastName(authors[0]); }
        else if (authors.length === 2) { authorStr = getLastName(authors[0]) + ' & ' + getLastName(authors[1]); }
        else { authorStr = getLastName(authors[0]) + ' et al.'; }
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
      if (/^<\/?(h[1-6]|ul|ol|table|div|img|figure|pre|blockquote)/i.test(trimmed) || /^@@MATH_/.test(trimmed)) {
        return trimmed;
      }
      trimmed = trimmed.replace(/\n/g, ' ');
      return `<p>${trimmed}</p>`;
    }).join('\n');

    // 10. UNMASK MATH (Safely inserts manually rebuilt tags exactly)
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
