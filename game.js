class Game2048 {
    constructor() {
        this.size = 4;
        this.grid = [];
        this.score = 0;
        this.bestScore = this.loadBestScore();
        this.gameWon = false;
        this.gameOver = false;
        this.previousState = null;
        
        this.init();
        this.setupEventListeners();
    }

    init() {
        this.createGrid();
        this.renderGrid();
        this.addRandomTile();
        this.addRandomTile();
        this.render();
        this.updateScore();
    }

    createGrid() {
        this.grid = [];
        for (let i = 0; i < this.size; i++) {
            this.grid[i] = [];
            for (let j = 0; j < this.size; j++) {
                this.grid[i][j] = 0;
            }
        }
    }

    renderGrid() {
        const gridContainer = document.getElementById('grid-container');
        gridContainer.innerHTML = '';
        
        for (let i = 0; i < this.size * this.size; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            gridContainer.appendChild(cell);
        }
    }

    saveState() {
        this.previousState = {
            grid: this.grid.map(row => [...row]),
            score: this.score
        };
    }

    undo() {
        if (this.previousState) {
            this.grid = this.previousState.grid.map(row => [...row]);
            this.score = this.previousState.score;
            this.previousState = null;
            this.gameOver = false;
            this.render();
            this.updateScore();
            this.hideMessage();
        }
    }

    addRandomTile() {
        const emptyCells = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({ row: i, col: j });
                }
            }
        }

        if (emptyCells.length > 0) {
            const { row, col } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[row][col] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    render() {
        const container = document.getElementById('tile-container');
        container.innerHTML = '';

        const cellSize = (container.offsetWidth - 30) / this.size;

        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const value = this.grid[i][j];
                if (value !== 0) {
                    const tile = document.createElement('div');
                    tile.className = `tile tile-${value > 2048 ? 'super' : value}`;
                    tile.textContent = value;
                    
                    const left = j * (cellSize + 10);
                    const top = i * (cellSize + 10);
                    
                    tile.style.width = `${cellSize}px`;
                    tile.style.height = `${cellSize}px`;
                    tile.style.left = `${left}px`;
                    tile.style.top = `${top}px`;
                    
                    container.appendChild(tile);
                }
            }
        }
    }

    move(direction) {
        if (this.gameOver) return;

        this.saveState();
        let moved = false;

        switch (direction) {
            case 'left':
                moved = this.moveLeft();
                break;
            case 'right':
                moved = this.moveRight();
                break;
            case 'up':
                moved = this.moveUp();
                break;
            case 'down':
                moved = this.moveDown();
                break;
        }

        if (moved) {
            this.addRandomTile();
            this.render();
            this.updateScore();
            
            if (this.hasWon() && !this.gameWon) {
                this.gameWon = true;
                this.showMessage('You Win! 🎉');
            } else if (this.isGameOver()) {
                this.gameOver = true;
                this.showMessage('Game Over! 😢');
            }
        } else {
            this.previousState = null;
        }
    }

    moveLeft() {
        let moved = false;
        for (let i = 0; i < this.size; i++) {
            const row = this.grid[i].filter(val => val !== 0);
            const merged = [];
            
            for (let j = 0; j < row.length; j++) {
                if (j < row.length - 1 && row[j] === row[j + 1]) {
                    merged.push(row[j] * 2);
                    this.score += row[j] * 2;
                    j++;
                } else {
                    merged.push(row[j]);
                }
            }
            
            while (merged.length < this.size) {
                merged.push(0);
            }
            
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] !== merged[j]) {
                    moved = true;
                }
                this.grid[i][j] = merged[j];
            }
        }
        return moved;
    }

    moveRight() {
        let moved = false;
        for (let i = 0; i < this.size; i++) {
            const row = this.grid[i].filter(val => val !== 0);
            const merged = [];
            
            for (let j = row.length - 1; j >= 0; j--) {
                if (j > 0 && row[j] === row[j - 1]) {
                    merged.unshift(row[j] * 2);
                    this.score += row[j] * 2;
                    j--;
                } else {
                    merged.unshift(row[j]);
                }
            }
            
            while (merged.length < this.size) {
                merged.unshift(0);
            }
            
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] !== merged[j]) {
                    moved = true;
                }
                this.grid[i][j] = merged[j];
            }
        }
        return moved;
    }

    moveUp() {
        let moved = false;
        for (let j = 0; j < this.size; j++) {
            const col = [];
            for (let i = 0; i < this.size; i++) {
                if (this.grid[i][j] !== 0) {
                    col.push(this.grid[i][j]);
                }
            }
            
            const merged = [];
            for (let i = 0; i < col.length; i++) {
                if (i < col.length - 1 && col[i] === col[i + 1]) {
                    merged.push(col[i] * 2);
                    this.score += col[i] * 2;
                    i++;
                } else {
                    merged.push(col[i]);
                }
            }
            
            while (merged.length < this.size) {
                merged.push(0);
            }
            
            for (let i = 0; i < this.size; i++) {
                if (this.grid[i][j] !== merged[i]) {
                    moved = true;
                }
                this.grid[i][j] = merged[i];
            }
        }
        return moved;
    }

    moveDown() {
        let moved = false;
        for (let j = 0; j < this.size; j++) {
            const col = [];
            for (let i = 0; i < this.size; i++) {
                if (this.grid[i][j] !== 0) {
                    col.push(this.grid[i][j]);
                }
            }
            
            const merged = [];
            for (let i = col.length - 1; i >= 0; i--) {
                if (i > 0 && col[i] === col[i - 1]) {
                    merged.unshift(col[i] * 2);
                    this.score += col[i] * 2;
                    i--;
                } else {
                    merged.unshift(col[i]);
                }
            }
            
            while (merged.length < this.size) {
                merged.unshift(0);
            }
            
            for (let i = 0; i < this.size; i++) {
                if (this.grid[i][j] !== merged[i]) {
                    moved = true;
                }
                this.grid[i][j] = merged[i];
            }
        }
        return moved;
    }

    hasWon() {
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 2048) {
                    return true;
                }
            }
        }
        return false;
    }

    isGameOver() {
        // Check for empty cells
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    return false;
                }
            }
        }

        // Check for possible merges
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const current = this.grid[i][j];
                if (j < this.size - 1 && current === this.grid[i][j + 1]) {
                    return false;
                }
                if (i < this.size - 1 && current === this.grid[i + 1][j]) {
                    return false;
                }
            }
        }

        return true;
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;
        
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.saveBestScore();
        }
        
        document.getElementById('best-score').textContent = this.bestScore;
    }

    saveBestScore() {
        localStorage.setItem('2048-best-score', this.bestScore.toString());
    }

    loadBestScore() {
        const saved = localStorage.getItem('2048-best-score');
        return saved ? parseInt(saved, 10) : 0;
    }

    showMessage(message) {
        const messageElement = document.getElementById('game-message');
        messageElement.querySelector('p').textContent = message;
        messageElement.classList.add('show');
    }

    hideMessage() {
        document.getElementById('game-message').classList.remove('show');
    }

    restart() {
        this.score = 0;
        this.gameWon = false;
        this.gameOver = false;
        this.previousState = null;
        this.createGrid();
        this.addRandomTile();
        this.addRandomTile();
        this.render();
        this.updateScore();
        this.hideMessage();
    }

    handleSwipe(startX, startY, endX, endY) {
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const minSwipeDistance = 30;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (Math.abs(deltaX) > minSwipeDistance) {
                if (deltaX > 0) {
                    this.move('right');
                } else {
                    this.move('left');
                }
            }
        } else {
            if (Math.abs(deltaY) > minSwipeDistance) {
                if (deltaY > 0) {
                    this.move('down');
                } else {
                    this.move('up');
                }
            }
        }
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                e.preventDefault();
                this.move('up');
            } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                e.preventDefault();
                this.move('down');
            } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                e.preventDefault();
                this.move('left');
            } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                e.preventDefault();
                this.move('right');
            }
        });

        // Touch controls for mobile
        let touchStartX = 0;
        let touchStartY = 0;

        const gameContainer = document.querySelector('.game-container');
        
        gameContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        });

        gameContainer.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].screenX;
            const touchEndY = e.changedTouches[0].screenY;
            this.handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
        });

        // Button controls
        document.getElementById('new-game').addEventListener('click', () => {
            this.restart();
        });

        document.getElementById('retry-button').addEventListener('click', () => {
            this.restart();
        });

        document.getElementById('undo-btn').addEventListener('click', () => {
            this.undo();
        });
    }
}

// Initialize the game when the page loads
let game;
window.addEventListener('DOMContentLoaded', () => {
    game = new Game2048();
});
