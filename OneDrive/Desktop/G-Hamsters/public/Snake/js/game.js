let gameLevelData = null;
let gamePlayerAI = null;
let originalUserPathForDrawing = null; 
let animationFrameId = null;

const game = {
    gameScore: 0, 
    gameBonuses: [], 
    mainCanvas: null, 
    mainCtx: null,    

    init() {
        if (typeof App !== 'undefined' && App.mainCanvasElement && App.mainCtx) {
            this.mainCanvas = App.mainCanvasElement;
            this.mainCtx = App.mainCtx;
            console.log("game.init: mainCanvas and mainCtx set from App.");
        } else {
            console.error("game.init: Cannot access mainCanvas/mainCtx from App or they are not initialized in App yet.");
        }
    },

    startLevel(levelData, userPathObject, pathSegmentsForAI) {
        console.log("game.startLevel called");
        gameLevelData = levelData; 
        originalUserPathForDrawing = userPathObject; 
        gamePlayerAI = new PlayerAI(pathSegmentsForAI); 
        
        this.gameScore = 0; 
        const scoreDisplayEl = document.getElementById('scoreDisplay');
        if(scoreDisplayEl) scoreDisplayEl.textContent = this.gameScore;

        const normalBonuses = (levelData.bonuses || []).map(b => ({ ...b, type: b.type || 'normal', collected: false, position: null }));
        const edgeBonusesArr = (levelData.edgeBonuses || []).map(b => ({ ...b, type: b.type || 'edge', collected: false, position: null }));
        this.gameBonuses = [...edgeBonusesArr, ...normalBonuses];

        const roadPathForBonuses_Canvas = new ArbitraryOrderBezier(); 
        if (levelData.roadSegments && levelData.roadSegments.length > 0 && this.mainCanvas) {
            levelData.roadSegments.forEach(normPt => {
                const scaledPt = scalePointToCanvas(normPt, this.mainCanvas.width, this.mainCanvas.height);
                if (scaledPt) roadPathForBonuses_Canvas.addControlPoint(scaledPt);
            });
        }
        
        this.gameBonuses.forEach(bonus => {
            let pos = null;
            if (roadPathForBonuses_Canvas.controlPoints.length >= 1) { 
                pos = roadPathForBonuses_Canvas.getPointAt(bonus.t);
            }
            bonus.position = pos; 
            if (!bonus.position) { console.warn(`Bonus ${bonus.id || '(no id)'} (type: ${bonus.type}) at t=${bonus.t} could not be positioned on canvas.`); }
        });
        
        originalUserPathForDrawing = userPathObject; 

        if (!pathSegmentsForAI || pathSegmentsForAI.length === 0 || !pathSegmentsForAI[0] || typeof pathSegmentsForAI[0].getPointAt !== 'function') {
            console.warn("game.startLevel: No valid path for AI.", pathSegmentsForAI);
            if (typeof App !== 'undefined' && typeof App.endGame === 'function') App.endGame(false);
            else alert("Помилка: Неможливо розпочати гру без шляху.");
            return;
        }
        
        if (!this.mainCtx || !this.mainCanvas) {
            console.error("game.startLevel: mainCtx or mainCanvas is not initialized. Cannot start game loop.");
            if (typeof App !== 'undefined' && typeof App.endGame === 'function') App.endGame(false);
            return;
        }
        console.log("game.startLevel: Starting game loop.");
        this.gameLoop();
    },

    update() {
        if (!gamePlayerAI || gamePlayerAI.finished) return;
        gamePlayerAI.update();

        if(gamePlayerAI.position) {
            this.gameBonuses.forEach(bonus => {
                if (!bonus.collected && bonus.position) {
                    const distance = Point.distance(gamePlayerAI.position, bonus.position);
                    const collisionRadius = gamePlayerAI.size + ((bonus.type === 'edge') ? 9 : 7);
                    if (distance < collisionRadius) {
                        bonus.collected = true;
                        this.gameScore += bonus.value;
                        const scoreDisplayEl = document.getElementById('scoreDisplay');
                        if(scoreDisplayEl) scoreDisplayEl.textContent = this.gameScore;
                        console.log(`Bonus ${bonus.id} (type: ${bonus.type}) collected! Score: ${this.gameScore}`);
                    }
                }
            });
        }
        
        if (gamePlayerAI.finished) {
            console.log("AI finished path. Final score:", this.gameScore);
            if (typeof App !== 'undefined' && typeof App.endGame === 'function') App.endGame(true);
        }
    },

    draw() {
        if (!this.mainCtx || !this.mainCanvas) {
             console.error("game.draw: mainCtx or mainCanvas is not initialized in game object!");
             return;
        }
        this.mainCtx.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);

        if (gameLevelData && gameLevelData.roadSegments && gameLevelData.roadSegments.length > 0) {
            const roadLevelCanvas = new ArbitraryOrderBezier();
            gameLevelData.roadSegments.forEach(normPt => {
                const scaledPt = scalePointToCanvas(normPt, this.mainCanvas.width, this.mainCanvas.height);
                if(scaledPt) roadLevelCanvas.addControlPoint(scaledPt);
            });
            if (roadLevelCanvas.controlPoints.length >=2) {
                if (typeof drawExtendedRoad === 'function') { 
                    drawExtendedRoad(this.mainCtx, gameLevelData.roadSegments, this.mainCanvas.width, this.mainCanvas.height, {
                        roadColor: '#BBDEFB', lineWidth: 20, centerLine: true, 
                        centerLineWidth: 2, centerLineColor: '#fff', centerLineDash: [10,10],
                        extColor: '#AACCFF', extLineWidth: 20 
                    });
                } else { 
                    roadLevelCanvas.drawCurve(this.mainCtx, { 
                        color: '#BBDEFB', lineWidth: 20, 
                        centerLine: true, centerLineWidth: 2, centerLineColor: '#fff', centerLineDash: [10,10]
                    });
                }
            }
        }

        this.gameBonuses.forEach(bonus => {
            if (bonus.position) { 
                let fillColor, strokeColor, lineWidthVal, radius;
                if (bonus.type === 'edge') {
                    radius = 9; lineWidthVal = 2;
                    fillColor = bonus.collected ? 'rgba(0, 200, 200, 0.6)' : 'cyan';
                    strokeColor = bonus.collected ? 'rgba(0, 150, 150, 0.8)' : 'blue';
                } else { 
                    radius = 7; lineWidthVal = 1;
                    if (bonus.collected) return; 
                    fillColor = 'gold'; strokeColor = 'darkorange';
                }
                this.mainCtx.fillStyle = fillColor;
                this.mainCtx.strokeStyle = strokeColor;
                this.mainCtx.lineWidth = lineWidthVal;
                this.mainCtx.beginPath();
                this.mainCtx.arc(bonus.position.x, bonus.position.y, radius, 0, Math.PI * 2);
                this.mainCtx.fill();
                if (!bonus.collected || bonus.type === 'edge') this.mainCtx.stroke(); 
            }
        });
        
        
        if (originalUserPathForDrawing && originalUserPathForDrawing.controlPoints && originalUserPathForDrawing.controlPoints.length > 0) {
            const userPathCanvas = new ArbitraryOrderBezier();
            originalUserPathForDrawing.controlPoints.forEach(normPt => {
                const scaledPt = scalePointToCanvas(normPt, this.mainCanvas.width, this.mainCanvas.height);
                if(scaledPt) userPathCanvas.addControlPoint(scaledPt);
            });
            if (userPathCanvas.controlPoints.length >= 2) {
                userPathCanvas.drawCurve(mainCtx, { color: 'rgba(0, 150, 200, 0.3)', lineWidth: 6 });
            }
        }
        

        if (gamePlayerAI && typeof gamePlayerAI.draw === 'function') {
            gamePlayerAI.draw(this.mainCtx);
        }
    },

 
    gameLoop() {
        this.update();
        this.draw();
        if (gamePlayerAI && !gamePlayerAI.finished) {
            animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
        }
    },

    stopGame() {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
            console.log("Game loop stopped by stopGame().");
        }
    },

    resetBonusesForLevel() { 
        if (this.gameBonuses && Array.isArray(this.gameBonuses)) {
            this.gameBonuses.forEach(bonus => bonus.collected = false);
        }
        this.gameScore = 0; 
        const scoreDisplayEl = document.getElementById('scoreDisplay');
        if (scoreDisplayEl) {
            scoreDisplayEl.textContent = this.gameScore;
        }
        console.log("Bonuses and score reset for retry via game.resetBonusesForLevel().");
    }
};