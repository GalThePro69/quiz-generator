async function generateQuiz() {
  const input = document.getElementById("input").value;
  const output = document.getElementById("output");

  output.textContent = "Generating quiz... please wait.";

  try {
    const res = await fetch("/api/quiz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ input })
    });

    const data = await res.json();
    output.textContent = data.quiz || "No quiz generated.";
  } catch (err) {
    output.textContent = "Error: " + err.message;
  }
}

function copyQuiz() {
  const output = document.getElementById("output");
  const text = output.innerText;

  navigator.clipboard.writeText(text).then(() => {
    const copiedMessage = document.getElementById("copiedMessage");
    copiedMessage.style.display = "block";
    setTimeout(() => {
      copiedMessage.style.display = "none";
    }, 1500);
  });
}

async function exportToPDF() {
  const inputText = document.getElementById("input").value.trim();
  const quizText = document.getElementById("output").innerText.trim();
  const includeAnswers = document.getElementById("includeAnswers").checked;

  if (!quizText) {
    alert("No quiz content to export.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const margin = 15;
  const lineHeight = 8;
  let y = margin;

  const maxLineWidth = doc.internal.pageSize.getWidth() - margin * 2;

  // Parse quiz into questions and answers
  const lines = quizText.split("\n");
  const questionLines = [];
  const answerLines = [];

  for (let line of lines) {
    if (/^Answer:/i.test(line.trim())) {
      answerLines.push(line);
    } else {
      questionLines.push(line);
    }
  }

  // Title
  doc.setFontSize(16);
  doc.text("AI Generated Quiz", margin, y);
  y += lineHeight * 1.5;

  // Topic (optional)
  if (inputText) {
    doc.setFontSize(12);
    doc.text("Topic: " + inputText, margin, y);
    y += lineHeight * 1.5;
  }

  // Questions
  doc.setFontSize(11);
  const wrappedQuestions = doc.splitTextToSize(questionLines.join("\n"), maxLineWidth);
  wrappedQuestions.forEach(line => {
    if (y > 280) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += lineHeight;
  });

  // Answers on new page
  if (includeAnswers && answerLines.length > 0) {
    doc.addPage();
    y = margin;

    doc.setFontSize(14);
    doc.text("Answers", margin, y);
    y += lineHeight * 1.5;

    doc.setFontSize(11);
    const wrappedAnswers = doc.splitTextToSize(answerLines.join("\n"), maxLineWidth);
    wrappedAnswers.forEach(line => {
      if (y > 280) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += lineHeight;
    });
  }

  const filename = inputText ? inputText.slice(0, 30).replace(/\s+/g, "_") + "_quiz.pdf" : "quiz.pdf";
  doc.save(filename);
}

function toggleDarkMode() {
  const isDark = document.body.classList.toggle("dark-mode");
  document.getElementById("container").classList.toggle("dark-mode");
  document.getElementById("input").classList.toggle("dark-mode");
  document.getElementById("output").classList.toggle("dark-mode");

  document.querySelectorAll("button").forEach(btn => {
    btn.classList.toggle("dark-mode");
  });

  localStorage.setItem("darkMode", isDark ? "on" : "off");
}

window.onload = () => {
  if (localStorage.getItem("darkMode") === "on") {
    toggleDarkMode();
  }
};
