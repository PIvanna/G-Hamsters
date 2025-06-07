const errorMessagePoint = getElement("#error-message-point");
const calcPointInput = getElement("#step-x-size-point");

const tableBodyPoint = getElement("#table-point-body");

let isErrorPoint = {value: false};
let prevValuePoint = {value: 0.1};
calcPointInput.value = prevValuePoint.value;

calcPointInput.addEventListener("input", () => {
  if (calcPointInput.value.trim() === "") return;
    let value = calcPointInput.value;

  value = Number(value);
  let maxVal = Math.max(
    sizeCanvas.x / curGridSize * 4 * curDivsValue,
    sizeCanvas.y / curGridSize * 4 * curDivsValue
  )
  isErrorPoint.value = true;
  if (value < 0) {
    errorMessagePoint.textContent = "Число не може бути меншим за нуль.";
  } else if (value === 0 && calcPointInput.value.trim() !== "") {
    errorMessagePoint.textContent = "Число не може бути рівним нулеві.";
  } else if (value > maxVal) {
    errorMessagePoint.textContent = "Число не може бути більшим за " + maxVal.toFixed(2); + ".";
  } else {
    errorMessagePoint.textContent = "";
    isErrorPoint.value = false;
  }
});

calcPointInput.addEventListener("change", () => {
    checkErrorChange(calcPointInput, prevValuePoint, isErrorPoint, errorMessagePoint);
});  

function checkErrorChange(input, prevValue, isError, errorMessage) {
  let value = Number(input.value);
  if (isError.value || input.value.trim() === "") {
    input.value = prevValue.value;
    errorMessage.textContent = "";
  } else {
    prevValue.value = value;
  }
}

const calcPointButton = getElement("#control-button-calc-points");
calcPointButton.addEventListener("click", calcPoint);

function calcPoint() {

  if (isErrorPoint.value) return;
  if (canvasMainCurve.style.pointerEvents === "none") return;

  if ((!currentSegment || currentSegment.isLine) && currentLineI === undefined) {
    if (!currentSegment && currentLineI === undefined)
      errorMessagePoint.textContent = "Оберіть сегмент або відрізок ламаної для обчислення.";
    else if (currentSegment && currentSegment.isLine)
      errorMessagePoint.textContent = "Оберіть криволінійний сегмент";

    setTimeout(() => {
      errorMessagePoint.textContent = "";
    }, 2500);
    return;
  }

  errorMessagePoint.textContent = "";


  let segment;
  if (currentLineI === undefined) {
    segment = currentSegment;
  } else {
    let notBase = currentCurve[currentLineI].isBase ? currentCurve[currentLineI + 1] : currentCurve[currentLineI];
    segment = notBase.segment;
  }
  let temp = [];
  segment.controls.forEach((control) => {
    temp.push(control.cpy());
  });
  
  tableBodyPoint.innerHTML = '';
  
  let xStep = Number(calcPointInput.value);
  let xMin = Number.MAX_VALUE;
  if (currentLineI  === undefined) {
    temp.forEach((point) => {
      if (point.x < xMin) 
          xMin = point.x;
    })
  } else {
    
    xMin = Math.min(currentCurve[currentLineI].coords.x, currentCurve[currentLineI + 1].coords.x);

  }
  
  let xMax = -Infinity;

  if (currentLineI  === undefined) {
    temp.forEach((point) => {    
      if (point.x > xMax) {
        xMax = point.x;
      }
    })
  } else {
    xMax = Math.max(currentCurve[currentLineI].coords.x, currentCurve[currentLineI + 1].coords.x);
  }

  

  let smallestDigit = getSmallestDigit(xStep);
  let start;

  do {
    start = Math.floor(xMin / smallestDigit) * smallestDigit;
    if (xMin < 0) start += smallestDigit;
    smallestDigit /= 10;
  } while (start > xMax)

  segment.setMaxDist(xStep);
  let pres = xStep / 10;
  let prevStart = start;

  let mapSegm = segment.calcMap(xStep, pres, prevStart);
  let mapLine = new Map();
  if (currentLineI === undefined) {
    for (let i = 0; i < temp.length - 2; i++) {
      getLinePoints(temp[i].coords, temp[i + 1].coords, xStep, mapSegm, prevStart, i === temp.length - 2);
    }

  } else {
    getLinePoints(currentCurve[currentLineI].coords, currentCurve[currentLineI + 1].coords, xStep, mapLine, prevStart, true);
  }

  let sortedKeys = Array.from(mapLine.keys()).sort((a, b) => a - b);
  let x = Number(sortedKeys[0]);


  sortedKeys.forEach((key) => {
    
    let newRow = document.createElement('tr');

    let newCell = document.createElement('td');
    newCell.textContent = x.toFixed(2);
    newRow.appendChild(newCell); 

    newCell = document.createElement('td');
    let text = "";
    mapLine.get(key).forEach((point) => {
      text += " " + point.y.toFixed(3);
    })
    newCell.textContent = text;
    newRow.appendChild(newCell); 

    newCell = document.createElement('td');
    text = "";
    if (mapSegm.has(Number(key).toFixed(4))) {

      let arr = mapSegm.get(Number(key).toFixed(4));
      arr.forEach((point) => {

        text += " " + point.y.toFixed(3);
      })
    }
    newCell.textContent = text;
    newRow.appendChild(newCell); 

    tableBodyPoint.appendChild(newRow);
    x += xStep;
  });

}

