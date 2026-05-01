import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)

  // Return distinct class list
  if (searchParams.get('distinct') === 'class') {
    const { data } = await supabase.from('students').select('class').not('class', 'is', null)
    const classes = [...new Set((data || []).map(s => s.class).filter(Boolean))].sort()
    return NextResponse.json({ classes })
  }

  const search      = searchParams.get('search') || ''
  const classFilter = searchParams.get('class')  || ''
  const limitParam  = searchParams.get('limit')  || '20'
  const fetchAll    = limitParam === 'all'
  const limit       = fetchAll ? 0 : Math.max(1, parseInt(limitParam))
  const page        = Math.max(1, parseInt(searchParams.get('page') || '1'))
  const offset      = (page - 1) * limit

  let query = supabase
    .from('students')
    .select('*', { count: 'exact' })
    .order('class', { ascending: true })
    .order('name',  { ascending: true })

  if (search)      query = query.or(`name.ilike.%${search}%,nisn.ilike.%${search}%,nis.ilike.%${search}%`)
  if (classFilter) query = query.eq('class', classFilter)
  if (!fetchAll)   query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ students: data, total: count })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  // Ubah format DD/MM/YYYY ke YYYY-MM-DD jika perlu
  let dob = body.date_of_birth
  if (dob && dob.includes('/')) {
    const [d, m, y] = dob.split('/')
    dob = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }

  const { data, error } = await supabase
    .from('students')
    .insert({ ...body, date_of_birth: dob })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ student: data }, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { ids } = await request.json()

  const { error } = await supabase.from('students').delete().in('id', ids)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
