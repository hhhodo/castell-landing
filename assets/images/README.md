# CASTELL image slots

Drop each downloaded photo into this folder using the exact filename below,
matching every current placeholder (`이미지 준비중 (WxH)`) box in `index.html`,
in page order. Dimensions are the exact pixel size the placeholder label
declares (or the CSS `aspect-ratio` for the ESG collage). Once files are
dropped in, replacing each `.../ 이미지 준비중 ... />` placeholder `<div>` with
an `<img src="assets/images/<filename>">` is a fast find-and-replace — a
`TODO(image): assets/images/<filename>` comment is already left next to each
slot in index.html.

| # | Section | Slot | Filename | Size (px) |
|---|---------|------|----------|-----------|
| 1 | Hero | full-bleed background | `hero.jpg` | 1920×1080 |
| 2 | Statement ("정밀을 넘어, 완벽을 향하여") | Article 1 — 디바이스 | `statement-1.jpg` | 978×599 |
| 3 | Statement | Article 2 — AI | `statement-2.jpg` | 978×599 |
| 4 | Statement | Article 3 — 모빌리티·로보틱스 | `statement-3.jpg` | 978×599 |
| 5 | Solution (full-bleed) | product/solution shot | `solution.jpg` | 1922×1081 |
| 6 | Global (워드마크 + 정보 카드) | dark "No.1 to the world" card background | `no1-dark.jpg` | fills its grid column × 441px min-height (no fixed label in the reference; export at least 900×441, will be object-fit: cover) |
| 7 | ESG (지속가능경영) collage | column 1 item | `esg-1.jpg` | 360×417 |
| 8 | ESG collage | column 2, item 1 (top) | `esg-2.jpg` | 360×320 |
| 9 | ESG collage | column 2, item 2 (bottom) | `esg-3.jpg` | 360×230 |
| 10 | ESG collage | column 3 (wide, center) | `esg-4.jpg` | 454×700 |
| 11 | ESG collage | column 4, item 1 (top) | `esg-5.jpg` | 360×238 |
| 12 | ESG collage | column 4, item 2 (bottom) | `esg-6.jpg` | 360×335 |
| 13 | ESG collage | column 5 item | `esg-7.jpg` | 360×470 |
| 14 | News (뉴스룸) | card 1 — 日 반도체 기판업체 계약 | `news-1.jpg` | 334×233 |
| 15 | News | card 2 — 중국 반도체 기판 제조사 계약 | `news-2.jpg` | 334×233 |
| 16 | News | card 3 — 오송 신공장 준공 | `news-3.jpg` | 334×233 |
| 17 | News | card 4 — 반도체장비 해외 수주 | `news-4.jpg` | 334×233 |

Notes:
- The ESG collage sizes above are the exact px labels/`aspect-ratio` values
  currently on each `.cs-collage__item` in `index.html` (page order,
  top-to-bottom, left-to-right by column). The CSS column width is scaled to
  450/568px via `--cs-container`, so images should be shot/cropped close to
  their listed aspect ratio and will be displayed via `object-fit: cover`
  once wired up.
- Do not add `<img>` tags yet — only this reference + the `TODO(image)`
  comments in `index.html` exist so far. Wiring them up is a follow-up step.
