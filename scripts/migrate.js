#!/usr/bin/env node
/**
 * Jalankan: npm run db:migrate
 *
 * Membutuhkan SUPABASE_ACCESS_TOKEN di .env.local
 * Buat token di: https://supabase.com/dashboard/account/tokens
 */

const fs   = require('fs')
const path = require('path')

// Baca .env.local secara manual (tanpa dotenv agar tidak perlu install tambahan)
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local')
  if (!fs.existsSync(envPath)) return
  fs.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    const [key, ...rest] = line.split('=')
    if (key && rest.length) process.env[key.trim()] = rest.join('=').trim().replace(/^"|"$/g, '')
  })
}

loadEnv()

const SUPABASE_URL    = process.env.NEXT_PUBLIC_SUPABASE_URL
const ACCESS_TOKEN    = process.env.SUPABASE_ACCESS_TOKEN

if (!SUPABASE_URL) {
  console.error('❌  NEXT_PUBLIC_SUPABASE_URL tidak ditemukan di .env.local')
  process.exit(1)
}
if (!ACCESS_TOKEN) {
  console.error('❌  SUPABASE_ACCESS_TOKEN tidak ditemukan di .env.local')
  console.error('   Buat token di: https://supabase.com/dashboard/account/tokens')
  console.error('   Lalu tambahkan ke .env.local: SUPABASE_ACCESS_TOKEN=your_token')
  process.exit(1)
}

// Ambil project ref dari URL (https://<ref>.supabase.co)
const PROJECT_REF = new URL(SUPABASE_URL).hostname.split('.')[0]

// Kumpulkan semua file migrasi
const MIGRATIONS_DIR = path.join(__dirname, '..', 'supabase', 'migrations')
const files = fs.readdirSync(MIGRATIONS_DIR)
  .filter(f => f.endsWith('.sql'))
  .sort()

async function runQuery(sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method:  'POST',
    headers: { 'Authorization': `Bearer ${ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify({ query: sql }),
  })
  return { ok: res.ok, body: await res.json() }
}

async function main() {
  console.log(`🔗  Project: ${PROJECT_REF}`)
  console.log(`📂  Migrations: ${files.length} file ditemukan\n`)

  for (const file of files) {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8').trim()
    if (!sql) continue

    process.stdout.write(`⏳  ${file} ... `)
    const { ok, body } = await runQuery(sql)

    if (ok) {
      console.log('✅  berhasil')
    } else {
      console.log('❌  gagal')
      console.error('   ', JSON.stringify(body))
    }
  }

  console.log('\n✨  Selesai.')
}

main().catch(err => { console.error(err); process.exit(1) })
