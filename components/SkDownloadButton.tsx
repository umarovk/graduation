'use client'

import { PDFDownloadLink } from '@react-pdf/renderer'
import { SkPdf } from './SkPdf'
import type { Student, SchoolSettings } from '@/lib/types'

interface Props {
  student: Student
  school: SchoolSettings
}

export default function SkDownloadButton({ student, school }: Props) {
  const fileName = `SK-Kelulusan-${student.name.replace(/\s+/g, '-')}.pdf`

  return (
    <PDFDownloadLink
      document={<SkPdf student={student} school={school} />}
      fileName={fileName}
      style={{ textDecoration: 'none', display: 'block' }}
    >
      {({ loading }: { loading: boolean }) => (
        <div className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-colors ${
          loading ? 'bg-gray-100 text-gray-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
        }`}>
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
              Menyiapkan dokumen...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Unduh Surat Kelulusan (PDF)
            </>
          )}
        </div>
      )}
    </PDFDownloadLink>
  )
}
