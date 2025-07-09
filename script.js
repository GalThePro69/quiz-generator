async function generateQuiz() {
  const input = document.getElementById("input").value;
  const output = document.getElementById("output");

  output.textContent = "Generating quiz... please wait.";

  try {
    const res = await fetch("https://eo7pvb5gjfr5te.m.pipedream.net", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ input })
    });

    const data = await res.json();

    // Show response (assuming response is { quiz: "..." })
    output.textContent = data.quiz || "No quiz generated.";
  } catch (err) {
    output.textContent = "Error: " + err.message;
  }
}
