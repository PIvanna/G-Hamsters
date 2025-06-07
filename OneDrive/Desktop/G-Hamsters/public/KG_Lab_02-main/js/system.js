

let isLoggingEnabled = true;

function logFunctionName(functionName) {
  if (isLoggingEnabled) {
    console.log(`Function called: ${functionName}`);
  }
}
 
let sizeCanvas;
let coefC = 2;

const canvasMain = getElement("#canvas-main");
const ctx = canvasMain?.getContext("2d");

const canvasMainCurve = getElement("#canvas-main-curve");
const ctxCur = canvasMainCurve?.getContext("2d");

const canvasBuffer = document.createElement("canvas");
const сtxBuffer = canvasBuffer.getContext("2d");

const resizeObserver = new ResizeObserver(() => {
  if (!currentProject) return;
  updateCanvasSize();
  if (isResizing && currentWindow === windows.projects) return; 
  drawSystem();
  drawCurve();
});
resizeObserver.observe(canvasMain);

window.addEventListener("load", updateCanvasSize());

function updateCanvasSize() {
  logFunctionName("updateCanvasSize");
  let sizeReal = new Pair(
    canvasMain.offsetWidth, 
    canvasMain.offsetHeight
  );
  sizeCanvas = sizeReal.mulCO(coefC);
  canvasMainCurve.width = sizeCanvas.x;
  canvasMainCurve.height = sizeCanvas.y;
  canvasMain.width = sizeCanvas.x;
  canvasMain.height = sizeCanvas.y;
}



const deleteCurveButton = getElement("#control-button-delete");
deleteCurveButton.addEventListener("click", deleteCurrentCurve);

document.addEventListener("keydown", (event) => {
  if (leave) return;

  if (event.key === "Delete") { 
    if (isCtrlPressed) {
      deleteAllCurves();
    } else {
      deleteCurrentCurve();
    }
  }
});

function deleteAllCurves() {
  logFunctionName("deleteAllCurves");
  currentProject.curves = [];
  currentProject.segments = [];

  currentSegment = undefined;
  currentMaxPolynoms.value = 0;
  startPolynomInput.value = 0;
  endPolynomInput.value = 0;

  currentLineI = undefined;
  currentCurve = undefined;
  updateGlueToggle();

  currentPoint = undefined;
  lastCurrentPoint = undefined;
  drawCurve();
}

function spliceCurrentCurve() {
  logFunctionName("spliceCurrentCurve");
  let index = currentProject.curves.indexOf(currentCurve);
  if (index !== -1) {
    currentProject.curves.splice(index, 1);
  }
}

function deleteCurrentCurve() {
  logFunctionName("deleteCurrentCurve");
  if (currentCurve) {
    pointPanel.innerHTML = "";
    if (!glueToggle.checked) {
      let index = currentProject.segments.indexOf(currentCurve[0].segment);
      if (index !== -1) {
        currentProject.segments.splice(index, 1);
      }
    } else {
      for (let i = 0; i < currentCurve.length; i++) {
        if (currentCurve[i].isBase) {
          let index = currentProject.segments.indexOf(currentCurve[i].segment[0]);
          if (index !== -1) {
            currentProject.segments.splice(index, 1);
          }
        }
      }
    }
    
    spliceCurrentCurve();

    currentSegment = undefined;
    currentMaxPolynoms.value = 0;
    startPolynomInput.value = 0;
    endPolynomInput.value = 0;
    currentLineI = undefined;
    currentCurve = undefined;
    updateGlueToggle();

    currentPoint = undefined;
    lastCurrentPoint = undefined;

    drawCurve();
  }
}


let currentSegment;
let currentPoint;
let lastCurrentPoint;


let maxGridSize = 29 * coefC;
let minGridSize = 14 * coefC;
let curGridSize = (maxGridSize + minGridSize) / 2;

let curDivsNumbr = 0;
let curDivsValue = 1;

let midlReal;
let midlDrag;

let dragOffset = new Pair(0, 0);

let isDragging = false; 
let isSpacePressed = false;  
let startDragCoords;  

let startPosPentool;
let curPosPentool;
let lastPosPentool;

let clickOff = false;

function drawPoint(p, o, isActivePoint = 1) {
  // logFunctionName("drawPoint");
  let point = (p instanceof Point) ? p.getPos() : p;

  if (o) {
    let other = (o instanceof Point) ? o.getPos() : o;
    let vec = other.subPO(point);

    let len = vec.len();
    let unitVec = vec.mulCO(1 / len);

    if (isActivePoint) {
      drawDiamond(point, unitVec, 5, colors.controlPoint);

      if (isActivePoint === 1) {
        drawDiamond(point, unitVec, 3, colors.white);
      }
    } 
  } else {
    if (isActivePoint) {
      ctxCur.fillStyle = colors.basePoint;
      ctxCur.beginPath();
      ctxCur.arc(point.x, point.y, 4 * coefC, 0, Math.PI * 2);
      ctxCur.fill();
 
      if (isActivePoint === 1) {
        ctxCur.fillStyle = colors.white;
        ctxCur.beginPath();
        ctxCur.arc(point.x, point.y, 2.5 * coefC, 0, Math.PI * 2);
        ctxCur.fill();
      }
    } 
  }
}

function drawDiamond(point, unitVec, len, color) {
  // logFunctionName("drawDiamond");
  let vec = unitVec.mulCO(coefC * len);
  let vecRot = vec.rotate90();
  ctxCur.fillStyle = color;

  ctxCur.beginPath();
  ctxCur.moveTo(point.x + vec.x, point.y + vec.y);
  ctxCur.lineTo(point.x + vecRot.x, point.y + vecRot.y);
  ctxCur.lineTo(point.x - vec.x, point.y - vec.y);
  ctxCur.lineTo(point.x - vecRot.x, point.y - vecRot.y);
  ctxCur.fill();
}

function drawLine(sP, eP, isTangent, isActiveCurve = true) {
  if (!isActiveCurve) return;

  let sPoint = (sP instanceof Point) ? sP.getPos() : sP;
  let ePoint = (eP instanceof Point) ? eP.getPos() : eP;

  ctxCur.lineWidth = 1 * coefC;

  
  if (isTangent === 1)
    ctxCur.strokeStyle = colors.tangentLine;
  else if (isTangent === 2) {
    ctxCur.lineWidth = 2 * coefC;
    ctxCur.strokeStyle = colors.activeCurve;
  } else if (isTangent === 3) {
    ctxCur.lineWidth = 2 * coefC;
    ctxCur.strokeStyle = colors.activeSegment;
  } else {
    ctxCur.strokeStyle = colors.nonTangentLine;
  }


  ctxCur.beginPath();
  ctxCur.moveTo(sPoint.x, sPoint.y);
  ctxCur.lineTo(ePoint.x, ePoint.y);
  ctxCur.stroke();
}

