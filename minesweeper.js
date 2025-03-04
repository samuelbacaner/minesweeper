// Game variables
let board = [];
let mineLocations = [];
let rows = 9;
let cols = 9;
let totalMines = 10;
let revealedCells = 0;
let flaggedCells = 0;
let gameOver = false;
let timerInterval;
let timeElapsed = 0;
let firstClick = true;

// DOM elements
const gameBoard = document.getElementById('game-board');
const difficultySelector = document.getElementById('difficulty');
const newGameBtn = document.getElementById('new-game-btn');
const minesCount = document.getElementById('mines-count');
const timerElement = document.getElementById('timer');
const gameStatus = document.getElementById('game-status');
const gameFace = document.getElementById('game-face');

// Initialize the game
function initGame() {
    // Reset game variables
    board = [];
    mineLocations = [];
    revealedCells = 0;
    flaggedCells = 0;
    gameOver = false;
    firstClick = true;
    gameStatus.textContent = '';
    
    // Reset game face
    gameFace.textContent = '😊';
    
    // Reset timer
    clearInterval(timerInterval);
    timeElapsed = 0;
    timerElement.textContent = '0';
    
    // Set difficulty
    setDifficulty();
    
    // Update mines counter
    minesCount.textContent = totalMines;
    
    // Create the board
    createBoard();
}

// Set difficulty based on selection
function setDifficulty() {
    const difficulty = difficultySelector.value;
    
    switch(difficulty) {
        case 'beginner':
            rows = 9;
            cols = 9;
            totalMines = 10;
            break;
        case 'intermediate':
            rows = 16;
            cols = 16;
            totalMines = 40;
            break;
        case 'expert':
            rows = 16;
            cols = 30;
            totalMines = 99;
            break;
    }
}

// Create the game board
function createBoard() {
    // Clear the game board
    gameBoard.innerHTML = '';
    
    // Set the grid template
    gameBoard.style.gridTemplateColumns = `repeat(${cols}, 30px)`;
    
    // Initialize the board array
    for (let i = 0; i < rows; i++) {
        board[i] = [];
        for (let j = 0; j < cols; j++) {
            board[i][j] = {
                revealed: false,
                isMine: false,
                flagged: false,
                adjacentMines: 0
            };
            
            // Create cell element
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = i;
            cell.dataset.col = j;
            
            // Add event listeners
            cell.addEventListener('click', handleCellClick);
            cell.addEventListener('contextmenu', handleRightClick);
            
            gameBoard.appendChild(cell);
        }
    }
}

// Place mines on the board (avoiding first click)
function placeMines(firstRow, firstCol) {
    let minesPlaced = 0;
    
    while (minesPlaced < totalMines) {
        const randomRow = Math.floor(Math.random() * rows);
        const randomCol = Math.floor(Math.random() * cols);
        
        // Avoid placing mine on first click or where a mine already exists
        if ((randomRow !== firstRow || randomCol !== firstCol) && !board[randomRow][randomCol].isMine) {
            board[randomRow][randomCol].isMine = true;
            mineLocations.push({ row: randomRow, col: randomCol });
            minesPlaced++;
        }
    }
    
    // Calculate adjacent mines for each cell
    calculateAdjacentMines();
}

// Calculate the number of adjacent mines for each cell
function calculateAdjacentMines() {
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (board[i][j].isMine) continue;
            
            // Check all 8 surrounding cells
            for (let di = -1; di <= 1; di++) {
                for (let dj = -1; dj <= 1; dj++) {
                    if (di === 0 && dj === 0) continue;
                    
                    const ni = i + di;
                    const nj = j + dj;
                    
                    if (ni >= 0 && ni < rows && nj >= 0 && nj < cols && board[ni][nj].isMine) {
                        board[i][j].adjacentMines++;
                    }
                }
            }
        }
    }
}

// Handle left click on a cell
function handleCellClick(e) {
    if (gameOver) return;
    
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    
    // Ignore click if cell is flagged
    if (board[row][col].flagged) return;
    
    // First click should never be a mine
    if (firstClick) {
        firstClick = false;
        placeMines(row, col);
        startTimer();
    }
    
    revealCell(row, col);
}

