class Game extends GameBase { //A renommer ?
    constructor(canvas, fullscreen = true) {
        super(canvas, fullscreen)

        this.init();
    }

    async init() {
        // /*----------------IMG-----------------*/
        // const urls = [];

        /*---------Draw settings----------*/
        this.FPS = 60;
        this.prevTick = 0;

        /*----------------Mouse----------------*/

        this.mousePressed = false;

        this.mouseX = 0;
        this.mouseY = 0;

        this.mouseStep = 1;
        this.x1 = -1;
        this.y1 = -1;
        this.x2 = -1;
        this.y2 = -1;

        /*---------Map settings----------*/
        this.cols = 9;
        this.rows = 9;

        this.alpha = 2 * Math.PI / 6;

        this.coordsGrid = [
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

        this.actionGrid = [
            [-1, -1, -1, -1, 0, 0, 0, 0, 0], //-1  => vide
            [-1, -1, -1, 0, 0, 0, 0, 0, 0], // 1  => select
            [-1, -1, 0, 0, 0, 0, 0, 0, 0], // 2  => dest
            [-1, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, -1],
            [0, 0, 0, 0, 0, 0, 0, -1, -1],
            [0, 0, 0, 0, 0, 0, -1, -1, -1],
            [0, 0, 0, 0, 0, -1, -1, -1, -1],
        ];

        /*----------------Game----------------*/
        this.playerToPlay = 1;
        // this.abalone = new Abalone(); //Instance du jeu
        // this.coordsGrid = this.abalone.grid; //recup la bonne grille

        /**--------------Screen settings--------------*/
        this.resize();
        this.initMap();

        this.initEvent();

        /**---------------START----------------- */
        this.draw();
    }

    initMap() {
        let skipCol = 4; //to keep only the big hexagon grid
        let scale = 0.9;

        const A = (this.cols) * Math.cos(this.alpha / 2) * 3 - Math.cos(this.alpha / 2);
        const B = this.rows * 2 - ((this.rows - 1) * Math.sin(this.alpha / 2));

        const A2 = (skipCol) * Math.cos(this.alpha / 2) * 2;

        this.sizeX = scale * this.canvas.width / (A - A2);
        this.sizeY = scale * this.canvas.height / B;

        this.size = Math.min(this.sizeX, this.sizeY); // taille d'un hexagone

        this.gridWidth = this.size * A;
        this.gridHeight = this.size * B;

        let centerX = (this.canvas.width - this.gridWidth) / 2; // - (skipColWidth / 8);
        let centerY = (this.canvas.height - this.gridHeight) / 2;

        this.grid = new Array(this.cols);
        for (var x = 0; x < this.grid.length; x++) {
            this.grid[x] = new Array(this.rows);
        }

        for (var x = 0; x < this.grid.length; x++) {
            for (var y = 0; y < this.grid[0].length; y++) {
                var coordX = x * 2 * Math.cos(this.alpha * 0.5) * this.size + y * Math.cos(this.alpha * 0.5) * this.size + centerX + this.size * Math.cos(this.alpha / 2);
                var coordY = y * 3 * Math.sin(this.alpha * 0.5) * this.size + centerY + this.size / 2 + Math.sin(this.alpha / 2) * this.size;
                this.grid[x][y] = this.createHexagon(coordX, coordY);
                // this.grid[x][y].id = coordsGrid[x][y];
                this.grid[x][y].cx = x;
                this.grid[x][y].cy = y;
            }
        }
    }

    createHexagon(x, y) {
        let points = [];

        points.push({ x: x + this.size * Math.cos(this.alpha * 0.5), y: y + this.size * Math.sin(this.alpha * 0.5) });

        for (var i = 1; i <= 6; i++) {
            points.push({ x: x + this.size * Math.cos((i + 0.5) * this.alpha), y: y + this.size * Math.sin((i + 0.5) * this.alpha) });
        }

        return new Hexagon(x, y, points); //return hexagon
    }

    initEvent() {
        this.canvas.onmousedown = (e) => {
            this.mouseAction(e);
        };
        this.canvas.onmouseup = (e) => {
            this.mousePressed = false;
        };
        this.canvas.onmousemove = (e) => { this.refreshMouseCoord(e); };

        this.canvas.addEventListener('touchstart', (e) => {
            this.refreshTouchCoord(e);
            this.mousePressed = true;
        }, false);

        this.canvas.addEventListener('touchmove', (e) => {
            this.refreshTouchCoord(e);
        }, false);

        this.canvas.addEventListener('touchend', (e) => {
            this.refreshTouchCoord(e);
            this.mousePressed = false;
        }, false);

        window.onresize = (e) => {
            this.resize();
            this.initMap();
        };
    }

    mouseAction(e) {
        let coord = MouseControl.getMousePos(this.canvas, e);

        this.mouseX = coord.x;
        this.mouseY = coord.y;

        let target = this.selectHexagon(this.mouseX, this.mouseY);

        if (this.mouseStep == 1) {
            if (this.coordsGrid[target.cx][target.cy] == this.playerToPlay) {
                this.firstAction(target);

                this.mouseStep = 2;
            }
        } else if (this.mouseStep == 2) {
            if (this.coordsGrid[target.cx][target.cy] == this.playerToPlay) {
                this.firstAction(target);
            } else {
                this.secondAction(target);
            }
        }
    }

    firstAction(target) {
        this.resetGrid(this.actionGrid, 0);
        this.actionGrid[target.cx][target.cy] = 1;

        this.x1 = target.cx;
        this.y1 = target.cy;

        this.showPotentialMove(this.x1, this.y1);
    }

    showPotentialMove(ox, oy) {
        this.showMoveDirection(ox, oy, 1, 0);
        this.showMoveDirection(ox, oy, -1, 0);
        this.showMoveDirection(ox, oy, 0, 1);
        this.showMoveDirection(ox, oy, 0, -1);
        this.showMoveDirection(ox, oy, 1, -1);
        this.showMoveDirection(ox, oy, -1, 1);
    }

    showMoveDirection(cx, cy, dx, dy) {
        let team = this.coordsGrid[cx][cy];

        let nbPieceTeam = 1;
        let nbPieceOpponent = 0;

        while (true) {
            cx += dx;
            cy += dy;

            let coordContext = this.checkCoordContext(cx, cy)

            if (coordContext == -1) { //on atteint le bord
                if (nbPieceTeam <= nbPieceOpponent || nbPieceOpponent == 0) { //illegale move !
                    this.resetGridByID(this.actionGrid, 10, 0); //replace temp value
                    this.resetGridByID(this.actionGrid, 20, 0); //replace temp value
                    break;
                }
                this.resetGridByID(this.actionGrid, 10, 3); //Reussite
                this.resetGridByID(this.actionGrid, 20, 4); //Reussite
                break;
            } else if (coordContext == team) { //team
                if (nbPieceOpponent > 0 || nbPieceTeam == 3) { //bloqué par une boule de notre team ou trop de boule
                    this.resetGridByID(this.actionGrid, 10, 0); //replace temp value
                    this.resetGridByID(this.actionGrid, 20, 0); //replace temp value
                    break;
                }
                nbPieceTeam++;
                this.actionGrid[cx][cy] = 10;
            } else if (coordContext == 0) { //on atteint une case vide
                if (nbPieceTeam <= nbPieceOpponent) {
                    this.resetGridByID(this.actionGrid, 10, 0); //replace temp value
                    this.resetGridByID(this.actionGrid, 20, 0); //replace temp value
                    break;
                }
                this.actionGrid[cx][cy] = 4;
                this.resetGridByID(this.actionGrid, 10, 3); //Reussite
                this.resetGridByID(this.actionGrid, 20, 4); //Reussite
                break;
            } else { //Player 2...
                if (nbPieceOpponent >= nbPieceTeam) { //illegale
                    this.resetGridByID(this.actionGrid, 10, 0);
                    this.resetGridByID(this.actionGrid, 20, 0);
                    break;
                }
                nbPieceOpponent++;
                this.actionGrid[cx][cy] = 20; //Val temporaire
            }
        }
    }

    checkCoordContext(cx, cy) {
        if (cx >= this.coordsGrid.length || cy >= this.coordsGrid[0].length || cx < 0 || cy < 0) return -1; //vide

        return this.coordsGrid[cx][cy]; //other
    }

    secondAction(target) {
        this.x2 = target.cx;
        this.y2 = target.cy;

        //Confirmation visuel
        if (this.actionGrid[target.cx][target.cy] == 4) {
            //Calculate direcction
            let dx = this.x2 - this.x1;
            let dy = this.y2 - this.y1;

            if ((Math.abs(dx) == Math.abs(dy)) || (dx == 0 && dy != 0) || (dy == 0 && dx != 0)) {
                //normalize
                dx /= Math.max(Math.abs(dx), 1); //max pour évitere division par 0
                dy /= Math.max(Math.abs(dy), 1);

                console.log(`MOVE : ox : ${this.x1} | oy : ${this.y1} | dx : ${dx} | dy : ${dy}`);

                this.actionGrid[target.cx][target.cy] = 2; //on affiche l'arrivée en rouge

                if (this.playerToPlay == 2) {
                    this.x1 = 8 - this.x1;
                    this.y1 = 8 - this.y1;

                    dx *= -1;
                    dy *= -1;
                }

                socket.emit("piece_move", this.x1, this.y1, dx, dy);

                // let result = this.abalone.play(this.x1, this.y1, dx, dy); //ON JOUE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                // if (result == 0) {
                //     this.coordsGrid = this.abalone.grid;
                //     console.log(this.abalone.grid);
                //     this.switchPlayerToPlay();
                // }
            }
        } else {}
        this.resetGrid(this.actionGrid, 0);
    }

    reverseGrid(grid) {
        let interArray = grid.map(function(arr) {
            return arr.slice();
        });

        for (let x = 0; x < grid.length; x++) {
            for (let y = 0; y < grid[x].length; y++) {
                grid[x][y] = interArray[grid.length - 1 - x][grid[x].length - 1 - y];
            }
        }
    }

    switchPlayerToPlay() {
        if (this.playerToPlay == 1) this.playerToPlay = 2;
        else this.playerToPlay = 1;
    }

    selectHexagon(mX, mY) {
        let target = this.grid[0][0];
        let currentDist = this.dist(target.x, target.y, mX, mY);

        for (var x = 0; x < this.grid.length; x++) {
            for (var y = 0; y < this.grid[0].length; y++) {
                let d = this.dist(this.grid[x][y].x, this.grid[x][y].y, mX, mY);

                if (d < currentDist) {
                    target = this.grid[x][y];
                    currentDist = d;
                }
            }
        }

        return target;
    }

    dist(x1, y1, x2, y2) {
        return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
    }

    refreshTouchCoord(e) {
        let coord = TouchControl.getTouchPos(this.canvas, e);

        this.mouseX = coord.x;
        this.mouseY = coord.y;
    }

    refreshMouseCoord(e) {
        let coord = MouseControl.getMousePos(this.canvas, e);

        this.mouseX = coord.x;
        this.mouseY = coord.y;
    }

    draw() {
        /*------------------------------FPS-----------------------------*/
        window.requestAnimationFrame(() => this.draw());

        let now = Math.round(this.FPS * Date.now() / 1000);
        if (now == this.prevTick) return;
        this.prevTick = now;
        /*--------------------------------------------------------------*/

        //this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.width);
        // this.ctx.fillStyle = "rgb(210,210,210)";
        this.ctx.fillStyle = "#F4D527";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        /*------------------------------GRID-----------------------------*/
        this.displayGrid();
    }

    displayGrid(debug = false) {
        for (var x = 0; x < this.grid.length; x++) {
            for (var y = 0; y < this.grid[0].length; y++) {
                let color = "white"
                switch (this.coordsGrid[x][y]) { //Background color
                    case -1:
                        continue;
                        // color = "#AACAFE";
                        break;

                    default:
                        color = "#F4D527";
                        color = "rgb(200,200,200)"
                        color = "#AACAFE";
                        break;
                }
                //console.log(this.actionGrid[x][y]);
                switch (this.actionGrid[x][y]) {
                    case 1:
                        color = "#50e42b"; //Start
                        break;

                    case 2:
                        color = "#ff5500"; //Finish
                        break;

                    case 3:
                        color = "pink"; //Move possible
                        break;

                    case 4:
                        color = "orange"; //Move play
                        break;
                }

                this.ctx.fillStyle = color;

                this.ctx.beginPath();
                this.ctx.moveTo(this.grid[x][y].points[0].x, this.grid[x][y].points[0].y);
                for (var i = 1; i <= 6; i++) {
                    this.ctx.lineTo(this.grid[x][y].points[i].x, this.grid[x][y].points[i].y); //Hexagone
                }
                this.ctx.closePath();
                this.ctx.stroke(); //end
                this.ctx.fill();

                if (debug) {
                    this.ctx.font = this.size / 3 + "px serif";
                    this.ctx.fillStyle = "black";
                    this.ctx.textAlign = "center";
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText(x + " | " + y, this.grid[x][y].points[0].x - this.size, this.grid[x][y].points[0].y - this.size / 2);
                }
            }
        }

        for (var x = 0; x < this.grid.length; x++) {
            for (var y = 0; y < this.grid[0].length; y++) {
                switch (this.coordsGrid[x][y]) {
                    case 1:
                        this.ctx.fillStyle = "#000000";
                        this.ctx.beginPath();
                        this.ctx.ellipse(this.grid[x][y].x, this.grid[x][y].y, 4 * this.size / 7, 4 * this.size / 7, 0, 0, 2 * Math.PI);
                        this.ctx.fill();
                        break;

                    case 2:
                        this.ctx.fillStyle = "red";
                        this.ctx.beginPath();
                        this.ctx.ellipse(this.grid[x][y].x, this.grid[x][y].y, 4 * this.size / 7, 4 * this.size / 7, 0, 0, 2 * Math.PI);
                        this.ctx.fill();
                        break;
                }
            }
        }
    }

    drawHexagon(x, y) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + this.size * Math.cos(0), y + this.size * Math.sin(0));
        for (var i = 1; i <= 6; i++) {
            this.ctx.lineTo(x + this.size * Math.cos(i * this.alpha), y + this.size * Math.sin(i * this.alpha));
        }
        this.ctx.closePath();
        this.ctx.stroke();
    }

    /**-------------------------UTILS-------------------------*/

    resetGrid(grid, val) {
        for (var x = 0; x < grid.length; x++) {
            for (var y = 0; y < grid[0].length; y++) {
                grid[x][y] = val;
            }
        }
    }

    resetGridByID(grid, id, val) {
        for (var x = 0; x < grid.length; x++) {
            for (var y = 0; y < grid[0].length; y++) {
                if (grid[x][y] == id) grid[x][y] = val;
            }
        }
    }
}

class Hexagon {
    constructor(x, y, points) {
        this.x = x;
        this.y = y;
        this.points = points;
        // this.id = 0;

        this.cx = -1;
        this.cy = -1;
    }
}