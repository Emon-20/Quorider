document.addEventListener('DOMContentLoaded', () => {
    // State
    let currentMode = 'computer'; // 'computer' or 'friend'
    let currentLevelIndex = 0;
    let game = null;
    let ui = new QuoridorUI();
    let ai = null;
    let isAiThinking = false;

    // Load progress from localStorage
    let progress = JSON.parse(localStorage.getItem('quoridorProgress')) || {
        computer: 1, // Max unlocked level
        scores: {}
    };

    function saveProgress() {
        localStorage.setItem('quoridorProgress', JSON.stringify(progress));
    }

    // Screens
    const screenMenu = document.getElementById('screen-menu');
    const screenLevels = document.getElementById('screen-levels');
    const screenGame = document.getElementById('screen-game');

    function showScreen(screen) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        screen.classList.add('active');
    }

    // Event Listeners: Main Menu
    document.getElementById('btn-vs-computer').addEventListener('click', () => {
        currentMode = 'computer';
        renderLevelSelect();
        showScreen(screenLevels);
    });

    document.getElementById('btn-vs-friend').addEventListener('click', () => {
        currentMode = 'friend';
        renderLevelSelect();
        showScreen(screenLevels);
    });

    // Event Listeners: Level Select
    document.querySelector('#screen-levels .btn-back').addEventListener('click', () => {
        showScreen(screenMenu);
    });

    function renderLevelSelect() {
        const title = currentMode === 'computer' ? 'VS Computer' : 'VS Friend';
        document.getElementById('levels-title').innerText = title;
        
        const grid = document.getElementById('levels-grid');
        grid.innerHTML = '';

        Levels[currentMode].forEach((level, index) => {
            const isLocked = currentMode === 'computer' && level.level > progress.computer;
            
            const card = document.createElement('div');
            card.className = `level-card glass-panel ${isLocked ? 'locked' : ''}`;
            
            const score = progress.scores[level.id] || 0;
            const scoreText = score > 0 ? `Score: ${score}` : 'Not completed';

            card.innerHTML = `
                <h3>Level ${level.level}: ${level.title}</h3>
                <p>${level.description}</p>
                <div class="level-meta">
                    <span>${isLocked ? '🔒 Locked' : '✅ Unlocked'}</span>
                    <span>${isLocked ? '' : scoreText}</span>
                </div>
            `;

            if (!isLocked) {
                card.addEventListener('click', () => {
                    startGame(index);
                });
            }

            grid.appendChild(card);
        });
    }

    // Event Listeners: Game Screen
    document.getElementById('btn-quit-game').addEventListener('click', () => {
        game = null;
        renderLevelSelect();
        showScreen(screenLevels);
    });

    document.getElementById('btn-restart').addEventListener('click', () => {
        startGame(currentLevelIndex);
    });

    document.getElementById('btn-modal-menu').addEventListener('click', () => {
        ui.hideModal();
        renderLevelSelect();
        showScreen(screenLevels);
    });

    document.getElementById('btn-modal-next').addEventListener('click', () => {
        ui.hideModal();
        if (currentLevelIndex + 1 < Levels[currentMode].length) {
            startGame(currentLevelIndex + 1);
        } else {
            // Finished all levels
            showScreen(screenMenu);
        }
    });

    // Core Game Loop Flow
    function startGame(levelIndex) {
        currentLevelIndex = levelIndex;
        const levelConfig = Levels[currentMode][levelIndex];

        // Init Game
        game = new QuoridorGame(levelConfig.p1Walls, levelConfig.p2Walls);
        
        // Init AI
        if (currentMode === 'computer') {
            ai = new QuoridorAI(levelConfig.aiDifficulty);
            document.getElementById('p2-name').innerText = `Computer (${levelConfig.aiDifficulty})`;
        } else {
            ai = null;
            document.getElementById('p2-name').innerText = 'Player 2';
        }

        ui.hideModal();
        showScreen(screenGame);
        
        // Setup UI callbacks
        ui.onMove = handleMove;
        ui.onWallPlace = handleWallPlace;
        
        ui.renderBoard(game);
        ui.updateBoard(game);
        
        isAiThinking = false;
    }

    function checkWin() {
        if (game.winner) {
            handleWin(game.winner);
            return true;
        }
        return false;
    }

    function triggerAiTurn() {
        if (game.turn === 2 && ai && !game.winner && !isAiThinking) {
            isAiThinking = true;
            ai.makeMove(game).then(move => {
                if (move.type === 'move') {
                    game.movePawn(move.r, move.c);
                } else if (move.type === 'wall') {
                    game.placeWall(move.r, move.c, move.o);
                }
                isAiThinking = false;
                ui.updateBoard(game);
                checkWin();
            });
        }
    }

    function handleMove(r, c) {
        if (isAiThinking || game.winner) return;
        
        if (game.movePawn(r, c)) {
            ui.updateBoard(game);
            if (!checkWin()) {
                triggerAiTurn();
            }
        }
    }

    function handleWallPlace(r, c, o) {
        if (isAiThinking || game.winner) return;
        
        if (game.placeWall(r, c, o)) {
            ui.updateBoard(game);
            if (!checkWin()) {
                triggerAiTurn();
            }
        }
    }

    function handleWin(winner) {
        const levelConfig = Levels[currentMode][currentLevelIndex];
        
        // Calculate Score
        // Base points + bonus for walls + bonus for fewer moves
        const baseScore = 1000;
        const wallsBonus = game.players[winner].walls * 50;
        const movesPenalty = game.movesCount * 10;
        
        let score = Math.max(0, baseScore + wallsBonus - movesPenalty);
        let maxScore = baseScore + (levelConfig.p1Walls * 50); // Rough theoretical max

        // Update progress
        if (winner === 1) { // Player 1 (human) wins
            // Save score
            const oldScore = progress.scores[levelConfig.id] || 0;
            if (score > oldScore) {
                progress.scores[levelConfig.id] = score;
            }
            
            // Unlock next level for computer mode
            if (currentMode === 'computer' && levelConfig.level === progress.computer) {
                progress.computer++;
            }
            saveProgress();
            
            ui.showWinModal(winner, score, maxScore);
        } else {
            // AI or Player 2 wins
            if (currentMode === 'computer') {
                document.getElementById('modal-title').innerText = "Computer Wins!";
                document.getElementById('modal-title').style.color = 'var(--p2-color)';
                document.getElementById('modal-score').innerText = "Try Again!";
                document.querySelectorAll('#modal-stars span').forEach(s => s.classList.remove('active'));
                ui.modal.classList.remove('hidden');
            } else {
                ui.showWinModal(winner, score, maxScore);
            }
        }
    }
});