document.addEventListener("keydown", (event) => {
  if (leave) return;

  if (
    event.key === "c" || event.key === "C" || 
    event.key === "с" || event.key === "С"
  ) {
    if (canvasMainCurve.style.pointerEvents === "none") return;
    centerSystem();
  }
});

document.addEventListener("keydown", (event) => {
  if (leave) return;

  if (
    event.key === "r" || event.key === "R" || 
    event.key === "к" || event.key === "К"
  ) {
    if (canvasMainCurve.style.pointerEvents === "none") return;
    scaleCenterSystem();
  }
});

function centerSystem() {
  logFunctionName("centerSystem");
  dragOffset = new Pair(0, 0);
  drawSystem();
  drawCurve();
}

function scaleCenterSystem() {
  logFunctionName("scaleCenterSystem");
  curDivsValue = 1;
  curDivsNumbr = 0;
  curGridSize = (maxGridSize + minGridSize) / 2;
  centerSystem();
}

document.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    if (canvasMainCurve.style.pointerEvents === "none") return;
    if (!leave && !glueToggle.checked && !isSpacePressed) {
      deletePointGlued();
    }
    if (!isDragging && !isCtrlPressed) {
      if (
        canvasMainCurve.style.cursor !== "zoom-in" &&
        canvasMainCurve.style.cursor !== "zoom-out" 
      ) {
        canvasMainCurve.style.cursor = "grab";
      }
      drawCurve();
      isSpacePressed = true;
    }

  }
});

document.addEventListener("keyup", (event) => {
  if (event.code === "Space") {
    if (canvasMainCurve.style.pointerEvents === "none") return;

    isSpacePressed = false;
    canvasMainCurve.style.cursor = "default"; 

    if (lastPosPentool) {
      if (!glueToggle.checked ) {

        if (currentCurve && !leave) {
          addPoint(lastPosPentool, true, true);
          currentCurve.at(-1).segment.reCalcPoints();
          currentPoint = currentCurve.at(-1);
          drawCurve();
        }
      } else {
        drawPreview(lastPosPentool);
      }
    }
  } 
});


function drawCurve() {
  // logFunctionName("drawCurve");
  
  ctxCur.clearRect(0, 0, canvasMainCurve.width, canvasMainCurve.height);

  if (currentProject === undefined || !Array.isArray(currentProject.curves)) {
    return;
  }

  let linesMinCnt = 450;
  let lineLenghtLength = new Pair(
    sizeCanvas.x / curGridSize * curDivsValue / linesMinCnt,
    sizeCanvas.y / curGridSize * curDivsValue / linesMinCnt
  )
  Segment.maxDist = Math.min(lineLenghtLength.x, lineLenghtLength.y);

  let segments = currentProject.segments;

  segments.forEach((segment) => {
    segment.draw(0);
  });

  if (currentCurve) {
    if (!glueToggle.checked && currentCurve.length > 1) {
      currentCurve.at(-1).segment.draw(1);
    } else {
      currentCurve.forEach((point) => {
        if (point.segment && point.segment.length > 0)
          point.segment[0].draw(1);
      })
    }

  }

  if (currentSegment)
    currentSegment.draw(2);

  drawPolylineOne(currentCurve);
}

function drawPolylineOne(curve) {
  // logFunctionName("drawPolylineOne");
 
  if (!Array.isArray(curve)) return;

  for (let i = 0; i < curve.length - 1; i++) {
    let isTangent;

    if (i === currentLineI) {
      isTangent = 3;
    } else if (
      curve[i].isBase && !curve[i + 1].isBase || 
      !curve[i].isBase && curve[i + 1].isBase
    ) {
      isTangent = 1;
    } else if (curve[i].isBase && curve[i + 1].isBase)
      isTangent = 2;
    
    if (!curve[i].isBase || !curve[i + 1].isBase)
    drawLine(curve[i], curve[i + 1], isTangent);
    if (!curve[i].isBase) {
      if (curve[i - 1].isBase) {
        drawPoint(curve[i], curve[i - 1]);
      } else {
        drawPoint(curve[i], curve[i + 1]);
      }
    } else {
      drawPoint(curve[i], undefined);
    }

    if (!curve[i + 1].isBase) {
      if (curve[i].isBase) {
        drawPoint(curve[i + 1], curve[i]);
      } else {
        drawPoint(curve[i + 1], curve[i + 2]);
      }
    } else {
      drawPoint(curve[i + 1], undefined);
    }
    
    if (curve.length === 1) {
      drawPoint(curve[0], undefined);
    }       

    if (currentPoint && curve === currentCurve) {
      curve.forEach((point, index) => {
        if (point === currentPoint) {
          if (point.isBase)
            drawPoint(curve[index], undefined, 2);
          else if (index !== 0 && curve[index - 1].isBase)
            drawPoint(curve[index], curve[index - 1], 2);
          else 
            drawPoint(curve[index], curve[index + 1], 2);
        }
      });
    }
  }
  if (curve.length === 1) {
    drawPoint(curve[0], undefined, 2);
  }
}

let minDistPoints;
let minDistCurves;

function findMinDistPoints(curPosCursor) {
  logFunctionName("findMinDistPoints");
  let curves = currentProject.curves;
  let isInCurCurve = false;
  minDistPoints = undefined;
  minDistCurves = undefined;
  
  let minDist = Number.MAX_VALUE;

  curves.forEach((curve, index) => {

    for (let i = 0; i < curve.length; i++) {
      let dist = curPosCursor.dist(curve[i].getPos());
      if (minDistPoints && minDistPoints[0].id === curve[i].id) {
        minDistPoints.push(curve[i]);
        minDistCurves.push(curve);
        if (currentCurve === curve)
          isInCurCurve = true;
      } else if (dist < minDist) {
        minDist = dist;
        minDistPoints = [curve[i]];
        minDistCurves = [curve];
        if (currentCurve === curve)
          isInCurCurve = true;
        else 
          isInCurCurve = false;
      } 
    }       
  });

  if (minDist > minUseDist || !isInCurCurve) {
    minDistPoints = undefined;
    minDistCurves = undefined;
  }
}

function findMinDistSegment(curPosCursor) {
  logFunctionName("findMinDistSegment");
  let minDistSegment = undefined;
  let segments = currentProject.segments;
  let maxDist = minUseDist / curGridSize * curDivsValue / 2 * 1.25;

  for (let j = 0; j < segments.length; j++){
    let segment = segments[j];
    if (!segment.isLine) {
      let coef = segment.setMaxDist(maxDist);
      let points = segment.points;

      for (let i = 0; i < points.length; i += coef) {
        let dist = curPosCursor.dist(points[i].pair.coordsToPos());
        if (dist < minUseDist) {
          if (!currentCurve || currentCurve === segment.curve) {
            minDistSegment = segment;
            break;
          }
        }
      }
    } else {
      let p1 = segment.controls[0].cpy().coordsToPos();
      let p2 = segment.controls[1].cpy().coordsToPos();

      if (isOnLineClicked(p1, p2, curPosCursor)) {
        if (!currentCurve || currentCurve === segment.curve) {
          minDistSegment = segment;
          break;
        }
      }
    }
    
    if (minDistSegment)
      break;
  }

  return minDistSegment;
}

