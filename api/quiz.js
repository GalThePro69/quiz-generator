export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  const { input, quizType, difficulty } = req.body;

  if (!input || !quizType || !difficulty) {
    return res.status(400).json({ message: "Missing input, quizType, or difficulty." });
  }

  // Limit input to avoid slow processing or token overuse
  const trimmedInput = input.slice(0, 1800);

  const quizTypeInstructions = {
    multiple: `Generate ONLY multiple choice questions. 
Each question must have 4 options labeled a), b), c), d). 
Include the correct answer at the end like: "Answer: a) Correct option".`,

    truefalse: `Generate ONLY true/false questions. 
Each question must have exactly:
a) True  
b) False  
Include the correct answer at the end like: "Answer: a) True".`,

    shortanswer: `Generate ONLY short answer questions.
Just provide the question followed by a short and direct answer like: "Answer: Explanation here."`,

    mixed: `Generate a mix of multiple choice, true/false, and short answer questions. 
- Multiple choice: include 4 options (a–d) and an answer.
- True/False: format as "a) True", "b) False", and provide the correct answer.
- Short answer: write a brief answer directly after the question.
Clearly label each answer at the end of the question like: "Answer: ..."`,
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
