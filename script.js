import {
    quizModes,
    budgetRanges,
    occasionCategories,
    tools,
    GiftRegistry,
    EventCountdown,
    GiftCalculator
} from './modes.js';

// Initialize the tools
const registry = new GiftRegistry();
const countdown = new EventCountdown();
const calculator = new GiftCalculator();

let currentMode = null;
let currentQuestion = 0;
let userAnswers = [];

// Add this near the top of the file with other constants
const bgColors = [
    'from-pink-500 to-rose-500',
    'from-purple-500 to-indigo-500',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-orange-500 to-amber-500',
    'from-violet-500 to-fuchsia-500'
];

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('start-btn');
    const restartBtn = document.getElementById('restart-btn');
    const showResultsBtn = document.getElementById('show-results-btn');
    
    startBtn.addEventListener('click', startQuiz);
    restartBtn.addEventListener('click', restartQuiz);
    showResultsBtn.addEventListener('click', async () => {
        const confirmationScreen = document.getElementById('confirmation-screen');
        
        // Fade out confirmation screen
        await gsap.to(confirmationScreen, {
            opacity: 0,
            duration: 0.3
        });
        confirmationScreen.classList.add('hidden');
        
        // Show results
        await showResults();
    });

    // Quiz mode buttons
    document.querySelector('.quick-quiz-btn').addEventListener('click', () => startQuizMode('quick'));
    document.querySelector('.detailed-quiz-btn').addEventListener('click', () => startQuizMode('detailed'));
    document.querySelector('.expert-quiz-btn').addEventListener('click', () => startQuizMode('expert'));

    // Alternative paths
    document.querySelector('.budget-path-btn').addEventListener('click', showBudgetExplorer);
    document.querySelector('.occasion-path-btn').addEventListener('click', showOccasionFinder);

    // Tools
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const toolName = e.target.textContent.split(' ')[0].toLowerCase();
            showTool(toolName);
        });
    });
});

function startQuizMode(mode) {
    currentMode = mode;
    const questionCount = quizModes[mode].questionCount;
    
    // Get new set of questions based on mode
    questions.length = 0;
    questions.push(...getRandomQuestions(questionCount));
    
    startQuiz();
}

function startQuiz() {
    // Reset progress bar to 0% before starting
    const progress = document.getElementById('progress');
    gsap.set(progress, { width: '0%' });
    
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
    
    // Animate question text
    gsap.fromTo(questionText, 
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.7, ease: "back.out" }
    );

    questionText.textContent = question.text;
    optionsContainer.innerHTML = '';

    // Adjust grid for better mobile display
    optionsContainer.className = `grid gap-4 ${
        question.options.length > 4 
            ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1 sm:grid-cols-2'
    }`;

    question.options.forEach((option, i) => {
        const button = document.createElement('button');
        button.className = `
            option-button group relative overflow-hidden
            bg-white/10 backdrop-blur-sm rounded-xl
            hover:bg-gradient-to-br hover:from-purple-500/50 hover:to-pink-500/50
            transform hover:scale-105 transition-all duration-300
            border border-white/20 hover:border-white/40
            bg-opacity-10 backdrop-filter
            w-full
        `;
        
        button.innerHTML = `
            <div class="flex items-center p-4 space-x-4 relative z-10">
                <div class="bg-black/10 p-3 rounded-full group-hover:bg-white/20 transition-colors duration-300 flex-shrink-0">
                    <span class="text-2xl filter drop-shadow-lg">${option.icon}</span>
                </div>
                <span class="text-lg font-medium text-white text-opacity-90 group-hover:text-white transition-colors duration-300 break-words">
                    ${option.text}
                </span>
            </div>
            <div class="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300"></div>
            <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                        bg-gradient-to-r from-white/5 via-white/10 to-transparent
                        transform -skew-x-12"></div>
        `;
        
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

        button.addEventListener('click', () => handleAnswer(option.text));
        optionsContainer.appendChild(button);
    });
}

