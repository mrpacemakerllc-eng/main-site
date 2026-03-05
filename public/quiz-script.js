// Quiz Questions with Labeled Answers
const quizQuestions = [
    {
        question: "What does the first letter in the NBG pacing code represent?",
        answers: [
            { label: "A", text: "Chamber(s) paced", correct: true },
            { label: "B", text: "Chamber(s) sensed", correct: false },
            { label: "C", text: "Response to sensing", correct: false },
            { label: "D", text: "Rate modulation", correct: false }
        ],
        explanation: "The first letter in the NBG pacing code indicates the chamber(s) that are paced. Options include A (atrium), V (ventricle), D (dual - both chambers), or O (none)."
    },
    {
        question: "What is the normal intrinsic heart rate controlled by the SA node?",
        answers: [
            { label: "A", text: "40-60 beats per minute", correct: false },
            { label: "B", text: "60-100 beats per minute", correct: true },
            { label: "C", text: "100-150 beats per minute", correct: false },
            { label: "D", text: "150-200 beats per minute", correct: false }
        ],
        explanation: "The SA (sinoatrial) node, the heart's natural pacemaker, typically generates impulses at a rate of 60-100 beats per minute in adults at rest."
    },
    {
        question: "What does DDD pacing mode mean?",
        answers: [
            { label: "A", text: "Dual pacing, dual sensing, dual response", correct: true },
            { label: "B", text: "Direct dual detection", correct: false },
            { label: "C", text: "Demand dual device", correct: false },
            { label: "D", text: "Delayed dual discharge", correct: false }
        ],
        explanation: "DDD mode means: D - both chambers paced, D - both chambers sensed, D - dual response (can be either inhibited or triggered). This is the most physiologic pacing mode."
    },
    {
        question: "What is the primary function of an ICD (Implantable Cardioverter Defibrillator)?",
        answers: [
            { label: "A", text: "Only provide bradycardia pacing", correct: false },
            { label: "B", text: "Monitor heart rhythm only", correct: false },
            { label: "C", text: "Detect and treat life-threatening arrhythmias", correct: true },
            { label: "D", text: "Improve heart failure symptoms", correct: false }
        ],
        explanation: "ICDs continuously monitor the heart rhythm and deliver therapy (ATP, cardioversion, or defibrillation) to terminate life-threatening ventricular arrhythmias like VT and VF."
    },
    {
        question: "What is the typical lower rate limit setting for a pacemaker?",
        answers: [
            { label: "A", text: "40 beats per minute", correct: false },
            { label: "B", text: "50 beats per minute", correct: false },
            { label: "C", text: "60 beats per minute", correct: true },
            { label: "D", text: "80 beats per minute", correct: false }
        ],
        explanation: "The lower rate limit is typically set at 60 bpm for most patients. This ensures the heart rate doesn't fall below this value, though it can be adjusted based on patient needs."
    },
    {
        question: "What does CRT stand for in cardiac device therapy?",
        answers: [
            { label: "A", text: "Cardiac Rhythm Therapy", correct: false },
            { label: "B", text: "Cardiac Resynchronization Therapy", correct: true },
            { label: "C", text: "Cardiovascular Rhythm Technology", correct: false },
            { label: "D", text: "Cardiac Response Treatment", correct: false }
        ],
        explanation: "CRT (Cardiac Resynchronization Therapy) uses biventricular pacing to coordinate the contraction of both ventricles, improving cardiac output in heart failure patients."
    },
    {
        question: "Which lead placement is used in a VVI pacemaker?",
        answers: [
            { label: "A", text: "Right atrium only", correct: false },
            { label: "B", text: "Right ventricle only", correct: true },
            { label: "C", text: "Both atrium and ventricle", correct: false },
            { label: "D", text: "Left ventricle only", correct: false }
        ],
        explanation: "VVI pacing uses a single lead placed in the right ventricle. It paces and senses the ventricle and inhibits pacing when intrinsic ventricular activity is detected."
    },
    {
        question: "What is the purpose of the AV delay in dual-chamber pacing?",
        answers: [
            { label: "A", text: "To increase heart rate", correct: false },
            { label: "B", text: "To allow atrial contraction before ventricular pacing", correct: true },
            { label: "C", text: "To prevent arrhythmias", correct: false },
            { label: "D", text: "To save battery life", correct: false }
        ],
        explanation: "The AV delay mimics the natural delay at the AV node, allowing time for atrial contraction (atrial kick) to fill the ventricles before ventricular pacing, optimizing cardiac output."
    },
    {
        question: "What does a pacing spike on an ECG indicate?",
        answers: [
            { label: "A", text: "Natural heart rhythm", correct: false },
            { label: "B", text: "Electrical output from the pacemaker", correct: true },
            { label: "C", text: "Battery depletion", correct: false },
            { label: "D", text: "Lead fracture", correct: false }
        ],
        explanation: "A pacing spike (or artifact) is a vertical line on the ECG that represents the electrical stimulus delivered by the pacemaker to the heart tissue."
    },
    {
        question: "What is the primary indication for an implantable loop recorder?",
        answers: [
            { label: "A", text: "Bradycardia pacing", correct: false },
            { label: "B", text: "Defibrillation therapy", correct: false },
            { label: "C", text: "Long-term rhythm monitoring for unexplained syncope", correct: true },
            { label: "D", text: "Cardiac resynchronization", correct: false }
        ],
        explanation: "Implantable loop recorders (ILRs) are primarily used for long-term continuous monitoring to diagnose the cause of unexplained syncope or detect arrhythmias like atrial fibrillation."
    }
];

