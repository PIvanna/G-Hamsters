class PlayerAI {
    constructor(pathSegments) { 
        this.path = (pathSegments && pathSegments.length > 0) ? pathSegments[0] : null; 
        this.t = 0; 
        this.speed = 0.005; 
        this.position = null;
        this.size = 8;
        this.color = 'red';
        this.finished = false;

        if (this.path) {
            this.position = this.path.getPointAt(0);
        } else {
            this.finished = true; 
        }
    }

    update() {
        if (this.finished || !this.path) return;

        this.t += this.speed;
        if (this.t >= 1) {
            this.t = 1;
            this.finished = true;
        }
        
        this.position = this.path.getPointAt(this.t);

        if (this.finished) {
             console.log("AI finished arbitrary order path");
        }
    }

    draw(ctx) {
        if (!this.position) return;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = 'darkred';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}