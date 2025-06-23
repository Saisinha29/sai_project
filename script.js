// Quiz Data
const quizData = [
    {
        id: 1,
        question: "What is the capital city of France?",
        options: ["Paris", "London", "Berlin", "Madrid"],
        correct: 0
    },
    {
        id: 2,
        question: "Which planet is known as the Red Planet?",
        options: ["Venus", "Mars", "Jupiter", "Saturn"],
        correct: 1
    },
    {
        id: 3,
        question: "What is the largest ocean on Earth?",
        options: ["Atlantic", "Indian", "Arctic", "Pacific"],
        correct: 3
    },
    {
        id: 4,
        question: "Who painted the Mona Lisa?",
        options: ["Vincent van Gogh", "Leonardo da Vinci", "Pablo Picasso", "Michelangelo"],
        correct: 1
    },
    {
        id: 5,
        question: "What is the chemical symbol for gold?",
        options: ["Go", "Gd", "Au", "Ag"],
        correct: 2
    },
    {
        id: 6,
        question: "Which country is home to Machu Picchu?",
        options: ["Chile", "Peru", "Ecuador", "Bolivia"],
        correct: 1
    },
    {
        id: 7,
        question: "What is the smallest prime number?",
        options: ["0", "1", "2", "3"],
        correct: 2
    },
    {
        id: 8,
        question: "Which instrument measures atmospheric pressure?",
        options: ["Thermometer", "Barometer", "Hydrometer", "Anemometer"],
        correct: 1
    },
    {
        id: 9,
        question: "What year did the Berlin Wall fall?",
        options: ["1987", "1989", "1991", "1993"],
        correct: 1
    },
    {
        id: 10,
        question: "Which vitamin is produced when skin is exposed to sunlight?",
        options: ["Vitamin A", "Vitamin C", "Vitamin D", "Vitamin K"],
        correct: 2
    }
];

// Quiz State
let currentQuestionIndex = 0;
let score = 0;
let timeLeft = 30;
let timer = null;
let selectedAnswer = null;
let showFeedback = false;
let userAnswers = [];

// DOM Elements
const welcomeScreen = document.getElementById('welcomeScreen');
const quizScreen = document.getElementById('quizScreen');
const resultsScreen = document.getElementById('resultsScreen');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const timerElement = document.getElementById('timer');
const timeDisplay = document.getElementById('timeDisplay');
const questionCounter = document.getElementById('questionCounter');
const progressFill = document.getElementById('progressFill');
const questionNum = document.getElementById('questionNum');
const questionText = document.getElementById('questionText');
const scoreDisplay = document.getElementById('scoreDisplay');
const answersContainer = document.getElementById('answersContainer');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const skipBtn = document.getElementById('skipBtn');
const correctCount = document.getElementById('correctCount');
const incorrectCount = document.getElementById('incorrectCount');
const finalScore = document.getElementById('finalScore');
const performanceFill = document.getElementById('performanceFill');
const performanceMessage = document.getElementById('performanceMessage');

// Initialize the quiz
function init() {
    showScreen('welcome');
    setupEventListeners();
    hideTimer();
}

// Setup event listeners
function setupEventListeners() {
    startBtn.addEventListener('click', startQuiz);
    restartBtn.addEventListener('click', restartQuiz);
    prevBtn.addEventListener('click', previousQuestion);
    nextBtn.addEventListener('click', nextQuestion);
    skipBtn.addEventListener('click', skipQuestion);
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyPress);
}

// Handle keyboard navigation
function handleKeyPress(e) {
    if (getCurrentScreen() !== 'quiz') return;
    
    if (showFeedback) return;
    
    // Number keys for answers
    if (e.key >= '1' && e.key <= '4') {
        const answerIndex = parseInt(e.key) - 1;
        if (answerIndex < quizData[currentQuestionIndex].options.length) {
            selectAnswer(answerIndex);
        }
    }
    // Arrow keys for navigation
    else if (e.key === 'ArrowLeft') {
        previousQuestion();
    }
    else if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        if (selectedAnswer !== null) {
            nextQuestion();
        }
    }
    // Escape to skip
    else if (e.key === 'Escape') {
        skipQuestion();
    }
}

