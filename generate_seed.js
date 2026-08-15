import fs from 'fs';
import path from 'path';

const tsContent = fs.readFileSync(path.resolve('./src/curriculum/realworldSurvivalData.ts'), 'utf-8');

const objectString = tsContent
    .split('export const realworldSurvivalLessons: Record<string, RealworldSurvivalLesson[]> = ')[1]
    .split('export function')[0]
    .trim()
    .replace(/;$/, '');
// eslint-disable-next-line no-eval
const data = eval('(' + objectString + ')');

let sql = `
-- Auto-generated Seed Data for realworld_lessons
`;

for (const lang of Object.keys(data)) {
    const lessons = data[lang];
    for (const lesson of lessons) {
        // Prevent SQL Injection using parameterized-like dollar quoting for the data
        const id = lesson.id;
        const unit = lesson.unit;
        const order = lesson.order;
        const jsonData = JSON.stringify(lesson);
        sql += `
INSERT INTO public.realworld_lessons (id, language_id, unit, "order", data)
VALUES ($$${id}$$, $$${lang}$$, ${unit}, ${order}, $$${jsonData}$$::jsonb)
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, unit = EXCLUDED.unit, "order" = EXCLUDED.order;
`;
    }
}

fs.writeFileSync(path.resolve('./supabase/seed.sql'), sql, { flag: 'a' });
console.log('Seed SQL generated successfully!');
