const progressBar = document.querySelector(".progress-bar"),
  progressText = document.querySelector(".progress-text");

const progress = (value) => {
  const percentage = (value / time) * 100;
  progressBar.style.width = `${percentage}%`;
  progressText.innerHTML = `${value}`;
};

const startBtn = document.querySelector(".start"),
  numQuestions = document.querySelector("#num-questions"),
  category = document.querySelector("#category"),
  difficulty = document.querySelector("#difficulty"),
  timePerQuestion = document.querySelector("#time"),
  quiz = document.querySelector(".quiz"),
  startScreen = document.querySelector(".start-screen");

let questions = [],
  time = 10,
  score = 0,
  currentQuestion = 0,
  timer;

const updateStartButtonText = () => {
  if (!category.value && !difficulty.value) {
    startBtn.innerHTML = "Start Random Quiz";
  } else {
    startBtn.innerHTML = "Start Quiz";
  }
};

const startQuiz = () => {
  const num = numQuestions.value,
    cat = category.value,
    diff = difficulty.value;
  
  loadingAnimation();
  
  const url = `https://opentdb.com/api.php?amount=${num}${
    cat ? `&category=${cat}` : ""
  }${diff ? `&difficulty=${diff}` : ""}&type=multiple`;
  
  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      questions = data.results;
      shuffleQuestions(questions);
      clearInterval(loadingInterval); // Clear the loading animation interval
      startScreen.classList.add("hide");
      quiz.classList.remove("hide");
      currentQuestion = 0;
      showQuestion(questions[currentQuestion]);
    });
};

const shuffleQuestions = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

category.addEventListener("change", updateStartButtonText);
difficulty.addEventListener("change", updateStartButtonText);
startBtn.addEventListener("click", startQuiz);

const showQuestion = (question) => {
  const questionText = document.querySelector(".question"),
    answersWrapper = document.querySelector(".answer-wrapper"),
    questionNumber = document.querySelector(".number");

  questionText.innerHTML = question.question;

  const answers = [
    ...question.incorrect_answers,
    question.correct_answer.toString(),
  ];
  answersWrapper.innerHTML = "";
  answers.sort(() => Math.random() - 0.5);
  answers.forEach((answer) => {
    answersWrapper.innerHTML += `
      <div class="answer">
        <span class="text">${answer}</span>
        <span class="checkbox">
          <i class="fas fa-check"></i>
        </span>
      </div>
    `;  
  });

  questionNumber.innerHTML = `Question <span class="current">${currentQuestion + 1}</span> <span class="total">/${questions.length}</span>`;
  
  const answersDiv = document.querySelectorAll(".answer");
  answersDiv.forEach((answer) => {
    answer.addEventListener("click", () => {
      if (!answer.classList.contains("checked")) {
        answersDiv.forEach((answer) => {
          answer.classList.remove("selected");
        });
        answer.classList.add("selected");
        submitBtn.disabled = false;
      }
    });
  });

  startTimer(10); // Set default time to 10 seconds
};

const startTimer = () => {
  let time = 10; // Default time is 10 seconds
  clearInterval(timer); // Clear any previous timer
  timer = setInterval(() => {
    if (time === 3) {
      playAudio("countdown.mp3");
    }
    if (time >= 0) {
      progress(time);
      time--;
    } else {
      clearInterval(timer);
      checkAnswer();
    }
  }, 1000);
};

const loadingAnimation = () => {
  startBtn.innerHTML = "Loading";
  loadingInterval = setInterval(() => { // Declare loadingInterval globally or at the top scope
    if (startBtn.innerHTML.length === 10) {
      startBtn.innerHTML = "Loading";
    } else {
      startBtn.innerHTML += ".";
    }
  }, 500);
};

const submitBtn = document.querySelector(".submit"),
  nextBtn = document.querySelector(".next");

submitBtn.addEventListener("click", () => {
  checkAnswer();
});

nextBtn.addEventListener("click", () => {
  nextQuestion();
  submitBtn.style.display = "block";
  nextBtn.style.display = "none";
});

const checkAnswer = () => {
  clearInterval(timer);
  const selectedAnswer = document.querySelector(".answer.selected");
  if (selectedAnswer) {
    const answer = selectedAnswer.querySelector(".text").innerHTML;
    if (answer === questions[currentQuestion].correct_answer) {
      score++;
      selectedAnswer.classList.add("correct");
    } else {
      selectedAnswer.classList.add("wrong");
      document.querySelectorAll(".answer").forEach((answer) => {
        if (answer.querySelector(".text").innerHTML === questions[currentQuestion].correct_answer) {
          answer.classList.add("correct");
        }
      });
    }
  } else {
    document.querySelectorAll(".answer").forEach((answer) => {
      if (answer.querySelector(".text").innerHTML === questions[currentQuestion].correct_answer) {
        answer.classList.add("correct");
      }
    });
  }
  document.querySelectorAll(".answer").forEach((answer) => {
    answer.classList.add("checked");
  });

  submitBtn.style.display = "none";
  nextBtn.style.display = "block";
};

const nextQuestion = () => {
  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    showQuestion(questions[currentQuestion]);
  } else {
    showScore();
  }
};

const endScreen = document.querySelector(".end-screen"),
  finalScore = document.querySelector(".final-score"),
  totalScore = document.querySelector(".total-score");

const showScore = () => {
  endScreen.classList.remove("hide");
  quiz.classList.add("hide");
  finalScore.innerHTML = score;
  totalScore.innerHTML = `/ ${questions.length}`;
};

const restartBtn = document.querySelector(".restart");
restartBtn.addEventListener("click", () => {
  window.location.reload();
});

const playAudio = (src) => {
  const audio = new Audio(src);
  audio.play();
};

// Update button text on page load
updateStartButtonText();
