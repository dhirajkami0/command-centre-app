async function askAI(prompt) {

  const res = await fetch(
    "https://askai-ugffgukzca-uc.a.run.app",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt
      })
    }
  );

  const data = await res.json();

  if (!data.success) {
    throw new Error(data.error);
  }

  return data.reply;
}
