'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Student, SchoolSettings } from '@/lib/types'

/* ── Reusable mini shapes ─────────────────────────────── */

function CapSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 80" className={className} fill="none" aria-hidden="true">
      <polygon points="50,4 90,26 50,48 10,26" fill="currentColor" />
      <rect x="30" y="45" width="40" height="14" rx="3" fill="currentColor" opacity="0.8" />
      <path d="M90,26 C98,38 96,54 94,66" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      <rect x="88" y="64" width="10" height="13" rx="2" fill="currentColor" opacity="0.7" />
    </svg>
  )
}

function StarSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <path d="M20 2 L23 14 L35 14 L25 22 L29 35 L20 27 L11 35 L15 22 L5 14 L17 14 Z" fill="currentColor" />
    </svg>
  )
}

function ScrollSvg({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 100" className={className} fill="none" aria-hidden="true">
      <rect x="8" y="10" width="64" height="80" rx="4" fill="currentColor" opacity="0.9" />
      <rect x="4" y="6"  width="72" height="12" rx="6" fill="currentColor" />
      <rect x="4" y="82" width="72" height="12" rx="6" fill="currentColor" />
      <rect x="20" y="28" width="40" height="3" rx="1.5" fill="white" opacity="0.4" />
      <rect x="20" y="36" width="40" height="3" rx="1.5" fill="white" opacity="0.4" />
      <rect x="20" y="44" width="28" height="3" rx="1.5" fill="white" opacity="0.4" />
      <rect x="28" y="56" width="24" height="16" rx="3" fill="white" opacity="0.25" />
    </svg>
  )
}

function GraduationIllustration() {
  return (
    <svg viewBox="0 0 200 200" className="w-40 h-40" aria-hidden="true" fill="none">
      <circle cx="100" cy="90" r="66" fill="#d1fae5" opacity="0.5" />
      <circle cx="28"  cy="52"  r="4"   fill="#34d399" />
      <circle cx="172" cy="44"  r="3.5" fill="#fbbf24" />
      <circle cx="168" cy="156" r="5"   fill="#60a5fa" />
      <circle cx="34"  cy="162" r="3.5" fill="#f472b6" />
      <circle cx="92"  cy="188" r="4"   fill="#a78bfa" />
      <circle cx="148" cy="177" r="3"   fill="#34d399" />
      <circle cx="50"  cy="179" r="2.5" fill="#fbbf24" />
      <circle cx="177" cy="104" r="3"   fill="#f472b6" />
      <circle cx="18"  cy="114" r="3"   fill="#60a5fa" />
      <path d="M165 33 L168 23 L171 33 L181 36 L171 39 L168 49 L165 39 L155 36 Z" fill="#fbbf24" />
      <path d="M40  71 L42  64 L44  71 L51  73 L44  75 L42  82 L40  75 L33  73 Z"  fill="#34d399" />
      <path d="M178 127 L179.5 122 L181 127 L186 128.5 L181 130 L179.5 135 L178 130 L173 128.5 Z" fill="#60a5fa" />
      <path d="M30  142 L31.5 138 L33  142 L37  143.5 L33  145 L31.5 149 L30  145 L26  143.5 Z"  fill="#f472b6" />
      <g transform="translate(100,87) rotate(-18)">
        <polygon points="0,-38 40,-12 0,13 -40,-12" fill="#000" opacity="0.07" transform="translate(3,4)" />
        <polygon points="0,-38 40,-12 0,13 -40,-12" fill="#1e293b" />
        <polygon points="0,-38 40,-12 0,-12 -40,-12" fill="#334155" opacity="0.45" />
        <rect x="-20" y="11" width="40" height="15" rx="3" fill="#0f172a" />
        <rect x="-20" y="11" width="40" height="5"  rx="3" fill="#1e293b" />
        <circle cx="40" cy="-12" r="4.5" fill="#0f172a" />
        <circle cx="40" cy="-12" r="2.5" fill="#475569" />
        <path d="M40,-12 C52,6 50,22 48,38" stroke="#92400e" strokeWidth="1.8" strokeLinecap="round" />
        <rect x="42" y="36" width="12" height="16" rx="2.5" fill="#78350f" />
        <line x1="44" y1="36" x2="43" y2="53" stroke="#92400e" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="48" y1="36" x2="48" y2="54" stroke="#92400e" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="52" y1="36" x2="53" y2="53" stroke="#92400e" strokeWidth="1.2" strokeLinecap="round" />
      </g>
      <line x1="83"  y1="148" x2="76"  y2="164" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3,3" />
      <line x1="100" y1="150" x2="100" y2="168" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3,3" />
      <line x1="117" y1="148" x2="124" y2="164" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3,3" />
    </svg>
  )
}

