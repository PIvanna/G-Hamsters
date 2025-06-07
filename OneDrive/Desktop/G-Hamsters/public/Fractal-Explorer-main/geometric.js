const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 1170; 
canvas.height = 690; 

let offsetX = 0;
let offsetY = 0;
let scale = 1;

let center = { x: canvas.width  / 2,
               y: canvas.height / 2 };

let n = 6;
let lineLength = 5;
let lineWidth = 1;

let fractalType = document.getElementById("fractal-type").value;

let isCanvasClear = true;

document.getElementById("canvas").addEventListener("wheel", function(event) 
{
    event.preventDefault();
    
    if (!isCanvasClear) 
    {
        const zoomFactor = event.deltaY > 0 ? 0.95 : 1.05;
        zoomCanvas(event, zoomFactor);
    }
});

function zoomCanvas(event, zoomFactor) 
{
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const x = (mouseX - offsetX) / scale;
    const y = (mouseY - offsetY) / scale;

    scale *= zoomFactor;

    scale = Math.min(Math.max(scale, 0.001), 100);

    offsetX = mouseX - x * scale;
    offsetY = mouseY - y * scale;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    drawFractal(true);
}

let maxIterations = 20;
let maxLineLength = 50;

document.getElementById("fractal-type").addEventListener("change", changeFractalType);

function changeFractalType()
{
    fractalType = document.getElementById("fractal-type").value;
    if (fractalType === "dragon-curve")
    {
        document.getElementById("animate").disabled = false;

        maxIterations = 20;
        maxLineLength = 50;

        n = 6;
        lineLength = 5;
        lineWidth = 1;

        document.getElementById("iterations").value = 6;
        document.getElementById("line-len").value = 5;
        document.getElementById("line-width").value = 1;
    }
    else if (fractalType === "sierpinski-triangle")
    {
        document.getElementById("animate").disabled = false;

        maxIterations = 12;
        maxLineLength = 1000;

        n = 6;
        lineLength = 400;
        lineWidth = 0.5;

        document.getElementById("iterations").value = 6;
        document.getElementById("line-len").value = 400;
        document.getElementById("line-width").value = 0.5;

    }
    else if (fractalType === "koch-snowflake")
    {
        document.getElementById("animate").disabled = false;
        
        maxIterations = 8;
        maxLineLength = 1000;

        n = 6;
        lineLength = 600;
        lineWidth = 0.5;

        document.getElementById("iterations").value = 6;
        document.getElementById("line-len").value = 600;
        document.getElementById("line-width").value = 0.5;
    }
    else if (fractalType === "barnsley-fern") 
    {
        document.getElementById("animate").disabled = false;

        maxIterations = 1000000;
        maxLineLength = 1000;

        n = 100000; 
        lineLength = 30;
        lineWidth = 0.2;

        document.getElementById("iterations").value = 100000;
        document.getElementById("line-len").value = 30;
        document.getElementById("line-width").value = 0.2;
    }
    else if (fractalType === "pythagoras-tree")
    {
        document.getElementById("animate").disabled = false;

        maxIterations = 19;
        maxLineLength = 200;

        n = 10;
        lineLength = 100;
        lineWidth = 1;

        document.getElementById("iterations").value = 10;
        document.getElementById("line-len").value = 100;
        document.getElementById("line-width").value = 1;
    }
    else if (fractalType === "brownian-motion")
    {
        document.getElementById("animate").checked = false;
        document.getElementById("animate").disabled = true;

        maxIterations = 10000;
        maxLineLength = 50;

        n = 1000;
        lineLength = 10;
        lineWidth = 1;

        document.getElementById("iterations").value = 1000;
        document.getElementById("line-len").value = 10;
        document.getElementById("line-width").value = 1;
    }
    else if (fractalType === "koch-curve")
    {
        document.getElementById("animate").disabled = false;

        maxIterations = 10;
        maxLineLength = 2500;

        n = 5;
        lineLength = 500;
        lineWidth = 1;

        document.getElementById("iterations").value = 5;
        document.getElementById("line-len").value = 500;
        document.getElementById("line-width").value = 1;
    }
    else if (fractalType === "hilbert-curve")
    {
        document.getElementById("animate").disabled = false;
        
        maxIterations = 9;
        maxLineLength = 1000;

        n = 4;
        lineLength = 400;
        lineWidth = 1;

        document.getElementById("iterations").value = 4;
        document.getElementById("line-len").value = 400;
        document.getElementById("line-width").value = 1;
    }
    else if (fractalType === "inverse-koch")
    {
        document.getElementById("animate").disabled = false;
        
        maxIterations = 9;
        maxLineLength = 1000;

        n = 4;
        lineLength = 400;
        lineWidth = 1;

        document.getElementById("iterations").value = 4;
        document.getElementById("line-len").value = 400;
        document.getElementById("line-width").value = 1;
    }
    //
}

