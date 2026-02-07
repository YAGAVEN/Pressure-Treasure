const stage1State = {
    // Grid configuration
    currentGridSize: '3x3',           // Current grid size: '3x3', '4x4', or '6x6'
    currentLevelIndex: 0,              // Current level index: 0 (3x3), 1 (4x4), 2 (6x6), 3 (maze)
    
     cards: [],
    
    // Flipped cards tracking (max 2 cards can be flipped at once)
    flippedCards: [],                 // Array of card IDs currently flipped (max length: 2)
    
    // Attempt tracking
    wrongAttempts: 0,                 // Total number of wrong attempts in current grid
    consecutiveWrongAttempts: 0,       // Number of consecutive wrong attempts
    
    // Progress tracking
    correctPairsCount: 0,             // Number of correctly matched pairs in current grid
    
    // Special features
    memoryBoostUsed: false,            // Whether memory boost has been used in current grid
    bonusPairTriggered: false,        // Whether bonus pair feature has been triggered
    bonusThresholdsTriggered: [],     // Array of bonus thresholds that have been triggered (e.g., [5, 10, 15])
    
    // Penalty tracking
    penaltyActive: false,              // Whether a penalty is currently active (prevents overlapping penalties)
    
    // Game status
    isGameActive: false,              // Whether the game is currently active
    isLevelComplete: false,           // Whether current level is complete
    stage1Completed: false,           // Whether Stage-1 is completed (all 3 grids + maze done)
    
    // Maze state
    mazeActive: false,                // Whether maze level is currently active
    maze: null,                       // 2D array representing maze grid
    mazeStartCell: null,              // {row, col} of start position
    mazeGoalCell: null,               // {row, col} of goal position
    mazePath: new Set(),              // Set of cell coords in user's drawn path
    mazeIsDrawing: false,             // Whether user is currently dragging mouse
    
    score: 0
};


function resetStage1State() {
    stage1State.currentGridSize = '3x3';
    stage1State.currentLevelIndex = 0;
    stage1State.cards = [];
    stage1State.flippedCards = [];
    stage1State.wrongAttempts = 0;
    stage1State.consecutiveWrongAttempts = 0;
    stage1State.correctPairsCount = 0;
    stage1State.memoryBoostUsed = false;
    stage1State.bonusPairTriggered = false;
    stage1State.bonusThresholdsTriggered = [];
    stage1State.penaltyActive = false;
    stage1State.isGameActive = false;
    stage1State.isLevelComplete = false;
    stage1State.stage1Completed = false;
    stage1State.mazeActive = false;
    stage1State.maze = null;
    stage1State.mazePath = new Set();
    stage1State.mazeIsDrawing = false;
    stage1State.score = 0;
}

/**
 * Reset state for a new grid/level within Stage-1
 * Preserves level progression but resets grid-specific state
 * @param {number} levelIndex - The level index (0, 1, or 2)
 */
function resetStage1GridState(levelIndex) {
    // Validate level index
    if (levelIndex < 0 || levelIndex > 2) {
        throw new Error('Level index must be 0, 1, or 2');
    }
    
    // Map level index to grid size
    const gridSizes = ['3x3', '4x4', '6x6'];
    stage1State.currentLevelIndex = levelIndex;
    stage1State.currentGridSize = gridSizes[levelIndex];
    
    // Reset grid-specific state
    stage1State.cards = [];
    stage1State.flippedCards = [];
    stage1State.wrongAttempts = 0;
    stage1State.consecutiveWrongAttempts = 0;
    stage1State.correctPairsCount = 0;
    stage1State.memoryBoostUsed = false;
    stage1State.bonusPairTriggered = false;
    stage1State.bonusThresholdsTriggered = [];
    stage1State.penaltyActive = false;
    stage1State.isLevelComplete = false;
    
    // Note: stage1Completed is NOT reset here - it's only reset in full resetStage1State()
    // Keep isGameActive as is (caller controls this)
}


function resetAttemptTracking() {
    stage1State.flippedCards = [];
    // Note: consecutiveWrongAttempts is reset only on correct match
    // wrongAttempts accumulates throughout the grid
}

/**
 * Reset consecutive wrong attempts counter
 * Call this when a correct match is made
 */
function resetConsecutiveWrongAttempts() {
    stage1State.consecutiveWrongAttempts = 0;
}

/**
 * Initialize state for next level in Stage-1
 * Automatically progresses to next level and resets grid state
 * @returns {boolean} - Returns true if there are more levels, false if Stage-1 is complete
 */
function initializeNextStage1Level() {
    if (stage1State.currentLevelIndex >= 2) {
        // Stage-1 is complete (all 3 levels done)
        return false;
    }
    
    const nextLevelIndex = stage1State.currentLevelIndex + 1;
    resetStage1GridState(nextLevelIndex);
    return true;
}

/**
 * Get the total number of pairs expected for current grid size
 * @returns {number} - Total pairs in current grid
 */
function getTotalPairsForCurrentGrid() {
    const gridSize = stage1State.currentGridSize;
    const totalCards = parseInt(gridSize) * parseInt(gridSize);
    
    // All cards are in pairs
    return totalCards / 2;
}

/**
 * Check if current level is complete
 * Checks if all non-fixed cards are matched
 * @returns {boolean} - True if all non-fixed cards are matched
 */
function isCurrentLevelComplete() {
    if (!stage1State.cards || stage1State.cards.length === 0) {
        return false;
    }
    
    // Check if all non-fixed cards are matched
    // Fixed cards (in odd grids like 3x3) don't block progression
    const allMatched = stage1State.cards.every(
        card => card.isFixed || card.isMatched
    );
    
    return allMatched;
}

// ===== GAME CONFIGURATION =====
// Configuration object for different levels and stages
// Easy to extend with more levels and stages
const gameConfig = {
    levels: [
        {
            level: 1,
            gridSize: { rows: 2, cols: 3 },  // 6 cards (3 pairs)
            stages: [
                { stage: 1, timeLimit: null },  // No time limit for first stage
                { stage: 2, timeLimit: 60 }     // 60 seconds for second stage
            ]
        },
        {
            level: 2,
            gridSize: { rows: 3, cols: 4 },  // 12 cards (6 pairs)
            stages: [
                { stage: 1, timeLimit: 90 },
                { stage: 2, timeLimit: 75 }
            ]
        }
        // Add more levels here as needed
    ]
};

