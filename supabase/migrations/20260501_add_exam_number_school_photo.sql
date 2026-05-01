-- Migrasi: tambah exam_number ke students dan school_photo_url ke school_settings
ALTER TABLE students        ADD COLUMN IF NOT EXISTS exam_number      TEXT;
ALTER TABLE school_settings ADD COLUMN IF NOT EXISTS school_photo_url TEXT;