document.getElementById("iterations").addEventListener("input", () =>
{
    let num = parseInt(document.getElementById("iterations").value);
    if (!isNaN(num))
    {
        if (num <= 0 || num > maxIterations)
        {
            document.getElementById("iterations").classList.add("invalid");
        }
        else
        {
            n = num;
            document.getElementById("iterations").classList.remove("invalid");
        }
    }
    else
    {
        document.getElementById("iterations").classList.add("invalid");
    }
});

document.getElementById("iterations").addEventListener("blur", () =>
{
    if (document.getElementById("iterations").classList.contains("invalid"))
    {
        n = 6;
        document.getElementById("iterations").value = 6;
        document.getElementById("iterations").classList.remove("invalid");
    }
});

document.getElementById("line-len").addEventListener("input", () =>
{
    let num = parseFloat(document.getElementById("line-len").value);
    if (!isNaN(num))
    {
        if (num <= 0 || num > maxLineLength)
        {
            document.getElementById("line-len").classList.add("invalid");
        }
        else
        {
            lineLength = num;
            document.getElementById("line-len").classList.remove("invalid");
        }
    }
    else
    {
        document.getElementById("line-len").classList.add("invalid");
    }
});

document.getElementById("line-len").addEventListener("blur", () =>
{
    if (document.getElementById("line-len").classList.contains("invalid"))
    {
        lineLength = 5;
        document.getElementById("line-len").value = 5;
        document.getElementById("line-len").classList.remove("invalid");
    }
});

document.getElementById("line-width").addEventListener("input", () =>
{
    let num = parseFloat(document.getElementById("line-width").value);
    if (!isNaN(num))
    {
        if (num <= 0 || num > 25)
        {
            document.getElementById("line-width").classList.add("invalid");
        }
        else
        {
            lineWidth = num;
            document.getElementById("line-width").classList.remove("invalid");
        }
    }
    else
    {
        document.getElementById("line-width").classList.add("invalid");
    }
});

document.getElementById("line-width").addEventListener("blur", () =>
{
    if (document.getElementById("line-width").classList.contains("invalid"))
    {
        lineWidth = 1;
        document.getElementById("line-width").value = 1;
        document.getElementById("line-width").classList.remove("invalid");
    }
});

function clearCanvas()
{
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.fillStyle = document.getElementById("bgColor").value;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.restore();
}

let isAnimating = false

document.getElementById("btn-draw").addEventListener("click", () => drawFractal(false));

