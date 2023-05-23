export class WaveCanvas {
    _canvas: HTMLCanvasElement;
    _ctx: CanvasRenderingContext2D;
    _lineWidth: number;
    _dotImage: HTMLCanvasElement;
    _color: string;
    /** Last plotted x position */
    _x = 0;
    /** Last plotted y position */
    _y = 0;
    /** Target x to move towards (but not overshoot) */
    _xTarget = 0;

    constructor(canvas: HTMLCanvasElement, lineWidth = 1, color = "red") {
        this._canvas = canvas;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            throw new Error('Cannot get canvas context');
        }
        this._ctx = ctx;
        this._lineWidth = lineWidth;
        this._color = color;
        this._dotImage = document.createElement("canvas");
        this._prepareDot();
    }

    putSample(dx: number, v: number) {
        const newX = (this._xTarget + dx) % this._canvas.width;
        if (newX < this._xTarget) {
            this.moveTo(newX, v);
            this._drawDot(newX, v);
        }
        else {
            this.lineTo(newX, v);
        }
        this._xTarget = newX;
    }

    lineTo(x: number, y: number) {
        let dx = x - this._x;
        let dy = y - this._y;
        let change = false;
        if (dx > 0) {
            // Normalize to length = 1
            const len = Math.sqrt((dx * dx) + (dy * dy));
            dx = dx / len;
            dy = dy / len;
            // Correct target point to prevent overshoot
            x = x - dx;
            y = y - dy;
            while (this._x <= x) {
                this._x += dx;
                this._y += dy;
                this._drawDot(this._x, this._y);
                change = true;
            }
        }
        return change;
    }

    moveTo(x: number, y: number) {
        this._x = x;
        this._y = y;
    }

    _prepareDot() {
        this._dotImage.width = this._lineWidth;
        this._dotImage.height = this._lineWidth;
        const ctx = this._dotImage.getContext("2d");
        if (ctx) {
            const r = this._lineWidth * 0.5;
            ctx.clearRect(0, 0, this._lineWidth, this._lineWidth);
            ctx.beginPath();
            ctx.fillStyle = this._color;
            ctx.arc(r, r, r, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    _drawDot(x: number, y: number) {
        const r = this._lineWidth * 0.5;
        this._ctx.drawImage(this._dotImage, x - r, y - r);
    }
}
