'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Student, SchoolSettings } from '@/lib/types'

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

  if (loading || !student || !school) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const isLulus = student.status === 'lulus'
  const schoolName = school.school_name || 'Sekolah'
  const preamble = (school.letter_content || '')
    .replace(/{nama_sekolah}/g, schoolName)
    .replace(/{tahun_ajaran}/g, school.school_year || '')

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">

      {/* Back */}
      <div className="max-w-2xl mx-auto mb-4">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </button>
      </div>

      {/* Letter card */}
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm overflow-hidden">

        {/* Status banner */}
        <div className={`relative overflow-hidden py-5 text-center ${
          isLulus
            ? 'bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600'
            : 'bg-gradient-to-br from-rose-400 to-red-500'
        }`}>
          {/* top shine */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
          <div className="relative flex items-center justify-center gap-3">
            {isLulus && <span className="text-white/50 text-base select-none">✦</span>}
            <div>
              <p className="text-white font-bold tracking-[0.3em] text-sm">
                {isLulus ? 'DINYATAKAN LULUS' : 'DINYATAKAN BELUM LULUS'}
              </p>
              {isLulus && (
                <p className="text-white/70 text-xs tracking-widest mt-1">Selamat atas pencapaianmu</p>
              )}
            </div>
            {isLulus && <span className="text-white/50 text-base select-none">✦</span>}
          </div>
        </div>

        <div className="px-10 py-8 text-sm text-gray-800">

          {/* Kop surat */}
          {school.letterhead_url ? (
            <img src={school.letterhead_url} alt="Kop" className="w-full mb-4" />
          ) : (
            <>
              <div className="flex items-center gap-4 pb-3">
                {school.logo_url && (
                  <img src={school.logo_url} alt="Logo" className="w-12 h-12 object-contain shrink-0" />
                )}
                <div className="flex-1 text-center">
                  <p className="font-bold leading-snug">{schoolName.toUpperCase()}</p>
                </div>
              </div>
              <div className="border-b-[3px] border-gray-800 mb-0.5" />
              <div className="border-b border-gray-400 mb-5" />
            </>
          )}

          {/* Judul */}
          <div className="text-center mb-1">
            <p className="font-bold underline">
              SURAT KEPUTUSAN KEPALA {schoolName.toUpperCase()}
            </p>
            {school.letter_number && (
              <p className="mt-1 text-gray-600">Nomor : {school.letter_number}</p>
            )}
          </div>

          {/* Perihal */}
          {(school.letter_subject || school.school_year) && (
            <div className="text-center mt-4 mb-5 text-gray-700">
              <p>tentang</p>
              {school.letter_subject && <p className="font-semibold">{school.letter_subject}</p>}
              {school.school_year && <p>Tahun Ajaran {school.school_year}</p>}
            </div>
          )}

          {/* Pembuka */}
          <p className="mb-4 text-gray-700">
            Atas Berkat Rahmat Allah Yang Maha Kuasa, Kepala {schoolName} :
          </p>

          {/* Preamble */}
          {preamble && (
            <pre className="leading-relaxed whitespace-pre-wrap text-gray-700 mb-2 font-[inherit]">{preamble}</pre>
          )}

          {/* Memutuskan */}
          <p className="text-center font-bold tracking-[0.25em] my-5">M E M U T U S K A N</p>
          <p className="font-semibold mb-3">Menetapkan</p>

          {/* Pertama */}
          <div className="flex gap-2 mb-3">
            <span className="w-20 shrink-0">Pertama</span>
            <span className="shrink-0 text-gray-400">:</span>
            <div className="flex-1 space-y-1.5">
              {[
                ['Nama', student.name],
                ['NIS / NISN', (student.nis || '-') + ' / ' + student.nisn],
                ['Nomor Ujian', '-'],
              ].map(([label, val]) => (
                <div key={label} className="flex gap-2">
                  <span className="w-24 shrink-0 text-gray-500">{label}</span>
                  <span className="shrink-0 text-gray-400">:</span>
                  <span>{val}</span>
                </div>
              ))}
              <div className="flex gap-2">
                <span className="w-24 shrink-0 text-gray-500">Dinyatakan</span>
                <span className="shrink-0 text-gray-400">:</span>
                <div>
                  <span className={`font-bold ${isLulus ? 'text-green-600' : 'text-red-600'}`}>
                    {isLulus ? 'LULUS' : 'TIDAK LULUS'}
                  </span>
                  <br />
                  <span className="text-gray-500">dalam menempuh pendidikan di {schoolName}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Kedua */}
          <div className="flex gap-2 mb-8">
            <span className="w-20 shrink-0">Kedua</span>
            <span className="shrink-0 text-gray-400">:</span>
            <span className="flex-1 text-gray-500 text-justify">
              Keputusan ini berlaku sejak tanggal ditetapkan dengan ketentuan apabila
              ternyata terdapat kekeliruan dalam keputusan ini akan diadakan perbaikan
              sebagaimana mestinya.
            </span>
          </div>

          {/* Tanda tangan */}
          <div className="flex justify-end">
            <div className="w-52">
              {[
                ['Ditetapkan di', school.city || ''],
                ['Pada Tanggal', school.decision_date || ''],
              ].map(([label, val]) => (
                <div key={label} className="flex gap-2 mb-0.5">
                  <span className="w-24 shrink-0 text-gray-500">{label}</span>
                  <span className="text-gray-400">:</span>
                  <span>{val}</span>
                </div>
              ))}
              <p className="mt-3 mb-0.5 text-gray-600">Kepala,</p>
              <p className="text-gray-600 mb-2">{schoolName}</p>

              <div className="relative h-16 mb-1">
                {school.principal_signature_url && (
                  <img
                    src={school.principal_signature_url}
                    alt="Tanda Tangan"
                    className="absolute left-0 top-1 h-12 object-contain"
                  />
                )}
                {school.school_stamp_url && (
                  <img
                    src={school.school_stamp_url}
                    alt="Stempel"
                    className="absolute left-5 top-0 h-16 w-16 object-contain opacity-60"
                  />
                )}
              </div>

              {school.principal_name && (
                <>
                  <p className="font-bold underline">{school.principal_name}</p>
                  {school.principal_nppy && (
                    <p className="text-gray-500 mt-0.5">NPPY. {school.principal_nppy}</p>
                  )}
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
