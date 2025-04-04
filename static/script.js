const ANSWERS_LIST = document.querySelector('#answers');
const FINISH_BUTTON = document.querySelector('#finish-button');
const NEXT_QUESTION_BUTTON = document.querySelector('#next-button');
const PAGES = document.querySelectorAll('main');
const PLAY_AGAIN_BUTTON = document.querySelector('#again-button');
const QUESTION_ELEMENT = document.querySelector('#question');
const QUESTION_NUMBER = document.querySelector('#question-number');
const QUIZ_TITLES = document.querySelectorAll('.quiz-name');
const ROOT = document.querySelector(':root');
const SCORE_ELEMENT = document.querySelector('#score');
const SUBJECTS = document.querySelector('#subjects');
const SUBMIT_ANSWER_BUTTON = document.querySelector('#answer-button');
const THEME_SWITCH = document.querySelector('#theme-switch');
const TOTAL_QUESTIONS_ELEMENTS = document.querySelectorAll('.total-questions');
const UNANSWERED_ERROR = document.querySelector('#unanswered-error');

let quizData = null;


document.addEventListener('DOMContentLoaded', () => {
    handleThemePreference();
    initialize();
});


function celebrate(n=1) {
    let count = 0;
    let interval = setInterval(() => {
        randomConfetti(10, 90, 10, 50);
        count++;
        if (count === n) {
            clearInterval(interval);
        }
    }, 500);
}


function handleThemePreference() {
    let darkColorSchemePreference = window.matchMedia('(prefers-color-scheme: dark)');
    
    darkColorSchemePreference.matches ? THEME_SWITCH.checked = true : THEME_SWITCH.checked = false;
    darkColorSchemePreference.addEventListener('change',  ({matches})  => {
        if (matches) {
            THEME_SWITCH.checked = true;
        } else {
            THEME_SWITCH.checked = false;
        }
    });
}


function initialize() {
    fetch('data.json').then(response => {
        if (!response.ok) {
            throw new Error(response.status);
        }
        return response.json();
    }).then(data => {
        quizData = data.quizzes
        populateHomePage(quizData);
    }).catch(error => {
        console.error(error);
    });
}


function playQuiz(quizObject) {
    updateProgressBar(0, 1);
    togglePage('quiz');
    toggleSubmitButton('answer-button');

    const QUESTIONS = quizObject.questions;
    let questionNumber = 0;
    let score = 0
    let possibleScore = QUESTIONS.length;

    QUIZ_TITLES.forEach(element => {
        element.textContent = quizObject.title;
        element.classList
        element.classList.add(quizObject.title.toLowerCase());
    });
    TOTAL_QUESTIONS_ELEMENTS.forEach(element => element.textContent = possibleScore);
    QUESTION_NUMBER.textContent = questionNumber + 1;

    populateQuestionPage(QUESTIONS[questionNumber]);
    SUBMIT_ANSWER_BUTTON.addEventListener('click', submitAnswerHandler);
    NEXT_QUESTION_BUTTON.addEventListener('click', nextQuestionHandler);
    FINISH_BUTTON.addEventListener('click', finishQuizHandler);
    PLAY_AGAIN_BUTTON.addEventListener('click', () => {
        SUBMIT_ANSWER_BUTTON.removeEventListener('click', submitAnswerHandler);
        NEXT_QUESTION_BUTTON.removeEventListener('click', nextQuestionHandler);
        FINISH_BUTTON.removeEventListener('click', finishQuizHandler);
        populateHomePage(quizData);
    });


    /* Event handlers functions */
    function nextQuestionHandler() {
        populateQuestionPage(QUESTIONS[questionNumber]);
        QUESTION_NUMBER.textContent = questionNumber + 1;
        toggleSubmitButton('answer-button');
    }
    function submitAnswerHandler() {
        let newQuizState = submitAnswer(QUESTIONS[questionNumber].answer, questionNumber, score, possibleScore);
        questionNumber = newQuizState.questionNumber;
        score = newQuizState.score;
        updateProgressBar(questionNumber, possibleScore);
    }
    function finishQuizHandler() {
        togglePage('completed');
        SCORE_ELEMENT.textContent = score;
        if (score === possibleScore) celebrate(6);
    }
}


function populateAnswers(options) {
    ANSWERS_LIST.replaceChildren();
    ANSWERS_LIST.classList.remove('answered');

    for (let option of options) {
        let answerContainer = document.createElement('li');
        let answer = document.createElement('button');
        
        answer.textContent = option;
        answer.classList.add('answer', 'option');
        answer.addEventListener('click', () => selectAnswer(answer));

        answerContainer.appendChild(answer);
        ANSWERS_LIST.appendChild(answerContainer);
    }
}


