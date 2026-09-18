/* Kids English Flashcards - Ages 4+
   Uses only the attached flashcard images.
   Audio via Web Speech API. Confetti via pure canvas.
*/

const CARDS = {
  home: [
    { id: "wake-up", img: "images/home/wake-up.png", text: "Wake up early" },
    { id: "brush-teeth", img: "images/home/brush-teeth.png", text: "Brush your teeth twice a day" },
    { id: "take-bath", img: "images/home/take-bath.png", text: "Take a bath every day" },
    { id: "food-on-time", img: "images/home/food-on-time.png", text: "Have your food on time" },
    { id: "learn-lessons", img: "images/home/learn-lessons.png", text: "Learn your lessons every day" },
    { id: "play-evening", img: "images/home/play-evening.png", text: "Play in the evening" },
    { id: "pray-god", img: "images/home/pray-god.png", text: "Pray to God every day" },
    { id: "go-sleep", img: "images/home/go-sleep.png", text: "Go to sleep early" }
  ],
  school: [
    { id: "be-on-time", img: "images/school/be-on-time.png", text: "Be on time to school" },
    { id: "neatly-dressed", img: "images/school/neatly-dressed.png", text: "Come neatly dressed to school" },
    { id: "greet-teachers", img: "images/school/greet-teachers.png", text: "Greet your teachers and friends when you enter the school" },
    { id: "do-homework", img: "images/school/do-homework.png", text: "Do your homework every day" },
    { id: "revise-lessons", img: "images/school/revise-lessons.png", text: "Revise your lessons every day" },
    { id: "be-polite", img: "images/school/be-polite.png", text: "Be polite and kind to friends" },
    { id: "wait-turn", img: "images/school/wait-turn.png", text: "Wait for your turn" },
    { id: "keep-belongings", img: "images/school/keep-belongings.png", text: "Keep your belongings carefully" }
  ]
};

// State
let currentCategory = null;
let currentIndex = 0;
let learned = JSON.parse(localStorage.getItem("kidsFlashLearned") || "{}");
let reviseIndex = 0;
let reviseOrder = [];
let reviseAnswered = false;

// DOM
const screens = {
  home: document.getElementById("home-screen"),
  learn: document.getElementById("learn-screen"),
  revise: document.getElementById("revise-screen"),
  reward: document.getElementById("reward-screen")
};

const cardImage = document.getElementById("card-image");
const cardSentence = document.getElementById("card-sentence");
const flashcard = document.getElementById("flashcard");
const categoryTitle = document.getElementById("category-title");
const progressBar = document.getElementById("category-progress-bar");
const progressText = document.getElementById("category-progress-text");
const totalProgress = document.getElementById("total-progress");
const learnedFeedback = document.getElementById("learned-feedback");
const markLearnedBtn = document.getElementById("mark-learned");

// ---------- Navigation ----------
function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove("active"));
  screens[name].classList.add("active");
}

document.querySelectorAll(".category-card").forEach(btn => {
  btn.addEventListener("click", () => {
    currentCategory = btn.dataset.category;
    currentIndex = 0;
    categoryTitle.textContent = currentCategory === "home"
      ? "Good Habits at Home"
      : "Good Manners at School";
    updateProgressUI();
    renderCard();
    showScreen("learn");
  });
});

document.getElementById("back-home").addEventListener("click", () => {
  updateTotalProgress();
  showScreen("home");
});

document.getElementById("back-to-learn").addEventListener("click", () => {
  showScreen("learn");
});

document.getElementById("back-from-reward").addEventListener("click", () => {
  updateTotalProgress();
  showScreen("home");
});

// ---------- Card rendering ----------
function renderCard() {
  const cards = CARDS[currentCategory];
  const card = cards[currentIndex];
  cardImage.src = card.img;
  cardImage.alt = card.text;
  cardSentence.textContent = card.text;

  flashcard.classList.remove("enter", "bounce", "celebrate");
  void flashcard.offsetWidth; // reflow
  flashcard.classList.add("enter");

  const isLearned = !!learned[card.id];
  markLearnedBtn.disabled = isLearned;
  markLearnedBtn.textContent = isLearned ? "Already Learned!" : "I Learned It!";
  learnedFeedback.classList.add("hidden");
}

