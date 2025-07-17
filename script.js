async function generateQuiz() {
  const input = document.getElementById("input").value;
  const output = document.getElementById("output");
  const loading = document.getElementById("loading");
  const errorBox = document.getElementById("error");

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

    output.innerHTML = formatQuiz(data.quiz || "No quiz returned.");
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
  const text = document.getElementById("output").innerText;
  navigator.clipboard.writeText(text)
    .then(() => alert("✅ Quiz copied to clipboard!"))
    .catch(() => alert("❌ Failed to copy."));
}
