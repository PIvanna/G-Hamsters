const levelSelectScreen = document.getElementById('levelSelectScreen');
const levelsGrid = document.getElementById('levelsGrid');
const gameScreen = document.getElementById('gameScreen');
const editorControlsUI = document.getElementById('editorControls'); 

let _appSelectLevelCallback = null;

function initUI(selectLevelCallback) {
    if (typeof selectLevelCallback === 'function') {
        _appSelectLevelCallback = selectLevelCallback;
        console.log("UI Initialized with selectLevelCallback.");
    } else {
        console.error("initUI: selectLevelCallback is not a function or not provided!");
    }
}

function createLevelCard(levelData, onSelectLevel) {
    const card = document.createElement('div');
    card.className = 'level-card';
    card.dataset.levelId = levelData.id;

    const previewCanvas = document.createElement('canvas');
    const previewCanvasWidth = 250; 
    const previewCanvasHeight = 150; 
    previewCanvas.width = previewCanvasWidth;
    previewCanvas.height = previewCanvasHeight;
    card.appendChild(previewCanvas);

    const nameEl = document.createElement('div');
    nameEl.className = 'level-card-name';
    nameEl.textContent = levelData.name || `Рівень ${levelData.id}`;
    card.appendChild(nameEl);

    const playOverlay = document.createElement('div');
    playOverlay.className = 'play-overlay';
    playOverlay.textContent = 'Грати!';
    card.appendChild(playOverlay);

    const ctx = previewCanvas.getContext('2d');

    if (levelData.roadSegments && Array.isArray(levelData.roadSegments) && levelData.roadSegments.length > 0) {
        if (typeof drawExtendedRoad === 'function') {
            drawExtendedRoad(
                ctx, 
                levelData.roadSegments, 
                previewCanvasWidth,     
                previewCanvasHeight,    
                { 
                    roadColor: '#8a8a8a',
                    roadLineWidth: 4,   
                    centerLine: false,  
                    extColor: '#a0a0a0', 
                    extLineWidth: 3,
                    extMargin: 20       
                }
            );
        } else { 
            const резервнийPreviewRoad = new ArbitraryOrderBezier();
            levelData.roadSegments.forEach(normPt => {
                if (normPt && typeof normPt.x === 'number' && typeof normPt.y === 'number') {
                    const scaledPt = scalePointToCanvas(normPt, previewCanvasWidth, previewCanvasHeight); 
                    if (scaledPt) резервнийPreviewRoad.addControlPoint(scaledPt);
                }
            });
            if (резервнийPreviewRoad.controlPoints.length >= 2) {
                резервнийPreviewRoad.drawCurve(ctx, { 
                    color: '#8a8a8a', 
                    lineWidth: 4,   
                    centerLine: false 
                });
            }
        }

        
        
        const previewRoadForBonuses = new ArbitraryOrderBezier();
        levelData.roadSegments.forEach(normPt => {
            if (normPt && typeof normPt.x === 'number' && typeof normPt.y === 'number') {
                 const scaledPt = scalePointToCanvas(normPt, previewCanvasWidth, previewCanvasHeight); 
                 if (scaledPt) previewRoadForBonuses.addControlPoint(scaledPt);
            }
        });

        if (previewRoadForBonuses.controlPoints.length >= 1) {
            if (levelData.edgeBonuses && Array.isArray(levelData.edgeBonuses)) {
                ctx.fillStyle = 'cyan';
                levelData.edgeBonuses.forEach(bonusData => {
                    if (typeof bonusData.t === 'number') {
                        const pos = previewRoadForBonuses.getPointAt(bonusData.t);
                        if (pos) { ctx.beginPath(); ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2); ctx.fill(); }
                    }
                });
            }
            if (levelData.bonuses && Array.isArray(levelData.bonuses)) {
                ctx.fillStyle = 'gold';
                levelData.bonuses.forEach(bonusData => {
                     if (typeof bonusData.t === 'number') {
                        const pos = previewRoadForBonuses.getPointAt(bonusData.t);
                        if (pos) { ctx.beginPath(); ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2); ctx.fill(); }
                    }
                });
            }
        }
    } else {
    }
    
    const unlocked = isLevelUnlocked(levelData.id, GAME_LEVELS);
    if (!unlocked) {
        card.classList.add('locked');
    } else {
        if (typeof onSelectLevel === 'function') {
            card.addEventListener('click', () => onSelectLevel(levelData.id));
        } else {
        }
    }
    return card;
}

function displayLevelsMenu(levelsData, onSelectLevel) {
    if (!levelsGrid) { console.error("Element with ID 'levelsGrid' not found."); return; }
    if (!levelsData) { 
        levelsGrid.innerHTML = "<p style='color:red;'>Дані про рівні не завантажені.</p>";
        return; 
    }
    levelsGrid.innerHTML = '';
    if (levelsData.length === 0) {
        levelsGrid.innerHTML = "<p>Наразі немає доступних рівнів.</p>";
        return;
    }
    levelsData.forEach(level => {
        const card = createLevelCard(level, onSelectLevel);
        levelsGrid.appendChild(card);
    });
}

function showGameScreen(levelData) { 
    if(levelSelectScreen) levelSelectScreen.style.display = 'none';
    if(gameScreen) gameScreen.style.display = 'flex';
    if(editorControlsUI) editorControlsUI.style.display = 'flex'; 
    
    const currentLevelDisplayEl = document.getElementById('currentLevelDisplay');
    if(currentLevelDisplayEl) currentLevelDisplayEl.textContent = levelData.name;
    const scoreDisplayEl = document.getElementById('scoreDisplay');
    if(scoreDisplayEl) scoreDisplayEl.textContent = '0'; 
}

function showMenuScreen() {
    if(levelSelectScreen) levelSelectScreen.style.display = 'flex';
    if(gameScreen) gameScreen.style.display = 'none';
    if(editorControlsUI) editorControlsUI.style.display = 'none';
    
    if (typeof GAME_LEVELS !== 'undefined' && typeof _appSelectLevelCallback === 'function') {
        displayLevelsMenu(GAME_LEVELS, _appSelectLevelCallback);
    } else {
        let errorMsg = "showMenuScreen: Cannot display levels menu. ";
        if (typeof GAME_LEVELS === 'undefined') errorMsg += "GAME_LEVELS is not defined. ";
        if (typeof _appSelectLevelCallback !== 'function') errorMsg += "_appSelectLevelCallback is not set. ";
        console.error(errorMsg);
        if (levelsGrid) levelsGrid.innerHTML = "<p style='color:red;'>Помилка завантаження меню рівнів.</p>";
    }
}