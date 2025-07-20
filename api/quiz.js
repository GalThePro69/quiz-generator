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
            content: `Create 5 ${quizType === 'mixed' ? 'mixed-type' : quizType} quiz questions at a ${difficulty} difficulty level based on this text:\n\n${input}\n\nUse clear formatting and include the correct answer after each question like this:\nAnswer: ...`,
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
