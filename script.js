// Game configuration and state
const gameState = {
    board: [],
    boardSize: { rows: 9, cols: 9 },
    mineCount: 10,
    minesLeft: 10,
    firstClick: true,
    gameOver: false,
    gameWon: false,
    revealedCount: 0,
    timer: 0,
    timerInterval: null
};

// DOM elements
const elements = {
    gameBoard: document.getElementById('game-board'),
    mineCount: document.getElementById('mine-count'),
    timer: document.getElementById('timer'),
    newGameBtn: document.getElementById('new-game-btn'),
    difficultySelect: document.getElementById('difficulty-select'),
    gameMessage: document.getElementById('game-message')
};

// Difficulty settings
const difficulties = {
    beginner: { rows: 9, cols: 9, mines: 10 },
    intermediate: { rows: 16, cols: 16, mines: 40 },
    expert: { rows: 16, cols: 30, mines: 99 }
};

// Initialize the game
function initGame() {
    // Set up based on difficulty
    const difficulty = elements.difficultySelect.value;
    gameState.boardSize.rows = difficulties[difficulty].rows;
    gameState.boardSize.cols = difficulties[difficulty].cols;
    gameState.mineCount = difficulties[difficulty].mines;
    gameState.minesLeft = gameState.mineCount;
    
    // Reset game state
    gameState.board = [];
    gameState.firstClick = true;
    gameState.gameOver = false;
    gameState.gameWon = false;
    gameState.revealedCount = 0;
    
    // Reset timer
    clearInterval(gameState.timerInterval);
    gameState.timer = 0;
    elements.timer.textContent = '0';
    
    // Update mine count display
    elements.mineCount.textContent = gameState.minesLeft;
    
    // Hide any game message
    elements.gameMessage.classList.add('hidden');
    elements.gameMessage.classList.remove('win', 'lose');
    
    // Create empty board
    createEmptyBoard();
    
    // Render the board
    renderBoard();
}

// Create an empty board
function createEmptyBoard() {
    const { rows, cols } = gameState.boardSize;
    gameState.board = [];
    
    for (let i = 0; i < rows; i++) {
        const row = [];
        for (let j = 0; j < cols; j++) {
            row.push({
                row: i,
                col: j,
                isMine: false,
                isRevealed: false,
                isFlagged: false,
                neighborMines: 0
            });
        }
        gameState.board.push(row);
    }
}

// Place mines after first click
function placeMines(firstClickRow, firstClickCol) {
    const { rows, cols } = gameState.boardSize;
    const mineCount = gameState.mineCount;
    let minesPlaced = 0;
    
    while (minesPlaced < mineCount) {
        const row = Math.floor(Math.random() * rows);
        const col = Math.floor(Math.random() * cols);
        
        // Skip the first clicked cell and its neighbors
        if (Math.abs(row - firstClickRow) <= 1 && Math.abs(col - firstClickCol) <= 1) {
            continue;
        }
        
        // Skip if already a mine
        if (gameState.board[row][col].isMine) {
            continue;
        }
        
        // Place mine
        gameState.board[row][col].isMine = true;
        minesPlaced++;
    }
    
    // Calculate neighbor mine counts
    calculateNeighborMineCounts();
}

// Calculate neighbor mine counts for each cell
function calculateNeighborMineCounts() {
    const { rows, cols } = gameState.boardSize;
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            // Skip mines
            if (gameState.board[i][j].isMine) {
                continue;
            }
            
            // Check all 8 neighbors
            let count = 0;
            for (let di = -1; di <= 1; di++) {
                for (let dj = -1; dj <= 1; dj++) {
                    if (di === 0 && dj === 0) continue;
                    
                    const ni = i + di;
                    const nj = j + dj;
                    
                    // Skip out of bounds
                    if (ni < 0 || ni >= rows || nj < 0 || nj >= cols) {
                        continue;
                    }
                    
                    if (gameState.board[ni][nj].isMine) {
                        count++;
                    }
                }
            }
            
            gameState.board[i][j].neighborMines = count;
        }
    }
}

// Render the board on the page
function renderBoard() {
    const { rows, cols } = gameState.boardSize;
    elements.gameBoard.innerHTML = '';
    
    // Update grid layout based on board size
    elements.gameBoard.style.gridTemplateRows = `repeat(${rows}, 30px)`;
    elements.gameBoard.style.gridTemplateColumns = `repeat(${cols}, 30px)`;
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            
            // Add click handlers
            cell.addEventListener('click', handleCellClick);
            cell.addEventListener('contextmenu', handleCellRightClick);
            
            // Update cell appearance based on its state
            updateCellAppearance(cell, gameState.board[i][j]);
            
            elements.gameBoard.appendChild(cell);
        }
    }
}

