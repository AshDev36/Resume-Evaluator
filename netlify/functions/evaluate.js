exports.handler = async function (event) {
  // ONLY ALLOW POST REQUESTS
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({
        error: "Method Not Allowed",
      }),
    };
  }

  try {
    // GET DATA SENT FROM FRONTEND
    const { resumeText } = JSON.parse(event.body);

    // VALIDATION
    if (!resumeText || resumeText.trim() === "") {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Resume text is required",
        }),
      };
    }

    // CALL GROQ API SECURELY
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",

          // SECRET KEY FROM ENV VARIABLES
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },

        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",

          messages: [
            {
              role: "user",
              content: `
You are a brutally honest resume evaluator.

Evaluate this resume with constructive feedback and some sarcasm.

Provide your response in this exact format:

SCORE: [number between 0-10]
FEEDBACK: [detailed feedback]

Resume:
${resumeText}
              `,
            },
          ],

          max_tokens: 1000,
        }),
      },
    );
    if (!response.ok) {
      const errorText = await response.text();

      console.error("Groq API Error:", errorText);

      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: "Groq API request failed",
          details: errorText,
        }),
      };
    }
    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error("Function Error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal Server Error",
      }),
    };
  }
};