async function handleAnswer(answer) {
    userAnswers.push(answer);
    
    if (currentQuestion < questions.length - 1) {
        // Update progress bar immediately
        const progress = document.getElementById('progress');
        gsap.to(progress, {
            width: `${((currentQuestion + 2) / questions.length) * 100}%`,
            duration: 0.3,
            ease: "power1.out"
        });
        
        // Fade out current question
        const questionContainer = document.getElementById('question-container');
        await gsap.to(questionContainer, {
            opacity: 0,
            duration: 0.2
        });
        
        // Update question
        currentQuestion++;
        showQuestion(currentQuestion);
        
        // Fade in new question
        gsap.to(questionContainer, {
            opacity: 1,
            duration: 0.2
        });
    } else {
        // Show confirmation screen instead of results
        const questionContainer = document.getElementById('question-container');
        const confirmationScreen = document.getElementById('confirmation-screen');
        
        // Fade out question container
        await gsap.to(questionContainer, {
            opacity: 0,
            duration: 0.3
        });
        questionContainer.classList.add('hidden');
        
        // Show and animate confirmation screen
        confirmationScreen.classList.remove('hidden');
        gsap.fromTo(confirmationScreen, 
            { opacity: 0, scale: 0.9 },
            { 
                opacity: 1, 
                scale: 1, 
                duration: 0.5,
                ease: "back.out(1.7)"
            }
        );
    }
}

async function showResults() {
    document.getElementById('question-container').classList.add('hidden');
    const resultsScreen = document.getElementById('results-screen');
    resultsScreen.classList.remove('hidden');
    
    // Hide title and restart button during loading
    document.querySelector('#results-screen h2').classList.add('hidden');
    document.getElementById('restart-btn').classList.add('hidden');
    
    const giftsContainer = document.getElementById('gifts-container');
    giftsContainer.innerHTML = `
        <div class="col-span-full flex flex-col items-center justify-center py-12">
            <div class="relative">
                <!-- Outer spinning ring -->
                <div class="absolute inset-0 animate-spin">
                    <div class="h-24 w-24 rounded-full border-4 border-transparent border-t-white/30 border-l-white/30"></div>
                </div>
                <!-- Inner spinning ring -->
                <div class="absolute inset-0 animate-spin" style="animation-duration: 1.5s;">
                    <div class="h-16 w-16 mx-auto my-4 rounded-full border-4 border-transparent border-t-white/60 border-l-white/60"></div>
                </div>
                <!-- Center gift icon -->
                <div class="absolute inset-0 flex items-center justify-center">
                    <span class="text-3xl animate-bounce">🎁</span>
                </div>
            </div>
            <div class="mt-8 space-y-2 text-center">
                <p class="text-white text-xl font-semibold">Finding your perfect gifts</p>
                <p class="text-white/70">Analyzing your preferences...</p>
            </div>
        </div>
    `;
    
    const recommendedGifts = await getRecommendedGifts();
    
    // Show title and restart button after loading
    document.querySelector('#results-screen h2').classList.remove('hidden');
    document.getElementById('restart-btn').classList.remove('hidden');
    
    giftsContainer.innerHTML = '';
    
    recommendedGifts.forEach((gift, index) => {
        const giftCard = createGiftCard(gift, index);
        
        gsap.fromTo(giftCard,
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 0.5, delay: index * 0.2 }
        );
        
        giftsContainer.appendChild(giftCard);
    });
}

function getGiftIcon(category) {
    // Map gift categories to appropriate icons
    const categoryIcons = {
        tech: '💻',
        gaming: '🎮',
        creative: '🎨',
        music: '🎵',
        books: '📚',
        experience: '🎭',
        wellness: '🧘',
        fitness: '💪',
        fashion: '👔',
        home: '🏡',
        cooking: '👨‍🍳',
        travel: '✈️',
        sports: '⚽',
        education: '🎓',
        photography: '📸',
        outdoor: '🏕️',
        beauty: '💄',
        jewelry: '💎',
        entertainment: '🎬',
        gadgets: '🔧',
        subscription: '📱',
        handmade: '🎨',
        luxury: '✨',
        eco: '🌱',
        default: '🎁'
    };

    return categoryIcons[category.toLowerCase()] || categoryIcons.default;
}

