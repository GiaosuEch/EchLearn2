const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'supabase', 'schema.sql');
let content = fs.readFileSync(schemaPath, 'utf-8');

// 1. Add missing RLS ENABLES
const missingRLS = [
  'ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;',
  'ALTER TABLE voice_rooms ENABLE ROW LEVEL SECURITY;',
  'ALTER TABLE voice_room_participants ENABLE ROW LEVEL SECURITY;',
  'ALTER TABLE admin_activity_logs ENABLE ROW LEVEL SECURITY;'
];

const lines = content.split('\n');
const rlsIndex = lines.findIndex(l => l.includes('ALTER TABLE study_group_members ENABLE ROW LEVEL SECURITY;'));

if (rlsIndex !== -1) {
  lines.splice(rlsIndex + 1, 0, ...missingRLS);
  content = lines.join('\n');
}

// 2. Add DROP POLICY IF EXISTS before CREATE POLICY
content = content.replace(/CREATE POLICY "([^"]+)" ON (\w+)/g, 'DROP POLICY IF EXISTS "$1" ON $2;\nCREATE POLICY "$1" ON $2');

// 3. Add DROP TRIGGER IF EXISTS before CREATE TRIGGER
content = content.replace(/CREATE TRIGGER (\w+) (AFTER|BEFORE) (\w+) ON (\w+)/g, 'DROP TRIGGER IF EXISTS $1 ON $4;\nCREATE TRIGGER $1 $2 $3 ON $4');

// 4. Append new policies
const newPolicies = `
-- ============================================================================
-- ADDITIONAL POLICIES
-- ============================================================================

-- Achievements
DROP POLICY IF EXISTS "Anyone can read achievements" ON achievements;
CREATE POLICY "Anyone can read achievements" ON achievements FOR SELECT USING (true);

-- Voice Rooms
DROP POLICY IF EXISTS "Anyone authenticated can read voice_rooms" ON voice_rooms;
CREATE POLICY "Anyone authenticated can read voice_rooms" ON voice_rooms FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can create own voice_rooms" ON voice_rooms;
CREATE POLICY "Users can create own voice_rooms" ON voice_rooms FOR INSERT WITH CHECK (auth.uid() = host_id);

DROP POLICY IF EXISTS "Host can update own voice_rooms" ON voice_rooms;
CREATE POLICY "Host can update own voice_rooms" ON voice_rooms FOR UPDATE USING (auth.uid() = host_id);

DROP POLICY IF EXISTS "Host can delete own voice_rooms" ON voice_rooms;
CREATE POLICY "Host can delete own voice_rooms" ON voice_rooms FOR DELETE USING (auth.uid() = host_id);

-- Voice Room Participants
DROP POLICY IF EXISTS "Authenticated users can read voice_room_participants" ON voice_room_participants;
CREATE POLICY "Authenticated users can read voice_room_participants" ON voice_room_participants FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can join voice_rooms as themselves" ON voice_room_participants;
CREATE POLICY "Users can join voice_rooms as themselves" ON voice_room_participants FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own participant row" ON voice_room_participants;
CREATE POLICY "Users can update own participant row" ON voice_room_participants FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can leave voice_rooms" ON voice_room_participants;
CREATE POLICY "Users can leave voice_rooms" ON voice_room_participants FOR DELETE USING (auth.uid() = user_id);

-- Admin Activity Logs (Locked down for now since no admin role exists)
DROP POLICY IF EXISTS "No public access to admin_activity_logs" ON admin_activity_logs;
CREATE POLICY "No public access to admin_activity_logs" ON admin_activity_logs FOR ALL USING (false);
`;

content += newPolicies;

fs.writeFileSync(schemaPath, content);
console.log('Schema updated successfully!');