// ===== DOM ELEMENTS =====
// Cache DOM elements for better performance
const elements = {
    cardGrid: document.getElementById('card-grid'),
    gameBoard: document.querySelector('.game-board'),
    levelDisplay: document.getElementById('level-display'),
    stageDisplay: document.getElementById('stage-display'),
    scoreDisplay: document.getElementById('score-display'),
    movesDisplay: document.getElementById('moves-display'),
    resetBtn: document.getElementById('reset-btn'),
    nextLevelBtn: document.getElementById('next-level-btn'),
    gameMessage: document.getElementById('game-message'),
    stage1Completion: document.getElementById('stage1-completion'),
    proceedStage2Btn: document.getElementById('proceed-stage2-btn')
};

// ===== INITIALIZATION =====
// Initialize the game when the page loads
function init() {
    // Set up event listeners
    setupEventListeners();
    
    // Update initial display
    updateDisplay();
    
    // Initialize card grid structure (without cards yet)
    initializeCardGrid();
}

// ===== EVENT LISTENERS =====
// Set up all event listeners for user interactions
function setupEventListeners() {
    // Reset button - resets current game
    elements.resetBtn.addEventListener('click', resetGame);
    
    // Next level button - progresses to next level
    elements.nextLevelBtn.addEventListener('click', nextLevel);
    
    // Proceed to Stage 2 button - emits custom event
    if (elements.proceedStage2Btn) {
        elements.proceedStage2Btn.addEventListener('click', handleProceedToStage2);
    }
}

// ===== DISPLAY UPDATES =====
// Update all display elements with current game state
function updateDisplay() {
    // Update level display (show level index + 1 for user-friendly display)
    elements.levelDisplay.textContent = stage1State.currentLevelIndex + 1;
    elements.stageDisplay.textContent = '1'; // Stage-1
    elements.scoreDisplay.textContent = stage1State.score;
    elements.movesDisplay.textContent = stage1State.wrongAttempts;
}

// ===== CARD GRID INITIALIZATION =====
// Initialize the card grid structure based on current level
function initializeCardGrid() {
    const gridSize = stage1State.currentGridSize;
    const size = parseInt(gridSize);
    
    // Set CSS grid columns dynamically
    elements.cardGrid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

    // Expose grid size and gap as CSS variables so cards can calculate width to fit viewport
    elements.cardGrid.style.setProperty('--grid-size', size);
    elements.cardGrid.style.setProperty('--card-gap', '10px');

    // Ensure the grid respects viewport height and width
    elements.cardGrid.style.maxHeight = '75vh';
    elements.cardGrid.style.maxWidth = 'min(90vw, 900px)';
}


function renderCardGrid() {
    // Clear existing cards
    elements.cardGrid.innerHTML = '';
    
    // Initialize grid layout
    initializeCardGrid();
    
    // Create and render each card
    stage1State.cards.forEach(card => {
        const cardElement = createCardElement(card);
        elements.cardGrid.appendChild(cardElement);
    });
}

/**
 * Create a card DOM element
 * @param {Object} card - Card object from stage1State.cards
 * @returns {HTMLElement} - Card DOM element
 */
function createCardElement(card) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.dataset.cardId = card.id;

    // State classes
    if (card.isMatched) cardDiv.classList.add('matched');
    if (card.isFlipped) cardDiv.classList.add('flipped');

    // Inner wrapper
    const cardInner = document.createElement('div');
    cardInner.className = 'card-inner';

    // Back face
    const cardBack = document.createElement('div');
    cardBack.className = 'card-face card-back';

    // Front face
    const cardFront = document.createElement('div');
    cardFront.className = 'card-face card-front';

    // ===== ICON RENDER (SINGLE SOURCE OF TRUTH) =====
    const DEFAULT_ICON =
        'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/code.svg';

    const iconImg = document.createElement('img');
    iconImg.src = card.iconSrc;
    iconImg.alt = ''; // VERY IMPORTANT
    iconImg.className = 'card-icon';

    // Fallback if icon URL fails
    iconImg.onerror = () => {
        iconImg.onerror = null;
        iconImg.src = DEFAULT_ICON;
    };

    cardFront.appendChild(iconImg);

    // Assemble card
    cardInner.appendChild(cardBack);
    cardInner.appendChild(cardFront);
    cardDiv.appendChild(cardInner);

    // Click handler
    cardDiv.addEventListener('click', () => {
        if (stage1State.isGameActive && !card.isMatched) {
            flipCard(card.id);
            updateCardDisplay(card.id);
        }
    });

    return cardDiv;
}


/**
 * Update the display of a specific card
 * @param {number} cardId - ID of the card to update
 */

function updateCardDisplay(cardId) {
    const card = stage1State.cards.find(c => c.id === cardId);
    if (!card) return;
    
    const cardElement = elements.cardGrid.querySelector(`[data-card-id="${cardId}"]`);
    if (!cardElement) return;
    
    // Update flipped state
    if (card.isFlipped) {
        cardElement.classList.add('flipped');
    } else {
        cardElement.classList.remove('flipped');
    }
    
    // Update matched state
    if (card.isMatched) {
        cardElement.classList.add('matched');
    } else {
        cardElement.classList.remove('matched');
    }
    
    // Update icon display
    const cardFront = cardElement.querySelector('.card-front');
    if (cardFront) {
        // Clear existing content and clear any background styles
        cardFront.innerHTML = '';
        cardFront.style.backgroundImage = '';
        cardFront.classList.remove('fixed-image');
        
        // All cards use images
        if (card.iconSrc.startsWith('http') || card.iconSrc.endsWith('.svg') || card.iconSrc.endsWith('.png')) {
            // It's an image URL - create img element
            const iconImg = document.createElement('img');
            iconImg.src = card.iconSrc;
            iconImg.alt = '';
            // Remove image if it fails to load
            iconImg.onerror = () => {
                iconImg.onerror = null;
                iconImg.remove();
            };
            iconImg.className = 'card-icon';
            cardFront.appendChild(iconImg);
        } else {
            // It's an emoji fallback
            cardFront.textContent = card.iconSrc;
        }
    }
}

