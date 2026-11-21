document.addEventListener('DOMContentLoaded', () => {
  const trigger = document.querySelector('.sidenav-trigger');
  const menu = document.getElementById('mobile-demo');
  if (typeof M === 'undefined' || !trigger || !menu) return;

  const drawer = M.Sidenav.init(menu, {
    onOpenStart: () => {
      menu.inert = false;
      trigger.setAttribute('aria-expanded', 'true');
      menu.querySelector('.sidenav-close').focus({ preventScroll: true });
    },
    onCloseEnd: () => {
      if (menu.contains(document.activeElement)) trigger.focus({ preventScroll: true });
      menu.inert = true;
      trigger.setAttribute('aria-expanded', 'false');
    }
  });
  menu.addEventListener('keydown', event => {
    if (event.key === 'Escape') drawer.close();
  });
  menu.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', () => drawer.close());
  });
});