function getSmallestDigit(xStep) {
  if (!Number.isFinite(xStep) || xStep === 0) return 0;
  const str = xStep.toString();
  const decimalIndex = str.indexOf('.');
  if (decimalIndex === -1) {
      return 1;
  }
  const decimalPlaces = str.length - decimalIndex - 1;
  return Math.pow(10, -decimalPlaces);
}

function getLinePoints(po1, po2, xStep, map, prevStart = undefined, isE = false) {

  let min = Math.min(po1.x, po2.x);
  let p1;
  let p2;
  if (min === po1.x) {
    p1 = po1;
    p2 = po2;
  } else {
    p1 = po2;
    p2 = po1;
  }

  let m = (p2.y - p1.y) / (p2.x - p1.x); 
  let b = p1.y - m * p1.x;
  
  let smallestDigit = getSmallestDigit(xStep);

  let start;

    if (prevStart === undefined) {
      start = Math.floor(min / smallestDigit) * smallestDigit;
      if (min < 0) start += smallestDigit;
    } else {
      start = prevStart;
      while (start < p1.x) start += xStep;
    } 


    if (start >= p1.x && start <= p2.x) {
      if (!isE) {
        for (let x = start; x < p2.x; x += xStep) {
          let y = m * x + b;
          if (!map.has(x.toFixed(4))) {
            map.set(x.toFixed(4), []);
          }
  
          map.get(x.toFixed(4)).push(new Pair(x, y));
        }
      } else {
  
        for (let x = start; x <= p2.x; x += xStep) {
          let y = m * x + b;
          if (!map.has(x.toFixed(4))) {
            map.set(x.toFixed(4), []);
          }
  
          map.get(x.toFixed(4)).push(new Pair(x, y));
        }
      }
    }

  if (prevStart === undefined) {
    return start;
  }
}


const startPolynomInput = getElement("#start-polynom");
let prevStartPolynomInput = {value: 0};
startPolynomInput.value = prevStartPolynomInput.value;

const endPolynomInput = getElement("#end-polynom");
let prevEndPolynomInput = {value: 0};
endPolynomInput.value = prevEndPolynomInput.value;

let currentMaxPolynoms = {value: 0};

function isSelectedFuncPolynom (input, compare, isStart = true) {
  if (!currentSegment || currentSegment.isLine) {
    if (!currentSegment) {
      errorMessagePolynom.textContent = "Оберіть сегмент для обчислення поліномів.";
    } else {
      errorMessagePolynom.textContent = "Оберіть криволінійний сегмент для обчислення поліномів.";
    }
    return false;
  }
  return true;
};

