-- Enforce basic JSON Schema Validation on realworld_lessons
-- This prevents NoSQL garbage data masquerading as SQL

ALTER TABLE public.realworld_lessons
ADD CONSTRAINT enforce_realworld_lessons_json_schema 
CHECK (
  jsonb_typeof(data) = 'object' 
  AND data ? 'id' 
  AND data ? 'unit' 
  AND data ? 'order' 
  AND data ? 'scenario'
  AND data ? 'canDo'
  AND data ? 'production'
);
