// Game state variables
let gameBoard = [];
let boardSize = { rows: 9, cols: 9 };
let totalMines = 10;
let minesLeft = totalMines;
let timeElapsed = 0;
let timer = null;
let isGameOver = false;
let isFirstClick = true;
let revealedCells = 0;
let hasShownInstructions = false;

// DOM Elements
const gameBoardElement = document.getElementById('game-board');
const difficultySelect = document.getElementById('difficulty');
const newGameButton = document.getElementById('new-game-btn');
const mineCountElement = document.getElementById('mine-count');
const timerElement = document.getElementById('timer');
const gameMessageElement = document.getElementById('game-message');

// Show game instructions
function showInstructions() {
    if (hasShownInstructions) return;
    
    const instructionsModal = document.createElement('div');
    instructionsModal.className = 'instructions-modal';
    instructionsModal.innerHTML = `
        <div class="instructions-content">
            <h2>How to Play Minesweeper</h2>
            <ul>
                <li>Left-click to reveal a cell</li>
                <li>Right-click to place a flag on a suspected mine</li>
                <li>Numbers show how many mines are adjacent to that cell</li>
                <li>Reveal all non-mine cells to win</li>
            </ul>
            <button id="close-instructions">Start Playing</button>
        </div>
    `;
    
    document.body.appendChild(instructionsModal);
    
    // Add style for the modal
    const style = document.createElement('style');
    style.textContent = `
        .instructions-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        .instructions-content {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            max-width: 500px;
            width: 80%;
        }
        .instructions-content h2 {
            margin-top: 0;
        }
        .instructions-content ul {
            text-align: left;
            line-height: 1.6;
        }
        #close-instructions {
            padding: 8px 16px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            margin-top: 15px;
        }
        #close-instructions:hover {
            background-color: #0056b3;
        }
    `;
    document.head.appendChild(style);
    
    // Close button event
    document.getElementById('close-instructions').addEventListener('click', () => {
        instructionsModal.remove();
        hasShownInstructions = true;
    });
}

// Initialize the game
function initGame() {
    // Clear any existing game
    clearInterval(timer);
    timeElapsed = 0;
    timerElement.textContent = 'Time: 0';
    isGameOver = false;
    isFirstClick = true;
    revealedCells = 0;
    gameMessageElement.textContent = '';
    
    // Set difficulty level
    const difficulty = difficultySelect.value;
    switch (difficulty) {
        case 'beginner':
            boardSize = { rows: 9, cols: 9 };
            totalMines = 10;
            break;
        case 'intermediate':
            boardSize = { rows: 16, cols: 16 };
            totalMines = 40;
            break;
        case 'expert':
            boardSize = { rows: 16, cols: 30 };
            totalMines = 99;
            break;
    }
    
    minesLeft = totalMines;
    mineCountElement.textContent = `Mines: ${minesLeft}`;
    
    // Initialize empty board
    gameBoard = Array(boardSize.rows).fill().map(() => 
        Array(boardSize.cols).fill().map(() => ({
            isMine: false,
            isRevealed: false,
            isFlagged: false,
            neighborMines: 0
        }))
    );
    
    // Render the board
    renderBoard();
}

// Render the game board
function renderBoard() {
    // Clear existing board
    gameBoardElement.innerHTML = '';
    
    // Update grid template columns
    gameBoardElement.style.gridTemplateColumns = `repeat(${boardSize.cols}, 1fr)`;
    
    // Create cells
    for (let row = 0; row < boardSize.rows; row++) {
        for (let col = 0; col < boardSize.cols; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            // Add event listeners
            cell.addEventListener('click', handleCellClick);
            cell.addEventListener('contextmenu', handleCellRightClick);
            
            // Add cell to the game board
            gameBoardElement.appendChild(cell);
            
            // Update cell display based on its state
            updateCellDisplay(cell, gameBoard[row][col]);
        }
    }
}

// Place mines randomly (avoiding the first clicked cell)
function placeMines(firstRow, firstCol) {
    let minesPlaced = 0;
    
    while (minesPlaced < totalMines) {
        const row = Math.floor(Math.random() * boardSize.rows);
        const col = Math.floor(Math.random() * boardSize.cols);
        
        // Don't place a mine on the first clicked cell or cells already with mines
        if ((row !== firstRow || col !== firstCol) && !gameBoard[row][col].isMine) {
            gameBoard[row][col].isMine = true;
            minesPlaced++;
        }
    }
    
    // Calculate neighbor mine counts for each cell
    calculateNeighborMines();
}

// Calculate the number of adjacent mines for each cell
function calculateNeighborMines() {
    for (let row = 0; row < boardSize.rows; row++) {
        for (let col = 0; col < boardSize.cols; col++) {
            if (!gameBoard[row][col].isMine) {
                gameBoard[row][col].neighborMines = countAdjacentMines(row, col);
            }
        }
    }
}

// Count adjacent mines for a specific cell
function countAdjacentMines(row, col) {
    let count = 0;
    
    // Check all 8 adjacent cells
    for (let r = Math.max(0, row - 1); r <= Math.min(row + 1, boardSize.rows - 1); r++) {
        for (let c = Math.max(0, col - 1); c <= Math.min(col + 1, boardSize.cols - 1); c++) {
            if (r !== row || c !== col) {
                if (gameBoard[r][c].isMine) {
                    count++;
                }
            }
        }
    }
    
    return count;
}

