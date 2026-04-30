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

  if (loading || !student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const isLulus = student.status === 'lulus'
  const schoolName = school?.school_name || 'Sekolah'

  function getPreamble() {
    if (!school?.letter_content) return ''
    return school.letter_content
      .replace(/{nama_sekolah}/g, schoolName)
      .replace(/{tahun_ajaran}/g, school.school_year || '')
  }

  return (
    <div className="min-h-screen bg-gray-200 py-8 px-4">

      {/* ── Bagian atas: status + tombol (tidak ikut cetak) ── */}
      <div className="max-w-3xl mx-auto mb-5 no-print">
        {/* Tombol */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-1.5 text-sm text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg ml-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Cetak / Simpan PDF
          </button>
        </div>

        {/* Status badge */}
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

      {/* ── Dokumen SK (ikut cetak) ── */}
      <div id="certificate" className="max-w-3xl mx-auto bg-white shadow-lg">

        {/* Kop surat */}
        {school?.letterhead_url ? (
          <img src={school.letterhead_url} alt="Kop Surat" className="w-full block" />
        ) : (
          <div className="px-10 pt-6 pb-4 border-b-4 border-black">
            <div className="flex items-center gap-4">
              {school?.logo_url && (
                <img src={school.logo_url} alt="Logo" className="w-20 h-20 object-contain flex-shrink-0" />
              )}
              <div className="text-center flex-1">
                <p className="text-base font-bold uppercase leading-tight">{schoolName}</p>
              </div>
            </div>
          </div>
        )}

        <div className="px-12 py-8 text-sm leading-relaxed">

          {/* Judul SK */}
          <div className="text-center mb-1">
            <p className="font-bold underline uppercase text-sm">
              SURAT KEPUTUSAN KEPALA {schoolName.toUpperCase()}
            </p>
            {school?.letter_number && (
              <p className="mt-0.5">Nomor : {school.letter_number}</p>
            )}
          </div>

          {/* Perihal */}
          {(school?.letter_subject || school?.school_year) && (
            <div className="text-center mt-4 mb-6">
              <p>tentang</p>
              {school.letter_subject && <p className="font-medium">{school.letter_subject}</p>}
              {school.school_year && <p>Tahun Ajaran {school.school_year}</p>}
            </div>
          )}

          {/* Pembuka */}
          <p className="mb-4">
            Atas Berkat Rahmat Allah Yang Maha Kuasa, Kepala {schoolName} :
          </p>

          {/* Menimbang / Mengingat / Memperhatikan */}
          {getPreamble() && (
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed mb-4 text-justify">
              {getPreamble()}
            </pre>
          )}

          {/* MEMUTUSKAN */}
          <div className="text-center font-bold tracking-widest my-5">
            M E M U T U S K A N
          </div>

          {/* Menetapkan */}
          <p className="font-bold mb-2">Menetapkan</p>

          {/* Pertama */}
          <table className="w-full text-sm mb-1">
            <tbody>
              <tr className="align-top">
                <td className="w-28 pr-2">Pertama</td>
                <td className="w-4 pr-3">:</td>
                <td>
                  <table className="text-sm">
                    <tbody>
                      <tr>
                        <td className="w-28 pr-2">Nama</td>
                        <td className="w-4 pr-3">:</td>
                        <td>{student.name}</td>
                      </tr>
                      <tr>
                        <td className="pr-2">NIS / NISN</td>
                        <td className="pr-3">:</td>
                        <td>{student.nis || '-'} / {student.nisn}</td>
                      </tr>
                      <tr>
                        <td className="pr-2">Nomor Ujian</td>
                        <td className="pr-3">:</td>
                        <td>-</td>
                      </tr>
                      <tr>
                        <td className="pr-2 align-top">Dinyatakan</td>
                        <td className="pr-3 align-top">:</td>
                        <td>
                          <span className="font-bold">{isLulus ? 'LULUS' : 'TIDAK LULUS'}</span>
                          <br />
                          <span>dalam menempuh pendidikan di {schoolName}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>

              <tr className="align-top">
                <td className="pr-2 pt-2">Kedua</td>
                <td className="pr-3 pt-2">:</td>
                <td className="pt-2 text-justify">
                  Keputusan ini berlaku sejak tanggal ditetapkan dengan ketentuan apabila
                  ternyata terdapat kekeliruan dalam keputusan ini akan diadakan
                  perbaikan sebagaimana mestinya.
                </td>
              </tr>
            </tbody>
          </table>

          {/* Tanda tangan */}
          <div className="flex justify-end mt-8">
            <div className="text-sm" style={{ minWidth: '220px' }}>
              <table>
                <tbody>
                  <tr>
                    <td className="pr-2">Ditetapkan di</td>
                    <td className="pr-2">:</td>
                    <td>{school?.city || '...'}</td>
                  </tr>
                  <tr>
                    <td className="pr-2">Pada Tanggal</td>
                    <td className="pr-2">:</td>
                    <td>{school?.decision_date || '...'}</td>
                  </tr>
                </tbody>
              </table>
              <p className="mt-1">Kepala,</p>
              <p>{schoolName}</p>

              {/* Tanda tangan + stempel */}
              <div className="relative my-2" style={{ height: '80px' }}>
                {school?.principal_signature_url && (
                  <img
                    src={school.principal_signature_url}
                    alt="TTD"
                    className="absolute left-0 h-16 object-contain"
                  />
                )}
                {school?.school_stamp_url && (
                  <img
                    src={school.school_stamp_url}
                    alt="Stempel"
                    className="absolute left-10 top-0 h-20 w-20 object-contain opacity-70"
                  />
                )}
              </div>

              {school?.principal_name ? (
                <>
                  <p className="font-bold underline mt-1">{school.principal_name}</p>
                  {school.principal_nppy && (
                    <p>NPPY. {school.principal_nppy}</p>
                  )}
                </>
              ) : (
                <p className="font-bold mt-1">________________</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
