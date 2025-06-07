const GameState = {
    MENU: 'menu',
    EDITOR: 'editor',
    PLAYING_AI: 'playing_ai',
    LEVEL_COMPLETE: 'level_complete'
}; 

let levelResultScreen, resultTitle, resultMessage, resultScore, 
    resultNormalBonusesCollected, resultNormalBonusesTotal,
    resultEdgeBonusesCollected, resultEdgeBonusesTotal,
    nextLevelOrRetryButton, resultBackToMenuButton;

function showLevelResults(title, message, score, 
                        normalBonusesCollected, normalBonusesTotal,
                        edgeBonusesCollected, edgeBonusesTotal,
                        isLevelPassed, currentLevelId) {
    if (!levelResultScreen) levelResultScreen = document.getElementById('levelResultScreen');
    if (!resultTitle) resultTitle = document.getElementById('resultTitle');
    if (!resultMessage) resultMessage = document.getElementById('resultMessage');
    if (!resultScore) resultScore = document.getElementById('resultScore');
    if (!resultNormalBonusesCollected) resultNormalBonusesCollected = document.getElementById('resultNormalBonusesCollected');
    if (!resultNormalBonusesTotal) resultNormalBonusesTotal = document.getElementById('resultNormalBonusesTotal');
    if (!resultEdgeBonusesCollected) resultEdgeBonusesCollected = document.getElementById('resultEdgeBonusesCollected');
    if (!resultEdgeBonusesTotal) resultEdgeBonusesTotal = document.getElementById('resultEdgeBonusesTotal');
    if (!nextLevelOrRetryButton) nextLevelOrRetryButton = document.getElementById('nextLevelOrRetryButton');

    if (!levelResultScreen || !resultTitle || !nextLevelOrRetryButton ) { 
        console.error("showLevelResults: Critical modal screen elements not found! Cannot show results properly.");
        alert(`Результат: ${title}\n${message}\nОчки: ${score}`); 
        return;
    }

    resultTitle.textContent = title;
    if(resultMessage) resultMessage.textContent = message;
    if(resultScore) resultScore.textContent = score;
    if(resultNormalBonusesCollected) resultNormalBonusesCollected.textContent = normalBonusesCollected;
    if(resultNormalBonusesTotal) resultNormalBonusesTotal.textContent = normalBonusesTotal;
    if(resultEdgeBonusesCollected) resultEdgeBonusesCollected.textContent = edgeBonusesCollected;
    if(resultEdgeBonusesTotal) resultEdgeBonusesTotal.textContent = edgeBonusesTotal;

    const currentLevelIndex = GAME_LEVELS.findIndex(l => l.id === currentLevelId);
    const hasNext = currentLevelIndex !== -1 && currentLevelIndex < GAME_LEVELS.length - 1;

    if (isLevelPassed) {
        if (hasNext) nextLevelOrRetryButton.textContent = "Наступний рівень";
        else nextLevelOrRetryButton.textContent = "Грати знову всі";
    } else {
        nextLevelOrRetryButton.textContent = "Спробувати ще";
    }
    levelResultScreen.classList.add('visible');
}

function hideLevelResults() {
    if (!levelResultScreen) levelResultScreen = document.getElementById('levelResultScreen');
    if (levelResultScreen) levelResultScreen.classList.remove('visible');
}

