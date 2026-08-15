export interface IELTSWritingTask {
  id: string;
  type: 'Task 1' | 'Task 2';
  category: string;
  titleVi: string;
  promptDescriptionVi: string;
  promptDescriptionEn: string;
  chartImageUrl?: string; // Optional for Task 2
  targetBand: string;
  expectedWordCount: number;
  timeLimitMinutes: number;
  modelAnswerBand9: string;
}

export const WRITING_TASKS_DB: IELTSWritingTask[] = [
  {
    id: 'wt1_01',
    type: 'Task 1',
    titleVi: '1. Average Class Size by Age — Sĩ số trung bình theo độ tuổi',
    category: 'Bar Chart',
    targetBand: '7.0+',
    chartImageUrl: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=800&auto=format&fit=crop',
    promptDescriptionVi: 'Biểu đồ cột so sánh sĩ số trung bình của các lớp học tiểu học và trung học tại 5 quốc gia khác nhau.',
    promptDescriptionEn: 'The bar chart illustrates the average class sizes for primary and lower secondary education across five countries.',
    modelAnswerBand9: 'The bar chart compares primary and secondary class sizes across five nations. Overall, secondary classes consistently exceed primary classes in size, with Korea exhibiting the highest average figures.',
    expectedWordCount: 150,
    timeLimitMinutes: 20
  },
  {
    id: 'wt1_02',
    type: 'Task 1',
    titleVi: '2. Global Water Use and Country Consumption Data — Mức sử dụng nước toàn cầu',
    category: 'Line Graph',
    targetBand: '7.0+',
    chartImageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=800&auto=format&fit=crop',
    promptDescriptionVi: 'Biểu đồ đường thể hiện sự gia tăng mức tiêu thụ nước toàn cầu từ năm 1900 đến 2000.',
    promptDescriptionEn: 'The line graph details global water consumption trends across agriculture, industrial, and domestic sectors over a century.',
    modelAnswerBand9: 'The line graph depicts global water usage from 1900 to 2000. Agriculture remained the dominant consumer, displaying exponential escalation after 1950.',
    expectedWordCount: 150,
    timeLimitMinutes: 20
  },
  {
    id: 'w2_soc_001',
    type: 'Task 2',
    titleVi: '3. Technology vs Teachers — Công nghệ thay thế giáo viên',
    category: 'Opinion Essay',
    targetBand: '7.0+',
    promptDescriptionVi: 'Một số người tin rằng máy tính và internet sẽ hoàn toàn thay thế giáo viên truyền thống.',
    promptDescriptionEn: 'Some people believe that computers and the internet will completely replace traditional teachers in the near future. To what extent do you agree or disagree?',
    modelAnswerBand9: 'The assertion that technology will entirely supplant conventional educators is a topic of considerable debate. While digital platforms offer unprecedented access to information, I firmly disagree that they can replace the nuanced, pedagogical guidance provided by human teachers. The interpersonal dynamic, emotional intelligence, and adaptable instruction that a skilled educator brings to the classroom are irreplicable by algorithms.',
    expectedWordCount: 250,
    timeLimitMinutes: 40
  },
  {
    id: 'w2_env_002',
    type: 'Task 2',
    titleVi: '4. Global Plastic Pollution — Khủng hoảng rác thải nhựa',
    category: 'Problem & Solution',
    targetBand: '8.0+',
    promptDescriptionVi: 'Rác thải nhựa trên đại dương đã trở thành khủng hoảng toàn cầu ảnh hưởng đến sinh vật biển và sức khỏe con người. Nêu nguyên nhân và giải pháp.',
    promptDescriptionEn: 'Plastic pollution in the oceans has become a global crisis affecting marine life and human health. What are the main causes of this problem? What solutions can you suggest?',
    modelAnswerBand9: 'Plastic pollution in marine ecosystems constitutes one of the most pressing environmental crises of our era. This pervasive issue is primarily driven by the exponential production of single-use plastics and inadequate global waste management infrastructure. However, this crisis can be mitigated through stringent international policies and investments in biodegradable alternatives. Fundamentally, consumer habits must shift towards sustainable consumption to preserve our oceans.',
    expectedWordCount: 250,
    timeLimitMinutes: 40
  }
];
