async function generateQuiz() {
  const input = document.getElementById("input").value;
  const difficulty = document.getElementById("difficulty").value;
  const quizType = document.getElementById("quizType").value;
  const output = document.getElementById("output");

  output.textContent = "Generating quiz... please wait.";

  try {
    const res = await fetch("/api/quiz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ input, difficulty, quizType })
    });

    const data = await res.json();
    output.textContent = data.quiz || "No quiz generated.";
  } catch (err) {
    output.textContent = "Error: " + err.message;
  }
}

function copyQuiz() {
  const output = document.getElementById("output").textContent;
  navigator.clipboard.writeText(output).then(() => {
    const note = document.getElementById("copied-notification");
    note.style.display = "block";
    setTimeout(() => {
      note.style.display = "none";
    }, 1500);
  });
}

function exportToPDF() {
  const quiz = document.getElementById("output").textContent;
  if (!quiz.trim()) {
    alert("Please generate a quiz first.");
    return;
  }

  const includeAnswers = confirm("Include answers in the end of the PDF?");

  const lines = quiz.split("\n");
  const questions = [];
  const answers = [];

  for (const line of lines) {
    if (/^Answer:/i.test(line.trim())) {
      answers.push(line.trim());
    } else {
      questions.push(line);
    }
  }

  const doc = new window.jspdf.jsPDF();
  doc.setFontSize(12);
  doc.text("AI Generated Quiz", 10, 10);
  doc.setFontSize(11);

  let y = 20;
  for (const line of questions) {
    const wrapped = doc.splitTextToSize(line, 180);
    for (const part of wrapped) {
      if (y > 280) {
        doc.addPage();
        y = 10;
      }
      doc.text(part, 10, y);
      y += 8;
    }
  }

  if (includeAnswers && answers.length > 0) {
    doc.addPage();
    doc.setFontSize(12);
    doc.text("Answers", 10, 10);
    doc.setFontSize(11);
    y = 20;
    for (const line of answers) {
      if (y > 280) {
        doc.addPage();
        y = 10;
      }
      doc.text(line, 10, y);
      y += 8;
    }
  }

  doc.save("quiz.pdf");
}