// Update a cell's appearance
function updateCellAppearance(cellElement, cellData) {
    cellElement.className = 'cell';
    
    if (cellData.isRevealed) {
        cellElement.classList.add('revealed');
        
        if (cellData.isMine) {
            cellElement.classList.add('mine');
        } else if (cellData.neighborMines > 0) {
            cellElement.classList.add(`number-${cellData.neighborMines}`);
            cellElement.textContent = cellData.neighborMines;
        }
    } else if (cellData.isFlagged) {
        cellElement.classList.add('flagged');
    }
}

// Handle left click on a cell
function handleCellClick(event) {
    if (gameState.gameOver) return;
    
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    const cell = gameState.board[row][col];
    
    // Ignore if flagged
    if (cell.isFlagged) return;
    
    // First click setup
    if (gameState.firstClick) {
        gameState.firstClick = false;
        placeMines(row, col);
        startTimer();
    }
    
    // Reveal the cell
    revealCell(row, col);
    
    // Update the board visually
    renderBoard();
    
    // Check win condition
    checkWinCondition();
}

// Handle right click on a cell (flag)
function handleCellRightClick(event) {
    event.preventDefault();
    if (gameState.gameOver) return;
    
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    const cell = gameState.board[row][col];
    
    // Ignore if already revealed
    if (cell.isRevealed) return;
    
    // Toggle flag
    cell.isFlagged = !cell.isFlagged;
    
    // Update mine count display
    gameState.minesLeft += cell.isFlagged ? -1 : 1;
    elements.mineCount.textContent = gameState.minesLeft;
    
    // Update cell appearance
    updateCellAppearance(event.target, cell);
}

// Reveal a cell and potentially its neighbors
function revealCell(row, col) {
    const { rows, cols } = gameState.boardSize;
    const cell = gameState.board[row][col];
    
    // Skip if already revealed or flagged
    if (cell.isRevealed || cell.isFlagged) return;
    
    // Reveal the cell
    cell.isRevealed = true;
    gameState.revealedCount++;
    
    // If it's a mine, game over
    if (cell.isMine) {
        gameOver(false);
        return;
    }
    
    // If empty cell, reveal neighbors
    if (cell.neighborMines === 0) {
        for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
                if (di === 0 && dj === 0) continue;
                
                const ni = row + di;
                const nj = col + dj;
                
                // Skip out of bounds
                if (ni < 0 || ni >= rows || nj < 0 || nj >= cols) {
                    continue;
                }
                
                // Recursively reveal neighbors
                revealCell(ni, nj);
            }
        }
    }
}

// Check if the player has won
function checkWinCondition() {
    const { rows, cols } = gameState.boardSize;
    const totalCells = rows * cols;
    const nonMineCells = totalCells - gameState.mineCount;
    
    if (gameState.revealedCount === nonMineCells) {
        gameOver(true);
    }
}

// Game over handler
function gameOver(isWin) {
    gameState.gameOver = true;
    gameState.gameWon = isWin;
    clearInterval(gameState.timerInterval);
    
    // Reveal all mines
    if (!isWin) {
        revealAllMines();
    } else {
        // Flag all mines
        flagAllMines();
    }
    
    // Show game over message
    elements.gameMessage.classList.remove('hidden');
    if (isWin) {
        elements.gameMessage.classList.add('win');
        elements.gameMessage.textContent = 'You Win! 🎉';
    } else {
        elements.gameMessage.classList.add('lose');
        elements.gameMessage.textContent = 'Game Over! 💥';
    }
    
    // Redraw the board
    renderBoard();
}

// Reveal all mines on game over
function revealAllMines() {
    const { rows, cols } = gameState.boardSize;
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (gameState.board[i][j].isMine) {
                gameState.board[i][j].isRevealed = true;
            }
        }
    }
}

// Flag all mines on win
function flagAllMines() {
    const { rows, cols } = gameState.boardSize;
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (gameState.board[i][j].isMine) {
                gameState.board[i][j].isFlagged = true;
            }
        }
    }
    
    // Set mine count to 0
    gameState.minesLeft = 0;
    elements.mineCount.textContent = '0';
}

// Start the timer
function startTimer() {
    gameState.timerInterval = setInterval(() => {
        gameState.timer++;
        elements.timer.textContent = gameState.timer;
    }, 1000);
}

// Event listeners
elements.newGameBtn.addEventListener('click', initGame);
elements.difficultySelect.addEventListener('change', initGame);

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', initGame);