// Handle right click on a cell
function handleRightClick(e) {
    e.preventDefault();  // Prevent context menu from appearing
    
    if (gameOver) return;
    
    const row = parseInt(e.target.dataset.row);
    const col = parseInt(e.target.dataset.col);
    
    // Ignore if cell is already revealed
    if (board[row][col].revealed) return;
    
    // Toggle flag
    board[row][col].flagged = !board[row][col].flagged;
    
    // Update UI
    const cell = getCellElement(row, col);
    cell.classList.toggle('flagged');
    
    // Update flag counter
    flaggedCells = board[row][col].flagged ? flaggedCells + 1 : flaggedCells - 1;
    minesCount.textContent = totalMines - flaggedCells;
}

// Reveal a cell
function revealCell(row, col) {
    // Ignore if already revealed or flagged
    if (board[row][col].revealed || board[row][col].flagged) return;
    
    // Mark as revealed
    board[row][col].revealed = true;
    revealedCells++;
    
    // Update UI
    const cell = getCellElement(row, col);
    cell.classList.add('revealed');
    
    // Check if it's a mine
    if (board[row][col].isMine) {
        gameOver = true;
        cell.classList.add('mine');
        cell.innerHTML = '💣';
        endGame(false);
        return;
    }
    
    // Display number of adjacent mines
    if (board[row][col].adjacentMines > 0) {
        cell.textContent = board[row][col].adjacentMines;
        cell.classList.add(`num-${board[row][col].adjacentMines}`);
    } else {
        // If no adjacent mines, reveal surrounding cells
        for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
                if (di === 0 && dj === 0) continue;
                
                const ni = row + di;
                const nj = col + dj;
                
                if (ni >= 0 && ni < rows && nj >= 0 && nj < cols) {
                    revealCell(ni, nj);
                }
            }
        }
    }
    
    // Check for win
    checkWin();
}

// Check if the player has won
function checkWin() {
    const totalCells = rows * cols;
    if (revealedCells === totalCells - totalMines) {
        endGame(true);
    }
}

// End the game
function endGame(isWin) {
    gameOver = true;
    clearInterval(timerInterval);
    
    if (isWin) {
        gameStatus.textContent = 'You Win! 🎉';
        gameStatus.style.color = 'green';
        gameFace.textContent = '😎'; // Cool face for winning
        
        // Flag all mines
        mineLocations.forEach(loc => {
            if (!board[loc.row][loc.col].flagged) {
                board[loc.row][loc.col].flagged = true;
                const cell = getCellElement(loc.row, loc.col);
                cell.classList.add('flagged');
            }
        });
    } else {
        gameStatus.textContent = 'Game Over! 💥';
        gameStatus.style.color = 'red';
        gameFace.textContent = '😵'; // Dead face for losing
        
        // Reveal all mines
        mineLocations.forEach(loc => {
            if (!board[loc.row][loc.col].revealed) {
                const cell = getCellElement(loc.row, loc.col);
                cell.classList.add('revealed');
                cell.classList.add('mine');
                cell.innerHTML = '💣';
            }
        });
    }
}

// Get the DOM element for a cell
function getCellElement(row, col) {
    return document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
}

// Start the timer
function startTimer() {
    timerInterval = setInterval(() => {
        timeElapsed++;
        timerElement.textContent = timeElapsed;
    }, 1000);
}

// Add event listeners for mouse interactions with the board
gameBoard.addEventListener('mousedown', () => {
    if (!gameOver) {
        gameFace.textContent = '😮'; // Surprised face when clicking
    }
});

gameBoard.addEventListener('mouseup', () => {
    if (!gameOver) {
        gameFace.textContent = '😊'; // Return to normal face after click
    }
});

// Mouse leave event to reset face if mouse leaves the board while pressed
gameBoard.addEventListener('mouseleave', () => {
    if (!gameOver) {
        gameFace.textContent = '😊';
    }
});

// Add event listeners for game controls
newGameBtn.addEventListener('click', initGame);
gameFace.addEventListener('click', initGame); // Game face also acts as new game button

// Help modal functionality
const helpBtn = document.getElementById('help-btn');
const helpModal = document.getElementById('help-modal');
const closeBtn = document.querySelector('.close-btn');

// Open modal when help button is clicked
helpBtn.addEventListener('click', () => {
    helpModal.style.display = 'block';
});

// Close modal when close button is clicked
closeBtn.addEventListener('click', () => {
    helpModal.style.display = 'none';
});

// Close modal if clicked outside the modal content
window.addEventListener('click', (e) => {
    if (e.target === helpModal) {
        helpModal.style.display = 'none';
    }
});

// Close modal if ESC key is pressed
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && helpModal.style.display === 'block') {
        helpModal.style.display = 'none';
    }
});

// Initialize the game on page load
window.addEventListener('load', initGame);
