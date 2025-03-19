const ANSWERS_LIST = document.querySelector('#answers');
const NEXT_QUESTION_BUTTON = document.querySelector('#next-button');
const PAGES = document.querySelectorAll('main');
const PLAY_AGAIN_BUTTON = document.querySelector('#again-button');
const QUESTION_ELEMENT = document.querySelector('#question');
const QUESTION_NUMBER = document.querySelector('#question-number');
const QUIZ_TITLES = document.querySelectorAll('.quiz-name');
const SCORE_ELEMENT = document.querySelector('#score');
const SUBJECTS = document.querySelector('#subjects');
const SUBMIT_ANSWER_BUTTON = document.querySelector('#answer-button');
const THEME_SWITCH = document.querySelector('#theme-switch');
const TOTAL_QUESTIONS_ELEMENTS = document.querySelectorAll('.total-questions');
const UNANSWERED_ERROR = document.querySelector('#unanswered-error');


document.addEventListener('DOMContentLoaded', () => {
    handleThemePreference();
    initialize();
});


function handleAnswerSubmit(correctAnswer, questionNumber, score) {
    const SELECTED_ANSWER = document.querySelector('.selected');
    
    if (!SELECTED_ANSWER) {
        toggleUnansweredError(true);
    } else {
        questionNumber++;
        toggleSubmitButton('next-button');
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


function handleNextQuestion(question, questionNumber, score, possibleScore) {
    toggleSubmitButton('answer-button');

    if (questionNumber === possibleScore) {
        togglePage('completed');
        SCORE_ELEMENT.textContent = score;
    } else {
        if (questionNumber === possibleScore - 1) NEXT_QUESTION_BUTTON.textContent = 'Finish quiz';
        populateQuestionPage(question);
        QUESTION_NUMBER.textContent = questionNumber + 1;
    }
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
        populateHomePage(data.quizzes);
    }).catch(error => {
        console.error(error);
    });
}


function playQuiz(quizObject) {
    togglePage('quiz');

    const QUESTIONS = quizObject.questions;
    let questionNumber = 0;
    let score = 0
    let possibleScore = QUESTIONS.length;

    QUIZ_TITLES.forEach(element => {
        element.textContent = quizObject.title;
        element.classList.add('subject', quizObject.title.toLowerCase());
    });
    TOTAL_QUESTIONS_ELEMENTS.forEach(element => element.textContent = possibleScore);
    QUESTION_NUMBER.textContent = questionNumber + 1;

    populateQuestionPage(QUESTIONS[questionNumber]);
    SUBMIT_ANSWER_BUTTON.addEventListener('click', () => {
        let newQuizState = handleAnswerSubmit(QUESTIONS[questionNumber].answer, questionNumber, score);
        questionNumber = newQuizState.questionNumber;
        score = newQuizState.score;
    });
    NEXT_QUESTION_BUTTON.addEventListener('click', () => handleNextQuestion(
        QUESTIONS[questionNumber], questionNumber, score, possibleScore
    ));
    PLAY_AGAIN_BUTTON.addEventListener('click', () => window.location.reload());
}


function populateAnswers(options) {
    ANSWERS_LIST.replaceChildren();
    ANSWERS_LIST.classList.remove('answered');

    for (let option of options) {
        let answerContainer = document.createElement('li');
        let answer = document.createElement('button');
        
        answer.textContent = option;
        answer.classList.add('answer');
        answer.addEventListener('click', () => selectAnswer(answer));

        answerContainer.appendChild(answer);
        ANSWERS_LIST.appendChild(answerContainer);
    }
}


function populateHomePage(quizList) {
    togglePage('start');
    SUBJECTS.replaceChildren();
    QUIZ_TITLES[0].replaceChildren();

    for (let quiz of quizList) {
        let subjectContainer = document.createElement('li');
        let subject = document.createElement('button');

        subject.textContent = quiz.title;
        subject.classList.add('subject', quiz.title.toLowerCase());

        subject.addEventListener('click', () => playQuiz(quiz));

        subjectContainer.appendChild(subject);
        SUBJECTS.appendChild(subjectContainer);
    }
}


function populateQuestionPage(questionObject) {
    QUESTION_ELEMENT.textContent = questionObject.question;
    populateAnswers(questionObject.options);
}


function selectAnswer(answer) {
    toggleUnansweredError(false);
    if (!ANSWERS_LIST.classList.contains('answered')) {
        let previousSelectedAnswer = ANSWERS_LIST.querySelector('.selected');
        if (previousSelectedAnswer) previousSelectedAnswer.classList.remove('selected');
        answer.classList.add('selected');
    }
}


function togglePage(pageId) {
    for (let page of PAGES) {
        page.id === pageId ? page.removeAttribute('hidden') : page.setAttribute('hidden', '');
    }
}


function toggleSubmitButton(buttonId) {
    if (buttonId === 'next-button') {
        SUBMIT_ANSWER_BUTTON.setAttribute('hidden', '');
        NEXT_QUESTION_BUTTON.removeAttribute('hidden');
    } else {
        NEXT_QUESTION_BUTTON.setAttribute('hidden', '');
        SUBMIT_ANSWER_BUTTON.removeAttribute('hidden');
    }
}


function toggleUnansweredError(toggle) {
    toggle ? UNANSWERED_ERROR.removeAttribute('hidden') : UNANSWERED_ERROR.setAttribute('hidden', '');
}