function createGiftCard(gift, index) {
    const card = document.createElement('div');
    card.className = 'gift-card';
    
    const icon = getGiftIcon(gift.category);
    const bgColor = bgColors[index % bgColors.length];
    
    card.innerHTML = `
        <div class="flex items-center mb-4">
            <div class="bg-gradient-to-br ${bgColor} p-4 rounded-full mr-4
                        shadow-lg hover:scale-110 transition-transform duration-300
                        border border-white/20">
                <span class="text-4xl filter drop-shadow-lg">${icon}</span>
            </div>
            <h3 class="text-2xl font-bold text-white">${gift.name}</h3>
        </div>
        <p class="text-white/80 mb-2">${gift.description}</p>
        <p class="text-white/90 mb-2 italic">${gift.reasoning}</p>
        <div class="flex items-center mt-4">
            <span class="bg-white/20 px-4 py-2 rounded-full text-white font-bold">${gift.price}</span>
        </div>
    `;
    return card;
}

async function getRecommendedGifts() {
    const prompt = generatePromptFromAnswers();
    
    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer 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'
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                response_format: { type: "json_object" },
                messages: [
                    {
                        role: "system",
                        content: `You are a gift recommendation expert. Based on the user's answers, suggest 6 unique and personalized gift ideas. 
                        
                        Guidelines for recommendations:
                        - Keep descriptions concise and focused on features and benefits
                        - Do not mention emojis or icons in any text
                        - Focus reasoning on how the gift matches their personality and preferences
                        - Keep price ranges realistic and specific
                        - Each gift should be distinctly different from the others
                        - Include a primary category for each gift (e.g., "tech", "creative", "experience", "wellness", etc.)
                        
                        Example of good response:
                        {
                            "name": "High-End Drawing Tablet",
                            "category": "creative",
                            "description": "Professional-grade digital drawing tablet with pressure sensitivity and wireless capability",
                            "priceRange": "$200-$300",
                            "reasoning": "Perfect for someone who loves digital art and values professional creative tools"
                        }
                        
                        Respond in JSON format with an array of 6 gift objects.`
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            })
        });

        const data = await response.json();
        const recommendations = JSON.parse(data.choices[0].message.content);
        return transformRecommendations(recommendations.gifts);
    } catch (error) {
        console.error('Error getting gift recommendations:', error);
        return getFallbackGifts();
    }
}

function generatePromptFromAnswers() {
    const answerSummary = questions.map((q, i) => 
        `For "${q.text}", they chose: "${userAnswers[i]}"`
    ).join('\n');

    return `Based on these answers, suggest 6 personalized gift ideas:
    ${answerSummary}
    
    Please provide recommendations in this JSON format:
    {
        "gifts": [
            {
                "name": "Gift Name",
                "category": "Primary category",
                "description": "Brief, feature-focused description without mentioning icons",
                "priceRange": "Specific price range in USD",
                "reasoning": "Clear explanation of why this matches their preferences, without referencing icons"
            }
        ]
    }`;
}

function transformRecommendations(recommendations) {
    return recommendations.map(rec => ({
        id: Math.random().toString(36).substr(2, 9),
        name: rec.name,
        description: rec.description,
        price: rec.priceRange,
        reasoning: rec.reasoning,
        category: rec.category
    }));
}

function getFallbackGifts() {
    return [
        {
            id: 1,
            name: "Smart Home Starter Kit",
            description: "Voice-controlled smart speaker with smart bulbs and plugs",
            price: "$150-$200",
            reasoning: "Perfect for someone interested in modern home automation",
            category: "tech"
        },
        {
            id: 2,
            name: "Professional Art Set",
            description: "High-quality art supplies in a wooden case",
            price: "$80-$120",
            reasoning: "Ideal for creative expression and artistic development",
            category: "creative"
        },
        {
            id: 3,
            name: "Adventure Experience Day",
            description: "Choice of outdoor activities like rock climbing or kayaking",
            price: "$100-$200",
            reasoning: "Great for thrill-seekers and adventure enthusiasts",
            category: "experience"
        },
        {
            id: 4,
            name: "Premium Wellness Package",
            description: "Annual meditation app subscription with massage voucher",
            price: "$120-$180",
            reasoning: "Perfect for relaxation and mental wellbeing",
            category: "wellness"
        },
        {
            id: 5,
            name: "Gaming Console Bundle",
            description: "Latest gaming console with two controllers and popular games",
            price: "$400-$500",
            reasoning: "Ideal for gaming enthusiasts and social players",
            category: "gaming"
        },
        {
            id: 6,
            name: "Gourmet Cooking Set",
            description: "Professional-grade cookware with online cooking classes",
            price: "$250-$300",
            reasoning: "Perfect for aspiring chefs and food lovers",
            category: "cooking"
        }
    ];
}

