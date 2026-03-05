// IBHRE CCDS Certification Quiz Questions
const quizQuestions = [
    {
        question: "A 72-year-old patient with a dual-chamber pacemaker presents with symptoms of pacemaker syndrome. Which programming adjustment would be MOST appropriate?",
        answers: [
            { label: "A", text: "Increase the AV delay to restore AV synchrony", correct: false },
            { label: "B", text: "Decrease the lower rate limit to reduce pacing burden", correct: false },
            { label: "C", text: "Program to a physiologic mode (DDD) and optimize AV delay", correct: true },
            { label: "D", text: "Change to VVI mode to eliminate atrial pacing", correct: false }
        ],
        explanation: "Pacemaker syndrome results from loss of AV synchrony and ventricular pacing without appropriate atrial contribution. Programming to a physiologic dual-chamber mode (DDD or similar) with proper AV delay optimization restores normal hemodynamics and eliminates symptoms. While increasing AV delay might help, the fundamental issue is the pacing mode itself."
    },
    {
        question: "Compared to traditional RV apical pacing, His bundle pacing offers which PRIMARY physiologic advantage?",
        answers: [
            { label: "A", text: "Lower capture thresholds and better battery longevity", correct: false },
            { label: "B", text: "Easier implantation procedure with shorter learning curve", correct: false },
            { label: "C", text: "Preserves native ventricular activation via the His-Purkinje system", correct: true },
            { label: "D", text: "Lower risk of lead dislodgement", correct: false }
        ],
        explanation: "His bundle pacing directly stimulates the conduction system, producing narrow QRS and synchronized ventricular activation mimicking normal physiology. This avoids the dyssynchrony associated with apical pacing. While His pacing does have challenges (higher thresholds, technical difficulty, potential loss of capture over time requiring backup RV lead), the PRIMARY advantage is preservation of physiologic activation. Traditional RV apical pacing activates the ventricles non-physiologically, potentially leading to pacing-induced cardiomyopathy, whereas His-bundle pacing maintains the normal His-Purkinje activation sequence."
    },
    {
        question: "A patient with an ICD experienced syncope during a witnessed VF episode. The stored EGM shows the device detected the arrhythmia after 8 seconds. The patient remained unconscious during this detection delay. Which programming change should be reviewed?",
        answers: [
            { label: "A", text: "Reduce the detection interval (set faster VF zone threshold)", correct: true },
            { label: "B", text: "Increase battery voltage output", correct: false },
            { label: "C", text: "Increase the atrial pacing rate", correct: false },
            { label: "D", text: "Increase the sensing threshold", correct: false }
        ],
        explanation: "A shorter detection interval (faster rate cutoff for VF zone) will allow the device to recognize VF more quickly and initiate therapy sooner. This reduces the delay between arrhythmia onset and treatment delivery, which is critical for maintaining cerebral perfusion and preventing syncope. Reviewing the EGM and detection times helps determine if the VF detection criteria should be tightened. Battery output and atrial pacing are not relevant to improving VF detection speed."
    },
    {
        question: "A patient with a CRT-D (Cardiac Resynchronization Therapy Defibrillator) has baseline QRS duration of 180ms and is receiving biventricular pacing 98% of the time. At 3-month follow-up, their ejection fraction has not improved. What is the MOST appropriate next step?",
        answers: [
            { label: "A", text: "Accept the device as non-responsive and discontinue optimization", correct: false },
            { label: "B", text: "Perform AV and VV delay optimization to improve hemodynamics", correct: true },
            { label: "C", text: "Immediately schedule for lead explantation", correct: false },
            { label: "D", text: "Increase the shock output to improve defibrillation threshold", correct: false }
        ],
        explanation: "Patients not responding to CRT require systematic optimization including AV delay (to optimize atrial contribution) and VV delay (to optimize the timing between RV and LV pacing). Proper optimization can significantly improve outcomes in initially non-responsive patients. Most expert consensus recommends optimization attempts before considering device failure. Lead explantation and output changes are not first-line interventions."
    },
    {
        question: "During a pacemaker follow-up, you observe failure to capture on the ventricular lead despite adequate output and normal threshold test results. The patient is asymptomatic. What is the MOST likely explanation?",
        answers: [
            { label: "A", text: "The lead is in a refractory period and will resume capturing", correct: false },
            { label: "B", text: "Undersensing of the intrinsic rhythm is occurring", correct: true },
            { label: "C", text: "Battery depletion is imminent", correct: false },
            { label: "D", text: "The patient is experiencing electromagnetic interference", correct: false }
        ],
        explanation: "Failure to capture with adequate output despite normal thresholds and an asymptomatic patient suggests undersensing. If the pacemaker fails to sense the intrinsic rhythm, it will attempt to pace into the refractory period and fail to capture. Pacing into the refractory period will most likely not capture and cause depolarization (unless strong enough and hits a T wave, which could trigger an arrhythmia). Adjusting the sensitivity to make the device more responsive to intrinsic activity would resolve this. Battery depletion would present differently, and EMI is less likely in a clinical setting."
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
        message = 'Excellent performance! You demonstrate advanced knowledge of IBHRE CCDS concepts.';
    } else if (percentage >= 80) {
        message = 'Great job! You have a strong understanding of cardiac device specialist principles.';
    } else if (percentage >= 60) {
        message = 'Good effort! Review the explanations and consider studying the detailed guide for deeper mastery.';
    } else {
        message = 'Keep learning! Download the free IBHRE CCDS study guide and review ';
    }

    document.getElementById('resultsMessage').innerHTML = percentage < 60
        ? message + '<a href="IBHRE-CCDS-Guide.pdf" style="color: #0d9488; text-decoration: underline; font-weight: 600;">the free CCDS study guide</a> to strengthen your preparation.'
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
