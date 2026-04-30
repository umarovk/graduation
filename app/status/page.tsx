'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Student, SchoolSettings } from '@/lib/types'

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function StatusPage() {
  const router = useRouter()
  const [student, setStudent] = useState<Student | null>(null)
  const [school, setSchool] = useState<SchoolSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const raw = sessionStorage.getItem('student_data')
    if (!raw) {
      router.replace('/')
      return
    }
    const parsed = JSON.parse(raw)
    setStudent(parsed)

    fetch('/api/admin/school')
      .then(r => r.json())
      .then(data => {
        setSchool(data.settings)
        setLoading(false)
      })
  }, [router])

  if (loading || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const isLulus = student.status === 'lulus'

  function getLetterContent() {
    if (!school?.letter_content) {
      return `Yang bertanda tangan di bawah ini, Kepala ${school?.school_name || 'Sekolah'}, menerangkan bahwa:\n\nNama   : ${student!.name}\nNISN   : ${student!.nisn}\nKelas  : ${student!.class || '-'}\n\nadalah benar siswa/siswi yang ${isLulus ? 'DINYATAKAN LULUS' : 'TIDAK DINYATAKAN LULUS'} dari ${school?.school_name || 'sekolah ini'} pada Tahun Pelajaran 2024/2025.\n\nDemikian surat keterangan ini dibuat untuk dipergunakan sebagaimana mestinya.`
    }
    return school.letter_content
      .replace(/{nama_siswa}/g, student!.name)
      .replace(/{nisn}/g, student!.nisn)
      .replace(/{kelas}/g, student!.class || '-')
      .replace(/{status}/g, isLulus ? 'LULUS' : 'TIDAK LULUS')
      .replace(/{nama_sekolah}/g, school.school_name || 'Sekolah')
      .replace(/{nama_kepsek}/g, school.principal_name || '')
      .replace(/{nppy_kepsek}/g, school.principal_nppy || '')
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      {/* Tombol aksi */}
      <div className="max-w-2xl mx-auto mb-4 flex gap-3 no-print">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800 bg-white border border-gray-200 px-4 py-2 rounded-lg"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </button>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg ml-auto"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Cetak
        </button>
      </div>

      {/* Status card */}
      <div className="max-w-2xl mx-auto mb-4 no-print">
        <div className={`rounded-2xl p-6 text-center ${isLulus ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-300'}`}>
          <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full text-lg font-bold ${isLulus ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
            {isLulus ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                SELAMAT, ANDA LULUS!
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
                BELUM LULUS
              </>
            )}
          </div>
          <p className="text-gray-600 mt-3 font-medium">{student.name}</p>
          <p className="text-gray-500 text-sm">NISN: {student.nisn} &bull; Kelas: {student.class || '-'}</p>
        </div>
      </div>

      {/* Surat keterangan */}
      <div id="certificate" className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Kop surat */}
        {school?.letterhead_url ? (
          <img src={school.letterhead_url} alt="Kop Surat" className="w-full" />
        ) : (
          <div className="border-b-4 border-double border-gray-800 p-6">
            <div className="flex items-center gap-4">
              {school?.logo_url && (
                <img src={school.logo_url} alt="Logo" className="w-16 h-16 object-contain" />
              )}
              <div className="text-center flex-1">
                <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">
                  {school?.school_name || 'NAMA SEKOLAH'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">Tahun Pelajaran 2024/2025</p>
              </div>
            </div>
          </div>
        )}

        <div className="p-8">
          {/* Judul surat */}
          <div className="text-center mb-6">
            <h3 className="text-lg font-bold uppercase tracking-widest text-gray-800 underline decoration-2 underline-offset-4">
              Surat Keterangan Kelulusan
            </h3>
          </div>

          {/* Isi surat */}
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mb-8">
            {getLetterContent()}
          </div>

          {/* Status besar untuk print */}
          <div className={`text-center py-3 mb-8 rounded-lg font-bold text-2xl tracking-widest ${isLulus ? 'bg-green-100 text-green-800 border-2 border-green-400' : 'bg-red-100 text-red-800 border-2 border-red-400'}`}>
            {isLulus ? 'LULUS' : 'TIDAK LULUS'}
          </div>

          {/* Tanda tangan */}
          <div className="flex justify-end mt-4">
            <div className="text-center min-w-[200px]">
              <p className="text-sm text-gray-600 mb-1">
                {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <p className="text-sm font-medium text-gray-700 mb-16">Kepala Sekolah,</p>

              {/* Tanda tangan + stempel bertumpuk */}
              <div className="relative inline-block">
                {school?.principal_signature_url && (
                  <img
                    src={school.principal_signature_url}
                    alt="Tanda Tangan"
                    className="h-16 object-contain mx-auto mb-1"
                  />
                )}
                {school?.school_stamp_url && (
                  <img
                    src={school.school_stamp_url}
                    alt="Stempel"
                    className="h-20 w-20 object-contain absolute -top-4 -right-8 opacity-70"
                  />
                )}
              </div>

              {school?.principal_name && (
                <div className="mt-2">
                  <p className="text-sm font-bold text-gray-800">{school.principal_name}</p>
                  {school.principal_nppy && (
                    <p className="text-xs text-gray-500">NPPY/NIP: {school.principal_nppy}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
