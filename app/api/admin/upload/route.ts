import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

const BUCKET = 'school-assets'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File
  const field = formData.get('field') as string

  if (!file || !field) {
    return NextResponse.json({ error: 'File dan field wajib diisi' }, { status: 400 })
  }

  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const ext = file.name.split('.').pop()
  const filename = `${field}.${ext}`
  const arrayBuffer = await file.arrayBuffer()

  const { error: uploadError } = await serviceClient.storage
    .from(BUCKET)
    .upload(filename, arrayBuffer, {
      contentType: file.type,
      upsert: true,
    })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: { publicUrl } } = serviceClient.storage.from(BUCKET).getPublicUrl(filename)

  // Update school_settings dengan URL baru
  await serviceClient
    .from('school_settings')
    .update({ [`${field}_url`]: publicUrl, updated_at: new Date().toISOString() })
    .eq('id', 1)

  return NextResponse.json({ url: publicUrl })
}
