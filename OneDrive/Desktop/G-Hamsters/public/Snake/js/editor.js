let mainCanvas, mainCtx;
let currentEditorPath = null; 
let currentLevelData = null;

let draggingPointIndex = -1;    
let dragStartPosCanvas = null;  
let isCtrlPressed = false;      
let isAltPressed = false;

let previewSnapPointNormalized = null; 
let activeSnapType = null;        
let hoveredPointIndex = -1;       
let hoveredLineSegmentIndex = -1; 

const SNAP_THRESHOLD_POINT_PX = 15; 
const SNAP_THRESHOLD_LINE_PX = 7;  

var lastMouseX = 0; 
var lastMouseY = 0;

const editor = {
    init(canvasElement, pathInstance) {
        mainCanvas = canvasElement;
        if (!mainCanvas) {
            console.error("editor.init: canvas element not provided or not found!");
            return;
        }
        mainCtx = mainCanvas.getContext('2d');
        if (!mainCtx) {
            console.error("editor.init: Failed to get 2D context from canvas!");
            return;
        }
        currentEditorPath = pathInstance; 

        mainCanvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        mainCanvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        mainCanvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        mainCanvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
        
        mainCanvas.addEventListener('mousemove', (e) => {
            const rect = mainCanvas.getBoundingClientRect();
            lastMouseX = e.clientX - rect.left;
            lastMouseY = e.clientY - rect.top;
        }, true);


        window.addEventListener('keydown', (e) => {
            let needsUpdate = false;
            if (e.key === 'Alt' && !isAltPressed) { isAltPressed = true; needsUpdate = true; }
            if (e.key === 'Control' && !isCtrlPressed) { isCtrlPressed = true; needsUpdate = true; } 
            if (needsUpdate) this.updateDynamicElements();
        });
        window.addEventListener('keyup', (e) => {
            let needsUpdate = false;
            if (e.key === 'Alt') { isAltPressed = false; needsUpdate = true; }
            if (e.key === 'Control') { isCtrlPressed = false; needsUpdate = true; } 
            if (needsUpdate) this.updateDynamicElements();
        });
        console.log("Editor initialized.");
    },

    updateDynamicElements(mousePosNormalizedIfAvailable = null) {
        if (App.gameState !== GameState.EDITOR || !currentEditorPath || !mainCanvas) {
            if (mainCanvas) mainCanvas.style.cursor = 'default';
            previewSnapPointNormalized = null;
            activeSnapType = null;
            if (this.isInitialized()) this.drawEditor();
            return;
        }

        const mousePosNorm = mousePosNormalizedIfAvailable || 
                             (mainCanvas ? normalizePointFromCanvas(getMousePos(mainCanvas, {clientX: lastMouseX, clientY: lastMouseY}), mainCanvas.width, mainCanvas.height) : null);

        hoveredPointIndex = -1;
        hoveredLineSegmentIndex = -1;

        if (mousePosNorm && draggingPointIndex === -1) {
            previewSnapPointNormalized = mousePosNorm; 
            activeSnapType = null;

            const scaleFactorX = mainCanvas.width / LOGICAL_GRID_SIZE; 
            const normalizedSnapThresholdPoint = SNAP_THRESHOLD_POINT_PX / scaleFactorX;
            const normalizedSnapThresholdLine = SNAP_THRESHOLD_LINE_PX / scaleFactorX;

            if (currentEditorPath.controlPoints && currentEditorPath.controlPoints.length > 0) { 
                const nearPointIdx = currentEditorPath.findPointNear(mousePosNorm.x, mousePosNorm.y, normalizedSnapThresholdPoint);
                if (nearPointIdx !== -1) {
                    previewSnapPointNormalized = new Point(currentEditorPath.controlPoints[nearPointIdx].x, currentEditorPath.controlPoints[nearPointIdx].y);
                    activeSnapType = 'point';
                    hoveredPointIndex = nearPointIdx;
                } else {
                    if (currentEditorPath.controlPoints.length >= 2) { 
                        const nearLineIdx = currentEditorPath.findLineSegmentNear(mousePosNorm.x, mousePosNorm.y, normalizedSnapThresholdLine);
                        if (nearLineIdx !== -1) {
                            const p1_norm = currentEditorPath.controlPoints[nearLineIdx];
                            const p2_norm = currentEditorPath.controlPoints[nearLineIdx + 1];
                            if (p1_norm && p2_norm) { 
                                previewSnapPointNormalized = closestPointOnLineSegment(mousePosNorm, p1_norm, p2_norm);
                                activeSnapType = 'line';
                                hoveredLineSegmentIndex = nearLineIdx;
                            }
                        }
                    }
                }
            }
        } else if (draggingPointIndex === -1) { 
            previewSnapPointNormalized = null;
            activeSnapType = null;
        }
        
        this._updateCursorInternal();
        if (this.isInitialized()) this.drawEditor();
    },
    
    _updateCursorInternal() {
        if (!mainCanvas) return;
        if (draggingPointIndex !== -1) { 
            mainCanvas.style.cursor = 'grabbing';
        } else if (isAltPressed && hoveredPointIndex !== -1) { 
            mainCanvas.style.cursor = 'pointer'; 
        } else if (hoveredPointIndex !== -1) { 
             mainCanvas.style.cursor = 'grab';
        } else if (hoveredLineSegmentIndex !== -1) { 
            mainCanvas.style.cursor = 'crosshair';
        }
        else {
            mainCanvas.style.cursor = 'crosshair'; 
        }
    },
    
    isInitialized() {
        return !!(mainCanvas && mainCtx && currentEditorPath);
    },

    setCurrentLevel(level) {
        currentLevelData = level;
        if (!this.isInitialized() || typeof currentEditorPath.clear !== 'function') {
            console.error("editor.setCurrentLevel: Editor or currentEditorPath not properly initialized.");
            return;
        }
        currentEditorPath.clear();
        
        if (game && typeof game.resetBonusesForLevel === 'function' && App.currentLevelId) {
            game.resetBonusesForLevel();
        }
        this.updateDynamicElements();
    },

    handleMouseMove(e) {
        if (App.gameState !== GameState.EDITOR || !this.isInitialized()) return;
        
        const mousePosCanvas = getMousePos(mainCanvas, e);
        lastMouseX = e.clientX; 
        lastMouseY = e.clientY;
        const mousePosNormalized = normalizePointFromCanvas(mousePosCanvas, mainCanvas.width, mainCanvas.height);

        if (draggingPointIndex !== -1) { 
            if (currentEditorPath && typeof currentEditorPath.moveControlPoint === 'function') {
                currentEditorPath.moveControlPoint(draggingPointIndex, mousePosNormalized);
                this.updateDynamicElements(mousePosNormalized); 
            }
        } else {
            this.updateDynamicElements(mousePosNormalized);
        }
    },
    
    handleMouseDown(e) {
        if (App.gameState !== GameState.EDITOR || !this.isInitialized() || !previewSnapPointNormalized) {
             if(!previewSnapPointNormalized && mainCanvas) { 
                const mousePosCanvasFallback = getMousePos(mainCanvas, e);
                previewSnapPointNormalized = normalizePointFromCanvas(mousePosCanvasFallback, mainCanvas.width, mainCanvas.height);
             } else if (!previewSnapPointNormalized) {
                return; 
             }
        }
        
        const mousePosCanvas = getMousePos(mainCanvas, e); 
        const mousePosNormalized = normalizePointFromCanvas(mousePosCanvas, mainCanvas.width, mainCanvas.height);

        if (!currentEditorPath.controlPoints) { return; }

        const scaleFactorX = mainCanvas.width / LOGICAL_GRID_SIZE;
        const normalizedSnapThresholdPoint = SNAP_THRESHOLD_POINT_PX / scaleFactorX;
        const actualClickedPointIndex = currentEditorPath.findPointNear(mousePosNormalized.x, mousePosNormalized.y, normalizedSnapThresholdPoint);

        if (isAltPressed) { 
            if (actualClickedPointIndex !== -1) { 
                currentEditorPath.deleteControlPoint(actualClickedPointIndex);
                console.log("Alt-Click: Deleted point", actualClickedPointIndex);
                if(currentEditorPath.controlPoints.length === 0) {
                    previewSnapPointNormalized = mousePosNormalized; 
                    activeSnapType = null;
                }
            }
        } else { 
            if (actualClickedPointIndex !== -1) { 
                draggingPointIndex = actualClickedPointIndex;
                console.log("Click: Start dragging point", draggingPointIndex);
            } else { 
                draggingPointIndex = -1;
                if (activeSnapType === 'line' && hoveredLineSegmentIndex !== -1) {
                    currentEditorPath.insertControlPoint(new Point(previewSnapPointNormalized.x, previewSnapPointNormalized.y), hoveredLineSegmentIndex + 1);
                    console.log("Clicked on line: Inserted point at index", hoveredLineSegmentIndex + 1);
                } else { 
                     const maxPoints = currentLevelData ? currentLevelData.maxUserPoints : Infinity;
                     if (currentEditorPath.controlPoints.length < maxPoints) {
                        currentEditorPath.addControlPoint(new Point(previewSnapPointNormalized.x, previewSnapPointNormalized.y));
                        console.log("Added new control point at snap/mouse position.");
                    } else {
                        console.log("Max user-added points limit reached.");
                    }
                }
            }
        }
        this.updateDynamicElements(mousePosNormalized);
    },

    handleMouseUp() {
        if (App.gameState !== GameState.EDITOR) return;
        if (draggingPointIndex !== -1) {
            console.log("MouseUp: Finished dragging point", draggingPointIndex);
        }
        draggingPointIndex = -1;
        this.updateDynamicElements(); 
    },
    
    handleMouseLeave() {
        if (App.gameState !== GameState.EDITOR) return;
        if (draggingPointIndex !== -1) {
            draggingPointIndex = -1;
        }
        this.updateDynamicElements(null); 
    },

    drawEditor() {
        if (!this.isInitialized()) {console.warn("editor.drawEditor called before init."); return;}
        mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);

        if (currentLevelData && currentLevelData.roadSegments && currentLevelData.roadSegments.length > 0) {
            const roadLevelCurveCanvas = new ArbitraryOrderBezier();
            currentLevelData.roadSegments.forEach(normPt => {
                const scaledPt = scalePointToCanvas(normPt, mainCanvas.width, mainCanvas.height);
                if (scaledPt) roadLevelCurveCanvas.addControlPoint(scaledPt);
            });

            if (roadLevelCurveCanvas.controlPoints.length >= 2) {
                if (typeof drawExtendedRoad === 'function') {
                     drawExtendedRoad(mainCtx, currentLevelData.roadSegments, mainCanvas.width, mainCanvas.height, {
                        roadColor: '#BBDEFB', lineWidth: 20, centerLine: true, 
                        centerLineWidth: 2, centerLineColor: '#fff', centerLineDash: [10,10],
                        extColor: '#AACCFF', extLineWidth: 20 
                     });
                } else { 
                    console.log("Editor: drawExtendedRoad not found, drawing simple road curve."); 
                    roadLevelCurveCanvas.drawCurve(mainCtx, { 
                        color: '#BBDEFB', 
                        lineWidth: 20,    
                        centerLine: true, 
                        centerLineWidth: 2, 
                        centerLineColor: '#fff', 
                        centerLineDash: [10,10] 
                    });

                }
            } else {
                console.log("Editor: Not enough control points to draw road curve.", roadLevelCurveCanvas.controlPoints.length); 
            }
        }

        const roadPathForBonusesCanvas = new ArbitraryOrderBezier(); 
        if (currentLevelData && currentLevelData.roadSegments && currentLevelData.roadSegments.length > 0) {
            currentLevelData.roadSegments.forEach(normPt => {
                 const scaledPt = scalePointToCanvas(normPt, mainCanvas.width, mainCanvas.height);
                 if(scaledPt) roadPathForBonusesCanvas.addControlPoint(scaledPt);
            });
        }
        
        if (currentLevelData && roadPathForBonusesCanvas.controlPoints.length >=1) {
            const allBonusesToDraw = [];
            if (currentLevelData.edgeBonuses) allBonusesToDraw.push(...currentLevelData.edgeBonuses.map(b => ({...b, type: b.type || 'edge'})));
            if (currentLevelData.bonuses) allBonusesToDraw.push(...currentLevelData.bonuses.map(b => ({...b, type: b.type || 'normal'})));
            
            allBonusesToDraw.forEach(bonusData => {
                let isCollectedInGame = false;
                if (game && game.gameBonuses && Array.isArray(game.gameBonuses) && game.gameBonuses.length > 0) {
                    const gameBonusInstance = game.gameBonuses.find(gb => gb.id === bonusData.id);
                    if (gameBonusInstance) isCollectedInGame = gameBonusInstance.collected;
                }
                const pos = roadPathForBonusesCanvas.getPointAt(bonusData.t); 
                if (pos) { 
                    let fillColor, strokeColor, radius, lineWidthVal;
                    mainCtx.globalAlpha = 1.0;
                    if (bonusData.type === 'edge') {
                        radius = 9; lineWidthVal = 2;
                        fillColor = isCollectedInGame ? 'rgba(0, 200, 200, 0.8)' : 'rgba(0, 200, 230, 0.8)';
                        strokeColor = isCollectedInGame ? 'rgba(0, 150, 150, 0.8)' : 'rgba(0, 150, 200, 0.8)';
                    } else { 
                        radius = 7; lineWidthVal = 1;
                        if (isCollectedInGame && App.gameState === GameState.EDITOR) { 
                             fillColor = 'rgba(255, 215, 0, 0.3)'; 
                             strokeColor = 'rgba(200, 160, 0, 0.5)';
                        } else if (isCollectedInGame) { 
                            return;
                        }
                        else {
                            fillColor = 'gold'; strokeColor = 'darkorange';
                        }
                    }
                    mainCtx.fillStyle = fillColor; mainCtx.strokeStyle = strokeColor; mainCtx.lineWidth = lineWidthVal;
                    mainCtx.beginPath(); mainCtx.arc(pos.x, pos.y, radius, 0, Math.PI * 2); mainCtx.fill();
                    if (bonusData.type === 'edge' || !isCollectedInGame) mainCtx.stroke();
                }
            });
        }

        if (currentEditorPath && currentEditorPath.controlPoints && currentEditorPath.controlPoints.length > 0) {
            const userPathCanvas = new ArbitraryOrderBezier();
            currentEditorPath.controlPoints.forEach(normPt => {
                const scaledPt = scalePointToCanvas(normPt, mainCanvas.width, mainCanvas.height);
                if (scaledPt) userPathCanvas.addControlPoint(scaledPt);
            });
            if (userPathCanvas.controlPoints.length >= 2) {
                userPathCanvas.drawCurve(mainCtx, { color: 'rgba(0, 150, 200, 0.7)', lineWidth: 6 });
                userPathCanvas.drawControlPolyline(mainCtx);
            } else if (userPathCanvas.controlPoints.length === 1) {
                 userPathCanvas.drawControlPolyline(mainCtx); 
            }
        }

        if (previewSnapPointNormalized && App.gameState === GameState.EDITOR && draggingPointIndex === -1) {
            if (!isAltPressed) { 
                const snapPointCanvas = scalePointToCanvas(previewSnapPointNormalized, mainCanvas.width, mainCanvas.height);
                if (snapPointCanvas) {
                    const pointRadius = (currentEditorPath && currentEditorPath.pointRadius) ? currentEditorPath.pointRadius : 7;
                    mainCtx.beginPath();
                    mainCtx.arc(snapPointCanvas.x, snapPointCanvas.y, pointRadius -1, 0, Math.PI * 2); 
                    mainCtx.fillStyle = (activeSnapType === 'line' || activeSnapType === 'point') ? 'rgba(0, 255, 0, 0.6)' : 'rgba(0, 255, 0, 0.4)';
                    mainCtx.fill();
                   
                    mainCtx.strokeStyle = 'rgba(0,150,0,0.9)'; mainCtx.lineWidth = 1; mainCtx.stroke();
                }
            }
        }
    },

    getPathSegments() { 
        if (!currentEditorPath || !currentEditorPath.controlPoints || currentEditorPath.controlPoints.length < 2) return [];
        const pseudoSegment = { 
            getPointAt: (t) => {
                const normalizedPointOnUserPath = currentEditorPath.getPointAt(t);
                if (normalizedPointOnUserPath) {
                    if (typeof App !== 'undefined' && App.mainCanvasElement) {
                         return scalePointToCanvas(normalizedPointOnUserPath, App.mainCanvasElement.width, App.mainCanvasElement.height);
                    }
                    return null;
                }
                return null;
            }
        };
        return [pseudoSegment];
    },
    
    resetPath() {
        if (currentEditorPath) {
            currentEditorPath.clear();
            this.updateDynamicElements(); 
            console.log("Editor: Path reset by user.");
        }
    }
};