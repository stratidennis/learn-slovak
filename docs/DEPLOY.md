# Deploying — free, and independent of the laptop

The app is a static PWA. Nothing runs on a server: progress lives in the phone's IndexedDB and is
backed up with **Settings → Export JSON**. So any static host works; we use **Vercel Hobby**
(free): private, 100 GB/month transfer, ≤ 15,000 files and ≤ 100 MB per CLI upload — the current
build is ~1,300 files / ~20 MB.

The build cannot run on Vercel's CI (it needs Python + Piper for audio), so we **build on the
laptop and upload the finished folder**. Once uploaded, the site stays up with the laptop off.

## Keep it personal — not the synaicore account

This laptop's Vercel CLI is signed in to a work account. This project must never deploy there.
Vercel's CLI keeps **one** global login per machine, so we do not switch it — we pass a **personal
token** on every command instead. Nothing about the work login changes.

### What you set up (once, ~10 minutes)

1. **A personal Vercel account.** vercel.com → Sign Up with a *personal* e-mail (not the GitHub
   account if that one is tied to work). Hobby plan, free, non-commercial. Note your account
   slug — it is the URL path at `vercel.com/<slug>`.
2. **A token.** vercel.com → Account Settings → **Tokens** → Create. Scope: your personal
   account. Expiry: whatever you like. Copy it once.
3. **Put it where only the deploy script reads it.** Create `app/.env.deploy` (gitignored) with:
   ```
   VERCEL_TOKEN=paste-the-token-here
   VERCEL_SCOPE=your-personal-slug
   ```
   Do this yourself; I should not see or handle the token.
4. *(Optional but recommended)* **A personal GitHub account + a private repo** for backup of the
   source. Create the repo empty, then:
   ```bash
   git remote add origin git@github.com:<you>/learn-slovak.git
   git push -u origin main
   ```
   The current `gh` login on this machine is `dennis-stratinski` — if that is a work identity,
   use `gh auth login` with the personal one first, or push over HTTPS with a personal PAT.

That is everything. From then on `npm run deploy` uses the token and scope from `.env.deploy`
and touches no other account.

## One-time setup (you, ~3 minutes)

```bash
cd app
npm run deploy            # first run creates the project "learn-slovak" in YOUR account
```
(no `vercel login` — the token in `.env.deploy` is the only credential used)

## Every release

```bash
cd app
npm run deploy            # = export content → build → vercel deploy dist --prod
```

Production URL: **https://learn-slovak-tau.vercel.app** (the team-scoped `…-projects.vercel.app` URL redirects to Vercel SSO — that is deployment protection on non-production URLs, expected). On the phone:
open it in Safari/Chrome → *Add to Home Screen*. From then on it launches like an app, works
offline for every unit you have opened once, and updates itself on the next launch.

## What `npm run deploy` does

1. `pipeline.export_app_content` — regenerates `app/public/content/*.json` and copies **only the
   audio clips the lessons reference** (not all 5,500) into `app/public/audio/`.
2. `tsc -b && vite build` — type-checks and bundles; the PWA plugin writes `sw.js` with:
   precached shell; `/audio/*` cache-first for a year; `/content/*` stale-while-revalidate.
3. copies `vercel.json` into `dist/` (SPA rewrites, immutable cache headers on audio, `noindex`).
4. `vercel deploy dist --prod --yes --archive=tgz --token $VERCEL_TOKEN --scope $VERCEL_SCOPE --name learn-slovak`
   with both variables read from `app/.env.deploy`. **`--archive=tgz` is not optional:** Hobby caps
   API file uploads at 5,000 per 24 hours (`api-upload-free`), and one per-file deploy of this app is
   ~2,800 files. The tarball counts as one upload; the 15,000-file / 100 MB limits still apply to the
   extracted output (we are at ~2,800 files / ~50 MB).

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
