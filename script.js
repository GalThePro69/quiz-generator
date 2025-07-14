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

    if (data.error) {
      output.textContent = "Error: " + data.error;
    } else {
      output.textContent = data.quiz || "No quiz returned.";
    }

  } catch (err) {
    console.error("Fetch error:", err);
    output.textContent = "Network error: " + err.message;
  }
}
