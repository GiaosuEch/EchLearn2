export interface IELTSTask {
  id: string;
  skill: 'listening' | 'reading' | 'writing' | 'speaking';
  title: string;
  bandTarget: number;
  referenceId: string; // Links to readingLibrary, listeningLibrary, etc.
}

export const ieltsCurriculum: IELTSTask[] = [
  { id: 'i_r1', skill: 'reading', title: 'Matching Headings Practice', bandTarget: 6.0, referenceId: 'r2' },
  { id: 'i_s1', skill: 'speaking', title: 'Part 2: Describe a trip', bandTarget: 6.5, referenceId: 's2' },
  { id: 'i_w1', skill: 'writing', title: 'Task 2: Technology in Education', bandTarget: 7.0, referenceId: 'w2' },
];

for (let i = 2; i <= 10; i++) {
  ieltsCurriculum.push({
    id: `i_m${i}`,
    skill: ['listening', 'reading', 'writing', 'speaking'][i % 4] as any,
    title: `IELTS Practice Task ${i}`,
    bandTarget: 5.0 + (i % 4) * 0.5,
    referenceId: `ref_${i}`
  });
}
