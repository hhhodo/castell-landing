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

  // ESG collage: one-time scroll-triggered fly-in-from-center reveal, same
  // IntersectionObserver + class-toggle technique as [data-reveal] above.
  // Reduced-motion users get the CSS fallback (no opacity/transform change,
  // so the plain images just show — see the (no-preference) media rule in site.css).
  const collageEls = document.querySelectorAll('[data-collage-reveal]');
  const collageIo = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        collageIo.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  collageEls.forEach((el) => collageIo.observe(el));

  // Wordmark: wrap every character in its own <span class="cs-char"> at load time,
  // then fill them in one at a time based on scroll progress through the taller
  // .cs-wordmark-track (same scroll-progress computation as the statement crossfade
  // above), pinned via position:sticky in CSS. Reduced-motion users see the CSS
  // fallback of all characters fully colored immediately (no track height, no JS work needed).
  const wordmarkTrack = document.querySelector('.cs-wordmark-track');
  const wordmarkPs = document.querySelectorAll('.cs-wordmark p');

  const wrapChars = (root) => {
    const walker = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          const frag = document.createDocumentFragment();
          Array.from(child.textContent).forEach((ch) => {
            const span = document.createElement('span');
            span.className = 'cs-char';
            span.textContent = ch;
            frag.appendChild(span);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== 'BR') {
          walker(child);
        }
      });
    };
    walker(root);
  };
  if (!reduceMotionMq.matches) {
    wordmarkPs.forEach((p) => wrapChars(p));
  }
  const wordmarkChars = document.querySelectorAll('.cs-wordmark .cs-char');

  const updateWordmarkScroll = () => {
    if (!wordmarkTrack || !wordmarkChars.length || reduceMotionMq.matches) return;
    const rect = wordmarkTrack.getBoundingClientRect();
    const vh = window.innerHeight;
    const scrollable = rect.height - vh;
    const progress = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0;
    const filledCount = Math.floor(progress * wordmarkChars.length);
    wordmarkChars.forEach((el, i) => {
      el.classList.toggle('is-filled', i < filledCount);
    });
  };
  updateWordmarkScroll();
  window.addEventListener('scroll', updateWordmarkScroll, { passive: true });
  window.addEventListener('resize', updateWordmarkScroll);
})();