const errorMessageMatrix = getElement("#error-message-matrix");
let isErrorMatrix = {value: false};

function isSelectedFuncMatrix () {
  if (!currentSegment) {
    errorMessageMatrix.textContent = "Оберіть сегмент для обчислення коефіцієнтів матриці.";
    return false;
  }
  return true;
};

function validateInput(input, prevValue, errorMessage, isError, isSelectedFunc, compare, isStart = true) {
  input.addEventListener("input", () => {

    if (input.value.trim() === "") return;
    isError.value = true;
  
    if (!isSelectedFunc()) return;
  
    let value = Number(input.value);

    if (value > currentMaxPolynoms.value) {
      errorMessage.textContent = `Значення не може бути більшим за кількість точок. Допустимі значення [0, ${currentMaxPolynoms.value}].`;
    } else if (isStart && value > Number(compare.value)) {
      errorMessage.textContent = `Початковий номер не може бути більшим за кінцевий. Допустимі значення [0, ${compare.value}].`;
    } else if (!isStart && value < Number(compare.value)) {
      errorMessage.textContent = `Кінцевий номер не може бути меншим за початковий. Допустимі значення [${compare.value}, ${currentMaxPolynoms.value}].`;
    } else {
      errorMessage.textContent = "";
      isError.value = false;
    }
  });

  input.addEventListener("change", () => {
    checkErrorChange(input, prevValue, isError, errorMessage);
  });

  input.addEventListener("keydown", (event) => {
    if (
      (event.key >= '0' && event.key <= '9') || 
      event.key === 'Backspace' ||             
      event.key === 'Delete' ||            
      event.key === 'ArrowLeft' ||          
      event.key === 'ArrowRight'       
    ) {
      return;
    } else {
      event.preventDefault(); 
    }
  });
}

const calcMatrixButton = getElement("#control-button-calc-matrix");
calcMatrixButton.addEventListener("click", () => {
  calcMatrix();
});

function calcMatrix() {
  if (isErrorMatrix.value) return;

  if (!currentSegment || currentSegment.isLine) {
    if (!currentSegment) {
      errorMessageMatrix.textContent = "Оберіть сегмент для обчислення";
    } else {
      errorMessageMatrix.textContent = "Оберіть криволінійний сегмент";
    }

    setTimeout(() => {
      errorMessageMatrix.textContent = "";
    }, 2500);
    return;
  }

  const startColumn = Number(startMatrixColumnInput.value);
  const endColumn = Number(endMatrixColumnInput.value);
  const startRow = Number(startMatrixRowsInput.value);
  const endRow = Number(endMatrixRowsInput.value);

  const matrix = currentSegment.MB;

  if (!matrix || matrix.length === 0) {
    errorMessageMatrix.textContent = "Матриця не знайдена для обраного сегмента.";
    setTimeout(() => {
      errorMessageMatrix.textContent = "";
    }, 2500);
    return;
  }

  const table = getElement("#table-matrix");
  const tableBody = getElement("#table-matrix-body");
  const tableHeader = getElement("#table-matrix thead");
  tableBody.innerHTML = "";
  tableHeader.innerHTML = "";


  const headerRow = document.createElement("tr");
  const emptyCell = document.createElement("th");
  headerRow.appendChild(emptyCell); 

  for (let col = startColumn; col <= endColumn; col++) {
    const headerCell = document.createElement("th");
    headerCell.textContent = col; 
    headerRow.appendChild(headerCell);
  }
  tableHeader.appendChild(headerRow);


  for (let row = startRow; row <= endRow; row++) {
    const tableRow = document.createElement("tr");

    const rowHeader = document.createElement("th");
    rowHeader.textContent = row; 
    tableRow.appendChild(rowHeader);

    for (let col = startColumn; col <= endColumn; col++) {
      const cell = document.createElement("td");
      cell.textContent = matrix[row][col].toFixed(0);
      tableRow.appendChild(cell);
    }

    tableBody.appendChild(tableRow);
  }

  const tablePanel = getElement("#table-panel-matrix");
  tablePanel.style.display = "block";
}

