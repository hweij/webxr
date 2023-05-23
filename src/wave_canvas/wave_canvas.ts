export type WaveOptions = {
    pixPerSecond?: number;
    lineWidth?: number;
    gapWidth?: number;
    color?: string;
}

export class WaveCanvas {
    _canvas: HTMLCanvasElement;
    _ctx: CanvasRenderingContext2D;
    _dotImage: HTMLCanvasElement;
    /**Pixels per seconds, determines the horizontal speed of the graph */
    _pixPerSecond: number;
    /** Width of gap between old and new signal */
    _gapWidth: number;
    /** Thickness of the graph line in pixels */
    _lineWidth: number;
    /** Color of the graph line */
    _color: string;
    /** Last plotted x position */
    _x = 0;
    /** Last plotted y position */
    _y = 0;
    /** Target x to move towards (but not overshoot) */
    _xTarget = 0;

    constructor(canvas: HTMLCanvasElement, options: WaveOptions = {}) {
        this._canvas = canvas;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            throw new Error('Cannot get canvas context');
        }
        this._ctx = ctx;
        this._pixPerSecond = options.pixPerSecond || 40;
        this._gapWidth = options.gapWidth || 20;
        this._lineWidth = options.lineWidth || 1;
        this._color = options.color || "white";
        this._dotImage = document.createElement("canvas");
        this._prepareDot();
    }

    putSample(dt: number, v: number) {
        const clearFrom = Math.floor(this._x + this._gapWidth);
        const dx = dt * this._pixPerSecond;
        const newX = (this._xTarget + dx) % this._canvas.width;
        if (newX < this._xTarget) {
            this.moveTo(newX, v);
            this._drawDot(newX, v);
        }
        else {
            this.lineTo(newX, v);
        }
        this._xTarget = newX;
        const clearTo = Math.floor(this._x + this._gapWidth);
        if (clearTo !== clearFrom) {
            if (clearTo <= this._canvas.width) {
                if (clearFrom < clearTo) {
                    // Simple case
                    this._ctx.clearRect(clearFrom, 0, clearTo - clearFrom, this._canvas.height);
                }
                else {
                    // Next clear has wrapped
                    this._ctx.clearRect(0, 0, clearTo, this._canvas.height);
                }
            }
            else {
                // Clear-to at the right of the graph
                // Right side clear
                const wr = this._canvas.width - clearFrom;
                if (wr > 0) {
                    this._ctx.clearRect(clearFrom, 0, wr, this._canvas.height);
                }
                const wl = clearTo - this._canvas.width;
                if (wl > 0) {
                    this._ctx.clearRect(0, 0, wl, this._canvas.height);
                }
            }    
        }
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
        this._xTarget = x;
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
