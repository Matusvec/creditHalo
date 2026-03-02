const MOCK_RESPONSES = [
  "That's a great goal! Start by checking your current credit score and setting up a budget to track your spending.",
  'Consider paying more than the minimum on high-interest debts first. This can help reduce your overall interest paid.',
  'Building credit takes time. Focus on paying bills on time and keeping credit utilization low.',
  'Setting up automatic payments can help you never miss a due date. Check with your bank for this feature.',
  'A good first step is to review your credit report for any errors. You can get a free report at annualcreditreport.com.',
  'Consider creating a savings goal and automating transfers to build your emergency fund.',
  'Tracking your expenses for a month can reveal spending patterns. Use a budget tool to get started.',
];

export const sendMessage = async (message) => {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (apiKey) {
    try {
      const { default: OpenAI } = await import('openai');
      const openai = new OpenAI({ apiKey });
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a friendly financial education assistant. Give brief, helpful tips about credit and goals. Do not provide personalized financial advice.',
          },
          { role: 'user', content: message },
        ],
        max_tokens: 150,
      });
      return completion.choices[0]?.message?.content || MOCK_RESPONSES[0];
    } catch (e) {
      console.warn('OpenAI error:', e);
      return MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
    }
  }
  return MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
};