const timePolynomInput = getElement("#time-polynom");

let prevValuePolynomTime = {value: 2.5};
timePolynomInput.value = prevValuePolynomTime.value;

timePolynomInput.addEventListener("input", () => {
  checkErrorInput(
    timePolynomInput, errorMessagePolynom, isErrorPolynom, 
    1, 10, "часу", false);
});

timePolynomInput.addEventListener("change", () => { 
  checkErrorChange(timePolynomInput, prevValuePolynomTime, isErrorPolynom, errorMessagePolynom);
});

const errorMessagePolynom = getElement("#error-message-polynom");
const calcPolynomInput = getElement("#step-t-size-polynom");

let isErrorPolynom = {value: false};
let prevValuePolynom = {value: 0.01};
calcPolynomInput.value = prevValuePolynom.value;

function checkErrorInput(input, errorMessage, isError, min, max, name, isAllowedZero = false) {
  if (input.value.trim() === "") return;
  
  let value = Number(input.value);
  isError.value = true;

  const messages = {
    negative: "Значення ${name} не може бути від'ємним.",
    zero: "Значення ${name} не може бути рівним нулеві.",
    lessThanMin: `Значення ${name} не може бути меншим за ${min}.`,
    greaterThanMax: `Значення ${name} не може бути більшим за ${max}.`,
    range: isAllowedZero ? 
      `Допустиме значення ${name}: {0}, [${min}, ${max}]` : 
      `Допустиме значення ${name}: [${min}, ${max}]`, 
  };

  if (value < 0) {
    errorMessage.textContent = messages.negative;
  } else if (!isAllowedZero && value === 0 && input.value.trim() !== "") {
    errorMessage.textContent = messages.zero;
  } else if (value < min && value !== 0 || (value === 0 && !isAllowedZero)) {
    errorMessage.textContent = messages.lessThanMin;
  } else if (value > max) {
    errorMessage.textContent = messages.greaterThanMax;
  } else {
    errorMessage.textContent = "";
    isError.value = false;
    return;
  }

  errorMessage.textContent += ` ${messages.range}`;
}

validateInput(
  startPolynomInput,
  prevStartPolynomInput,
  errorMessagePolynom,
  isErrorPolynom,
  isSelectedFuncPolynom,
  endPolynomInput,
  true
);

validateInput(
  endPolynomInput,
  prevEndPolynomInput,
  errorMessagePolynom,
  isErrorPolynom,
  isSelectedFuncPolynom,
  startPolynomInput,
  false
);

const startMatrixColumnInput = getElement("#start-matrix-column");
const endMatrixColumnInput = getElement("#end-matrix-column");
const startMatrixRowsInput = getElement("#start-matrix-rows");
const endMatrixRowsInput = getElement("#end-matrix-rows");

let prevStartMatrixColumn = { value: 0 };
let prevEndMatrixColumn = { value: 0 };
let prevStartMatrixRows = { value: 0 };
let prevEndMatrixRows = { value: 0 };

startMatrixColumnInput.value = prevStartMatrixColumn.value;
endMatrixColumnInput.value = prevEndMatrixColumn.value;
startMatrixRowsInput.value = prevStartMatrixRows.value;
endMatrixRowsInput.value = prevEndMatrixRows.value;

validateInput(
  startMatrixColumnInput,
  prevStartMatrixColumn,
  errorMessageMatrix,
  isErrorMatrix,
  isSelectedFuncMatrix,
  endMatrixColumnInput,
  true
);

validateInput(
  endMatrixColumnInput,
  prevEndMatrixColumn,
  errorMessageMatrix,
  isErrorMatrix,
  isSelectedFuncMatrix,
  startMatrixColumnInput,
  false
);

validateInput(
  startMatrixRowsInput,
  prevStartMatrixRows,
  errorMessageMatrix,
  isErrorMatrix,
  isSelectedFuncMatrix,
  endMatrixRowsInput,
  true
);

