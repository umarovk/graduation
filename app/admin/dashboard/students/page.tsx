'use client'

import { useState, useEffect, useRef } from 'react'
import Papa from 'papaparse'
import type { Student } from '@/lib/types'

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  lulus: { label: 'Lulus', cls: 'bg-green-100 text-green-700' },
  tidak_lulus: { label: 'Tidak Lulus', cls: 'bg-red-100 text-red-700' },
  pending: { label: 'Belum Ditentukan', cls: 'bg-yellow-100 text-yellow-700' },
}

function formatDob(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

type StudentStatus = 'lulus' | 'tidak_lulus' | 'pending'
type StudentForm = { nisn: string; nis: string; name: string; address: string; date_of_birth: string; class: string; status: StudentStatus }
const EMPTY_FORM: StudentForm = { nisn: '', nis: '', name: '', address: '', date_of_birth: '', class: '', status: 'pending' }

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [modal, setModal] = useState<'add' | 'edit' | 'import' | null>(null)
  const [editStudent, setEditStudent] = useState<Student | null>(null)
  const [form, setForm] = useState<StudentForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [csvData, setCsvData] = useState<Record<string, string>[]>([])
  const [importing, setImporting] = useState(false)
  const [toast, setToast] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const LIMIT = 20

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  async function loadStudents() {
    setLoading(true)
    const res = await fetch(`/api/admin/students?page=${page}&limit=${LIMIT}&search=${encodeURIComponent(search)}`)
    const data = await res.json()
    setStudents(data.students || [])
    setTotal(data.total || 0)
    setLoading(false)
  }

  useEffect(() => { loadStudents() }, [page, search])

  function openAdd() {
    setForm(EMPTY_FORM)
    setError('')
    setModal('add')
  }

  function openEdit(s: Student) {
    const [y, m, d] = s.date_of_birth.split('-')
    setForm({
      nisn: s.nisn,
      nis: s.nis || '',
      name: s.name,
      address: s.address || '',
      date_of_birth: `${d}/${m}/${y}`,
      class: s.class || '',
      status: s.status,
    })
    setEditStudent(s)
    setError('')
    setModal('edit')
  }

  async function handleSave() {
    setError('')
    setSaving(true)
    try {
      const url = modal === 'edit' ? `/api/admin/students/${editStudent!.id}` : '/api/admin/students'
      const method = modal === 'edit' ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Gagal menyimpan'); return }
      setModal(null)
      loadStudents()
      showToast(modal === 'edit' ? 'Data siswa diperbarui' : 'Siswa berhasil ditambahkan')
    } catch {
      setError('Terjadi kesalahan')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus data siswa ini?')) return
    const res = await fetch(`/api/admin/students/${id}`, { method: 'DELETE' })
    if (res.ok) { loadStudents(); showToast('Siswa dihapus') }
  }

  async function handleBulkDelete() {
    if (selected.size === 0) return
    if (!confirm(`Hapus ${selected.size} siswa yang dipilih?`)) return
    const res = await fetch('/api/admin/students', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: Array.from(selected) }),
    })
    if (res.ok) { setSelected(new Set()); loadStudents(); showToast(`${selected.size} siswa dihapus`) }
  }

  function handleCsvFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: result => {
        setCsvData(result.data)
        setModal('import')
      },
    })
  }

  async function handleImport() {
    setImporting(true)
    const res = await fetch('/api/admin/students/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ students: csvData }),
    })
    const data = await res.json()
    if (res.ok) {
      setModal(null)
      setCsvData([])
      loadStudents()
      showToast(`${data.inserted} data berhasil diimport`)
    } else {
      setError(data.error || 'Gagal import')
    }
    setImporting(false)
  }

  const totalPages = Math.ceil(total / LIMIT)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Data Siswa</h1>
          <p className="text-sm text-gray-500 mt-1">{total} siswa terdaftar</p>
        </div>
        <div className="flex gap-2">
          <a
            href="/template-import-siswa.csv"
            download
            className="flex items-center gap-2 text-sm bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg text-gray-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            Template CSV
          </a>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 text-sm bg-white border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            Import CSV
          </button>
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCsvFile} />
          <button
            onClick={openAdd}
            className="flex items-center gap-2 text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Siswa
          </button>
        </div>
      </div>

      {/* Search + bulk delete */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Cari nama, NISN, atau NIS..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {selected.size > 0 && (
          <button
            onClick={handleBulkDelete}
            className="flex items-center gap-2 text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            Hapus {selected.size} dipilih
          </button>
        )}
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-10 px-4 py-3">
                <input
                  type="checkbox"
                  checked={students.length > 0 && selected.size === students.length}
                  onChange={e => setSelected(e.target.checked ? new Set(students.map(s => s.id)) : new Set())}
                  className="rounded"
                />
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Nama</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">NISN</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">NIS</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Kelas</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Tgl Lahir</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-600">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gray-400">
                  Belum ada data siswa
                </td>
              </tr>
            ) : (
              students.map(s => {
                const statusInfo = STATUS_LABELS[s.status] || STATUS_LABELS.pending
                return (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(s.id)}
                        onChange={e => {
                          const next = new Set(selected)
                          e.target.checked ? next.add(s.id) : next.delete(s.id)
                          setSelected(next)
                        }}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">{s.name}</td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">{s.nisn}</td>
                    <td className="px-4 py-3 text-gray-600">{s.nis || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{s.class || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{formatDob(s.date_of_birth)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.cls}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openEdit(s)} className="text-blue-600 hover:text-blue-800 mr-3 text-xs font-medium">Edit</button>
                      <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:text-red-800 text-xs font-medium">Hapus</button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-gray-500">
              Menampilkan {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} dari {total}
            </p>
            <div className="flex gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 text-xs border border-gray-200 rounded disabled:opacity-40 hover:bg-gray-100"
              >
                Prev
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 text-xs border border-gray-200 rounded disabled:opacity-40 hover:bg-gray-100"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal tambah/edit */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">
                {modal === 'add' ? 'Tambah Siswa' : 'Edit Siswa'}
              </h3>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-4 space-y-3">
              {[
                { key: 'nisn', label: 'NISN *', placeholder: '1234567890' },
                { key: 'nis', label: 'NIS', placeholder: '12345' },
                { key: 'name', label: 'Nama Lengkap *', placeholder: 'Budi Santoso' },
                { key: 'address', label: 'Alamat', placeholder: 'Jl. Merdeka No. 1' },
                { key: 'date_of_birth', label: 'Tanggal Lahir * (DD/MM/YYYY)', placeholder: '15/07/2007' },
                { key: 'class', label: 'Kelas', placeholder: 'XII IPA 1' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
                  <input
                    type="text"
                    placeholder={placeholder}
                    value={(form as Record<string, string>)[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm(f => ({ ...f, status: e.target.value as StudentStatus }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Belum Ditentukan</option>
                  <option value="lulus">Lulus</option>
                  <option value="tidak_lulus">Tidak Lulus</option>
                </select>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
              <button onClick={() => setModal(null)} className="text-sm text-gray-600 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg"
              >
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal import CSV */}
      {modal === 'import' && csvData.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-800">Preview Import CSV ({csvData.length} baris)</h3>
              <button onClick={() => { setModal(null); setCsvData([]) }} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-4 bg-yellow-50 border-b border-yellow-100 text-xs text-yellow-700">
              Format CSV: kolom <code>nisn</code>, <code>nis</code>, <code>nama</code>, <code>alamat</code>, <code>tanggal_lahir</code> (DD/MM/YYYY), <code>kelas</code>, <code>status</code> (lulus/tidak_lulus/pending)
            </div>

            <div className="overflow-auto flex-1 p-4">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50">
                    {Object.keys(csvData[0]).map(key => (
                      <th key={key} className="px-2 py-1.5 text-left font-semibold text-gray-600 border border-gray-200">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvData.slice(0, 10).map((row, i) => (
                    <tr key={i} className="border-b border-gray-100">
                      {Object.values(row).map((val, j) => (
                        <td key={j} className="px-2 py-1.5 border border-gray-100 text-gray-700">{String(val)}</td>
                      ))}
                    </tr>
                  ))}
                  {csvData.length > 10 && (
                    <tr>
                      <td colSpan={Object.keys(csvData[0]).length} className="px-2 py-2 text-center text-gray-400 italic">
                        ...dan {csvData.length - 10} baris lainnya
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {error && (
              <div className="mx-4 mb-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end">
              <button onClick={() => { setModal(null); setCsvData([]) }} className="text-sm text-gray-600 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                Batal
              </button>
              <button
                onClick={handleImport}
                disabled={importing}
                className="text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg"
              >
                {importing ? 'Mengimport...' : `Import ${csvData.length} Data`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-slate-800 text-white px-5 py-3 rounded-xl shadow-lg text-sm z-50">
          {toast}
        </div>
      )}
    </div>
  )
}
