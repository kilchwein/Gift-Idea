const people = [
    {
        id: 1,
        name: "John Smith",
        rating: 9,
        description: "Expert software developer with 10 years of experience. Specializes in React and Node.js.",
        image: "https://randomuser.me/api/portraits/men/1.jpg",
        rentOptions: [
            { duration: "1 hour", price: 50 },
            { duration: "1 day", price: 300 },
            { duration: "1 week", price: 1500 }
        ],
        buyPrice: 100000
    },
    {
        id: 2,
        name: "Sarah Johnson",
        rating: 8,
        description: "Professional project manager with excellent communication skills and agile methodology expertise.",
        image: "https://randomuser.me/api/portraits/women/1.jpg",
        rentOptions: [
            { duration: "1 hour", price: 45 },
            { duration: "1 day", price: 280 },
            { duration: "1 week", price: 1400 }
        ],
        buyPrice: 90000
    },
    {
        id: 3,
        name: "Michael Chen",
        rating: 10,
        description: "AI researcher and data scientist with PhD in Machine Learning. Published in top conferences.",
        image: "https://randomuser.me/api/portraits/men/2.jpg",
        rentOptions: [
            { duration: "1 hour", price: 60 },
            { duration: "1 day", price: 350 },
            { duration: "1 week", price: 1800 }
        ],
        buyPrice: 120000
    }
];

function displayPeople() {
    const grid = document.getElementById('peopleGrid');
    grid.innerHTML = people.map(person => `
        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
            <img src="${person.image}" alt="${person.name}" class="w-full h-48 object-cover">
            <div class="p-4">
                <h2 class="text-xl font-bold mb-2">${person.name}</h2>
                <div class="flex items-center mb-2">
                    <span class="text-yellow-500 font-bold">Rating: ${person.rating}/10</span>
                </div>
                <p class="text-gray-600 mb-4">${person.description}</p>
                <button 
                    onclick="showOptions(${person.id})" 
                    class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
                >
                    View Options
                </button>
            </div>
        </div>
    `).join('');
}

function showOptions(personId) {
    const person = people.find(p => p.id === personId);
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalOptions = document.getElementById('modalOptions');

    modalTitle.textContent = `Options for ${person.name}`;
    
    const rentOptionsHtml = person.rentOptions.map(option => `
        <button 
            onclick="handleRent('${person.name}', '${option.duration}', ${option.price})"
            class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
        >
            Rent for ${option.duration} ($${option.price})
        </button>
    `).join('');

    const buyOptionHtml = `
        <button 
            onclick="handleBuy('${person.name}', ${person.buyPrice})"
            class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full"
        >
            Buy for $${person.buyPrice}
        </button>
    `;

    modalOptions.innerHTML = rentOptionsHtml + buyOptionHtml;
    modal.classList.remove('hidden');
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.add('hidden');
}

function handleRent(name, duration, price) {
    alert(`You have rented ${name} for ${duration} at $${price}`);
    closeModal();
}

function handleBuy(name, price) {
    alert(`You have purchased ${name} for $${price}`);
    closeModal();
}

// Initialize the display when the page loads
document.addEventListener('DOMContentLoaded', displayPeople); 