validateInput(
  endMatrixRowsInput,
  prevEndMatrixRows,
  errorMessageMatrix,
  isErrorMatrix,
  isSelectedFuncMatrix,
  startMatrixRowsInput,
  false
);

calcPolynomInput.addEventListener("input", () => {
  checkErrorInput(
    calcPolynomInput, errorMessagePolynom, isErrorPolynom, 
    0.001, 0.1, "t", false);
});
calcPolynomInput.addEventListener("change", () => {
  checkErrorChange(calcPolynomInput, prevValuePolynom, isErrorPolynom, errorMessagePolynom);
});

let recout = 0;
const calcPolynomButton = getElement("#control-button-calc-polynom");

calcPolynomButton.addEventListener("click", () => {
  calcPolynom();
});

let inter;
let isBuildingPolynom = false;
let currentPolynomInterval = null;

const calcPolynomButtonText = getElement("#control-button-calc-polynom-text");
const calcPolynomButtonIcon = getElement("#control-button-calc-polynom-icon");

function calcPolynom() {
  if (isErrorPolynom.value) return;
  if (isBuilding && !isBuildingPolynom) return;
  if (canvasMainCurve.style.pointerEvents === "none" && !isBuilding) return;

  if (!currentSegment || currentSegment.isLine) {
    if (!currentSegment)
      errorMessagePolynom.textContent = "Оберіть сегмент для обчислення";
    else 
      errorMessagePolynom.textContent = "Оберіть криволінійний сегмент";

    setTimeout(() => {
      errorMessagePolynom.textContent = "";
    }, 2500);
    return;
  }

  if (isBuilding) {
    if (currentPolynomInterval) clearInterval(currentPolynomInterval);

    isBuilding = false;
    isBuildingPolynom = false;
    calcPolynomButtonText.textContent = "Запустити";
    calcPolynomButtonIcon.classList.remove("hide");

    canvasMainCurve.style.pointerEvents = "auto";
    lockImg.style.display = "none";
    sider.style.display = "flex";

    calcPolynomInput.style.pointerEvents = "auto";
    timePolynomInput.style.pointerEvents = "auto";

    drawCurve();

    return;
  }

  const maxPolynoms = currentSegment.controls.length - 1;
  startPolynomInput.max = maxPolynoms;
  endPolynomInput.max = maxPolynoms;

  tablePanel.style.display = "block";
  tableBody.innerHTML = ""; 

  const startPolynom = Number(startPolynomInput.value);
  const endPolynom = Number(endPolynomInput.value);

  const tableHeader = tableBody.previousElementSibling;
  tableHeader.innerHTML = `
      <tr>
          <th>t</th>
          ${Array.from({ length: endPolynom - startPolynom + 1 }, (_, i) => `<th>b<sub>${endPolynom},${startPolynom + i}</sub></th>`).join("")}
      </tr>
  `;

  isBuilding = true;
  isBuildingPolynom = true;
  calcPolynomButtonText.textContent = "Скинути";
  calcPolynomButtonIcon.classList.add("hide");

  errorMessagePolynom.textContent = "";
  canvasMainCurve.style.pointerEvents = "none";
  lockImg.style.display = "flex";
  sider.style.display = "none";

  calcPolynomInput.style.pointerEvents = "none";
  timePolynomInput.style.pointerEvents = "none";

  let temp = [];

  currentSegment.controls.forEach((control) => {
    temp.push(control.cpy());
  });
  
  tableBody.innerHTML = '';
  inter = temp[0].addPO(temp[3]);
  inter.mulC(1 / 2);
  
  ts = Number(calcPolynomInput.value);
  tm = Number(timePolynomInput.value) * ts * 1000;
  t = 0;

  let vec = [];
  temp.forEach((control) => {
    vec.push(control.subPO(inter));
  });

  let i;
  let curve = undefined;
  if (!glueToggle.checked) {
    curve = currentCurve;
  } else {
    currentCurve.some((point, index) => {
      if (
        point.isBase && 
        (point.segment[0] === currentSegment || point.segment[1] === currentSegment)) {
          i = index;
          return true;
        }
    });
    curve = currentCurve.slice(i, i + 4);
  }


  let points = [];

  let isEnd = false;
  currentPolynomInterval = setInterval(() => {
    if (!isBuilding) {
      clearInterval(currentPolynomInterval);
      return;
    }

    if (t >= 1) {
      if (isEnd) {
        clearInterval(currentPolynomInterval);

        canvasMainCurve.style.pointerEvents = "auto";
        lockImg.style.display = "none";
        sider.style.display = "flex";

        calcPolynomInput.style.pointerEvents = "auto";
        timePolynomInput.style.pointerEvents = "auto";

        calcPolynomButtonText.textContent = "Запустити";
        calcPolynomButtonIcon.classList.remove("hide");

        isBuildingPolynom = false;
        isBuilding = false;

        clear();
        for (let i = 0; i < points.length - 1; i++) {
          drawRecLine(points[i], points[i + 1], 2);
        }
    
        drawPolylineOne(curve, 1);
        drawCurve();
        return;
      }
      isEnd = true;
      t = 1;
    }

    clear();
    
    points.push(calcPolynomOne(vec, t, startPolynom, endPolynom).coordsToPos());
    for (let i = 0; i < points.length - 1; i++) {
      drawRecLine(points[i], points[i + 1], 2);
    }

    drawPolylineOne(curve, 1);

    t += ts;
  }, tm);
}

