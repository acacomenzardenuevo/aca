document.addEventListener('DOMContentLoaded', () => {
  const trigger = document.querySelector('.sidenav-trigger');
  if (typeof M === 'undefined') return;
  trigger?.addEventListener('keydown', event => {
    if (event.key === ' ') { event.preventDefault(); trigger.click(); }
  });
  const menus = document.querySelectorAll('.sidenav');
  M.Sidenav.init(menus, {
    onOpenStart: () => trigger?.setAttribute('aria-expanded', 'true'),
    onCloseEnd: () => trigger?.setAttribute('aria-expanded', 'false')
  });
  document.querySelectorAll('.sidenav a[href^="#"]').forEach(link => {
    link.addEventListener('click', () => {
      const menu = document.getElementById('mobile-demo');
      M.Sidenav.getInstance(menu)?.close();
    });
  });
});
