// YOUR API KEY
const API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";
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
  const increment = targetScore / 30; // Divide by 30 for smooth 30-frame animation
  const scoreElement = document.getElementById("score-value");

  const interval = setInterval(() => {
    currentScore += increment;

    if (currentScore >= targetScore) {
      scoreElement.textContent = targetScore;
      clearInterval(interval);
    } else {
      scoreElement.textContent = currentScore.toFixed(1);
    }
  }, 30); // Update every 30ms
}

// ONE CLICK LISTENER
evaluateBtn.addEventListener("click", async function () {
  // GET THE RESUME TEXT
  const resumeText = resumeInput.value;

  // VALIDATE - CHECK IF EMPTY
  if (resumeText.trim() === "") {
    console.log("Resume is Empty");
    return;
  }
  // SHOW LOADING STATE
  evaluateBtn.disabled = true;
  evaluateBtn.textContent = "Evaluating...";
  scoreValue.textContent = "...";
  scoreValue.style.color = "#2563eb";
  scoreValue.classList.remove("fade-in"); // ← ADD THIS
  feedbackOutput.textContent = "Getting your brutal evaluation...";
  feedbackOutput.classList.remove("fade-in");

  console.log("Processing the data...");

  // CALL THE GROQ API
  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "user",
              content: `You are a brutally honest resume evaluator. Evaluate this resume with a mix of constructive feedback and sarcasm. 
            
                Provide your response in this exact format:
                SCORE: [number between 0-10]
                FEEDBACK: [your detailed feedback here]

                Resume:
                ${resumeText}`,
            },
          ],
          max_tokens: 1000,
        }),
      },
    );

    const data = await response.json();

    // GET THE CONTENT TEXT FROM RESPONSE
    const content = data.choices[0].message.content;

    // SPLIT BY "FEEDBACK:" TO GET SCORE AND FEEDBACK
    const parts = content.split("FEEDBACK:");
    const scoreText = parts[0]; // "SCORE: 8.5\n"
    const feedbackText = parts[1]; // " Well, well, well..."

    // EXTRACT JUST THE NUMBER FROM "SCORE: 8.5"
    const scoreMatch = scoreText.match(/\d+\.?\d*/);
    const scoreNumber = scoreMatch ? parseFloat(scoreMatch[0]) : 0;
    // CLEAN UP FEEDBACK TEXT (REMOVE EXTRA SPACES)
    const cleanFeedback = feedbackText.trim();

    // UPDATE THE HTML WITH RESULTS WITH ANIMATION
    animateScore(scoreNumber);
    scoreValue.classList.add("fade-in");

    feedbackOutput.textContent = cleanFeedback;
    feedbackOutput.classList.add("fade-in");

    // COLOR-CODE THE SCORE
    if (scoreNumber >= 7) {
      scoreValue.style.color = "#10b981"; // Green for good
    } else if (scoreNumber >= 5) {
      scoreValue.style.color = "#f59e0b"; // Yellow/amber for okay
    } else {
      scoreValue.style.color = "#ef4444"; // Red for bad
    }
    feedbackOutput.textContent = cleanFeedback;

    // RESTORE BUTTON
    evaluateBtn.disabled = false;
    evaluateBtn.textContent = "Evaluate My Resume →";
  } catch (error) {
    console.error("Error:", error);

    // SHOW ERROR MESSAGE TO USER
    feedbackOutput.textContent =
      "Oops! Something went wrong. Please try again.";
    scoreValue.textContent = "Error";

    // RE-ENABLE BUTTON SO THEY CAN TRY AGAIN
    evaluateBtn.disabled = false;
    evaluateBtn.textContent = "Evaluate My Resume →";
  }
});

// CLEAR BUTTON LISTENER
const clearBtn = document.getElementById("clear-btn");

clearBtn.addEventListener("click", function () {
  // RESET TEXTAREA
  resumeInput.value = "";

  // RESET RESULTS
  scoreValue.textContent = "--";
  scoreValue.style.color = "#2563eb"; // Reset to original blue
  feedbackOutput.textContent = "Your evaluation will appear here...";

  // RESET BUTTON
  evaluateBtn.disabled = false;
  evaluateBtn.textContent = "Evaluate My Resume →";

  // FOCUS ON TEXTAREA
  resumeInput.focus();
});