/**
 * Update all cards display
 * Called after state changes that affect multiple cards
 */
function updateAllCardsDisplay() {
    stage1State.cards.forEach(card => {
        updateCardDisplay(card.id);
    });
}

// ===== CONFIGURATION HELPERS =====
// Get configuration for current level
function getCurrentConfig() {
    return gameConfig.levels.find(level => level.level === gameState.currentLevel);
}

// Get configuration for current stage
function getCurrentStageConfig() {
    const levelConfig = getCurrentConfig();
    if (!levelConfig) return null;
    
    return levelConfig.stages.find(stage => stage.stage === gameState.currentStage);
}

// ===== GAME CONTROL FUNCTIONS =====
// Start a new game
function startGame() {
    // Reset Stage-1 state
    resetStage1State();
    
    // Generate cards for initial grid (3x3)
    stage1State.cards = generateCards('3x3');
    
    // Render the card grid
    renderCardGrid();
    
    // Trigger Memory Boost
    triggerMemoryBoost();
    
    // Update game state
    stage1State.isGameActive = true;
    elements.resetBtn.disabled = false;
    
    // Update display
    updateDisplay();
}

// Reset the current game
function resetGame() {
    // Reset grid state for current level
    const currentLevelIndex = stage1State.currentLevelIndex;
    resetStage1GridState(currentLevelIndex);
    
    // Generate new cards
    stage1State.cards = generateCards(stage1State.currentGridSize);
    
    // Re-render the grid
    renderCardGrid();
    
    // Trigger Memory Boost
    triggerMemoryBoost();
    
    // Update display
    updateDisplay();
    
    // Reset buttons
    elements.resetBtn.disabled = false;
    elements.nextLevelBtn.disabled = true;
}

// Progress to next level
function nextLevel() {
    // Game logic will be implemented here
    console.log('Next level - to be implemented');
    
    // Increment level and reset stage
    gameState.currentLevel++;
    gameState.currentStage = 1;
    
    // Reset game state for new level
    resetGame();
    
    // Reinitialize grid for new level
    initializeCardGrid();
}

// ===== CARD FUNCTIONS =====
// Functions for card creation, flipping, matching, etc.

/**
 * Generate cards based on grid size
 * Creates pairs of cards for all grids: 3x3, 4x4, and 6x6
 * Each card has exactly one matching pair
 * Cards are shuffled randomly
 * @param {string} gridSize - Grid size: '3x3', '4x4', or '6x6'
 * @returns {Array} - Flat array of card objects with id, iconSrc, isFlipped, isMatched, isFixed
 */
function generateCards(gridSize) {
    // Validate grid size
    if (!['3x3', '4x4', '6x6'].includes(gridSize)) {
        throw new Error('Grid size must be "3x3", "4x4", or "6x6"');
    }
    
    const size = parseInt(gridSize);
    const totalCards = size * size;
    
    // Calculate number of pairs needed
    // For odd grids (3x3), one card will be fixed, so we need (totalCards - 1) / 2 pairs
    const totalPairs = gridSize === '3x3' ? Math.floor(totalCards / 2) : totalCards / 2;
    
    // Pool of tech stack icons for card pairs
    // Using recognizable technology stack icons from simple-icons CDN
    // Format: https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/{name}.svg
    const techIconNames = [
  // Programming Languages
  'python','java','javascript','typescript','cplusplus','csharp','go','rust','php','ruby','swift','kotlin','dart',

  // Web & Frameworks
  'react','vuejs','angular','nodejs','express','nextdotjs','nuxtdotjs','svelte',
  'django','flask','spring','laravel','rubyonrails','fastapi','nestjs',

  // Databases
  'mysql','postgresql','mongodb','redis','sqlite','mariadb','apachecassandra','elasticsearch',

  // Cloud / DevOps
  'docker','kubernetes','terraform','ansible','jenkins','git','github','gitlab','apache',


  // AI / ML
  'tensorflow','pytorch','pandas','numpy','scikitlearn','jupyter','opencv','huggingface',

  // Tools
  'visualstudiocode','intellijidea','figma','postman','swagger','graphql','apachekafka','rabbitmq'
];

    
    // Convert icon names to CDN URLs
    const iconPool = techIconNames.map(name => 
        `https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/${name}.svg`
    );
    
    // Select icons for pairs (take first totalPairs icons from pool)
    // const selectedIcons = iconPool.slice(0, totalPairs);
    const shuffledIcons = shuffleArray(iconPool);
    const selectedIcons = shuffledIcons.slice(0, totalPairs);

    
    // Create pairs of cards
    const pairCards = [];
    let cardId = 0;
    
    for (let i = 0; i < totalPairs; i++) {
        const iconSrc = selectedIcons[i];
        // Create two cards with the same icon (a pair)
        pairCards.push(
            {
                id: cardId++,
                iconSrc: iconSrc,
                isFlipped: false,
                isMatched: false,
                isFixed: false
            },
            {
                id: cardId++,
                iconSrc: iconSrc,
                isFlipped: false,
                isMatched: false,
                isFixed: false
            }
        );
    }
    
    // For 3x3 grid, add one fixed card in the center
    if (gridSize === '3x3') {
        pairCards.push({
            id: cardId++,
            iconSrc: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/star.svg',
            isFlipped: true,
            isMatched: false,
            isFixed: true
        });
    }
    
    // Shuffle only the pair cards
    const shuffledPairCards = shuffleArray(pairCards);
    
    // Return all pair cards
    return shuffledPairCards;
}


// ===== MEMORY BOOST LOGIC =====

