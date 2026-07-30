-- ============================================================
-- WIL Admin Tables Setup
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. POST QUEUE
CREATE TABLE IF NOT EXISTS post_queue (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quality_name     TEXT NOT NULL,
  pillar           TEXT NOT NULL,
  post_day         INTEGER NOT NULL,
  caption          TEXT NOT NULL,
  visual_direction TEXT,
  post_date        DATE NOT NULL,
  status           TEXT NOT NULL DEFAULT 'pending_review',
  founder_notes    TEXT,
  approved_at      TIMESTAMPTZ,
  facebook_post_id TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. ENGAGEMENT QUEUE
CREATE TABLE IF NOT EXISTS engagement_queue (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id            TEXT NOT NULL,
  sender_name          TEXT NOT NULL,
  source               TEXT NOT NULL DEFAULT 'messenger',
  classification       TEXT NOT NULL,
  message_text         TEXT NOT NULL,
  suggested_reply      TEXT,
  crisis_flag          BOOLEAN NOT NULL DEFAULT FALSE,
  status               TEXT NOT NULL DEFAULT 'pending',
  sent_reply           TEXT,
  founder_reviewed_at  TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_post_queue_updated_at ON post_queue;
CREATE TRIGGER trg_post_queue_updated_at
  BEFORE UPDATE ON post_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_engagement_queue_updated_at ON engagement_queue;
CREATE TRIGGER trg_engagement_queue_updated_at
  BEFORE UPDATE ON engagement_queue
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 4. RLS — admin-only (service role bypasses this, but good practice)
ALTER TABLE post_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_queue ENABLE ROW LEVEL SECURITY;

-- 5. SEED DATA — realistic demo rows for screencast
INSERT INTO post_queue (quality_name, pillar, post_day, caption, visual_direction, post_date, status) VALUES
(
  'Love Is Patient',
  'scripture_application',
  1,
  'Patience isn''t passive. It''s one of the hardest acts of love — choosing to trust God''s timing when everything in you wants to move faster. Philippians 4:6 reminds us: don''t be anxious about anything. That includes the people we love.\n\n100 Days In Love starts with this. Not because it''s easy. Because it''s foundational.\n\n📖 What''s one area where God is asking you to be patient right now?',
  'Warm cream background, handwritten "patient" in Covenant Navy, soft morning light aesthetic',
  CURRENT_DATE + 1,
  'pending_review'
),
(
  'Love Is Kind',
  'clinical_insight',
  8,
  'Kindness is a choice, not a feeling. In relationships under stress, we often wait until we feel kind before we act kind. Research in attachment theory shows the opposite is more effective — act kind first, and the feelings follow.\n\nThis is what the therapeutic community calls behavioral activation. And it''s what Scripture has been teaching for thousands of years.\n\nWhat one act of kindness can you offer today — not because it''s earned, but because love leads?',
  'Deep navy with gold accent line, clean serif typography, no clutter',
  CURRENT_DATE + 3,
  'pending_review'
),
(
  'Love Does Not Envy',
  'mirror',
  15,
  'Envy says: I deserve what they have. Love says: I want good things for them.\n\nOne of the quietest ways envy enters a relationship is comparison — measuring your partner''s progress against your expectations. When we stop comparing and start celebrating, something shifts.\n\nWhere might comparison be stealing your peace right now?',
  'Manna Cream background, minimalist, one small gold heart icon, italic scripture',
  CURRENT_DATE + 6,
  'pending_review'
);

INSERT INTO engagement_queue (sender_id, sender_name, source, classification, message_text, suggested_reply, crisis_flag, status) VALUES
(
  '7891234567',
  'Marcus W.',
  'Messenger',
  'question',
  'Hey! I saw your post about 100 Days in Love. I''m going through a rough patch with my wife and wondering if this is something we could do together or if it''s more of a solo thing?',
  'Hi Marcus — so glad this landed at the right time. 100 Days In Love is designed as a personal journey first — you go through it individually, doing your own reflection and journaling. Many couples find it powerful to go through it at the same time, then share what they''re learning. It creates conversation without pressure. You can start at wrappedinlove.app anytime you''re ready.',
  FALSE,
  'pending'
),
(
  '3456789012',
  'Keisha T.',
  'Comment',
  'encouragement',
  'This page is such a blessing. I started Day 1 yesterday and cried the whole way through. In the best way. Thank you for building this.',
  'Keisha, this means everything. The tears on Day 1 are often God doing something real — don''t rush past that. We''re honored to walk this 100 days with you.',
  FALSE,
  'pending'
),
(
  '9012345678',
  'Anonymous',
  'Messenger',
  'sensitive',
  'I don''t know who else to tell this to. My husband hasn''t spoken to me in 3 days and I''m scared. I don''t know if this relationship can be saved.',
  '',
  FALSE,
  'pending'
),
(
  '5678901234',
  'David R.',
  'Comment',
  'hostile',
  'This is just religious propaganda. Relationships fail because people are incompatible, not because they didn''t pray enough. Stop giving people false hope.',
  '',
  FALSE,
  'pending'
);