function findMinDistLine(curPosCursor) {
  logFunctionName("findMinDistLine");
  for (let i = 0; i < currentCurve.length - 1; i++) {
    
    if (isOnLineClicked(currentCurve[i].pair, currentCurve[i + 1].pair, curPosCursor)) {
      return i;
    }
  }
}

function isOnLineClicked(p1, p2, curPosCursor) {
  logFunctionName("isOnLineClicked");
  let vec = p2.subPO(p1);
  let len = vec.len();
  let minDist = minUseDist / 2 * 1.25;
  let cnt = len / minDist + 1;
  vec.mulC(1 / len);
  vec.mulC(minDist);

  let point = p1.cpy();

  for (let i = 0; i < cnt; i++) {
    let dist = curPosCursor.dist(point);
    if (dist < minUseDist) {
      return true;
    }
    point.addP(vec);
  }
}

function chooseCurve(curve) {
  logFunctionName("chooseCurve");
  currentCurve = curve;
  updateGlueToggle();
  if (currentCurve[0].segment[0]) {
    glueToggle.checked = true;
  } else {
    glueToggle.checked = false;
  }

  currentPoint = currentCurve.at(-1);

  if (glueToggle.checked) {
    lastPoint = currentCurve.at(-1);
    if (lastPoint.isSoft) {
      prevPoint = currentCurve.at(-2);
      let prevBase = currentCurve.at(-4);
      let vec = lastPoint.getPos().subPO(prevPoint.getPos());

      if (!prevBase.isSoft) {
        vec.mulC(5/4);
      } 
      let point = lastPoint.getPos().addPO(vec);
      addPoint(point, false)
    }
  }

  pointPanel.innerHTML = "";
  currentCurve.forEach((curve) => {
    pointPanel.append(curve.item);
  });
}

function unChooseCurve() {
  logFunctionName("unChooseCurve");
  if (Array.isArray(currentCurve)) {
    if (currentCurve.length <= 2) {
      if (currentCurve.length == 2 && currentCurve[0].isBase && currentCurve[1].isBase) {

      } else {
        spliceCurrentCurve();
      }
    } else {
      let lastPoint = currentCurve.at(-1);
      if (!lastPoint.isBase) 
        currentCurve.pop();
    }
  }
  pointPanel.innerHTML = "";
  currentLineI = undefined;
  currentCurve = undefined;
  updateGlueToggle();

  currentSegment = undefined;
  currentMaxPolynoms.value = 0;
  startPolynomInput.value = 0;
  endPolynomInput.value = 0;
  currentPoint = undefined;
}

function choosePoint(point) {
  logFunctionName("choosePoint");
  currentPoint = point;
  if (currentPoint.isBase) lastCurrentPoint = currentPoint;

  if (!glueToggle.checked) {
    if (currentPoint === currentCurve[0]) {
      currentCurve.reverse();
      let segment = currentCurve.at(-1).segment;
      segment.controls.reverse();
      currentCurve.forEach((point, index) => {
        point.segPos = index;
      });
    }
  } else {
    let lastPoint = currentCurve.at(-1);
    let prevPoint = currentCurve.at(-2);
    if (currentPoint === currentCurve[0]) {
      if (lastPoint.isBase && prevPoint.isBase) {
        currentCurve.reverse();
      } else  {
        if (currentCurve.length > 2) {
          if (!lastPoint.isBase) 
            currentCurve.pop();
          currentCurve.reverse();
        }
      }
    } 
  
    lastPoint = currentCurve.at(-1);
    if (lastPoint.isSoft) {
      prevPoint = currentCurve.at(-2);
      let prevBase = currentCurve.at(-4);
      let vec = lastPoint.getPos().subPO(prevPoint.getPos());
  
      if (!prevBase.isSoft) {
        vec.mulC(5/4);
      } 
      let point = lastPoint.getPos().addPO(vec);
      addPoint(point, false)
    }
  }

    
  pointPanel.innerHTML = "";
  currentCurve.forEach((curve) => {
    pointPanel.append(curve.item);
  });
}

function chooseLastBasePoint() {
  logFunctionName("chooseLastBasePoint");
  if (currentCurve.at(-1).isBase)
    currentPoint = currentCurve.at(-1);
  else 
    currentPoint = currentCurve.at(-2);

  lastCurrentPoint = undefined;
}

let currentLineI;

function tryChoose(event) {
  logFunctionName("tryChoose");
  let curPosCursor = getCurPos(event);

    if (currentCurve)
      findMinDistPoints(curPosCursor);

    currentSegment = undefined;
    currentMaxPolynoms.value = 0;
    startPolynomInput.value = 0;
    endPolynomInput.value = 0;
    let minDistSegment = undefined;
    if (!currentCurve || !minDistPoints) {
      minDistSegment = findMinDistSegment(curPosCursor);
    }

    currentLineI = undefined;
    let minDistLineI = undefined;
    if (currentCurve && !minDistPoints && !minDistSegment) {
      minDistLineI = findMinDistLine(curPosCursor);
    }
   
    if (minDistLineI !== undefined) {
      currentLineI = minDistLineI;
    } else if (minDistSegment) {
      if (currentCurve) {
        currentSegment = minDistSegment;
        
        currentMaxPolynoms.value = currentSegment.controls.length - 1;
        startPolynomInput.value = 0;
        endPolynomInput.value = currentMaxPolynoms.value;
        startMatrixColumnInput.value = 0;
        endMatrixColumnInput.value = currentMaxPolynoms.value;
        startMatrixRowsInput.value = 0;
        endMatrixRowsInput.value = currentMaxPolynoms.value;
     
        chooseLastBasePoint();
        
      } else {
        chooseCurve(minDistSegment.curve);
      }
    } else if (minDistPoints) {

      for (let i = 0; i < minDistPoints.length; i++) {
        let index = currentCurve.indexOf(minDistPoints[i]);
        if (index !== -1) {
          choosePoint(minDistPoints[i]);
          break;
        }
      }

      isDraggingPoint = true;

    } else {
      if (clickOff) {
        unChooseCurve();
      } else {
        setTimeout(() => {
          clickOff = false;
        }, 300);
        clickOff = true;
      }

      if (currentCurve) 
        chooseLastBasePoint();
    }

    drawCurve();
}

function startDraggindSystem(event) {
  canvasMainCurve.style.cursor = "grabbing";         
  startDragCoords = new Pair(
    event.clientX, 
    event.clientY
  ); 
}

