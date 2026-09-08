# Deploying — free, and independent of the laptop

The app is a static PWA. Nothing runs on a server: progress lives in the phone's IndexedDB and is
backed up with **Settings → Export JSON**. So any static host works; we use **Vercel Hobby**
(free): private, 100 GB/month transfer, ≤ 15,000 files and ≤ 100 MB per CLI upload — the current
build is ~1,300 files / ~20 MB.

The build cannot run on Vercel's CI (it needs Python + Piper for audio), so we **build on the
laptop and upload the finished folder**. Once uploaded, the site stays up with the laptop off.

## One-time setup (you, ~3 minutes)

```bash
cd app
npx vercel login          # opens the browser; use your Vercel account (GitHub sign-in is fine)
npx vercel link --yes     # creates the project "learn-slovak-app" in your account
```

## Every release

```bash
cd app
npm run deploy            # = export content → build → vercel deploy dist --prod
```

Prints the production URL (something like `https://learn-slovak-app.vercel.app`). On the phone:
open it in Safari/Chrome → *Add to Home Screen*. From then on it launches like an app, works
offline for every unit you have opened once, and updates itself on the next launch.

## What `npm run deploy` does

1. `pipeline.export_app_content` — regenerates `app/public/content/*.json` and copies **only the
   audio clips the lessons reference** (not all 5,500) into `app/public/audio/`.
2. `tsc -b && vite build` — type-checks and bundles; the PWA plugin writes `sw.js` with:
   precached shell; `/audio/*` cache-first for a year; `/content/*` stale-while-revalidate.
3. copies `vercel.json` into `dist/` (SPA rewrites, immutable cache headers on audio, `noindex`).
4. `vercel deploy dist --prod --yes`.

## Keeping it private-ish

The URL is unlisted and served with `X-Robots-Tag: noindex` + a `noindex` meta tag. That keeps
crawlers out but is not authentication. If you ever want a real lock: Vercel *Deployment
Protection → Password* is a paid feature; free alternatives are Cloudflare Access in front of a
custom domain, or simply not sharing the URL. Nothing in the app is secret except your progress,
which never leaves the phone anyway.

## Fallbacks

- **Cloudflare Pages** (`npx wrangler pages deploy dist`): unlimited bandwidth, 20k files, 25 MB
  per file, also free and CI-less. Same `dist/`, no code change.
- **GitHub Pages**: needs a public repo on the free plan — avoid, because the frequency counts and
  the SAS syllabus are non-commercial/research-licensed and should not be republished openly.

## Phone notes

- **iPhone**: Safari PWA supports IndexedDB, service workers, `MediaRecorder`; Web Speech
  recognition is limited. Storage for a Home-Screen app is persistent, but export your progress
  every couple of weeks anyway.
- **Android**: Chrome — everything works; Web Speech API available for the speaking exercises
  when we add them.
- Audio autoplays only after your first tap in a session (browser rule); the app's ▶ button is
  always there as the fallback.