/**
 * Memory Boost: Flips all non-fixed cards face-up for 3 seconds
 * Triggers automatically when a grid loads (only once per grid)
 * After 3 seconds, cards flip back unless already matched
 * Does not affect counters or penalties
 * 
 * This is a pure logic function that updates card state only.
 * Call this function when a grid loads to trigger Memory Boost.
 * 
 * @returns {number|null} - Returns the timeout ID if boost was triggered, null if already used
 */
function triggerMemoryBoost() {
    // Check if Memory Boost has already been used for this grid
    if (stage1State.memoryBoostUsed) {
        return null;
    }
    
    // Mark Memory Boost as used
    stage1State.memoryBoostUsed = true;
    
    // Flip all non-fixed cards face-up
    flipAllNonFixedCards(true);
    
    // After 3 seconds, flip cards back (unless already matched)
    const timeoutId = setTimeout(() => {
        flipAllNonFixedCardsBack();
    }, 3000);
    
    return timeoutId;
}

/**
 * Flip all non-fixed cards to the specified flipped state
 * Pure logic function that updates card state only
 * @param {boolean} flipped - True to flip face-up, false to flip face-down
 */
function flipAllNonFixedCards(flipped) {
    if (!stage1State.cards || stage1State.cards.length === 0) {
        return;
    }
    
    stage1State.cards.forEach(card => {
        // Only flip non-fixed cards
        if (!card.isFixed) {
            card.isFlipped = flipped;
        }
    });
    
    // Update display
    updateAllCardsDisplay();
}

/**
 * Flip all unmatched cards back face-down
 * Pure logic function that updates card state only
 * Does not affect counters or penalties
 */
function flipAllNonFixedCardsBack() {
    if (!stage1State.cards || stage1State.cards.length === 0) {
        return;
    }
    
    stage1State.cards.forEach(card => {
        // Only flip back unmatched cards
        if (!card.isMatched) {
            card.isFlipped = false;
        }
    });
    
    // Update display
    updateAllCardsDisplay();
}

// ===== CARD FLIP HANDLING LOGIC =====

/**
 * Handle card flip when user clicks on a card
 * Pure logic function that only updates state
 * 
 * Rules:
 * - Ignores clicks on fixed or already matched cards
 * - Allows flipping only 2 cards at a time
 * - When 2 cards are flipped, checks for match
 * 
 * @param {number} cardId - The ID of the card to flip
 * @returns {boolean} - Returns true if card was flipped, false if ignored
 */
function flipCard(cardId) {
    // Find the card by ID
    const card = stage1State.cards.find(c => c.id === cardId);
    
    // Ignore if card not found
    if (!card) {
        return false;
    }
    
    // Ignore clicks on already matched cards
    if (card.isMatched) {
        return false;
    }
    
    // Ignore if card is already flipped
    if (card.isFlipped) {
        return false;
    }
    
    // Check if we already have 2 cards flipped
    if (stage1State.flippedCards.length >= 2) {
        return false;
    }
    
    // Flip the card
    card.isFlipped = true;
    stage1State.flippedCards.push(cardId);
    
    // If we now have 2 cards flipped, check for match
    if (stage1State.flippedCards.length === 2) {
        checkMatch();
    }
    
    return true;
}

/**
 * Check if the two flipped cards match
 * Pure logic function that only updates state
 */
function checkMatch() {
    if (stage1State.flippedCards.length !== 2) {
        return;
    }
    
    const [cardId1, cardId2] = stage1State.flippedCards;
    const card1 = stage1State.cards.find(c => c.id === cardId1);
    const card2 = stage1State.cards.find(c => c.id === cardId2);
    
    if (!card1 || !card2) {
        return;
    }
    
    // Check if icons match (compare iconSrc)
    if (card1.iconSrc === card2.iconSrc) {
        handleMatch();
    } else {
        handleMismatch();
    }
}

/**
 * Handle when two flipped cards match
 * Pure logic function that only updates state
 * 
 * Actions:
 * - Mark both cards as matched
 * - Increment correctPairsCount
 * - Reset consecutiveWrongAttempts
 */
function handleMatch() {
    if (stage1State.flippedCards.length !== 2) {
        return;
    }
    
    const [cardId1, cardId2] = stage1State.flippedCards;
    const card1 = stage1State.cards.find(c => c.id === cardId1);
    const card2 = stage1State.cards.find(c => c.id === cardId2);
    
    if (!card1 || !card2) {
        return;
    }
    
    // Mark both cards as matched
    card1.isMatched = true;
    card2.isMatched = true;
    
    // Increment correct pairs count
    stage1State.correctPairsCount++;
    
    // Check for bonus pair (triggers at multiples of 5)
    checkAndTriggerBonusPair();
    
    // Reset consecutive wrong attempts
    resetConsecutiveWrongAttempts();
    
    // Clear flipped cards array
    stage1State.flippedCards = [];
    
    // Update card displays
    updateCardDisplay(cardId1);
    updateCardDisplay(cardId2);
    
    // Check if grid is complete and handle progression
    checkGridCompletion();
}

/**
 * Handle when two flipped cards don't match
 * Pure logic function that only updates state
 * 
 * Actions:
 * - Increment wrongAttempts
 * - Increment consecutiveWrongAttempts
 * - Flip both cards back after short delay
 */