function restartQuiz() {
    currentQuestion = 0;
    userAnswers = [];
    
    // Reset progress bar to 0%
    const progress = document.getElementById('progress');
    gsap.set(progress, { width: '0%' });
    
    // Get new random questions
    questions.length = 0;
    questions.push(...getRandomQuestions());
    
    // Hide all screens except welcome
    document.getElementById('results-screen').classList.add('hidden');
    document.getElementById('confirmation-screen').classList.add('hidden');
    document.getElementById('welcome-screen').classList.remove('hidden');
    gsap.to('#welcome-screen', { opacity: 1, duration: 0.5 });
}

function showBudgetExplorer() {
    // Hide welcome screen
    gsap.to('#welcome-screen', {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
            document.getElementById('welcome-screen').classList.add('hidden');
            document.getElementById('budget-explorer').classList.remove('hidden');
            initializeBudgetExplorer();
        }
    });
}

function initializeBudgetExplorer() {
    const budgetRangesContainer = document.getElementById('budget-ranges');
    const categoriesContainer = document.getElementById('gift-categories');
    
    // Populate budget ranges
    budgetRangesContainer.innerHTML = budgetRanges.map(range => `
        <button class="budget-range-btn bg-white/10 p-3 rounded-xl text-white hover:bg-white/20 transition-all duration-300
                       data-min="${range.min}" data-max="${range.max}">
            ${range.label}
        </button>
    `).join('');
    
    // Add click handlers for budget ranges
    document.querySelectorAll('.budget-range-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.budget-range-btn').forEach(b => 
                b.classList.remove('bg-green-500', 'hover:bg-green-600'));
            btn.classList.add('bg-green-500', 'hover:bg-green-600');
        });
    });
    
    // Populate gift categories with checkboxes
    categoriesContainer.innerHTML = Object.entries(categoryIcons).map(([category, icon]) => `
        <div class="flex items-center space-x-3">
            <input type="checkbox" id="cat-${category}" class="w-4 h-4">
            <label for="cat-${category}" class="text-white flex items-center space-x-2">
                <span>${icon}</span>
                <span>${category.charAt(0).toUpperCase() + category.slice(1)}</span>
            </label>
        </div>
    `).join('');
    
    // Add event listeners for navigation
    document.getElementById('back-to-home').addEventListener('click', () => {
        document.getElementById('budget-explorer').classList.add('hidden');
        document.getElementById('welcome-screen').classList.remove('hidden');
        gsap.to('#welcome-screen', { opacity: 1, duration: 0.3 });
    });
    
    document.getElementById('search-budget-gifts').addEventListener('click', searchBudgetGifts);
}

async function searchBudgetGifts() {
    const selectedBudgetBtn = document.querySelector('.budget-range-btn.bg-green-500');
    const selectedCategories = Array.from(document.querySelectorAll('#gift-categories input:checked'))
        .map(input => input.id.replace('cat-', ''));
    
    if (!selectedBudgetBtn) {
        alert('Please select a budget range');
        return;
    }
    
    // Show loading state
    const resultsSection = document.getElementById('budget-results');
    const giftsContainer = document.getElementById('budget-gifts-container');
    resultsSection.classList.remove('hidden');
    giftsContainer.innerHTML = `
        <div class="col-span-full flex flex-col items-center justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
            <p class="text-white text-xl">Finding gifts within your budget...</p>
        </div>
    `;
    
    // Get budget range values
    const minBudget = parseFloat(selectedBudgetBtn.dataset.min);
    const maxBudget = selectedBudgetBtn.dataset.max ? parseFloat(selectedBudgetBtn.dataset.max) : Infinity;
    
    // Additional filters
    const filters = {
        personalized: document.getElementById('personalized').checked,
        handmade: document.getElementById('handmade').checked,
        expressShipping: document.getElementById('express-shipping').checked
    };
    
    try {
        const gifts = await getGiftsByBudget(minBudget, maxBudget, selectedCategories, filters);
        displayBudgetGifts(gifts);
    } catch (error) {
        console.error('Error fetching budget gifts:', error);
        giftsContainer.innerHTML = `
            <div class="col-span-full text-center text-white">
                <p class="text-xl mb-4">Oops! Something went wrong.</p>
                <button onclick="searchBudgetGifts()" 
                        class="bg-white/20 px-6 py-3 rounded-full hover:bg-white/30 transition-all duration-300">
                    Try Again
                </button>
            </div>
        `;
    }
}

