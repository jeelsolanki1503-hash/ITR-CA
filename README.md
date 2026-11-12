# ITR for CAs — hi-fi prototype

The Chartered Accountant side of ITR, built from the Figma file *ITR – CAs flow* (pages **CA Desktop Flow v2**, **CA Mobile Flow v2**), styled with the **Design System** page and the **Hi-fi Screens** examples. It shares tokens, components and motion with the taxpayer prototype, so the two read as one product.

Vanilla HTML, CSS and ES modules. No framework, no build step, no runtime dependencies (Inter + Roboto Mono from Google Fonts only).

## Run locally

```bash
python3 -m http.server 8000
```

Open http://localhost:8000/. Any static server works. (On a machine without Python, `.claude/serve.ps1` in the parent folder serves this folder on port 8766.)

## Deploy to GitHub Pages

1. Push this folder's contents to `main` of a repo.
2. Settings → Pages → Deploy from branch → `main` / `/ (root)`.
3. Open `https://<user>.github.io/<repo>/`.

All paths are relative, `.nojekyll` is present, and `404.html` is a byte-for-byte copy of `index.html` so deep links survive a refresh.

## Demo paths

| Path | How | What you see |
|---|---|---|
| Returning CA (busy season) | Welcome → **Log in** (any password) or **Continue with Google/Apple** | Deepak Mehta with 23 clients: 3 not started, 6 in progress, 2 need correction, 12 complete |
| First-time CA | Welcome → **Create account** | Practice setup → invite a client → live first-time dashboard |
| Login error | Log in with password `wrong` | M-01b wrong-password state |
| Clients can't load | Open `#/clients?error=1` | M-04i error state |
| Reset | Settings → Log out | Back to the welcome screen with fresh data |

Simulated clients make the prototype feel live: an invited client accepts after ~6 s, uploads every document ~8 s after you send the checklist, and re-uploads a flagged document ~9 s after you flag it. Each arrives as a toast and updates every screen.

## Screens built (Figma frame → route)

| Figma | Route |
|---|---|
| M/D-00 CA Welcome | `#/welcome` |
| M/D-01, 01b CA Login · wrong password | `#/login` |
| — (inferred: Welcome links to it, no frame exists) | `#/create` |
| M/D-02, 02b Practice setup · solo / team | `#/practice-setup` |
| M/D-19b–f Add your clients (empty, typed, invalid, already invited, invite sent) | `#/add-clients` |
| M/D-00b–h First-time dashboard states, M/D-03 Dashboard | `#/dashboard` |
| M/D-04, 04a–o Clients (all filters, search, no results, loading, empty, invited) | `#/clients` |
| M/D-05, 05a–j, 20, 22, 24, 26, 28 Client profile states | `#/clients/:id` |
| M/D-09, 09b–d, 21, 21b Checklist (auto-suggested, empty, item added, duplicate) | `#/clients/:id/checklist` |
| M/D-13, 13b, 25, 25b Review documents (+ flagged) | `#/clients/:id/review` |
| M/D-13a, 13c, 25a View document (+ can't preview) | `#/clients/:id/review/:docId` |
| M/D-14, 14b, 27 Flag a document (+ note missing) | `#/clients/:id/flag/:docId` |
| M/D-10 Assisted mode · physical collection | `#/clients/rahul/assisted` |
| M/D-06, 07 New requirement + send explanation | `#/clients/:id/requirement` |
| M/D-15 Client closed | `#/clients/:id/closed` |
| M/D-11 Requests sent tracking, M/D-12 escalating reminder (sheet) | `#/tracking` |
| M/D-16 Export | `#/export` |
| M/D-17, 17b, 17c Settings, practice details, team access | `#/settings`, `/practice`, `/team` |
| M/D-18 Season closed | `#/season-closed` |
| Overlays: toasts, sheets (invite a client, add a document) | everywhere |

Navigation matches the design: Dashboard · Clients · Export · Settings, as a bottom tab bar below 768 px and a sidebar (icon rail at 768–1023, full at 1024+).

## Brand

The CA mark keeps the taxpayer tile (same gradient, radius and proportions) and swaps the single document for a lined client file with a teal "verified" badge, the CA's job in one glyph. The 2 s splash builds it: tile lands, file slides in, lines draw, badge pops, tick draws, wordmark and tagline follow. Click, Enter, Space or Escape skips it; reduced-motion shows it static.

## Assets handoff

| Where in the UI | Path | Format | Size |
|---|---|---|---|
| App logo | `assets/logo.svg` | SVG | 128 × 128 |
| Favicon | `favicon.svg` | SVG | 512 × 512 |
| iOS touch icon | `apple-touch-icon.png` (not supplied) | PNG | 180 × 180 |
| Social preview | `assets/og.png` (not supplied) | PNG | 1200 × 630 |

## Responsive QA

| Width | Result |
|---|---|
| 320 | Pass. No page-level horizontal scroll on any route; status filters scroll inside their own strip |
| 375 | Pass. Tab bar, sticky CTA bars, sheets slide up |
| 768 | Pass. Icon rail sidebar, glass header, dialogs centred |
| 1024 | Pass. Full sidebar, 4-up status tiles, table-style client list |
| 1440 | Pass. Two-column dashboard/client profile, content capped at 1200 px |

Checked in Chromium only. WebKit/Firefox and Lighthouse were not run.

## Additions the Figma frames don't show

- **Client name on invites.** Requested after the first review. The invite sheet and Add your clients both require a name plus an email or phone number.
- **Create account form.** Welcome links to it but no frame exists.
- **Show all link and document pager.** "Show all" on the clients list and the previous/next arrows on the document viewer.

## Not built / out of scope

- Real authentication, file storage and exports (all simulated).
- News articles and Help & support open a toast instead of a page.
- Social sign-in is a mock that logs you in as the demo CA.
