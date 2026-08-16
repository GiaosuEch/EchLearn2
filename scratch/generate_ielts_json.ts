import fs from 'fs';
import { ieltsAcademicData } from '../src/data/curriculums/ieltsAcademicData.ts';

fs.writeFileSync('./public/content/ielts.json', JSON.stringify(ieltsAcademicData, null, 2));
console.log('Successfully wrote ielts.json');
