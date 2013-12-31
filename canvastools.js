/*
* canvastools.js
*
* Copyright 2013, Simon Waldherr - http://simon.waldherr.eu/
* Released under the MIT Licence
* http://simon.waldherr.eu/license/mit/
*
* Github:  https://github.com/simonwaldherr/canvastools/
* Version: 0.1.0
*/

/*jslint browser: true, indent: 2 */
/*global FileReader */

var canvastools = {
  droppable: function (canvaselement) {
    "use strict";
    var context = canvaselement.getContext("2d"),
      img = document.createElement("img"),
      clearCanvas = function () {
        context.clearRect(0, 0, canvaselement.width, canvaselement.height);
      };

    context.fillText("Drop an image here", 245, 290);

    img.addEventListener("load", function () {
      clearCanvas();
      context.drawImage(img, 0, 0);
    }, false);

    canvaselement.addEventListener("dragover", function (evt) {
      evt.preventDefault();
    }, false);

    canvaselement.addEventListener("drop", function (evt) {
      var reader, file, files = evt.dataTransfer.files;
      if (files.length > 0) {
        file = files[0];
        if (window.FileReader !== undefined && file.type.indexOf("image") !== -1) {
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
  toBase64: function (canvaselement) {
    "use strict";
    window.open(canvaselement.toDataURL("image/png"));
  },
  colorOnPixel: function (canvaselement, x, y) {
    "use strict";
    var color, context = canvaselement.getContext("2d");
    color = context.getImageData(x, y, 1, 1).data;
    return {
      r: color[0],
      g: color[1],
      b: color[2],
      a: color[3]
    };
  },
  onMouseMove: function (canvaselement, callback) {
    "use strict";
    canvaselement.addEventListener("mousemove", function (evt) {
      var color, rect = canvaselement.getBoundingClientRect();
      color = canvastools.colorOnPixel(canvaselement, evt.clientX - rect.left, evt.clientY - rect.top);
      evt.preventDefault();
      callback(canvaselement, evt.clientX - rect.left, evt.clientY - rect.top, color);
    }, false);
  }
};
