let currentQuestion = 0;
let userAnswers = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    
    startBtn.addEventListener('click', startQuiz);
    restartBtn.addEventListener('click', restartQuiz);
});

function startQuiz() {
    gsap.to('#welcome-screen', {
        opacity: 0,
        duration: 0.5,
        onComplete: () => {
            document.getElementById('welcome-screen').classList.add('hidden');
            document.getElementById('question-container').classList.remove('hidden');
            showQuestion(0);
        }
    });
}

function showQuestion(index) {
    const question = questions[index];
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const progress = document.getElementById('progress');
    
    // Update progress bar with animation
    gsap.to(progress, {
        width: `${((index + 1) / questions.length) * 100}%`,
        duration: 0.5,
        ease: "power2.out"
    });
    
    // Animate question text
    gsap.fromTo(questionText, 
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.7, ease: "back.out" }
    );

    questionText.textContent = question.text;
    optionsContainer.innerHTML = '';

    // Adjust grid columns based on number of options
    optionsContainer.className = `grid gap-4 ${
        question.options.length > 4 
            ? 'grid-cols-1 md:grid-cols-3' 
            : 'grid-cols-1 md:grid-cols-2'
    }`;

    question.options.forEach((option, i) => {
        const button = document.createElement('button');
        button.className = 'option-button';
        button.textContent = option;
        
        // Enhanced stagger animation for options
        gsap.fromTo(button,
            { opacity: 0, x: -50, scale: 0.8 },
            { 
                opacity: 1, 
                x: 0, 
                scale: 1,
                duration: 0.5, 
                delay: i * 0.1,
                ease: "back.out(1.7)"
            }
        );

        button.addEventListener('click', () => handleAnswer(option));
        optionsContainer.appendChild(button);
    });
}

function handleAnswer(answer) {
    userAnswers.push(answer);
    
    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        showQuestion(currentQuestion);
    } else {
        showResults();
    }
}

function showResults() {
    document.getElementById('question-container').classList.add('hidden');
    const resultsScreen = document.getElementById('results-screen');
    resultsScreen.classList.remove('hidden');
    
    const giftsContainer = document.getElementById('gifts-container');
    const recommendedGifts = getRecommendedGifts();
    
    giftsContainer.innerHTML = '';
    
    recommendedGifts.forEach((gift, index) => {
        const giftCard = createGiftCard(gift);
        
        // Stagger animation for gift cards
        gsap.fromTo(giftCard,
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 0.5, delay: index * 0.2 }
        );
        
        giftsContainer.appendChild(giftCard);
    });
}

function createGiftCard(gift) {
    const card = document.createElement('div');
    card.className = 'gift-card';
    card.innerHTML = `
        <img src="${gift.image}" alt="${gift.name}" class="w-full h-48 object-cover rounded-lg mb-4">
        <h3 class="text-xl font-bold text-white mb-2">${gift.name}</h3>
        <p class="text-white/80 mb-2">${gift.description}</p>
        <p class="text-white font-bold">${gift.price}</p>
    `;
    return card;
}

function getRecommendedGifts() {
    // Implement gift matching logic based on userAnswers
    // This is a simplified version
    return gifts.slice(0, 6); // Return first 6 gifts for demo
}

function restartQuiz() {
    currentQuestion = 0;
    userAnswers = [];
    document.getElementById('results-screen').classList.add('hidden');
    document.getElementById('welcome-screen').classList.remove('hidden');
    gsap.to('#welcome-screen', { opacity: 1, duration: 0.5 });
}