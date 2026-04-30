'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { CountdownSettings, SchoolSettings } from '@/lib/types'

function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

  useEffect(() => {
    function update() {
      const now = new Date().getTime()
      const distance = targetDate.getTime() - now
      if (distance <= 0) {
        window.location.reload()
        return
      }
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      })
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [targetDate])

  return (
    <div className="flex gap-4 justify-center mt-6">
      {[
        { label: 'Hari', value: timeLeft.days },
        { label: 'Jam', value: timeLeft.hours },
        { label: 'Menit', value: timeLeft.minutes },
        { label: 'Detik', value: timeLeft.seconds },
      ].map(({ label, value }) => (
        <div key={label} className="flex flex-col items-center bg-white rounded-xl shadow px-5 py-4 min-w-[70px]">
          <span className="text-4xl font-bold text-blue-700 tabular-nums">
            {String(value).padStart(2, '0')}
          </span>
          <span className="text-xs text-gray-500 mt-1 font-medium">{label}</span>
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
      if (!res.ok) {
        setError(data.error || 'Terjadi kesalahan')
        return
      }
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          {school?.logo_url && (
            <img
              src={school.logo_url}
              alt="Logo Sekolah"
              className="w-24 h-24 object-contain mx-auto mb-4"
            />
          )}
          <h1 className="text-2xl font-bold text-gray-800">
            {school?.school_name || 'Pengumuman Kelulusan'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">Tahun Pelajaran 2024/2025</p>
        </div>

        {showCountdown ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800">Pengumuman Segera Hadir</h2>
            <p className="text-gray-500 text-sm mt-2">
              Akan dibuka pada{' '}
              <span className="font-semibold text-blue-600">
                {new Date(countdown!.reveal_time!).toLocaleString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </p>
            <CountdownTimer targetDate={new Date(countdown!.reveal_time!)} />
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-800 text-center mb-2">Cek Status Kelulusan</h2>
            <p className="text-gray-500 text-sm text-center mb-6">
              Masukkan NISN dan tanggal lahir Anda
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NISN</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Contoh: 1234567890"
                  value={form.nisn}
                  onChange={e => setForm(f => ({ ...f, nisn: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
                <input
                  type="text"
                  placeholder="DD/MM/YYYY"
                  value={form.date_of_birth}
                  onChange={e => {
                    let val = e.target.value.replace(/[^0-9/]/g, '')
                    if (val.length === 2 && !val.includes('/')) val += '/'
                    if (val.length === 5 && val.split('/').length === 2) val += '/'
                    if (val.length <= 10) setForm(f => ({ ...f, date_of_birth: val }))
                  }}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2.5 rounded-lg transition-colors"
              >
                {submitting ? 'Mencari...' : 'Cek Status'}
              </button>
            </form>
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-6">
          Jika ada pertanyaan, hubungi pihak sekolah
        </p>
      </div>
    </div>
  )
}
