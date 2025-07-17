async function generateQuiz() {
  const input = document.getElementById("input").value;
  const output = document.getElementById("output");
  const loading = document.getElementById("loading");
  const errorBox = document.getElementById("error");

  output.textContent = ""; // Clear previous output
  output.style.display = "none";
  errorBox.style.display = "none";
  loading.style.display = "block";

  try {
    const res = await fetch("/api/quiz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ input })
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

  // Convert HTML to plain text
  const plainText = tempDiv.innerText;

  navigator.clipboard.writeText(plainText)
    .then(() => alert("✅ Quiz copied to clipboard!"))
    .catch(() => alert("❌ Failed to copy quiz."));
}