function populateHomePage(quizList) {
    togglePage('start');
    SUBJECTS.replaceChildren();
    QUIZ_TITLES.forEach(quizTitle => quizTitle.replaceChildren());


    for (let quiz of quizList) {
        QUIZ_TITLES.forEach(quizTitle => quizTitle.classList.remove(quiz.title.toLowerCase()));

        let subjectContainer = document.createElement('li');
        let subject = document.createElement('button');

        subject.textContent = quiz.title;
        subject.classList.add('subject', 'option', quiz.title.toLowerCase());

        subject.addEventListener('click', () => playQuiz(quiz));

        subjectContainer.appendChild(subject);
        SUBJECTS.appendChild(subjectContainer);
    }
}


function populateQuestionPage(questionObject) {
    QUESTION_ELEMENT.textContent = questionObject.question;
    populateAnswers(shuffleArrayCopy(questionObject.options));
}


function randomConfetti(xMin, xMax, yMin, yMax) {
    shootConfetti(Math.random() * (xMax - xMin) + xMin, Math.random() * (yMax - yMin) + yMin);
}


function shuffleArrayCopy(arr) {
    let arrCopy = arr.slice();
    let newArr = [];
    while (arrCopy.length > 0) {
        newArr.push(arrCopy.splice(Math.floor(Math.random() * arrCopy.length), 1)[0]);
    }
    return newArr;
}


function selectAnswer(answer) {
    toggleUnansweredError(false);
    if (!ANSWERS_LIST.classList.contains('answered')) {
        let previousSelectedAnswer = ANSWERS_LIST.querySelector('.selected');
        if (previousSelectedAnswer) previousSelectedAnswer.classList.remove('selected');
        answer.classList.add('selected');
    }
}

function shootConfetti(x=50, y=50) {
    const OPTIONS = {
        angle: 270,
        count: 50,
        position: {
          x: x,
          y: y,
        },
        spread: 360,
        startVelocity: 30,
        decay: 0.9,
        gravity: 1,
        drift: 0,
        ticks: 200,
        colors: ["#fae650", "#e6eff0"],
        shapes: ["square", "circle"],
        scalar: 1,
        zIndex: 100,
        disableForReducedMotion: true,
    };

    (async () => {
        await confetti('tsParticles', OPTIONS);
    })();
}


function submitAnswer(correctAnswer, questionNumber, score, possibleScore) {
    const SELECTED_ANSWER = document.querySelector('.selected');
    
    if (!SELECTED_ANSWER) {
        toggleUnansweredError(true);
    } else {
        questionNumber++;
        questionNumber === possibleScore ? toggleSubmitButton('finish-button') : toggleSubmitButton('next-button');
        ANSWERS_LIST.classList.add('answered');

        if (SELECTED_ANSWER.textContent === correctAnswer) {
            score++;
            SELECTED_ANSWER.classList.add('correct');
        } else {
            SELECTED_ANSWER.classList.add('incorrect');
            Array.from(ANSWERS_LIST.querySelectorAll('.answer')).filter(
                answer => answer.textContent === correctAnswer
            )[0].classList.add('correct');
        }
    }

    return {questionNumber, score};
}


function togglePage(pageId) {
    for (let page of PAGES) {
        page.id === pageId ? page.removeAttribute('hidden') : page.setAttribute('hidden', '');
    }
}


function toggleSubmitButton(buttonId) {
    if (buttonId === 'answer-button') {
        SUBMIT_ANSWER_BUTTON.removeAttribute('hidden');
        NEXT_QUESTION_BUTTON.setAttribute('hidden', '');
        FINISH_BUTTON.setAttribute('hidden', '');
    } else if (buttonId === 'next-button') {
        SUBMIT_ANSWER_BUTTON.setAttribute('hidden', '');
        NEXT_QUESTION_BUTTON.removeAttribute('hidden');
        FINISH_BUTTON.setAttribute('hidden', '');
    } else {
        SUBMIT_ANSWER_BUTTON.setAttribute('hidden', '');
        NEXT_QUESTION_BUTTON.setAttribute('hidden', '');
        FINISH_BUTTON.removeAttribute('hidden');
    }
}


function toggleUnansweredError(toggle) {
    toggle ? UNANSWERED_ERROR.removeAttribute('hidden') : UNANSWERED_ERROR.setAttribute('hidden', '');
}


function updateProgressBar(current, total) {
    let progress = current / total;
    ROOT.style.setProperty('--progress', `${progress * 100}%`)
}
