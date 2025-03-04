# Minesweeper Game

A classic Minesweeper game built with HTML, CSS, and vanilla JavaScript.

## Features

- Three difficulty levels:
  - Beginner: 9x9 grid with 10 mines
  - Intermediate: 16x16 grid with 40 mines
  - Expert: 16x30 grid with 99 mines
- Interactive game interface:
  - Emoji face showing game status (changes with actions)
  - Timer to track your game duration
  - Mine counter to show remaining mines
- Gameplay enhancements:
  - First-click safety (first click is never a mine)
  - Flag animation when marking potential mines
  - Cell reveal animations for a polished experience
  - Mine explosion animation when a mine is hit
- Help modal with game instructions and rules
- Fully responsive design that works on mobile and desktop

## How to Play

1. Clone or download this repository
2. Open `index.html` in your web browser
3. Select your preferred difficulty level
4. Click "New Game" to start
5. Left-click to reveal a cell
6. Right-click to flag a potential mine
7. Clear all non-mine cells to win!

## Game Rules

- The goal is to uncover all cells that don't contain mines
- The number in a revealed cell indicates how many mines are adjacent to it
- Use these numbers to deduce which cells contain mines
- Flag suspected mine locations with a right-click
- If you reveal a mine, the game is over

## Files

- `index.html` - The game structure
- `styles.css` - Styling for the game
- `minesweeper.js` - Game logic and functionality

## Future Improvements

Potential enhancements for the future:
- High score tracking with local storage
- Custom difficulty settings (adjustable board size and mine count)
- Multiple themes (dark mode, classic look, colorful version)
- Sound effects for game actions
- Accessibility improvements (keyboard controls, screen reader support)
- Save/resume game functionality
- Hint system for beginners
- First move strategy tips
