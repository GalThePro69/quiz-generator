async function generateQuiz() {
  const input = document.getElementById("input").value;
  const quizType = document.getElementById("quizType").value;
  const difficulty = document.getElementById("difficulty").value;

  const output = document.getElementById("output");
  const loading = document.getElementById("loading");
  const errorBox = document.getElementById("error");

  output.textContent = "";
  output.style.display = "none";
  errorBox.style.display = "none";
  loading.style.display = "block";

  try {
    const res = await fetch("/api/quiz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ input, quizType, difficulty })
    });

    const data = await res.json();
    loading.style.display = "none";

    if (data.error) {
      errorBox.textContent = "❌ " + data.error;
      errorBox.style.display = "block";
      return;
    }

    const formatted = formatQuiz(data.quiz || "No quiz returned.");
    output.innerHTML = formatted;
    output.style.display = "block";

  } catch (err) {
    loading.style.display = "none";
    errorBox.textContent = "❌ Network error: " + err.message;
    errorBox.style.display = "block";
  }
}

function formatQuiz(text) {
  return text
    .replace(/\n/g, "<br>")
    .replace(/(Answer:)/gi, "<strong>$1</strong>");
}

function copyQuiz() {
  const output = document.getElementById("output");
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = output.innerHTML;

  const plainText = tempDiv.innerText;

  navigator.clipboard.writeText(plainText)
    .then(() => {
      const alertBox = document.getElementById("copy-alert");
      alertBox.classList.add("show");

      setTimeout(() => {
        alertBox.classList.remove("show");
      }, 2000);
    })
    .catch(() => {
      console.error("Copy failed");
    });
}

function exportToPDF() {
  const output = document.getElementById("output");

  if (!output || !output.innerText.trim()) {
    alert("Nothing to export!");
    return;
  }

  const opt = {
    margin:       0.5,
    filename:     'quiz.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(output).save();
}