// Handle cell click
function handleCellClick(event) {
    if (isGameOver) return;
    
    const cell = event.target;
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    
    // Ignore click if cell is flagged
    if (gameBoard[row][col].isFlagged) return;
    
    // First click should never be a mine
    if (isFirstClick) {
        isFirstClick = false;
        placeMines(row, col);
        startTimer();
    }
    
    // Reveal the cell
    revealCell(row, col);
    
    // Check if game is won
    checkWinCondition();
}

// Handle right-click (flag placement)
function handleCellRightClick(event) {
    event.preventDefault();
    
    if (isGameOver) return;
    
    const cell = event.target;
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    
    // Toggle flag only if cell is not revealed
    if (!gameBoard[row][col].isRevealed) {
        gameBoard[row][col].isFlagged = !gameBoard[row][col].isFlagged;
        
        // Update mine count
        if (gameBoard[row][col].isFlagged) {
            minesLeft--;
        } else {
            minesLeft++;
        }
        
        mineCountElement.textContent = `Mines: ${minesLeft}`;
        
        // Update cell display
        updateCellDisplay(cell, gameBoard[row][col]);
    }
}

// Reveal a cell and handle chain reactions
function revealCell(row, col) {
    const cell = gameBoard[row][col];
    
    // Skip if already revealed or flagged
    if (cell.isRevealed || cell.isFlagged) return;
    
    // Reveal the cell
    cell.isRevealed = true;
    revealedCells++;
    
    // Update the DOM
    const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    updateCellDisplay(cellElement, cell);
    
    // Handle game over if it's a mine
    if (cell.isMine) {
        endGame(false);
        return;
    }
    
    // If the cell has no adjacent mines, reveal adjacent cells
    if (cell.neighborMines === 0) {
        for (let r = Math.max(0, row - 1); r <= Math.min(row + 1, boardSize.rows - 1); r++) {
            for (let c = Math.max(0, col - 1); c <= Math.min(col + 1, boardSize.cols - 1); c++) {
                if (r !== row || c !== col) {
                    revealCell(r, c);
                }
            }
        }
    }
}

// Update cell's visual appearance based on its state
function updateCellDisplay(cellElement, cellData) {
    cellElement.className = 'cell';
    cellElement.textContent = '';
    
    if (cellData.isRevealed) {
        cellElement.classList.add('revealed');
        
        if (cellData.isMine) {
            cellElement.classList.add('mine');
            cellElement.textContent = '💣';
        } else if (cellData.neighborMines > 0) {
            cellElement.textContent = cellData.neighborMines;
            cellElement.dataset.value = cellData.neighborMines;
        }
    } else if (cellData.isFlagged) {
        cellElement.classList.add('flagged');
        cellElement.textContent = '🚩';
    }
}

// Check if the player has won
function checkWinCondition() {
    // Win condition: all non-mine cells are revealed
    const totalCells = boardSize.rows * boardSize.cols;
    if (revealedCells === totalCells - totalMines) {
        endGame(true);
    }
}

// Start the timer
function startTimer() {
    timer = setInterval(() => {
        timeElapsed++;
        timerElement.textContent = `Time: ${timeElapsed}`;
    }, 1000);
}

// End the game
function endGame(isWin) {
    isGameOver = true;
    clearInterval(timer);
    
    if (isWin) {
        gameMessageElement.textContent = 'You Win! 🎉';
        gameMessageElement.style.color = 'green';
        
        // Flag all mines
        for (let row = 0; row < boardSize.rows; row++) {
            for (let col = 0; col < boardSize.cols; col++) {
                if (gameBoard[row][col].isMine && !gameBoard[row][col].isFlagged) {
                    gameBoard[row][col].isFlagged = true;
                    const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                    updateCellDisplay(cellElement, gameBoard[row][col]);
                }
            }
        }
        
        minesLeft = 0;
        mineCountElement.textContent = `Mines: ${minesLeft}`;
    } else {
        gameMessageElement.textContent = 'Game Over! 💥';
        gameMessageElement.style.color = 'red';
        
        // Reveal all mines
        for (let row = 0; row < boardSize.rows; row++) {
            for (let col = 0; col < boardSize.cols; col++) {
                if (gameBoard[row][col].isMine && !gameBoard[row][col].isRevealed) {
                    gameBoard[row][col].isRevealed = true;
                    const cellElement = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                    updateCellDisplay(cellElement, gameBoard[row][col]);
                }
            }
        }
    }
}

// Restart the game with keyboard shortcut (R key)
function handleKeyboardShortcuts(event) {
    // If 'r' or 'R' is pressed, restart the game
    if (event.key === 'r' || event.key === 'R') {
        initGame();
    }
}

// Event listeners
newGameButton.addEventListener('click', initGame);
difficultySelect.addEventListener('change', initGame);
document.addEventListener('keydown', handleKeyboardShortcuts);

// Initialize the game on load
window.addEventListener('load', () => {
    initGame();
    // Show instructions after a short delay
    setTimeout(showInstructions, 500);
});
