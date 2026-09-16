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

    // "own" incoming-rise progress per article (0 = still waiting below viewport,
    // 1 = fully landed at translateY(0)). Article 0 starts already landed.
    const ownEased = new Array(n).fill(0);
    ownEased[0] = 1;
    for (let i = 1; i < n; i++) {
      const local = Math.min(1, Math.max(0, value - (i - 1)));
      ownEased[i] = smoothstep(local);
    }

    statementArticles.forEach((el, i) => {
      const copy = el.querySelector('.cs-article__copy');
      if (i === 0) {
        el.style.transform = 'translateY(0)';
      } else {
        // Use vh (viewport-relative), not % (own-element-relative): the article's own
        // height is set by its image aspect-ratio, which is far shorter than the 100vh
        // pinned viewport, so a %-based translate only pushed "hidden" articles down by
        // their own height — leaving them still partially inside the viewport, stacked
        // behind/beside the active article. Translating by vh guarantees the inactive
        // article's box fully clears the sticky viewport regardless of its own content
        // height.
        const translateY = 100 * (1 - ownEased[i]);
        el.style.transform = `translateY(${translateY}vh)`;
      }
      // The image side self-hides correctly once stacked: a later article's opaque
      // photo physically covers the earlier one at the same resting position. But
      // .cs-article__copy has no background — once two articles land at the same
      // spot, both captions render at full opacity on top of each other (the reported
      // bug: all 3 paragraphs visible/overlapping at once). The caption text is
      // structurally a sibling of the figure within the same .cs-article, but visually
      // needs independent show/hide logic instead of relying on the image's opaque
      // cover-up. Crossfade each article's own caption in via its own ownEased, and
      // fade it back out as soon as the next article starts landing on top of it, so
      // at any scroll position only the current front (or actively transitioning)
      // caption is visible.
      if (copy) {
        const successorEased = i + 1 < n ? ownEased[i + 1] : 0;
        const copyOpacity = Math.max(0, Math.min(1, ownEased[i] * (1 - successorEased)));
        copy.style.opacity = String(copyOpacity);
      }
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

  // ESG collage: sticky-pin scroll track (same technique as the statement
  // crossfade / wordmark fill above) — .cs-collage-track is a tall (180vh)
  // wrapper and .cs-collage itself is position:sticky inside it, so the
  // section holds still on screen for the track's scroll distance while
  // progress goes 0->1, instead of the reveal racing past as the section
  // simply scrolls through the viewport in normal flow. Each item still has
  // its own reveal threshold along that 0–1 progress (center item first,
  // then next-out, then outermost), staggered via --i as before; only the
  // progress *input* changed, not the reveal/easing logic itself.
  const collageTrack = document.querySelector('.cs-collage-track');
  const collageSection = document.querySelector('[data-collage-reveal]');
  const collageItems = collageSection
    ? Array.from(collageSection.querySelectorAll('.cs-collage__item'))
    : [];

  // Reveal sequencing: the center item (--i:0) gets its own dedicated early
  // phase of the scroll range — only it is visible/settling while every
  // other item stays fully hidden. Only after the center item has fully
  // arrived (plus a short hold) does progress start unlocking the next
  // steps outward (--i:1, then --i:2, ...), each still grouped/staggered by
  // --i as before, just sequenced into distinct non-overlapping windows
  // instead of all steps starting to reveal from scroll-start.
  const collageSteps = Array.from(
    new Set(collageItems.map((el) => Number(el.style.getPropertyValue('--i')) || 0))
  ).sort((a, b) => a - b);

  const CENTER_WIDTH = 0.32; // portion of progress devoted solely to the center item settling
  const HOLD_WIDTH = 0.08;   // pause after the center settles, before outward reveal begins
  const outerStepsCount = Math.max(1, collageSteps.length - 1);
  const outerWidth = (1 - CENTER_WIDTH - HOLD_WIDTH) / outerStepsCount;

  const collageStepRanges = new Map();
  collageSteps.forEach((step, idx) => {
    if (idx === 0) {
      collageStepRanges.set(step, [0, CENTER_WIDTH]);
    } else {
      const start = CENTER_WIDTH + HOLD_WIDTH + (idx - 1) * outerWidth;
      collageStepRanges.set(step, [start, start + outerWidth]);
    }
  });

  const updateCollageScroll = () => {
    if (!collageTrack || !collageSection || !collageItems.length) return;
    if (reduceMotionMq.matches) {
      collageItems.forEach((el) => {
        el.style.opacity = '';
        el.style.transform = '';
      });
      return;
    }
    // Progress driven by the track's own position, same technique as
    // updateStatementScroll/updateWordmarkScroll: 0 until the track's sticky
    // point is reached (so the reveal can't start early), 1 once the track's
    // scroll distance is exhausted (so the pin releases with the reveal
    // already fully resolved).
    const rect = collageTrack.getBoundingClientRect();
    const vh = window.innerHeight;
    const scrollable = rect.height - vh;
    const progress = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0;

    collageItems.forEach((el) => {
      const step = Number(el.style.getPropertyValue('--i')) || 0;
      const [rangeStart, rangeEnd] = collageStepRanges.get(step) || [0, 1];
      // How far through this item's own window we are — items outside their
      // window (progress hasn't reached rangeStart yet) stay at local 0, i.e.
      // fully hidden, regardless of how far along later steps' windows are.
      const local = Math.min(1, Math.max(0, (progress - rangeStart) / (rangeEnd - rangeStart)));
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

  // "No.1 to the world" dark card: scroll-driven scale-to-fullscreen. Unlike the
  // wordmark/statement tracks, this card stays a normal-sized grid item at all times
  // (giving it 200vh+ of height would stretch the whole 3-column grid row via
  // align-items:stretch). Instead, .cs-dark-card-spacer is a plain sibling block after
  // .cs-info-grid that exists purely to supply extra scroll distance, and progress is
  // computed from its position the same way .cs-collage computes fly-in progress from
  // its own section rect (start/end window, no artificial sticky pin needed).
  // A position:fixed overlay clone is then interpolated every tick from the *live*
  // getBoundingClientRect() of the real in-grid card to the full viewport box — using
  // real width/height/top/left rather than transform:scale avoids all transform-origin
  // math, and re-reading the card's live rect each frame means the overlay always starts
  // seamlessly wherever the card actually is on screen, so no fragile frozen-snapshot
  // alignment is needed.
  const darkCard = document.getElementById('dark-card');
  const infoGrid = document.querySelector('.cs-info-grid');
  const darkCardSpacer = document.querySelector('.cs-dark-card-spacer');
  const darkCardOverlay = document.getElementById('dark-card-overlay');
  const darkCardOverlayTagline = darkCardOverlay ? darkCardOverlay.querySelector('.cs-dark-card-overlay__tagline') : null;
  const darkCardRadius = darkCard ? parseFloat(getComputedStyle(darkCard).borderRadius) || 0 : 0;
  const lerp = (a, b, t) => a + (b - a) * t;

  const updateDarkCardScroll = () => {
    if (!darkCard || !darkCardSpacer || !darkCardOverlay || reduceMotionMq.matches) return;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const spacerRect = darkCardSpacer.getBoundingClientRect();
    const cardRect = darkCard.getBoundingClientRect();

    // Growth must be driven by the CARD's own live position, not by a hold
    // distance measured off the grid section and a fixed vh amount — that
    // used to assume the card stayed short (min-height:441px). Now that the
    // card stretches (align-items:stretch) to match its taller sibling
    // columns, a fixed vh*1.0 hold is no longer guaranteed to end while the
    // card is still on screen: for a card taller than roughly (vh - 1
    // viewport), the hold alone can outlast the card's entire visible
    // window, so growth would only ever start once the card has ALREADY
    // scrolled fully off the top of the viewport — producing a sudden
    // "flies in from off-screen top while enlarging" jump instead of a
    // smooth grow-from-resting-position, because the overlay's very first
    // active frame already has a deeply negative cardRect.top.
    //
    // Fix: key the settle/hold/grow phases off cardRect.top itself, scaled
    // to how much of the viewport the card actually occupies, so the
    // window always ends while the card is still comfortably visible,
    // regardless of its resting height.
    const visibleSpan = Math.max(0, vh - cardRect.height); // scroll room while the card fits fully on screen
    // Settle-in: don't start counting until the card has scrolled up into
    // (or past) that fully-visible window at all, so the effect can't fire
    // while the section is still below the fold (same guard the old
    // grid-based gate provided).
    const scrolledPastSettle = Math.max(0, visibleSpan - cardRect.top);
    // Hold: let the user see the resting card for roughly half of its own
    // fully-visible scroll window before growth begins — this scales with
    // the card's real height instead of a fixed vh figure, so it can never
    // overrun past the point where the card has left the viewport.
    const holdDistance = visibleSpan * 0.5;
    // Grow: complete shortly after the card's top would have reached the
    // very top of the viewport, so the overlay finishes expanding to
    // fullscreen while the real card is still at least partially in view —
    // never starting from an already off-screen box.
    const growDistance = Math.max(vh * 0.35, visibleSpan * 0.5 + cardRect.height * 0.25);
    const rawProgress = Math.min(1, Math.max(0, (scrolledPastSettle - holdDistance) / growDistance));
    const isActive = rawProgress > 0.001 && spacerRect.bottom > 0;

    darkCard.classList.toggle('is-eclipsed', isActive);
    darkCardOverlay.classList.toggle('is-active', isActive);

    if (!isActive) {
      if (darkCardOverlayTagline) darkCardOverlayTagline.classList.remove('is-visible');
      return;
    }

    const eased = smoothstep(rawProgress);

    const left = lerp(cardRect.left, 0, eased);
    const top = lerp(cardRect.top, 0, eased);
    const width = lerp(cardRect.width, vw, eased);
    const height = lerp(cardRect.height, vh, eased);
    const radius = lerp(darkCardRadius, 0, eased);

    darkCardOverlay.style.left = `${left}px`;
    darkCardOverlay.style.top = `${top}px`;
    darkCardOverlay.style.width = `${width}px`;
    darkCardOverlay.style.height = `${height}px`;
    darkCardOverlay.style.borderRadius = `${radius}px`;

    if (darkCardOverlayTagline) {
      darkCardOverlayTagline.classList.toggle('is-visible', rawProgress > 0.78);
    }
  };
  updateDarkCardScroll();
  window.addEventListener('scroll', updateDarkCardScroll, { passive: true });
  window.addEventListener('resize', updateDarkCardScroll);
})();