function startDrawing(event) {
  logFunctionName("startDrawing");
  if (
    !glueToggle.checked ||
    !currentPoint ||
     currentCurve.at(-1).isBase && currentPoint === currentCurve.at(-1) ||
    !currentCurve.at(-1).isBase && currentPoint === currentCurve.at(-2) 
  ) {

    startPosPentool = getCurPos(event);
    curPosPentool = startPosPentool.cpy();

    // if (!glueToggle.checked) {
    //   addPoint(startPosPentool, true, true);
    // } else {
    if (glueToggle.checked)
      drawPoint(startPosPentool);
    // }
  } else {
    if (!currentCurve.at(-1).isBase)
      currentCurve.pop();

    pointPanel.innerHTML = "";
    currentLineI = undefined;
    currentCurve = undefined;
    updateGlueToggle();

    currentSegment = undefined;
    currentMaxPolynoms.value = 0;
    startPolynomInput.value = 0;
    endPolynomInput.value = 0;
    currentPoint = addPoint(currentPoint.getPos(), true, true, currentPoint.id);

    startPosPentool = getCurPos(event);
    curPosPentool = startPosPentool.cpy();
    drawCurve();
    drawLine(currentPoint.getPos(), startPosPentool, 2);
    drawPoint(startPosPentool);
  }
}

canvasMainCurve.addEventListener("mousedown", (event) => {
  if (event.button !== 0) return;

  if (isSpacePressed) {  
    startDraggindSystem(event);
  } else if (isCtrlPressed) {
    tryChoose(event);
  } else {
    startDrawing(event);
  }
  
  isDragging = true;
});

function dragSystem(event) {
  logFunctionName("dragSystem");
  let deltaDragCoords = new Pair(
    event.clientX - startDragCoords.x,
    event.clientY - startDragCoords.y
  );
  deltaDragCoords.mulC(coefC);
  dragOffset.addP(deltaDragCoords);

  startDragCoords = new Pair(
    event.clientX, 
    event.clientY
  );
  drawSystem();
  drawCurve(); 
}

function drawPrevPointSoft() {
  logFunctionName("drawPrevPointSoft");
  if (Array.isArray(currentCurve)) {
    let prev = currentCurve.at(-1);

    if (prev.isBase) {
      let vec = startPosPentool.subPO(curPosPentool);
      let point = vec.addPO(startPosPentool);

      let vecPrev = point.subPO(prev.getPos());
      vecPrev.mulC(1/3);
      let newPrev = vecPrev.addPO(prev.getPos());
    
      vec.mulC(4/5);
      point = vec.addPO(startPosPentool);

      drawLine(prev, newPrev, 1);
      drawLine(newPrev, point);
      drawLine(startPosPentool, point, 1);
  

      let seg = new Segment ([
        prev.coords,
        newPrev.posToCoords(),
        point.posToCoords(),
        startPosPentool.posToCoords()
      ])
      seg.draw(1);

      drawPoint(newPrev, prev);
      drawPoint(point, startPosPentool);
      drawPoint(prev);

    } else {
      let vec = startPosPentool.subPO(curPosPentool);
      let point = vec.addPO(startPosPentool);
      drawLine(startPosPentool, point, 1);  
      drawLine(prev, point);

      let prevPrev = currentCurve.at(-2);
      let seg = new Segment ([
        prevPrev.coords,
        prev.coords,
        point.posToCoords(),
        startPosPentool.posToCoords()
      ])
      seg.draw(1);
      drawPoint(prevPrev);
      drawPoint(point, startPosPentool);

    }
  }
  drawPoint(startPosPentool, undefined , true);
  drawPoint(curPosPentool, startPosPentool);
}

function drawPrevPointHard() {
  logFunctionName("drawPrevPointHard");
  if (Array.isArray(currentCurve)) {
    let prev = currentCurve.at(-1);
    if (prev.isBase) {
      drawLine(startPosPentool, prev, 2);
      drawPoint(prev);
    } else {
      let prevPrev = currentCurve.at(-2);
      drawLine(startPosPentool, prev);
      let seg = new Segment ([
        prevPrev.coords,
        prev.coords,
        startPosPentool.posToCoords(),
        startPosPentool.posToCoords()
      ])
      seg.draw(1);

      drawPoint(prevPrev);  
    }
  }
  drawPoint(startPosPentool, undefined , true);
}

let isAltPressed = false;
document.addEventListener("keydown", (event) => {
  if (event.altKey) {
      isAltPressed = true;
  }
});

document.addEventListener("keyup", (event) => {
  if (event.key === "Alt") {
      isAltPressed = false;
  }
});

function dragPoint(event) {
  logFunctionName("dragPoint");
  let newPosPoint = getCurPos(event);
  let oldPosPointSave = currentPoint.getPos();

  for (let i = 0; i < minDistPoints.length; i++) {
    minDistPoints[i].setPos(newPosPoint);
    if (!glueToggle.checked) {
      drawCurve();
      return;
    }

    let prev;
    let next;
    let curIndex;
    minDistCurves[i].forEach((point, index) => {
      if (point ===  minDistPoints[i]) {
        curIndex = index;
        if (index === 0) {
          prev = undefined;
        } else {
          prev = minDistCurves[i][index - 1];
        }
        if (index === minDistCurves[i].length - 1) {
          next = undefined;
        } else {
          next = minDistCurves[i][index + 1];
        }
      }
    });
    
    if (minDistPoints[i].isBase) {
      if (prev && !prev.isBase) {
        let vecPrev = prev.getPos().subPO(oldPosPointSave);
        prev.setPos(newPosPoint.addPO(vecPrev));
      }
      if (next && !next.isBase) {
        let vecNext = next.getPos().subPO(oldPosPointSave);
        next.setPos(newPosPoint.addPO(vecNext));
      }
    } else {
      if (prev && prev.isBase && prev.isSoft && curIndex > 1) {
        let prevPrev = minDistCurves[i][curIndex - 2];
        let prevBase = minDistCurves[i][curIndex - 4];
        let nextBase;
        if (curIndex !== minDistCurves[i].lengtn - 1) 
          nextBase = minDistCurves[i][curIndex + 2];

        let vec;

        if (isAltPressed) {

          let dist = prev.getPos().dist(prevPrev.getPos());
          
          vec = prev.getPos().subPO(newPosPoint);
          
          let denominator = prev.getPos().dist(newPosPoint);
          
          if (denominator === 0) {
              return;
          } else {
              vec.mulC(1 / denominator);
              vec.mulC(dist);
          }
          
        } else {
          
          vec = prev.getPos().subPO(newPosPoint);
          if (prevBase.isSoft) {
            if (nextBase && !nextBase.isSoft) 
              vec.mulC(5/4);
          } else {
            if (!nextBase || nextBase.isSoft) 
              vec.mulC(4/5);
          }
          
        }
        
   
        let point = prev.getPos().addPO(vec);
        prevPrev.setPos(point);

      } else if (next && next.isBase && next.isSoft) {
        let nextNext = minDistCurves[i][curIndex + 2];
        let prevBase = minDistCurves[i][curIndex - 2];
        let nextBase;
        if (curIndex + 4 < minDistCurves[i].length)
          nextBase = minDistCurves[i][curIndex + 4];

        let vec;

        if (isAltPressed) {
          let dist = next.getPos().dist(nextNext.getPos());
          
          vec = next.getPos().subPO(newPosPoint);
          
          let denominator = next.getPos().dist(newPosPoint);
          
          if (denominator === 0) {
              return;
          } else {
              vec.mulC(1 / denominator);
              vec.mulC(dist);
          }

        } else {
          vec = next.getPos().subPO(newPosPoint);

          if (!nextBase || nextBase.isSoft) {
            if (!prevBase.isSoft) 
              vec.mulC(5/4);
          } else {
            if (prevBase.isSoft);
              vec.mulC(4/5);
          }
        }
        

        let point = next.getPos().addPO(vec);
        nextNext.setPos(point);
      }
    }
  }

  drawCurve();
}

