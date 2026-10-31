# Frontend (Next.js 16 + TypeScript)

## Setup
```bash
npm install
copy .env.example .env.local   # macOS/Linux: cp .env.example .env.local
npm run dev                    # http://localhost:3000
npm run typecheck              # check all TypeScript types
npm run build && npm start     # production
```
The backend must be running (see ../backend/README.md). Create an account at `/register`.

> **Linting:** ESLint is not set up yet because `typescript-eslint` does not support TypeScript 7 (support is planned for 7.1).
> `npm run typecheck` and `npm run build` already catch type errors. Add `eslint-config-next` back once typescript-eslint supports TS 7.

## Security features
| Threat | Protection | Where |
|---|---|---|
| Visiting private pages without logging in | The home page (`/`), `/login` and `/register` are public; every other page redirects to `/login`, and also re-checks with the backend (`requireUser`) | `src/proxy.ts`, `lib/session` |
| XSS | Strict Content-Security-Policy with a fresh nonce per request; React escapes all output | `src/proxy.ts` |
| Clickjacking / sniffing / leaks | `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, HSTS (production) | `next.config.ts` |
| Token theft | The session cookie is `HttpOnly` - JavaScript (and so XSS) can never read it; nothing in localStorage | backend |
| CSRF / CORS | The browser only talks to its own origin (`/api` proxy); requests carry `X-Requested-With` | `next.config.ts`, `lib/api` |
| Secrets in the browser | Server-only env vars (no `NEXT_PUBLIC_`); `server-only` package stops server code reaching client bundles | `lib/serverApi` |
| Cached private pages | `Cache-Control: no-store`, all pages dynamic | `src/proxy.ts`, `app/layout.tsx` |
| Info leaks | `X-Powered-By` removed | `next.config.ts` |

## Imported from the reference repo (hero, top navigation, dashboard)
Designed from https://github.com/web-braindevlop/gcse_frontend and ported to this project's CSS modules
(that repo uses Tailwind; this one does not). Colours live in `styles/globals.css` as `--ec-*` tokens.

- **Hero** - `components/home/HeroSection` + `HeroImageSlider` (accessible carousel: auto-rotates, pauses on
  hover/focus, play/pause button, previous/next, dots, no rotation for reduced-motion). Slide text:
  `HeroImageSlider/heroSlides.ts`. Pictures: `public/images/home/`.
- **Top navigation** - `components/navigation/TopNavigation`. Pass typed `items` and an `actions` slot; it has a
  current-page pill, a mobile menu, Escape-to-close and a skip link to `#main-content`.
  `components/layout/Header` supplies the links.
- **Account menu** - in the dashboard header the round initial opens a small drop-down that holds only **Log out** (no name or email inside it).
  `components/navigation/AvatarMenu` - closes with Escape or a click elsewhere, arrow keys move between items.
- **Dashboard** - `/dashboard` (Overview), `/dashboard/items`, `/dashboard/subjects`. Frame:
  `components/dashboard/DashboardShell` (sidebar + header). Needs login. The reference repo's teacher/admin pages
  (content manager, student directory) need roles that this back-end does not have, so only the student side is included.
- The earlier soft menu styles (`SegmentedNav`, `BubbleNav`, `DotNav`, `MobileMenu`, `NavMenu`, `Logo`) are no longer
  used by the header.

## Tutor area (tutors and admins)
The tutor area is **not linked from anywhere** on the website (not in the menu, the footer, or the student sign-in). Tutors and admins use a
direct link that you give them.

- **Sign-in link:** `/login/tutor` by default. For better protection set `TUTOR_LOGIN_PATH` in `frontend/.env.local` to something hard to guess, e.g.
  `TUTOR_LOGIN_PATH=/portal-k3x9q`, then restart. The normal `/login/tutor` then behaves like any page that does not exist. (Server-side setting, see `src/proxy.ts`.)
  `/login/tutor` is easy to guess, so a custom address is recommended for real use.
- **Nothing reveals it:** a signed-out visitor opening any `/tutor/dashboard...` page is sent to the **home page** (never to the tutor sign-in, which would point at it).
  This also covers the Back button after Log out and an expired session. A signed-in student sees "Page not found". The pages are marked `noindex` so search engines skip them.
  The tutor sign-in page has no links to the student pages.
