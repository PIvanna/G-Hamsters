class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    static distance(p1, p2) {
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
}

function getMousePos(canvas, evt) {
    const rect = canvas.getBoundingClientRect();
    return new Point(
        evt.clientX - rect.left,
        evt.clientY - rect.top
    );
}

function closestPointOnLineSegment(p, a, b) {
    const ap = new Point(p.x - a.x, p.y - a.y);
    const ab = new Point(b.x - a.x, b.y - a.y);
    const ab2 = ab.x * ab.x + ab.y * ab.y;
    if (ab2 === 0) return new Point(a.x, a.y); 

    const ap_dot_ab = ap.x * ab.x + ap.y * ab.y;
    const t = Math.max(0, Math.min(1, ap_dot_ab / ab2));
    
    return new Point(a.x + ab.x * t, a.y + ab.y * t);
}

const LOGICAL_GRID_SIZE = 100; 
                               
function scaleToCanvas(normalizedValue, canvasDimension) {
    return (normalizedValue / LOGICAL_GRID_SIZE) * canvasDimension;
}

function normalizeFromCanvas(canvasValue, canvasDimension) {
    return (canvasValue / canvasDimension) * LOGICAL_GRID_SIZE;
}

function scalePointToCanvas(normalizedPoint, canvasWidth, canvasHeight) {
    if (!normalizedPoint) return null;
    return new Point(
        scaleToCanvas(normalizedPoint.x, canvasWidth),
        scaleToCanvas(normalizedPoint.y, canvasHeight)
    );
}

function normalizePointFromCanvas(canvasPoint, canvasWidth, canvasHeight) {
     if (!canvasPoint) return null;
    return new Point(
        normalizeFromCanvas(canvasPoint.x, canvasWidth),
        normalizeFromCanvas(canvasPoint.y, canvasHeight)
    );
}

function extendLineSegment(A, B, scaleFactor = 1.0) {
    return new Point(
        B.x + (B.x - A.x) * scaleFactor,
        B.y + (B.y - A.y) * scaleFactor
    );
}

