class ArbitraryOrderBezier {
    constructor() {
        this.controlPoints = []; 
        this.pointRadius = 7;    
    }

    addControlPoint(point) {
        this.controlPoints.push(new Point(point.x, point.y));
    }

    deleteControlPoint(index) {
        if (index < 0 || index >= this.controlPoints.length) return false;
        this.controlPoints.splice(index, 1);
        return true;
    }

    insertControlPoint(point, index) {
        if (index < 0 || index > this.controlPoints.length) return false;
        this.controlPoints.splice(index, 0, new Point(point.x, point.y));
        return true;
    }

    moveControlPoint(index, newPosition) {
        if (index < 0 || index >= this.controlPoints.length) return;
        this.controlPoints[index].x = newPosition.x;
        this.controlPoints[index].y = newPosition.y;
    }

    clear() {
        this.controlPoints = [];
    }

    static binomialCoefficient(n, k) {
        if (k < 0 || k > n) return 0;
        if (k === 0 || k === n) return 1;
        if (k > n / 2) k = n - k; 
        let res = 1;
        for (let i = 1; i <= k; i++) {
            res = res * (n - i + 1) / i;
        }
        return res;
    }

    static bernsteinPolynomial(i, n, t) {
        return ArbitraryOrderBezier.binomialCoefficient(n, i) * Math.pow(t, i) * Math.pow(1 - t, n - i);
    }

    getPointAt(t) {
        if (!this.controlPoints || this.controlPoints.length === 0) return null;
        if (this.controlPoints.length === 1) return new Point(this.controlPoints[0].x, this.controlPoints[0].y);

        const n = this.controlPoints.length - 1; 
        let x = 0;
        let y = 0;

        for (let i = 0; i <= n; i++) {
            if (!this.controlPoints[i]) { 
                console.error(`getPointAt: controlPoints[${i}] is undefined.`);
                return null; 
            }
            const bernsteinVal = ArbitraryOrderBezier.bernsteinPolynomial(i, n, t);
            x += this.controlPoints[i].x * bernsteinVal;
            y += this.controlPoints[i].y * bernsteinVal;
        }
        return new Point(x, y);
    }

    drawCurve(ctx, options = {}) {
        if (!this.controlPoints || this.controlPoints.length < 2) return; 

        const { 
            color = 'rgba(0, 150, 200, 0.8)',
            lineWidth = 6,
            centerLine = false,
            centerLineColor = '#fff',
            centerLineWidth = 2,
            centerLineDash = [10,10]
        } = options;
        
        ctx.beginPath();
        const startPoint = this.getPointAt(0);
        if (!startPoint) return;
        ctx.moveTo(startPoint.x, startPoint.y);

        const steps = 100; 
        for (let i = 1; i <= steps; i++) {
            const t = i / steps;
            const p = this.getPointAt(t);
            if (p) ctx.lineTo(p.x, p.y);
            else { 
                console.warn("drawCurve: Could not get point at t=", t);
                break;
            }
        }
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.stroke();

        if (centerLine) {
            ctx.save(); 
            ctx.strokeStyle = centerLineColor;
            ctx.lineWidth = centerLineWidth;
            ctx.setLineDash(centerLineDash);
            
            ctx.beginPath(); 
            ctx.moveTo(startPoint.x, startPoint.y);
            for (let i = 1; i <= steps; i++) {
                const p = this.getPointAt(i / steps);
                if (p) ctx.lineTo(p.x, p.y);
                else break;
            }
            ctx.stroke();
            ctx.restore(); 
        }
    }

    drawControlPolyline(ctx, pointDrawOptions = {}) {
        if (!this.controlPoints || this.controlPoints.length === 0) return;

        const defaultPointOptions = {
            radius: this.pointRadius || 8,
            p0Color: 'rgba(0, 255, 0, 1)',
            pnColor: 'rgba(0, 255, 0, 1)',
            intermediateColor: 'rgba(0, 255, 0, 1)',
            lineColor: 'rgba(0, 150, 200, 0.8)',
            lineWidth: 2,
            pointStrokeColor: 'rgba(0,150,0,1)',
            pointStrokeWidth: 1
        };
        const opt = {...defaultPointOptions, ...pointDrawOptions};

        if (this.controlPoints.length > 1) {
            ctx.beginPath();
            ctx.moveTo(this.controlPoints[0].x, this.controlPoints[0].y);
            for (let i = 1; i < this.controlPoints.length; i++) {
                ctx.lineTo(this.controlPoints[i].x, this.controlPoints[i].y);
            }
            ctx.strokeStyle = opt.lineColor;
            ctx.lineWidth = opt.lineWidth;
            ctx.stroke();
        }

        this.controlPoints.forEach((p, index) => {
            ctx.beginPath();
            ctx.arc(p.x, p.y, opt.radius, 0, Math.PI * 2);
            
            if (this.controlPoints.length === 1) {
                 ctx.fillStyle = opt.p0Color; 
            } else if (index === 0) {
                ctx.fillStyle = opt.p0Color; 
            } else if (index === this.controlPoints.length - 1) {
                ctx.fillStyle = opt.pnColor; 
            } else {
                ctx.fillStyle = opt.intermediateColor; 
            }
            ctx.fill();
            ctx.strokeStyle = opt.pointStrokeColor;
            ctx.lineWidth = opt.pointStrokeWidth;
            ctx.stroke();
        });
    }
    
    findPointNear(x_norm, y_norm, searchRadiusNormalized) {
        if (!this.controlPoints) return -1;
        for (let i = this.controlPoints.length - 1; i >= 0; i--) {
            const p_norm = this.controlPoints[i];
            if (Point.distance(new Point(x_norm, y_norm), p_norm) < searchRadiusNormalized) {
                return i;
            }
        }
        return -1;
    }

    findLineSegmentNear(x_norm, y_norm, thresholdNormalized) {
        if (!this.controlPoints || this.controlPoints.length < 2) return -1;
        const clickPointNormalized = new Point(x_norm, y_norm);

        for (let i = 0; i < this.controlPoints.length - 1; i++) {
            const p1_norm = this.controlPoints[i];
            const p2_norm = this.controlPoints[i+1];
            
            const closestPtNorm = closestPointOnLineSegment(clickPointNormalized, p1_norm, p2_norm);
            if (!closestPtNorm) continue;

            if (Point.distance(clickPointNormalized, closestPtNorm) < thresholdNormalized) {
                const distP1P2Norm = Point.distance(p1_norm, p2_norm);
                if (Point.distance(p1_norm, closestPtNorm) <= distP1P2Norm && 
                    Point.distance(p2_norm, closestPtNorm) <= distP1P2Norm) {
                     return i; 
                }
            }
        }
        return -1;
    }
}