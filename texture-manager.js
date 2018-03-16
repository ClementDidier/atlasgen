const Jimp = require('jimp');
const outliner = require('./outliner');
const path = require('path');

function getSheetData(imagePath, rowCount, colCount) {
    let jsonResult = {
        'image': path.basename(imagePath),
        'rows': rowCount,
        'columns': colCount,
        'data': []
    };

    return Jimp.read(imagePath).then((image) => {
        var w = image.bitmap.width;
        var h = image.bitmap.height;
        var sw = w / colCount;
        var sh = h / rowCount;

        var isTexture = (x, y) => {
            if(x == NaN || y == NaN)
                return false;
            if(y >= 0 && y < h && x >= 0 && x < w) {
                return image.getPixelColor(x, y) !== 0;
            } else return false;
        };

        for(var r = 0; r < rowCount; r++) {
            for(var c = 0; c < colCount; c++) {
                var region = { 'x': c * sw, 'y': r * sh, 'w': sw, 'h': sh };
                getRegionData(isTexture, region.x, region.y, region.w, region.h).then((data) => {
                    jsonResult.data.push(data);
                });
            }
        }
        return jsonResult;
    }).catch((err) => {
        console.error(err.message);
        throw err;
    });
}

/**
 * Obtient les données de la region spécifiée de l'image
 * @param {(x: number, y: number) => boolean} isTexture 
 * @param {Number} x 
 * @param {Number} y 
 * @param {Number} w 
 * @param {Number} h 
 */
function getRegionData(isTexture, x, y, w, h) {
    return new Promise((resolve, reject) => {
        var polygon = [];
        var outl = new outliner();

        outl.on('point', (pt) => {
            polygon.push(pt);
        }).on('done', () => {
            resolve({ 'region': { 'x': x, 'y': y, 'w': w, 'h': h }, 'polygon': polygon });
        });

        outl.getOutlinePolygonOnRegion(isTexture, x, y, w, h);
    });
}

module.exports = { getSheetData };
