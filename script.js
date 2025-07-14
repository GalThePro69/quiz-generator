const res = await fetch("/api/quiz", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ input })
});
