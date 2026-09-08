# Quoridor Web Game

A professional-grade, browser-based implementation of the classic strategy board game **Quoridor**. Built entirely with vanilla HTML, CSS, and JavaScript—no frameworks or external dependencies required.

## Features

- **Two Game Modes**:
  - **VS Computer**: Play against an AI with 5 progressive difficulty levels.
  - **VS Friend**: Local multiplayer with 5 unique rule variants (e.g., Speed Run, Fortress).
- **Intelligent AI Engine**: 
  - **Easy**: Moves towards the goal and occasionally places random walls.
  - **Medium**: Actively paths towards its goal and attempts to block you if you get too close.
  - **Hard**: Uses a minimax-style evaluation to look ahead, balancing its own shortest path against the optimal wall placements to trap you.
- **Robust Pathfinding**: The game engine uses Breadth-First Search (BFS) to strictly enforce the most critical rule of Quoridor: *A wall placement can never completely trap a player. There must always be at least one valid path to the goal.*
- **Premium UI/UX**:
  - Dynamic glassmorphism design.
  - CSS Grid-based board rendering (17x17 logical grid for pawns and interstitial walls).
  - Smooth animations for movement, hover previews for walls, and animated particle backgrounds.
  - Fully responsive layout for desktop, tablet, and mobile.

## How to Play

1. **Start the Game**: Simply open `index.html` in any modern web browser.
2. **The Goal**: Be the first player to move your pawn to the opposite edge of the board.
3. **Your Turn**: On your turn, you can do one of two things:
   - **Move your pawn**: Click on any highlighted adjacent cell. (You can jump over your opponent if you are face-to-face).
   - **Place a wall**: Hover over the gaps between the cells and click to place a wall. Walls block movement for both players.
4. **Progression**: Winning levels against the computer unlocks the next difficulty tier. Your progress is saved automatically in your browser's local storage.

## File Structure

```
d:\projects\Quorider\
├── index.html          # Main entry point + all UI markup
├── css/
│   ├── styles.css      # Core layout, grid logic, theming, and animations
│   └── responsive.css  # Media queries for mobile/tablet scaling
├── js/
│   ├── app.js          # App state, menu navigation, and game loop
│   ├── game.js         # Core engine (Board, Pawns, Walls, BFS validation)
│   ├── ai.js           # AI logic (Easy, Medium, Hard evaluators)
│   ├── levels.js       # Configuration for all 10 levels across both modes
│   └── ui.js           # DOM manipulation and grid rendering
└── README.md           # This file
```

## Technologies Used

- **HTML5**
- **CSS3** (CSS Grid, Flexbox, Keyframe Animations, Custom Properties)
- **Vanilla JavaScript** (ES6+, DOM Manipulation, Graph Algorithms)