// Quiz State
let currentAnswers = {};
let quizSubmitted = false;

// Initialize Quiz
function initQuiz() {
    const quizContainer = document.getElementById('quizQuestions');
    document.getElementById('totalQ').textContent = quizQuestions.length;
    document.getElementById('totalScore').textContent = quizQuestions.length;

    quizQuestions.forEach((q, index) => {
        const questionCard = document.createElement('div');
        questionCard.className = 'question-card';
        questionCard.id = `question-${index}`;

        questionCard.innerHTML = `
            <div class="question-number">Question ${index + 1}</div>
            <div class="question-text">${q.question}</div>
            <div class="answers-grid">
                ${q.answers.map((answer, aIndex) => `
                    <div class="answer-option" data-question="${index}" data-answer="${aIndex}">
                        <span class="answer-label">${answer.label}.</span>
                        <span class="answer-text">${answer.text}</span>
                        <span class="result-indicator"></span>
                    </div>
                `).join('')}
            </div>
            <div class="explanation" id="explanation-${index}">
                <div class="explanation-title">Why this answer:</div>
                <div class="explanation-text">${q.explanation}</div>
            </div>
        `;

        quizContainer.appendChild(questionCard);
    });

    // Add click handlers
    document.querySelectorAll('.answer-option').forEach(option => {
        option.addEventListener('click', handleAnswerClick);
    });

    // Show submit button after initialization
    document.getElementById('submitBtn').style.display = 'inline-block';
    document.getElementById('resetBtn').style.display = 'inline-block';
}

// Handle Answer Click
function handleAnswerClick(e) {
    const option = e.currentTarget;
    const questionIndex = parseInt(option.dataset.question);
    const answerIndex = parseInt(option.dataset.answer);

    // If already answered this question, ignore
    if (currentAnswers[questionIndex] !== undefined) return;

    const question = quizQuestions[questionIndex];
    const isCorrect = question.answers[answerIndex].correct;

    // Store answer
    currentAnswers[questionIndex] = answerIndex;

    // Disable all options for this question
    const options = document.querySelectorAll(`[data-question="${questionIndex}"]`);
    options.forEach((opt, aIndex) => {
        opt.classList.add('disabled');

        // Show correct answer
        if (question.answers[aIndex].correct) {
            opt.classList.add('correct');
            opt.querySelector('.result-indicator').textContent = '✓';
        }

        // Mark user's wrong answer
        if (aIndex === answerIndex && !isCorrect) {
            opt.classList.add('incorrect');
            opt.querySelector('.result-indicator').textContent = '✗';
        }
    });

    // Show explanation immediately
    document.getElementById(`explanation-${questionIndex}`).classList.add('show');

    // Mark question card
    const questionCard = document.getElementById(`question-${questionIndex}`);
    if (isCorrect) {
        questionCard.classList.add('answered-correct');
    } else {
        questionCard.classList.add('answered-incorrect');
    }

    // Update score
    const correctCount = Object.keys(currentAnswers).filter(i =>
        quizQuestions[i].answers[currentAnswers[i]].correct
    ).length;
    document.getElementById('score').textContent = correctCount;

    // Update progress
    updateProgress();

    // Check if quiz is complete
    if (Object.keys(currentAnswers).length === quizQuestions.length) {
        quizSubmitted = true;
        document.getElementById('submitBtn').style.display = 'none';
        const incorrect = quizQuestions.length - correctCount;
        showResults(correctCount, incorrect);
    }
}

