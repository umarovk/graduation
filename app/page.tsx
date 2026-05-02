'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { CountdownSettings, SchoolSettings } from '@/lib/types'
import DatePicker from '@/components/DatePicker'

function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    function update() {
      const now = new Date().getTime()
      const distance = targetDate.getTime() - now
      if (distance <= 0) { window.location.reload(); return }
      setTimeLeft({
        days:    Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours:   Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      })
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [targetDate])

  return (
    <div className="flex gap-3 justify-center mt-6">
      {[
        { label: 'Hari',  value: timeLeft.days },
        { label: 'Jam',   value: timeLeft.hours },
        { label: 'Menit', value: timeLeft.minutes },
        { label: 'Detik', value: timeLeft.seconds },
      ].map(({ label, value }) => (
        <div key={label} className="flex flex-col items-center bg-white border border-gray-100 rounded-2xl shadow-sm px-4 py-3 min-w-[60px]">
          <span className="text-2xl font-bold text-emerald-600 tabular-nums">
            {String(value).padStart(2, '0')}
          </span>
          <span className="text-[10px] text-gray-400 mt-1 font-medium uppercase tracking-wide">{label}</span>
        </div>
      ))}
    </div>
  )
}

export default function HomePage() {
  const router = useRouter()
  const [school, setSchool] = useState<SchoolSettings | null>(null)
  const [countdown, setCountdown] = useState<CountdownSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ nisn: '', date_of_birth: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/school').then(r => r.json()),
      fetch('/api/admin/countdown').then(r => r.json()),
    ]).then(([schoolRes, countdownRes]) => {
      setSchool(schoolRes.settings)
      setCountdown(countdownRes.settings)
      setLoading(false)
    })
  }, [])

  const showCountdown =
    countdown?.is_active &&
    countdown.reveal_time &&
    new Date() < new Date(countdown.reveal_time)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/check-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Terjadi kesalahan'); return }
      sessionStorage.setItem('student_data', JSON.stringify(data.student))
      router.push('/status')
    } catch {
      setError('Gagal menghubungi server. Coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      {/* ── Left panel (desktop) / Top banner (mobile) ── */}
      <div className="relative md:w-5/12 lg:w-2/5 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700
                      h-52 md:h-auto md:min-h-screen overflow-hidden flex flex-col shrink-0">

        {/* Decorative blobs */}
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/10 rounded-full" />
        <div className="absolute top-1/3 -left-12 w-40 h-40 bg-teal-400/20 rounded-full" />
        <div className="absolute -bottom-20 -right-8 w-64 h-64 bg-emerald-400/20 rounded-full" />

        {/* Top: logo */}
        <div className="relative z-10 p-7 md:p-10">
          {school?.logo_url ? (
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm overflow-hidden flex items-center justify-center">
              <img src={school.logo_url} alt="Logo" className="w-10 h-10 object-contain" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
              </svg>
            </div>
          )}
        </div>

        {/* Center: school photo (desktop) */}
        <div className="hidden md:flex flex-1 items-center justify-center px-10">
          {school?.school_photo_url ? (
            <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-xl">
              <img
                src={school.school_photo_url}
                alt="Foto Sekolah"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full aspect-[4/3] rounded-3xl bg-white/10 border border-white/20 flex flex-col items-center justify-center gap-3">
              <svg className="w-12 h-12 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <p className="text-white/40 text-xs text-center px-4">Foto sekolah<br/>dapat diatur di panel admin</p>
            </div>
          )}
        </div>

        {/* Bottom: school name (desktop) */}
        <div className="hidden md:block relative z-10 p-10">
          <p className="text-emerald-200 text-xs font-semibold uppercase tracking-widest mb-2">
            Pengumuman Kelulusan
          </p>
          <h2 className="text-white text-2xl font-bold leading-snug">
            {school?.school_name || 'Sekolah Anda'}
          </h2>
          {school?.school_year && (
            <p className="text-emerald-200 text-sm mt-1.5">Tahun Ajaran {school.school_year}</p>
          )}
        </div>
      </div>

      {/* ── Right panel (desktop) / Bottom card (mobile) ── */}
      <div className="flex-1 bg-white rounded-t-3xl md:rounded-none -mt-6 md:mt-0 relative z-10
                      flex items-center justify-center px-8 py-10 md:px-12 lg:px-20">
        <div className="w-full max-w-sm">

          {/* Mobile: school info */}
          <div className="md:hidden text-center mb-8">
            <h1 className="text-xl font-bold text-gray-800">
              {school?.school_name || 'Pengumuman Kelulusan'}
            </h1>
            {school?.school_year && (
              <p className="text-emerald-600 text-sm mt-1">Tahun Ajaran {school.school_year}</p>
            )}
          </div>

          {showCountdown ? (
            <div className="text-center">
              {/* Toga icon */}
              <div className="flex justify-center mb-4">
                <svg viewBox="0 0 100 80" className="w-20 h-20 text-emerald-500" fill="currentColor" aria-hidden="true">
                  <polygon points="50,4 90,26 50,48 10,26" opacity="0.9"/>
                  <rect x="30" y="45" width="40" height="14" rx="3" opacity="0.8"/>
                  <path d="M90,26 C98,38 96,54 94,66" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none"/>
                  <rect x="88" y="64" width="10" height="13" rx="2" opacity="0.7"/>
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Pengumuman Kelulusan Segera Hadir</h2>
              <p className="text-gray-400 text-sm mt-2">
                Akan dibuka pada{' '}
                <span className="font-semibold text-emerald-600">
                  {new Date(countdown!.reveal_time!).toLocaleString('id-ID', {
                    day: 'numeric', month: 'long', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </span>
              </p>
              <CountdownTimer targetDate={new Date(countdown!.reveal_time!)} />
            </div>

          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Cek Status Kelulusan</h2>
                <p className="text-gray-400 text-sm mt-1.5">
                  Masukkan NISN dan tanggal lahir Anda
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">NISN</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="Contoh: 1234567890"
                    value={form.nisn}
                    onChange={e => setForm(f => ({ ...f, nisn: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent bg-gray-50"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal Lahir</label>
                  <DatePicker
                    value={form.date_of_birth}
                    onChange={v => setForm(f => ({ ...f, date_of_birth: v }))}
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-all shadow-sm hover:shadow-md mt-1"
                >
                  {submitting ? 'Mencari...' : 'Cek Status Kelulusan'}
                </button>
              </form>

              <p className="text-center text-xs text-gray-400 mt-8">
                Jika ada pertanyaan, hubungi pihak sekolah
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
