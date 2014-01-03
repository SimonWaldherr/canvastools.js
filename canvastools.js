/*
 * canvastools.js
 *
 * Copyright 2014, Simon Waldherr - http://simon.waldherr.eu/
 * Released under the MIT Licence
 * http://simon.waldherr.eu/license/mit/
 *
 * Github:  https://github.com/simonwaldherr/canvastools.js/
 * Version: 0.1.2
 */

/*jslint browser: true, indent: 2 */
/*global FileReader */

var canvastools = {
  drawActive: false,
  drawMode: 'absolute',
  drawColor: {
    r: 255,
    g: 255,
    b: 255
  },
  img: false,
  droppable: function (canvaselement) {
    'use strict';
    var context = canvaselement.getContext('2d'),
      img = document.createElement('img');

    context.fillText('Drop an image here', 245, 290);

    img.addEventListener('load', function () {
      canvastools.clearCanvas(canvaselement);
      canvastools.img = img;
      context.drawImage(img, 0, 0);
    }, false);

    canvaselement.addEventListener('dragover', function (evt) {
      evt.preventDefault();
    }, false);

    canvaselement.addEventListener('drop', function (evt) {
      var reader, file, files = evt.dataTransfer.files;
      if (files.length > 0) {
        file = files[0];
        if (window.FileReader !== undefined && file.type.indexOf('image') !== -1) {
          reader = new FileReader();
          reader.onload = function (evt) {
            img.src = evt.target.result;
            if (img.width > 25) {
              canvaselement.width = img.width;
            }
            if (img.height > 25) {
              canvaselement.height = img.height;
            }
          };
          reader.readAsDataURL(file);
        }
      }
      evt.preventDefault();
    }, false);
  },
  clearCanvas: function (canvaselement) {
    'use strict';
    var context = canvaselement.getContext('2d');
    context.clearRect(0, 0, canvaselement.width, canvaselement.height);
  },
  toBase64: function (canvaselement) {
    'use strict';
    window.open(canvaselement.toDataURL('image/png'));
  },
  colorOnPixel: function (canvaselement, x, y) {
    'use strict';
    var color, context = canvaselement.getContext('2d');
    color = context.getImageData(x, y, 1, 1).data;
    return {
      r: color[0],
      g: color[1],
      b: color[2],
      a: color[3]
    };
  },
  onMouseMove: function (canvaselement, callback) {
    'use strict';
    canvaselement.addEventListener('mousemove', function (evt) {
      var color, rect = canvaselement.getBoundingClientRect();
      color = canvastools.colorOnPixel(canvaselement, evt.clientX - rect.left, evt.clientY - rect.top);
      evt.preventDefault();
      callback(canvaselement, evt.clientX - rect.left, evt.clientY - rect.top, color);
    }, false);
  },
  forEachPixel: function (canvaselement, callback) {
    'use strict';
    var i,
      x = 1,
      y = 1,
      newPixels = [],
      context = canvaselement.getContext('2d'),
      imageData = context.getImageData(0, 0, canvaselement.width, canvaselement.height),
      pixels = imageData.data,
      numPixels = imageData.width * imageData.height;
    for (i = 0; i < numPixels; i += 1) {
      newPixels = callback({r: pixels[i * 4], g: pixels[i * 4 + 1], b: pixels[i * 4 + 2], a: pixels[i * 4 + 3], x: x, y: y});
      pixels[i * 4] = newPixels[0];
      pixels[i * 4 + 1] = newPixels[1];
      pixels[i * 4 + 2] = newPixels[2];
      pixels[i * 4 + 3] = newPixels[3];
      if (x > imageData.width) {
        x = 1;
        y += 1;
      } else {
        x += 1;
      }
    }
    context.clearRect(0, 0, canvaselement.width, canvaselement.height);
    context.putImageData(imageData, 0, 0);
  },
  draw: function (canvaselement) {
    'use strict';
    canvaselement.addEventListener('mousedown', function (evt) {
      var context = evt.target.getContext('2d');
      canvastools.drawActive = evt.target;
      context.beginPath();
    }, false);
    canvaselement.addEventListener('mouseup', function () {
      canvastools.drawActive = false;
    }, false);
    canvaselement.addEventListener('mousemove', function (evt) {
      var context;
      if (canvastools.drawActive === evt.target) {
        context = evt.target.getContext('2d');
        context.strokeStyle = 'rgb(' + canvastools.drawColor.r + ',' + canvastools.drawColor.g + ',' + canvastools.drawColor.b + ')';
        context.lineWidth = 10;
        context.lineJoin = 'round';
        context.lineTo(evt.layerX + 1, evt.layerY + 1);
        context.stroke();
      }
    }, false);
  },
  stats: function (canvaselement) {
    'use strict';
    var stats = {}, id, sortable = [], color;
    canvastools.forEachPixel(canvaselement, function (color) {
      id = color.r + '_' + color.g + '_' + color.b;
      if (stats[id] !== undefined) {
        stats[id] += 1;
      } else {
        stats[id] = 1;
      }
      return [color.r, color.g, color.b, color.a];
    });
    for (color in stats) {
      if (stats[color] !== undefined) {
        sortable.push([color, stats[color]]);
      }
    }
    sortable.sort(function (a, b) {
      return b[1] - a[1];
    });
    return sortable;
  }
};