function handleMismatch() {
    if (stage1State.flippedCards.length !== 2) {
        return;
    }
    
    const [cardId1, cardId2] = stage1State.flippedCards;
    const card1 = stage1State.cards.find(c => c.id === cardId1);
    const card2 = stage1State.cards.find(c => c.id === cardId2);
    
    if (!card1 || !card2) {
        return;
    }
    
    // Increment wrong attempts
    stage1State.wrongAttempts++;
    stage1State.consecutiveWrongAttempts++;
    

    // Add shake animation to both wrong cards
const el1 = elements.cardGrid.querySelector(`[data-card-id="${cardId1}"]`);
const el2 = elements.cardGrid.querySelector(`[data-card-id="${cardId2}"]`);

if (el1) el1.classList.add('shake');
if (el2) el2.classList.add('shake');

setTimeout(() => {
  if (el1) el1.classList.remove('shake');
  if (el2) el2.classList.remove('shake');
}, 400);


    // Check for penalties (only if no penalty is currently active)
    if (!stage1State.penaltyActive) {
        checkAndTriggerPenalties();
    }
    
    // Flip both cards back after short delay (e.g., 1 second)
    // Using setTimeout to flip back after delay
    setTimeout(() => {
        // Only flip back if cards are still flipped and not matched
        // (in case user somehow matched them during the delay)
        if (card1.isFlipped && !card1.isMatched) {
            card1.isFlipped = false;
        }
        if (card2.isFlipped && !card2.isMatched) {
            card2.isFlipped = false;
        }
        
        // Clear flipped cards array
        stage1State.flippedCards = [];
        
        // Update card displays
        updateCardDisplay(cardId1);
        updateCardDisplay(cardId2);
    }, 1000); // 1 second delay
    
    // Update card displays immediately (show flipped state)
    updateCardDisplay(cardId1);
    updateCardDisplay(cardId2);
}

// ===== PENALTY MECHANICS =====

/**
 * Check penalty conditions and trigger appropriate penalty
 * Ensures penalties never overlap or stack
 */
function checkAndTriggerPenalties() {
    // Don't trigger if penalty is already active
    if (stage1State.penaltyActive) {
        return;
    }
    
    // Check for Ghost Shuffle penalty (consecutiveWrongAttempts === 3)
    if (stage1State.consecutiveWrongAttempts === 3) {
        triggerGhostShuffle();
        return; // Only one penalty at a time
    }
    
    // Check for wrong attempts penalty (wrongAttempts === 5)
    if (stage1State.wrongAttempts === 5) {
        triggerWrongAttemptsPenalty();
        return; // Only one penalty at a time
    }
}

/**
 * Ghost Shuffle Penalty
 * Triggered when consecutiveWrongAttempts === 3
 * Shuffles ONLY non-fixed, non-matched cards
 * Resets consecutiveWrongAttempts
 * DISABLED for 3rd round (6x6 grid)
 */
function triggerGhostShuffle() {
    // Skip ghost shuffle for 3rd round (level index 2 = 6x6 grid)
    if (stage1State.currentLevelIndex === 2) {
        // Reset consecutive wrong attempts without shuffling
        stage1State.consecutiveWrongAttempts = 0;
        return;
    }
    
    // Mark penalty as active
    stage1State.penaltyActive = true;
    
    // Get all unmatched cards
    const shuffleableCards = stage1State.cards.filter(
        card => !card.isMatched
    );
    
    // If no cards to shuffle, skip penalty
    if (shuffleableCards.length === 0) {
        stage1State.penaltyActive = false;
        return;
    }
    
    // Extract icon sources from shuffleable cards
    const iconSrcs = shuffleableCards.map(card => card.iconSrc);
    
    // Shuffle the icon sources
    const shuffledIconSrcs = shuffleArray(iconSrcs);
    
    // Reassign shuffled icon sources to cards (maintaining card positions)
    shuffleableCards.forEach((card, index) => {
        card.iconSrc = shuffledIconSrcs[index];
    });
    
    // Reset consecutive wrong attempts
    stage1State.consecutiveWrongAttempts = 0;
    
    // Update all card displays (icons changed)
    updateAllCardsDisplay();
    
    // Mark penalty as inactive
    stage1State.penaltyActive = false;
}

/**
 * Wrong Attempts Penalty
 * Triggered when wrongAttempts === 5
 * Selects 2 already matched pairs and temporarily unmatches them
 * After 1 second, restores them
 * Does NOT affect flip counters
 */
function triggerWrongAttemptsPenalty() {
    // Mark penalty as active
    stage1State.penaltyActive = true;
    
    // Get all matched cards
    const matchedCards = stage1State.cards.filter(card => card.isMatched);
    
    // Need at least 4 matched cards (2 pairs) to trigger penalty
    if (matchedCards.length < 4) {
        stage1State.penaltyActive = false;
        return;
    }
    
    // Group matched cards by icon source to find pairs
    const pairsByIconSrc = {};
    matchedCards.forEach(card => {
        if (!pairsByIconSrc[card.iconSrc]) {
            pairsByIconSrc[card.iconSrc] = [];
        }
        pairsByIconSrc[card.iconSrc].push(card);
    });
    
    // Get pairs (icon sources that have exactly 2 cards)
    const pairs = Object.values(pairsByIconSrc).filter(
        cards => cards.length === 2
    );
    
    // Need at least 2 pairs
    if (pairs.length < 2) {
        stage1State.penaltyActive = false;
        return;
    }
    
    // Randomly select 2 pairs
    const shuffledPairs = shuffleArray(pairs);
    const selectedPairs = shuffledPairs.slice(0, 2);
    
    // Store the cards that will be temporarily unmatched
    const cardsToUnmatch = [];
    selectedPairs.forEach(pair => {
        pair.forEach(card => {
            cardsToUnmatch.push(card);
        });
    });
    
    // Temporarily unmatch the selected pairs
    cardsToUnmatch.forEach(card => {
        card.isMatched = false;
    });
    
    // Temporarily decrease correctPairsCount (will be restored)
    stage1State.correctPairsCount -= 2;
    
    // After 1 second, restore the matched state
    setTimeout(() => {
        // Restore matched state
        cardsToUnmatch.forEach(card => {
            card.isMatched = true;
        });
        
        // Restore correctPairsCount
        stage1State.correctPairsCount += 2;
        
        // Update card displays
        cardsToUnmatch.forEach(card => {
            updateCardDisplay(card.id);
        });
        
        // Mark penalty as inactive
        stage1State.penaltyActive = false;
    }, 1000);
    
    // Update card displays immediately (show unmatched state)
    cardsToUnmatch.forEach(card => {
        updateCardDisplay(card.id);
    });
}

// ===== BONUS PAIR LOGIC =====

/**
 * Check if correctPairsCount has reached a multiple of 5
 * and trigger bonus pair if threshold hasn't been triggered yet
 */
