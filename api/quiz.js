export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { input, quizType = 'mixed', difficulty = 'medium' } = req.body;

  if (!input) {
    return res.status(400).json({ error: 'No input text provided.' });
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing OpenAI API key.' });
  }

  try {
    const prompt = `Create 5 quiz questions based on the following text:\n\n${input}\n\nQuiz Type: ${quizType}\nDifficulty: ${difficulty}\n\nUse a mix of multiple choice, true/false, and short answer if type is 'mixed'. Clearly label the correct answers. Format like:\n\n1. Question\n a) Option\n b) Option\n Answer:\n`;

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
            content: prompt,
          },
        ],
      }),
    });

    const data = await openaiRes.json();
    console.log("💬 OpenAI response:", JSON.stringify(data, null, 2));

    const quiz = data.choices?.[0]?.message?.content;

    return res.status(200).json({ quiz: quiz || null });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return res.status(500).json({ error: 'Failed to generate quiz.' });
  }
}
