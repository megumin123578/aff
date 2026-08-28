ALTER TABLE articles DROP CONSTRAINT IF EXISTS articles_status_check;
ALTER TABLE articles ADD CONSTRAINT articles_status_check CHECK (status IN ('draft', 'published', 'pending'));

ALTER TABLE articles ADD COLUMN IF NOT EXISTS author_name text NOT NULL DEFAULT '';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS author_email text NOT NULL DEFAULT '';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS author_avatar text NOT NULL DEFAULT '';
