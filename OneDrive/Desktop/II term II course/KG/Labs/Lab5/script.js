document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("mainCanvas");
  const ctx = canvas.getContext("2d");
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  // Inputs
  const squareX1Input = document.getElementById("square-x1");
  const squareY1Input = document.getElementById("square-y1");
  const squareX2Input = document.getElementById("square-x2");
  const squareY2Input = document.getElementById("square-y2");
  const vectorNInput = document.getElementById("vector-n");
  const vectorMInput = document.getElementById("vector-m");
  const angleAlphaInput = document.getElementById("angle-alpha");
  const scaleInput = document.getElementById("scale-input"); // Viewport scale

  // Buttons
  const alignSquareBtn = document.getElementById("align-square-btn");
  const applyFigureBtn = document.getElementById("apply-figure");
  const startStopBtn = document.getElementById("start-stop-animation");
  const resetBtn = document.getElementById("reset-state");
  const saveMatrixBtn = document.getElementById("save-matrix");
  const saveFinalMatrixBtn = document.getElementById("save-final-matrix");
  const saveInitialImageBtn = document.getElementById("save-initial-image");
  const saveCurrentImageBtn = document.getElementById("save-current-image");
  const themeToggleBtn = document.getElementById("theme-toggle-btn");

  // New Controls
  const resetRotationCenterBtn = document.getElementById(
    "reset-rotation-center-btn"
  );
  const enableAffineScalingCheckbox = document.getElementById(
    "enable-affine-scaling-cb"
  );
  const affineScaleFactorInput = document.getElementById("affine-scale-factor");
  const animationSpeedInput = document.getElementById("animation-speed");

  // Display
  const messagesDiv = document.getElementById("messages");
  const matrixDisplayDiv = document.getElementById("matrix-display");

  // Shape Selector
  const shapeSelectorDiv = document.getElementById("shape-selector");

  const SHAPES = {
    LINE: {
      name: "Line",
      icon: '<svg viewBox="0 0 24 24"><path stroke="currentColor" stroke-width="2" d="M4 12L20 12"/></svg>',
      pointsNeeded: 2,
      labelP1: "Start Point (X1,Y1)",
      labelP2: "End Point (X2,Y2)",
    },
    CIRCLE: {
      name: "Circle",
      icon: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="2" fill="none"/></svg>',
      pointsNeeded: 2,
      labelP1: "Center (Xc,Yc)",
      labelP2: "Radius Point (Xr,Yr)",
    },
    SQUARE: {
      name: "Square",
      icon: '<svg viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"/></svg>',
      pointsNeeded: 2,
      labelP1: "Corner 1 (X1,Y1)",
      labelP2: "Corner 2 (X2,Y2)",
    },
    RECTANGLE: {
      name: "Rectangle",
      icon: '<svg viewBox="0 0 24 24"><rect x="4" y="7" width="16" height="10" stroke="currentColor" stroke-width="2" fill="none"/></svg>',
      pointsNeeded: 2,
      labelP1: "Corner 1 (X1,Y1)",
      labelP2: "Corner 2 (X2,Y2)",
    },
    TRAPEZOID: {
      name: "Trapezoid",
      icon: '<svg viewBox="0 0 24 24"><polygon points="5,19 19,19 16,5 8,5" stroke="currentColor" stroke-width="2" fill="none"/></svg>',
      pointsNeeded: 2,
      labelP1: "Base Point 1 (Xb1,Yb1)",
      labelP2: "Base Point 2 (Xb2,Yb2)",
    },
    TRIANGLE_UP: {
      name: "Triangle (Up)",
      icon: '<svg viewBox="0 0 24 24"><polygon points="12,5 19,19 5,19" stroke="currentColor" stroke-width="2" fill="none"/></svg>',
      pointsNeeded: 2,
      labelP1: "Base Center (Xbc,Ybc)",
      labelP2: "Apex (Xa,Ya)",
    },
    TRIANGLE_ISOSCELES_RIGHT_POINTING: {
      name: "Triangle (Side)",
      icon: '<svg viewBox="0 0 24 24"><polygon points="5,12 19,5 19,19" stroke="currentColor" stroke-width="2" fill="none"/></svg>',
      pointsNeeded: 2,
      labelP1: "Apex (Xa,Ya)",
      labelP2: "Base Center (Xbc,Ybc)",
    },
    DIAMOND: {
      name: "Diamond",
      icon: '<svg viewBox="0 0 24 24"><polygon points="12,3 21,12 12,21 3,12" stroke="currentColor" stroke-width="2" fill="none"/></svg>',
      pointsNeeded: 2,
      labelP1: "Center (Xc,Yc)",
      labelP2: "Vertex (Xv,Yv)",
    },
    PENTAGON: {
      name: "Pentagon",
      icon: '<svg viewBox="0 0 24 24"><polygon points="12,2 19.4,8.2 15.9,18.8 8.1,18.8 4.6,8.2" stroke="currentColor" stroke-width="2" fill="none"/></svg>',
      pointsNeeded: 2,
      labelP1: "Center (Xc,Yc)",
      labelP2: "Vertex (Xv,Yv)",
    },
    HEXAGON: {
      name: "Hexagon",
      icon: '<svg viewBox="0 0 24 24"><polygon points="18,6.25 18,17.75 12,21.5 6,17.75 6,6.25 12,2.5" stroke="currentColor" stroke-width="2" fill="none"/></svg>',
      pointsNeeded: 2,
      labelP1: "Center (Xc,Yc)",
      labelP2: "Vertex (Xv,Yv)",
    },
    ARROW_RIGHT: {
      name: "Arrow Right",
      icon: '<svg viewBox="0 0 24 24"><path d="M4 11.5h14m-4-4l4 4-4 4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      pointsNeeded: 2,
      labelP1: "Tail (Xt,Yt)",
      labelP2: "Head (Xh,Yh)",
    },
    ARROW_LEFT: {
      name: "Arrow Left",
      icon: '<svg viewBox="0 0 24 24"><path d="M20 11.5H6m4 4l-4-4 4-4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      pointsNeeded: 2,
      labelP1: "Tail (Xt,Yt)",
      labelP2: "Head (Xh,Yh)",
    },
    ARROW_UP: {
      name: "Arrow Up",
      icon: '<svg viewBox="0 0 24 24"><path d="M12.5 20V6m-4 4l4-4 4 4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      pointsNeeded: 2,
      labelP1: "Tail (Xt,Yt)",
      labelP2: "Head (Xh,Yh)",
    },
    ARROW_DOWN: {
      name: "Arrow Down",
      icon: '<svg viewBox="0 0 24 24"><path d="M12.5 4v14m-4-4l4 4 4-4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      pointsNeeded: 2,
      labelP1: "Tail (Xt,Yt)",
      labelP2: "Head (Xh,Yh)",
    },
    STAR_4: {
      name: "4-Point Star",
      icon: '<svg viewBox="0 0 24 24"><polygon points="12,2 15,9 22,12 15,15 12,22 9,15 2,12 9,9" stroke="currentColor" stroke-width="2" fill="none"/></svg>',
      pointsNeeded: 2,
      labelP1: "Center (Xc,Yc)",
      labelP2: "Outer Vertex (Xv,Yv)",
    },
    STAR_5: {
      name: "5-Point Star",
      icon: '<svg viewBox="0 0 24 24"><polygon points="12,2 14.8,8.8 22,9.2 16.4,14.2 18.2,21.2 12,17.3 5.8,21.2 7.6,14.2 2,9.2 9.2,8.8" stroke="currentColor" stroke-width="2" fill="none"/></svg>',
      pointsNeeded: 2,
      labelP1: "Center (Xc,Yc)",
      labelP2: "Outer Vertex (Xv,Yv)",
    },
    STAR_6: {
      name: "6-Point Star",
      icon: '<svg viewBox="0 0 24 24"><path d="M12 2L14.5 7.5L21 9L16.5 13.5L18 20L12 16.5L6 20L7.5 13.5L3 9L9.5 7.5Z M12 5.8L13.6 9.8L18.1 10.8L14.7 13.7L15.9 18.2L12 15.8L8.1 18.2L9.3 13.7L5.9 10.8L10.4 9.8Z" stroke="currentColor" stroke-width="1.2" fill="none"/></svg>',
      pointsNeeded: 2,
      labelP1: "Center (Xc,Yc)",
      labelP2: "Outer Vertex (Xv,Yv)",
    },
  };
  let currentSelectedShapeType = "SQUARE";

  let currentScale = parseFloat(scaleInput.value) || 1; // Viewport scale
  let origin = { x: canvasWidth / 2, y: canvasHeight / 2 };

  const MIN_SCALE = 0.05;
  const MAX_SCALE = 200;
  const ZOOM_SENSITIVITY = 0.001;
  const CALCULATION_TOLERANCE = 0.01;

  let isPanning = false;
  let lastPanPosition = { x: 0, y: 0 };
  let altKeyPressed = false;

  let initialShapePoints = [];
  let currentShapePoints = [];
  let idealAlignedSquareCoords = null;

  let transformParams = { N: 0, M: 0, alpha: 0 };

  let customRotationCenter = null;
  let isUsingCustomRotationCenter = false;
  let affineScaleFactor = 1.0; 
  let isAffineScalingEnabled = false;
  let currentAnimationSpeed = 1.0;

  let animationState = {
    isAnimating: false,
    animationFrameId: null,
    currentStep: 0,
    totalSteps: 100, // Base steps, speed will modify increment
    direction: 1,
  };
  let currentFrameTransformationMatrix = createIdentityMatrix();
  let M_final_forward = createIdentityMatrix();

  let currentMode = "transform";
  let pathWaypoints = [];
  let pathAnimationState = {
    isAnimating: false,
    animationFrameId: null,
    currentSegment: 0,
    segmentProgress: 0,
    stepsPerSegment: 100, // Base steps per segment
  };

  const switchModeBtn = document.getElementById("switch-mode-btn");
  const pathControlsDiv = document.getElementById("path-controls");
  const startPathAnimationBtn = document.getElementById(
    "start-path-animation-btn"
  );
  const stopPathAnimationBtn = document.getElementById(
    "stop-path-animation-btn"
  );
  const clearPathBtn = document.getElementById("clear-path-btn");
  const removeLastWaypointBtn = document.getElementById(
    "remove-last-waypoint-btn"
  );
  const pathMessageDiv = document.getElementById("path-message");

  // --- Matrix Math ---
  function createIdentityMatrix() {
    return [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ];
  }
  function createTranslationMatrix(tx, ty) {
    return [
      [1, 0, 0],
      [0, 1, 0],
      [tx, ty, 1],
    ];
  }
  function createRotationMatrix(angleRad) {
    const c = Math.cos(angleRad),
      s = Math.sin(angleRad);
    return [
      [c, s, 0],
      [-s, c, 0],
      [0, 0, 1],
    ];
  }
  function createScaleMatrix(sx, sy) {
    return [
      [sx, 0, 0],
      [0, sy, 0],
      [0, 0, 1],
    ];
  }
  function multiplyMatrices(A, B) {
    const C = createIdentityMatrix();
    for (let i = 0; i < 3; i++)
      for (let j = 0; j < 3; j++) {
        C[i][j] = 0;
        for (let k = 0; k < 3; k++) C[i][j] += A[i][k] * B[k][j];
      }
    return C;
  }
  function transformPoint(p, m) {
    const P = [p.x, p.y, 1],
      Pr = [0, 0, 0];
    for (let j = 0; j < 3; j++)
      for (let k = 0; k < 3; k++) Pr[j] += P[k] * m[k][j];
    return { x: Pr[0] / Pr[2], y: Pr[1] / Pr[2] };
  }

  // --- Drawing Functions ---
  function clearCanvasWithTailEffect() {
    const bg =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--primary-bg")
        .trim() || "#0a192f";
    ctx.fillStyle = bg;
    ctx.globalAlpha = 0.15;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.globalAlpha = 1.0;
  }
  function fullClearCanvas() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  }
  function drawCoordinatePlane() {
    ctx.save();
    ctx.strokeStyle =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--grid-color")
        .trim() || "rgba(100,255,218,0.1)";
    const tc =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--text-secondary-color")
        .trim() || "#8892b0";
    ctx.fillStyle = tc;
    ctx.lineWidth = 1;
    ctx.translate(origin.x, origin.y);
    if (origin.x < canvasWidth - 10)
      ctx.fillText("X", canvasWidth - origin.x - 10, -5);
    ctx.beginPath();
    ctx.moveTo(-origin.x, 0);
    ctx.lineTo(canvasWidth - origin.x, 0);
    ctx.stroke();
    if (origin.y > 15) ctx.fillText("Y", 5, -origin.y + 15);
    ctx.beginPath();
    ctx.moveTo(0, -origin.y);
    ctx.lineTo(0, canvasHeight - origin.y);
    ctx.stroke();
    let gsW = 50;
    if (currentScale < 0.2) gsW = 200;
    else if (currentScale < 0.05) gsW = 1000;
    else if (currentScale > 5) gsW = 10;
    else if (currentScale > 20) gsW = 2;
    const sPx = gsW * currentScale;
    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    let sXW = Math.floor(-origin.x / sPx) * gsW;
    for (let wX = sXW; wX * currentScale < canvasWidth - origin.x; wX += gsW) {
      const xPx = wX * currentScale;
      if (Math.abs(wX) > 0.0001 || gsW === 0) {
        if (
          xPx > -origin.x - sPx / 2 &&
          xPx < canvasWidth - origin.x + sPx / 2
        ) {
          ctx.beginPath();
          ctx.moveTo(xPx, -5);
          ctx.lineTo(xPx, 5);
          ctx.stroke();
          ctx.fillText(wX.toFixed(0), xPx, 15);
        }
      }
    }
    let sYW = Math.ceil(origin.y / sPx) * gsW;
    for (
      let wY = sYW;
      -wY * currentScale < canvasHeight - origin.y;
      wY -= gsW
    ) {
      const yPx = -wY * currentScale;
      if (Math.abs(wY) > 0.0001 || gsW === 0) {
        if (
          yPx > -origin.y - sPx / 2 &&
          yPx < canvasHeight - origin.y + sPx / 2
        ) {
          ctx.beginPath();
          ctx.moveTo(-5, yPx);
          ctx.lineTo(5, yPx);
          ctx.stroke();
          ctx.fillText(wY.toFixed(0), -20, yPx);
        }
      }
    }
    if (
      0 > -origin.x &&
      0 < canvasWidth - origin.x &&
      0 > -origin.y &&
      0 < canvasHeight - origin.y
    ) {
      ctx.fillText("0", -10, 10);
    }
    ctx.restore();
  }

  function drawCustomMarkers() {
    if (isUsingCustomRotationCenter && customRotationCenter) {
      ctx.save();
      ctx.translate(origin.x, origin.y);
      const markerColor =
        getComputedStyle(document.documentElement)
          .getPropertyValue("--rotation-center-marker-color")
          .trim() || "yellow";
      ctx.strokeStyle = markerColor;
      ctx.fillStyle = markerColor;
      ctx.lineWidth = 1;

      const markerScreenSize = 5;

      const cx_world = customRotationCenter.x;
      const cy_world = customRotationCenter.y;

      const cx_canvas = cx_world * currentScale;
      const cy_canvas = -cy_world * currentScale;

      ctx.beginPath();
      ctx.moveTo(cx_canvas - markerScreenSize, cy_canvas);
      ctx.lineTo(cx_canvas + markerScreenSize, cy_canvas);
      ctx.moveTo(cx_canvas, cy_canvas - markerScreenSize);
      ctx.lineTo(cx_canvas, cy_canvas + markerScreenSize);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx_canvas, cy_canvas, markerScreenSize / 2.5, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.restore();
    }
  }

  function drawShape(pts, c, lW = 2) {
    if (!pts || pts.length < 1) return;
    if (currentSelectedShapeType === "SCRIBBLE" && pts.length === 0) return;

    ctx.save();
    const sC =
      c ||
      getComputedStyle(document.documentElement)
        .getPropertyValue("--accent-color")
        .trim() ||
      "#64ffda";
    let fCC = sC;
    try {
      if (sC.startsWith("#")) {
        const r = parseInt(sC.slice(1, 3), 16),
          g = parseInt(sC.slice(3, 5), 16),
          b = parseInt(sC.slice(5, 7), 16);
        fCC = `rgba(${r},${g},${b},0.15)`;
      } else if (sC.startsWith("rgb") && !sC.startsWith("rgba")) {
        fCC = sC.replace("rgb", "rgba").replace(")", ",0.15)");
      } else if (sC.startsWith("hsl") && !sC.startsWith("hsla")) {
        fCC = sC.replace("hsl", "hsla").replace(")", ",0.15)");
      } else if (sC.startsWith("rgba") || sC.startsWith("hsla")) {
        fCC = sC.replace(/,\s*\d?\.?\d*\s*\)/, ",0.15)");
      }
    } catch (e) {
      fCC = "rgba(100,255,218,0.15)";
    }

    ctx.strokeStyle = sC;
    ctx.fillStyle = fCC;
    ctx.lineWidth = lW;
    ctx.shadowBlur = 10;
    ctx.shadowColor = sC;

    ctx.translate(origin.x, origin.y);
    ctx.beginPath();

    if (pts.length === 1) {
      ctx.arc(
        pts[0].x * currentScale,
        -pts[0].y * currentScale,
        lW * 1.5,
        0,
        2 * Math.PI
      );
    } else {
      ctx.moveTo(pts[0].x * currentScale, -pts[0].y * currentScale);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x * currentScale, -pts[i].y * currentScale);
      }
    }

    const isLineLike =
      currentSelectedShapeType === "LINE" ||
      currentSelectedShapeType === "SCRIBBLE" ||
      currentSelectedShapeType.startsWith("ARROW");

    if (!isLineLike) {
      ctx.closePath();
    }

    ctx.stroke();

    if (!isLineLike && pts.length > 2) {
      ctx.fill();
    }
    ctx.restore();
  }

  function drawPath(waypoints, color, pointRadius = 3) {
    if (!waypoints || waypoints.length === 0) return;
    ctx.save();
    ctx.translate(origin.x, origin.y);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 1;
    waypoints.forEach((wp) => {
      ctx.beginPath();
      ctx.arc(
        wp.x * currentScale,
        -wp.y * currentScale,
        pointRadius * (currentScale > 0.5 ? 1 : 0.5 / currentScale),
        0,
        Math.PI * 2
      );
      ctx.fill();
    });
    if (waypoints.length > 1) {
      ctx.beginPath();
      ctx.moveTo(waypoints[0].x * currentScale, -waypoints[0].y * currentScale);
      for (let i = 1; i < waypoints.length; i++)
        ctx.lineTo(
          waypoints[i].x * currentScale,
          -waypoints[i].y * currentScale
        );
      ctx.stroke();
    }
    ctx.restore();
  }

  function redrawAll() {
    if (animationState.isAnimating || pathAnimationState.isAnimating) {
      clearCanvasWithTailEffect();
    } else {
      fullClearCanvas();
    }
    drawCoordinatePlane();
    drawCustomMarkers();

    if (currentMode === "path" && pathWaypoints.length > 0) {
      drawPath(
        pathWaypoints,
        getComputedStyle(document.documentElement)
          .getPropertyValue("--highlight-color")
          .trim() || "yellow",
        3
      );
    }

    const accentColor =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--accent-color")
        .trim() || "#64ffda";
    const secondaryTextColor =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--text-secondary-color")
        .trim() || "#8892b0";

    if (currentShapePoints && currentShapePoints.length > 0) {
      drawShape(currentShapePoints, accentColor, 2);
    } else if (initialShapePoints && initialShapePoints.length > 0) {
      drawShape(initialShapePoints, secondaryTextColor, 2);
    }
  }

  // --- Helper Functions ---
  function displayMessage(t, iE = false, a = false, iH = false) {
    const mE = document.createElement("div");
    if (iH) {
      mE.innerHTML = t;
    } else {
      mE.textContent = t;
    }
    if (iE) {
      mE.style.color =
        getComputedStyle(document.documentElement)
          .getPropertyValue("--highlight-color")
          .trim() || "red";
    } else {
      mE.style.color = getComputedStyle(document.documentElement)
        .getPropertyValue("--text-color")
        .trim();
    }

    if (a) {
      if (messagesDiv.children.length > 4)
        messagesDiv.removeChild(messagesDiv.firstChild);
      messagesDiv.appendChild(mE);
    } else {
      messagesDiv.innerHTML = "";
      messagesDiv.appendChild(mE);
    }
  }
  function formatMatrixForDisplay(m) {
    return m
      .map(
        (r) =>
          "[" + r.map((v) => v.toFixed(3).padStart(8, " ")).join(", ") + "]"
      )
      .join("\n");
  }
  function updateMatrixDisplay(m) {
    matrixDisplayDiv.textContent = formatMatrixForDisplay(m);
  }
  function distance(p1, p2) {
    const dx = p1.x - p2.x,
      dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }
  function calculateCenter(pts) {
    if (!pts || pts.length === 0) return { x: 0, y: 0 };
    let sX = 0,
      sY = 0;
    pts.forEach((p) => {
      sX += p.x;
      sY += p.y;
    });
    return { x: sX / pts.length, y: sY / pts.length };
  }
  function getPointsFromInputs() {
    const x1 = parseFloat(squareX1Input.value),
      y1 = parseFloat(squareY1Input.value),
      x2 = parseFloat(squareX2Input.value),
      y2 = parseFloat(squareY2Input.value);
    if (isNaN(x1) || isNaN(y1) || isNaN(x2) || isNaN(y2)) {
      displayMessage(
        "Будь ласка, введіть валідні числові координати для обох точок.",
        true
      );
      return null;
    }
    return { p1: { x: x1, y: y1 }, p2: { x: x2, y: y2 } };
  }

  function getSquareVerticesFromDiagonal(p1, p2) {
    if (distance(p1, p2) < CALCULATION_TOLERANCE) {
      displayMessage(
        "Введені точки діагоналі збігаються або надто близькі. Неможливо побудувати квадрат.",
        true
      );
      return null;
    }
    const cx = (p1.x + p2.x) / 2,
      cy = (p1.y + p2.y) / 2,
      hDX = p1.x - cx,
      hDY = p1.y - cy;
    return [
      { x: p1.x, y: p1.y },
      { x: cx - hDY, y: cy + hDX },
      { x: p2.x, y: p2.y },
      { x: cx + hDY, y: cy - hDX },
    ];
  }

  function getShapeVerticesFromInputs(p1, p2, shapeType) {
    const numSegmentsCircle = 32;
    let points = [];

    switch (shapeType) {
      case "LINE":
        if (distance(p1, p2) < CALCULATION_TOLERANCE) {
          displayMessage("Points for line are too close.", true);
          return null;
        }
        return [p1, p2];
      case "SQUARE":
        return getSquareVerticesFromDiagonal(p1, p2);
      case "RECTANGLE":
        if (distance(p1, p2) < CALCULATION_TOLERANCE) {
          displayMessage("Diagonal points for rectangle are too close.", true);
          return null;
        }
        return [
          { x: p1.x, y: p1.y },
          { x: p2.x, y: p1.y },
          { x: p2.x, y: p2.y },
          { x: p1.x, y: p2.y },
        ];
      case "CIRCLE":
        const radius = distance(p1, p2);
        if (radius < CALCULATION_TOLERANCE / 2) {
          displayMessage("Radius for circle is too small.", true);
          return null;
        }
        for (let i = 0; i < numSegmentsCircle; i++) {
          const angle = (i / numSegmentsCircle) * 2 * Math.PI;
          points.push({
            x: p1.x + radius * Math.cos(angle),
            y: p1.y + radius * Math.sin(angle),
          });
        }
        return points;
      case "TRIANGLE_UP":
        const baseHalfWidth = Math.abs(p2.x - p1.x);
        if (
          Math.abs(p2.y - p1.y) < CALCULATION_TOLERANCE ||
          baseHalfWidth < CALCULATION_TOLERANCE
        ) {
          displayMessage(
            "Points for triangle are too close or base width is zero.",
            true
          );
          return null;
        }
        return [
          { x: p1.x - baseHalfWidth, y: p1.y },
          { x: p1.x + baseHalfWidth, y: p1.y },
          p2,
        ];
      case "TRIANGLE_ISOSCELES_RIGHT_POINTING":
        const mainAxisLen = distance(p1, p2);
        if (mainAxisLen < CALCULATION_TOLERANCE) {
          displayMessage("Points for isosceles triangle too close.", true);
          return null;
        }
        const triBaseHalfWidth = mainAxisLen * 0.5;
        const angleAxis = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        const b1x = p2.x + triBaseHalfWidth * Math.cos(angleAxis + Math.PI / 2);
        const b1y = p2.y + triBaseHalfWidth * Math.sin(angleAxis + Math.PI / 2);
        const b2x = p2.x + triBaseHalfWidth * Math.cos(angleAxis - Math.PI / 2);
        const b2y = p2.y + triBaseHalfWidth * Math.sin(angleAxis - Math.PI / 2);
        return [p1, { x: b1x, y: b1y }, { x: b2x, y: b2y }];
      case "DIAMOND":
        const dx_d = p2.x - p1.x;
        const dy_d = p2.y - p1.y;
        if (
          Math.abs(dx_d) < CALCULATION_TOLERANCE &&
          Math.abs(dy_d) < CALCULATION_TOLERANCE
        ) {
          displayMessage("Center and vertex for diamond are too close.", true);
          return null;
        }
        return [
          { x: p1.x + dx_d, y: p1.y + dy_d },
          { x: p1.x - dy_d, y: p1.y + dx_d },
          { x: p1.x - dx_d, y: p1.y - dy_d },
          { x: p1.x + dy_d, y: p1.y - dx_d },
        ];
      case "PENTAGON":
      case "HEXAGON":
      case "STAR_4":
      case "STAR_5":
      case "STAR_6":
        const nOuterPoints =
          shapeType === "PENTAGON"
            ? 5
            : shapeType === "HEXAGON"
            ? 6
            : shapeType === "STAR_4"
            ? 4
            : shapeType === "STAR_5"
            ? 5
            : 6;
        const radiusN = distance(p1, p2);
        if (radiusN < CALCULATION_TOLERANCE) {
          displayMessage("Radius for shape is too small.", true);
          return null;
        }
        const startAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        const angleStepN = (2 * Math.PI) / nOuterPoints;
        if (shapeType.startsWith("STAR")) {
          const innerRadiusFactor =
            shapeType === "STAR_6" || shapeType === "STAR_4" ? 0.577 : 0.382;
          const innerRadius = radiusN * innerRadiusFactor;
          for (let i = 0; i < nOuterPoints; i++) {
            let angle = startAngle + i * angleStepN;
            points.push({
              x: p1.x + radiusN * Math.cos(angle),
              y: p1.y + radiusN * Math.sin(angle),
            });
            angle += angleStepN / 2;
            points.push({
              x: p1.x + innerRadius * Math.cos(angle),
              y: p1.y + innerRadius * Math.sin(angle),
            });
          }
        } else {
          for (let i = 0; i < nOuterPoints; i++) {
            const angle = startAngle + i * angleStepN;
            points.push({
              x: p1.x + radiusN * Math.cos(angle),
              y: p1.y + radiusN * Math.sin(angle),
            });
          }
        }
        return points;
      case "ARROW_RIGHT":
      case "ARROW_LEFT":
      case "ARROW_UP":
      case "ARROW_DOWN":
        const arrowLen = distance(p1, p2);
        if (arrowLen < CALCULATION_TOLERANCE * 3) {
          displayMessage("Arrow length is too short.", true);
          return null;
        }
        const angleArr = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        const dynamicScale = Math.max(0.5, Math.min(2, 1 / currentScale));
        const headLen = Math.min(arrowLen / 3, 15 * dynamicScale);
        const arrowPoints = [
          p1,
          p2,
          {
            x: p2.x - headLen * Math.cos(angleArr - Math.PI / 7),
            y: p2.y - headLen * Math.sin(angleArr - Math.PI / 7),
          },
          p2,
          {
            x: p2.x - headLen * Math.cos(angleArr + Math.PI / 7),
            y: p2.y - headLen * Math.sin(angleArr + Math.PI / 7),
          },
        ];
        return arrowPoints;
      case "TRAPEZOID":
        const lenBase = distance(p1, p2);
        if (lenBase < CALCULATION_TOLERANCE) {
          displayMessage("Base for trapezoid too short", true);
          return null;
        }
        const heightFactor = 0.6;
        const topBaseFactor = 0.5;
        const midPointBaseX = (p1.x + p2.x) / 2;
        const midPointBaseY = (p1.y + p2.y) / 2;
        const angleBaseTrap = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        const heightTrap = lenBase * heightFactor;
        const topLen = lenBase * topBaseFactor;
        const topMidX = midPointBaseX - heightTrap * Math.sin(angleBaseTrap);
        const topMidY = midPointBaseY + heightTrap * Math.cos(angleBaseTrap);
        const p3x = topMidX + (topLen / 2) * Math.cos(angleBaseTrap);
        const p3y = topMidY + (topLen / 2) * Math.sin(angleBaseTrap);
        const p4x = topMidX - (topLen / 2) * Math.cos(angleBaseTrap);
        const p4y = topMidY - (topLen / 2) * Math.sin(angleBaseTrap);
        if ((p2.x - p1.x) * (p3y - p1.y) - (p2.y - p1.y) * (p3x - p1.x) > 0) {
          return [p1, p2, { x: p4x, y: p4y }, { x: p3x, y: p3y }];
        } else {
          return [p1, p2, { x: p3x, y: p3y }, { x: p4x, y: p4y }];
        }
      default:
        displayMessage(
          `Shape type "${shapeType}" not implemented for point generation.`,
          true
        );
        return null;
    }
  }

  function applyInputs() {
    stopAnimationInternal();
    stopPathAnimationInternal();
    idealAlignedSquareCoords = null;
    animationState.currentStep = 0;
    animationState.direction = 1;
    M_final_forward = createIdentityMatrix();
    messagesDiv.innerHTML = "";

    const rawPD = getPointsFromInputs();
    if (!rawPD) return false;

    const sV = getShapeVerticesFromInputs(
      rawPD.p1,
      rawPD.p2,
      currentSelectedShapeType
    );

    if (!sV || (sV.length === 0 && currentSelectedShapeType !== "SCRIBBLE")) {
      displayMessage(
        "Failed to generate shape vertices or not enough points for the shape.",
        true
      );
      initialShapePoints = [];
      currentShapePoints = [];
      redrawAll();
      return false;
    }
    initialShapePoints = sV;
    displayMessage(
      `Фігуру '${SHAPES[currentSelectedShapeType].name}' успішно побудовано.`,
      false,
      false,
      false
    );

    if (initialShapePoints && initialShapePoints.length > 0) {
      let cHT = "<b>Характеристики поточної фігури:</b><br>";
      cHT += ` Тип: ${SHAPES[currentSelectedShapeType].name}<br>`;
      cHT += ` Кількість вершин: ${initialShapePoints.length}<br>`;
      const centerPt = calculateCenter(initialShapePoints);
      cHT += ` Центр (приблизно): (${centerPt.x.toFixed(
        2
      )}, ${centerPt.y.toFixed(2)})<br>`;
      displayMessage(cHT, false, true, true);

      if (
        currentSelectedShapeType === "SQUARE" &&
        initialShapePoints.length === 4
      ) {
        const pA = initialShapePoints[0],
          pB = initialShapePoints[1],
          pC = initialShapePoints[2],
          pD = initialShapePoints[3];
        const sAB = distance(pA, pB),
          sBC = distance(pB, pC),
          sCD = distance(pC, pD),
          sDA = distance(pD, pA);
        const dAC = distance(pA, pC),
          dBD = distance(pB, pD);
        let iPS = true;
        if (
          Math.abs(sAB - sBC) > CALCULATION_TOLERANCE ||
          Math.abs(sBC - sCD) > CALCULATION_TOLERANCE ||
          Math.abs(sCD - sDA) > CALCULATION_TOLERANCE
        )
          iPS = false;
        if (Math.abs(dAC - dBD) > CALCULATION_TOLERANCE) iPS = false;
        if (
          iPS &&
          Math.abs(dAC - sAB * Math.sqrt(2)) > CALCULATION_TOLERANCE * 2
        )
          iPS = false;

        if (iPS) {
          const cen = calculateCenter(initialShapePoints);
          const diagDist = distance(
            initialShapePoints[0],
            initialShapePoints[2]
          );
          const sL = diagDist / Math.sqrt(2);
          const hS = sL / 2;
          idealAlignedSquareCoords = {
            x1: cen.x - hS,
            y1: cen.y + hS,
            x2: cen.x + hS,
            y2: cen.y - hS,
          };
          let iST = `<b>Пропонований вирівняний квадрат:</b><br>`;
          iST += ` Ліва верхня: (${idealAlignedSquareCoords.x1.toFixed(
            2
          )}, ${idealAlignedSquareCoords.y1.toFixed(2)})<br>`;
          iST += ` Права нижня: (${idealAlignedSquareCoords.x2.toFixed(
            2
          )}, ${idealAlignedSquareCoords.y2.toFixed(2)})<br>`;
          displayMessage(iST, false, true, true);

          let mXC = Infinity,
            mAXC = -Infinity,
            mYC = Infinity,
            mAYC = -Infinity;
          initialShapePoints.forEach((v) => {
            mXC = Math.min(mXC, v.x);
            mAXC = Math.max(mAXC, v.x);
            mYC = Math.min(mYC, v.y);
            mAYC = Math.max(mAYC, v.y);
          });
          const iAA =
            Math.abs(mXC - idealAlignedSquareCoords.x1) <
              CALCULATION_TOLERANCE &&
            Math.abs(mAYC - idealAlignedSquareCoords.y1) <
              CALCULATION_TOLERANCE &&
            Math.abs(mAXC - idealAlignedSquareCoords.x2) <
              CALCULATION_TOLERANCE &&
            Math.abs(mYC - idealAlignedSquareCoords.y2) < CALCULATION_TOLERANCE;
          alignSquareBtn.style.display = iPS && !iAA ? "block" : "none";
        } else {
          displayMessage(
            `<span style='color:${
              getComputedStyle(document.documentElement)
                .getPropertyValue("--highlight-color")
                .trim() || "orange"
            };'>Увага: Побудована фігура може не бути ідеальним квадратом.</span><br>`,
            true,
            true,
            true
          );
          alignSquareBtn.style.display = "none";
        }
      } else {
        alignSquareBtn.style.display = "none";
      }
    }

    transformParams.N = parseFloat(vectorNInput.value) || 0;
    transformParams.M = parseFloat(vectorMInput.value) || 0;
    transformParams.alpha =
      (parseFloat(angleAlphaInput.value) * Math.PI) / 180.0 || 0;

    if (
      isNaN(transformParams.N) ||
      isNaN(transformParams.M) ||
      isNaN(transformParams.alpha)
    ) {
      displayMessage(
        "Неправильні параметри трансформації (N, M, alpha).",
        true
      );
      return false;
    }
    const nSFI = parseFloat(scaleInput.value);
    if (!isNaN(nSFI) && nSFI >= MIN_SCALE && nSFI <= MAX_SCALE) {
      currentScale = nSFI;
    } else {
      displayMessage(
        `Масштаб має бути числом між ${MIN_SCALE} та ${MAX_SCALE}.`,
        true
      );
      scaleInput.value = currentScale.toFixed(2);
    }

    if (initialShapePoints.length > 0) {
      let M_initial_placement = createIdentityMatrix(); // Починаємо з одиничної матриці

      if (currentMode === "path" && pathWaypoints.length > 0) {
        const initialFigCenter = calculateCenter(initialShapePoints);
        const firstWaypoint = pathWaypoints[0];
        const dx_to_waypoint = firstWaypoint.x - initialFigCenter.x;
        const dy_to_waypoint = firstWaypoint.y - initialFigCenter.y;

        M_initial_placement = createTranslationMatrix(
          dx_to_waypoint,
          dy_to_waypoint
        );

        currentShapePoints = initialShapePoints.map((p) =>
          transformPoint(p, M_initial_placement)
        );
        currentFrameTransformationMatrix = M_initial_placement;
      } else {
        currentShapePoints = JSON.parse(JSON.stringify(initialShapePoints)); // Просто копіюємо початкові точки
        currentFrameTransformationMatrix = createIdentityMatrix(); // Поточна матриця - одинична
      }
      updateMatrixDisplay(currentFrameTransformationMatrix); // Відображення матриці
    } else {
      currentShapePoints = [];
      currentFrameTransformationMatrix = createIdentityMatrix();
      updateMatrixDisplay(currentFrameTransformationMatrix);
    }
    redrawAll();
    return true;
  }

  alignSquareBtn.addEventListener("click", () => {
    if (idealAlignedSquareCoords && currentSelectedShapeType === "SQUARE") {
      squareX1Input.value = idealAlignedSquareCoords.x1.toFixed(2);
      squareY1Input.value = idealAlignedSquareCoords.y1.toFixed(2);
      squareX2Input.value = idealAlignedSquareCoords.x2.toFixed(2);
      squareY2Input.value = idealAlignedSquareCoords.y2.toFixed(2);
      messagesDiv.innerHTML = "";
      displayMessage(
        "Координати вирівняного квадрата застосовано. Натисніть 'Застосувати фігуру'.",
        false,
        false,
        false
      );
      alignSquareBtn.style.display = "none";
    }
  });
  [squareX1Input, squareY1Input, squareX2Input, squareY2Input].forEach((i) => {
    i.addEventListener("input", () => {
      idealAlignedSquareCoords = null;
      alignSquareBtn.style.display = "none";
    });
  });

  function stopAnimationInternal() {
    if (animationState.isAnimating) {
      cancelAnimationFrame(animationState.animationFrameId);
      animationState.isAnimating = false;
      startStopBtn.textContent = "Старт анімації";
    }
  }

  function animateStep() {
    if (!animationState.isAnimating) return;

    let speed = parseFloat(animationSpeedInput.value) || 1.0;
    speed = Math.max(0.1, Math.min(5.0, speed)); // Clamp speed

    animationState.currentStep += animationState.direction * speed;
    if (animationState.direction === 1) {
      animationState.currentStep = Math.min(
        animationState.currentStep,
        animationState.totalSteps
      );
    } else {
      animationState.currentStep = Math.max(animationState.currentStep, 0);
    }

    let t = animationState.currentStep / animationState.totalSteps;

    const N_eff = transformParams.N * t;
    const M_eff = transformParams.M * t;
    const alpha_eff = transformParams.alpha * t;
    const scale_eff = 1.0 + (affineScaleFactor - 1.0) * t; // Scale from 1.0 to target

    const pivotPoint =
      isUsingCustomRotationCenter && customRotationCenter
        ? customRotationCenter
        : calculateCenter(initialShapePoints);

    const T_to_pivot = createTranslationMatrix(-pivotPoint.x, -pivotPoint.y);
    const R_current_eff = createRotationMatrix(alpha_eff);
    const S_current_eff = isAffineScalingEnabled
      ? createScaleMatrix(scale_eff, scale_eff)
      : createIdentityMatrix();
    const T_from_pivot = createTranslationMatrix(pivotPoint.x, pivotPoint.y);
    const T_global_current_eff = createTranslationMatrix(N_eff, M_eff);

    let M_frame = createIdentityMatrix();
    M_frame = multiplyMatrices(M_frame, T_to_pivot);
    M_frame = multiplyMatrices(M_frame, S_current_eff);
    M_frame = multiplyMatrices(M_frame, R_current_eff);
    M_frame = multiplyMatrices(M_frame, T_from_pivot);
    M_frame = multiplyMatrices(M_frame, T_global_current_eff);

    currentFrameTransformationMatrix = M_frame;
    currentShapePoints = initialShapePoints.map((p) =>
      transformPoint(p, currentFrameTransformationMatrix)
    );
    updateMatrixDisplay(currentFrameTransformationMatrix);
    redrawAll();

    if (
      animationState.direction === 1 &&
      animationState.currentStep >= animationState.totalSteps
    ) {
      animationState.direction = -1;
      M_final_forward = JSON.parse(
        JSON.stringify(currentFrameTransformationMatrix)
      );
    } else if (
      animationState.direction === -1 &&
      animationState.currentStep <= 0
    ) {
      animationState.direction = 1;
    }

    if (animationState.isAnimating) {
      animationState.animationFrameId = requestAnimationFrame(animateStep);
    }
  }

  startStopBtn.addEventListener("click", () => {
    if (startStopBtn.textContent === "▶") {
      startStopBtn.textContent = "Старт анімації";
    }

    if (currentMode !== "transform") {
      displayMessage(
        "Start/Stop for transform animation is disabled in Path Mode.",
        true
      );
      return;
    }
    if (animationState.isAnimating) {
      stopAnimationInternal();
      displayMessage("Анімацію зупинено.", false);
    } else {
      if (
        initialShapePoints.length === 0 &&
        currentSelectedShapeType !== "SCRIBBLE"
      ) {
        if (!applyInputs()) return;
      } else if (
        initialShapePoints.length > 0 &&
        currentShapePoints.length === 0
      ) {
        applyInputs(); // Re-apply to set current shape if only initial exists
      }
      // Ensure transformParams and affineScaleFactor are fresh
      transformParams.N = parseFloat(vectorNInput.value) || 0;
      transformParams.M = parseFloat(vectorMInput.value) || 0;
      transformParams.alpha =
        (parseFloat(angleAlphaInput.value) * Math.PI) / 180.0 || 0;
      if (isAffineScalingEnabled) {
        affineScaleFactor = parseFloat(affineScaleFactorInput.value) || 1.0;
      } else {
        affineScaleFactor = 1.0;
      }

      animationState.isAnimating = true;
      startStopBtn.textContent = "Стоп анімації";
      displayMessage(
        (animationState.currentStep === 0 && animationState.direction === 1) ||
          (animationState.currentStep === animationState.totalSteps &&
            animationState.direction === -1)
          ? "Анімація запущена..."
          : "Анімацію продовжено...",
        false
      );
      alignSquareBtn.style.display = "none";
      animationState.animationFrameId = requestAnimationFrame(animateStep);
    }
  });

  resetBtn.addEventListener("click", () => {
    stopAnimationInternal();
    stopPathAnimationInternal();
    initialShapePoints = [];
    currentShapePoints = [];
    animationState.currentStep = 0;
    animationState.direction = 1;
    pathWaypoints = [];
    pathAnimationState.currentSegment = 0;
    pathAnimationState.segmentProgress = 0;
    if (pathMessageDiv)
      pathMessageDiv.textContent = "No waypoints defined yet.";
    origin = { x: canvasWidth / 2, y: canvasHeight / 2 };
    currentScale = 1.0;
    scaleInput.value = currentScale.toFixed(2);
    currentFrameTransformationMatrix = createIdentityMatrix();
    updateMatrixDisplay(currentFrameTransformationMatrix);
    M_final_forward = createIdentityMatrix();

    isUsingCustomRotationCenter = false;
    customRotationCenter = null;
    isAffineScalingEnabled = false;
    affineScaleFactor = 1.0;
    if (enableAffineScalingCheckbox)
      enableAffineScalingCheckbox.checked = false;
    if (affineScaleFactorInput) {
      affineScaleFactorInput.value = "1.0";
      affineScaleFactorInput.disabled = true;
    }
    if (animationSpeedInput) animationSpeedInput.value = "1.0";
    currentAnimationSpeed = 1.0;

    displayMessage("Стан повністю скинуто.", false);

    squareX1Input.value = 0;
    squareY1Input.value = 100;
    squareX2Input.value = 100;
    squareY2Input.value = 0;
    vectorNInput.value = 50;
    vectorMInput.value = 50;
    angleAlphaInput.value = 45;

    startStopBtn.textContent = "▶";

    if (currentMode === "path") {
      switchToTransformMode();
    } else {
      startStopBtn.disabled = false;
      vectorNInput.disabled = false;
      vectorMInput.disabled = false;
      angleAlphaInput.disabled = false;
      saveFinalMatrixBtn.disabled = false;
    }
    currentSelectedShapeType = "SQUARE";
    document
      .querySelectorAll("#shape-selector .shape-btn")
      .forEach((b) => b.classList.remove("active"));
    document
      .querySelector(`#shape-selector .shape-btn[data-shape="SQUARE"]`)
      .classList.add("active");
    updateInputLabelsForShape(currentSelectedShapeType);
    alignSquareBtn.style.display = "none";

    redrawAll();
  });

  applyFigureBtn.addEventListener("click", applyInputs);
  scaleInput.addEventListener("change", () => {
    // Viewport scale
    const nS = parseFloat(scaleInput.value);
    if (!isNaN(nS) && nS >= MIN_SCALE && nS <= MAX_SCALE) {
      currentScale = nS;
      redrawAll();
      displayMessage(
        `Масштаб змінено на ${currentScale.toFixed(2)} пікс/світ.од.`,
        false
      );
    } else {
      scaleInput.value = currentScale.toFixed(2);
      displayMessage(
        `Неправильне значення масштабу. Введіть між ${MIN_SCALE} та ${MAX_SCALE}.`,
        true
      );
    }
  });

  function handleWheelZoom(e) {
    e.preventDefault();
    const r = canvas.getBoundingClientRect(),
      mXc = e.clientX - r.left,
      mYc = e.clientY - r.top,
      wMXb = (mXc - origin.x) / currentScale,
      wMYb = (origin.y - mYc) / currentScale,
      zI = 1 - e.deltaY * ZOOM_SENSITIVITY;
    let nS = currentScale * zI;
    nS = Math.max(MIN_SCALE, Math.min(MAX_SCALE, nS));
    origin.x = mXc - wMXb * nS;
    origin.y = mYc + wMYb * nS;
    currentScale = nS;
    scaleInput.value = currentScale.toFixed(2);
    redrawAll();
  }
  canvas.addEventListener("wheel", handleWheelZoom);
  window.addEventListener("keydown", (e) => {
    if (e.key === "Alt") {
      altKeyPressed = true;
      if (!isPanning) canvas.style.cursor = "grab";
    }
  });
  window.addEventListener("keyup", (e) => {
    if (e.key === "Alt") {
      altKeyPressed = false;
      if (!isPanning) canvas.style.cursor = "default";
    }
  });
  canvas.addEventListener("mousedown", (e) => {
    if (e.button === 0 && altKeyPressed) {
      isPanning = true;
      lastPanPosition.x = e.clientX;
      lastPanPosition.y = e.clientY;
      canvas.style.cursor = "grabbing";
      e.preventDefault();
    }
  });
  canvas.addEventListener("mousemove", (e) => {
    if (isPanning) {
      const dx = e.clientX - lastPanPosition.x,
        dy = e.clientY - lastPanPosition.y;
      origin.x += dx;
      origin.y += dy;
      lastPanPosition.x = e.clientX;
      lastPanPosition.y = e.clientY;
      redrawAll();
    } else if (altKeyPressed) {
      canvas.style.cursor = "grab";
    }
  });
  window.addEventListener("mouseup", () => {
    if (isPanning) {
      isPanning = false;
      canvas.style.cursor = altKeyPressed ? "grab" : "default";
    }
  });
  canvas.addEventListener("mouseleave", () => {
    if (!isPanning && !altKeyPressed) {
      canvas.style.cursor = "default";
    }
  });

  function handleCanvasDoubleClick(e) {
    e.preventDefault();
    const r = canvas.getBoundingClientRect(),
      mXc = e.clientX - r.left,
      mYc = e.clientY - r.top,
      wX = (mXc - origin.x) / currentScale,
      wY = (origin.y - mYc) / currentScale,
      rWX = Math.round(wX),
      rWY = Math.round(wY);

    if (e.button === 0) {
      if (e.altKey && e.ctrlKey) {
        isUsingCustomRotationCenter = true;
        customRotationCenter = { x: rWX, y: rWY };
        displayMessage(
          `Встановлено користувацький центр обертання: (${rWX}, ${rWY})`,
          false,
          true
        );
        if (
          !animationState.isAnimating &&
          !pathAnimationState.isAnimating &&
          currentShapePoints.length > 0
        ) {
          applyInputs();
        }
        redrawAll();
        return;
      }

      if (
        currentMode === "transform" ||
        (currentMode === "path" && (e.ctrlKey || e.shiftKey))
      ) {
        if (e.ctrlKey) {
          squareX2Input.value = rWX;
          squareY2Input.value = rWY;
          const shapeInfo = SHAPES[currentSelectedShapeType];
          displayMessage(
            `${shapeInfo.labelP2.split("(")[0]}: (${rWX}, ${rWY})`,
            false,
            true
          );
        } else if (e.shiftKey) {
          vectorNInput.value = rWX;
          vectorMInput.value = rWY;
          transformParams.N = rWX;
          transformParams.M = rWY;
          displayMessage(
            `Вектор (N,M) оновлено: (${rWX}, ${rWY})`,
            false,
            true
          );
          if (currentMode === "transform" && animationState.isAnimating) {
            displayMessage(
              "Параметри (N,M) оновлено. Перезапустіть анімацію для ефекту.",
              false,
              true
            );
          } else if (
            currentMode === "transform" &&
            !animationState.isAnimating &&
            initialShapePoints.length > 0
          ) {
            applyInputs();
          }
        } else if (currentMode === "transform") {
          squareX1Input.value = rWX;
          squareY1Input.value = rWY;
          const shapeInfo = SHAPES[currentSelectedShapeType];
          displayMessage(
            `${shapeInfo.labelP1.split("(")[0]}: (${rWX}, ${rWY})`,
            false,
            true
          );
        }
      }
    }
  }
  canvas.addEventListener("dblclick", handleCanvasDoubleClick);
  canvas.addEventListener("click", (e) => {
    if (
      currentMode !== "path" ||
      isPanning ||
      altKeyPressed ||
      e.altKey ||
      e.ctrlKey ||
      e.shiftKey
    )
      return;
    e.preventDefault();
    const r = canvas.getBoundingClientRect(),
      mXc = e.clientX - r.left,
      mYc = e.clientY - r.top,
      wX = (mXc - origin.x) / currentScale,
      wY = (origin.y - mYc) / currentScale,
      rWX = Math.round(wX),
      rWY = Math.round(wY);
    pathWaypoints.push({ x: rWX, y: rWY });
    pathMessageDiv.textContent = `${pathWaypoints.length} waypoints.`;
    displayMessage(
      `Waypoint ${pathWaypoints.length}: (${rWX}, ${rWY})`,
      false,
      true
    );
    redrawAll();
  });
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());

  // --- Saving Functions ---
  function saveMatrixToFile(matrix, filename) {
    if (!matrix) {
      displayMessage("Немає матриці для збереження.", true);
      return;
    }
    const mS = matrix
      .map((r) => r.map((v) => v.toFixed(4)).join("\t"))
      .join("\n");
    const blob = new Blob([mS], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    displayMessage(`Матрицю ${filename} збережено.`, false, true, true);
  }

  saveMatrixBtn.addEventListener("click", () => {
    if (currentMode === "path") {
      if (initialShapePoints.length > 0 && currentShapePoints.length > 0) {
        displayMessage(
          "Збереження поточної ефективної матриці (шлях)...",
          false
        );
        saveMatrixToFile(
          currentFrameTransformationMatrix,
          "path_effective_matrix.txt"
        );
      } else {
        displayMessage(
          "Режим шляху: Немає даних. Зберігається одинична.",
          false,
          true
        );
        saveMatrixToFile(createIdentityMatrix(), "identity_matrix.txt");
      }
    } else {
      displayMessage(
        "Збереження поточної матриці кадру (трансформація)...",
        false
      );
      saveMatrixToFile(
        currentFrameTransformationMatrix,
        "current_frame_matrix.txt"
      );
    }
  });

  saveFinalMatrixBtn.addEventListener("click", () => {
    if (currentMode === "path") {
      displayMessage(
        "Кнопка 'Зберегти фінальну матрицю' не для режиму шляху.",
        true
      );
      return;
    }

    if (
      JSON.stringify(M_final_forward) ===
        JSON.stringify(createIdentityMatrix()) &&
      animationState.currentStep === 0 &&
      initialShapePoints.length > 0
    ) {
      const N_eff = transformParams.N,
        M_eff = transformParams.M,
        alpha_eff = transformParams.alpha;
      const pivot =
        isUsingCustomRotationCenter && customRotationCenter
          ? customRotationCenter
          : calculateCenter(initialShapePoints);

      const T_to_pivot = createTranslationMatrix(-pivot.x, -pivot.y);
      const R_eff = createRotationMatrix(alpha_eff);
      // For final matrix, use the full target affineScaleFactor
      const S_eff = isAffineScalingEnabled
        ? createScaleMatrix(affineScaleFactor, affineScaleFactor)
        : createIdentityMatrix();
      const T_from_pivot = createTranslationMatrix(pivot.x, pivot.y);
      const T_global_eff = createTranslationMatrix(N_eff, M_eff);

      let M_calc_final = createIdentityMatrix();
      M_calc_final = multiplyMatrices(M_calc_final, T_to_pivot);
      M_calc_final = multiplyMatrices(M_calc_final, S_eff);
      M_calc_final = multiplyMatrices(M_calc_final, R_eff);
      M_calc_final = multiplyMatrices(M_calc_final, T_from_pivot);
      M_calc_final = multiplyMatrices(M_calc_final, T_global_eff);

      displayMessage(
        "Збереження розрахункової фінальної матриці руху 'вперед'...",
        false
      );
      saveMatrixToFile(M_calc_final, "calculated_final_forward_matrix.txt");
    } else if (
      JSON.stringify(M_final_forward) !== JSON.stringify(createIdentityMatrix())
    ) {
      displayMessage(
        "Збереження фінальної матриці руху 'вперед' (з анімації)...",
        false
      );
      saveMatrixToFile(
        M_final_forward,
        "final_forward_matrix_from_animation.txt"
      );
    } else {
      displayMessage(
        "Фінальна матриця не сформована (анімація не досягла піку або фігура не задана). Зберігається поточна/одинична.",
        false,
        true,
        true
      );
      saveMatrixToFile(
        currentFrameTransformationMatrix,
        "current_or_identity_matrix.txt"
      );
    }
  });
  saveInitialImageBtn.addEventListener("click", () => {
    if (!initialShapePoints || initialShapePoints.length === 0) {
      displayMessage("Спочатку застосуйте фігуру.", true);
      return;
    }
    const wasTA = animationState.isAnimating,
      wasPA = pathAnimationState.isAnimating;
    if (wasTA) stopAnimationInternal();
    if (wasPA) stopPathAnimationInternal();

    const tempOrigin = { ...origin };
    const tempScale = currentScale;
    const tempCurrentShapePoints = currentShapePoints
      ? JSON.parse(JSON.stringify(currentShapePoints))
      : [];
    const tempPathWaypoints = pathWaypoints
      ? JSON.parse(JSON.stringify(pathWaypoints))
      : [];
    const tempIsAnimating = animationState.isAnimating;
    const tempPathIsAnimating = pathAnimationState.isAnimating;
    const tempCustomRotationCenter = customRotationCenter
      ? { ...customRotationCenter }
      : null;
    const tempIsUsingCustomRotationCenter = isUsingCustomRotationCenter;

    origin = { x: canvasWidth / 2, y: canvasHeight / 2 };
    currentScale = 1;
    currentShapePoints = [];
    pathWaypoints = [];
    animationState.isAnimating = false;
    pathAnimationState.isAnimating = false;
    isUsingCustomRotationCenter = false;
    customRotationCenter = null;

    fullClearCanvas();
    drawCoordinatePlane();
    const initialFigureColor =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--text-secondary-color")
        .trim() || "#8892b0";
    drawShape(initialShapePoints, initialFigureColor, 2);

    try {
      const dataURL = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = "initial_figure.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      displayMessage("Початкове зображення збережено.", false, true, true);
    } catch (e) {
      displayMessage("Помилка збереження зображення: " + e.message, true);
      console.error(e);
    }

    origin = tempOrigin;
    currentScale = tempScale;
    scaleInput.value = currentScale.toFixed(2);
    currentShapePoints = tempCurrentShapePoints;
    pathWaypoints = tempPathWaypoints;
    animationState.isAnimating = tempIsAnimating;
    pathAnimationState.isAnimating = tempPathIsAnimating;
    customRotationCenter = tempCustomRotationCenter;
    isUsingCustomRotationCenter = tempIsUsingCustomRotationCenter;

    redrawAll();

    if (wasTA) {
      animationState.isAnimating = true;
      startStopBtn.textContent = "Стоп анімації";
      animationState.animationFrameId = requestAnimationFrame(animateStep);
    }
    if (
      wasPA &&
      initialShapePoints.length > 0 &&
      tempPathWaypoints.length > 1
    ) {
      pathAnimationState.isAnimating = true;
      startPathAnimationBtn.textContent = "Анімація шляху...";
      startPathAnimationBtn.disabled = true;
      stopPathAnimationBtn.disabled = false;
      pathAnimationState.animationFrameId =
        requestAnimationFrame(animatePathStep);
    }
  });
  saveCurrentImageBtn.addEventListener("click", () => {
    let figureDrawn = false;
    if (currentShapePoints && currentShapePoints.length > 0) {
      figureDrawn = true;
    } else if (initialShapePoints && initialShapePoints.length > 0) {
      figureDrawn = true;
      displayMessage(
        "Збереження початкового вигляду (поточний не задано)...",
        false,
        true
      );
    }

    if (
      !figureDrawn &&
      pathWaypoints.length === 0 &&
      !isUsingCustomRotationCenter
    ) {
      // Also consider if only a marker is drawn
      displayMessage("Немає нічого для збереження поточного зображення.", true);
      return;
    }

    displayMessage("Збереження поточного зображення канвасу...", false);

    const wasTA = animationState.isAnimating;
    const wasPA = pathAnimationState.isAnimating;
    if (wasTA) animationState.isAnimating = false;
    if (wasPA) pathAnimationState.isAnimating = false;

    const currentBg = getComputedStyle(document.documentElement)
      .getPropertyValue("--primary-bg")
      .trim();
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvasWidth;
    tempCanvas.height = canvasHeight;
    const tempCtx = tempCanvas.getContext("2d");

    tempCtx.fillStyle = currentBg;
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.drawImage(canvas, 0, 0);

    try {
      const dataURL = tempCanvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = "current_canvas_image.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      displayMessage(
        "Поточне зображення канвасу збережено.",
        false,
        true,
        true
      );
    } catch (e) {
      displayMessage(
        "Помилка збереження поточного зображення: " + e.message,
        true
      );
      console.error(e);
    }

    if (wasTA) animationState.isAnimating = true;
    if (wasPA) pathAnimationState.isAnimating = true;
  });

  // --- Mode Switching and Path Animation Logic ---
  function switchToTransformMode() {
    currentMode = "transform";
    switchModeBtn.textContent = "Режим шляху";
    pathControlsDiv.style.display = "none";
    stopPathAnimationInternal();

    startStopBtn.disabled = false;
    vectorNInput.disabled = false;
    vectorMInput.disabled = false;
    angleAlphaInput.disabled = false;
    saveFinalMatrixBtn.disabled = false;
    enableAffineScalingCheckbox.disabled = false;
    affineScaleFactorInput.disabled = !isAffineScalingEnabled;

    displayMessage("Переключено на режим трансформації.", false);
    updateMatrixDisplay(currentFrameTransformationMatrix);
    redrawAll();
  }
  function switchToPathMode() {
    currentMode = "path";
    switchModeBtn.textContent = "Режим трансформації";
    pathControlsDiv.style.display = "block";
    stopAnimationInternal();

    startStopBtn.disabled = true;
    vectorNInput.disabled = true;
    vectorMInput.disabled = true;
    angleAlphaInput.disabled = false;
    saveFinalMatrixBtn.disabled = true;
    enableAffineScalingCheckbox.disabled = false;
    affineScaleFactorInput.disabled = !isAffineScalingEnabled;

    displayMessage(
      "Переключено на режим шляху. Клікніть на канвасі для додавання точок.",
      false
    );
    pathMessageDiv.textContent =
      pathWaypoints.length > 0
        ? `${pathWaypoints.length} точок шляху задано.`
        : "Точки шляху не задані. Клікніть на канвасі.";

    if (currentShapePoints.length > 0 && pathWaypoints.length > 0) {
      updateMatrixDisplay(currentFrameTransformationMatrix);
    } else {
      updateMatrixDisplay(createIdentityMatrix());
    }
    redrawAll();
  }
  switchModeBtn.addEventListener("click", () => {
    if (currentMode === "transform") {
      switchToPathMode();
    } else {
      switchToTransformMode();
    }
  });
  function stopPathAnimationInternal() {
    if (pathAnimationState.isAnimating) {
      cancelAnimationFrame(pathAnimationState.animationFrameId);
      pathAnimationState.isAnimating = false;
      startPathAnimationBtn.textContent = "Старт анімації по шляху";
      startPathAnimationBtn.disabled = false;
      stopPathAnimationBtn.disabled = true;
    }
  }

  function animatePathStep() {
    if (!pathAnimationState.isAnimating) return;
    if (
      !initialShapePoints ||
      initialShapePoints.length === 0 ||
      !pathWaypoints ||
      pathWaypoints.length < 2
    ) {
      displayMessage("Визначте фігуру та мінімум 2 точки шляху.", true);
      stopPathAnimationInternal();
      return;
    }

    let speed = parseFloat(animationSpeedInput.value) || 1.0;
    speed = Math.max(0.1, Math.min(5.0, speed)); // Clamp speed

    pathAnimationState.segmentProgress += speed;
    pathAnimationState.segmentProgress = Math.min(
      pathAnimationState.segmentProgress,
      pathAnimationState.stepsPerSegment
    );

    let t_segment =
      pathAnimationState.segmentProgress / pathAnimationState.stepsPerSegment;
    // t_segment is already clamped by segmentProgress clamping

    const startWp = pathWaypoints[pathAnimationState.currentSegment];
    const endWp = pathWaypoints[pathAnimationState.currentSegment + 1];

    if (!startWp || !endWp) {
      displayMessage("Помилка анімації шляху: невалідний сегмент.", true);
      stopPathAnimationInternal();
      return;
    }

    const targetCenterX = startWp.x + (endWp.x - startWp.x) * t_segment;
    const targetCenterY = startWp.y + (endWp.y - startWp.y) * t_segment;

    const initialFigCenter = calculateCenter(initialShapePoints);
    const pivotPoint =
      isUsingCustomRotationCenter && customRotationCenter
        ? customRotationCenter
        : initialFigCenter;

    const totalSegments = pathWaypoints.length - 1;
    let t_overall;
    if (totalSegments <= 0 && pathWaypoints.length === 1) {
      t_overall = 0; 
    } else if (totalSegments <= 0 && pathWaypoints.length > 1) {
      t_overall = t_segment;
    } else {
      t_overall =
        pathAnimationState.currentSegment / totalSegments +
        t_segment / totalSegments;
    }
    t_overall = Math.max(0, Math.min(1, t_overall)); // Clamp t_overall

    const targetAngleRad = transformParams.alpha;
    const animatedAngleRad = targetAngleRad * t_overall;
    const animatedScalePath = 1.0 + (affineScaleFactor - 1.0) * t_overall;

    const T_to_pivot = createTranslationMatrix(-pivotPoint.x, -pivotPoint.y);
    const R_path_animated = createRotationMatrix(animatedAngleRad);
    const S_path_affine = isAffineScalingEnabled
      ? createScaleMatrix(animatedScalePath, animatedScalePath)
      : createIdentityMatrix();
    const T_from_pivot = createTranslationMatrix(pivotPoint.x, pivotPoint.y);

    const dx_translation_to_path_pos = targetCenterX - initialFigCenter.x;
    const dy_translation_to_path_pos = targetCenterY - initialFigCenter.y;
    const T_to_path_position = createTranslationMatrix(
      dx_translation_to_path_pos,
      dy_translation_to_path_pos
    );

    let M_path_frame = createIdentityMatrix();
    M_path_frame = multiplyMatrices(M_path_frame, T_to_pivot);
    M_path_frame = multiplyMatrices(M_path_frame, S_path_affine);
    M_path_frame = multiplyMatrices(M_path_frame, R_path_animated);
    M_path_frame = multiplyMatrices(M_path_frame, T_from_pivot);
    M_path_frame = multiplyMatrices(M_path_frame, T_to_path_position);

    currentFrameTransformationMatrix = M_path_frame;
    currentShapePoints = initialShapePoints.map((p) =>
      transformPoint(p, currentFrameTransformationMatrix)
    );

    updateMatrixDisplay(currentFrameTransformationMatrix);
    redrawAll();

    if (
      pathAnimationState.segmentProgress >= pathAnimationState.stepsPerSegment
    ) {
      pathAnimationState.segmentProgress = 0; // Reset for next segment or if animation ends
      pathAnimationState.currentSegment++;
      if (pathAnimationState.currentSegment >= totalSegments) {
        displayMessage("Анімація по шляху завершена.", false);
        stopPathAnimationInternal();

        const finalWp = pathWaypoints[pathWaypoints.length - 1];
        const final_dx_trans = finalWp.x - initialFigCenter.x;
        const final_dy_trans = finalWp.y - initialFigCenter.y;
        const T_to_final_path_pos = createTranslationMatrix(
          final_dx_trans,
          final_dy_trans
        );

        let M_final_path_pos = createIdentityMatrix();
        M_final_path_pos = multiplyMatrices(M_final_path_pos, T_to_pivot);
        // Use full target scale and rotation for final position
        M_final_path_pos = multiplyMatrices(
          M_final_path_pos,
          isAffineScalingEnabled
            ? createScaleMatrix(affineScaleFactor, affineScaleFactor)
            : createIdentityMatrix()
        );
        M_final_path_pos = multiplyMatrices(
          M_final_path_pos,
          createRotationMatrix(targetAngleRad)
        );
        M_final_path_pos = multiplyMatrices(M_final_path_pos, T_from_pivot);
        M_final_path_pos = multiplyMatrices(
          M_final_path_pos,
          T_to_final_path_pos
        );

        currentShapePoints = initialShapePoints.map((p) =>
          transformPoint(p, M_final_path_pos)
        );
        currentFrameTransformationMatrix = M_final_path_pos;
        updateMatrixDisplay(currentFrameTransformationMatrix);
        redrawAll();
        return;
      }
    }
    if (pathAnimationState.isAnimating) {
      pathAnimationState.animationFrameId =
        requestAnimationFrame(animatePathStep);
    }
  }
  startPathAnimationBtn.addEventListener("click", () => {
    if (pathAnimationState.isAnimating) return;
    if (!initialShapePoints || initialShapePoints.length === 0) {
      displayMessage(
        "Будь ласка, визначте фігуру ('Застосувати фігуру').",
        true
      );
      return;
    }
    if (!pathWaypoints || pathWaypoints.length < 2) {
      displayMessage(
        "Будь ласка, визначте мінімум 2 точки шляху кліком на канвасі.",
        true
      );
      return;
    }

    transformParams.alpha =
      (parseFloat(angleAlphaInput.value) * Math.PI) / 180.0 || 0;
    if (isAffineScalingEnabled) {
      affineScaleFactor = parseFloat(affineScaleFactorInput.value) || 1.0;
    } else {
      affineScaleFactor = 1.0;
    }

    if (isNaN(transformParams.alpha)) {
      displayMessage(
        "Неправильне значення кута Alpha для анімації шляху.",
        true
      );
      transformParams.alpha = 0;
      angleAlphaInput.value = 0;
    }

    pathAnimationState.isAnimating = true;
    pathAnimationState.currentSegment = 0;
    pathAnimationState.segmentProgress = 0;
    startPathAnimationBtn.textContent = "Анімація шляху...";
    startPathAnimationBtn.disabled = true;
    stopPathAnimationBtn.disabled = false;

    stopAnimationInternal(); // Stop transform mode animation if running

    displayMessage("Анімація по шляху запущена.", false);
    animatePathStep();
  });
  stopPathAnimationBtn.addEventListener("click", () => {
    stopPathAnimationInternal();
    displayMessage("Анімація по шляху зупинена.", false);
  });
  clearPathBtn.addEventListener("click", () => {
    if (pathAnimationState.isAnimating) {
      stopPathAnimationInternal();
    }
    pathWaypoints = [];
    pathMessageDiv.textContent = "Шлях очищено. Точки не задані.";
    displayMessage("Шлях очищено.", false);
    if (initialShapePoints.length > 0) {
      applyInputs();
    }
    redrawAll();
  });
  removeLastWaypointBtn.addEventListener("click", () => {
    if (pathAnimationState.isAnimating) {
      displayMessage("Зупиніть анімацію шляху перед видаленням точок.", true);
      return;
    }
    if (pathWaypoints.length > 0) {
      const rW = pathWaypoints.pop();
      pathMessageDiv.textContent =
        pathWaypoints.length > 0
          ? `${pathWaypoints.length} точок шляху задано.`
          : "Шлях очищено.";
      displayMessage(`Остання точка шляху (${rW.x}, ${rW.y}) видалена.`, false);
      if (pathWaypoints.length === 0 && initialShapePoints.length > 0) {
        applyInputs();
      }
      redrawAll();
    } else {
      displayMessage("Немає точок для видалення.", false);
    }
  });

  // --- Theme Switching Logic ---
  function _redrawCanvasForTheme() {
    if (typeof redrawAll === "function" && ctx) {
      redrawAll();
    }
  }

  function applyTheme(themeName) {
    if (themeName === "light") {
      document.documentElement.classList.add("light-theme");
      if (themeToggleBtn) themeToggleBtn.textContent = "Темна Тема";
    } else {
      document.documentElement.classList.remove("light-theme");
      if (themeToggleBtn) themeToggleBtn.textContent = "Світла Тема";
    }
    localStorage.setItem("theme", themeName);
    _redrawCanvasForTheme();
  }

  function toggleTheme() {
    if (document.documentElement.classList.contains("light-theme")) {
      applyTheme("dark");
    } else {
      applyTheme("light");
    }
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", toggleTheme);
  }

  // --- Shape Selector Logic ---
  function populateShapeSelector() {
    shapeSelectorDiv.innerHTML = "";
    Object.keys(SHAPES).forEach((shapeKey) => {
      const shape = SHAPES[shapeKey];
      const btn = document.createElement("button");
      btn.classList.add("shape-btn");
      btn.dataset.shape = shapeKey;
      btn.title = shape.name;
      btn.innerHTML = shape.icon;
      if (shapeKey === currentSelectedShapeType) {
        btn.classList.add("active");
      }
      btn.addEventListener("click", () => {
        currentSelectedShapeType = shapeKey;
        document
          .querySelectorAll("#shape-selector .shape-btn")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        updateInputLabelsForShape(shapeKey);
        initialShapePoints = [];
        currentShapePoints = [];
        idealAlignedSquareCoords = null;
        alignSquareBtn.style.display = "none";
        redrawAll();
        displayMessage(
          `Обрано фігуру: ${shape.name}. Вкажіть точки для побудови.`,
          false
        );
      });
      shapeSelectorDiv.appendChild(btn);
    });
  }

  function updateInputLabelsForShape(shapeKey) {
    const shapeInfo = SHAPES[shapeKey];
    const labelP1Container = squareX1Input.parentElement;
    const labelP1El = labelP1Container.querySelector("label");

    const labelP2Container = squareX2Input.parentElement;
    const labelP2El = labelP2Container.querySelector("label");

    if (labelP1El)
      labelP1El.textContent = shapeInfo.labelP1 || "Точка 1 (X1,Y1):";
    if (labelP2El)
      labelP2El.textContent = shapeInfo.labelP2 || "Точка 2 (X2,Y2):";

    alignSquareBtn.style.display =
      shapeKey === "SQUARE" && idealAlignedSquareCoords ? "block" : "none";
  }

  // --- Listeners for new/updated controls ---
  if (resetRotationCenterBtn) {
    resetRotationCenterBtn.addEventListener("click", () => {
      isUsingCustomRotationCenter = false;
      customRotationCenter = null;
      displayMessage("Центр обертання скинуто до центру фігури.", false, true);
      if (
        !animationState.isAnimating &&
        !pathAnimationState.isAnimating &&
        currentShapePoints.length > 0
      ) {
        applyInputs();
      }
      redrawAll();
    });
  }

  if (enableAffineScalingCheckbox) {
    enableAffineScalingCheckbox.addEventListener("change", (e) => {
      isAffineScalingEnabled = e.target.checked;
      affineScaleFactorInput.disabled = !isAffineScalingEnabled;
      if (isAffineScalingEnabled) {
        affineScaleFactor = parseFloat(affineScaleFactorInput.value) || 1.0;
      } else {
        affineScaleFactor = 1.0;
      }
      displayMessage(
        `Афінне масштабування ${
          isAffineScalingEnabled ? "УВІМКНЕНО" : "ВИМКНЕНО"
        }. Коефіцієнт: ${affineScaleFactor.toFixed(1)}`,
        false,
        true
      );

      // Re-apply inputs if not animating to see immediate static change
      if (
        !animationState.isAnimating &&
        !pathAnimationState.isAnimating &&
        (initialShapePoints.length > 0 || currentShapePoints.length > 0)
      ) {
        applyInputs();
      }
      redrawAll();
    });
  }

  if (affineScaleFactorInput) {
    affineScaleFactorInput.addEventListener("change", () => {
      let val = parseFloat(affineScaleFactorInput.value);
      if (isNaN(val) || val < 0.1 || val > 10) {
        displayMessage(
          "Коефіцієнт масштабування має бути між 0.1 та 10.",
          true
        );
        affineScaleFactorInput.value = affineScaleFactor.toFixed(1); // Revert to last valid
        return;
      }
      affineScaleFactor = val;
      displayMessage(
        `Коефіцієнт афінного масштабування встановлено: ${affineScaleFactor.toFixed(
          1
        )}`,
        false,
        true
      );
      if (
        isAffineScalingEnabled &&
        !animationState.isAnimating &&
        !pathAnimationState.isAnimating &&
        (initialShapePoints.length > 0 || currentShapePoints.length > 0)
      ) {
        applyInputs();
      }
    });
  }

  if (animationSpeedInput) {
    animationSpeedInput.addEventListener("change", () => {
      let speed = parseFloat(animationSpeedInput.value);
      if (isNaN(speed) || speed < 0.1 || speed > 5.0) {
        displayMessage("Швидкість анімації має бути між 0.1 та 5.0.", true);
        animationSpeedInput.value = currentAnimationSpeed.toFixed(1); // Revert to last valid
        return;
      }
      currentAnimationSpeed = speed;
      displayMessage(
        `Швидкість анімації встановлено: ${currentAnimationSpeed.toFixed(1)}x`,
        false,
        true
      );
    });
  }

  // --- Initial Setup ---
  const currentSavedTheme = localStorage.getItem("theme") || "dark";
  applyTheme(currentSavedTheme);

  squareX1Input.value = 0;
  squareY1Input.value = 100;
  squareX2Input.value = 100;
  squareY2Input.value = 0;
  vectorNInput.value = 50;
  vectorMInput.value = 50;
  angleAlphaInput.value = 45;
  scaleInput.value = currentScale.toFixed(2);
  affineScaleFactorInput.value = affineScaleFactor.toFixed(1);
  affineScaleFactorInput.disabled = !isAffineScalingEnabled;
  enableAffineScalingCheckbox.checked = isAffineScalingEnabled;
  if (animationSpeedInput)
    animationSpeedInput.value = currentAnimationSpeed.toFixed(1);

  populateShapeSelector();
  updateInputLabelsForShape(currentSelectedShapeType);
  alignSquareBtn.style.display = "none";
  switchToTransformMode(); // Sets up initial UI state for transform mode

  if (!applyInputs()) {
    redrawAll(); // If applyInputs fails (e.g., bad initial coords), still draw plane
  }
  startStopBtn.textContent = "▶";
});
