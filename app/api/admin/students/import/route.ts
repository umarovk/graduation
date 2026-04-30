import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { students } = await request.json()

  if (!Array.isArray(students) || students.length === 0) {
    return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 })
  }

  // Normalkan data dan format tanggal
  const normalized = students.map((s: Record<string, string>) => {
    let dob = s.date_of_birth || s.tanggal_lahir || ''
    if (dob && dob.includes('/')) {
      const [d, m, y] = dob.split('/')
      dob = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
    }

    const status = (s.status || 'pending').toLowerCase()
    const validStatus = ['lulus', 'tidak_lulus', 'pending'].includes(status) ? status : 'pending'

    return {
      nisn: (s.nisn || '').trim(),
      nis: (s.nis || '').trim() || null,
      name: (s.nama || s.name || '').trim(),
      address: (s.alamat || s.address || '').trim() || null,
      date_of_birth: dob,
      class: (s.kelas || s.class || '').trim() || null,
      status: validStatus,
    }
  }).filter(s => s.nisn && s.name && s.date_of_birth)

  if (normalized.length === 0) {
    return NextResponse.json({ error: 'Tidak ada data valid yang bisa diimport' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('students')
    .upsert(normalized, { onConflict: 'nisn' })
    .select()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ inserted: data?.length || 0 })
}
