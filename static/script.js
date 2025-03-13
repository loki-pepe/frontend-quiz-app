document.addEventListener('DOMContentLoaded', () => {

    const SUBJECTS = document.querySelector('#subjects');

    fetch('data.json').then(response => {
        if (!response.ok) {
            throw new Error(response.status);
        }
        return response.json();
    }).then(data => {
        for (let quiz of data.quizzes) {
            let subjectContainer = document.createElement('li');
            let subject = document.createElement('button');
            let subjectImage = document.createElement('img');

            subjectImage.src = quiz.icon;
            
            subject.textContent = quiz.title;
            subject.prepend(subjectImage);
            subject.id = quiz.title;

            subjectContainer.appendChild(subject);
            SUBJECTS.appendChild(subjectContainer);
        }
    }).catch(error => {
        console.error(error);
    });
});