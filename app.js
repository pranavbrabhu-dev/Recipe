// DOM Elements
const input1 = document.getElementById('ingredient-input-1');
const input2 = document.getElementById('ingredient-input-2');
const input3 = document.getElementById('ingredient-input-3');
const findRecipesBtn = document.getElementById('find-recipes-btn');
const resultsSection = document.getElementById('results-section');
const recipeGrid = document.getElementById('recipe-grid');
const emptyState = document.getElementById('empty-state');

// AI DOM Elements
const cookMagicBtn = document.getElementById('cook-magic-btn');
const apiKeyInput = document.getElementById('gemini-api-key');
const aiResponseSection = document.getElementById('ai-response-section');
const aiLoader = document.getElementById('ai-loader');
const aiContent = document.getElementById('ai-content');

// Mock Recipe Database with placeholder images from unsplash
const RECIPE_DB = [
    {
        id: 1,
        title: "Garlic Butter Pasta",
        image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=500&q=80",
        time: "15 mins",
        difficulty: "Easy",
        ingredients: ["pasta", "garlic", "butter", "parmesan", "parsley"],
        instructions: "Boil pasta. Sauté garlic in butter. Toss pasta in garlic butter, top with parmesan and parsley."
    },
    {
        id: 2,
        title: "Chicken Stir-fry",
        image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500&q=80",
        time: "25 mins",
        difficulty: "Medium",
        ingredients: ["chicken", "broccoli", "soy sauce", "garlic", "rice", "bell pepper"],
        instructions: "Cook rice. Stir-fry chicken until browned. Add vegetables and soy sauce. Serve over rice."
    },
    {
        id: 3,
        title: "Classic Omelette",
        image: "https://images.unsplash.com/photo-1510693060292-16b73eb8b295?w=500&q=80",
        time: "10 mins",
        difficulty: "Easy",
        ingredients: ["eggs", "butter", "cheese", "milk", "salt"],
        instructions: "Whisk eggs with a splash of milk and salt. Cook in melted butter, fold in cheese."
    },
    {
        id: 4,
        title: "Tomato Basil Soup",
        image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=500&q=80",
        time: "30 mins",
        difficulty: "Easy",
        ingredients: ["tomatoes", "basil", "garlic", "onion", "cream", "broth"],
        instructions: "Roast tomatoes, garlic, onion. Blend with broth and fresh basil. Stir in cream. Simmer."
    },
    {
        id: 5,
        title: "Avocado Toast with Egg",
        image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&q=80",
        time: "10 mins",
        difficulty: "Easy",
        ingredients: ["bread", "avocado", "eggs", "lemon", "chili flakes"],
        instructions: "Toast bread. Mash avocado with lemon. Fry or poach egg. Assemble and sprinkle chili flakes."
    },
    {
        id: 6,
        title: "Beef Tacos",
        image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=500&q=80",
        time: "20 mins",
        difficulty: "Easy",
        ingredients: ["ground beef", "taco shells", "cheese", "lettuce", "tomato", "onion", "taco seasoning"],
        instructions: "Brown beef with onion and seasoning. Serve in shells with chopped toppings."
    },
    {
        id: 7,
        title: "Pancake Stack",
        image: "https://images.unsplash.com/photo-1528207776546-32218641d441?w=500&q=80",
        time: "20 mins",
        difficulty: "Medium",
        ingredients: ["flour", "milk", "eggs", "butter", "maple syrup", "baking powder"],
        instructions: "Mix dry ingredients. Whisk wet ingredients. Combine. Cook on griddle until bubbly. Serve with syrup."
    },
    {
        id: 8,
        title: "Caprese Salad",
        image: "https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=500&q=80",
        time: "5 mins",
        difficulty: "Easy",
        ingredients: ["tomatoes", "mozzarella", "basil", "olive oil", "balsamic vinegar"],
        instructions: "Slice tomatoes and mozzarella. Layer with basil leaves. Drizzle with oil and vinegar."
    }
];

// Event Listeners
findRecipesBtn.addEventListener('click', findRecipes);
cookMagicBtn.addEventListener('click', cookMagic);

[input1, input2, input3].forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            findRecipes();
            input.blur();
        }
    });
});