// Screen management
function showScreen(screen) {
    const screens = [welcomeScreen, quizScreen, resultsScreen];
    screens.forEach(s => s.classList.remove('active'));
    
    if (screen === 'welcome') {
        welcomeScreen.classList.add('active');
    } else if (screen === 'quiz') {
        quizScreen.classList.add('active');
    } else if (screen === 'results') {
        resultsScreen.classList.add('active');
    }
}

function getCurrentScreen() {
    if (welcomeScreen.classList.contains('active')) return 'welcome';
    if (quizScreen.classList.contains('active')) return 'quiz';
    if (resultsScreen.classList.contains('active')) return 'results';
    return null;
}

// Timer functions
function showTimer() {
    timerElement.style.display = 'flex';
}

function hideTimer() {
    timerElement.style.display = 'none';
}

function startTimer() {
    if (timer) clearInterval(timer);
    
    timer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 10) {
            timerElement.classList.add('warning');
        }
        
        if (timeLeft <= 0) {
            skipQuestion();
        }
    }, 1000);
}

function stopTimer() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    timerElement.classList.remove('warning');
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Quiz logic
function startQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = [];
    showScreen('quiz');
    showTimer();
    loadQuestion();
}

function restartQuiz() {
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = [];
    selectedAnswer = null;
    showFeedback = false;
    timeLeft = 30;
    stopTimer();
    showScreen('welcome');
    hideTimer();
}

function loadQuestion() {
    const question = quizData[currentQuestionIndex];
    selectedAnswer = null;
    showFeedback = false;
    timeLeft = 30;
    
    // Update UI
    questionNum.textContent = currentQuestionIndex + 1;
    questionText.textContent = question.question;
    questionCounter.textContent = `${currentQuestionIndex + 1} / ${quizData.length}`;
    scoreDisplay.textContent = `${score} pts`;
    
    // Update progress bar
    const progress = ((currentQuestionIndex + 1) / quizData.length) * 100;
    progressFill.style.width = `${progress}%`;
    
    // Generate answer options
    generateAnswerOptions(question);
    
    // Update navigation buttons
    updateNavigationButtons();
    
    // Start timer
    updateTimerDisplay();
    startTimer();
}

function generateAnswerOptions(question) {
    answersContainer.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];
    
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'answer-option';
        button.onclick = () => selectAnswer(index);
        
        button.innerHTML = `
            <div class="answer-letter">${letters[index]}</div>
            <span>${option}</span>
        `;
        
        answersContainer.appendChild(button);
    });
}

function selectAnswer(answerIndex) {
    if (selectedAnswer !== null || showFeedback) return;
    
    selectedAnswer = answerIndex;
    showFeedback = true;
    stopTimer();
    
    const question = quizData[currentQuestionIndex];
    const isCorrect = answerIndex === question.correct;
    const questionScore = calculateScore(timeLeft, isCorrect);
    
    score += questionScore;
    scoreDisplay.textContent = `${score} pts`;
    
    // Store user answer
    const userAnswer = {
        questionId: question.id,
        selected: answerIndex,
        correct: question.correct,
        isCorrect: isCorrect,
        timeSpent: 30 - timeLeft
    };
    userAnswers.push(userAnswer);
    
    // Update answer options appearance
    updateAnswerOptionsAppearance(question.correct, answerIndex);
    
    // Update navigation
    updateNavigationButtons();
    
    // Auto advance after 2 seconds
    setTimeout(() => {
        if (currentQuestionIndex === quizData.length - 1) {
            endQuiz();
        } else {
            nextQuestion();
        }
    }, 2000);
}