- **Dashboard:** `/tutor/dashboard` (overview), `/tutor/dashboard/students` (searchable directory), `/tutor/dashboard/accounts` (admins only).
- **Who goes where:** after signing in each role is sent to its own dashboard (`lib/roles`). Tutor opening `/dashboard` are sent to the tutor area; a tutor opening an
  admin page goes back to the overview. Guards: `requireStudent / requireTutor / requireAdmin` in `lib/session`.
- Tutor accounts are created from the command line (see the back-end README). The back-end checks the role again on every request, so hiding a link is never the only protection.
- **Please note:** a hidden address is an extra layer, not the main lock. The real protection is the strong password, the rate limit (10 sign-in attempts / 15 min) and the role checks.

## Toast notifications
```tsx
const toast = useToast();            // import { useToast } from "@/hooks/useToast"
toast.success("Case file successfully updated.");
toast.error("Document upload failed - try again.");
toast.warning("Deadline approaching - review needed.");
toast.info("New legal update available.");
toast.success("Saved", { title: "Item saved", duration: 800 });   // optional title / shorter duration (ms, max 1200)
```
Cards stack in the top-right and have a close button. **Every toast disappears by itself after about 1.4 seconds (never more than 1.5)** - a longer `duration` is
cut down to that limit, and a toast never waits for the mouse. The limit is `TOAST_MS` in `components/ui/ToastProvider`.

The **Refresh** button in the dashboard header names the page you are on: "Your overview is up to date", "Your student pages are up to date",
"Your items are up to date", "Your subjects are up to date", "Your tutor accounts are up to date" (see `headingFor` in `components/dashboard/DashboardHeader`).

## Login card colours
Measured from the reference design: top `#cef3fd`, info panel `#f0fcf6` (border `#c8ebd6`, label `#15803d`), title `#121413`, subtitle `#6b7280`,
field `#f1f4f7`, dark button `#1e1f24`. The card background fades smoothly from `#cef3fd` into white using the reference's own curve, so there is
no visible edge (largest step between neighbouring points: 5 colour levels, same as the reference). This is the ONE place a gradient is allowed.
It lives in `components/auth/AuthCard`; the green panel is `AuthNotice`.

## Design rules
No gradients anywhere: use flat colours from `styles/globals.css` (`--primary`, `--primary-soft`, ...). The only exception is the fade on the login card (see above).

## Folder structure
```
src/
  proxy.ts      Route protection + Content-Security-Policy (called "middleware" before Next 16)
  types/        Shared TypeScript types (User, Item, Subject...)
  app/          Routes only (App Router). Each folder = a URL; page.ts is thin.
                (site)/ = pages with header + footer, (auth)/ = login/register with the full-screen photo,
                dashboard/ and tutor/dashboard/ = pages with the sidebar layout
  views/        One folder per page (HomePage/, ItemsPage/, LoginPage/, RegisterPage/)
  components/   One folder per component (Component.tsx + .module.css + index.ts)
    auth/       AuthShell/, AuthBackground/, AuthCard/, AuthNotice/, AuthForm/, AuthDivider/ (login + register)
    layout/     SiteShell/, Header/, Footer/
    tutor/      StudentDirectory/, TutorAccountsTable/
    dashboard/  DashboardShell/, DashboardSidebar/, DashboardHeader/, SummaryCard/, ShortcutCard/, RecentItems/, SubjectsGrid/
    navigation/ TopNavigation/ (the header bar), AvatarMenu/ (round initial drop-down with Log out), UserMenu/, LogoutButton/  (older soft styles also here, unused)
    ui/         Button/, Alert/, FadeIn/, Reveal/, WordReveal/, CountUp/, HoverCard/, ScrollProgress/,
                Toast/, ToastContainer/, ToastProvider/, TextField/, Avatar/, Stagger/, StaggerItem/, ...
    home/       The home page sections: ShapesBackground/, HeroSection/, HeroVisual/, StatsBand/,
                SubjectsMarquee/, FeatureGrid/, HowItWorks/, CallToAction/ ...
    items/      ItemForm/, ItemList/
  hooks/        One folder per hook (useAsync/, useSubjects/)
  lib/          config/, api/ (browser fetch), serverApi/ (server fetch), session/ (current user)
  services/     authService/, itemService/ - call the Express API
  styles/       Global CSS
  utils/        One folder per helper (formatDate/)
public/         Static files: images/login-background.webp (login photo), images/logo.png (header logo),
                images/home/ (hero slider pictures). src/proxy.ts lets image files through without login.
                (src/proxy.ts lets image files through without login - needed for that photo.)
```
Imports use the `@/` alias, e.g. `import Button from "@/components/ui/Button"`.
