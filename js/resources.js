// The lists remain the only source for inline and table comparisons.
(() => {
  document.querySelectorAll('.list-pair').forEach(pair => {
    const lists = pair.querySelectorAll('.traits-list');
    const patterns = [...lists[0].querySelectorAll('.trait-option > span')];
    const changes = [...lists[1].querySelectorAll('.trait-option > span')];
    const comparison = pair.querySelector('.list-comparison');
    const body = comparison.querySelector('tbody');
    const plainText = element => element.textContent.replace(/^\d+\.\s*/, '');
    patterns.forEach((pattern, index) => {
      const change = changes[index];
      const inline = document.createElement('details');
      inline.className = 'inline-recovery';
      const summary = document.createElement('summary');
      summary.textContent = 'Ver cambio de recuperación';
      const text = document.createElement('p');
      text.textContent = plainText(change);
      inline.append(summary, text);
      pattern.closest('li').append(inline);
      const row = document.createElement('tr');
      const number = document.createElement('th');
      number.scope = 'row';
      number.textContent = index + 1;
      row.append(number);
      [pattern, change].forEach((source, column) => {
        const cell = document.createElement('td');
        cell.dataset.label = column ? 'Cambio de recuperación' : 'Patrón para reconocer';
        cell.textContent = plainText(source);
        row.append(cell);
      });
      body.append(row);
    });
    comparison.hidden = false;
  });
  function revealLink() {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    const target = document.getElementById(id);
    if (!target?.matches('.laundry-resource')) return;
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    target.scrollIntoView({ block: 'start' });
  }
  window.addEventListener('hashchange', revealLink);
  revealLink();
})();
