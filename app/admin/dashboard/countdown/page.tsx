'use client'

import { useState, useEffect } from 'react'
import type { CountdownSettings } from '@/lib/types'

function toLocalDatetimeInput(isoString: string | null) {
  if (!isoString) return ''
  const d = new Date(isoString)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function CountdownPage() {
  const [settings, setSettings] = useState<CountdownSettings | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [revealTime, setRevealTime] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  useEffect(() => {
    fetch('/api/admin/countdown').then(r => r.json()).then(data => {
      if (data.settings) {
        setSettings(data.settings)
        setIsActive(data.settings.is_active)
        setRevealTime(toLocalDatetimeInput(data.settings.reveal_time))
      }
    })
  }, [])

  async function handleSave() {
    setSaving(true)
    const revealTimeIso = revealTime ? new Date(revealTime).toISOString() : null
    const res = await fetch('/api/admin/countdown', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: isActive, reveal_time: revealTimeIso }),
    })
    if (res.ok) {
      const data = await res.json()
      setSettings(data.settings)
      showToast('Pengaturan countdown disimpan')
    }
    setSaving(false)
  }

  const now = new Date()
  const revealDate = revealTime ? new Date(revealTime) : null
  const isRevealInFuture = revealDate && revealDate > now
  const isCountdownActive = isActive && isRevealInFuture

  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Pengaturan Countdown</h1>
      <p className="text-gray-500 text-sm mb-8">
        Atur kapan siswa dapat melihat status kelulusan mereka
      </p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        {/* Toggle aktif */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm font-semibold text-gray-800">Aktifkan Countdown</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Jika aktif, siswa akan melihat timer hingga waktu yang ditentukan
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsActive(v => !v)}
            className={`relative w-12 h-6 rounded-full transition-colors ${isActive ? 'bg-blue-600' : 'bg-gray-200'}`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${isActive ? 'translate-x-7' : 'translate-x-1'}`}
            />
          </button>
        </div>

        {/* Waktu pengumuman */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Waktu Pengumuman</label>
          <input
            type="datetime-local"
            value={revealTime}
            onChange={e => setRevealTime(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400 mt-1">
            Setelah waktu ini, siswa dapat mengecek status mereka
          </p>
        </div>
      </div>

      {/* Preview status */}
      <div className={`rounded-xl border p-4 mb-6 text-sm ${isCountdownActive ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
        <p className="font-medium text-gray-700 mb-1">Status saat ini:</p>
        {isCountdownActive ? (
          <p className="text-blue-700">
            Countdown aktif — pengumuman dibuka pada{' '}
            <strong>
              {revealDate!.toLocaleString('id-ID', {
                day: 'numeric', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </strong>
          </p>
        ) : isActive && revealDate && !isRevealInFuture ? (
          <p className="text-green-700">Pengumuman sudah terbuka (waktu sudah lewat)</p>
        ) : (
          <p className="text-gray-500">Countdown tidak aktif — siswa langsung bisa cek status</p>
        )}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold px-6 py-2.5 rounded-lg text-sm"
      >
        {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
      </button>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-800 text-white px-5 py-3 rounded-xl shadow-lg text-sm z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
