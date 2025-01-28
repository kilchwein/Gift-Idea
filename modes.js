// Quiz mode configurations
const quizModes = {
    quick: {
        questionCount: 5,
        name: "Quick Match",
        icon: "⚡"
    },
    detailed: {
        questionCount: 10,
        name: "Detailed Journey",
        icon: "🎯"
    },
    expert: {
        questionCount: 15,
        name: "Expert Analysis",
        icon: "🔍"
    }
};

// Budget explorer ranges
const budgetRanges = [
    { min: 0, max: 25, label: "Under $25" },
    { min: 25, max: 50, label: "$25 - $50" },
    { min: 50, max: 100, label: "$50 - $100" },
    { min: 100, max: 200, label: "$100 - $200" },
    { min: 200, max: 500, label: "$200 - $500" },
    { min: 500, max: null, label: "$500+" }
];

// Occasion categories
const occasionCategories = [
    {
        name: "Birthday",
        icon: "🎂",
        subcategories: ["Child", "Teen", "Adult", "Senior", "Milestone Birthday"]
    },
    {
        name: "Holiday",
        icon: "🎄",
        subcategories: ["Christmas", "Hanukkah", "Valentine's Day", "Mother's Day", "Father's Day"]
    },
    {
        name: "Special Events",
        icon: "🎉",
        subcategories: ["Wedding", "Graduation", "New Baby", "Housewarming", "Retirement"]
    },
    {
        name: "Personal",
        icon: "💝",
        subcategories: ["Anniversary", "Thank You", "Get Well", "Congratulations", "Just Because"]
    }
];

// Tool configurations
const tools = {
    calculator: {
        name: "Gift Calculator",
        icon: "🧮",
        features: ["Budget Splitting", "Group Gift Planning", "Tax Calculator"]
    },
    countdown: {
        name: "Event Countdown",
        icon: "⏰",
        features: ["Multiple Event Tracking", "Reminders", "Shopping Deadlines"]
    },
    registry: {
        name: "Gift Registry",
        icon: "📝",
        features: ["Wishlist Creation", "Gift Ideas Saving", "Share with Others"]
    }
};

// Registry for saving gift recommendations
class GiftRegistry {
    constructor() {
        this.savedGifts = JSON.parse(localStorage.getItem('savedGifts')) || [];
        this.wishlists = JSON.parse(localStorage.getItem('wishlists')) || [];
    }

    saveGift(gift) {
        this.savedGifts.push({
            ...gift,
            savedAt: new Date().toISOString()
        });
        this.updateStorage();
    }

    createWishlist(name) {
        const wishlist = {
            id: Date.now(),
            name,
            gifts: [],
            createdAt: new Date().toISOString()
        };
        this.wishlists.push(wishlist);
        this.updateStorage();
        return wishlist;
    }

    updateStorage() {
        localStorage.setItem('savedGifts', JSON.stringify(this.savedGifts));
        localStorage.setItem('wishlists', JSON.stringify(this.wishlists));
    }
}

// Event countdown manager
class EventCountdown {
    constructor() {
        this.events = JSON.parse(localStorage.getItem('giftEvents')) || [];
    }

    addEvent(name, date, reminderDays = [1, 7, 30]) {
        const event = {
            id: Date.now(),
            name,
            date,
            reminderDays,
            createdAt: new Date().toISOString()
        };
        this.events.push(event);
        this.updateStorage();
        return event;
    }

    getRemainingDays(event) {
        const eventDate = new Date(event.date);
        const today = new Date();
        const diffTime = eventDate - today;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    updateStorage() {
        localStorage.setItem('giftEvents', JSON.stringify(this.events));
    }
}

// Budget calculator
class GiftCalculator {
    calculateGroupGift(totalAmount, numberOfPeople) {
        return totalAmount / numberOfPeople;
    }

    calculateWithTax(amount, taxRate = 0.1) {
        return amount * (1 + taxRate);
    }

    createBudgetPlan(totalBudget, categories) {
        return categories.map(category => ({
            name: category.name,
            amount: (totalBudget * category.percentage)
        }));
    }
}

export {
    quizModes,
    budgetRanges,
    occasionCategories,
    tools,
    GiftRegistry,
    EventCountdown,
    GiftCalculator
}; 