function calcBernsteinPolynomial(i, n, t) {
  const binomial = factorial(n) / (factorial(i) * factorial(n - i));
  return binomial * Math.pow(1 - t, n - i) * Math.pow(t, i);
}

function factorial(num) {
  return num <= 1 ? 1 : num * factorial(num - 1);
}

const tableBody = getElement("#table-polynom-body");
const tablePanel = getElement("#table-panel-polynom");

function calcPolynomOne(vec, t, startPolynom, endPolynom) {  
  const n = vec.length - 1; // Ступінь полінома
  let B = [];

  // Обчислення значень поліномів Бернштейна
  for (let i = 0; i <= n; i++) {
    B.push(calcBernsteinPolynomial(i, n, t));
  }

  let newRow = document.createElement('tr');

  let newCell = document.createElement('td');
  newCell.textContent = t.toFixed(2);
  newRow.appendChild(newCell); 


  for (let i = startPolynom; i <= endPolynom; i++) {
    newCell = document.createElement('td');
    newCell.textContent = B[i].toFixed(2);
    newRow.appendChild(newCell); 
  }

  tableBody.appendChild(newRow);

  tablePanel.scrollTop = tablePanel.scrollHeight;

  let point = inter.cpy();
  vec.forEach((vec, index) => {
    let pointPrev = point.cpy();
    let vecCur = vec.mulCO(B[index])
    point.addP(vecCur);

    drawRecLine(pointPrev.coordsToPos(), point.coordsToPos());
  })
  drawRecPoint(point.coordsToPos(), 2);
  drawRecPoint(inter.coordsToPos());


  return point;
}


const errorMessageRecursive = getElement("#error-message-recurcive");
const buildRecursiveInput = getElement("#step-t-size-recursive");

let isErrorRecurcive = {value: false};
let prevValueRecursive = {value: 0.01};
buildRecursiveInput.value = prevValueRecursive.value;

buildRecursiveInput.addEventListener("input", () => {
  checkErrorInput(
    buildRecursiveInput, errorMessageRecursive, isErrorRecurcive, 
    0.001, 0.1, "t", false);
});

buildRecursiveInput.addEventListener("change", () => {
  checkErrorChange(buildRecursiveInput, prevValueRecursive, isErrorRecurcive, errorMessageRecursive);
});

const buildRecursiveButton = getElement("#control-button-start-recursive");
buildRecursiveButton.addEventListener("click", buildRecurcive);
const buildRecursiveButtonText = getElement("#control-button-start-recursive-text");
const buildRecursiveButtonIcon = getElement("#control-button-start-recursive-icon");

const timeRecursiveInput = getElement("#time-recursive");

let prevValueRecursiveTime = {value: 1.5};
timeRecursiveInput.value = prevValueRecursiveTime.value;

