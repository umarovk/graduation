-- ============================================================
-- SCHEMA LENGKAP — jalankan sekali untuk setup awal
-- ============================================================

-- Tabel siswa
CREATE TABLE IF NOT EXISTS students (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  nisn           VARCHAR(20)  UNIQUE NOT NULL,
  nis            VARCHAR(20),
  exam_number    TEXT,
  name           VARCHAR(255) NOT NULL,
  address        TEXT,
  date_of_birth  DATE         NOT NULL,
  class          VARCHAR(50),
  status         VARCHAR(20)  DEFAULT 'pending' CHECK (status IN ('lulus', 'tidak_lulus', 'pending')),
  created_at     TIMESTAMPTZ  DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_students_nisn_dob ON students(nisn, date_of_birth);

-- Pengaturan sekolah (1 baris saja)
CREATE TABLE IF NOT EXISTS school_settings (
  id                      INTEGER      PRIMARY KEY DEFAULT 1,
  school_name             VARCHAR(255),
  principal_name          VARCHAR(255),
  principal_nppy          VARCHAR(50),
  letter_number           VARCHAR(100),
  letter_subject          TEXT,
  school_year             VARCHAR(20),
  city                    VARCHAR(100),
  decision_date           VARCHAR(50),
  logo_url                TEXT,
  school_photo_url        TEXT,
  letterhead_url          TEXT,
  principal_signature_url TEXT,
  school_stamp_url        TEXT,
  letter_content          TEXT,
  updated_at              TIMESTAMPTZ  DEFAULT NOW()
);

INSERT INTO school_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

-- Pengaturan countdown (1 baris saja)
CREATE TABLE IF NOT EXISTS countdown_settings (
  id          INTEGER     PRIMARY KEY DEFAULT 1,
  reveal_time TIMESTAMPTZ,
  is_active   BOOLEAN     DEFAULT FALSE,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO countdown_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

-- ============================================================
-- MIGRASI — idempoten, aman dijalankan pada database lama
-- ============================================================
ALTER TABLE students       ADD COLUMN IF NOT EXISTS exam_number       TEXT;
ALTER TABLE school_settings ADD COLUMN IF NOT EXISTS school_photo_url TEXT;

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE students          ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_settings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE countdown_settings ENABLE ROW LEVEL SECURITY;

-- Publik hanya baca school_settings & countdown_settings
CREATE POLICY IF NOT EXISTS "Public read school_settings"   ON school_settings   FOR SELECT TO anon USING (true);
CREATE POLICY IF NOT EXISTS "Public read countdown_settings" ON countdown_settings FOR SELECT TO anon USING (true);

-- Admin (authenticated) akses penuh
CREATE POLICY IF NOT EXISTS "Admin full access students"  ON students        FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Admin full access school"    ON school_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Admin full access countdown" ON countdown_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================
-- STORAGE (jalankan di Supabase Dashboard > Storage jika belum ada)
-- Buat bucket bernama "school-assets" dengan akses public
-- ============================================================
