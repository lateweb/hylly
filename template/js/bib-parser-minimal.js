// template/js/bib-parser-minimal.js
(function(global) {
  'use strict';

  // Reuse the same author parsing helpers as in the main app
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

    author = formatAuthors(author);

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
      doi = doi.replace(/\\url\{([^}]+)\}/g, '$1');
      formatted += ' DOI: <a href="https://doi.org/' + doi + '" target="_blank" rel="noopener">' + doi + '</a>';
    }

    formatted = formatted.replace(/---/g, '—').replace(/--/g, '–');
    formatted = formatted.replace(/\\([&%$#_{}])/g, '$1');

    return formatted;
  }

  global.formatBibEntry = formatBibEntry;
  // Expose helpers for consistency (though not used in template)
  global.parseAuthors = parseAuthors;
  global.formatAuthors = formatAuthors;
})(window);
