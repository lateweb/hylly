// app/js/bib-parser.js
(function(global) {
  'use strict';

  function parseBibtex(bibSource) {
    const entries = [];
    let safeSource = bibSource.replace(/\\%/g, '___ESC_PCT___');
    safeSource = safeSource.replace(/(^|\s)%.*/g, '');
    const cleaned = safeSource.replace(/___ESC_PCT___/g, '\\%');

    const blocks = cleaned.split(/@/).filter(block => block.trim().length > 0);

    blocks.forEach(block => {
      const typeMatch = block.match(/^(\w+)\s*\{/);
      if (!typeMatch) return;
      const type = typeMatch[1].toLowerCase();
      const keyMatch = block.match(/\{([^,]+),/);
      const key = keyMatch ? keyMatch[1].trim() : '';

      const fields = {};
      const fieldRegex = /(\w+)\s*=\s*[{"]([^}"]+)[}"]\s*,?\s*/g;
      let match;
      while ((match = fieldRegex.exec(block)) !== null) {
        fields[match[1].toLowerCase()] = match[2];
      }

      entries.push({ type, key, fields });
    });
    return entries;
  }

  /**
   * Parse an author string into an array of author objects { last: string, first: string }
   * Handles "and" and "\\and" separators.
   */
  function parseAuthors(authorStr) {
    if (!authorStr) return [];
    // Split on " and " or "\\and" (case insensitive)
    const parts = authorStr.split(/\s+(?:and|\\and)\s+/i);
    return parts.map(a => a.trim()).filter(a => a.length > 0).map(a => {
      // Remove trailing commas and extra spaces
      let cleaned = a.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();
      const tokens = cleaned.split(/\s+/);
      if (tokens.length === 0) return { last: '', first: '' };
      // Last token is the surname
      const last = tokens.pop();
      // Remaining tokens are given names – take initials
      const first = tokens.map(t => t.charAt(0).toUpperCase() + '.').join(' ');
      return { last, first };
    });
  }

  /**
   * Format a list of authors with surname first, e.g., "Zhou, Y., Zhang, T., ... & Liu, L."
   */
  function formatAuthors(authorStr) {
    const authors = parseAuthors(authorStr);
    if (authors.length === 0) return '';
    const formatted = authors.map(a => a.first ? `${a.last}, ${a.first}` : a.last);
    if (formatted.length === 1) return formatted[0];
    const last = formatted.pop();
    return formatted.join(', ') + ' & ' + last;
  }

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

    // Format authors with surname first
    author = formatAuthors(author);

    let formatted = '';
    if (author) formatted += `<strong>${author}</strong>. `;
    if (year) formatted += `(${year}). `;
    if (title) formatted += `<em>${title}</em>. `;
    if (journal) formatted += journal;
    if (volume) {
      formatted += `, ${volume}`;
      if (number) formatted += `(${number})`;
    }
    if (pages) formatted += `, ${pages}`;

    formatted = formatted.trim();
    if (!formatted.endsWith('.')) formatted += '.';

    if (doi) {
      doi = doi.replace(/\\url\{([^}]+)\}/g, '$1');
      formatted += ` DOI: <a href="https://doi.org/${doi}" target="_blank" rel="noopener">${doi}</a>`;
    }

    formatted = formatted.replace(/---/g, '—').replace(/--/g, '–');
    formatted = formatted.replace(/\\([&%$#_{}])/g, '$1');

    return formatted;
  }

  global.parseBibtex = parseBibtex;
  global.formatBibEntry = formatBibEntry;
  // Expose helpers for use in other modules
  global.parseAuthors = parseAuthors;
  global.formatAuthors = formatAuthors;
})(window);
