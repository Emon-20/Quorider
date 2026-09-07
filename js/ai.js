class QuoridorAI {
    constructor(difficulty) {
        this.difficulty = difficulty; // 'easy', 'medium', 'hard'
    }

    makeMove(game) {
        return new Promise(resolve => {
            // Add a slight delay so it feels like it's "thinking"
            setTimeout(() => {
                const move = this.calculateMove(game);
                resolve(move);
            }, 500);
        });
    }

    calculateMove(game) {
        if (this.difficulty === 'easy') {
            return this.easyMove(game);
        } else if (this.difficulty === 'medium') {
            return this.mediumMove(game);
        } else {
            return this.hardMove(game);
        }
    }

    // EASY: 70% move towards goal (BFS), 30% place random wall
    easyMove(game) {
        const aiPlayer = 2;
        const validMoves = game.getValidMoves(aiPlayer);
        const myPath = this.getBestPathMove(game, aiPlayer);

        if (game.players[aiPlayer].walls > 0 && Math.random() < 0.3) {
            // Try to place a random wall
            const wall = this.getRandomValidWall(game);
            if (wall) return { type: 'wall', ...wall };
        }

        // Otherwise move along path
        if (myPath) return { type: 'move', r: myPath.r, c: myPath.c };
        
        // Fallback random move
        const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
        return { type: 'move', r: randomMove.r, c: randomMove.c };
    }

    // MEDIUM: Move along shortest path. If opponent is closer to goal, try to block them.
    mediumMove(game) {
        const aiPlayer = 2;
        const oppPlayer = 1;
        
        const myDist = game.getShortestPathLength(game.players[aiPlayer].r, game.players[aiPlayer].c, game.players[aiPlayer].goalRow);
        const oppDist = game.getShortestPathLength(game.players[oppPlayer].r, game.players[oppPlayer].c, game.players[oppPlayer].goalRow);

        // If opponent is winning or we just want to be annoying (and we have walls)
        if (game.players[aiPlayer].walls > 0 && (oppDist <= myDist || Math.random() < 0.4)) {
            // Try to find a wall that increases opponent's path
            const blockingWall = this.getBestBlockingWall(game, oppPlayer, oppDist);
            if (blockingWall) {
                return { type: 'wall', ...blockingWall };
            }
        }

        const myPath = this.getBestPathMove(game, aiPlayer);
        return { type: 'move', r: myPath.r, c: myPath.c };
    }

    // HARD: Evaluates moves and walls. Scores = oppDist - myDist. Pick max.
    hardMove(game) {
        const aiPlayer = 2;
        const oppPlayer = 1;
        
        let bestScore = -Infinity;
        let bestMove = null;

        const currentOppDist = game.getShortestPathLength(game.players[oppPlayer].r, game.players[oppPlayer].c, game.players[oppPlayer].goalRow);
        
        // 1. Evaluate Pawn Moves
        const validMoves = game.getValidMoves(aiPlayer);
        for (const m of validMoves) {
            // Simulate move
            const prevR = game.players[aiPlayer].r;
            const prevC = game.players[aiPlayer].c;
            game.players[aiPlayer].r = m.r;
            game.players[aiPlayer].c = m.c;
            
            const myDist = game.getShortestPathLength(game.players[aiPlayer].r, game.players[aiPlayer].c, game.players[aiPlayer].goalRow);
            
            // Score = opponent distance - my distance
            const score = currentOppDist - myDist;
            if (score > bestScore) {
                bestScore = score;
                bestMove = { type: 'move', r: m.r, c: m.c };
            }
            
            // Revert
            game.players[aiPlayer].r = prevR;
            game.players[aiPlayer].c = prevC;
        }

        // 2. Evaluate Wall Placements (if we have walls and opp is somewhat close)
        if (game.players[aiPlayer].walls > 0 && currentOppDist < 8) {
            // To save time, only try placing walls near the opponent
            const oppR = game.players[oppPlayer].r;
            const oppC = game.players[oppPlayer].c;
            
            for (let dr = -2; dr <= 2; dr++) {
                for (let dc = -2; dc <= 2; dc++) {
                    const r = oppR + dr;
                    const c = oppC + dc;
                    if (r >= 0 && r < 8 && c >= 0 && c < 8) {
                        for (const o of ['H', 'V']) {
                            if (game.canPlaceWall(r, c, o)) {
                                game.walls.push({ r, c, o });
                                const newOppDist = game.getShortestPathLength(game.players[oppPlayer].r, game.players[oppPlayer].c, game.players[oppPlayer].goalRow);
                                const newMyDist = game.getShortestPathLength(game.players[aiPlayer].r, game.players[aiPlayer].c, game.players[aiPlayer].goalRow);
                                
                                // Penalize using walls early to save them for critical moments
                                const wallPenalty = 0.5; 
                                const score = newOppDist - newMyDist - wallPenalty;
                                
                                // Only consider if it actually increased opponent's path
                                if (newOppDist > currentOppDist && score > bestScore) {
                                    bestScore = score;
                                    bestMove = { type: 'wall', r, c, o };
                                }
                                
                                game.walls.pop();
                            }
                        }
                    }
                }
            }
        }

        // If no good wall was found, fallback to best move
        if (bestMove) return bestMove;
        
        // Absolute fallback
        const myPath = this.getBestPathMove(game, aiPlayer);
        return { type: 'move', r: myPath.r, c: myPath.c };
    }


    // --- Helper Methods ---

    // Uses BFS to find the next step on the shortest path
    getBestPathMove(game, playerNum) {
        const p = game.players[playerNum];
        const validMoves = game.getValidMoves(playerNum);
        
        let bestDist = Infinity;
        let bestMove = validMoves[0];

        for (const m of validMoves) {
            // Temporarily move pawn
            const prevR = p.r;
            const prevC = p.c;
            p.r = m.r; p.c = m.c;
            
            const dist = game.getShortestPathLength(p.r, p.c, p.goalRow);
            if (dist !== -1 && dist < bestDist) {
                bestDist = dist;
                bestMove = m;
            }
            
            // Revert
            p.r = prevR; p.c = prevC;
        }

        return bestMove;
    }

    getRandomValidWall(game) {
        let attempts = 0;
        while (attempts < 50) {
            const r = Math.floor(Math.random() * 8);
            const c = Math.floor(Math.random() * 8);
            const o = Math.random() < 0.5 ? 'H' : 'V';
            if (game.canPlaceWall(r, c, o)) {
                return { r, c, o };
            }
            attempts++;
        }
        return null;
    }

    // Try walls near the opponent and pick one that maximizes their path length
    getBestBlockingWall(game, oppNum, currentOppDist) {
        const opp = game.players[oppNum];
        let bestWall = null;
        let maxOppDist = currentOppDist;

        // Check walls near the opponent
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const r = opp.r + dr;
                const c = opp.c + dc;
                
                if (r >= 0 && r < 8 && c >= 0 && c < 8) {
                    for (const o of ['H', 'V']) {
                        if (game.canPlaceWall(r, c, o)) {
                            game.walls.push({ r, c, o });
                            const newOppDist = game.getShortestPathLength(opp.r, opp.c, opp.goalRow);
                            game.walls.pop();

                            if (newOppDist > maxOppDist) {
                                maxOppDist = newOppDist;
                                bestWall = { r, c, o };
                            }
                        }
                    }
                }
            }
        }
        return bestWall;
    }
}
