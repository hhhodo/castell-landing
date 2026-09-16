(() => {
  const nav = document.getElementById('nav');

  // Header goes transparent as soon as the user starts scrolling.
  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 0);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Statement section: scroll-driven pinned crossfade between the 3 article states.
  // Purely scroll-position-linked (no buttons/autoplay/carousel) — the track container
  // (.cs-statement__articles) is 300vh tall while .cs-statement__list is sticky, so
  // scrolling through the track slides scroll-progress from 0 to 1 while the section
  // stays pinned; each article gets a triangular opacity centered on its own scroll
  // segment so neighboring states crossfade.
  const statementTrack = document.querySelector('.cs-statement__articles');
  const statementArticles = document.querySelectorAll('.cs-statement__articles .cs-article');
  const reduceMotionMq = window.matchMedia('(prefers-reduced-motion: reduce)');

  const updateStatementScroll = () => {
    if (!statementTrack || !statementArticles.length || reduceMotionMq.matches) return;
    const n = statementArticles.length;
    const rect = statementTrack.getBoundingClientRect();
    const vh = window.innerHeight;
    const scrollable = rect.height - vh;
    const progress = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0;
    const value = progress * (n - 1);
    statementArticles.forEach((el, i) => {
      const opacity = Math.min(1, Math.max(0, 1 - Math.abs(value - i)));
      el.style.opacity = String(opacity);
    });
  };
  updateStatementScroll();
  window.addEventListener('scroll', updateStatementScroll, { passive: true });
  window.addEventListener('resize', updateStatementScroll);

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
