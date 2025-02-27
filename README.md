# Minesweeper

A classic Minesweeper game implementation using vanilla JavaScript, HTML, and CSS.

## Description

This is a frontend implementation of the classic Minesweeper game. The objective is to clear a rectangular board containing hidden "mines" without detonating any of them, with help from clues about the number of neighboring mines in each field.

## Features

- Three difficulty levels: Beginner, Intermediate, and Expert
- Timer to track your game duration
- Mine counter to show remaining mines
- Right-click to flag suspected mines
- First-click protection (you'll never hit a mine on your first click)
- Responsive design that works on different screen sizes

## How to Play

1. Click "New Game" to start a new game
2. Select a difficulty level from the dropdown menu
3. Left-click a cell to reveal it
4. Right-click a cell to flag it as a potential mine
5. The numbers on revealed cells indicate how many mines are adjacent to that cell
6. Clear all non-mine cells to win the game

## Controls

- **Left Click**: Reveal a cell
- **Right Click**: Flag/unflag a cell
- **New Game Button**: Start a new game
- **Difficulty Selector**: Change the difficulty level

## Installation

No installation required! Simply open the `index.html` file in a web browser to play.

## Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript (No frameworks)

## Project Structure

- `index.html` - The main HTML document
- `styles.css` - CSS styles for the game
- `script.js` - JavaScript code for game logic
- `.gitignore` - Specifies files to exclude from version control

## License

This project is open source and available under the MIT License.
