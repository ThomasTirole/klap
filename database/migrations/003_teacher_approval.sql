-- Migration 003: Teacher Approval System
-- Ajoute un système d'approbation pour les comptes enseignants

-- =====================================================
-- TABLE: teacher_profiles
-- =====================================================

-- Table pour stocker les profils enseignants avec statut d'approbation
CREATE TABLE IF NOT EXISTS public.teacher_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  approved BOOLEAN NOT NULL DEFAULT false,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teacher_profiles_user ON public.teacher_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_teacher_profiles_approved ON public.teacher_profiles(approved);

-- =====================================================
-- TRIGGER: Créer automatiquement un profil à l'inscription
-- =====================================================

CREATE OR REPLACE FUNCTION create_teacher_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.teacher_profiles (user_id, email, approved)
  VALUES (NEW.id, NEW.email, false);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger sur auth.users pour créer un profil automatiquement
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_teacher_profile();

-- =====================================================
-- FUNCTION: Notification par email (optionnel)
-- =====================================================

-- Cette fonction peut être appelée par un Edge Function pour envoyer un email
-- Pour l'instant, elle log juste dans une table de notifications

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION notify_new_teacher_request()
RETURNS TRIGGER AS $$
BEGIN
  -- Créer une notification pour l'admin
  -- Vous devrez configurer un Edge Function ou un webhook pour envoyer l'email
  INSERT INTO public.notifications (type, recipient_email, data)
  VALUES (
    'new_teacher_request',
    'admin@klap.app', -- Remplacez par votre email
    jsonb_build_object(
      'user_id', NEW.user_id,
      'email', NEW.email,
      'requested_at', NEW.requested_at
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_teacher_profile_created
  AFTER INSERT ON public.teacher_profiles
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_teacher_request();

-- =====================================================
-- RLS: teacher_profiles
-- =====================================================

ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;

-- Les enseignants peuvent voir leur propre profil
CREATE POLICY "Users can view own profile"
  ON public.teacher_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Pas de policy pour INSERT car c'est géré par le trigger
-- Seuls les admins peuvent modifier le statut approved (à faire en direct via SQL)

-- =====================================================
-- RLS: notifications (admin only)
-- =====================================================

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Pour l'instant, personne ne peut lire les notifications via l'app
-- Vous les lirez directement dans Supabase SQL Editor
-- Plus tard, vous pourrez créer un rôle admin

-- =====================================================
-- FONCTION: Approuver un enseignant
-- =====================================================

-- Fonction helper pour approuver un enseignant
-- À appeler manuellement via SQL Editor pour l'instant
CREATE OR REPLACE FUNCTION approve_teacher(teacher_user_id UUID, admin_user_id UUID DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.teacher_profiles
  SET
    approved = true,
    approved_at = NOW(),
    approved_by = admin_user_id
  WHERE user_id = teacher_user_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- EXEMPLE D'UTILISATION
-- =====================================================

-- Pour approuver un enseignant manuellement :
-- SELECT approve_teacher('USER_UUID_ICI');

-- Pour voir les demandes en attente :
-- SELECT * FROM public.teacher_profiles WHERE approved = false ORDER BY requested_at DESC;

-- Pour voir toutes les notifications :
-- SELECT * FROM public.notifications WHERE sent = false ORDER BY created_at DESC;