function checkAndTriggerBonusPair() {
    const currentCount = stage1State.correctPairsCount;
    
    // Check if current count is a multiple of 5
    if (currentCount % 5 !== 0) {
        return;
    }
    
    // Check if this threshold has already been triggered
    if (stage1State.bonusThresholdsTriggered.includes(currentCount)) {
        return;
    }
    
    // Trigger bonus pair
    triggerBonusPair();
    
    // Mark this threshold as triggered
    stage1State.bonusThresholdsTriggered.push(currentCount);
}

/**
 * Bonus Pair: Automatically match one unmatched pair
 * Pure logic function that only updates state
 * 
 * Rules:
 * - Selects one unmatched pair
 * - Marks it as matched instantly
 * - Increments correctPairsCount
 */
function triggerBonusPair() {
    // Get all unmatched, non-fixed cards
    const unmatchedCards = stage1State.cards.filter(
        card => !card.isMatched
    );
    
    // Need at least 2 cards to form a pair
    if (unmatchedCards.length < 2) {
        return;
    }
    
    // Group unmatched cards by icon source to find pairs
    const cardsByIconSrc = {};
    unmatchedCards.forEach(card => {
        if (!cardsByIconSrc[card.iconSrc]) {
            cardsByIconSrc[card.iconSrc] = [];
        }
        cardsByIconSrc[card.iconSrc].push(card);
    });
    
    // Find icon sources that have at least 2 cards (potential pairs)
    const availablePairs = Object.values(cardsByIconSrc).filter(
        cards => cards.length >= 2
    );
    
    // If no pairs available, skip bonus
    if (availablePairs.length === 0) {
        return;
    }
    
    // Randomly select one pair
    const randomIndex = Math.floor(Math.random() * availablePairs.length);
    const selectedPair = availablePairs[randomIndex];
    
    // Take the first 2 cards from the selected pair
    const card1 = selectedPair[0];
    const card2 = selectedPair[1];
    
    // Mark both cards as matched
    card1.isMatched = true;
    card2.isMatched = true;
    
    // Increment correct pairs count
    stage1State.correctPairsCount++;
    
    // Update card displays
    updateCardDisplay(card1.id);
    updateCardDisplay(card2.id);
    
    // Check if grid is complete and handle progression
    checkGridCompletion();
    
    // Note: We don't need to check for another bonus pair here because
    // this function is only called from checkAndTriggerBonusPair(),
    // which already checks if the threshold was triggered
}

// ===== GRID PROGRESSION LOGIC =====

/**
 * Check if current grid is complete and handle automatic progression
 * Pure logic function that only updates state
 */
function checkGridCompletion() {
    // Check if all non-fixed cards are matched
    if (!isCurrentLevelComplete()) {
        return;
    }

    stage1State.score += 10;
    updateDisplay();

    // Mark current level as complete
    stage1State.isLevelComplete = true;

    // Check if current grid is the last one (6x6, index 2)
    if (stage1State.currentLevelIndex >= 2) {
        // Last memory grid complete - launch maze as final level
        launchMazeLevel();
        return;
    }

    // Not the last grid, automatically load next grid
    loadNextGrid();
}


function loadNextGrid() {
    // Increment to next level
    const nextLevelIndex = stage1State.currentLevelIndex + 1;
    
    // Validate level index
    if (nextLevelIndex > 2) {
        // Already at last level, should not happen
        return;
    }
    
    // Reset grid state for next level
    resetStage1GridState(nextLevelIndex);
    
    // Generate new cards for the next grid
    stage1State.cards = generateCards(stage1State.currentGridSize);
    
    // Reset level completion flag
    stage1State.isLevelComplete = false;
    
    // Render the new grid
    renderCardGrid();
    
    // Trigger Memory Boost for new grid
    triggerMemoryBoost();
    
    // Update display
    updateDisplay();
}

// ===== STAGE-1 COMPLETION SCREEN =====

/**
 * Show Stage-1 completion screen
 * Fades out the grid and displays completion message
 */
function showStage1Completion() {
    // Fade out the grid
    if (elements.gameBoard) {
        elements.gameBoard.classList.add('fade-out');
    }
    
    // Show completion screen
    if (elements.stage1Completion) {
        elements.stage1Completion.classList.remove('hidden');
    }
}

/**
 * Hide Stage-1 completion screen
 */
function hideStage1Completion() {
    // Remove fade from grid
    if (elements.gameBoard) {
        elements.gameBoard.classList.remove('fade-out');
    }
    
    // Hide completion screen
    if (elements.stage1Completion) {
        elements.stage1Completion.classList.add('hidden');
    }
}

/**
 * Handle proceed to Stage 2 button click
 * Emits a custom event for Stage-2 logic to handle
 */
function handleProceedToStage2() {
    // Emit custom event for Stage-2 progression
    const event = new CustomEvent('proceedToStage2', {
        detail: {
            stage1Completed: true
        }
    });
    window.dispatchEvent(event);
}

// ===== LEVEL/STAGE PROGRESSION =====
// Functions for managing level and stage progression

function checkStageComplete() {
    // To be implemented: Check if current stage is complete
}

function nextStage() {
    // To be implemented: Progress to next stage
}

// ===== SCORE CALCULATION =====
// Functions for calculating and updating score

function calculateScore() {
    // To be implemented: Calculate score based on moves, time, etc.
}

function updateScore(points) {
    // To be implemented: Update score display
}

// ===== UTILITY FUNCTIONS =====
// Helper functions for various game operations

/**
 * Shuffle array using Fisher-Yates shuffle algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} - New shuffled array (original array is not modified)
 */
