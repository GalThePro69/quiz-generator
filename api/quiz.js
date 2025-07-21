export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  const { input, quizType, difficulty } = req.body;

  const quizTypeInstructions = {
    multiple: "only multiple choice questions. Provide 4 options labeled a), b), c), d), and specify the correct one at the end like: 'Answer: a) Option'.",
    truefalse: "only true/false questions. Use 'a) True' and 'b) False' as options, and specify the correct one like: 'Answer: a) True'.",
    shortanswer: "only short answer questions. Just ask the question and give a short answer.",
    mixed: "a mix of multiple choice, true/false, and short answer questions. Format each appropriately. For multiple choice, use 'a) b) c) d)' and include the correct answer like 'Answer: a) Option'. For true/false, use 'a) True b) False'."
  };

  const instruction = quizTypeInstructions[quizType] || quizTypeInstructions.mixed;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates educational quizzes."
        },
        {
          role: "user",
          content: `Create 5 quiz questions based on the following text:\n\n"${input}"\n\nUse the following rules depending on the quiz type selected:\n${instruction}\n\nThe quiz should be at a ${difficulty} level.\nMake sure the formatting is clean and easy to copy.\nUse this structure:\n\n1. Question...\na) Option A\nb) Option B\n...\nAnswer: a) Option A`
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    })
  });

  if (!response.ok) {
    return res.status(500).json({ message: "Failed to generate quiz" });
  }

  const data = await response.json();
  const quiz = data.choices[0]?.message?.content;

  if (!quiz) {
    return res.status(500).json({ message: "No quiz generated." });
  }

  res.status(200).json({ quiz });
}
