/* ---------- Regular Quiz Logic ---------- */
const teamSelect = document.getElementById("team-select");
const questionSelect = document.getElementById("question-select");
const showQuestionBtn = document.getElementById("show-question-btn");
const questionDisplay = document.getElementById("question-display");
const showAnswerBtn = document.getElementById("show-answer-btn");
const answerDisplay = document.getElementById("answer-display");

let selectedQuestion = null;
let usedQuestions = {}; // map questionKey -> teamName

function populateQuestions() {
  const round = document.getElementById("round-select").value;
  questionSelect.innerHTML = '<option value="">--Number--</option>';
  if (!round) return;
  // Assume max 50 questions, show 50 numbers
  for (let i = 1; i <= 50; i++) {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = i;
    questionSelect.appendChild(opt);
  }
}
document.getElementById("round-select").addEventListener("change", populateQuestions);

showQuestionBtn.addEventListener("click", async () => {
  const round = document.getElementById("round-select").value;
  const questionNumber = questionSelect.value;
  const team = teamSelect.value;
  if (!round || !questionNumber || !team) {
    questionDisplay.textContent = "Choose all options";
    return;
  }
  const questionKey = `${round}-${questionNumber}`;

  if (usedQuestions[questionKey]) {
    questionDisplay.textContent = `This question number is already selected by ${usedQuestions[questionKey]}`;
    answerDisplay.textContent = "";
    return;
  }

  try {
    const response = await fetch(`${round}.json`);
    const data = await response.json();
    selectedQuestion = data[questionNumber - 1];
    if (selectedQuestion) {
      questionDisplay.textContent = selectedQuestion.question;
      answerDisplay.textContent = "";
      usedQuestions[questionKey] = `House ${team.toUpperCase()}`;
    } else {
      questionDisplay.textContent = "Question not found";
    }
  } catch (err) {
    questionDisplay.textContent = "Sorry! couldnot load the question";
  }
});

showAnswerBtn.addEventListener("click", () => {
  if (selectedQuestion) {
    answerDisplay.textContent = "Answer: " + selectedQuestion.answer;
  }
});

function addScore(team) {
  const scoreElement = document.getElementById(`score-${team}`);
  scoreElement.textContent = parseInt(scoreElement.textContent) + 5;
}

/* ---------- Rapid Fire Logic ---------- */
let rapidFireQuestions = {};
let rfTeam = "";
let rfIndex = 0;
let rfTime = 90;
let rfInterval = null;

async function loadRapidFire() {
  if (Object.keys(rapidFireQuestions).length) return; // already loaded
  try {
    const res = await fetch("rapid_fire.json");
    rapidFireQuestions = await res.json();
  } catch (e) {
    console.error("Rapid fire questions load error", e);
  }
}

const rfTeamSelect = document.getElementById("rf-team-select");
const startRfBtn = document.getElementById("start-rf-btn");
const rfTimerSpan = document.getElementById("rf-timer");
const rfQuestionDiv = document.getElementById("rf-question");
const nextRfBtn = document.getElementById("next-rf-btn");

startRfBtn.addEventListener("click", async () => {
  await loadRapidFire();
  rfTeam = rfTeamSelect.value;
  if (!rfTeam) {
    rfQuestionDiv.textContent = "Choose House";
    return;
  }
  rfIndex = 0;
  rfTime = 90;
  rfTimerSpan.textContent = rfTime;
  showRapidFireQuestion();
  nextRfBtn.style.display = "inline-block";
  startRfBtn.disabled = true;

  rfInterval = setInterval(() => {
    rfTime--;
    rfTimerSpan.textContent = rfTime;
    if (rfTime <= 0) endRapidFire();
  }, 1000);
});

nextRfBtn.addEventListener("click", () => {
  rfIndex++;
  showRapidFireQuestion();
});

function showRapidFireQuestion() {
  const list = rapidFireQuestions[rfTeam] || [];
  if (rfIndex < list.length) {
    rfQuestionDiv.textContent = list[rfIndex].q;
  } else {
    endRapidFire();
  }
}

function endRapidFire() {
  clearInterval(rfInterval);
  rfQuestionDiv.textContent = "⏰ Thank You !";
  nextRfBtn.style.display = "none";
  startRfBtn.disabled = false;
}

/* ---------- Reset ---------- */
document.getElementById("reset-btn").addEventListener("click", () => {
  // reset scores
  ["RED","BLUE","GREEN","YELLOW"].forEach(t => document.getElementById(`score-${t}`).textContent = "0");
  // reset question display
  questionDisplay.textContent = "Questions will display here !";
  answerDisplay.textContent = "";
  // reset selects
  document.getElementById("round-select").value = "";
  teamSelect.value = "";
  questionSelect.innerHTML = '<option value="">--Number--</option>';
  // reset used questions
  usedQuestions = {};

  // reset rapid fire
  rfTeamSelect.value = "";
  rfQuestionDiv.textContent = "";
  rfTimerSpan.textContent = "90";
  nextRfBtn.style.display = "none";
  startRfBtn.disabled = false;
});
