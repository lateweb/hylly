// template/js/bib-parser-minimal.js
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

    author = author.replace(/\s+and\s+/ig, ' & ');

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
})(window);