document.getElementById("prev-card").addEventListener("click", () => {
  const cards = CARDS[currentCategory];
  currentIndex = (currentIndex - 1 + cards.length) % cards.length;
  renderCard();
});

document.getElementById("next-card").addEventListener("click", () => {
  const cards = CARDS[currentCategory];
  currentIndex = (currentIndex + 1) % cards.length;
  renderCard();
});

// ---------- Progress ----------
function updateProgressUI() {
  const cards = CARDS[currentCategory];
  const learnedCount = cards.filter(c => learned[c.id]).length;
  const pct = (learnedCount / cards.length) * 100;
  progressBar.style.setProperty("--pct", pct + "%");
  // Use ::after via style
  progressBar.querySelector || (progressBar.style.background = `linear-gradient(90deg, #4ECDC4 ${pct}%, #e0e0e0 ${pct}%)`);
  // Fallback solid
  progressBar.style.background = `linear-gradient(to right, #4ECDC4 ${pct}%, #e0e0e0 ${pct}%)`;
  progressText.textContent = `${learnedCount} / ${cards.length}`;
}

function updateTotalProgress() {
  const allIds = [...CARDS.home, ...CARDS.school].map(c => c.id);
  const count = allIds.filter(id => learned[id]).length;
  totalProgress.textContent = count;
}

// ---------- Speech ----------
function speak(text, rate = 0.9) {
  if (!window.speechSynthesis) {
    alert("Speech is not supported in this browser. Please try Chrome or Edge.");
    return;
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = rate;
  utter.pitch = 1.05;
  utter.lang = "en-US";
  // Prefer a friendly voice if available
  const voices = speechSynthesis.getVoices();
  const preferred = voices.find(v =>
    v.lang.startsWith("en") && (v.name.includes("Female") || v.name.includes("Samantha") || v.name.includes("Google"))
  );
  if (preferred) utter.voice = preferred;
  speechSynthesis.speak(utter);
}

document.getElementById("speak-sentence").addEventListener("click", () => {
  const card = CARDS[currentCategory][currentIndex];
  speak(card.text, 0.95);
  flashcard.classList.remove("bounce");
  void flashcard.offsetWidth;
  flashcard.classList.add("bounce");
});

// ---------- Mark learned + reward ----------
document.getElementById("mark-learned").addEventListener("click", () => {
  const card = CARDS[currentCategory][currentIndex];
  if (learned[card.id]) return;

  learned[card.id] = true;
  localStorage.setItem("kidsFlashLearned", JSON.stringify(learned));

  markLearnedBtn.disabled = true;
  markLearnedBtn.textContent = "Already Learned!";
  learnedFeedback.textContent = "Awesome! You learned it!";
  learnedFeedback.classList.remove("hidden");

  flashcard.classList.remove("celebrate");
  void flashcard.offsetWidth;
  flashcard.classList.add("celebrate");

  fireConfetti();
  updateProgressUI();

  // Check if category complete
  const cards = CARDS[currentCategory];
  const allDone = cards.every(c => learned[c.id]);
  if (allDone) {
    setTimeout(() => showCategoryReward(), 900);
  }
});

function showCategoryReward() {
  const msg = document.getElementById("reward-message");
  const container = document.querySelector(".reward-images");
  container.innerHTML = "";
  const cards = CARDS[currentCategory];
  cards.forEach((c, i) => {
    const img = document.createElement("img");
    img.src = c.img;
    img.alt = c.text;
    img.style.animationDelay = (i * 0.15) + "s";
    container.appendChild(img);
  });
  msg.textContent = currentCategory === "home"
    ? "You finished all Good Habits at Home!"
    : "You finished all Good Manners at School!";
  showScreen("reward");
  fireConfetti(120);
}

// ---------- Revise mode ----------
document.getElementById("start-revise").addEventListener("click", () => {
  reviseOrder = [...CARDS[currentCategory]].sort(() => Math.random() - 0.5);
  reviseIndex = 0;
  reviseAnswered = false;
  renderRevise();
  showScreen("revise");
});

function renderRevise() {
  const card = reviseOrder[reviseIndex];
  document.getElementById("revise-image").src = card.img;
  document.getElementById("revise-progress").textContent =
    `${reviseIndex + 1} / ${reviseOrder.length}`;

  // Build options: correct + 3 random wrong from same category
  const others = CARDS[currentCategory]
    .filter(c => c.id !== card.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  const options = [card, ...others].sort(() => Math.random() - 0.5);

  const grid = document.getElementById("revise-options");
  grid.innerHTML = "";
  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = opt.text;
    btn.dataset.id = opt.id;
    btn.addEventListener("click", () => handleOption(opt.id, card.id, btn));
    grid.appendChild(btn);
  });

  reviseAnswered = false;
  document.getElementById("revise-feedback").classList.add("hidden");
}