async function getGiftsByBudget(minBudget, maxBudget, categories, filters) {
    // Modify your existing getRecommendedGifts function to include budget parameters
    const prompt = `Suggest gift ideas with the following criteria:
        - Budget range: $${minBudget} to ${maxBudget === Infinity ? 'unlimited' : '$' + maxBudget}
        - Categories: ${categories.join(', ') || 'any'}
        - ${filters.personalized ? 'Include personalized options' : ''}
        - ${filters.handmade ? 'Include handmade items' : ''}
        - ${filters.expressShipping ? 'Must have express shipping available' : ''}
    `;
    
    // Use the existing API call with the new prompt
    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer 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'
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                response_format: { type: "json_object" },
                messages: [
                    {
                        role: "system",
                        content: `You are a gift recommendation expert. Based on the budget and preferences, suggest appropriate gift ideas.`
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            })
        });

        const data = await response.json();
        const recommendations = JSON.parse(data.choices[0].message.content);
        return transformRecommendations(recommendations.gifts);
    } catch (error) {
        console.error('Error getting budget gifts:', error);
        return getFallbackGifts().filter(gift => {
            const giftPrice = parseFloat(gift.price.replace(/[^0-9.-]+/g, ''));
            return giftPrice >= minBudget && giftPrice <= maxBudget;
        });
    }
}

function displayBudgetGifts(gifts) {
    const giftsContainer = document.getElementById('budget-gifts-container');
    giftsContainer.innerHTML = '';
    
    gifts.forEach((gift, index) => {
        const giftCard = createGiftCard(gift, index);
        gsap.fromTo(giftCard,
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 0.5, delay: index * 0.2 }
        );
        giftsContainer.appendChild(giftCard);
    });
}

function showOccasionFinder() {
    // Hide welcome screen
    gsap.to('#welcome-screen', {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
            document.getElementById('welcome-screen').classList.add('hidden');
            document.getElementById('occasion-finder').classList.remove('hidden');
            initializeOccasionFinder();
        }
    });
}

function initializeOccasionFinder() {
    const occasionContainer = document.getElementById('occasion-categories');
    
    // Populate main occasion categories
    occasionContainer.innerHTML = occasionCategories.map(category => `
        <div class="occasion-category bg-white/10 backdrop-blur-lg rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 cursor-pointer">
            <div class="flex items-center space-x-4 mb-4">
                <span class="text-3xl">${category.icon}</span>
                <h3 class="text-2xl font-bold text-white">${category.name}</h3>
            </div>
            <div class="subcategories hidden space-y-2">
                ${category.subcategories.map(sub => `
                    <button class="subcategory-btn w-full text-left px-4 py-2 rounded-xl text-white
                                 hover:bg-white/20 transition-all duration-300 flex items-center space-x-2">
                        <span class="w-6 h-6 flex items-center justify-center rounded-full bg-white/10">→</span>
                        <span>${sub}</span>
                    </button>
                `).join('')}
            </div>
        </div>
    `).join('');
    
    // Add click handlers for categories
    document.querySelectorAll('.occasion-category').forEach(category => {
        category.addEventListener('click', (e) => {
            const subcategories = category.querySelector('.subcategories');
            const isSubcategoryBtn = e.target.closest('.subcategory-btn');
            
            if (isSubcategoryBtn) {
                // Handle subcategory selection
                const mainCategory = category.querySelector('h3').textContent;
                const subCategory = isSubcategoryBtn.textContent.trim();
                searchOccasionGifts(mainCategory, subCategory);
            } else {
                // Toggle subcategories visibility
                const wasHidden = subcategories.classList.contains('hidden');
                
                // Hide all subcategories first
                document.querySelectorAll('.subcategories').forEach(sub => {
                    sub.classList.add('hidden');
                });
                
                if (wasHidden) {
                    subcategories.classList.remove('hidden');
                    gsap.fromTo(subcategories,
                        { opacity: 0, height: 0 },
                        { opacity: 1, height: 'auto', duration: 0.3 }
                    );
                }
            }
        });
    });
    
    // Add event listener for back button
    document.getElementById('occasion-back-to-home').addEventListener('click', () => {
        document.getElementById('occasion-finder').classList.add('hidden');
        document.getElementById('welcome-screen').classList.remove('hidden');
        gsap.to('#welcome-screen', { opacity: 1, duration: 0.3 });
    });
}

