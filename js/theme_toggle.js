// Theme Toggle Module
(function() {
  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const current = stored || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', current);

  window.toggleTheme = function() {
    const active = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', active);
    localStorage.setItem('theme', active);
  };
})();
