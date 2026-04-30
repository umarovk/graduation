'use client'

import { PDFViewer } from '@react-pdf/renderer'
import { SkPdf } from './SkPdf'
import type { Student, SchoolSettings } from '@/lib/types'

interface Props {
  student: Student
  school: SchoolSettings
}

export default function SkCertificateViewer({ student, school }: Props) {
  return (
    <PDFViewer
      width="100%"
      height={880}
      style={{ border: 'none' }}
      showToolbar={true}
    >
      <SkPdf student={student} school={school} />
    </PDFViewer>
  )
}
