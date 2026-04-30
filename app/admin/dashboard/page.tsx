import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

async function getStats() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin')

  const [total, lulus, tidakLulus] = await Promise.all([
    supabase.from('students').select('id', { count: 'exact', head: true }),
    supabase.from('students').select('id', { count: 'exact', head: true }).eq('status', 'lulus'),
    supabase.from('students').select('id', { count: 'exact', head: true }).eq('status', 'tidak_lulus'),
  ])

  return {
    total: total.count || 0,
    lulus: lulus.count || 0,
    tidakLulus: tidakLulus.count || 0,
    pending: (total.count || 0) - (lulus.count || 0) - (tidakLulus.count || 0),
  }
}

export default async function DashboardPage() {
  const stats = await getStats()

  const cards = [
    { label: 'Total Siswa', value: stats.total, color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { label: 'Lulus', value: stats.lulus, color: 'bg-green-50 text-green-700 border-green-200' },
    { label: 'Tidak Lulus', value: stats.tidakLulus, color: 'bg-red-50 text-red-700 border-red-200' },
    { label: 'Belum Ditentukan', value: stats.pending, color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  ]

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Dashboard</h1>
      <p className="text-gray-500 text-sm mb-8">Ringkasan data pengumuman kelulusan</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(card => (
          <div key={card.label} className={`rounded-xl border p-6 ${card.color}`}>
            <p className="text-sm font-medium opacity-80">{card.label}</p>
            <p className="text-4xl font-bold mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-700 mb-4">Panduan Singkat</h2>
        <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
          <li>Isi <strong>Data Sekolah</strong> — nama, logo, kop surat, tanda tangan, stempel, dan isi surat.</li>
          <li>Import atau tambahkan <strong>Data Siswa</strong> beserta status kelulusan.</li>
          <li>Aktifkan <strong>Countdown</strong> dan tentukan waktu pengumuman.</li>
          <li>Siswa dapat mengecek status dengan NISN dan tanggal lahir di halaman utama.</li>
        </ol>
      </div>
    </div>
  )
}