function handleOption(chosenId, correctId, btn) {
  if (reviseAnswered) return;
  reviseAnswered = true;

  const allBtns = document.querySelectorAll(".option-btn");
  allBtns.forEach(b => {
    b.disabled = true;
    if (b.dataset.id === correctId) b.classList.add("correct");
  });

  const feedback = document.getElementById("revise-feedback");
  if (chosenId === correctId) {
    feedback.textContent = "Correct! Great job!";
    feedback.style.color = "#00b894";
    fireConfetti(60);
    // Mark learned too
    if (!learned[correctId]) {
      learned[correctId] = true;
      localStorage.setItem("kidsFlashLearned", JSON.stringify(learned));
    }
  } else {
    btn.classList.add("wrong");
    feedback.textContent = "Try again next time!";
    feedback.style.color = "#d63031";
  }
  feedback.classList.remove("hidden");

  // Auto advance after short delay
  setTimeout(() => {
    reviseIndex++;
    if (reviseIndex >= reviseOrder.length) {
      // Finished revise set
      const cards = CARDS[currentCategory];
      const allDone = cards.every(c => learned[c.id]);
      if (allDone) {
        showCategoryReward();
      } else {
        // Small reward for finishing revise
        fireConfetti(80);
        alert("Revision complete! Keep practicing!");
        showScreen("learn");
        updateProgressUI();
      }
    } else {
      renderRevise();
    }
  }, 1600);
}

document.getElementById("speak-revise").addEventListener("click", () => {
  const card = reviseOrder[reviseIndex];
  speak(card.text, 0.95);
});

// ---------- Confetti (pure canvas, no external lib) ----------
const canvas = document.getElementById("confetti-canvas");
const ctx = canvas.getContext("2d");
let confettiPieces = [];
let confettiAnimId = null;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

function fireConfetti(count = 80) {
  const colors = ["#FF6B6B", "#4ECDC4", "#FFE66D", "#6C5CE7", "#FF9FF3", "#54A0FF", "#5CD85A"];
  for (let i = 0; i < count; i++) {
    confettiPieces.push({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 40,
      w: 8 + Math.random() * 8,
      h: 6 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 6,
      vy: 2 + Math.random() * 4,
      rot: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 10
    });
  }
  if (!confettiAnimId) animateConfetti();
}

function animateConfetti() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  confettiPieces = confettiPieces.filter(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.08; // gravity
    p.rot += p.rotSpeed;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rot * Math.PI) / 180);
    ctx.fillStyle = p.color;
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    ctx.restore();
    return p.y < canvas.height + 30;
  });
  if (confettiPieces.length > 0) {
    confettiAnimId = requestAnimationFrame(animateConfetti);
  } else {
    confettiAnimId = null;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

// Init
updateTotalProgress();
// Ensure voices load
if (window.speechSynthesis) {
  speechSynthesis.getVoices();
  speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
}