function drawFractal(isZoom)
{
    if (isAnimating) return;
    if (!isZoom)
    {
        scale = 1;
        offsetX = 0;
        offsetY = 0;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }


    clearCanvas();
    isCanvasClear = false;
 
    const isAnimate = document.getElementById("animate").checked;

    if (fractalType === "dragon-curve")
    {
        if (isZoom)
        {
            drawDragonCurve(center.x, center.y, lineLength, lineWidth, n);
        }
        else if (!isAnimate)
        {
            drawDragonCurve(center.x, center.y, lineLength, lineWidth, n);
        }
        else
        {
            isAnimating = true;
            for (let i = 1; i <= n; i++)
            {
                setTimeout(() =>
                {
                    clearCanvas();
                    drawDragonCurve(center.x, center.y, lineLength, lineWidth, i);

                    if (i === n) isAnimating = false;
                }, i * 250);
            }
        }
    }
    else if (fractalType === "sierpinski-triangle") 
    {
        if (isZoom) 
        {
            drawSierpinskiTriangle(center.x, center.y, lineLength, n);
        }
        else if (!isAnimate) 
        {
            drawSierpinskiTriangle(center.x, center.y, lineLength, n);
        }
        else 
        {
            isAnimating = true;
            for (let i = 1; i <= n; i++) 
            {
                setTimeout(() => 
                {
                    clearCanvas();
                    drawSierpinskiTriangle(center.x, center.y, lineLength, i);

                    if (i === n) isAnimating = false;
                }, i * 250);
            }
        }
    }
    else if (fractalType === "koch-snowflake") 
    {
        if (isZoom) 
        {
            drawKochSnowflake(center.x, center.y, lineLength, n);
        }
        else if (!isAnimate) 
        {
            drawKochSnowflake(center.x, center.y, lineLength, n);
        }
        else 
        {
            isAnimating = true;
            for (let i = 1; i <= n; i++) 
            {
                setTimeout(() => 
                {
                    clearCanvas();
                    drawKochSnowflake(center.x, center.y, lineLength, i);
                    if (i === n) isAnimating = false;
                }, i * 250);
            }
        }
    }
    else if (fractalType === "barnsley-fern") 
    {
        if (isZoom) 
        {
            drawBarnsleyFern(center.x, center.y + 200, lineLength, n);
        }
        else if (!isAnimate) 
        {
            drawBarnsleyFern(center.x, center.y + 200, lineLength, n);
        }
        else 
        {
            isAnimating = true;
            const step = Math.floor(n / 10);
            let currentPoints = 0;
            const interval = setInterval(() => 
            {
                clearCanvas();
                drawBarnsleyFern(center.x, center.y + 200, lineLength, currentPoints);
                currentPoints += step;
                if (currentPoints >= n) 
                {
                    clearInterval(interval);
                    drawBarnsleyFern(center.x, center.y + 200, lineLength, n);
                    isAnimating = false;
                }
            }, 200);
        }
    }
    else if (fractalType === "pythagoras-tree") 
    {
        if (isZoom) 
        {
            drawPythagorasTree(center.x, center.y + 100, -Math.PI / 2, lineLength, n);
        }
        else if (!isAnimate) 
        {
            drawPythagorasTree(center.x, center.y + 100, -Math.PI / 2, lineLength, n);
        }
        else 
        {
            isAnimating = true;
            for (let i = 1; i <= n; i++) 
            {
                setTimeout(() => 
                {
                    clearCanvas();
                    drawPythagorasTree(center.x, center.y + 100, -Math.PI / 2, lineLength, i);
                    
                    if (i === n) isAnimating = false;
                }, i * 250);
            }
        }
    }
    else if (fractalType === "brownian-motion")
    {
        if (!isZoom) 
        {
            generateBrownianPoints(center.x, center.y, lineLength, n);
        }
        drawBrownianMotion();
    }
    else if (fractalType === "koch-curve") 
    {
        if (isZoom) 
        {
            const length = lineLength;
            const x1 = center.x - length / 2;
            const y1 = center.y;
            const x2 = center.x + length / 2;
            const y2 = center.y;

            drawKochCurve(x1, y1, x2, y2, n);
        } 
        else if (!isAnimate) 
        {
            const length = lineLength;
            const x1 = center.x - length / 2;
            const y1 = center.y;
            const x2 = center.x + length / 2;
            const y2 = center.y;

            drawKochCurve(x1, y1, x2, y2, n);
        } 
        else 
        {
            isAnimating = true;
            for (let i = 1; i <= n; i++) 
            {
                setTimeout(() => 
                {
                    clearCanvas();
                    const length = lineLength;
                    const x1 = center.x - length / 2;
                    const y1 = center.y;
                    const x2 = center.x + length / 2;
                    const y2 = center.y;

                    drawKochCurve(x1, y1, x2, y2, i);
                    if (i === n) isAnimating = false;
                }, i * 250);
            }
        }
    }
    else if (fractalType === "hilbert-curve") 
    {
        if (isZoom) 
        {
            drawHilbertCurve(center.x - 200, center.y - 200, lineLength, n);
        }
        else if (!isAnimate) 
        {
            drawHilbertCurve(center.x - 200, center.y - 200, lineLength, n);
        }
        else 
        {
            isAnimating = true;
            for (let i = 1; i <= n; i++) 
            {
                setTimeout(() => 
                {
                    clearCanvas();
                    drawHilbertCurve(center.x -200, center.y - 200, lineLength, i);
                                    
                    if (i === n) isAnimating = false;
                }, i * 250);
            }
        }
    }
    else if (fractalType === "inverse-koch") 
    {
        if (isZoom) 
        {
            drawInverseKochSnowflake(center.x, center.y + 100, lineLength, n);
        } 
        else if (!isAnimate) 
        {
            drawInverseKochSnowflake(center.x, center.y + 100, lineLength, n);
        } 
        else 
        {
            isAnimating = true;
            for (let i = 1; i <= n; i++) 
            {
                setTimeout(() => 
                {
                    clearCanvas();
                    drawInverseKochSnowflake(center.x, center.y + 100, lineLength, i);
                    if (i === n) isAnimating = false;
                }, i * 250);
            }
        }
    }        
}

