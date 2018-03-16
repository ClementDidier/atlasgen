const Stream = require('stream');

const table = [
    { 'x': 1, 'y': 0 },
    { 'x': 0, 'y': -1 },
    { 'x': 1, 'y': 0 },
    { 'x': 1, 'y': 0 },
    { 'x': -1, 'y': 0 },
    { 'x': 0, 'y': -1 },
    { 'x': NaN, 'y': 0 },
    { 'x': 1, 'y': 0 },
    { 'x': 0, 'y': 1 },
    { 'x': 0, 'y': NaN },
    { 'x': 0, 'y': 1 },
    { 'x': 0, 'y': 1 },
    { 'x': -1, 'y': 0 },
    { 'x': 0, 'y': -1 },
    { 'x': -1, 'y': 0 },
    { 'x': NaN, 'y': NaN }
];

module.exports = class Outliner extends Stream {

    constructor() {
        super();
    }

    getStartPoint(isTexture, w, h) {
        return this.getStartPointOnRegion(isTexture, 0, 0, w, h);
    }

    getStartPointOnRegion(isTexture, x, y, w, h) {
        for(var j = y; j < h + y; j++) {
            for(var i = x; i < w + x; i++) {
                if(isTexture(i, j)) {
                    return { 'x': i, 'y': j };
                }
            }
        }
        return null;
    }

    getOutlinePolygonOnRegion(isTexture, x, y, w, h) {
        var polygon = [];
        var start = this.getStartPointOnRegion(isTexture, x, y, w, h);
        if(start === null)
            this.emit('done');

        var px = start.x;
        var py = start.y;
        var dir = { 'x': 0, 'y': 0 };

        do {
            var direction = this.getDirectionVector(isTexture, px, py, dir);

            if(isTexture(px, py) || (dir.x != direction.x && dir.y != direction.y)) {
                this.emit('point', { 'x': px - x, 'y': py - y });
                dir = direction;
            }

            px += direction.x;
            py += direction.y;
        } while(start.x !== px || start.y !== py);

        this.emit('done');
    }

    getDirectionVector(isTexture, x, y, dir) {
        var index = this.getCoefficient('1', isTexture, x-1, y-1) * 1 +
                    this.getCoefficient('2', isTexture, x, y-1) * 2 +
                    this.getCoefficient('3', isTexture, x-1, y) * 4 +
                    this.getCoefficient('4', isTexture, x, y) * 8;

        return this.getVectorFromTable(index, dir);
    }

    getCoefficient(ind, isTexture, x, y) {
        return isTexture(x, y) ? 1 : 0;
    }

    getVectorFromTable(index, dir) {
        if(index === 6) {
            return { 'x': dir.y !== -1 ? 1 : -1, 'y': table[index].y };
        } else if(index == 9) {
            return { 'x': table[index].x, 'y': dir.x !== 1 ? 1 : -1 };
        } else {
            return table[index];
        }
    }
}
