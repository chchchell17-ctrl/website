-- Screen 02 Student Profile, Tutorial, Settings, Inventory & Progress Extension

alter table public.students
  add column if not exists detective_nickname text not null default '',
  add column if not exists tutorial_progress jsonb not null default '{
    "characterConfirmed": false,
    "welcomeConversationDone": false,
    "profileExplored": false,
    "bagExplored": false,
    "missionTrackerExplored": false,
    "settingsExplored": false,
    "buildingsDiscovered": [],
    "movementCompleted": false,
    "hqSelected": false,
    "tutorialCompleted": false
  }'::jsonb,
  add column if not exists settings jsonb not null default '{
    "soundEffects": true,
    "backgroundMusic": false,
    "dialogueNarration": false,
    "subtitles": true,
    "textSize": "medium",
    "reducedMotion": false
  }'::jsonb,
  add column if not exists inventory jsonb not null default '{
    "badges": [],
    "collectibles": [],
    "missionItems": [],
    "specialRewards": []
  }'::jsonb,
  add column if not exists unlocked_buildings jsonb not null default '["detective-hq"]'::jsonb,
  add column if not exists town_position jsonb not null default '{"x": 50, "y": 60, "nodeId": "plaza-center"}'::jsonb;

-- Students can read and update only their own progress via authenticated server/Edge endpoints.
-- Direct anonymous table access remains denied by RLS.