function deletePointGlued() {
  if (!currentCurve) return;
  if (currentCurve.length < 2) return;
  let point = currentCurve.at(-1);
  let segment = point.segment;
  segment.controls.splice(-1, 1);

  currentCurve.splice(point.segPos, 1); 
  point = currentCurve.at(-1);
  currentPoint = point;
  point.isBase = true;
  if (currentCurve.length === 2) {
    segment.isLine = true;
  } else {
    segment.isLine = false;
  }
  segment.reCalcPoints();

  pointPanel.innerHTML = "";
  currentCurve.forEach((curve) => {
    pointPanel.append(curve.item);
  });

  drawCurve();
}

canvasMainCurve.addEventListener("mousemove", (event) => {

  if (isDragging) {   
    if (isSpacePressed ) {
      dragSystem(event);

    } else if (!isCtrlPressed) {
      curPosPentool = getCurPos(event);
      drawCurve();

      if (!glueToggle.checked) {
        if (currentCurve ) {
          if (currentCurve.length === 1 || leave) {
            addPoint(curPosPentool, true, true);
            currentPoint = currentCurve.at(-1);
            currentPoint = currentCurve.at(-1);
          }

          currentCurve.at(-1).setPos(curPosPentool);
          // deletePointGlued();
          // addPoint(startPosPentool, true, true);

          drawCurve();
        } 
      } else {
        drawLine(startPosPentool, curPosPentool, 1);

        let dist = startPosPentool.dist(curPosPentool);
        if (dist > 6 * coefC) {
          drawPrevPointSoft();
        }  else {
          drawPrevPointHard();
        } 
      }
      
    } else if (isDraggingPoint) {
      dragPoint(event);

    }
  } else {

    if (!isSpacePressed && !isCtrlPressed) {
      let curPosPentool = getCurPos(event);
      if (!glueToggle.checked) {
        if (currentCurve ) {
          if (currentCurve.length === 1 || leave) {
            addPoint(curPosPentool, true, true);
            currentPoint = currentCurve.at(-1);
            currentPoint = currentCurve.at(-1);
          }

          currentCurve.at(-1).setPos(curPosPentool);
          // deletePointGlued();
          // addPoint(startPosPentool, true, true);

          drawCurve();
        } 
   

      } else {
        if (currentCurve) {
          drawPreview(curPosPentool);
        } else {
          drawCurve();
          drawPoint(curPosPentool);
        }
      }
 
    } 
  }
  lastPosPentool = getCurPos(event);
  if (!glueToggle.checked) {
    leave = false;
  } 
});

function drawPreview(curPosPentool) {
  // logFunctionName("drawPreview");
  drawCurve();
  let cC = currentCurve;
  if (currentCurve) {
    if (
      currentPoint !== currentCurve.at(-1) &&
      currentPoint !== currentCurve.at(-2)
    ) {
      cC = [currentPoint]
    } 
    let prev = cC.at(-1);
    if (Array.isArray(cC)) {
      if (prev.isBase){
        drawLine(curPosPentool, prev, 2);
        drawPoint(prev, undefined, 2);
      }
    else {
        let prevPrev = cC.at(-2);
        let seg = new Segment ([
          prevPrev.coords,
          prev.coords,
          curPosPentool.posToCoords(),
          curPosPentool.posToCoords()
        ])
        seg.draw(1);
        drawPoint(prevPrev, undefined, 2);
      }
    } 
  }
  
  drawPoint(curPosPentool);
}

let currentCurve;

function getCurPos(event) {
  // logFunctionName("getCurPos");
  const rect = canvasMain.getBoundingClientRect();
  let curPos = new Pair(
    event.clientX - rect.left, 
    event.clientY - rect.top
  );
  curPos.mulC(coefC);

  return curPos;
}

function createSegment(curve) {
  logFunctionName("createSegment");
  if (curve.at(-1).isBase && curve.at(-2).isBase) {
    let seg = new Segment (
      [
        curve.at(-2).coords,
        curve.at(-1).coords
      ],
      currentCurve,
      true,
      true
    )
    currentProject.segments.push(seg)

    curve.at(-2).segment.push(seg);
    curve.at(-1).segment.push(seg);

    curve.at(-2).segPos.push(0)
    curve.at(-1).segPos.push(1)
  } else {
    let off = 0;
    if (!curve.at(-1).isBase) 
      off = -1;
    
    let seg = new Segment (
      [
        curve.at(-4 + off).coords,
        curve.at(-3 + off).coords,
        curve.at(-2 + off).coords,
        curve.at(-1 + off).coords
      ],
      currentCurve,
      true,
      false
    )
    currentProject.segments.push(seg)

    curve.at(-4 + off).segment.push(seg)
    curve.at(-3 + off).segment = seg;
    curve.at(-2 + off).segment = seg;
    curve.at(-1 + off).segment.push(seg)

    curve.at(-4 + off).segPos.push(0)
    curve.at(-3 + off).segPos = 1;
    curve.at(-2 + off).segPos = 2;
    curve.at(-1 + off).segPos.push(3)
  }
}

function addSegmentSoft(prev) {
  logFunctionName("addSegmentSoft");
  if (prev && prev.isBase) {
    
    let vec = startPosPentool.subPO(curPosPentool);
    let point = vec.addPO(startPosPentool);

    let vecPrev = point.subPO(prev.getPos());
    vecPrev.mulC(1/3);
    let newPrev = vecPrev.addPO(prev.getPos());
    addPoint(newPrev, false);

    vec.mulC(4/5);
    point = vec.addPO(startPosPentool);

    addPoint(point, false);
    
    currentPoint = addPoint(startPosPentool, true, true);
    addPoint(curPosPentool, false);
    createSegment(currentCurve);
    
  } else {
    if (Array.isArray(currentCurve)) {
      let vec = startPosPentool.subPO(curPosPentool);
      let point = vec.addPO(startPosPentool);
      addPoint(point, false);
    }
    currentPoint = addPoint(startPosPentool, true, true);
    addPoint(curPosPentool, false);

    if (currentCurve.length > 4) {
      createSegment(currentCurve);
    }
  }
}