function updateAnswerOptionsAppearance(correctIndex, selectedIndex) {
    const options = answersContainer.querySelectorAll('.answer-option');
    
    options.forEach((option, index) => {
        option.classList.add('disabled');
        
        if (index === correctIndex) {
            option.classList.add('correct');
        } else if (index === selectedIndex && index !== correctIndex) {
            option.classList.add('incorrect');
        }
    });
}

function calculateScore(timeLeft, isCorrect) {
    if (!isCorrect) return 0;
    const timeBonus = Math.max(timeLeft * 2, 10);
    return 100 + timeBonus;
}

function updateNavigationButtons() {
    prevBtn.disabled = currentQuestionIndex === 0 || showFeedback;
    nextBtn.disabled = selectedAnswer === null && !showFeedback;
    skipBtn.disabled = showFeedback;
}

function previousQuestion() {
    if (currentQuestionIndex > 0 && !showFeedback) {
        stopTimer();
        currentQuestionIndex--;
        loadQuestion();
    }
}

function nextQuestion() {
    if (selectedAnswer !== null || showFeedback) {
        if (currentQuestionIndex < quizData.length - 1) {
            currentQuestionIndex++;
            loadQuestion();
        } else {
            endQuiz();
        }
    }
}

function skipQuestion() {
    if (showFeedback) return;
    
    stopTimer();
    
    const question = quizData[currentQuestionIndex];
    const userAnswer = {
        questionId: question.id,
        selected: null,
        correct: question.correct,
        isCorrect: false,
        timeSpent: 30 - timeLeft
    };
    userAnswers.push(userAnswer);
    
    if (currentQuestionIndex === quizData.length - 1) {
        endQuiz();
    } else {
        currentQuestionIndex++;
        loadQuestion();
    }
}

function endQuiz() {
    stopTimer();
    hideTimer();
    showResults();
}

function showResults() {
    const result = calculateQuizResult();
    
    // Update results display
    correctCount.textContent = result.correctAnswers;
    incorrectCount.textContent = result.incorrectAnswers;
    finalScore.textContent = result.score;
    
    // Animate performance bar
    setTimeout(() => {
        performanceFill.style.width = `${result.percentage}%`;
    }, 500);
    
    // Show performance message
    performanceMessage.textContent = getPerformanceMessage(result.percentage);
    
    // Save result to localStorage
    saveQuizResult(result);
    
    showScreen('results');
}

function calculateQuizResult() {
    const correctAnswers = userAnswers.filter(answer => answer.isCorrect).length;
    const incorrectAnswers = userAnswers.length - correctAnswers;
    const percentage = Math.round((correctAnswers / quizData.length) * 100);
    
    return {
        score: score,
        correctAnswers: correctAnswers,
        incorrectAnswers: incorrectAnswers,
        totalQuestions: quizData.length,
        percentage: percentage,
        userAnswers: userAnswers
    };
}

function getPerformanceMessage(percentage) {
    if (percentage >= 90) {
        return "Outstanding! You're a quiz master!";
    } else if (percentage >= 80) {
        return "Excellent! You got most questions right.";
    } else if (percentage >= 70) {
        return "Good job! You have solid knowledge.";
    } else if (percentage >= 60) {
        return "Not bad! Room for improvement though.";
    } else {
        return "Keep learning! Practice makes perfect.";
    }
}

function saveQuizResult(result) {
    localStorage.setItem('lastQuizScore', result.score.toString());
    localStorage.setItem('lastQuizDate', new Date().toISOString());
    localStorage.setItem('lastQuizResult', JSON.stringify(result));
}

function getLastQuizResult() {
    const resultData = localStorage.getItem('lastQuizResult');
    if (resultData) {
        try {
            return JSON.parse(resultData);
        } catch {
            return null;
        }
    }
    return null;
}

// Initialize the quiz when the page loads
document.addEventListener('DOMContentLoaded', init);