function drawExtendedRoad(ctx, normalizedRoadCtrlPoints, canvasWidth, canvasHeight, drawOptions = {}) {
    if (!normalizedRoadCtrlPoints || normalizedRoadCtrlPoints.length < 2) {
        console.warn("drawExtendedRoad: Not enough control points to draw the main road.");
        return;
    }

    const defaultOptions = {
        roadColor: '#BBDEFB', roadLineWidth: 20, centerLine: true,
        centerLineColor: '#fff', centerLineWidth: 2, centerLineDash: [10, 10],
        
        
        extMargin: 50,          
        extPointRadius: 4, 
        showExtControlPoints: false 
    };
    const options = { ...defaultOptions, ...drawOptions };

    const mainRoadCanvas = new ArbitraryOrderBezier();
    normalizedRoadCtrlPoints.forEach(normPt => {
        const scaledPt = scalePointToCanvas(normPt, canvasWidth, canvasHeight);
        if (scaledPt) mainRoadCanvas.addControlPoint(scaledPt);
    });

    if (mainRoadCanvas.controlPoints.length < 2) {
        console.warn("drawExtendedRoad: Not enough SCALED control points for the main road.");
        return;
    }
    
    
    
    const bounds = { x: 0, y: 0, width: canvasWidth, height: canvasHeight };
    const segmentsToDraw = []; 

    if (mainRoadCanvas.controlPoints.length >= 2) {
        const P0_road = mainRoadCanvas.controlPoints[0];        
        const P1_road = mainRoadCanvas.controlPoints[1];        
        const tangentScaleFactorStart = 0.5; 
        
        const P_virtual_before_P0 = new Point(
            P0_road.x - (P1_road.x - P0_road.x) * tangentScaleFactorStart,
            P0_road.y - (P1_road.y - P0_road.y) * tangentScaleFactorStart
        );

        const extendedBoundsStart = { 
            x: -options.extMargin, y: -options.extMargin, 
            width: canvasWidth + 2 * options.extMargin, 
            height: canvasHeight + 2 * options.extMargin 
        };
        const P_boundary_start_with_margin = getLineIntersectionWithBounds(P0_road, P_virtual_before_P0, extendedBoundsStart);
        
        if (P_boundary_start_with_margin) {
            
            const CP1_ext_start = new Point(
                P_boundary_start_with_margin.x * 0.7 + P0_road.x * 0.3,
                P_boundary_start_with_margin.y * 0.7 + P0_road.y * 0.3
            );
            
            const CP2_ext_start = new Point(
                P0_road.x * 0.7 + P_virtual_before_P0.x * 0.3, 
                P0_road.y * 0.7 + P_virtual_before_P0.y * 0.3  
            );
            
            const startExtSegment = new ArbitraryOrderBezier();
            startExtSegment.addControlPoint(P_boundary_start_with_margin); 
            startExtSegment.addControlPoint(CP1_ext_start);    
            startExtSegment.addControlPoint(CP2_ext_start);    
            startExtSegment.addControlPoint(P0_road);          
            segmentsToDraw.push({curve: startExtSegment, isExtension: true});
        }
    }

    segmentsToDraw.push({curve: mainRoadCanvas, isExtension: false});


    if (mainRoadCanvas.controlPoints.length >= 2) {
        const n = mainRoadCanvas.controlPoints.length - 1;
        const Pn_road = mainRoadCanvas.controlPoints[n];       
        const Pn_minus_1_road = mainRoadCanvas.controlPoints[n-1]; 
        const tangentScaleFactorEnd = 0.5;

        const P_virtual_after_Pn = new Point(
            Pn_road.x + (Pn_road.x - Pn_minus_1_road.x) * tangentScaleFactorEnd,
            Pn_road.y + (Pn_road.y - Pn_minus_1_road.y) * tangentScaleFactorEnd
        );
        
        const extendedBoundsEnd = { 
            x: -options.extMargin, y: -options.extMargin, 
            width: canvasWidth + 2 * options.extMargin, 
            height: canvasHeight + 2 * options.extMargin 
        };
        const P_boundary_end_with_margin = getLineIntersectionWithBounds(Pn_road, P_virtual_after_Pn, extendedBoundsEnd);

        if (P_boundary_end_with_margin) {
            
             const CP1_ext_end = new Point(
                Pn_road.x * 0.7 + P_virtual_after_Pn.x * 0.3, 
                Pn_road.y * 0.7 + P_virtual_after_Pn.y * 0.3
            );
            
            const CP2_ext_end = new Point(
                P_boundary_end_with_margin.x * 0.7 + Pn_road.x * 0.3,
                P_boundary_end_with_margin.y * 0.7 + Pn_road.y * 0.3
            );

            const endExtSegment = new ArbitraryOrderBezier();
            endExtSegment.addControlPoint(Pn_road);          
            endExtSegment.addControlPoint(CP1_ext_end);    
            endExtSegment.addControlPoint(CP2_ext_end);    
            endExtSegment.addControlPoint(P_boundary_end_with_margin); 
            segmentsToDraw.push({curve: endExtSegment, isExtension: true});
        }
    }
    
    segmentsToDraw.forEach(segmentData => {
        const drawSettings = {
            color: options.roadColor, 
            lineWidth: options.roadLineWidth, 
            centerLine: options.centerLine, 
            centerLineColor: options.centerLineColor,
            centerLineWidth: options.centerLineWidth,
            centerLineDash: options.centerLineDash
        };
        
        
        
        segmentData.curve.drawCurve(ctx, drawSettings);

        if (options.showExtControlPoints && segmentData.isExtension) {
            segmentData.curve.drawControlPolyline(ctx, {radius: options.extPointRadius, p0Color: 'rgb(123, 60, 60)', pnColor: 'rgb(123, 60, 60)', intermediateColor: 'red'});
        }
    });
}

function getLineIntersectionWithBounds(lineP1, lineP2, bounds) {
    const { x, y, width, height } = bounds;
    let minT = Infinity;
    let intersection = null;

    const dx = lineP2.x - lineP1.x;
    const dy = lineP2.y - lineP1.y;

    if (dx === 0 && dy === 0) return null; 

    if (dx !== 0) {
        let t = (x - lineP1.x) / dx; 
        if (t >= 0) { 
            const intersectY = lineP1.y + t * dy;
            if (intersectY >= y && intersectY <= y + height) {
                if (t < minT) { minT = t; intersection = new Point(x, intersectY); }
            }
        }
        t = (x + width - lineP1.x) / dx; 
        if (t >= 0) {
            const intersectY = lineP1.y + t * dy;
            if (intersectY >= y && intersectY <= y + height) {
                 if (t < minT) { minT = t; intersection = new Point(x + width, intersectY); }
            }
        }
    }
    if (dy !== 0) {
        let t = (y - lineP1.y) / dy; 
        if (t >= 0) {
            const intersectX = lineP1.x + t * dx;
            if (intersectX >= x && intersectX <= x + width) {
                if (t < minT) { minT = t; intersection = new Point(intersectX, y); }
            }
        }
        t = (y + height - lineP1.y) / dy; 
        if (t >= 0) {
            const intersectX = lineP1.x + t * dx;
            if (intersectX >= x && intersectX <= x + width) {
                if (t < minT) { minT = t; intersection = new Point(intersectX, y + height); }
            }
        }
    }
    
    
    
    
    
    
    return intersection;
}