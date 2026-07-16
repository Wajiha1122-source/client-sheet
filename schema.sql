CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS offices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('CEO', 'OFFICE')),
  office_id UUID REFERENCES offices(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS entry_months (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id UUID NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
  month_key TEXT NOT NULL,
  title TEXT NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (office_id, month_key)
);

CREATE TABLE IF NOT EXISTS client_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month_id UUID NOT NULL REFERENCES entry_months(id) ON DELETE CASCADE,
  office_id UUID NOT NULL REFERENCES offices(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  id_number TEXT,
  city_area TEXT,
  business_name TEXT,
  phone_whatsapp TEXT,
  consumer_type TEXT[],
  interested_in TEXT[],
  lead_quality TEXT[],
  timeline TEXT[],
  market TEXT[],
  experience TEXT[],
  knowledge_baseline TEXT[],
  handled_by TEXT,
  visit_date_time TIMESTAMPTZ,
  visitor_no TEXT,
  forwarded_by TEXT,
  notes TEXT,
  client_name TEXT NOT NULL,
  address TEXT NOT NULL,
  contact TEXT NOT NULL,
  query TEXT NOT NULL,
  result TEXT NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE client_entries ADD COLUMN IF NOT EXISTS id_number TEXT;
ALTER TABLE client_entries ADD COLUMN IF NOT EXISTS city_area TEXT;
ALTER TABLE client_entries ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE client_entries ADD COLUMN IF NOT EXISTS phone_whatsapp TEXT;
ALTER TABLE client_entries ADD COLUMN IF NOT EXISTS consumer_type TEXT[];
ALTER TABLE client_entries ADD COLUMN IF NOT EXISTS interested_in TEXT[];
ALTER TABLE client_entries ADD COLUMN IF NOT EXISTS lead_quality TEXT[];
ALTER TABLE client_entries ADD COLUMN IF NOT EXISTS timeline TEXT[];
ALTER TABLE client_entries ADD COLUMN IF NOT EXISTS market TEXT[];
ALTER TABLE client_entries ADD COLUMN IF NOT EXISTS experience TEXT[];
ALTER TABLE client_entries ADD COLUMN IF NOT EXISTS knowledge_baseline TEXT[];
DO $$
DECLARE
  target_column TEXT;
BEGIN
  FOREACH target_column IN ARRAY ARRAY[
    'consumer_type',
    'interested_in',
    'lead_quality',
    'timeline',
    'market',
    'experience',
    'knowledge_baseline'
  ]
  LOOP
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns AS c
      WHERE c.table_name = 'client_entries'
        AND c.column_name = target_column
        AND data_type <> 'ARRAY'
    ) THEN
      EXECUTE format(
        'ALTER TABLE client_entries ALTER COLUMN %1$I TYPE TEXT[] USING CASE WHEN %1$I IS NULL OR btrim(%1$I::text) = '''' THEN NULL ELSE array_remove(string_to_array(%1$I::text, '', ''), '''') END',
        target_column
      );
    END IF;
  END LOOP;
END $$;
ALTER TABLE client_entries ADD COLUMN IF NOT EXISTS handled_by TEXT;
ALTER TABLE client_entries ADD COLUMN IF NOT EXISTS visit_date_time TIMESTAMPTZ;
ALTER TABLE client_entries ADD COLUMN IF NOT EXISTS visitor_no TEXT;
ALTER TABLE client_entries ADD COLUMN IF NOT EXISTS forwarded_by TEXT;
ALTER TABLE client_entries ADD COLUMN IF NOT EXISTS notes TEXT;

CREATE INDEX IF NOT EXISTS idx_client_entries_office_month ON client_entries(office_id, month_id);
CREATE INDEX IF NOT EXISTS idx_client_entries_date ON client_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_entry_months_office ON entry_months(office_id, month_key);
