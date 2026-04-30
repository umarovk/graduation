import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
} from '@react-pdf/renderer'
import type { Student, SchoolSettings } from '@/lib/types'

const F = {
  normal: 'Helvetica',
  bold: 'Helvetica-Bold',
  mono: 'Courier',
}

const S = StyleSheet.create({
  page: {
    fontFamily: F.normal,
    fontSize: 10,
    color: '#000',
    paddingTop: 43,
    paddingBottom: 43,
    paddingHorizontal: 57,
    lineHeight: 1.4,
  },

  /* ─── kop surat fallback ─── */
  headerBox: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 6 },
  logo: { width: 54, height: 54 },
  headerCenter: { flex: 1, textAlign: 'center' },
  headerSchool: { fontFamily: F.bold, fontSize: 12 },
  dividerThick: { borderBottomWidth: 3.5, borderBottomColor: '#000', marginTop: 4, marginBottom: 2 },
  dividerThin: { borderBottomWidth: 1, borderBottomColor: '#000', marginBottom: 10 },

  /* ─── judul ─── */
  titleSection: { textAlign: 'center', marginBottom: 2 },
  titleText: { fontFamily: F.bold, textDecoration: 'underline', textAlign: 'center', fontSize: 10 },

  /* ─── perihal ─── */
  perihalSection: { textAlign: 'center', marginBottom: 10 },
  perihalSubject: { fontFamily: F.bold },

  /* ─── isi ─── */
  opener: { marginBottom: 6 },
  preamble: { fontFamily: F.mono, fontSize: 9, lineHeight: 1.5, marginBottom: 6 },
  memutuskan: { fontFamily: F.bold, textAlign: 'center', letterSpacing: 2, marginTop: 10, marginBottom: 8 },
  menetapkan: { fontFamily: F.bold, marginBottom: 4 },

  /* ─── tabel Pertama/Kedua ─── */
  row: { flexDirection: 'row', marginBottom: 2 },
  label: { width: 60 },
  colon: { width: 14 },
  cell: { flex: 1 },

  /* ─── baris dalam Pertama ─── */
  iRow: { flexDirection: 'row', marginBottom: 1 },
  iLabel: { width: 60 },
  iColon: { width: 14 },
  iCell: { flex: 1 },
  statusBold: { fontFamily: F.bold },

  /* ─── tanda tangan ─── */
  sigOuter: { alignItems: 'flex-end', marginTop: 20 },
  sigInner: { width: 215 },
  sigRow: { flexDirection: 'row', marginBottom: 1 },
  sigLabel: { width: 72 },
  sigColon: { width: 12 },
  sigVal: { flex: 1 },
  sigImgArea: { height: 70, marginVertical: 6 },
  sigImg: { position: 'absolute', left: 0, top: 6, height: 52 },
  stampImg: { position: 'absolute', left: 22, top: 0, height: 66, width: 66, opacity: 0.65 },
  principalName: { fontFamily: F.bold, textDecoration: 'underline', marginTop: 1 },
})

interface Props {
  student: Student
  school: SchoolSettings
}

