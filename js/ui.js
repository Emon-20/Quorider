class QuoridorUI {
    constructor() {
        this.boardEl = document.getElementById('board');
        this.p1Card = document.getElementById('p1-card');
        this.p2Card = document.getElementById('p2-card');
        this.p1WallsEl = document.getElementById('p1-walls');
        this.p2WallsEl = document.getElementById('p2-walls');
        this.turnIndicator = document.getElementById('turn-indicator');
        this.modal = document.getElementById('modal-overlay');
        
        // Callbacks
        this.onMove = null;
        this.onWallPlace = null;
    }

    // Render the 17x17 grid (9x9 cells + wall slots)
    renderBoard(game) {
        this.boardEl.innerHTML = '';
        
        for (let gridR = 0; gridR < 17; gridR++) {
            for (let gridC = 0; gridC < 17; gridC++) {
                const isCellRow = gridR % 2 === 0;
                const isCellCol = gridC % 2 === 0;
                
                const el = document.createElement('div');
                
                // CSS Grid Placement (1-indexed)
                el.style.gridRow = `${gridR + 1} / ${gridR + 2}`;
                el.style.gridColumn = `${gridC + 1} / ${gridC + 2}`;

                if (isCellRow && isCellCol) {
                    // It's a playable cell
                    const r = gridR / 2;
                    const c = gridC / 2;
                    el.className = 'cell';
                    el.dataset.r = r;
                    el.dataset.c = c;
                    
                    el.addEventListener('click', () => {
                        if (this.onMove) this.onMove(r, c);
                    });
                } else if (isCellRow && !isCellCol) {
                    // Vertical wall slot (between two cells horizontally)
                    const r = gridR / 2;
                    const c = Math.floor(gridC / 2);
                    // Don't render wall slots on the very right edge for 8x8 intersections
                    if (c < 8 && r < 8) {
                        el.className = 'wall-slot-v';
                        // A vertical wall spans 2 rows of cells (so 3 grid rows: cell, gap, cell)
                        el.style.gridRow = `${gridR + 1} / ${gridR + 4}`;
                        el.addEventListener('click', () => {
                            if (this.onWallPlace) this.onWallPlace(r, c, 'V');
                        });
                    }
                } else if (!isCellRow && isCellCol) {
                    // Horizontal wall slot
                    const r = Math.floor(gridR / 2);
                    const c = gridC / 2;
                    if (r < 8 && c < 8) {
                        el.className = 'wall-slot-h';
                        el.style.gridColumn = `${gridC + 1} / ${gridC + 4}`;
                        el.addEventListener('click', () => {
                            if (this.onWallPlace) this.onWallPlace(r, c, 'H');
                        });
                    }
                } else {
                    // Intersection (no interaction)
                    el.className = 'wall-intersection';
                }
                
                this.boardEl.appendChild(el);
            }
        }
    }

    updateBoard(game) {
        // Clear all pawns, walls, and highlights
        document.querySelectorAll('.pawn, .wall-placed').forEach(e => e.remove());
        document.querySelectorAll('.cell').forEach(e => e.classList.remove('valid-move'));

        // Draw Walls
        game.walls.forEach(w => {
            const el = document.createElement('div');
            el.classList.add('wall-placed');
            const gridR = w.r * 2;
            const gridC = w.c * 2;
            
            if (w.o === 'H') {
                el.classList.add('wall-h');
                // Starts at row gap (gridR+1), spans columns (gridC to gridC+2) -> grid lines gridC+1 to gridC+4
                el.style.gridRow = `${gridR + 2} / ${gridR + 3}`;
                el.style.gridColumn = `${gridC + 1} / ${gridC + 4}`;
            } else {
                el.classList.add('wall-v');
                el.style.gridRow = `${gridR + 1} / ${gridR + 4}`;
                el.style.gridColumn = `${gridC + 2} / ${gridC + 3}`;
            }
            this.boardEl.appendChild(el);
        });

        // Draw Pawns
        const p1 = document.createElement('div');
        p1.className = 'pawn p1';
        p1.style.gridRow = `${game.players[1].r * 2 + 1} / ${game.players[1].r * 2 + 2}`;
        p1.style.gridColumn = `${game.players[1].c * 2 + 1} / ${game.players[1].c * 2 + 2}`;
        this.boardEl.appendChild(p1);

        const p2 = document.createElement('div');
        p2.className = 'pawn p2';
        p2.style.gridRow = `${game.players[2].r * 2 + 1} / ${game.players[2].r * 2 + 2}`;
        p2.style.gridColumn = `${game.players[2].c * 2 + 1} / ${game.players[2].c * 2 + 2}`;
        this.boardEl.appendChild(p2);

        // Highlight valid moves for current player
        if (!game.winner) {
            const validMoves = game.getValidMoves(game.turn);
            validMoves.forEach(m => {
                const cell = this.boardEl.querySelector(`.cell[data-r="${m.r}"][data-c="${m.c}"]`);
                if (cell) cell.classList.add('valid-move');
            });
        }

        // Update UI info
        this.p1WallsEl.innerText = game.players[1].walls;
        this.p2WallsEl.innerText = game.players[2].walls;

        this.p1Card.classList.toggle('active-turn', game.turn === 1);
        this.p2Card.classList.toggle('active-turn', game.turn === 2);
        
        this.turnIndicator.innerText = `Player ${game.turn}'s Turn`;
        this.turnIndicator.className = `turn-indicator turn-p${game.turn}`;
    }

    showWinModal(winner, score, maxScore) {
        document.getElementById('modal-title').innerText = `Player ${winner} Wins!`;
        document.getElementById('modal-title').style.color = winner === 1 ? 'var(--p1-color)' : 'var(--p2-color)';
        
        document.getElementById('modal-score').innerText = `Score: ${score}`;
        
        // Calculate stars
        const ratio = score / maxScore;
        let stars = 1;
        if (ratio > 0.6) stars = 2;
        if (ratio > 0.85) stars = 3;

        const starSpans = document.querySelectorAll('#modal-stars span');
        starSpans.forEach((s, i) => {
            if (i < stars) s.classList.add('active');
            else s.classList.remove('active');
        });

        this.modal.classList.remove('hidden');
    }

    hideModal() {
        this.modal.classList.add('hidden');
    }
}
