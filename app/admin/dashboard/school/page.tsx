'use client'

import { useState, useEffect, useRef } from 'react'
import type { SchoolSettings } from '@/lib/types'

type UploadField = 'logo' | 'letterhead' | 'principal_signature' | 'school_stamp'

const uploadFields: { key: UploadField; label: string; desc: string }[] = [
  { key: 'logo', label: 'Logo Sekolah', desc: 'PNG/JPG, disarankan kotak (1:1), maks 2MB' },
  { key: 'letterhead', label: 'Kop Surat', desc: 'PNG/JPG, lebar penuh, maks 5MB' },
  { key: 'principal_signature', label: 'Tanda Tangan Kepsek', desc: 'PNG transparan, maks 2MB' },
  { key: 'school_stamp', label: 'Stempel Sekolah', desc: 'PNG transparan, maks 2MB' },
]

export default function SchoolPage() {
  const [settings, setSettings] = useState<SchoolSettings | null>(null)
  const [schoolName, setSchoolName] = useState('')
  const [principalName, setPrincipalName] = useState('')
  const [principalNppy, setPrincipalNppy] = useState('')
  const [letterContent, setLetterContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<UploadField | null>(null)
  const [toast, setToast] = useState('')
  const fileRefs = useRef<Record<UploadField, HTMLInputElement | null>>({
    logo: null, letterhead: null, principal_signature: null, school_stamp: null,
  })

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  useEffect(() => {
    fetch('/api/admin/school').then(r => r.json()).then(data => {
      if (data.settings) {
        setSettings(data.settings)
        setSchoolName(data.settings.school_name || '')
        setPrincipalName(data.settings.principal_name || '')
        setPrincipalNppy(data.settings.principal_nppy || '')
        setLetterContent(data.settings.letter_content || '')
      }
    })
  }, [])

  async function handleSave() {
    setSaving(true)
    const res = await fetch('/api/admin/school', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ school_name: schoolName, principal_name: principalName, principal_nppy: principalNppy, letter_content: letterContent }),
    })
    if (res.ok) showToast('Data sekolah disimpan')
    setSaving(false)
  }

  async function handleUpload(field: UploadField, file: File) {
    setUploading(field)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('field', field)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
    const data = await res.json()
    if (res.ok) {
      setSettings(prev => prev ? { ...prev, [`${field}_url`]: data.url } : prev)
      showToast('Gambar berhasil diupload')
    } else {
      showToast(`Gagal upload: ${data.error}`)
    }
    setUploading(null)
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Data Sekolah</h1>
      <p className="text-gray-500 text-sm mb-8">Informasi sekolah yang tampil di surat keterangan kelulusan</p>

      {/* Nama sekolah */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Identitas Sekolah</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nama Sekolah</label>
            <input
              type="text"
              value={schoolName}
              onChange={e => setSchoolName(e.target.value)}
              placeholder="Contoh: SMA Negeri 1 Kota"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Nama Kepala Sekolah</label>
            <input
              type="text"
              value={principalName}
              onChange={e => setPrincipalName(e.target.value)}
              placeholder="Contoh: Drs. Ahmad Fauzi, M.Pd."
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">NPPY / NIP Kepala Sekolah</label>
            <input
              type="text"
              value={principalNppy}
              onChange={e => setPrincipalNppy(e.target.value)}
              placeholder="Contoh: 196805121994031005"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Upload gambar */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Aset Visual</h2>
        <div className="grid grid-cols-2 gap-4">
          {uploadFields.map(({ key, label, desc }) => {
            const urlKey = `${key}_url` as keyof SchoolSettings
            const currentUrl = settings?.[urlKey] as string | null

            return (
              <div key={key} className="border border-gray-200 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-700 mb-1">{label}</p>
                <p className="text-xs text-gray-400 mb-3">{desc}</p>

                {currentUrl ? (
                  <div className="mb-3">
                    <img
                      src={currentUrl}
                      alt={label}
                      className="max-h-16 object-contain rounded border border-gray-100"
                    />
                  </div>
                ) : (
                  <div className="mb-3 h-16 flex items-center justify-center bg-gray-50 rounded border border-dashed border-gray-200">
                    <span className="text-xs text-gray-400">Belum ada</span>
                  </div>
                )}

                <button
                  onClick={() => fileRefs.current[key]?.click()}
                  disabled={uploading === key}
                  className="w-full text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 py-1.5 rounded-md"
                >
                  {uploading === key ? 'Mengupload...' : currentUrl ? 'Ganti Gambar' : 'Upload'}
                </button>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={el => { fileRefs.current[key] = el }}
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) handleUpload(key, file)
                  }}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Isi surat */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-1">Isi Surat Keterangan</h2>
        <p className="text-xs text-gray-400 mb-3">
          Variabel yang tersedia:{' '}
          {['{nama_siswa}', '{nisn}', '{kelas}', '{status}', '{nama_sekolah}', '{nama_kepsek}', '{nppy_kepsek}'].map(v => (
            <code key={v} className="bg-gray-100 px-1 rounded mr-1">{v}</code>
          ))}
        </p>
        <textarea
          rows={8}
          value={letterContent}
          onChange={e => setLetterContent(e.target.value)}
          placeholder={`Yang bertanda tangan di bawah ini, Kepala {nama_sekolah}, menerangkan bahwa:\n\nNama   : {nama_siswa}\nNISN   : {nisn}\nKelas  : {kelas}\n\nadalah benar siswa/siswi yang {status} dari {nama_sekolah} pada Tahun Pelajaran 2024/2025.\n\nDemikian surat keterangan ini dibuat untuk dipergunakan sebagaimana mestinya.`}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold px-6 py-2.5 rounded-lg text-sm"
      >
        {saving ? 'Menyimpan...' : 'Simpan Data Sekolah'}
      </button>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-800 text-white px-5 py-3 rounded-xl shadow-lg text-sm z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
