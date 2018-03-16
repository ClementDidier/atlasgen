const textureManager = require('./texture-manager');
const fs = require('fs');

window.addEventListener('resize', resize);
window.addEventListener('load', load);

var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');
var browse = document.getElementById('inputGroupFile');

var origin = { 'x' : 0, 'y' : 0 };
var filesLoaded = [];
var currentIndex = null;

function load() {

    browse.addEventListener('change', async (e) => {
        var files = e.target.files;

        filesLoaded = [];
        currentIndex = null;
        $("#navTab").html("");
        for(var i = 0; i < files.length; i++) {
            var file = files[i];
            var name = file.name.split('.')[0];

            var promise = textureManager.getSheetData(file.path, 4, 7).then((res) => {
                fs.writeFileSync('sprites/' + name + '.json', JSON.stringify(res), ['utf8']);
                filesLoaded.push({ file: file, sheet: res });
                var temp = $('<li class="nav-item"><a class="nav-link" id="' + name + '-tab" data-toggle="tab" onclick="fnc(' + i + ')" href="#' + name + '-content" role="tab" aria-controls="' + name + '" aria-selected="true">' + name + '</a></li>');         
                $("#navTab").append(temp);
            });
            await promise;
            
        }
    });
}

function fnc(index) {
    this.currentIndex = index;
    console.log(index, filesLoaded);
    var spriteFilePath = filesLoaded[index].file.path;
    var spriteFileName = filesLoaded[index].file.name.split('.')[0];
    var sheet = filesLoaded[index].sheet;
    console.log(spriteFileName, spriteFilePath, sheet !== null);
    
    var image = new Image();
    image.src = spriteFilePath;
    image.onload = () => {
        draw(image, sheet);
    };
}

function resize()
{
    fnc(currentIndex);
}

function draw(image, sheet)
{
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    canvas.style.height = window.innerHeight - 200;
    context.mozImageSmoothingEnabled = false;
    context.webkitImageSmoothingEnabled = false;
    context.msImageSmoothingEnabled = false;
    context.imageSmoothingEnabled = false;
    context.scale(4, 4);

	context.clearRect(0, 0, window.innerWidth, canvas.innerHeight);
	context.drawImage(image, 0, 0);

    if(sheet) {
        for(var i = 0; i < sheet.data.length; i++) {
            var region = sheet.data[i].region;

            if(sheet.data[i].polygon.length > 0) {
                context.beginPath();
                context.lineWidth = 0.5;
                context.strokeStyle = "#FF0000";
                context.moveTo(sheet.data[i].polygon[0].x + region.x, sheet.data[i].polygon[0].y + region.y);
                sheet.data[i].polygon.forEach(fixture => {
                    context.lineTo(fixture.x + region.x, fixture.y + region.y);
                });
                context.closePath();
                context.stroke();

                context.beginPath();
                context.lineWidth = 0.5;
                context.strokeStyle = "#777777";
                context.rect(region.x, region.y, region.w, region.h);
                context.closePath();
                context.stroke();
            }
        }
    }
}
