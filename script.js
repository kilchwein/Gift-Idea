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

async function handleAnswer(answer) {
    userAnswers.push(answer);
    
    if (currentQuestion < questions.length - 1) {
        currentQuestion++;
        showQuestion(currentQuestion);
    } else {
        await showResults();
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

function getGiftIcon(giftName, index) {
    // Array of background colors for icons
    const bgColors = [
        'from-pink-500 to-rose-500',
        'from-purple-500 to-indigo-500',
        'from-blue-500 to-cyan-500',
        'from-emerald-500 to-teal-500',
        'from-orange-500 to-amber-500'
    ];

    // Map common gift categories to icons
    const iconMap = {
        // Tech
        'smart': '💻',
        'phone': '📱',
        'watch': '⌚',
        'headphone': '🎧',
        'camera': '📸',
        'gaming': '🎮',
        
        // Creative
        'art': '🎨',
        'music': '🎵',
        'book': '📚',
        'writing': '✍️',
        'craft': '🎭',
        
        // Sports & Outdoors
        'fitness': '💪',
        'yoga': '🧘',
        'hiking': '🏃',
        'camping': '⛺',
        'sports': '🏅',
        
        // Relaxation
        'spa': '💆',
        'massage': '🧖',
        'candle': '🕯️',
        'tea': '☕',
        
        // Experience
        'ticket': '🎟️',
        'travel': '✈️',
        'adventure': '🗺️',
        'cooking': '👨‍🍳',
        'class': '📝',
        
        // Default
        'gift': '🎁'
    };

    // Find matching icon by checking if gift name includes any key
    const matchingKey = Object.keys(iconMap).find(key => 
        giftName.toLowerCase().includes(key.toLowerCase())
    );

    const icon = matchingKey ? iconMap[matchingKey] : iconMap.gift;
    const bgColor = bgColors[index % bgColors.length];
    
    return { icon, bgColor };
}

function createGiftCard(gift, index) {
    const card = document.createElement('div');
    card.className = 'gift-card';
    
    const { icon, bgColor } = getGiftIcon(gift.name, index);
    
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
                        content: `You are a gift recommendation expert. Based on the user's answers, suggest 5 unique and personalized gift ideas. 
                        
                        Guidelines for recommendations:
                        - Keep descriptions concise and focused on features and benefits
                        - Do not mention emojis or icons in any text
                        - Focus reasoning on how the gift matches their personality and preferences
                        - Keep price ranges realistic and specific
                        - Each gift should be distinctly different from the others
                        
                        Example of good description:
                        "High-performance wireless gaming controller with customizable buttons and ergonomic design"
                        
                        Example of good reasoning:
                        "Perfect for someone who enjoys gaming and values both comfort and precision in their gaming experience"
                        
                        Respond in JSON format with an array of gift objects.`
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

    return `Based on these answers, suggest 5 personalized gift ideas:
    ${answerSummary}
    
    Please provide recommendations in this JSON format:
    {
        "gifts": [
            {
                "name": "Gift Name",
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
        reasoning: rec.reasoning
    }));
}

function getFallbackGifts() {
    return [
        {
            id: 1,
            name: "Personalized Gift Box",
            description: "A curated collection of thoughtful items",
            price: "$50-$100",
            reasoning: "A versatile option that can be customized to their interests"
        },
        {
            id: 2,
            name: "Smart Watch Fitness Tracker",
            description: "Track health and stay connected",
            price: "$80-$150",
            reasoning: "Perfect for someone interested in health and technology"
        },
        {
            id: 3,
            name: "Art Supply Set",
            description: "Premium creative materials",
            price: "$40-$80",
            reasoning: "Ideal for expressing creativity"
        },
        {
            id: 4,
            name: "Meditation App Subscription",
            description: "Year of premium mindfulness content",
            price: "$60-$100",
            reasoning: "Great for relaxation and personal growth"
        },
        {
            id: 5,
            name: "Adventure Experience Voucher",
            description: "Choice of exciting local activities",
            price: "$100-$200",
            reasoning: "Perfect for making memorable experiences"
        }
    ];
}

function restartQuiz() {
    currentQuestion = 0;
    userAnswers = [];
    document.getElementById('results-screen').classList.add('hidden');
    document.getElementById('welcome-screen').classList.remove('hidden');
    gsap.to('#welcome-screen', { opacity: 1, duration: 0.5 });
}