/* ── Desktop background scatter ───────────────────────── */
function DesktopDecor() {
  return (
    <div className="hidden md:block absolute inset-0 pointer-events-none select-none overflow-hidden">
      {/* top-left cap */}
      <CapSvg className="absolute -top-6 -left-6 w-52 h-52 text-emerald-400 opacity-[0.13] -rotate-12" />
      {/* top-right cap */}
      <CapSvg className="absolute -top-4 -right-8 w-44 h-44 text-teal-400 opacity-[0.11] rotate-[22deg] scale-x-[-1]" />
      {/* bottom-left scroll */}
      <ScrollSvg className="absolute -bottom-6 -left-4 w-40 h-40 text-emerald-500 opacity-[0.12] -rotate-6" />
      {/* bottom-right scroll */}
      <ScrollSvg className="absolute -bottom-4 -right-6 w-36 h-36 text-teal-500 opacity-[0.10] rotate-[14deg]" />
      {/* mid-left cap (small) */}
      <CapSvg className="absolute top-1/2 -left-8 w-32 h-32 text-green-400 opacity-[0.09] -rotate-[30deg]" />
      {/* mid-right cap (small) */}
      <CapSvg className="absolute top-1/3 -right-4 w-28 h-28 text-teal-300 opacity-[0.10] rotate-[18deg] scale-x-[-1]" />

      {/* stars scattered */}
      <StarSvg className="absolute top-10  left-1/4  w-7  h-7  text-amber-300 opacity-40" />
      <StarSvg className="absolute top-16  right-1/4 w-5  h-5  text-yellow-300 opacity-35" />
      <StarSvg className="absolute top-1/3 left-16   w-6  h-6  text-emerald-300 opacity-30" />
      <StarSvg className="absolute top-1/2 right-20  w-8  h-8  text-amber-200 opacity-30" />
      <StarSvg className="absolute bottom-32 left-1/3 w-5 h-5  text-yellow-400 opacity-35" />
      <StarSvg className="absolute bottom-20 right-1/3 w-6 h-6 text-emerald-300 opacity-30" />
      <StarSvg className="absolute top-3/4  left-24  w-4  h-4  text-teal-300 opacity-40" />
      <StarSvg className="absolute top-20   right-40  w-4  h-4  text-amber-400 opacity-45" />

      {/* dot confetti */}
      {[
        ['top-8',    'left-1/3',   'bg-pink-300',    'w-3 h-3'],
        ['top-20',   'left-2/3',   'bg-blue-300',    'w-2 h-2'],
        ['top-1/4',  'right-1/3',  'bg-purple-300',  'w-3 h-3'],
        ['top-1/2',  'left-1/4',   'bg-yellow-300',  'w-2 h-2'],
        ['top-2/3',  'right-1/4',  'bg-pink-300',    'w-3 h-3'],
        ['bottom-24','left-2/3',   'bg-teal-300',    'w-2 h-2'],
        ['bottom-16','left-1/2',   'bg-amber-300',   'w-3 h-3'],
        ['top-3/4',  'right-1/3',  'bg-blue-200',    'w-2 h-2'],
      ].map(([t, l, bg, size], i) => (
        <span
          key={i}
          className={`absolute ${t} ${l} ${size} ${bg} rounded-full opacity-50`}
        />
      ))}
    </div>
  )
}