function shuffleArray(array) {
    const shuffled = [...array]; // Create a copy to avoid mutating original
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function showMessage(title, message) {
    // To be implemented: Display game messages (win, lose, etc.)
}

function hideMessage() {
    // To be implemented: Hide game message
}

// ===== MAZE GAME LOGIC =====
// All maze-related functions for the final Stage-1 level

/**
 * Launch the maze level after 5x5 completion
 * This is called automatically when the last memory grid is completed
 */
function launchMazeLevel() {
    console.log('Launching Maze Level...');
    
    // Update state
    stage1State.currentLevelIndex = 3;
    stage1State.mazeActive = true;
    stage1State.isGameActive = true;
    stage1State.mazePath = new Set();
    
    // Hide card grid
    elements.cardGrid.parentElement.classList.add('fade-out');
    
    // Generate maze
    stage1State.maze = generateMaze(7, 7);
    
    // Show maze container
    const mazeContainer = document.getElementById('maze-container');
    if (mazeContainer) {
        mazeContainer.classList.remove('hidden');
        renderMazeGrid();
        setupMazeInteraction();
    }
}

/**
 * Generate a simple all-walkable maze (no walls)
 * All cells are walkable, START at (0,0), GOAL at (6,6)
 * @param {number} rows - Number of rows
 * @param {number} cols - Number of columns
 * @returns {Array} - 2D array where all values are 0 (empty/walkable)
 */
function generateMaze(rows, cols) {
    // Create a simple grid with NO walls - all cells are walkable (value 0)
    const maze = Array(rows)
        .fill()
        .map(() => Array(cols).fill(0));
    
    // Set start and goal positions
    stage1State.mazeStartCell = { row: 0, col: 0 };
    stage1State.mazeGoalCell = { row: rows - 1, col: cols - 1 };
    
    return maze;
}

/**
 * Render the maze grid in HTML
 */
function renderMazeGrid() {
    const mazeGrid = document.getElementById('maze-grid');
    if (!mazeGrid || !stage1State.maze) return;
    
    mazeGrid.innerHTML = '';
    const rows = stage1State.maze.length;
    const cols = stage1State.maze[0].length;
    
    // Set grid template columns
    mazeGrid.style.gridTemplateColumns = `repeat(${cols}, 40px)`;
    
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = document.createElement('div');
            cell.className = 'maze-cell';
            cell.dataset.row = r;
            cell.dataset.col = c;
            
            // Determine cell type
            if (stage1State.maze[r][c] === 1) {
                cell.classList.add('wall');
            } else {
                cell.classList.add('empty');
            }
            
            // Mark start and goal
            if (r === stage1State.mazeStartCell.row && c === stage1State.mazeStartCell.col) {
                cell.classList.add('start');
                cell.textContent = 'S';
            } else if (r === stage1State.mazeGoalCell.row && c === stage1State.mazeGoalCell.col) {
                cell.classList.add('goal');
                cell.textContent = 'G';
            }
            
            mazeGrid.appendChild(cell);
        }
    }
}

/**
 * Setup mouse interaction for drawing path in maze
 */
function setupMazeInteraction() {
    const mazeGrid = document.getElementById('maze-grid');
    if (!mazeGrid) return;
    
    // Mouse down - start drawing
    mazeGrid.addEventListener('mousedown', handleMazeMouseDown);
    mazeGrid.addEventListener('mousemove', handleMazeMouseMove);
    mazeGrid.addEventListener('mouseup', handleMazeMouseUp);
    mazeGrid.addEventListener('mouseleave', handleMazeMouseUp);
    
    // Touch support
    mazeGrid.addEventListener('touchstart', handleMazeTouchStart);
    mazeGrid.addEventListener('touchmove', handleMazeTouchMove);
    mazeGrid.addEventListener('touchend', handleMazeTouchEnd);
}

/**
 * Get maze cell at pixel coordinates
 * @param {number} x - Page X coordinate
 * @param {number} y - Page Y coordinate
 * @returns {Object} - {row, col} or null
 */
function getMazeCellAtCoords(x, y) {
    const mazeGrid = document.getElementById('maze-grid');
    const rect = mazeGrid.getBoundingClientRect();
    const localX = x - rect.left;
    const localY = y - rect.top;
    
    // Account for gap (2px) in grid
    const cellSize = 40;
    const gap = 2;
    const cellAndGap = cellSize + gap;
    
    const col = Math.floor(localX / cellAndGap);
    const row = Math.floor(localY / cellAndGap);
    
    // Validate bounds
    if (row >= 0 && row < stage1State.maze.length && 
        col >= 0 && col < stage1State.maze[0].length) {
        return { row, col };
    }
    
    return null;
}

/**
 * Handle mouse down on maze
 */
function handleMazeMouseDown(e) {
    if (stage1State.mazeActive && !stage1State.mazeIsDrawing) {
        stage1State.mazeIsDrawing = true;
        const cell = getMazeCellAtCoords(e.clientX, e.clientY);
        if (cell && stage1State.maze[cell.row][cell.col] === 0) {
            addCellToPath(cell);
        }
    }
}

/**
 * Handle mouse move on maze
 */
function handleMazeMouseMove(e) {
    if (stage1State.mazeActive && stage1State.mazeIsDrawing) {
        const cell = getMazeCellAtCoords(e.clientX, e.clientY);
        if (cell && stage1State.maze[cell.row][cell.col] === 0) {
            const cellKey = `${cell.row},${cell.col}`;
            
            // Only add if not already in path
            if (!stage1State.mazePath.has(cellKey)) {
                // Check if this cell is adjacent to last cell in path
                if (isValidMoveToCell(cell)) {
                    addCellToPath(cell);
                    checkMazeCompletion();
                }
            }
        }
    }
}

/**
 * Handle mouse up on maze
 */
function handleMazeMouseUp(e) {
    stage1State.mazeIsDrawing = false;
}

/**
 * Touch support for mobile devices
 */