async function searchOccasionGifts(mainCategory, subCategory) {
    const resultsSection = document.getElementById('occasion-results');
    const giftsContainer = document.getElementById('occasion-gifts-container');
    
    // Show loading state
    resultsSection.classList.remove('hidden');
    giftsContainer.innerHTML = `
        <div class="col-span-full flex flex-col items-center justify-center py-12">
            <div class="relative">
                <!-- Outer spinning ring -->
                <div class="absolute inset-0 animate-spin">
                    <div class="h-24 w-24 rounded-full border-4 border-transparent border-t-white/30 border-l-white/30"></div>
                </div>
                <!-- Inner spinning ring -->
                <div class="absolute inset-0 animate-spin" style="animation-duration: 1.5s;">
                    <div class="h-16 w-16 mx-auto my-4 rounded-full border-4 border-transparent border-t-white/60 border-l-white/60"></div>
                </div>
                <!-- Center occasion icon -->
                <div class="absolute inset-0 flex items-center justify-center">
                    <span class="text-3xl animate-bounce">🎉</span>
                </div>
            </div>
            <p class="text-white text-xl mt-8">Finding perfect gifts for ${subCategory}...</p>
        </div>
    `;
    
    try {
        const gifts = await getOccasionGifts(mainCategory, subCategory);
        displayOccasionGifts(gifts);
    } catch (error) {
        console.error('Error fetching occasion gifts:', error);
        giftsContainer.innerHTML = `
            <div class="col-span-full text-center text-white">
                <p class="text-xl mb-4">Oops! Something went wrong.</p>
                <button onclick="searchOccasionGifts('${mainCategory}', '${subCategory}')" 
                        class="bg-white/20 px-6 py-3 rounded-full hover:bg-white/30 transition-all duration-300">
                    Try Again
                </button>
            </div>
        `;
    }
}

async function getOccasionGifts(mainCategory, subCategory) {
    const prompt = `Suggest gift ideas for a ${subCategory} occasion under the ${mainCategory} category. 
                   Include a mix of traditional and unique gifts that are appropriate for this specific occasion.
                   Consider various price ranges and recipient types.`;
    
    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer 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'
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                response_format: { type: "json_object" },
                messages: [
                    {
                        role: "system",
                        content: `You are a gift recommendation expert specializing in occasion-specific gifts.`
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            })
        });

        const data = await response.json();
        const recommendations = JSON.parse(data.choices[0].message.content);
        return transformRecommendations(recommendations.gifts);
    } catch (error) {
        console.error('Error getting occasion gifts:', error);
        return getFallbackGifts();
    }
}

function displayOccasionGifts(gifts) {
    const giftsContainer = document.getElementById('occasion-gifts-container');
    giftsContainer.innerHTML = '';
    
    gifts.forEach((gift, index) => {
        const giftCard = createGiftCard(gift, index);
        gsap.fromTo(giftCard,
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 0.5, delay: index * 0.2 }
        );
        giftsContainer.appendChild(giftCard);
    });
}