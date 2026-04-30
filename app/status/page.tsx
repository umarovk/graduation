'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import type { Student, SchoolSettings } from '@/lib/types'

const SkCertificateViewer = dynamic(
  () => import('@/components/SkCertificateViewer'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-60 bg-white rounded-lg border border-gray-200">
        <div className="text-center text-gray-400 text-sm">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          Memuat dokumen...
        </div>
      </div>
    ),
  }
)

export default function StatusPage() {
  const router = useRouter()
  const [student, setStudent] = useState<Student | null>(null)
  const [school, setSchool] = useState<SchoolSettings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const raw = sessionStorage.getItem('student_data')
    if (!raw) { router.replace('/'); return }
    setStudent(JSON.parse(raw))
    fetch('/api/admin/school')
      .then(r => r.json())
      .then(data => { setSchool(data.settings); setLoading(false) })
  }, [router])

  if (loading || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const isLulus = student.status === 'lulus'

  return (
    <div className="min-h-screen bg-gray-200 py-8 px-4">

      {/* ── Tombol kembali ── */}
      <div className="max-w-3xl mx-auto mb-4 flex gap-2">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 text-sm text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-lg"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </button>
      </div>

      {/* ── Status badge ── */}
      <div className="max-w-3xl mx-auto mb-5">
        <div className={`rounded-2xl p-5 text-center ${isLulus ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-300'}`}>
          <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full text-base font-bold ${isLulus ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
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
          <p className="text-gray-700 mt-3 font-semibold text-lg">{student.name}</p>
          <p className="text-gray-500 text-sm mt-1">
            NISN: {student.nisn}
            {student.nis && <> &bull; NIS: {student.nis}</>}
            {student.class && <> &bull; Kelas: {student.class}</>}
          </p>
        </div>
      </div>

      {/* ── PDF Viewer ── */}
      {school && (
        <div className="max-w-3xl mx-auto rounded-lg overflow-hidden shadow-lg">
          <SkCertificateViewer student={student} school={school} />
        </div>
      )}

    </div>
  )
}
