export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  const { input, quizType, difficulty, numQuestions, language } = req.body;

  const trimmedInput = input.slice(0, 20000);
  const questions = Math.max(1, Math.min(Number(numQuestions) || 5, 10)); // limit to 1–10

  const quizTypeInstructions = {
    multiple:
      "Generate only multiple choice questions. Each question must have exactly 4 options labeled a), b), c), and d). At the end of each question, write the correct answer in this format: 'Answer: a) Option'. Do NOT include any true/false or short answer questions.",
    truefalse:
      "Generate only true/false questions. Each question must have two options: 'a) True' and 'b) False'. At the end of each question, specify the correct one like: 'Answer: a) True'. Do NOT include multiple choice or short answer questions.",
    shortanswer:
      "Generate only short answer questions. These should be open-ended questions that require a brief written response (1–2 sentences). Do NOT use any options (no a), b), etc.). End each with 'Answer: ...'. Do NOT include multiple choice or true/false questions.",
    mixed:
      "Generate a mix of multiple choice, true/false, and short answer questions. Format each appropriately. For multiple choice: 4 options (a–d) with the correct answer labeled like 'Answer: a) Option'. For true/false: 'a) True', 'b) False' and correct answer noted at the end. For short answer: no options, just the question and short answer."
  };

  const instruction = quizTypeInstructions[quizType] || quizTypeInstructions.mixed;

  const languageInstruction =
  language && language.toLowerCase() !== "english"
    ? `Translate the input and write the entire quiz—including all questions and answers—**strictly** in ${language}. Do not use any English words.`
    : "";


  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that generates educational quizzes."
          },
          {
            role: "user",
            content: `Create ${questions} quiz questions based on the following text:\n\n"${trimmedInput}"\n\nFollow these specific rules depending on the quiz type:\n${instruction}\n\nThe quiz should be at a ${difficulty} level.\n${languageInstruction}\nUse clean and copyable formatting\nYour response should only include the questions and answers, nothing more.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1200
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
  } catch (error) {
    res.status(500).json({ message: "Error generating quiz", error });
  }
}