function handleMazeTouchStart(e) {
    e.preventDefault();
    handleMazeMouseDown({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
}

function handleMazeTouchMove(e) {
    e.preventDefault();
    handleMazeMouseMove({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
}

function handleMazeTouchEnd(e) {
    e.preventDefault();
    handleMazeMouseUp(e);
}

/**
 * Check if move to a cell is valid (must be adjacent and not backtracking excessively)
 * @param {Object} cell - {row, col}
 * @returns {boolean}
 */
function isValidMoveToCell(cell) {
    const cellKey = `${cell.row},${cell.col}`;
    
    // Already in path
    if (stage1State.mazePath.has(cellKey)) {
        return false;
    }
    
    // If path is empty, any empty cell is valid
    if (stage1State.mazePath.size === 0) {
        return true;
    }
    
    // Get last cell in path
    const pathArray = Array.from(stage1State.mazePath);
    const lastCellStr = pathArray[pathArray.length - 1];
    const [lastRow, lastCol] = lastCellStr.split(',').map(Number);
    
    // Check if adjacent (up, down, left, right only - no diagonals)
    const rowDiff = Math.abs(cell.row - lastRow);
    const colDiff = Math.abs(cell.col - lastCol);
    
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
}

/**
 * Add cell to the path
 * @param {Object} cell - {row, col}
 */
function addCellToPath(cell) {
    const cellKey = `${cell.row},${cell.col}`;
    stage1State.mazePath.add(cellKey);
    
    // Update cell visual with path highlighting and glow
    const cellElement = document.querySelector(`[data-row="${cell.row}"][data-col="${cell.col}"]`);
    if (cellElement) {
        cellElement.classList.add('path');
        cellElement.classList.add('path-glow');  // Add glow effect to path
    }
}

/**
 * Check if maze is completed (path reached goal)
 */
function checkMazeCompletion() {
    if (stage1State.mazePath.size === 0) return;
    
    const pathArray = Array.from(stage1State.mazePath);
    const lastCellStr = pathArray[pathArray.length - 1];
    const [lastRow, lastCol] = lastCellStr.split(',').map(Number);
    
    // Check if reached goal
    if (lastRow === stage1State.mazeGoalCell.row && 
        lastCol === stage1State.mazeGoalCell.col) {
        completeMazeLevel();
    }
}

/**
 * Complete the maze level and trigger celebration, then transition to Stage-1 completion
 */
function completeMazeLevel() {
    console.log('🏆 Maze Completed! Starting Celebration...');
    
    // Disable further interaction immediately
    stage1State.mazeActive = false;
    stage1State.isGameActive = false;
    
    // Get maze container for applying celebration animations
    const mazeContainer = document.getElementById('maze-container');
    const goalCell = document.querySelector(`[data-row="${stage1State.mazeGoalCell.row}"][data-col="${stage1State.mazeGoalCell.col}"]`);
    
    // Animate goal cell with pulsing orange glow
    if (goalCell) {
        goalCell.classList.add('goal-reached');
    }
    
    // Add score
    stage1State.score += 20;
    updateDisplay();
    
    // Apply celebration animation classes to maze container
    if (mazeContainer) {
        mazeContainer.classList.add('victory-shake');   // Wobble effect
        mazeContainer.classList.add('victory-glow');    // Expanding glow
        mazeContainer.classList.add('victory-pulse');   // Scale bounce
    }
    
    // Create sparkle burst particles
    createSparkles(40);
    
    // After celebration window, fade maze and show completion screen
    setTimeout(() => {
        stage1State.stage1Completed = true;
        
        // Fade maze to transparent
        if (mazeContainer) {
            mazeContainer.style.opacity = '0';
            mazeContainer.style.pointerEvents = 'none';
        }
        
        // Remove fade from card grid
        const cardGrid = document.querySelector('.game-board');
        if (cardGrid) {
            cardGrid.classList.remove('fade-out');
        }
        
        // Show Stage-1 completion screen
        showStage1Completion();
    }, 1200);
}

/**
 * Create sparkle/confetti particles that burst outward
 * @param {number} count - Number of particles to create
 */
function createSparkles(count) {
    const mazeContainer = document.getElementById('maze-container');
    if (!mazeContainer) return;
    
    const rect = mazeContainer.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const emojis = ['✨', '⭐', '🌟', '💫', '🎆'];
    
    for (let i = 0; i < count; i++) {
        // Random emoji
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
        
        // Create sparkle element
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        sparkle.textContent = emoji;
        document.body.appendChild(sparkle);
        
        // Calculate burst trajectory (360° radial distribution)
        const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.2;
        const distance = 150 + Math.random() * 100;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        
        // Position at maze center
        sparkle.style.left = centerX + 'px';
        sparkle.style.top = centerY + 'px';
        
        // Set animation variables
        sparkle.style.setProperty('--tx', tx + 'px');
        sparkle.style.setProperty('--ty', ty + 'px');
        
        // Vary animation duration for natural effect
        const duration = 0.8 + Math.random() * 0.4;
        sparkle.style.animationDuration = duration + 's';
        
        // Trigger animation
        sparkle.classList.add('animate');
        
        // Remove from DOM after animation completes
        setTimeout(() => {
            sparkle.remove();
        }, duration * 1000);
    }
}

/**
 * Hide the maze level
 */
function hideMazeLevel() {
    const mazeContainer = document.getElementById('maze-container');
    if (mazeContainer) {
        mazeContainer.classList.add('hidden');
    }
    
    // Remove fade from card grid
    elements.cardGrid.parentElement.classList.remove('fade-out');
}

/**
 * Reset maze state
 */
function resetMazeState() {
    stage1State.mazeActive = false;
    stage1State.maze = null;
    stage1State.mazePath = new Set();
    stage1State.mazeIsDrawing = false;
    
    // Clear maze grid
    const mazeGrid = document.getElementById('maze-grid');
    if (mazeGrid) {
        mazeGrid.innerHTML = '';
    }
    
    hideMazeLevel();
}

// ===== INITIALIZE GAME =====
// Start the game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}



// ===== LEVEL INTRO HANDLER =====
document.addEventListener("DOMContentLoaded", () => {
  const intro = document.getElementById("level-intro");
  const beginBtn = document.getElementById("begin-btn");
  const gameContainer = document.querySelector(".game-container");

  // Hide game initially
  gameContainer.style.display = "none";

  beginBtn.addEventListener("click", () => {
    // Fade out intro
    intro.style.transition = "opacity 0.6s ease";
    intro.style.opacity = "0";

    setTimeout(() => {
      intro.style.display = "none";

      // Show game
      gameContainer.style.display = "flex";

      // OPTIONAL: auto-start game
      if (typeof startGame === "function") {
        startGame();
      }
    }, 600);
  });
});