async function cookMagic() {
    const ing1 = input1.value.trim();
    const ing2 = input2.value.trim();
    const ing3 = input3.value.trim();
    const ingredients = [ing1, ing2, ing3].filter(Boolean).join(', ');
    
    if (!ingredients) {
        alert('Please enter at least one ingredient for the magic to work!');
        return;
    }
    
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
        alert('Please enter your Gemini API Key in the box to use Cook Magic!');
        apiKeyInput.focus();
        return;
    }
    
    // Hide standard results, show AI section
    resultsSection.classList.add('hidden');
    aiResponseSection.classList.remove('hidden');
    aiLoader.classList.remove('hidden');
    aiContent.innerHTML = '';
    
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `You are an expert chef. I have these ingredients: ${ingredients}. Give me one delicious, creative recipe I can make with them. Format the response with simple HTML tags (<h2> for title, <h3> for sections like Ingredients and Instructions, <ul>/<li> for lists, <p> for paragraphs) so I can insert it directly into a webpage. Do not wrap the response in markdown code blocks like \`\`\`html.`
                    }]
                }]
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error?.message || 'Failed to fetch from Gemini');
        }
        
        let htmlContent = data.candidates[0].content.parts[0].text;
        
        // Clean up markdown code blocks if any got through
        htmlContent = htmlContent.replace(/```html/gi, '').replace(/```/g, '');
        
        aiLoader.classList.add('hidden');
        aiContent.innerHTML = htmlContent;
        
    } catch (error) {
        aiLoader.classList.add('hidden');
        aiContent.innerHTML = `<div class="empty-state"><p style="color: #ef4444; font-weight: bold;">Oops! Magic fizzled: ${error.message}</p></div>`;
    }
}

function findRecipes() {
    const ing1 = input1.value.trim().toLowerCase();
    const ing2 = input2.value.trim().toLowerCase();
    const ing3 = input3.value.trim().toLowerCase();
    
    findRecipesBtn.classList.remove('pulse');
    
    const selectedIngredients = [ing1, ing2, ing3].filter(Boolean);

    if (selectedIngredients.length === 0) {
        // Find recipes anyway but maybe show a message
        displayAllOrMatched(RECIPE_DB);
        return;
    }
    
    // Calculate match scores
    const scoredRecipes = RECIPE_DB.map(recipe => {
        const recipeIngs = recipe.ingredients.map(i => i.toLowerCase());
        
        // Find how many of user's ingredients are in the recipe
        const matched = selectedIngredients.filter(userIng => {
            // Check for exact or partial matches (e.g. "tomato" matches "tomatoes")
            return recipeIngs.some(ri => ri.includes(userIng) || userIng.includes(ri));
        });
        
        // Match percentage
        const matchCount = matched.length;
        
        return {
            ...recipe,
            matchCount,
            matchedIngredients: matched
        };
    });
    
    // Sort by match count (highest first)
    // Filter out 0 matches if the user entered ingredients
    const sortedAndFiltered = scoredRecipes
        .filter(r => r.matchCount > 0)
        .sort((a, b) => b.matchCount - a.matchCount);
        
    displayAllOrMatched(sortedAndFiltered);
}

function displayAllOrMatched(recipes) {
    // Show section smoothly
    resultsSection.classList.remove('hidden');
    
    // Clear current grid
    recipeGrid.innerHTML = '';
    
    if (recipes.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    
    // Append recipes with stagger animation
    recipes.forEach((recipe, index) => {
        const card = document.createElement('div');
        card.className = 'recipe-card';
        // Delay animation based on index
        card.style.animationDelay = `${index * 0.1}s`;
        
        const matchBadgeHTML = recipe.matchCount ? 
            `<div class="match-badge">${recipe.matchCount} matched</div>` : '';
            
        card.innerHTML = `
            <div class="recipe-image-container">
                <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image" loading="lazy">
                ${matchBadgeHTML}
            </div>
            <div class="recipe-content">
                <h3 class="recipe-title">${recipe.title}</h3>
                <div class="recipe-meta">
                    <span>⏱ ${recipe.time}</span>
                    <span>🔥 ${recipe.difficulty}</span>
                </div>
                <p class="recipe-ingredients">
                    <strong>Need:</strong> ${recipe.ingredients.join(', ')}
                </p>
            </div>
        `;
        
        // Interactive click could open a modal (for MVP just console logs or alert)
        card.addEventListener('click', () => {
             // We could add a modal with instructions here, but alert is simple for now
             console.log(`Instructions for ${recipe.title}: ${recipe.instructions}`);
        });
        
        recipeGrid.appendChild(card);
    });
    
    // Scroll smoothly to results
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Initial state, let's load all recipes at start optionally?
// Not doing it right away to keep focus on the search.
