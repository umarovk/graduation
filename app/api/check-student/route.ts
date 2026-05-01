import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const body = await request.json()
  const { nisn, date_of_birth } = body

  if (!nisn || !date_of_birth) {
    return NextResponse.json({ error: 'NISN dan tanggal lahir wajib diisi' }, { status: 400 })
  }

  // Cek apakah countdown sudah lewat
  const { data: countdown } = await supabase
    .from('countdown_settings')
    .select('reveal_time, is_active')
    .eq('id', 1)
    .single()

  if (countdown?.is_active && countdown.reveal_time) {
    const revealTime = new Date(countdown.reveal_time)
    if (new Date() < revealTime) {
      return NextResponse.json({ error: 'Pengumuman belum dibuka' }, { status: 403 })
    }
  }

  // Ubah format DD/MM/YYYY ke YYYY-MM-DD
  const parts = date_of_birth.split('/')
  if (parts.length !== 3) {
    return NextResponse.json({ error: 'Format tanggal lahir tidak valid (DD/MM/YYYY)' }, { status: 400 })
  }
  const [day, month, year] = parts
  const formattedDob = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`

  const { data: student, error } = await supabase
    .from('students')
    .select('id, name, nisn, nis, exam_number, class, status, date_of_birth, address')
    .eq('nisn', nisn.trim())
    .eq('date_of_birth', formattedDob)
    .single()

  if (error || !student) {
    return NextResponse.json({ error: 'Data siswa tidak ditemukan. Periksa kembali NISN dan tanggal lahir Anda.' }, { status: 404 })
  }

  return NextResponse.json({ student })
}