// Update Progress
function updateProgress() {
    const answered = Object.keys(currentAnswers).length;
    const total = quizQuestions.length;
    const percentage = (answered / total) * 100;

    document.getElementById('currentQ').textContent = answered;
    document.getElementById('progressFill').style.width = percentage + '%';
}

// Submit Quiz
function submitQuiz() {
    if (Object.keys(currentAnswers).length < quizQuestions.length) {
        alert('Please answer all questions before submitting!');
        return;
    }

    quizSubmitted = true;
    let correct = 0;
    let incorrect = 0;

    quizQuestions.forEach((q, index) => {
        const questionCard = document.getElementById(`question-${index}`);
        const userAnswer = currentAnswers[index];
        const isCorrect = q.answers[userAnswer].correct;

        // Show explanation
        document.getElementById(`explanation-${index}`).classList.add('show');

        // Mark answers
        const options = document.querySelectorAll(`[data-question="${index}"]`);
        options.forEach((option, aIndex) => {
            option.classList.add('disabled');

            if (aIndex === userAnswer) {
                if (isCorrect) {
                    option.classList.add('correct');
                    option.querySelector('.result-indicator').textContent = '✓';
                    correct++;
                } else {
                    option.classList.add('incorrect');
                    option.querySelector('.result-indicator').textContent = '✗';
                    incorrect++;
                }
            }

            // Show correct answer
            if (q.answers[aIndex].correct) {
                option.classList.add('correct');
                if (aIndex !== userAnswer) {
                    option.querySelector('.result-indicator').textContent = '✓';
                }
            }
        });

        // Mark question card
        if (isCorrect) {
            questionCard.classList.add('answered-correct');
        } else {
            questionCard.classList.add('answered-incorrect');
        }
    });

    // Update score
    document.getElementById('score').textContent = correct;

    // Show results
    showResults(correct, incorrect);

    // Hide submit button
    document.getElementById('submitBtn').style.display = 'none';

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Show Results
function showResults(correct, incorrect) {
    const total = quizQuestions.length;
    const percentage = Math.round((correct / total) * 100);

    document.getElementById('finalScore').textContent = `${correct}/${total}`;
    document.getElementById('correctCount').textContent = correct;
    document.getElementById('incorrectCount').textContent = incorrect;
    document.getElementById('percentage').textContent = percentage + '%';

    let message = '';
    if (percentage >= 90) {
        message = 'Outstanding! You have excellent knowledge of cardiac devices!';
    } else if (percentage >= 70) {
        message = 'Great job! You have a solid understanding of cardiac devices.';
    } else if (percentage >= 50) {
        message = 'Good effort! Consider reviewing the material to strengthen your knowledge.';
    } else {
        message = 'Keep learning! Master these concepts with ';
    }

    document.getElementById('resultsMessage').innerHTML = percentage < 50
        ? message + '<a href="https://www.amazon.com/Basics-Cardiac-Devices-Visual-Pacemakers/dp/B0FDHV3DNF" target="_blank" style="color: #0d9488; text-decoration: underline; font-weight: 600;">Basics of Cardiac Devices: A Visual Guide</a>.'
        : message;
    document.getElementById('quizResults').classList.add('show');
}

// Reset Quiz
function resetQuiz() {
    if (confirm('Are you sure you want to restart the quiz? All progress will be lost.')) {
        location.reload();
    }
}

// Event Listeners
document.getElementById('submitBtn').addEventListener('click', submitQuiz);
document.getElementById('resetBtn').addEventListener('click', resetQuiz);

// Initialize on page load
initQuiz();