/* ── Page ─────────────────────────────────────────────── */
export default function StatusPage() {
  const router = useRouter()
  const [student, setStudent] = useState<Student | null>(null)
  const [school, setSchool] = useState<SchoolSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState(false)
  const letterRef = useRef<HTMLDivElement>(null)

  async function handleDownload() {
    if (!letterRef.current || !student) return
    setDownloading(true)
    try {
      const { toJpeg } = await import('html-to-image')
      const dataUrl = await toJpeg(letterRef.current, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        fetchRequestInit: { cache: 'no-cache' },
      })
      const link = document.createElement('a')
      link.download = `surat-kelulusan-${student.name.replace(/\s+/g, '-').toLowerCase()}.jpg`
      link.href = dataUrl
      link.click()
    } finally {
      setDownloading(false)
    }
  }

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
    <div className={`min-h-screen relative py-8 px-4 ${
      isLulus
        ? 'bg-gradient-to-br from-emerald-100 via-green-50 to-teal-100'
        : 'bg-gradient-to-br from-rose-100 via-red-50 to-orange-50'
    }`}>

      {/* Desktop scattered decorations */}
      {isLulus && <DesktopDecor />}

      <div className="relative z-10">

        {/* Back + Download */}
        <div className="max-w-2xl mx-auto mb-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali
          </button>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-1.5 text-sm bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-60 text-gray-700 px-3 py-1.5 rounded-lg shadow-sm transition-colors"
          >
            {downloading ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                Menyiapkan...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Unduh Surat
              </>
            )}
          </button>
        </div>

        {/* Mobile: illustration above */}
        {isLulus && (
          <div className="md:hidden flex justify-center mb-4">
            <GraduationIllustration />
          </div>
        )}

        {/* Letter card — always centered */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">

            {/* Status banner */}
            <div className={`relative overflow-hidden py-7 text-center ${
              isLulus
                ? 'bg-gradient-to-br from-emerald-400 via-green-500 to-teal-600'
                : 'bg-gradient-to-br from-rose-400 to-red-500'
            }`}>
              <div className="absolute inset-0 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
              <div className="relative flex items-center justify-center gap-4">
                {isLulus && <span className="text-white/50 text-xl select-none">✦</span>}
                <div>
                  <p className="text-white font-semibold text-lg">{student.name}</p>
                  <p className="text-white font-bold tracking-[0.3em] text-base mt-1.5">
                    {isLulus ? 'DINYATAKAN LULUS' : 'DINYATAKAN BELUM LULUS'}
                  </p>
                  {isLulus && (
                    <p className="text-white/70 text-sm tracking-widest mt-1">Selamat atas pencapaianmu</p>
                  )}
                </div>
                {isLulus && <span className="text-white/50 text-xl select-none">✦</span>}
              </div>
            </div>

            <div ref={letterRef} className="px-10 py-8 text-sm text-gray-800">

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
                <div
                  className="letter-content text-gray-700 mb-2"
                  dangerouslySetInnerHTML={{ __html: preamble }}
                />
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
                    ['Nama',        student.name],
                    ['NIS / NISN',  (student.nis || '-') + ' / ' + student.nisn],
                    ['Nomor Ujian', student.exam_number || '-'],
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
                    ['Pada Tanggal',  school.decision_date || ''],
                  ].map(([label, val]) => (
                    <div key={label} className="flex gap-2 mb-0.5">
                      <span className="w-24 shrink-0 text-gray-500">{label}</span>
                      <span className="text-gray-400">:</span>
                      <span>{val}</span>
                    </div>
                  ))}
                  <p className="mt-3 mb-0.5 text-gray-600">Kepala,</p>
                  <p className="text-gray-600 mb-2">{schoolName}</p>

                  <div className="relative h-28 -mt-10 z-10 pointer-events-none">
                    {school.principal_signature_url && (
                      <img src={school.principal_signature_url} alt="Tanda Tangan"
                        className="absolute -left-5 top-0 h-24 object-contain" />
                    )}
                    {school.school_stamp_url && (
                      <img src={school.school_stamp_url} alt="Stempel"
                        className="absolute left-5 top-0 h-28 w-28 object-contain opacity-60" />
                    )}
                  </div>

                  {school.principal_name && (
                    <div className="-mt-8">
                      <p className="font-bold underline">{school.principal_name}</p>
                      {school.principal_nppy && (
                        <p className="text-gray-500 mt-0.5">NPPY. {school.principal_nppy}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