// ----------------------------------------------------------------------------------------
function drawDragonCurve(startX, startY, lineLength, lineWidth, iterations)
{
    ctx.strokeStyle = document.getElementById("mainColor").value;
    ctx.lineWidth = lineWidth;

    ctx.beginPath();
    ctx.moveTo(startX, startY);

    const turns = generateDragon(iterations);

    let direction = 0;
    let x = startX;
    let y = startY;

    for (const turn of turns)
    {
        if (turn === 1)
        {
            direction = (direction + 1) % 4; // + 90
        }
        else
        {
            direction = (direction + 3) % 4; // - 90 | + 270
        }

        switch (direction)
        {
            case 0: // right
                x += lineLength;
                break;
            case 1: // down
                y += lineLength;
                break;
            case 2: // left
                x -= lineLength;
                break;
            case 3: // up
                y -= lineLength;
                break;
        }
        ctx.lineTo(x, y);
    }
    ctx.stroke();
}

function generateDragon(iterations)
{
    if (iterations <= 0)
    {
        return [];
    }

    let sequence = [ 1 ];

    for (let i = 0; i < iterations; i++)
    {
        const prev = [...sequence];

        sequence.push(1);

        for (let j = prev.length - 1; j > 0; j--)
        {
            sequence.push(~prev[j]);
        }
    }

    return sequence;
}
// ----------------------------------------------------------------------------------------
function drawSierpinskiTriangle(centerX, centerY, size, iterations) 
{
    ctx.strokeStyle = document.getElementById("mainColor").value;
    ctx.lineWidth = lineWidth;

    function drawFilledTriangle(x1, y1, x2, y2, x3, y3) 
    {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineTo(x3, y3);
        ctx.closePath();
        ctx.stroke();
    }

    function sierpinski(x1, y1, x2, y2, x3, y3, depth) 
    {
        if (depth === 0) 
        {
            drawFilledTriangle(x1, y1, x2, y2, x3, y3);
            return;
        }

        const mx1 = (x1 + x2) / 2;
        const my1 = (y1 + y2) / 2;

        const mx2 = (x2 + x3) / 2;
        const my2 = (y2 + y3) / 2;

        const mx3 = (x3 + x1) / 2;
        const my3 = (y3 + y1) / 2;

        depth--;

        sierpinski(x1, y1, mx1, my1, mx3, my3, depth);
        sierpinski(mx1, my1, x2, y2, mx2, my2, depth);
        sierpinski(mx3, my3, mx2, my2, x3, y3, depth);
    }

    const height = size * Math.sqrt(3) / 2;

    const x1 = centerX;
    const y1 = centerY - height / 2;

    const x2 = centerX - size / 2;
    const y2 = centerY + height / 2;

    const x3 = centerX + size / 2;
    const y3 = centerY + height / 2;

    sierpinski(x1, y1, x2, y2, x3, y3, iterations);
}
// ----------------------------------------------------------------------------------------
function drawKochSnowflake(centerX, centerY, size, iterations) 
{
    ctx.strokeStyle = document.getElementById("mainColor").value;
    ctx.lineWidth = lineWidth;

    function drawKochLine(x1, y1, x2, y2, depth) 
    {
        if (depth === 0) 
        {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            return;
        }

        const dx = (x2 - x1) / 3;
        const dy = (y2 - y1) / 3;

        const xA = x1 + dx;
        const yA = y1 + dy;

        const xB = x1 + 2 * dx;
        const yB = y1 + 2 * dy;

        const angle = Math.PI / 3; 
        const xPeak = xA + Math.cos(angle) * (dx) - Math.sin(angle) * (dy);
        const yPeak = yA + Math.sin(angle) * (dx) + Math.cos(angle) * (dy);

        depth--;

        drawKochLine(x1, y1, xA, yA, depth);
        drawKochLine(xA, yA, xPeak, yPeak, depth);
        drawKochLine(xPeak, yPeak, xB, yB, depth);
        drawKochLine(xB, yB, x2, y2, depth);
    }

    const height = size * Math.sqrt(3) / 2;

    const x1 = centerX - size / 2;
    const y1 = centerY + height / 3;

    const x2 = centerX + size / 2;
    const y2 = centerY + height / 3;

    const x3 = centerX;
    const y3 = centerY - 2 * height / 3;

    drawKochLine(x1, y1, x2, y2, iterations);
    drawKochLine(x2, y2, x3, y3, iterations);
    drawKochLine(x3, y3, x1, y1, iterations);
}
// ----------------------------------------------------------------------------------------
function drawBarnsleyFern(centerX, centerY, scaleFactor, iterations) 
{
    ctx.fillStyle = document.getElementById("mainColor").value;

    let x = 0;
    let y = 0;

    for (let i = 0; i < iterations; i++) 
    {
        const r = Math.random();
        let nextX, nextY;

        if (r < 0.01) 
        {
            nextX = 0;
            nextY = 0.16 * y;
        } 
        else if (r < 0.86) 
        {
            nextX = 0.85 * x + 0.04 * y;
            nextY = -0.04 * x + 0.85 * y + 1.6;
        } 
        else if (r < 0.93) 
        {
            nextX = 0.2 * x - 0.26 * y;
            nextY = 0.23 * x + 0.22 * y + 1.6;
        } 
        else 
        {
            nextX = -0.15 * x + 0.28 * y;
            nextY = 0.26 * x + 0.24 * y + 0.44;
        }

        x = nextX;
        y = nextY;

        const px = centerX + x * scaleFactor;
        const py = centerY - y * scaleFactor;

        ctx.fillRect(px, py, lineWidth, lineWidth);
    }
}
// ----------------------------------------------------------------------------------------
function drawPythagorasTree(x, y, angle, length, depth)
{
    if (depth === 0) return;

    ctx.strokeStyle = document.getElementById("mainColor").value;
    ctx.lineWidth = lineWidth;

    let x1 = x + Math.cos(angle) * length;
    let y1 = y + Math.sin(angle) * length;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x1, y1);
    ctx.stroke();
    
    drawPythagorasTree(x1, y1, angle - Math.PI / 6, length * 0.7, depth - 1);
    drawPythagorasTree(x1, y1, angle + Math.PI / 6, length * 0.7, depth - 1);
}
// ----------------------------------------------------------------------------------------
let brownianPoints = [];

