-- ============================================================
-- FOTIA — Script pour créer le premier Super Admin
-- À exécuter dans le SQL Editor de Supabase
-- ============================================================
--
-- INSTRUCTIONS :
-- 1. Connectez-vous à Supabase > SQL Editor
-- 2. Remplacez 'votre-email@exemple.com' par l'email
--    du compte que vous souhaitez promouvoir super_admin
-- 3. Exécutez ce script
-- ============================================================

-- Étape 1 : Récupérez l'ID utilisateur à partir de son email
-- (affiche le user_id pour vérification)
SELECT id, email FROM auth.users WHERE email = 'baaboudigital@gmail.com';
INSERT INTO admin_users (user_id, role)
SELECT id, 'super_admin'
FROM auth.users
WHERE email = 'baaboudigital@gmail.com'
ON CONFLICT DO NOTHING;

-- Vérification : lister tous les admins
SELECT
  au.id,
  au.role,
  p.email,
  p.display_name,
  au.created_at
FROM admin_users au
JOIN profiles p ON p.id = au.user_id
ORDER BY au.created_at;

-- ============================================================
-- Pour promouvoir d'autres membres de l'équipe :
-- ============================================================

-- Admin (peut gérer users, galeries, paiements) :
-- INSERT INTO admin_users (user_id, role)
-- SELECT id, 'admin' FROM auth.users WHERE email = 'admin@exemple.com';

-- Support (lecture seule) :
-- INSERT INTO admin_users (user_id, role)
-- SELECT id, 'support' FROM auth.users WHERE email = 'support@exemple.com';
