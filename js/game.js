class QuoridorGame {
    constructor(p1Walls, p2Walls) {
        this.boardSize = 9;
        this.players = {
            1: { r: 8, c: 4, goalRow: 0, walls: p1Walls },
            2: { r: 0, c: 4, goalRow: 8, walls: p2Walls }
        };
        this.turn = 1; // 1 or 2
        this.winner = null;
        
        // Walls are indexed by r,c and orientation ('H' or 'V')
        // r, c in [0, 7]
        this.walls = [];
        this.moveHistory = []; // to track stats
        this.movesCount = 0;
    }

    // Check if a cell is on the board
    isValidCell(r, c) {
        return r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize;
    }

    // Returns if there is a wall directly blocking movement between (r1,c1) and (r2,c2)
    // Assuming (r1,c1) and (r2,c2) are adjacent orthogonally
    isWallBlocking(r1, c1, r2, c2) {
        if (r1 === r2) {
            // Horizontal move
            let minC = Math.min(c1, c2);
            // V-wall blocks horizontal movement
            // A V-wall at (r, minC) blocks (r, minC)-(r, minC+1) AND (r+1, minC)-(r+1, minC+1)
            // So V-wall at (r1, minC) OR (r1-1, minC) blocks this
            return this.walls.some(w => w.o === 'V' && w.c === minC && (w.r === r1 || w.r === r1 - 1));
        } else if (c1 === c2) {
            // Vertical move
            let minR = Math.min(r1, r2);
            // H-wall blocks vertical movement
            // An H-wall at (minR, c) blocks (minR, c)-(minR+1, c) AND (minR, c+1)-(minR+1, c+1)
            // So H-wall at (minR, c1) OR (minR, c1-1) blocks this
            return this.walls.some(w => w.o === 'H' && w.r === minR && (w.c === c1 || w.c === c1 - 1));
        }
        return false;
    }

    // Get basic orthogonal neighbors (1 step), respecting walls
    getNeighbors(r, c) {
        const neighbors = [];
        const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // N, S, W, E
        
        for (const [dr, dc] of dirs) {
            const nr = r + dr;
            const nc = c + dc;
            if (this.isValidCell(nr, nc) && !this.isWallBlocking(r, c, nr, nc)) {
                neighbors.push({ r: nr, c: nc, dr, dc });
            }
        }
        return neighbors;
    }

    // Get all valid moves for a player (including jumps)
    getValidMoves(playerNum) {
        const p = this.players[playerNum];
        const oppNum = playerNum === 1 ? 2 : 1;
        const opp = this.players[oppNum];
        const validMoves = [];
        
        const neighbors = this.getNeighbors(p.r, p.c);

        for (const n of neighbors) {
            if (n.r === opp.r && n.c === opp.c) {
                // Opponent is in this cell, check for jump
                const jumpR = n.r + n.dr;
                const jumpC = n.c + n.dc;
                
                // Can we jump straight over?
                if (this.isValidCell(jumpR, jumpC) && !this.isWallBlocking(n.r, n.c, jumpR, jumpC)) {
                    validMoves.push({ r: jumpR, c: jumpC });
                } else {
                    // Straight jump blocked (by edge or wall), check diagonal jumps
                    // To do a diagonal jump, we move to the side from the opponent's cell
                    // If moving vertically (dr!=0), sides are horizontal (dc = -1, 1)
                    if (n.dr !== 0) {
                        if (this.isValidCell(n.r, n.c - 1) && !this.isWallBlocking(n.r, n.c, n.r, n.c - 1)) {
                            validMoves.push({ r: n.r, c: n.c - 1 });
                        }
                        if (this.isValidCell(n.r, n.c + 1) && !this.isWallBlocking(n.r, n.c, n.r, n.c + 1)) {
                            validMoves.push({ r: n.r, c: n.c + 1 });
                        }
                    } else if (n.dc !== 0) {
                        if (this.isValidCell(n.r - 1, n.c) && !this.isWallBlocking(n.r, n.c, n.r - 1, n.c)) {
                            validMoves.push({ r: n.r - 1, c: n.c });
                        }
                        if (this.isValidCell(n.r + 1, n.c) && !this.isWallBlocking(n.r, n.c, n.r + 1, n.c)) {
                            validMoves.push({ r: n.r + 1, c: n.c });
                        }
                    }
                }
            } else {
                validMoves.push({ r: n.r, c: n.c });
            }
        }
        return validMoves;
    }

    // BFS to find shortest path length to goal row
    // Returns number of steps, or -1 if no path
    getShortestPathLength(r, c, goalRow) {
        const queue = [{ r, c, dist: 0 }];
        const visited = new Set([`${r},${c}`]);

        let head = 0;
        while (head < queue.length) {
            const current = queue[head++];
            
            if (current.r === goalRow) {
                return current.dist;
            }

            const neighbors = this.getNeighbors(current.r, current.c);
            for (const n of neighbors) {
                const key = `${n.r},${n.c}`;
                if (!visited.has(key)) {
                    visited.add(key);
                    queue.push({ r: n.r, c: n.c, dist: current.dist + 1 });
                }
            }
        }
        return -1; // No path found
    }

    // Check if placing a wall is allowed
    canPlaceWall(r, c, o) {
        // Out of bounds
        if (r < 0 || r > 7 || c < 0 || c > 7) return false;

        // Overlapping with existing wall
        for (const w of this.walls) {
            if (w.r === r && w.c === c) {
                // Same intersection: cannot place ANY wall (neither H nor V)
                return false;
            }
            if (o === 'H' && w.o === 'H' && w.r === r && (w.c === c - 1 || w.c === c + 1)) {
                // H-walls cannot overlap horizontally
                return false;
            }
            if (o === 'V' && w.o === 'V' && w.c === c && (w.r === r - 1 || w.r === r + 1)) {
                // V-walls cannot overlap vertically
                return false;
            }
        }

        // Test pathfinding constraint
        this.walls.push({ r, c, o });
        const p1Path = this.getShortestPathLength(this.players[1].r, this.players[1].c, this.players[1].goalRow);
        const p2Path = this.getShortestPathLength(this.players[2].r, this.players[2].c, this.players[2].goalRow);
        this.walls.pop(); // Revert

        return p1Path !== -1 && p2Path !== -1;
    }

    // Perform pawn move
    movePawn(r, c) {
        const validMoves = this.getValidMoves(this.turn);
        if (validMoves.some(m => m.r === r && m.c === c)) {
            this.players[this.turn].r = r;
            this.players[this.turn].c = c;
            this.movesCount++;
            
            if (r === this.players[this.turn].goalRow) {
                this.winner = this.turn;
            } else {
                this.switchTurn();
            }
            return true;
        }
        return false;
    }

    // Perform wall placement
    placeWall(r, c, o) {
        if (this.players[this.turn].walls > 0 && this.canPlaceWall(r, c, o)) {
            this.walls.push({ r, c, o });
            this.players[this.turn].walls--;
            this.movesCount++;
            this.switchTurn();
            return true;
        }
        return false;
    }

    switchTurn() {
        this.turn = this.turn === 1 ? 2 : 1;
    }
}