function generateBrownianPoints(startX, startY, stepSize, steps) 
{
    brownianPoints = [];
    let x = startX;
    let y = startY;

    for (let i = 0; i < steps; i++) 
    {
        brownianPoints.push({ x, y });

        const angle = Math.random() * 2 * Math.PI;
        x += Math.cos(angle) * stepSize;
        y += Math.sin(angle) * stepSize;
    }
}

function drawBrownianMotion() 
{
    ctx.strokeStyle = document.getElementById("mainColor").value;
    ctx.lineWidth = lineWidth;

    if (brownianPoints.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(brownianPoints[0].x, brownianPoints[0].y);

    for (let i = 1; i < brownianPoints.length; i++) 
    {
        ctx.lineTo(brownianPoints[i].x, brownianPoints[i].y);
    }

    ctx.stroke();
}
// ----------------------------------------------------------------------------------------
function drawKochCurve(x1, y1, x2, y2, depth) 
{
    if (depth === 0) 
    {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        return;
    }

    const dx = x2 - x1;
    const dy = y2 - y1;

    const dist = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    const segment = dist / 3;

    const xA = x1 + Math.cos(angle) * segment;
    const yA = y1 + Math.sin(angle) * segment;

    const xC = x2 - Math.cos(angle) * segment;
    const yC = y2 - Math.sin(angle) * segment;

    const peakAngle = angle - Math.PI / 3;
    const xB = xA + Math.cos(peakAngle) * segment;
    const yB = yA + Math.sin(peakAngle) * segment;

    depth--;

    drawKochCurve(x1, y1, xA, yA, depth);
    drawKochCurve(xA, yA, xB, yB, depth);
    drawKochCurve(xB, yB, xC, yC, depth);
    drawKochCurve(xC, yC, x2, y2, depth);
}
// ----------------------------------------------------------------------------------------
function drawHilbertCurve(startX, startY, size, order) 
{
    ctx.strokeStyle = document.getElementById("mainColor").value;
    ctx.lineWidth = lineWidth;
    
    const points = [];
    hilbertPoints(startX, startY, size, 0, 0, size, order, points);
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) 
    {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
}

function hilbertPoints(x, y, xi, xj, yi, yj, n, points) 
{
    if (n <= 0) 
    {
        const px = x + (xi + yi) / 2;
        const py = y + (xj + yj) / 2;
        points.push({ x: px, y: py });
    } 
    else 
    {
        hilbertPoints(x, y,           yi/2, yj/2,  xi/2, xj/2, n - 1, points);
        hilbertPoints(x + xi/2, y + xj/2,   xi/2, xj/2,  yi/2, yj/2, n - 1, points);
        hilbertPoints(x + xi/2 + yi/2, y + xj/2 + yj/2, xi/2, xj/2,  yi/2, yj/2, n - 1, points);
        hilbertPoints(x + xi/2 + yi, y + xj/2 + yj, -yi/2, -yj/2, -xi/2, -xj/2, n - 1, points);
    }
}

function drawInverseKochSnowflake(centerX, centerY, size, order) 
{
    const points = [];
    
    const height = size * Math.sqrt(3) / 2;
    
    const p1 = { x: centerX, y: centerY - 2/3 * height };
    const p2 = { x: centerX - size / 2, y: centerY + height / 3 };
    const p3 = { x: centerX + size / 2, y: centerY + height / 3 };
    
    kochInversePoints(p1.x, p1.y, p2.x, p2.y, order, points);
    kochInversePoints(p2.x, p2.y, p3.x, p3.y, order, points);
    kochInversePoints(p3.x, p3.y, p1.x, p1.y, order, points);

    ctx.strokeStyle = document.getElementById("mainColor").value;
    ctx.lineWidth = lineWidth;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) 
    {
        ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.closePath();
    ctx.stroke();
}

function kochInversePoints(x1, y1, x2, y2, order, points) 
{
    if (order === 0) 
    {
        if (points.length === 0) points.push({ x: x1, y: y1 });
        points.push({ x: x2, y: y2 });
        return;
    }

    const dx = (x2 - x1) / 3;
    const dy = (y2 - y1) / 3;

    const xA = x1 + dx;
    const yA = y1 + dy;
    const xB = x1 + 2 * dx;
    const yB = y1 + 2 * dy;

    const angle = -Math.PI / 3; 
    const vx = xB - xA;
    const vy = yB - yA;

    const xPeak = xA + vx * Math.cos(angle) - vy * Math.sin(angle);
    const yPeak = yA + vx * Math.sin(angle) + vy * Math.cos(angle);

    kochInversePoints(x1, y1, xA, yA, order - 1, points);
    kochInversePoints(xA, yA, xPeak, yPeak, order - 1, points);
    kochInversePoints(xPeak, yPeak, xB, yB, order - 1, points);
    kochInversePoints(xB, yB, x2, y2, order - 1, points);
}

document.getElementById("btn-save").addEventListener("click", () =>
{
    let image = canvas.toDataURL();
    let aDownloadLink = document.createElement('a');
    aDownloadLink.download = 'image.png';
    aDownloadLink.href = image;
    aDownloadLink.click();
});