timeRecursiveInput.addEventListener("input", () => {
  checkErrorInput(
    timeRecursiveInput, errorMessageRecursive, isErrorRecurcive, 
    1, 10, "часу", false);
});

timeRecursiveInput.addEventListener("change", () => {
  checkErrorChange(timeRecursiveInput, prevValueRecursiveTime, isErrorRecurcive, errorMessageRecursive);
});

let isBuilding = false;
let isBuildingRecurcive = false
let currentInterval = null;
function buildRecurcive() {
  if (isBuilding && !isBuildingRecurcive) return;
  if (isErrorRecurcive.value) return;
  if (canvasMainCurve.style.pointerEvents === "none" && !isBuilding) return;

  if (!currentCurve || currentCurve.length < 2) {
    errorMessageRecursive.textContent = "Оберіть криву для побудови";
    setTimeout(() => {
      errorMessageRecursive.textContent = "";
    }, 2500);
    return;
  }

  if (isBuilding) {

    if (currentInterval) clearInterval(currentInterval);

    isBuilding = false;
    isBuildingRecurcive = false; 
    buildRecursiveButtonText.textContent = "Запустити";
    buildRecursiveButtonIcon.classList.remove("hide");

    canvasMainCurve.style.pointerEvents = "auto";
    lockImg.style.display = "none";
    sider.style.display = "flex";

    buildRecursiveInput.style.pointerEvents = "auto";
    timeRecursiveInput.style.pointerEvents = "auto";
    currentPoint = p;
  
      progressTBar.style.width = 0;
      progressSBar.style.width = 0;
  
      progressTText.textContent = "0.00";
      progressSText.textContent = "0/0";

    drawCurve();

    return;
  }

  isBuilding = true;
  isBuildingRecurcive = true;
  buildRecursiveButtonText.textContent = "Скинути";
  buildRecursiveButtonIcon.classList.add("hide");


  errorMessageRecursive.textContent = "";
  canvasMainCurve.style.pointerEvents = "none";
  lockImg.style.display = "flex";
  sider.style.display = "none";

  buildRecursiveInput.style.pointerEvents = "none";
  timeRecursiveInput.style.pointerEvents = "none";

  p = currentPoint;
  currentPoint = undefined;

  ts = Number(buildRecursiveInput.value);
  let time = Number(timeRecursiveInput.value) * 1000;
  tm = time * ts;

  let off = 1;
  if (!currentCurve.at(-1).isBase)
    off = 2;

  segments = [];
  let cnt = 0;
  if (!glueToggle.checked) {
    cnt = 1
    segments.push(currentCurve[0].segment);
  } else {
    for (let i = 0; i < currentCurve.length - off; i++) {
      if (currentCurve[i].isBase) {
        if (cnt && segments[cnt - 1] === currentCurve[i].segment[0]) {
          segments.push(currentCurve[i].segment[1]);
        } else {
          segments.push(currentCurve[i].segment[0]);
        }
        cnt++;
      }
    }
  }
  

  isRev = currentCurve[0].coords !== segments[0].controls[0];

  index = 0;
  t = 0;
  points = [];

  drawRecRec();  
}


let p;
let segments;
let index;
let ts;
let t;
let points;
let tm;
let isRev;

let progressTText = getElement("#text-cur-t-value");
let progressSText = getElement("#text-cur-segment");

