// Deploys dist/ to the PERSONAL Vercel account named in app/.env.deploy — never the machine's
// global Vercel login. Refuses to run without both variables so it can't fall back to that login.
import { readFileSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
const envPath = new URL('../.env.deploy', import.meta.url)
if (!existsSync(envPath)) {
  console.error('app/.env.deploy is missing. Create it with VERCEL_TOKEN=… and VERCEL_SCOPE=… (see docs/DEPLOY.md).'); process.exit(1)
}
const env = Object.fromEntries(readFileSync(envPath, 'utf8').split('\n').filter(l => l.includes('=') && !l.startsWith('#')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] }))
if (!env.VERCEL_TOKEN || !env.VERCEL_SCOPE) { console.error('.env.deploy needs both VERCEL_TOKEN and VERCEL_SCOPE.'); process.exit(1) }
const args = ['vercel', 'deploy', 'dist', '--prod', '--yes', '--token', env.VERCEL_TOKEN, '--scope', env.VERCEL_SCOPE, '--name', 'learn-slovak']
console.log('deploying dist/ to Vercel scope', env.VERCEL_SCOPE, '…')
const r = spawnSync('npx', args, { stdio: 'inherit', env: { ...process.env, VERCEL_TOKEN: env.VERCEL_TOKEN } })
process.exit(r.status ?? 1)
