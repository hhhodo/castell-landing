(() => {
  const nav = document.getElementById('nav');

  // Header goes transparent as soon as the user starts scrolling.
  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 0);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const revealEls = document.querySelectorAll('[data-reveal]');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  revealEls.forEach((el) => io.observe(el));
})();
