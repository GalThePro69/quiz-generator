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

    const text = await res.text(); // Get raw text
    console.log("Raw response text:", text);

    try {
      const data = JSON.parse(text); // Try parsing it as JSON
      output.textContent = data.quiz || "No quiz returned.";
    } catch (jsonError) {
      console.error("Failed to parse JSON:", jsonError);
      output.textContent = "Error: Response was not valid JSON.";
    }
  } catch (err) {
    console.error("Fetch error:", err);
    output.textContent = "Network error: " + err.message;
  }
}
