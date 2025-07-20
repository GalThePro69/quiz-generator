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

    if (data.quiz) {
      output.textContent = data.quiz;
    } else {
      output.textContent = "No quiz generated.";
    }
  } catch (err) {
    console.error("Fetch error:", err);
    output.textContent = "Network error: " + err.message;
  }
}

function copyQuiz() {
  const output = document.getElementById("output").innerText;
  if (!output.trim()) return;

  navigator.clipboard.writeText(output).then(() => {
    showCopiedNotification();
  }).catch(err => {
    console.error("Copy failed:", err);
  });
}

function showCopiedNotification() {
  const notif = document.createElement("div");
  notif.textContent = "Copied!";
  notif.style.position = "fixed";
  notif.style.bottom = "20px";
  notif.style.right = "20px";
  notif.style.backgroundColor = "#4CAF50";
  notif.style.color = "white";
  notif.style.padding = "10px 16px";
  notif.style.borderRadius = "8px";
  notif.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
  notif.style.zIndex = "1000";
  notif.style.fontSize = "1rem";

  document.body.appendChild(notif);

  setTimeout(() => {
    notif.remove();
  }, 2000);
}

async function exportToPDF() {
  const inputText = document.getElementById("input").value.trim();
  const quizText = document.getElementById("output").innerText.trim();

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
  const lines = doc.splitTextToSize(quizText, maxLineWidth);

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

  // Quiz content
  doc.setFontSize(11);
  lines.forEach(line => {
    if (y > 280) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += lineHeight;
  });

  const filename = inputText ? inputText.slice(0, 30).replace(/\s+/g, "_") + "_quiz.pdf" : "quiz.pdf";
  doc.save(filename);
}
