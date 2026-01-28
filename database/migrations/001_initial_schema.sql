-- KLAP Database Schema
-- Version: 001 - Initial Schema

-- =====================================================
-- TABLES
-- =====================================================

-- Table: sessions
-- Stocke les sessions d'enseignement (événements)
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  join_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'closed')),
  active_item_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour rechercher par join_code (utilisé par les élèves)
CREATE INDEX IF NOT EXISTS idx_sessions_join_code ON public.sessions(join_code);
CREATE INDEX IF NOT EXISTS idx_sessions_owner ON public.sessions(owner_user_id);

-- Table: items
-- Stocke les questions/étapes d'une session
CREATE TABLE IF NOT EXISTS public.items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('poll_single', 'poll_multi', 'wordcloud', 'open', 'scale')),
  title TEXT NOT NULL,
  prompt TEXT,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_items_session ON public.items(session_id, order_index);

-- Table: participants
-- Stocke les participants (élèves) d'une session
CREATE TABLE IF NOT EXISTS public.participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL,
  nickname TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(session_id, participant_id)
);

CREATE INDEX IF NOT EXISTS idx_participants_session ON public.participants(session_id);

-- Table: responses
-- Stocke les réponses des participants
CREATE TABLE IF NOT EXISTS public.responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.items(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_responses_item ON public.responses(item_id);
CREATE INDEX IF NOT EXISTS idx_responses_session ON public.responses(session_id);
CREATE INDEX IF NOT EXISTS idx_responses_participant ON public.responses(participant_id);

-- Table: moderation
-- Stocke les statuts de modération pour les réponses (wordcloud, open)
CREATE TABLE IF NOT EXISTS public.moderation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  response_id UUID NOT NULL REFERENCES public.responses(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'hidden')),
  moderated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(response_id)
);

CREATE INDEX IF NOT EXISTS idx_moderation_response ON public.moderation(response_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Fonction pour générer un code de session unique (6 caractères alphanumériques)
CREATE OR REPLACE FUNCTION generate_join_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Fonction trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON public.items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_moderation_updated_at BEFORE UPDATE ON public.moderation
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLICIES: sessions
-- =====================================================

-- Les enseignants peuvent voir leurs propres sessions
CREATE POLICY "Teachers can view own sessions"
  ON public.sessions FOR SELECT
  USING (auth.uid() = owner_user_id);

-- Les enseignants peuvent créer des sessions
CREATE POLICY "Teachers can create sessions"
  ON public.sessions FOR INSERT
  WITH CHECK (auth.uid() = owner_user_id);

-- Les enseignants peuvent modifier leurs propres sessions
CREATE POLICY "Teachers can update own sessions"
  ON public.sessions FOR UPDATE
  USING (auth.uid() = owner_user_id);

-- Les enseignants peuvent supprimer leurs propres sessions
CREATE POLICY "Teachers can delete own sessions"
  ON public.sessions FOR DELETE
  USING (auth.uid() = owner_user_id);

-- Les élèves (anonymes) peuvent voir les sessions ouvertes via join_code
CREATE POLICY "Anyone can view open sessions by join_code"
  ON public.sessions FOR SELECT
  USING (status = 'open');

-- =====================================================
-- POLICIES: items
-- =====================================================

-- Les enseignants peuvent voir les items de leurs sessions
CREATE POLICY "Teachers can view own session items"
  ON public.items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions
      WHERE sessions.id = items.session_id
      AND sessions.owner_user_id = auth.uid()
    )
  );

-- Les enseignants peuvent créer des items dans leurs sessions
CREATE POLICY "Teachers can create items in own sessions"
  ON public.items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sessions
      WHERE sessions.id = session_id
      AND sessions.owner_user_id = auth.uid()
    )
  );

-- Les enseignants peuvent modifier les items de leurs sessions
CREATE POLICY "Teachers can update own session items"
  ON public.items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions
      WHERE sessions.id = items.session_id
      AND sessions.owner_user_id = auth.uid()
    )
  );

-- Les enseignants peuvent supprimer les items de leurs sessions
CREATE POLICY "Teachers can delete own session items"
  ON public.items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions
      WHERE sessions.id = items.session_id
      AND sessions.owner_user_id = auth.uid()
    )
  );

-- Les élèves peuvent voir les items des sessions ouvertes
CREATE POLICY "Anyone can view items of open sessions"
  ON public.items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions
      WHERE sessions.id = items.session_id
      AND sessions.status = 'open'
    )
  );

-- =====================================================
-- POLICIES: participants
-- =====================================================

-- Les enseignants peuvent voir les participants de leurs sessions
CREATE POLICY "Teachers can view session participants"
  ON public.participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions
      WHERE sessions.id = participants.session_id
      AND sessions.owner_user_id = auth.uid()
    )
  );

-- Les élèves peuvent s'enregistrer comme participants
CREATE POLICY "Anyone can join open sessions"
  ON public.participants FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sessions
      WHERE sessions.id = session_id
      AND sessions.status = 'open'
    )
  );

-- =====================================================
-- POLICIES: responses
-- =====================================================

-- Les enseignants peuvent voir les réponses de leurs sessions
CREATE POLICY "Teachers can view session responses"
  ON public.responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions
      WHERE sessions.id = responses.session_id
      AND sessions.owner_user_id = auth.uid()
    )
  );

-- Les élèves peuvent soumettre des réponses
CREATE POLICY "Anyone can submit responses to open sessions"
  ON public.responses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sessions
      WHERE sessions.id = session_id
      AND sessions.status = 'open'
    )
  );

-- Les élèves peuvent voir leurs propres réponses
CREATE POLICY "Participants can view own responses"
  ON public.responses FOR SELECT
  USING (true);

-- =====================================================
-- POLICIES: moderation
-- =====================================================

-- Les enseignants peuvent voir et gérer la modération de leurs sessions
CREATE POLICY "Teachers can manage moderation"
  ON public.moderation FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.responses
      JOIN public.sessions ON sessions.id = responses.session_id
      WHERE responses.id = moderation.response_id
      AND sessions.owner_user_id = auth.uid()
    )
  );
