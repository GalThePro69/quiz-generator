document.addEventListener("DOMContentLoaded", () => {
  const MAX_CHARS = 20000;

  const inputField = document.getElementById("input");
  const charCount = document.getElementById("charCount");
  const loadingDiv = document.getElementById("loading");
  const resultDiv = document.getElementById("result");
  const quizDiv = document.getElementById("quiz");
  const quizTypeSelect = document.getElementById("quizType");
  const difficultySelect = document.getElementById("difficulty");

  if (!inputField || !charCount || !quizDiv) {
    console.error("Missing required DOM elements.");
    return;
  }

  inputField.addEventListener("input", () => {
    const length = inputField.value.length;
    charCount.textContent = `${length} / ${MAX_CHARS.toLocaleString()} characters`;

    if (length > MAX_CHARS) {
      charCount.classList.add("over");
    } else {
      charCount.classList.remove("over");
    }
  });

  window.generateQuiz = async function () {
    const input = inputField.value;
    const quizType = quizTypeSelect.value;
    const difficulty = difficultySelect.value;
    const numQuestions = document.getElementById("numQuestions").value;

    if (!input.trim()) {
      alert("Please enter text to generate the quiz.");
      return;
    }

    if (input.length > MAX_CHARS) {
      alert(`Your input exceeds the ${MAX_CHARS.toLocaleString()} character limit. Please shorten it before generating a quiz.`);
      return;
    }

    loadingDiv.style.display = "block";
    await new Promise(resolve => setTimeout(resolve, 50)); // force reflow
    resultDiv.innerHTML = "";
    quizDiv.textContent = "";

    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, quizType, difficulty, numQuestions: parseInt(numQuestions)}),
      });

      if (!res.ok) {
        throw new Error("Error generating quiz.");
      }

      const data = await res.json();
      quizDiv.textContent = data.quiz || "⚠️ No quiz was returned.";
    } catch (error) {
      alert(error.message);
      console.error(error);
    } finally {
      loadingDiv.style.display = "none";
    }
  };

  window.exportToPDF = function (includeAnswers = false) {
    const { jsPDF } = window.jspdf;
    const quizText = quizDiv.textContent;

    if (!quizText.trim()) {
      alert("No quiz to export.");
      return;
    }

    const { questionPart, answerPart } = extractQuestionsAndAnswers(quizText);
    const doc = new jsPDF();
    const margin = 10;
    const pageHeight = doc.internal.pageSize.height;

    const splitText = doc.splitTextToSize(questionPart, 180);
    let y = margin;

    for (let i = 0; i < splitText.length; i++) {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(splitText[i], margin, y);
      y += 10;
    }

    if (includeAnswers && answerPart) {
      doc.addPage();
      doc.setFontSize(14);
      doc.text("Answers", margin, margin);

      const answersText = doc.splitTextToSize(answerPart, 180);
      let answerY = margin + 10;
      for (let line of answersText) {
        if (answerY > pageHeight - margin) {
          doc.addPage();
          answerY = margin;
        }
        doc.text(line, margin, answerY);
        answerY += 10;
      }
    }

    doc.save(`quiz_${includeAnswers ? 'with_answers' : 'questions_only'}.pdf`);
  };

  window.toggleDarkMode = function () {
    document.body.classList.toggle("light");
  };

  function extractQuestionsAndAnswers(fullText) {
    const lines = fullText.split('\n');
    const questions = [];
    const answers = [];

    for (let line of lines) {
      if (line.trim().toLowerCase().startsWith("answer:")) {
        answers.push(line.trim());
      } else {
        questions.push(line);
      }
    }

    return {
      questionPart: questions.join('\n').trim(),
      answerPart: answers.join('\n').trim()
    };
  }

  // Load jsPDF from CDN
  const script = document.createElement("script");
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
  script.onload = () => {
    window.jspdf = window.jspdf || window.jspdf;
  };
  document.head.appendChild(script);
});