let progressTBar = getElement("#progress-t");
let progressSBar = getElement("#progress-s");
function drawRecRec() {
  if (segments.length <= index || !isBuilding) {
    canvasMainCurve.style.pointerEvents = "auto";
    lockImg.style.display = "none";
    sider.style.display = "flex";

    buildRecursiveInput.style.pointerEvents = "auto";
    timeRecursiveInput.style.pointerEvents = "auto";
    buildRecursiveButtonText.textContent = "Запустити";
    buildRecursiveButtonIcon.classList.remove("hide");

    setTimeout(() => {
      progressTBar.style.width = 0;
      progressSBar.style.width = 0;
  
      progressTText.textContent = "0.00";
      progressSText.textContent = "0/0";
    }, 1500);

    isBuildingRecurcive = false;
    isBuilding = false;
    return;
  }

  let segment = segments[index];
  t = 0;
  let isEnd = false;

  currentInterval = setInterval(() => {
    if (!isBuilding) {
      clearInterval(currentInterval);
      return;
    }

    if (t > 1) {
      if (isEnd) {
        clearInterval(currentInterval);
        index++;

        setTimeout(() => {
          drawRecRec();
        }, tm);

        clear();
        for (let i = 0; i < points.length - 1; i++) {
          drawLine(points[i], points[i + 1], 2);
        }
        drawPolylineOne(currentCurve, 1);

        currentPoint = p;
        return;
      }
      isEnd = true;
      t = 1;
    }

    let temp = [];
    segment.controls.forEach((control) => {
      temp.push(control.cpy().coordsToPos());
    });
    if (isRev) temp.reverse();

    clear();

    points.push(buildRecurciveOne(temp, t, 1, segment.controls.length));  
    for (let i = 0; i < points.length - 1; i++) {
      drawLine(points[i], points[i + 1], 2);
    }

    drawPoint(temp[0]);
    if (segment.isLine) {
      drawPoint(temp[1]);
    } else {
      drawPoint(temp[1], temp[0]);
      drawPoint(temp[2], temp[3]);
      drawPoint(temp[3]);
    }

    drawPolylineOne(currentCurve, 1);

    progressTBar.style.width = (t * 100) + "%";
    progressSBar.style.width = ((index + 1) / segments.length * 100) + "%";

    progressTText.textContent = t.toFixed(2);
    progressSText.textContent = (index + 1) + "/" + segments.length;

    t += ts;
  }, tm);
}

function buildRecurciveOne(controls, t, r = 1, rDeep) {
  let temp = controls.map(control => control.cpy()); 
  let n = temp.length;

  if (n === 1) {
    drawRecPoint(temp[0], 1); 
    return temp[0].cpy();
  }

  for (let i = 0; i < n - 1; i++) {
    drawRecLine(temp[i], temp[i + 1]);
  }

  let nextLevel = [];
  for (let i = 0; i < n - 1; i++) {
    let newX = (1 - t) * temp[i].x + t * temp[i + 1].x;
    let newY = (1 - t) * temp[i].y + t * temp[i + 1].y;
    nextLevel.push(new Pair(newX, newY));
  }

  nextLevel.forEach((point, index) => {
    drawRecPoint(point, (r === rDeep && index === 0) ? 1 : 0);
  });

  return buildRecurciveOne(nextLevel, t, r + 1);
}

function clear() {
  ctxCur.clearRect(0, 0, canvasMainCurve.width, canvasMainCurve.height);
}

function drawRecLine(sPoint, ePoint, act = false) {
  if (!act) {
    ctxCur.lineWidth = 1 * coefC;
    ctxCur.strokeStyle = colors.nonActiveCurve;
  } else  {
    ctxCur.lineWidth = 2 * coefC;
    if (act == 1) {
      ctxCur.strokeStyle = colors.activeCurve;
    } else {
      ctxCur.strokeStyle = colors.activeSegment;
    }

  } 
  
  ctxCur.beginPath();
  ctxCur.moveTo(sPoint.x, sPoint.y);
  ctxCur.lineTo(ePoint.x, ePoint.y);
  ctxCur.stroke();
}

function drawRecPoint(point, act = 0) {
  if (act === 0)
    ctxCur.fillStyle = colors.nonActiveCurve;
  else if (act === 1)
    ctxCur.fillStyle = colors.activeCurve;
  else 
    ctxCur.fillStyle = colors.activeSegment;

  ctxCur.beginPath();

  if (!act)
    ctxCur.arc(point.x, point.y, 2.5 * coefC, 0, Math.PI * 2);
  else 
    ctxCur.arc(point.x, point.y, 3.5 * coefC, 0, Math.PI * 2);

  ctxCur.fill();
}