function addSegmentHard(prev) {
  logFunctionName("addSegmentHard");
  if (!prev) {
    currentPoint = addPoint(startPosPentool, true);

  } else if (prev && prev.isBase) {
    currentPoint = addPoint(startPosPentool, true);
    createSegment(currentCurve);

  } else if (!prev.isBase) { 
    let vec = prev.getPos().subPO(startPosPentool);
    vec.mulC(1/3);
    let point = vec.addPO(startPosPentool);

    let preBase = currentCurve.at(currentCurve.length - 2);
    let newPrevVec = prev.getPos().subPO(preBase.getPos());
    newPrevVec.mulC(4/5);
    prev.setPos(newPrevVec.addPO(preBase.getPos()));

    addPoint(point, false);
    currentPoint = addPoint(startPosPentool, true);
    createSegment(currentCurve);
  }
}

function addSegment() {
  logFunctionName("addSegment");
  let prev;
  if (currentCurve)
    prev = currentCurve.at(-1);
  else 
    prev = undefined;

  // if (!glueToggle.checked) {

  // } else {
    let dist = startPosPentool.dist(curPosPentool);
    if (dist > 6 * coefC) {
      addSegmentSoft(prev);
    } else {
      addSegmentHard(prev);
    }
  // }
  
  drawCurve();
}

function addPointToSegement() {
  currentPoint = addPoint(curPosPentool, true, true);
  drawCurve();

}

canvasMainCurve.addEventListener("mouseup", () => {
  logFunctionName("mouseup");
  if (!isSpacePressed && !isCtrlPressed ) {
    if (!glueToggle.checked) {
      addPointToSegement();
      currentSegment = undefined;
    } else {
      addSegment();
    }
  }
  else if (isCtrlPressed && currentPoint && !currentPoint.isBase ) {
    if (!lastCurrentPoint) {
      if (currentCurve.at(-1).isBase)
        lastCurrentPoint = currentCurve.at(-1);
      else 
        lastCurrentPoint = currentCurve.at(-2);
    }
    currentPoint = lastCurrentPoint;
    drawCurve();
  }

  isDraggingPoint = false;
  isDragging = false;
});

let leave = false;

canvasMainCurve.addEventListener("mouseleave", () => {
  // if (isSpacePressed)
  if (!glueToggle.checked) {
    leave = true;
 
  }
  if (!glueToggle.checked && !isCtrlPressed && !isSpacePressed) {
    deletePointGlued();
  }
  isDragging = false;
  if (!isCtrlPressed && !isSpacePressed)
  drawCurve();
});

let curPos;
let isDraggingPoint = false;
let isCtrlPressed = false;
let minUseDist = 6 * coefC;


document.addEventListener("keydown", (event) => {
  if (event.ctrlKey) {  
    if (canvasMainCurve.style.pointerEvents === "none") return;
    if (isCtrlPressed) return;
    if (isDragging) return;
    isCtrlPressed = true;
    drawCurve();

    if (leave) return;
    if (!glueToggle.checked && !isSpacePressed) {
      deletePointGlued();

    }
  }
});

document.addEventListener("keyup", (event) => {
  if (event.code === "ControlLeft" || event.code === "ControlRight") {  
    if (canvasMainCurve.style.pointerEvents === "none") return;
    if (!isCtrlPressed) return;
    isCtrlPressed = false;
    isDraggingPoint = false;
    if (leave) return;


    if (!glueToggle.checked) {
      if (currentCurve) {
        addPoint(lastPosPentool, true, true);
        currentCurve.at(-1).segment.reCalcPoints();
        currentPoint = currentCurve.at(-1);
        drawCurve();
      }
 

    } else {
      if (lastPosPentool && currentCurve) {
        drawPreview(lastPosPentool);
      } else {
        drawPoint(lastPosPentool);
      }
    }

  }
});

const minDivsValue = 0.01;
const maxDivsValue = 100; 
canvasMainCurve.addEventListener("wheel", (event) => {
  event.preventDefault();

  const rect = canvasMain.getBoundingClientRect();

  if (event.deltaY < 0) {
  
    if (curDivsValue <= minDivsValue && curGridSize === maxGridSize) return;
    canvasMainCurve.style.cursor = "zoom-in";

    if (isCtrlPressed) {
      reSizeSystem(false, true);
    } else {
      curPos = new Pair(event.clientX - rect.left, event.clientY - rect.top);
      reSizeSystem(false);
    }

  } else {
    if (curDivsValue >= maxDivsValue && curGridSize === minGridSize) return;
    canvasMainCurve.style.cursor = "zoom-out";

    if (isCtrlPressed) {
      reSizeSystem(true, true);
    } else {
      curPos = new Pair(event.clientX - rect.left, event.clientY - rect.top);
      reSizeSystem(true);
    }
  }

  if (lastPosPentool && !isCtrlPressed && !isSpacePressed)
    drawPreview(lastPosPentool);

  setTimeout(() => {
    if (isSpacePressed)
      if (isDragging)
        canvasMainCurve.style.cursor = "grabbing";
      else
        canvasMainCurve.style.cursor = "grab";
      
    else
      canvasMainCurve.style.cursor = "default";
  }, 350);
});


function reSizeSystem(isScaleDown, isCentred) { 
  logFunctionName("reSizeSystem");
  let stepDiff = maxGridSize - minGridSize; 
  let stepDelta; 
  
  let isThird = (curDivsNumbr - 1) % 3 === 0; 
  if (isThird) 
    stepDelta = stepDiff / 15;  
  else 
    stepDelta = stepDiff / 10;
  
  let oldDivsStep = curGridSize;  
  let mult = 1; 
  if (isScaleDown) {
    if (curGridSize <= minGridSize) { 

      curGridSize = maxGridSize;
      if (isThird)  { 
        curDivsValue *= 2.5;
        mult = 2.5;
      } else {
        mult = 2;
        curDivsValue *= 2;
      }
      curDivsNumbr++;
    } else { 
      curGridSize -= stepDelta;
    }

  } else {
    
    if (curGridSize >= maxGridSize) { 
      curGridSize = minGridSize;

      isThird = (curDivsNumbr + 1) % 3 === 0;
      if (isThird) 
        stepDelta = stepDiff / 15;
      else 
        stepDelta = stepDiff / 10;

      if (isThird) {
        curDivsValue /= 2.5;
        mult = 2.5;
      } else {
        curDivsValue /= 2;
        mult = 2;
      }
      curDivsNumbr--; 
    } else {
      curGridSize += stepDelta;
    }
  }

  if (!isCentred) { 
    let curDist = new Pair( 
      (curPos.x * coefC - midlDrag.x),  
      (curPos.y * coefC - midlDrag.y) 
    );

    let curDiff = oldDivsStep - curGridSize;
  
    let curOff = new Pair(  
        (curDist.x / oldDivsStep) * curDiff, 
        (curDist.y / oldDivsStep) * curDiff  
    );
  
    dragOffset.addP(curOff); 

    if (mult !== 1) {
      let asd = midlReal.addPO(dragOffset);
      let abs = new Pair( 
        curPos.x * coefC - asd.x,
        curPos.y * coefC - asd.y
      );  

      if (isScaleDown) { 
        if (mult === 2) {
          dragOffset.addP(abs.mulCO(0.5));
        } else if (mult === 2.5) {
          dragOffset.addP(abs.mulCO(0.6));
        }
      }  else {
        dragOffset.subP(abs.mulCO((mult - 1) ));
      }
    }
  }
  
  drawSystem();
  drawCurve();
}

