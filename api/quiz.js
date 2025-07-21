export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  const { input, quizType, difficulty } = req.body;

  if (!input || !quizType || !difficulty) {
    return res.status(400).json({ message: "Missing input, quizType, or difficulty." });
  }

  // Limit input to avoid slow processing or token overuse
  //const trimmedInput = input.slice(0, 1800);

  const quizTypeInstructions = {
  multiple: "Generate only multiple choice questions. Provide exactly 4 distinct options labeled a), b), c), d), and include the correct one at the end like: 'Answer: a) Option'. Do not generate true/false or short answer questions.",
  truefalse: "Generate only true/false questions. Use the format: 'a) True' and 'b) False', and include the correct one at the end like: 'Answer: a) True'. Do not generate other types of questions.",
  shortanswer: "Generate only short answer questions. These should be open-ended, not multiple choice or true/false. Just ask a question that requires a short, clear answer (1–2 sentences), and include the answer at the end like: 'Answer: ...'. Do NOT use options a), b), etc.",
  mixed: "Generate a mix of multiple choice, true/false, and short answer questions. Format each appropriately. For multiple choice, provide 4 options (a–d) and write the correct one at the end. For true/false, use 'a) True' and 'b) False'. For short answers, ask an open question and provide a short, clear answer without options."
};


  const instruction = quizTypeInstructions[quizType] || quizTypeInstructions.mixed;

  const prompt = `
You are a helpful assistant that creates clean, clearly formatted quizzes.

Instructions:
- Level: ${difficulty}
- Type: ${quizType}
- Based on the input text.
- Number of questions: 5
- Follow formatting rules strictly.
- Label answers as shown below.
- Do not include explanations, just the questions and answers.

Example format:
1. Question...  
a) Option A  
b) Option B  
c) Option C  
d) Option D  
Answer: a) Option A

Text to use:
""" 
${trimmedInput}
"""`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o", // or "gpt-4o", "gpt-3.5-turbo"
        messages: [
          { role: "system", content: "You are a helpful assistant that generates educational quizzes." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI Error:", errorData);
      return res.status(500).json({ message: "Failed to generate quiz." });
    }

    const data = await response.json();
    const quiz = data.choices[0]?.message?.content?.trim();

    if (!quiz) {
      return res.status(500).json({ message: "No quiz content returned." });
    }

    return res.status(200).json({ quiz });

  } catch (error) {
    console.error("Quiz generation error:", error);
    return res.status(500).json({ message: "Server error during quiz generation." });
  }
}