const App = {
    gameState: GameState.MENU, 
    currentLevelId: null,
    userPath: new ArbitraryOrderBezier(),
    mainCanvasElement: null,
    mainCtx: null,
    currentLevelPassedCriteriaMet: false,
    
    init() {
        console.log("App.init: Starting application initialization...");
        this.mainCanvasElement = document.getElementById('mainCanvas');
        if (!this.mainCanvasElement) {
            console.error("App.init: CRITICAL - mainCanvas element not found! Game cannot start."); 
            document.body.innerHTML = "<h1 style='color:red; text-align:center;'>Помилка: Основний елемент гри не знайдено.</h1>";
            return;
        }
        this.mainCtx = this.mainCanvasElement.getContext('2d');
        if (!this.mainCtx) {
            console.error("App.init: CRITICAL - Failed to get 2D context from mainCanvas! Game cannot start."); 
            document.body.innerHTML = "<h1 style='color:red; text-align:center;'>Помилка: Не вдалося ініціалізувати графіку.</h1>";
            return;
        }
        console.log("App.init: mainCanvas and mainCtx initialized.");

        levelResultScreen = document.getElementById('levelResultScreen');
        resultTitle = document.getElementById('resultTitle');
        resultMessage = document.getElementById('resultMessage');
        resultScore = document.getElementById('resultScore');
        resultNormalBonusesCollected = document.getElementById('resultNormalBonusesCollected');
        resultNormalBonusesTotal = document.getElementById('resultNormalBonusesTotal');
        resultEdgeBonusesCollected = document.getElementById('resultEdgeBonusesCollected');
        resultEdgeBonusesTotal = document.getElementById('resultEdgeBonusesTotal');
        nextLevelOrRetryButton = document.getElementById('nextLevelOrRetryButton');
        resultBackToMenuButton = document.getElementById('resultBackToMenuButton');

        if (!levelResultScreen || !nextLevelOrRetryButton || !resultBackToMenuButton || !resultTitle) {
            console.warn("App.init: Some modal UI elements for results screen were not found.");
        } else { console.log("App.init: Modal result screen elements obtained."); }

        if (editor && typeof editor.init === 'function') editor.init(this.mainCanvasElement, this.userPath);
        else console.error("App.init: editor or editor.init is not defined.");
        
        if (game && typeof game.init === 'function') game.init();
        else console.error("App.init: game or game.init is not defined.");
        
        const startGameBtnEl = document.getElementById('startGameButton');
        if (startGameBtnEl) startGameBtnEl.addEventListener('click', () => this.startAIPlay());
        else console.warn("App.init: startGameButton not found.");

        const clearPathBtnEl = document.getElementById('clearPathButton');
        if (clearPathBtnEl) clearPathBtnEl.addEventListener('click', () => {
            if (editor && typeof editor.resetPath === 'function') editor.resetPath();
        });
        else console.warn("App.init: clearPathButton not found.");

        const backToMenuBtnEl = document.getElementById('backToMenuButton');
        if(backToMenuBtnEl) backToMenuBtnEl.addEventListener('click', () => this.goToMenu());
        else console.warn("App.init: backToMenuButton (main game screen) not found.");

        if (typeof initUI === 'function') initUI(this.selectLevel.bind(this));
        else console.error("App.init: initUI function is not defined (from ui.js).");

        if (nextLevelOrRetryButton) {
            nextLevelOrRetryButton.addEventListener('click', () => {
                hideLevelResults();
                const wasLevelActuallyPassed = this.currentLevelPassedCriteriaMet;

                if (wasLevelActuallyPassed) {
                    const currentIndex = GAME_LEVELS.findIndex(l => l.id === this.currentLevelId);
                    if (currentIndex !== -1 && currentIndex < GAME_LEVELS.length - 1) {
                        const nextLvlId = GAME_LEVELS[currentIndex + 1].id;
                        if (isLevelUnlocked(nextLvlId, GAME_LEVELS)) this.selectLevel(nextLvlId);
                        else this.goToMenu();
                    } else this.goToMenu();
                } else { 
                    this.gameState = GameState.EDITOR;
                    if (game && typeof game.resetBonusesForLevel === 'function') game.resetBonusesForLevel();
                    if (editor && typeof editor.drawEditor === 'function') editor.drawEditor();
                    const editorControlsEl = document.getElementById('editorControls');
                    if(editorControlsEl) editorControlsEl.style.display = 'flex';
                    const startGameBtnInnerEl = document.getElementById('startGameButton');
                    if(startGameBtnInnerEl) startGameBtnInnerEl.disabled = false;
                }
            });
        }
        if (resultBackToMenuButton) {
            resultBackToMenuButton.addEventListener('click', () => {
                hideLevelResults();
                this.goToMenu();
            });
        }
        this.goToMenu();
        console.log("App.init: Application initialization complete. Navigating to menu.");
    },

    goToMenu() {
        hideLevelResults();
        if (game && typeof game.stopGame === 'function') game.stopGame();
        this.gameState = GameState.MENU;
        if (typeof showMenuScreen === 'function') showMenuScreen();
        else console.error("goToMenu: showMenuScreen is not defined (from ui.js).");
        if (this.userPath && typeof this.userPath.clear === 'function') this.userPath.clear();
        const levelSelectScreenEl = document.getElementById('levelSelectScreen');
        if (levelSelectScreenEl) levelSelectScreenEl.style.display = 'flex';
        const gameScreenEl = document.getElementById('gameScreen');
        if (gameScreenEl) gameScreenEl.style.display = 'none';
    },

    selectLevel(levelId) {
        hideLevelResults();
        const levelData = GAME_LEVELS.find(l => l.id === levelId);
        if (!levelData) { console.warn("selectLevel: Level data not found for ID:", levelId); return; }
        if (!isLevelUnlocked(levelId, GAME_LEVELS)) { console.warn("selectLevel: Level locked:", levelId); return; }
        this.currentLevelId = levelId;
        this.gameState = GameState.EDITOR;
        if (typeof showGameScreen === 'function') showGameScreen(levelData);
        else console.error("selectLevel: showGameScreen is not defined (from ui.js).");
        if (editor && typeof editor.setCurrentLevel === 'function') editor.setCurrentLevel(levelData);
        else console.error("selectLevel: editor or editor.setCurrentLevel is not defined.");
        const startGameBtnEl = document.getElementById('startGameButton');
        if(startGameBtnEl) startGameBtnEl.disabled = false;
        const editorControlsEl = document.getElementById('editorControls');
        if(editorControlsEl) editorControlsEl.style.display = 'flex';
        const gameControlsEl = document.getElementById('gameControls');
        if(gameControlsEl) gameControlsEl.style.display = 'flex';
        const levelSelectScreenEl = document.getElementById('levelSelectScreen');
        if (levelSelectScreenEl) levelSelectScreenEl.style.display = 'none';
        const gameScreenEl = document.getElementById('gameScreen');
        if (gameScreenEl) gameScreenEl.style.display = 'flex';
    },
    
    startAIPlay() {
        if (this.gameState !== GameState.EDITOR || !this.currentLevelId) return;
        if (!this.userPath || !this.userPath.controlPoints || this.userPath.controlPoints.length < 2) {
            alert("Будь ласка, намалюйте шлях з щонайменше двома точками!"); return;
        }
        const pathSegmentsForAI = editor.getPathSegments(); 
        this.gameState = GameState.PLAYING_AI;
        const editorControlsEl = document.getElementById('editorControls');
        if(editorControlsEl) editorControlsEl.style.display = 'none';
        const startGameBtnEl = document.getElementById('startGameButton');
        if(startGameBtnEl) startGameBtnEl.disabled = true;
        const levelData = GAME_LEVELS.find(l => l.id === this.currentLevelId);
        if (game && typeof game.startLevel === 'function' && levelData) {
            game.startLevel(levelData, this.userPath, pathSegmentsForAI); 
        } else { 
            if(!levelData) console.error("startAIPlay: levelData not found for currentLevelId:", this.currentLevelId);
            if(!game || typeof game.startLevel !== 'function') console.error("startAIPlay: game or game.startLevel is not defined.");
        }
    },

    endGame(aiFinishedPath) {
        const currentScore = (game && typeof game.gameScore !== 'undefined') ? game.gameScore : 0;
        const allGameBonuses = (game && game.gameBonuses && Array.isArray(game.gameBonuses)) ? game.gameBonuses : [];
        const collectedNormalBonuses = allGameBonuses.filter(b => b.type === 'normal' && b.collected);
        const collectedEdgeBonuses = allGameBonuses.filter(b => b.type === 'edge' && b.collected);
        console.log(`endGame: Retrieved score: ${currentScore}, normal: ${collectedNormalBonuses.length}, edge: ${collectedEdgeBonuses.length}`);

        if (game && typeof game.stopGame === 'function') game.stopGame();
        this.gameState = GameState.LEVEL_COMPLETE;
        
        const currentLevelData = GAME_LEVELS.find(l => l.id === this.currentLevelId);
        if (!currentLevelData) {
            this.currentLevelPassedCriteriaMet = false; 
            showLevelResults("Помилка", "Дані рівня не знайдено.", currentScore, collectedNormalBonuses.length, 0, collectedEdgeBonuses.length, 0, false, this.currentLevelId);
            return;
        }

        const totalNormalBonusesOnLevel = currentLevelData.bonuses ? currentLevelData.bonuses.length : 0;
        const totalEdgeBonusesOnLevel = currentLevelData.edgeBonuses ? currentLevelData.edgeBonuses.length : 0;
        let title = "", message = "";
        this.currentLevelPassedCriteriaMet = false; 

        if (aiFinishedPath) {
            let tempLevelPassed = (totalEdgeBonusesOnLevel > 0) ? (collectedEdgeBonuses.length >= totalEdgeBonusesOnLevel) : true;
            if (tempLevelPassed && totalNormalBonusesOnLevel > 0) {
                 tempLevelPassed = collectedNormalBonuses.length >= Math.ceil(totalNormalBonusesOnLevel * 0.5); 
            }
            this.currentLevelPassedCriteriaMet = tempLevelPassed;

            if (this.currentLevelPassedCriteriaMet) {
                title = "Рівень Пройдено!";
                message = `Вітаємо з проходженням рівня "${currentLevelData.name}"!`;
                if (typeof markLevelAsCompleted === 'function') markLevelAsCompleted(this.currentLevelId);
            } else {
                title = "Спробуйте Ще!";
                message = `На жаль, рівень "${currentLevelData.name}" не пройдено.`;
                if (totalEdgeBonusesOnLevel > 0 && collectedEdgeBonuses.length < totalEdgeBonusesOnLevel) {
                    message += " Необхідно зібрати всі ключові бонуси.";
                } else if (totalNormalBonusesOnLevel > 0 && collectedNormalBonuses.length < Math.ceil(totalNormalBonusesOnLevel * 0.5)) {
                    message += " Потрібно зібрати більше звичайних бонусів.";
                }
            }
        } else {
            title = "Гра Зупинена"; message = "Рух було перервано."; 
            this.currentLevelPassedCriteriaMet = false;
        }
        
        showLevelResults(title, message, currentScore, 
                         collectedNormalBonuses.length, totalNormalBonusesOnLevel,
                         collectedEdgeBonuses.length, totalEdgeBonusesOnLevel,
                         this.currentLevelPassedCriteriaMet, this.currentLevelId);
        
        if (editor && typeof editor.drawEditor === 'function') editor.drawEditor();
    },
};

window.addEventListener('load', () => {
    if (typeof App !== 'undefined' && typeof App.init === 'function') App.init();
    else {
        console.error("CRITICAL: App object or App.init is not defined at window load time! Game will not run.");
        document.body.innerHTML = "<h1 style='color:red; text-align:center;'>Критична помилка завантаження гри.</h1>";
    }
});