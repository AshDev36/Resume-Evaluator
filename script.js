// GET DOM ELEMENTS
const evaluateBtn = document.getElementById("evaluate-btn");
const resumeInput = document.getElementById("resume-input");
const scoreValue = document.getElementById("score-value");
const feedbackOutput = document.getElementById("feedback-output");

// TEST: Log that everything is connected
console.log("Elements loaded:", {
  evaluateBtn,
  resumeInput,
  scoreValue,
  feedbackOutput,
});

// FUNCTION TO ANIMATE SCORE COUNT-UP
function animateScore(targetScore) {
  let currentScore = 0;
  const increment = targetScore / 30;

  const interval = setInterval(() => {
    currentScore += increment;

    if (currentScore >= targetScore) {
      scoreValue.textContent = targetScore;
      clearInterval(interval);
    } else {
      scoreValue.textContent = currentScore.toFixed(1);
    }
  }, 30);
}

// EVALUATE BUTTON CLICK
evaluateBtn.addEventListener("click", async function () {
  // GET RESUME TEXT
  const resumeText = resumeInput.value;

  // VALIDATE INPUT
  if (resumeText.trim() === "") {
    feedbackOutput.textContent = "Please paste your resume first.";
    return;
  }

  // LOADING STATE
  evaluateBtn.disabled = true;
  evaluateBtn.textContent = "Evaluating...";

  scoreValue.textContent = "...";
  scoreValue.style.color = "#2563eb";

  feedbackOutput.textContent = "Getting your brutal evaluation...";

  scoreValue.classList.remove("fade-in");
  feedbackOutput.classList.remove("fade-in");

  try {
    // SEND REQUEST TO NETLIFY FUNCTION
    const response = await fetch("/.netlify/functions/evaluate", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        resumeText: resumeText,
      }),
    });

    // CHECK IF REQUEST FAILED
    if (!response.ok) {
      throw new Error("Server request failed");
    }

    // PARSE RESPONSE
    const data = await response.json();

    // VALIDATE RESPONSE
    if (!data.choices || !data.choices[0]) {
      throw new Error("Invalid API response");
    }

    // GET AI CONTENT
    const content = data.choices[0].message.content;

    // SPLIT SCORE + FEEDBACK
    const parts = content.split("FEEDBACK:");

    const scoreText = parts[0];
    const feedbackText = parts[1];

    // EXTRACT SCORE NUMBER
    const scoreMatch = scoreText.match(/\d+\.?\d*/);

    const scoreNumber = scoreMatch ? parseFloat(scoreMatch[0]) : 0;

    // CLEAN FEEDBACK
    const cleanFeedback = feedbackText
      ? feedbackText.trim()
      : "No feedback received.";

    // UPDATE UI
    animateScore(scoreNumber);

    scoreValue.classList.add("fade-in");

    feedbackOutput.textContent = cleanFeedback;
    feedbackOutput.classList.add("fade-in");

    // SCORE COLORS
    if (scoreNumber >= 7) {
      scoreValue.style.color = "#10b981";
    } else if (scoreNumber >= 5) {
      scoreValue.style.color = "#f59e0b";
    } else {
      scoreValue.style.color = "#ef4444";
    }

    // RESTORE BUTTON
    evaluateBtn.disabled = false;
    evaluateBtn.textContent = "Evaluate My Resume →";
  } catch (error) {
    console.error("Error:", error);

    // ERROR UI
    feedbackOutput.textContent =
      "Oops! Something went wrong. Please try again.";

    scoreValue.textContent = "Error";
    scoreValue.style.color = "#ef4444";

    // RESTORE BUTTON
    evaluateBtn.disabled = false;
    evaluateBtn.textContent = "Evaluate My Resume →";
  }
});

// CLEAR BUTTON
const clearBtn = document.getElementById("clear-btn");

clearBtn.addEventListener("click", function () {
  // CLEAR INPUT
  resumeInput.value = "";

  // RESET OUTPUT
  scoreValue.textContent = "--";
  scoreValue.style.color = "#2563eb";

  feedbackOutput.textContent = "Your evaluation will appear here...";

  // RESET BUTTON
  evaluateBtn.disabled = false;
  evaluateBtn.textContent = "Evaluate My Resume →";

  // FOCUS INPUT
  resumeInput.focus();
});
