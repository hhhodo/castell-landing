# CASTELL Landing Page

One-page landing site for **CASTELL**, a fictional precision-manufacturing ("제조") brand — built as pixel-faithful reskin of a real Figma reference and deployed to GitHub Pages.

## Source design

- Figma fileKey `BrVaTxFSnaAlv6IT2ZRvhs`, node `184:520` ("기가비스 – GigaVis").
- Reference dump: React/Tailwind arbitrary-value JSX with exact measured px values (1920px desktop baseline).
- Grid, spacing, typography and section order are copied faithfully; every Tailwind arbitrary px value was converted 1:1 into this project's own `--cs-*` custom properties (no rounding) in `css/site.css`.

## What was fictionalized vs. GigaVis's real content, and why

| Area | GigaVis (real) | CASTELL (fictional) | Why |
|---|---|---|---|
| Brand/nav/footer logo | GigaVis wordmark + literal vector logo | "CASTELL" wordmark, simple "CS" monogram SVG | Can't reuse a real company's identity/vector logo |
| Stock ticker card | Live price `99,300 / +0.61%` `기가비스·420770·KOSDAQ` | Generic "회사 정보" card (설립연도 stat) | Instructed not to fabricate a real-looking stock ticker |
| Footer address/phone/CEO | Real Dongtan address, real phone/fax, real CEO name | Placeholder 오송(Osong) address, placeholder phone/fax, fictional CEO name "이도현" | Can't publish a real company's real contact info/person |
| News/notice items | Real GigaVis contract/press announcements | Same structure/count/date format, rewritten as fictional CASTELL equipment-supply/plant/audit announcements | Same shape and tone, no real corporate news reused |
| Hero & statement copy ("Beyond Inspection…") | GigaVis's own tagline/copy | Reworded in CASTELL's own voice, same tone/structure (precision optics/vision/automation/inspection) | Genuine rewrite, not find-replace |
| ESG section | GigaVis 지속가능경영 copy | Same concept/heading pattern, generic brand voice | Same reasoning |
| All photos (hero, device/AI/mobility, product lineup, ESG collage, news thumbnails, "No.1" dark card) | Real GigaVis photography | Neutral CSS placeholder boxes at the exact measured px size, labeled "이미지 준비중" | No real photography available/appropriate to reuse |
| Decorative icons (chevrons, "더 보기" arrow) | Figma vector icons | Redrawn as inline SVG matching the screenshot | Purely structural, not content — allowed to recreate |

## Buttons

Only **one** true button-styled element exists site-wide: the nav's **"문의하기"** (`.cs-btn`), linking to the footer `#contact` anchor. Everything else that was a button in the source (nav 로그인/무료로 시작하기) was removed or converted to plain text/links: footer nav links, IR/고객지원/인재채용 cards, news items, and "더 보기" are all plain `<a>` elements with no button chrome.

## Grid / measurement table (key px values, from the jsx, unrounded)

| Token | Value | Source |
|---|---|---|
| `--cs-container-hero` | 1857.02px | Hero container `184:534` |
| `--cs-container-statement` | 1757.18px | Statement container `184:1171` |
| `--cs-container-wordmark` | 1421.72px | Global/ESG/News container `184:628` |
| `--cs-gap-article` | 119.808px | Article row gap `184:1173` |
| `--cs-radius-article` | 19.968px | Figure radius `184:1174` |
| `--cs-fs-statement-h` / lh | 59.904px / 71.885px | `184:1168` |
| `--cs-fs-article-caption` | 43.93px / 52.715px | `184:1178` |
| `--cs-fs-wordmark` | 139.776px / 139.776px | `184:633` |
| `--cs-fs-stat-number` | 47.923px / 57.508px | `184:681` |
| `--cs-radius-card` | 7.987px | Info cards `184:675` |
| Product lineup grid | 435.30×559.09px items | `184:1163` |
| ESG collage columns | 360×417 / 320+230 / 454×700 / 238+335 / 360×470 | `184:1466`–`184:1481` |
| News grid cards | 334×233 image + text block | `184:1387` |
| Footer grid | 114.22px / 1fr / 125.8px cols, 59.904px padding | `184:949` |

Fluid scaling: headline-scale tokens use `clamp(min, Xvw, tokenPx)` where `X = tokenPx ÷ 19.2` (the 1920px→100vw conversion), matching the sibling `reconers-landing` pattern. Every font-size/line-height/letter-spacing value in the CSS traces back to either a `--cs-*` var (this file) or the shared `css/styles.css` kit — no magic numbers.

## Color tokens (`css/site.css`)

`--cs-dark` `#04060e`, `--cs-blue-product` `#054da2`, `--cs-blue-accent` `#1677ff`, `--cs-card-bg` `#e6edf6`, `--cs-card-border` `#cddbec`, `--cs-dark-card` `#1a1a1a`, `--cs-text` `#111`, `--cs-text-muted` `#535455`, `--cs-text-faint` `#6e7072`, `--cs-text-faint-2` `#8a8c8e`, `--cs-text-faint-3` `#a1a3a5`, `--cs-divider` `#e8e8e8`, `--cs-news-border` `#d0d1d2` — all lifted verbatim from the measured Figma hex values, no flattening to grayscale.

Shared kit tokens reused as-is: `--color-placeholder` (`#d9d9d9`, aliased as `--cs-placeholder`), `--fw-strong`/`--fw-base`, `--radius-circle`, `--fs-badge`.

## Placeholder-image rationale

No real CASTELL photography exists (fictional brand). Every photo/screenshot slot from the source design (hero, 3 statement articles, full-bleed solution image, 6 product-lineup tiles, 5 ESG collage tiles, "No.1" dark card, 4 news thumbnails) is a flat `--cs-placeholder` (`#d9d9d9`) box sized to the exact measured px dimensions, labeled "이미지 준비중". Purely decorative vectors (list-item chevrons, "더 보기" arrow) were redrawn as small inline SVGs instead of left as placeholders, since they're structural, not photographic content.

## Files

- `index.html` — page markup, all 8 sections
- `css/styles.css` — shared design-kit file, copied byte-identical from `reconers-landing`, not modified
- `css/site.css` — CASTELL-specific `--cs-*` tokens and components
- `js/main.js` — sticky nav + IntersectionObserver scroll-reveal (copied pattern from `reconers-landing/js/main.js`)
- `.github/workflows/deploy.yml` — GitHub Pages Actions deploy, same pattern as sibling repos
