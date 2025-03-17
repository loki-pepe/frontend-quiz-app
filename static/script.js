document.addEventListener('DOMContentLoaded', () => {

    const ANSWERS_CONTAINER = document.querySelector('#answers');
    const NEXT_QUESTION_BUTTON = document.querySelector('#next-button');
    const PAGES = document.querySelectorAll('main');
    const PLAY_AGAIN_BUTTON = document.querySelector('#again-button');
    const QUESTION_ELEMENT = document.querySelector('#question');
    const QUESTION_NUMBER = document.querySelector('#question-number');
    const QUIZ_TITLES = document.querySelectorAll('.quiz-name');
    const SCORE_ELEMENT = document.querySelector('#score');
    const SUBJECTS = document.querySelector('#subjects');
    const SUBMIT_ANSWER_BUTTON = document.querySelector('#answer-button');
    const TOTAL_QUESTIONS_ELEMENTS = document.querySelectorAll('.total-questions');

    initialize();


    function handleAnswerSubmit(correctAnswer, score) {
        SUBMIT_ANSWER_BUTTON.setAttribute('hidden', '');
        NEXT_QUESTION_BUTTON.removeAttribute('hidden');

        const SELECTED_ANSWER = document.querySelector('.selected');
        if (SELECTED_ANSWER.textContent === correctAnswer) score++

        return score;
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
        let currentQuestion = 0;
        let score = 0
        let possibleScore = QUESTIONS.length;

        QUIZ_TITLES.forEach(element => element.textContent = quizObject.title);
        TOTAL_QUESTIONS_ELEMENTS.forEach(element => element.textContent = possibleScore);
        QUESTION_NUMBER.textContent = currentQuestion + 1;

        populateQuestionPage(QUESTIONS[currentQuestion]);
        SUBMIT_ANSWER_BUTTON.addEventListener('click', () => {
            score = handleAnswerSubmit(QUESTIONS[currentQuestion].answer, score);
            currentQuestion++;
            console.log(score, 'out of', currentQuestion);
        });
        NEXT_QUESTION_BUTTON.addEventListener('click', () => {
            NEXT_QUESTION_BUTTON.setAttribute('hidden', '');
            SUBMIT_ANSWER_BUTTON.removeAttribute('hidden');

            if (currentQuestion === possibleScore) {
                togglePage('completed');
                SCORE_ELEMENT.textContent = score;
            } else {
                if (currentQuestion === possibleScore - 1) NEXT_QUESTION_BUTTON.textContent = 'Finish quiz';
                populateQuestionPage(QUESTIONS[currentQuestion]);
                QUESTION_NUMBER.textContent = currentQuestion + 1;
            }
        })
        PLAY_AGAIN_BUTTON.addEventListener('click', () => {
            window.location.reload();
        });
    }


    function populateAnswers(options) {
        ANSWERS_CONTAINER.replaceChildren();

        for (let option of options) {
            let answerContainer = document.createElement('li');
            let answer = document.createElement('button');
            
            answer.textContent = option;
            answer.classList.add('answer');

            answerContainer.appendChild(answer);
            ANSWERS_CONTAINER.appendChild(answerContainer);
        }

        let answers = ANSWERS_CONTAINER.querySelectorAll('.answer');
        answers.forEach(answer => {
            answer.addEventListener('click', () => selectAnswer(answer, answers));
        })
    }

    function populateHomePage(quizList) {
        togglePage('start');
        SUBJECTS.replaceChildren();
        QUIZ_TITLES[0].replaceChildren();

        for (let quiz of quizList) {
            let subjectContainer = document.createElement('li');
            let subject = document.createElement('button');
            let subjectImage = document.createElement('img');

            subjectImage.src = quiz.icon;
            
            subject.textContent = quiz.title;
            subject.prepend(subjectImage);
            subject.id = quiz.title;

            subject.addEventListener('click', () => playQuiz(quiz));

            subjectContainer.appendChild(subject);
            SUBJECTS.appendChild(subjectContainer);
        }
    }

    function populateQuestionPage(questionObject) {
        QUESTION_ELEMENT.textContent = questionObject.question;
        populateAnswers(questionObject.options);
    }

    function selectAnswer(answer, answers) {
        for (let ans of answers) {
            ans === answer ? ans.classList.add('selected') : ans.classList.remove('selected');
        }
    }

    function togglePage(pageId) {
        for (let page of PAGES) {
            page.id === pageId ? page.removeAttribute('hidden') : page.setAttribute('hidden', '');
        }
    }
});