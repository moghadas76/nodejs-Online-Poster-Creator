import _Promise from 'babel-runtime/core-js/promise';
/* eslint-disable no-bitwise */

var WOFF = 'application/font-woff';
var JPEG = 'image/jpeg';
var mimes = {
  woff: WOFF,
  woff2: WOFF,
  ttf: 'application/font-truetype',
  eot: 'application/vnd.ms-fontobject',
  png: 'image/png',
  jpg: JPEG,
  jpeg: JPEG,
  gif: 'image/gif',
  tiff: 'image/tiff',
  svg: 'image/svg+xml'
};

export var uuid = function uuid() {
  // generate uuid for className of pseudo elements.
  // We should not use GUIDs, otherwise pseudo elements sometimes cannot be captured.
  var counter = 0;

  // ref: http://stackoverflow.com/a/6248722/2519373
  var randomFourChars = function randomFourChars() {
    return ('0000' + (Math.random() * Math.pow(36, 4) << 0).toString(36)).slice(-4);
  };

  return function () {
    counter += 1;
    return 'u' + randomFourChars() + counter;
  };
}();

export function parseExtension(url) {
  var match = /\.([^./]*?)$/g.exec(url);
  if (match) return match[1];
  return '';
}

export function getMimeType(url) {
  var ext = parseExtension(url).toLowerCase();
  return mimes[ext] || '';
}

export function delay(ms) {
  return function (arg) {
    return new _Promise(function (resolve) {
      setTimeout(function () {
        resolve(arg);
      }, ms);
    });
  };
}

export function createImage(url) {
  return new _Promise(function (resolve, reject) {
    var image = new Image();
    image.onload = function () {
      resolve(image);
    };
    image.onerror = reject;
    image.crossOrigin = 'anonymous';
    image.src = url;
  });
}

export function isDataUrl(url) {
  return url.search(/^(data:)/) !== -1;
}

export function toDataURL(content, mimeType) {
  return 'data:' + mimeType + ';base64,' + content;
}

export function getDataURLContent(dataURL) {
  return dataURL.split(/,/)[1];
}

function toBlob(canvas) {
  return new _Promise(function (resolve) {
    var binaryString = window.atob(canvas.toDataURL().split(',')[1]);
    var len = binaryString.length;
    var binaryArray = new Uint8Array(len);

    for (var i = 0; i < len; i += 1) {
      binaryArray[i] = binaryString.charCodeAt(i);
    }

    resolve(new Blob([binaryArray], {
      type: 'image/png'
    }));
  });
}

export function canvasToBlob(canvas) {
  if (canvas.toBlob) {
    return new _Promise(function (resolve) {
      canvas.toBlob(resolve);
    });
  }

  return toBlob(canvas);
}

export function toArray(arrayLike) {
  var arr = [];

  for (var i = 0, l = arrayLike.length; i < l; i += 1) {
    arr.push(arrayLike[i]);
  }

  return arr;
}

function px(node, styleProperty) {
  var value = window.getComputedStyle(node).getPropertyValue(styleProperty);
  return parseFloat(value.replace('px', ''));
}

export function getNodeWidth(node) {
  var leftBorder = px(node, 'border-left-width');
  var rightBorder = px(node, 'border-right-width');
  return node.scrollWidth + leftBorder + rightBorder;
}

export function getNodeHeight(node) {
  var topBorder = px(node, 'border-top-width');
  var bottomBorder = px(node, 'border-bottom-width');
  return node.scrollHeight + topBorder + bottomBorder;
}

export function getPixelRatio(context) {
  var backingStore = context.backingStorePixelRatio || context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1;

  return (window.devicePixelRatio || 1) / backingStore;
}

export function svgToDataURL(svg) {
  return _Promise.resolve().then(function () {
    return new XMLSerializer().serializeToString(svg);
  }).then(encodeURIComponent).then(function (html) {
    return 'data:image/svg+xml;charset=utf-8,' + html;
  });
}

export function getBlobFromImageURL(url) {
  return createImage(url).then(function (image) {
    var width = image.width,
        height = image.height;


    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    var ratio = getPixelRatio(context);

    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.style.width = width;
    canvas.style.height = height;

    context.scale(ratio, ratio);
    context.drawImage(image, 0, 0);

    var dataURL = canvas.toDataURL(getMimeType(url));

    return getDataURLContent(dataURL);
  });
}