export function SkPdf({ student, school }: Props) {
  const isLulus = student.status === 'lulus'
  const schoolName = school.school_name || 'Sekolah'

  const preamble = (school.letter_content || '')
    .replace(/{nama_sekolah}/g, schoolName)
    .replace(/{tahun_ajaran}/g, school.school_year || '')

  return (
    <Document>
      <Page size="A4" style={S.page}>

        {/* ── Kop Surat ── */}
        {school.letterhead_url ? (
          <Image src={school.letterhead_url} style={{ width: '100%', marginBottom: 4 }} />
        ) : (
          <>
            <View style={S.headerBox}>
              {school.logo_url && <Image src={school.logo_url} style={S.logo} />}
              <View style={S.headerCenter}>
                <Text style={S.headerSchool}>{schoolName.toUpperCase()}</Text>
              </View>
            </View>
            <View style={S.dividerThick} />
            <View style={S.dividerThin} />
          </>
        )}

        {/* ── Judul ── */}
        <View style={S.titleSection}>
          <Text style={S.titleText}>
            {'SURAT KEPUTUSAN KEPALA ' + schoolName.toUpperCase()}
          </Text>
          {school.letter_number ? (
            <Text style={{ textAlign: 'center', marginTop: 2 }}>
              {'Nomor : ' + school.letter_number}
            </Text>
          ) : null}
        </View>

        {/* ── Perihal ── */}
        {(school.letter_subject || school.school_year) ? (
          <View style={[S.perihalSection, { marginTop: 8 }]}>
            <Text>tentang</Text>
            {school.letter_subject ? (
              <Text style={S.perihalSubject}>{school.letter_subject}</Text>
            ) : null}
            {school.school_year ? (
              <Text>{'Tahun Ajaran ' + school.school_year}</Text>
            ) : null}
          </View>
        ) : <View style={{ marginBottom: 10 }} />}

        {/* ── Pembuka ── */}
        <Text style={S.opener}>
          {'Atas Berkat Rahmat Allah Yang Maha Kuasa, Kepala ' + schoolName + ' :'}
        </Text>

        {/* ── Menimbang / Mengingat / Memperhatikan ── */}
        {preamble ? <Text style={S.preamble}>{preamble}</Text> : null}

        {/* ── MEMUTUSKAN ── */}
        <Text style={S.memutuskan}>M E M U T U S K A N</Text>
        <Text style={S.menetapkan}>Menetapkan</Text>

        {/* ── Pertama ── */}
        <View style={S.row}>
          <Text style={S.label}>Pertama</Text>
          <Text style={S.colon}>:</Text>
          <View style={S.cell}>
            <View style={S.iRow}>
              <Text style={S.iLabel}>Nama</Text>
              <Text style={S.iColon}>:</Text>
              <Text style={S.iCell}>{student.name}</Text>
            </View>
            <View style={S.iRow}>
              <Text style={S.iLabel}>NIS / NISN</Text>
              <Text style={S.iColon}>:</Text>
              <Text style={S.iCell}>{(student.nis || '-') + ' / ' + student.nisn}</Text>
            </View>
            <View style={S.iRow}>
              <Text style={S.iLabel}>Nomor Ujian</Text>
              <Text style={S.iColon}>:</Text>
              <Text style={S.iCell}>-</Text>
            </View>
            <View style={S.iRow}>
              <Text style={S.iLabel}>Dinyatakan</Text>
              <Text style={S.iColon}>:</Text>
              <View style={S.iCell}>
                <Text style={S.statusBold}>{isLulus ? 'LULUS' : 'TIDAK LULUS'}</Text>
                <Text>{'dalam menempuh pendidikan di ' + schoolName}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Kedua ── */}
        <View style={[S.row, { marginTop: 4 }]}>
          <Text style={S.label}>Kedua</Text>
          <Text style={S.colon}>:</Text>
          <Text style={[S.cell, { textAlign: 'justify' }]}>
            Keputusan ini berlaku sejak tanggal ditetapkan dengan ketentuan apabila
            ternyata terdapat kekeliruan dalam keputusan ini akan diadakan
            perbaikan sebagaimana mestinya.
          </Text>
        </View>

        {/* ── Tanda Tangan ── */}
        <View style={S.sigOuter}>
          <View style={S.sigInner}>
            <View style={S.sigRow}>
              <Text style={S.sigLabel}>Ditetapkan di</Text>
              <Text style={S.sigColon}>:</Text>
              <Text style={S.sigVal}>{school.city || ''}</Text>
            </View>
            <View style={S.sigRow}>
              <Text style={S.sigLabel}>Pada Tanggal</Text>
              <Text style={S.sigColon}>:</Text>
              <Text style={S.sigVal}>{school.decision_date || ''}</Text>
            </View>
            <Text style={{ marginTop: 2 }}>Kepala,</Text>
            <Text>{schoolName}</Text>

            <View style={S.sigImgArea}>
              {school.principal_signature_url ? (
                <Image src={school.principal_signature_url} style={S.sigImg} />
              ) : null}
              {school.school_stamp_url ? (
                <Image src={school.school_stamp_url} style={S.stampImg} />
              ) : null}
            </View>

            {school.principal_name ? (
              <>
                <Text style={S.principalName}>{school.principal_name}</Text>
                {school.principal_nppy ? (
                  <Text>{'NPPY. ' + school.principal_nppy}</Text>
                ) : null}
              </>
            ) : null}
          </View>
        </View>

      </Page>
    </Document>
  )
}
