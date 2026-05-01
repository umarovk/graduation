'use client'

import { useState } from 'react'

interface Props {
  value: string        // DD/MM/YYYY
  onChange: (v: string) => void
}

const MONTH_NAMES = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember',
]

function daysInMonth(month: number, year: number) {
  if (!month || !year) return 31
  return new Date(year, month, 0).getDate()
}

function parseValue(v: string) {
  const parts = v ? v.split('/') : []
  return {
    day:   parts[0] ? parseInt(parts[0]) : 0,
    month: parts[1] ? parseInt(parts[1]) : 0,
    year:  parts[2] ? parseInt(parts[2]) : 0,
  }
}

export default function DatePicker({ value, onChange }: Props) {
  const init = parseValue(value)
  const [day,   setDay]   = useState(init.day)
  const [month, setMonth] = useState(init.month)
  const [year,  setYear]  = useState(init.year)

  const maxDays = daysInMonth(month, year)

  function emit(d: number, m: number, y: number) {
    if (d && m && y) {
      const safeDay = Math.min(d, daysInMonth(m, y))
      onChange(`${String(safeDay).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`)
    } else {
      onChange('')
    }
  }

  function handleDay(d: number)   { setDay(d);   emit(d, month, year) }
  function handleMonth(m: number) { setMonth(m); emit(day, m, year) }
  function handleYear(y: number)  { setYear(y);  emit(day, month, y) }

  const selectClass =
    'flex-1 border border-gray-200 rounded-xl px-2 py-3 text-sm bg-gray-50 ' +
    'focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent ' +
    'cursor-pointer'

  return (
    <div className="flex gap-2">
      <select
        value={day || ''}
        onChange={e => handleDay(parseInt(e.target.value) || 0)}
        className={selectClass}
        style={{ color: day ? '#1f2937' : '#9ca3af' }}
      >
        <option value="">Tgl</option>
        {Array.from({ length: maxDays }, (_, i) => i + 1).map(d => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      <select
        value={month || ''}
        onChange={e => handleMonth(parseInt(e.target.value) || 0)}
        className={selectClass}
        style={{ color: month ? '#1f2937' : '#9ca3af' }}
      >
        <option value="">Bulan</option>
        {MONTH_NAMES.map((name, i) => (
          <option key={i + 1} value={i + 1}>{name}</option>
        ))}
      </select>

      <select
        value={year || ''}
        onChange={e => handleYear(parseInt(e.target.value) || 0)}
        className={selectClass}
        style={{ color: year ? '#1f2937' : '#9ca3af' }}
      >
        <option value="">Tahun</option>
        {Array.from({ length: 16 }, (_, i) => 2015 - i).map(y => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </div>
  )
}
