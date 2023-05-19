class Abalone {
    constructor() {
        this.resetGame();
    }

    resetGame() {
        this.grid = [
            [-1, -1, -1, -1, 0, 0, 0, 1, 1], //-1  => vide
            [-1, -1, -1, 0, 0, 0, 0, 1, 1], // 1  => Player 1
            [-1, -1, 0, 0, 0, 0, 1, 1, 1], // 2  => Player 2
            [-1, 2, 0, 0, 0, 0, 1, 1, 1], // 0  => Neutre
            [2, 2, 2, 0, 0, 0, 1, 1, 1],
            [2, 2, 2, 0, 0, 0, 0, 1, -1],
            [2, 2, 2, 0, 0, 0, 0, -1, -1],
            [2, 2, 0, 0, 0, 0, -1, -1, -1],
            [2, 2, 0, 0, 0, -1, -1, -1, -1],
        ];

        this.scoreObjective = 6;

        this.playerToPlay = 1;

        this.scorePlayer1 = 0
        this.scorePlayer2 = 0;

        this.winner = -1;
    }

    play(playerTeam, x1, y1, dx, dy) { //-1 = impossible ; 0 = [OK] ; 1 = [Player 1 win] ; 2 = [Player 2 win]
        console.log("FROM ABALONE MOVE_STATE : " + this.isMovePossible(playerTeam, x1, y1, dx, dy));

        let moveTest = this.isMovePossible(playerTeam, x1, y1, dx, dy);

        if (moveTest != -1) {
            this.movePiece(x1, y1, dx, dy);

            if (moveTest == 1) {
                this.scorePlayer1++;
                if (this.scorePlayer1 >= this.scoreObjective) this.winner = 1;
            } else if (moveTest == 2) {
                this.scorePlayer2++;
                if (this.scorePlayer2 >= this.scoreObjective) this.winner = 2;
            }

            this.switchPlayerToPlay();
            return true;
        } else {
            return false;
        }
    }

    isMovePossible(playerTeam, cx, cy, dx, dy) {
        let team = this.grid[cx][cy];
        if (team != this.playerToPlay || playerTeam != this.playerToPlay) return -1; //Logique

        let nbPieceTeam = 1;
        let nbPieceOpponent = 0;

        while (true) {
            cx += dx;
            cy += dy;

            let coordContext = this.checkCoordContext(cx, cy)

            if (coordContext == -1) { //on atteint le bord
                if (nbPieceTeam <= nbPieceOpponent || nbPieceOpponent == 0) { //illegale move !
                    return -1;
                }

                return playerTeam;
            } else if (coordContext == team) { //team
                if (nbPieceOpponent > 0 || nbPieceTeam == 3) { //bloqué par une boule de notre team ou trop de boule
                    return -1;
                }
                nbPieceTeam++; //Un de plus dans la lignée !
            } else if (coordContext == 0) { //on atteint une case vide
                if (nbPieceTeam <= nbPieceOpponent) {
                    return -1;
                }
                return 0; //pass
            } else { //other player
                if (nbPieceOpponent >= nbPieceTeam) { //illegale
                    return -1;
                }
                nbPieceOpponent++; //Un ennemi de plus comptabilisé
            }
        }
    }

    movePiece(cx, cy, dx, dy) {
        this.grid[cx][cy] = 0; //la case de départ devient vide

        let secondSubstitution = false;

        while (true) {
            cx += dx;
            cy += dy;

            let context = this.checkCoordContext(cx, cy);

            if (context != this.playerToPlay) { //refacto ?
                if (context == 0) {
                    if (secondSubstitution) {
                        let val = this.playerToPlay == 1 ? 2 : 1; //recup l'autre player
                        this.grid[cx][cy] = val;
                    } else this.grid[cx][cy] = this.playerToPlay;
                    break;
                } else if (context == -1) {
                    break;
                } else if (context != this.playerToPlay && !secondSubstitution) { //other team
                    this.grid[cx][cy] = this.playerToPlay; //on écrase puis on débute "un nouveau tour"
                    secondSubstitution = true;
                }
            }
        }
    }

    checkCoordContext(cx, cy) {
        if (cx >= this.grid.length || cy >= this.grid[0].length || cx < 0 || cy < 0) return -1; //vide

        return this.grid[cx][cy]; //other
    }

    switchPlayerToPlay() {
        if (this.playerToPlay == 1) this.playerToPlay = 2;
        else this.playerToPlay = 1;
    }
}

module.exports = { Abalone }

//TODO

/**Condition de victoire à détecter :
 * Adversaire bloquer ?????
 */