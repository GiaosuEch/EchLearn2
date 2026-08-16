import { describe, it, expect } from 'vitest';
import { getRealworldSurvivalCourse } from './realworldSurvivalCourse';

describe('getRealworldSurvivalCourse', () => {
  it('should filter out units with zero lessons to prevent empty nodes in the roadmap', () => {
    const fakeCourse = getRealworldSurvivalCourse('fake-lang');
    expect(fakeCourse.length).toBe(0);
    
    const jaCourse = getRealworldSurvivalCourse('ja');
    expect(jaCourse.length).toBe(15);
    expect(jaCourse.every(u => u.lessons.length > 0)).toBe(true);
  });
});
