import _Promise from 'babel-runtime/core-js/promise';
import { toArray, isDataUrl, toDataURL, getMimeType } from './utils';
import getBlobFromURL from './getBlobFromURL';
import embedResources from './embedResources';

function embedBackground(clonedNode, options) {
  var background = clonedNode.style.getPropertyValue('background');
  if (!background) {
    return _Promise.resolve(clonedNode);
  }

  return _Promise.resolve(background).then(function (cssString) {
    return embedResources(cssString, null, options);
  }).then(function (cssString) {
    clonedNode.style.setProperty('background', cssString, clonedNode.style.getPropertyPriority('background'));

    return clonedNode;
  });
}

function embedImageNode(clonedNode, options) {
  if (!(clonedNode instanceof HTMLImageElement) || isDataUrl(clonedNode.src)) {
    return _Promise.resolve(clonedNode);
  }

  return _Promise.resolve(clonedNode.src).then(function (url) {
    return getBlobFromURL(url, options);
  }).then(function (data) {
    return toDataURL(data, getMimeType(clonedNode.src));
  }).then(function (dataURL) {
    return new _Promise(function (resolve, reject) {
      clonedNode.onload = resolve;
      clonedNode.onerror = reject;
      clonedNode.src = dataURL;
    });
  }).then(function () {
    return clonedNode;
  }, function () {
    return clonedNode;
  });
}

function embedChildren(clonedNode, options) {
  var children = toArray(clonedNode.childNodes);
  var deferreds = children.map(function (child) {
    return embedImages(child, options);
  }); // eslint-disable-line

  return _Promise.all(deferreds).then(function () {
    return clonedNode;
  });
}

export default function embedImages(clonedNode, options) {
  if (!(clonedNode instanceof Element)) {
    return _Promise.resolve(clonedNode);
  }

  return _Promise.resolve(clonedNode).then(function (node) {
    return embedBackground(node, options);
  }).then(function (node) {
    return embedImageNode(node, options);
  }).then(function (node) {
    return embedChildren(node, options);
  });
}