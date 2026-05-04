let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let streak = parseInt(localStorage.getItem('ais_streak')) || 0;
let answered = false;

document.addEventListener('DOMContentLoaded', async () => {
    // Update streak UI on load
    document.getElementById('streak').textContent = `🔥 ${streak}`;
    
    try {
        const response = await fetch('questions.json');
        if (!response.ok) throw new Error('Failed to load questions.');
        
        questions = await response.json();
        
        // Shuffle questions to make it random every time
        questions.sort(() => Math.random() - 0.5);
        
        // Initialize score display
        document.getElementById('score').textContent = `0 / ${questions.length}`;
        
        loadQuestion();
    } catch (error) {
        console.error('Error loading questions:', error);
        document.getElementById('question-text').textContent = "Failed to load questions. Make sure questions.json is in the correct directory.";
    }
});

function loadQuestion() {
    answered = false;
    const currentQuestion = questions[currentQuestionIndex];
    
    document.getElementById('question-text').textContent = currentQuestion.question;
    
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    currentQuestion.options.forEach((option) => {
        const btn = document.createElement('button');
        btn.classList.add('option-btn');
        btn.textContent = option;
        btn.onclick = () => checkAnswer(option, btn);
        optionsContainer.appendChild(btn);
    });
    
    // Clear feedback text
    const feedback = document.getElementById('feedback-text');
    feedback.textContent = '';
    feedback.className = '';

    // Update progress bar
    const progressPercent = ((currentQuestionIndex) / questions.length) * 100;
    document.getElementById('progress-bar').style.width = `${progressPercent}%`;
}

function checkAnswer(selectedOption, btn) {
    if (answered) return;
    answered = true;
    
    const currentQuestion = questions[currentQuestionIndex];
    const feedback = document.getElementById('feedback-text');
    
    if (selectedOption === currentQuestion.correctAnswer) {
        score++;
        streak++;
        
        // Visual indicator for correct choice
        btn.style.backgroundColor = 'var(--correct-green)';
        feedback.textContent = `Correct! ${currentQuestion.explanation}`;
        feedback.className = 'feedback-correct';
        
    } else {
        streak = 0; // Reset streak on incorrect answer
        
        btn.style.backgroundColor = 'var(--incorrect-red)';
        feedback.textContent = `Incorrect. The correct answer is "${currentQuestion.correctAnswer}". ${currentQuestion.explanation}`;
        feedback.className = 'feedback-incorrect';
    }
    
    // Save streak and update UI
    localStorage.setItem('ais_streak', streak);
    document.getElementById('streak').textContent = `🔥 ${streak}`;
    document.getElementById('score').textContent = `${score} / ${questions.length}`;
    
    // Disable other buttons after selection
    const buttons = document.querySelectorAll('.option-btn');
    buttons.forEach(button => {
        button.onclick = null;
        button.style.cursor = 'default';
    });
    
    // Move to next question or end quiz after a brief pause
    setTimeout(() => {
        currentQuestionIndex++;
        
        if (currentQuestionIndex < questions.length) {
            loadQuestion();
        } else {
            finishQuiz();
        }
    }, 5000); // Gives users 5 seconds to read the explanation before continuing
}

function finishQuiz() {
    const quizContainer = document.getElementById('quiz-container');
    quizContainer.innerHTML = `
        <div style="text-align: center; padding: 40px 0;">
            <h2>🎉 Quiz Completed! 🎉</h2>
            <p style="font-size: 1.2rem; margin: 20px 0;">Your Final Score: ${score} / ${questions.length}</p>
            <button class="option-btn" onclick="resetQuiz()" style="display: block; margin: 0 auto; width: 50%;">Restart Study Mode</button>
        </div>
    `;

    // Trigger gamification confetti celebration
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 }
        });
    }
}

function resetQuiz() {
    // Reset state to reload the quiz
    currentQuestionIndex = 0;
    score = 0;
    questions.sort(() => Math.random() - 0.5);
    
    // Re-render container
    const quizContainer = document.getElementById('quiz-container');
    quizContainer.innerHTML = `
        <div id="question-text">Loading question...</div>
        <div id="options-container"></div>
        <div id="feedback-text"></div>
    `;
    
    loadQuestion();
    document.getElementById('score').textContent = `0 / ${questions.length}`;
}