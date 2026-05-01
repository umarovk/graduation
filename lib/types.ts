export interface Student {
  id: string
  nisn: string
  nis: string | null
  exam_number: string | null
  name: string
  address: string | null
  date_of_birth: string
  class: string | null
  status: 'lulus' | 'tidak_lulus' | 'pending'
  created_at: string
  updated_at: string
}

export interface SchoolSettings {
  id: number
  school_name: string | null
  principal_name: string | null
  principal_nppy: string | null
  letter_number: string | null
  letter_subject: string | null
  school_year: string | null
  city: string | null
  decision_date: string | null
  logo_url: string | null
  school_photo_url: string | null
  letterhead_url: string | null
  principal_signature_url: string | null
  school_stamp_url: string | null
  letter_content: string | null
  updated_at: string
}

export interface CountdownSettings {
  id: number
  reveal_time: string | null
  is_active: boolean
  updated_at: string
}