function calcCurNum(midlDrag) {

  let num;
  if (midlDrag < 0) 
    num = - Math.ceil(midlDrag / curGridSize) % 4 + 1;
  else
    num = 4 - Math.floor(midlDrag / curGridSize) % 4;

  return num;
}

function calcCurOff(midlDrag) {

  let off;

  if (midlDrag < 0) 
    off = curGridSize + midlDrag % curGridSize;
  else 
    off = midlDrag % curGridSize;

  return off;
}

let gridOffset;
let startNum;

function drawSystemGrid() {

  сtxBuffer.lineWidth = 0.5 * coefC;
  сtxBuffer.strokeStyle = colors.lineGridNormal;

  for (
    let num = startNum.x, cur = gridOffset.x; 
    cur < sizeCanvas.x; 
    (num++) % 4, cur += curGridSize
  ) {
    let isDark = num % 4 === 0;
    сtxBuffer.strokeStyle = isDark ? colors.lineGridBold : colors.lineGridNormal;

    сtxBuffer.beginPath();
    сtxBuffer.moveTo(cur, 0);
    сtxBuffer.lineTo(cur, sizeCanvas.y);
    сtxBuffer.stroke();
  }
  
  for (
    let num = startNum.y, cur = gridOffset.y; 
    cur < sizeCanvas.y; 
    (num++) % 4, cur += curGridSize
  ) {
    let isDark = num % 4 === 0;
    сtxBuffer.strokeStyle = isDark ? colors.lineGridBold : colors.lineGridNormal;

    сtxBuffer.beginPath();
    сtxBuffer.moveTo(0, cur);
    сtxBuffer.lineTo(sizeCanvas.x, cur);
    сtxBuffer.stroke();
  }
}

function drawSystemAxes() {
  let systemLineWidth = 2 * coefC;

  сtxBuffer.strokeStyle = colors.lineSystem;
  сtxBuffer.lineWidth = systemLineWidth;
  сtxBuffer.beginPath();

  let isLineOnSystem = new Pair (
    midlDrag.x > -systemLineWidth / 2 && midlDrag.x < sizeCanvas.x + systemLineWidth / 2,
    midlDrag.y > -systemLineWidth / 2 && midlDrag.y < sizeCanvas.y + systemLineWidth / 2
  );

  if (isLineOnSystem.x) {
    сtxBuffer.moveTo(midlDrag.x, 0);
    сtxBuffer.lineTo(midlDrag.x, sizeCanvas.y);
  }
  if (isLineOnSystem.y) {
    сtxBuffer.moveTo(0, midlDrag.y);
    сtxBuffer.lineTo(sizeCanvas.x, midlDrag.y);
  }

  сtxBuffer.stroke();

  if (isLineOnSystem.x && isLineOnSystem.y) {
    сtxBuffer.fillStyle  = colors.lineSystem;
    сtxBuffer.beginPath();
    сtxBuffer.arc(midlDrag.x, midlDrag .y, 2.5 * coefC, 0, Math.PI * 2);
    сtxBuffer.fill();
  }
}

function drawSystemAxesName() {
  сtxBuffer.Style  = colors.black;
  сtxBuffer.textAlign = "center";
  сtxBuffer.font = "28px Arial";

  if (midlDrag.y < 39 * coefC ) {
    сtxBuffer.fillText("X", sizeCanvas.x  - 12 * coefC, 0 + 32   * coefC);
  } else if (midlDrag.y > sizeCanvas.y  ) {
    сtxBuffer.fillText("X", sizeCanvas.x - 12 * coefC, sizeCanvas .y - 6 * coefC );
  } else 
    сtxBuffer.fillText("X", sizeCanvas.x - 12 * coefC , midlDrag.y - 6 * coefC);
  
  if (midlDrag.x < 0 ) {
    сtxBuffer.fillText("Y", 0 + 10  * coefC, 17 * coefC );
  } else if (midlDrag.x > sizeCanvas.x  - 39   * coefC) {
    сtxBuffer.fillText("Y", sizeCanvas.x - 28 * coefC, 17  * coefC);
  } else  
  сtxBuffer.fillText("Y ", midlDrag.x + 12 * coefC, 17 * coefC);
}

function drawSystemAxesNumb() {
  сtxBuffer.font = "22px Arial";
  сtxBuffer.textAlign = "center";

  let cnt = Math.floor(-curDivsNumbr / 3) + 1; 
  let cntNum = Math.pow(10, cnt);
  let cnt2 = Math.floor((-curDivsNumbr - 1) / 3) + 1; 
  if (curDivsNumbr >= 0)
    cnt2 = 0; 

  for (
    let cur = gridOffset.x + (4 - startNum.x) * curGridSize - curGridSize * 4, num = - Math.floor((midlDrag.x + curGridSize * 4) / (4 * curGridSize)) * curDivsValue;
    cur < sizeCanvas.x + curGridSize * 4;
    cur += curGridSize * 4, num += curDivsValue
  ) {
    if (cur === midlDrag.x) continue; 
    if (midlDrag.y < 0 && cur <  30 * coefC) continue; roundAfterPoint
    if (midlDrag.y < 0 && cur  > sizeCanvas.x - 45  * coefC) continue; 
    if (midlDrag.y > sizeCanvas.y && cur > sizeCanvas.x - 30   * coefC) continue; 

    
    if (midlDrag.y < 0 ) {
      сtxBuffer.fillText(num.toFixed(cnt2), cur, 0 + 17  * coefC);
    } else if (midlDrag.y > sizeCanvas.y - 23 * coefC ) {
      сtxBuffer.fillText(num.toFixed(cnt2), cur, sizeCanvas.y - 6 * coefC);
    } else 
    сtxBuffer.fillText(num.toFixed(cnt2), cur, midlDrag.y + 17 * coefC);
  }

  for (
    let cur = gridOffset.y + (4 - startNum.y ) * curGridSize - curGridSize * 4 , 
    num = Math.floor((midlDrag.y + curGridSize * 4) / (4 * curGridSize)) * curDivsValue,
    width = Math.max(сtxBuffer.measureText(roundAfterPoint(num, cntNum)).width, сtxBuffer.measureText(roundAfterPoint(num +  curDivsValue, cntNum)).width);

    cur < sizeCanvas.y + curGridSize * 4 ;
    cur += curGridSize * 4, num -= curDivsValue
  ) {
    if (cur === midlDrag.y) continue; 
    if (midlDrag.x < 27 * coefC && cur < 33 * coefC) continue; 
    if (midlDrag.x > sizeCanvas.x && cur < 45 * coefC) continue; 
    if (midlDrag.x > sizeCanvas.x && cur > sizeCanvas.y - 27  * coefC) continue;  
     
    сtxBuffer.textAlign = "right";

    if (midlDrag.x < width + 16   * coefC) {
      сtxBuffer.textAlign = "left";
      сtxBuffer.fillText(num.toFixed(cnt2), 0 + 8   * coefC , cur + 3 * coefC);
    } else if (midlDrag.x > sizeCanvas.x) {
      сtxBuffer.fillText(num.toFixed(cnt2), sizeCanvas.x - 8 * coefC, cur + 3 * coefC);
    } else  
    сtxBuffer.fillText(num.toFixed(cnt2), midlDrag.x - 8  * coefC, cur + 3 * coefC); 

  } 
}

