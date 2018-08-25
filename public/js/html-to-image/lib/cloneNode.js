import _Promise from 'babel-runtime/core-js/promise';
import { createImage, toArray, svgToDataURL } from './utils';
import clonePseudoElements from './clonePseudoElements';

function cloneSingleNode(nativeNode) {
  if (nativeNode instanceof HTMLCanvasElement) {
    return createImage(nativeNode.toDataURL());
  } else if (nativeNode.tagName && nativeNode.tagName.toLowerCase() === 'svg') {
    return _Promise.resolve(nativeNode).then(svgToDataURL).then(createImage);
  }

  return _Promise.resolve(nativeNode.cloneNode(false));
}

function cloneChildren(nativeNode, clonedNode, filter) {
  var children = toArray(nativeNode.childNodes);
  if (children.length === 0) {
    return _Promise.resolve(clonedNode);
  }

  // clone children in order
  return children.reduce(function (done, child) {
    return done.then(function () {
      return cloneNode(child, filter);
    }) // eslint-disable-line
    .then(function (clonedChild) {
      if (clonedChild) {
        clonedNode.appendChild(clonedChild);
      }
    });
  }, _Promise.resolve()).then(function () {
    return clonedNode;
  });
}

function cloneCssStyle(nativeNode, clonedNode) {
  var source = window.getComputedStyle(nativeNode);
  var target = clonedNode.style;

  if (source.cssText) {
    target.cssText = source.cssText;
  } else {
    toArray(source).forEach(function (name) {
      target.setProperty(name, source.getPropertyValue(name), source.getPropertyPriority(name));
    });
  }
}

function cloneInputValue(nativeNode, clonedNode) {
  if (nativeNode instanceof HTMLTextAreaElement) {
    clonedNode.innerHTML = nativeNode.value;
  }

  if (nativeNode instanceof HTMLInputElement) {
    clonedNode.setAttribute('value', nativeNode.value);
  }
}

function decorate(nativeNode, clonedNode) {
  if (!(clonedNode instanceof Element)) {
    return clonedNode;
  }

  return _Promise.resolve().then(function () {
    return cloneCssStyle(nativeNode, clonedNode);
  }).then(function () {
    return clonePseudoElements(nativeNode, clonedNode);
  }).then(function () {
    return cloneInputValue(nativeNode, clonedNode);
  }).then(function () {
    return clonedNode;
  });
}

export default function cloneNode(domNode, filter, isRoot) {
  if (!isRoot && filter && !filter(domNode)) {
    return _Promise.resolve();
  }

  return _Promise.resolve(domNode).then(cloneSingleNode).then(function (clonedNode) {
    return cloneChildren(domNode, clonedNode, filter);
  }).then(function (clonedNode) {
    return decorate(domNode, clonedNode);
  });
}