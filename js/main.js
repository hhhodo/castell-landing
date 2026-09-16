(() => {
  const nav = document.getElementById('nav');

  // Header goes transparent as soon as the user starts scrolling.
  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 0);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Statement section: scroll-driven pinned stacking transition between the 3 article
  // states. Purely scroll-position-linked (no buttons/autoplay/carousel) — the track
  // container (.cs-statement__articles) is 300vh tall (3 states x 100vh) while
  // .cs-statement__list is sticky and exactly 100vh, so scrolling through the track
  // slides scroll-progress from 0 to 1 while the section stays pinned. Article 0 rests
  // in place at translateY(0); each subsequent article starts fully below the viewport
  // (translateY(100%)) and slides up to translateY(0) as scroll progress crosses its own
  // [i-1, i] segment, stacking over (higher z-index than) the article(s) beneath it —
  // a "cards dealt from below" push-up effect instead of an opacity crossfade.
  const statementTrack = document.querySelector('.cs-statement__articles');
  const statementArticles = document.querySelectorAll('.cs-statement__articles .cs-article');
  const reduceMotionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const smoothstep = (t) => t * t * (3 - 2 * t);

  const updateStatementScroll = () => {
    if (!statementTrack || !statementArticles.length || reduceMotionMq.matches) return;
    const n = statementArticles.length;
    const rect = statementTrack.getBoundingClientRect();
    const vh = window.innerHeight;
    const scrollable = rect.height - vh;
    const progress = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0;
    const value = progress * (n - 1);
    statementArticles.forEach((el, i) => {
      if (i === 0) {
        el.style.transform = 'translateY(0)';
        return;
      }
      const local = Math.min(1, Math.max(0, value - (i - 1)));
      const eased = smoothstep(local);
      const translateY = 100 * (1 - eased);
      el.style.transform = `translateY(${translateY}%)`;
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

  // ESG collage: continuously scroll-linked fly-in, same scroll-progress
  // technique as the statement crossfade / wordmark fill above (progress
  // computed from the section's own getBoundingClientRect() each scroll tick,
  // no artificial tall sticky track needed — the collage's natural height is
  // the scroll range). Each item has its own reveal threshold along that
  // 0–1 progress (center item first, then next-out, then outermost) and its
  // opacity/transform is driven by how far progress has passed that
  // threshold, so items keep animating in as the user keeps scrolling
  // instead of all firing at once off a single trigger.
  const collageSection = document.querySelector('[data-collage-reveal]');
  const collageItems = collageSection
    ? Array.from(collageSection.querySelectorAll('.cs-collage__item'))
    : [];

  // Group size = how much of the 0..1 progress range one reveal "step" takes;
  // items sharing the same --i (center-outward index) share a step so they
  // still stagger center → out, just continuously rather than time-based.
  const collageMaxStep = collageItems.reduce(
    (max, el) => Math.max(max, Number(el.style.getPropertyValue('--i')) || 0),
    0
  );
  const collageStepSize = 1 / (collageMaxStep + 2); // +1 for last step, +1 headroom so it settles before section end

  const updateCollageScroll = () => {
    if (!collageSection || !collageItems.length) return;
    if (reduceMotionMq.matches) {
      collageItems.forEach((el) => {
        el.style.opacity = '';
        el.style.transform = '';
      });
      return;
    }
    const rect = collageSection.getBoundingClientRect();
    const vh = window.innerHeight;
    // Scroll range: from the moment the section's bottom enters the viewport
    // to the moment its bottom reaches the top (i.e. as it scrolls fully past).
    const start = rect.height + vh * 0.15;
    const end = vh * 0.4;
    const total = start - end;
    const scrolled = start - rect.top;
    const progress = total > 0 ? Math.min(1, Math.max(0, scrolled / total)) : 0;

    collageItems.forEach((el) => {
      const step = Number(el.style.getPropertyValue('--i')) || 0;
      const threshold = step * collageStepSize;
      // How far past this item's own threshold we are, normalized to one step's width.
      const local = Math.min(1, Math.max(0, (progress - threshold) / collageStepSize));
      const eased = local * local * (3 - 2 * local); // smoothstep for a smoother arrival
      el.style.opacity = String(eased);
      const translateY = 28 * (1 - eased);
      const scale = 0.94 + 0.06 * eased;
      el.style.transform = `translateY(${translateY}px) scale(${scale})`;
    });
  };
  updateCollageScroll();
  window.addEventListener('scroll', updateCollageScroll, { passive: true });
  window.addEventListener('resize', updateCollageScroll);

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