function drawSystemAxesDivs() {
  сtxBuffer.strokeStyle = colors.lineSystem;
  сtxBuffer.lineWidth = 4;

  let markLen = 3 * coefC;
  let markS;
  let markE;

  сtxBuffer.beginPath();
  for (
    let cur = gridOffset.x + (4 - startNum.x) * curGridSize - 4 * curGridSize, num = - Math.floor(midlDrag .x / (4 * curGridSize)) * curDivsValue;
    cur < sizeCanvas.x + curGridSize;
    cur += curGridSize * 4, num += curDivsValue
  ) {
    if (cur === midlDrag.x) continue; 
    if (midlDrag.y < 0 && cur <  30 * coefC) continue; 
    if (midlDrag.y < 0 && cur > sizeCanvas.x - 45  * coefC) continue; 
    if (midlDrag.y > sizeCanvas.y && cur > sizeCanvas.x - 30   * coefC) continue; 
    
    if (midlDrag.y < 0 ) {
      markS = 0;
      markE = markLen;
    } else if (midlDrag.y > sizeCanvas.y) {
      markS = sizeCanvas.y - markLen;
      markE = sizeCanvas.y;
    } else {
      markS = midlDrag.y - markLen;
      markE = midlDrag.y + markLen;
    }

    сtxBuffer.moveTo(cur, markS);
    сtxBuffer.lineTo(cur, markE); 
  }
  сtxBuffer.stroke();

  сtxBuffer.beginPath();
  for (
    let cur = gridOffset.y + (4 - startNum.y ) * curGridSize - curGridSize * 4, num = Math.floor(midlDrag .y / (4 * curGridSize)) * curDivsValue;
    cur < sizeCanvas.y + curGridSize;
    cur += curGridSize * 4, num -= curDivsValue
  ) {
    if (cur === midlDrag.y) continue; 
    if (midlDrag.x < 27 * coefC && cur < 33 * coefC) continue; 
    if (midlDrag.x > sizeCanvas.x && cur < 45 * coefC) continue; 
    if (midlDrag.x > sizeCanvas.x && cur > sizeCanvas.y - 27  * coefC) continue;  

    if (midlDrag.x < 0) {
      markS = 0;
      markE = markLen;
    } else if (midlDrag.x > sizeCanvas.x) {
      markS = sizeCanvas.x - markLen;
      markE = sizeCanvas.x;
    } else {
      markS = midlDrag.x - markLen;
      markE = midlDrag.x + markLen;
    }

    сtxBuffer.moveTo(markS, cur);
    сtxBuffer.lineTo(markE, cur); 
  } 
  сtxBuffer.stroke();  
}

function drawSystem() {

  canvasBuffer.width = canvasMain.width;
  canvasBuffer.height = canvasMain.height;

  сtxBuffer.clearRect(0, 0, canvasMain.width, canvasMain.height);
  
  midlReal = new Pair(
    Math.floor(sizeCanvas.x / 2),
    Math.floor(sizeCanvas.y / 2)
  );  

  midlDrag = midlReal.addPO(dragOffset);

  gridOffset = new Pair(
    calcCurOff(midlDrag.x),
    calcCurOff(midlDrag.y)
  );
  startNum = new Pair(
    calcCurNum(midlDrag.x, midlReal.x),
    calcCurNum(midlDrag.y, midlReal.y)
  );

  drawSystemGrid();
  drawSystemAxes();
  drawSystemAxesName();
  drawSystemAxesNumb();
  drawSystemAxesDivs();

  ctx.clearRect(0, 0, canvasMain.width, canvasMain.height);
  ctx.drawImage(canvasBuffer, 0, 0);
}

function roundAfterPoint(num, cntNum) {
  if (curDivsNumbr < 0) 
    return Math.round(num * cntNum) / cntNum;
  else 
    return Math.floor(num);
}

const pointInfoWindow = getElement("#point-info-window");
const pointInfoCoords = getElement("#point-info-coords");
let isPointInfoVisible = false;

canvasMainCurve.addEventListener("contextmenu", (event) => {
  event.preventDefault(); 

  if (isPointInfoVisible) return; 

  const curPosCursor = getCurPos(event);


  findMinDistPoints(curPosCursor);

  if (minDistPoints && minDistPoints.length > 0) {
    const point = minDistPoints[0];
    const coords = point.coords.cpy();
    coords.roundAfterPoint(2);

    pointInfoCoords.textContent = `X: ${coords.x}; Y: ${coords.y}`;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    const panelRect = pointInfoWindow.parentElement.getBoundingClientRect();

    let left = event.clientX - panelRect.left + 2;
    let top = event.clientY - panelRect.top + 2;

    if (left + pointInfoWindow.offsetWidth > windowWidth) {
      left = windowWidth - pointInfoWindow.offsetWidth - 5;
    }
    if (top + pointInfoWindow.offsetHeight > windowHeight) {
      top = windowHeight - pointInfoWindow.offsetHeight - 5;
    }

    pointInfoWindow.style.left = `${left}px`;
    pointInfoWindow.style.top = `${top}px`;
    
    pointInfoWindow.classList.remove("hidden");
    pointInfoWindow.style.display = "block";

    isPointInfoVisible = true;

    canvasMainCurve.style.pointerEvents = "none";
  }
});

document.addEventListener("mousedown", (event) => {

  if (isPointInfoVisible) { 
    if (pointInfoWindow.contains(event.target)) return;

    pointInfoWindow.classList.add("hidden");
    pointInfoWindow.style.display = "none";
    isPointInfoVisible = false;

    canvasMainCurve.style.pointerEvents = "auto";
  }
});