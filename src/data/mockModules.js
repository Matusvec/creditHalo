export const LEARNING_MODULES = [
  {
    id: 'm1',
    title: 'Credit Score Basics',
    icon: '📊',
    lessons: [
      {
        id: 'm1-l1',
        title: 'What is a Credit Score?',
        content:
          'Your credit score is a number between 300 and 850 that represents your creditworthiness. Lenders use it to decide whether to approve you for loans and what interest rate to offer. Higher scores mean better terms!',
      },
      {
        id: 'm1-l2',
        title: 'The Five Factors',
        content:
          'Credit scores are based on: Payment history (35%), Amounts owed (30%), Length of credit history (15%), New credit (10%), and Credit mix (10%). Paying on time is the most important factor.',
      },
      {
        id: 'm1-l3',
        title: 'Good vs. Bad Scores',
        content:
          'Generally: 720+ is excellent, 690-719 is good, 630-689 is fair, and below 630 needs work. Improving your score takes time but is achievable with consistent good habits.',
      },
    ],
    quiz: {
      'm1-l1': [
        { q: 'What range do credit scores typically fall in?', a: ['100-500', '300-850', '0-1000'], correct: 1 },
        { q: 'Who uses credit scores?', a: ['Only banks', 'Lenders and creditors', 'Nobody'], correct: 1 },
        { q: 'What does a higher score typically mean?', a: ['More debt', 'Better loan terms', 'Lower income'], correct: 1 },
      ],
      'm1-l2': [
        { q: 'Which factor has the biggest impact on your score?', a: ['Credit mix', 'Payment history', 'New credit'], correct: 1 },
        { q: 'What percentage does payment history represent?', a: ['25%', '35%', '50%'], correct: 1 },
        { q: 'How many main factors affect your credit score?', a: ['Three', 'Five', 'Seven'], correct: 1 },
      ],
      'm1-l3': [
        { q: 'What score range is generally considered excellent?', a: ['600+', '720+', '800+'], correct: 1 },
        { q: 'Can you improve a low credit score?', a: ['No, it\'s permanent', 'Yes, with consistent habits', 'Only by paying someone'], correct: 1 },
        { q: 'What range is considered "fair"?', a: ['500-600', '630-689', '700+'], correct: 1 },
      ],
    },
  },
  {
    id: 'm2',
    title: 'Building Credit',
    icon: '🏗️',
    lessons: [
      {
        id: 'm2-l1',
        title: 'Starting from Scratch',
        content:
          'If you have no credit history, consider a secured credit card or becoming an authorized user on someone else\'s account. These can help you build a positive history.',
      },
      {
        id: 'm2-l2',
        title: 'Credit Cards 101',
        content:
          'Use credit cards wisely: pay the full balance each month to avoid interest. Keep utilization below 30% of your limit. One or two cards used responsibly can build strong credit.',
      },
      {
        id: 'm2-l3',
        title: 'Patience Pays Off',
        content:
          'Building credit takes 6+ months of activity to generate a score. Length of history matters—keep old accounts open when possible. Avoid applying for too many new accounts at once.',
      },
    ],
    quiz: {
      'm2-l1': [
        { q: 'What can help you build credit from scratch?', a: ['A loan', 'Secured credit card', 'Cash only'], correct: 1 },
        { q: 'Can being an authorized user help?', a: ['No', 'Yes', 'Only for mortgages'], correct: 1 },
        { q: 'How do you build positive history?', a: ['Ignore bills', 'Pay on time', 'Max out cards'], correct: 1 },
      ],
      'm2-l2': [
        { q: 'What utilization rate should you aim for?', a: ['Under 30%', 'Over 50%', '100%'], correct: 0 },
        { q: 'How can you avoid interest on credit cards?', a: ['Pay minimum only', 'Pay full balance monthly', 'Never use the card'], correct: 1 },
        { q: 'How many cards help build credit?', a: ['As many as possible', '1-2 used responsibly', 'Zero'], correct: 1 },
      ],
      'm2-l3': [
        { q: 'How long does it take to build a score?', a: ['1 week', '6+ months', '1 day'], correct: 1 },
        { q: 'Should you close old accounts?', a: ['Yes, always', 'Keep them open when possible', 'Doesn\'t matter'], correct: 1 },
        { q: 'Is applying for many new accounts good?', a: ['Yes', 'No, avoid it', 'Only for credit cards'], correct: 1 },
      ],
    },
  },
  {
    id: 'm3',
    title: 'Debt Management',
    icon: '💰',
    lessons: [
      {
        id: 'm3-l1',
        title: 'Understanding Debt',
        content:
          'Not all debt is bad. Mortgages and student loans can be "good" debt if managed well. High-interest credit card debt is typically "bad" debt. Focus on paying down high-interest balances first.',
      },
      {
        id: 'm3-l2',
        title: 'The Snowball vs. Avalanche',
        content:
          'Snowball: pay smallest balances first for quick wins. Avalanche: pay highest interest first to save money. Both work—choose what motivates you to stick with it.',
      },
      {
        id: 'm3-l3',
        title: 'Avoiding New Debt',
        content:
          'Create a budget, build an emergency fund, and avoid using credit for wants. If you must use credit, have a plan to pay it off quickly. One missed payment can hurt your score.',
      },
    ],
    quiz: {
      'm3-l1': [
        { q: 'Is all debt bad?', a: ['Yes', 'No, some can be managed well', 'Only credit cards'], correct: 1 },
        { q: 'What should you pay first?', a: ['Lowest balance', 'Highest interest rate', 'Either strategy works'], correct: 2 },
        { q: 'What is typically "bad" debt?', a: ['Mortgage', 'High-interest credit cards', 'Student loans'], correct: 1 },
      ],
      'm3-l2': [
        { q: 'What does the snowball method focus on?', a: ['Highest interest', 'Smallest balances', 'Newest debt'], correct: 1 },
        { q: 'What does the avalanche method focus on?', a: ['Smallest balances', 'Highest interest', 'Oldest debt'], correct: 1 },
        { q: 'Which method is "better"?', a: ['Only snowball', 'Only avalanche', 'Whichever you\'ll stick with'], correct: 2 },
      ],
      'm3-l3': [
        { q: 'What helps avoid new debt?', a: ['Ignoring bills', 'A budget and emergency fund', 'More credit cards'], correct: 1 },
        { q: 'Can one missed payment hurt your score?', a: ['No', 'Yes', 'Only if it\'s a mortgage'], correct: 1 },
        { q: 'Should you use credit for wants?', a: ['Yes, always', 'Avoid it when possible', 'Only for big purchases'], correct: 1 },
      ],
    },
  },
];

export const getLessonById = (lessonId) => {
  for (const mod of LEARNING_MODULES) {
    const lesson = mod.lessons.find((l) => l.id === lessonId);
    if (lesson) return { module: mod, lesson };
  }
  return null;
};

export const getQuizForLesson = (lessonId) => {
  for (const mod of LEARNING_MODULES) {
    if (mod.quiz && mod.quiz[lessonId]) return mod.quiz[lessonId];
  }
  return [];
};
