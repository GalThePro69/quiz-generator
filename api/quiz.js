export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { input, difficulty, quizType } = req.body;

  if (!input) {
    return res.status(400).json({ error: 'No input text provided.' });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing OpenAI API key.' });
  }

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `Create 5 quiz questions based on the following text:\n\n"${input}"\n\n
Use the following rules depending on the quiz type selected:
- For **multiple choice**, provide 4 options labeled a), b), c), d), and specify the correct one at the end like: "Answer: a) Option"
- For **true/false**, list "a) True" and "b) False" as the options, and then say which is correct like: "Answer: a) True"
- For **short answer**, just ask the question and give a short answer.

The quiz should be in a ${difficulty} difficulty level.
Make sure the formatting is consistent.
Use this format:

1. Question...
a) Option A  
b) Option B  
c) Option C  
d) Option D  
Answer: a) Option A`

          },
        ],
      }),
    });

    const data = await openaiRes.json();
    const quiz = data.choices?.[0]?.message?.content;
    return res.status(200).json({ quiz: quiz || null });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return res.status(500).json({ error: 'Failed to generate quiz.' });
  }
}
