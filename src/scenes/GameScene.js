export default class GameScene extends Phaser.Scene {

    constructor() {
        super({ key: 'GameScene' });
        this.cellSize = 80; // Size of each cell
        this.gridSize = 6; // 6x6 grid
        this.grid = [];
        this.undoStack = []; // For undo functionality
    }

    preload() {
        // Preload assets
        this.load.image('greyQueen', 'assets/greyQueen.png');
        this.load.image('redQueen', 'assets/redQueen.png');
    }

    create() {
        // Create grid and regions
        this.createGrid(this.gridSize);
        this.createRegions();
        this.drawRegions();
        this.createButtons();
        // Input handling for clicking cells
        this.input.on('gameobjectdown', (pointer, cell) => {
            this.handleCellClick(cell);
        });
        this.input.on('pointerdown', this.startDrag, this);
        this.input.on('pointermove', this.doDrag, this);
        this.input.on('pointerup', this.stopDrag, this);
    }

    startDrag(pointer) {
        this.draggedCell = this.grid.find(cell => cell.getBounds().contains(pointer.x, pointer.y));
        if (this.draggedCell && this.draggedCell.data.get('state') === 'empty') {
            this.draggedCell.data.set('state', 'x');
            this.draggedCell.setFillStyle(0x666666);
        }
    }

    doDrag(pointer) {
        if (this.draggedCell) {
            const cell = this.grid.find(cell => cell.getBounds().contains(pointer.x, pointer.y));
            if (cell && cell !== this.draggedCell && cell.data.get('state') === 'empty') {
                cell.data.set('state', 'x');
                cell.setFillStyle(0x666666);
            }
        }
    }

    stopDrag() {
        this.draggedCell = null;
    }

    createGrid(size) {
        const startX = this.cameras.main.width / 2 - (size * this.cellSize) / 2;
        const startY = 100;
        for (let row = 0; row < size; row++) {
            for (let col = 0; col < size; col++) {
                const x = startX + col * this.cellSize;
                const y = startY + row * this.cellSize;
                const cell = this.add.rectangle(x, y, this.cellSize - 2, this.cellSize - 2, 0xffffff)
                    .setInteractive()
                    .setStrokeStyle(2, 0x000000)
                    .setData({
                        row,
                        col,
                        state: 'empty', // empty, x, queen
                        originalColor: 0xffffff, // Default color (will be updated when regions are drawn)
                        queenSprite: null, // Reference to queen sprite
                    });
                this.grid.push(cell);
            }
        }
    }

    createRegions() {
        this.regions = [
            { cells: [[0, 0], [0, 1], [1, 0], [1, 1]], color: 0xffcccc },
            { cells: [[0, 2], [0, 3], [1, 2], [1, 3]], color: 0xccffcc },
            { cells: [[0, 4], [0, 5], [1, 4], [1, 5]], color: 0xccccff },
            { cells: [[2, 0], [2, 1], [3, 0], [3, 1]], color: 0xffffcc },
            { cells: [[2, 2], [2, 3], [3, 2], [3, 3]], color: 0xffccff },
            { cells: [[2, 4], [2, 5], [3, 4], [3, 5]], color: 0xccffff },
            { cells: [[4, 0], [4, 1], [5, 0], [5, 1]], color: 0xd9d9d9 },
            { cells: [[4, 2], [4, 3], [5, 2], [5, 3]], color: 0xffe6b3 },
            { cells: [[4, 4], [4, 5], [5, 4], [5, 5]], color: 0xb3e6ff },
        ];
    }

    drawRegions() {
        this.regions.forEach(region => {
            region.cells.forEach(([row, col]) => {
                const cell = this.grid.find(c => c.data.values.row === row && c.data.values.col === col);
                cell.setFillStyle(region.color);
                cell.data.set('originalColor', region.color);
            });
        });
    }

    handleCellClick(cell) {
        const currentState = cell.data.get('state');
        const originalColor = cell.data.get('originalColor');
        console.log(`Current state: ${currentState}`);

        switch (currentState) {
            case 'empty':
                // If the cell is empty, change its state to 'x' and update its color
                cell.data.set('state', 'x');
                cell.setFillStyle(0x666666);
                console.log("State was empty. Set state to 'x'.");
                break;
            case 'x':
                // If the cell is in 'x' state, check if it has a queen sprite
                if (cell.data.get('queenSprite')) {
                    const queenType = cell.data.get('queenType');
                    if (queenType === 'greyQueen') {
                        this.resetCellAndSurroundings(cell);
                        console.log("Grey queen removed. Reset surroundings.");
                    }
                    console.log("current color:" + cell.fillColor);
                } else {
                    // If no queen is present, place a new one
                    this.placeQueen(cell, this.grid.filter(c => c.data.get('queenType') === 'greyQueen'));
                    console.log("Placed a new queen on the cell.");
                }
                break;

            default:
                console.error("Unknown state encountered:", currentState);
        }
    }



    resetCellAndSurroundings(cell) {
        // Reset associated cells
        const associatedCells = cell.data.get('associatedCells') || [];
        associatedCells.forEach(otherCell => {
            const originalColor = otherCell.data.get('originalColor');
            otherCell.setFillStyle(originalColor);
            otherCell.data.set('state', 'empty');
        });

        // Clear associated cells data
        cell.data.set('associatedCells', null);

        
        this.time.delayedCall(0, () => {
            cell.data.set('state', 'empty');
            cell.setFillStyle(cell.data.get('originalColor'));
            cell.data.get('queenSprite').destroy();
            cell.data.set('queenSprite', null);
            cell.data.set('queenType', null);
        }, [], this);

        console.log("Reset completed for greyQueen and its surroundings.");
    }




    markCellAndSurroundings(cell, color) {
        const row = cell.data.get('row');
        const col = cell.data.get('col');
        const associatedCells = [];

        this.grid.forEach(otherCell => {
            const otherRow = otherCell.data.get('row');
            const otherCol = otherCell.data.get('col');
            if (
                (otherRow === row || otherCol === col ||
                    (Math.abs(otherRow - row) <= 1 && Math.abs(otherCol - col) <= 1)) //&&
                //otherCell !== cell // Exclude the current cell
            ) {
                if (otherCell.data.get('state') === 'empty') {
                    otherCell.setFillStyle(color);
                    otherCell.data.set('state', 'x');
                    associatedCells.push(otherCell);
                }
            }
        });

        console.log("id of all associated cells:" + associatedCells.map(cell => cell.data.get('row') + ':' + cell.data.get('col')).join('---'));
        return associatedCells;
    }


    isAdjacentToQueen(cell, queens) {
        const row = cell.data.get('row');
        const col = cell.data.get('col');
        return queens.some(queen => {
            const qRow = queen.data.get('row');
            const qCol = queen.data.get('col');
            return Math.abs(qRow - row) <= 1 && Math.abs(qCol - col) <= 1;
        });
    }

    isSameRowOrColumn(cell, queens) {
        const row = cell.data.get('row');
        const col = cell.data.get('col');
        return queens.some(queen => {
            const qRow = queen.data.get('row');
            const qCol = queen.data.get('col');
            return qRow === row || qCol === col;
        });
    }

    placeQueen(cell, queens) {
        const isConflicting = this.isAdjacentToQueen(cell, queens) || this.isSameRowOrColumn(cell, queens);
        const queenType = isConflicting ? 'redQueen' : 'greyQueen';
        const sprite = this.add.image(cell.x, cell.y, queenType).setScale(0.8);
        cell.data.set('queenSprite', sprite);
        cell.data.set('queenType', queenType);
        console.log("placeQueen:" + cell.data.get('queenType') + " " + cell.data.get('state'));

        if (queenType === 'greyQueen') {
            const associatedCells = this.markCellAndSurroundings(cell, 0x666666);
            cell.data.set('associatedCells', associatedCells);
        }
    }



    createButtons() {
        const undoButton = this.add.text(50, this.cameras.main.height - 50, 'Undo', {
            fontSize: '24px',
            fill: '#fff'
        })
            .setInteractive()
            .on('pointerdown', () => this.undo());
        const hintButton = this.add.text(150, this.cameras.main.height - 50, 'Hint', {
            fontSize: '24px',
            fill: '#fff'
        })
            .setInteractive()
            .on('pointerdown', () => alert('Hints not implemented yet!'));
    }

    undo() {
        if (this.undoStack.length > 0) {
            const lastAction = this.undoStack.pop();
            lastAction.cell.data.set('state', lastAction.previousState);
            switch (lastAction.previousState) {
                case 'x':
                    lastAction.cell.setFillStyle(0x666666);
                    break;
                case 'queen':
                    if (!lastAction.cell.data.values.queenSprite) {
                        this.placeQueen(lastAction.cell, this.grid.filter(c => c.data.get('state') === 'queen'));
                    }
                    break;
                default:
                    const originalColor = lastAction.cell.data.get('originalColor');
                    lastAction.cell.setFillStyle(originalColor);
                    break;
            }
        }
    }
}