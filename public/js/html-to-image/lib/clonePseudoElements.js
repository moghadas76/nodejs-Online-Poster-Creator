import { toArray, uuid } from './utils';

function formatCssText(style) {
  var content = style.getPropertyValue('content');
  return style.cssText + ' content: ' + content + ';';
}

function formatCssProperties(style) {
  return toArray(style).map(function (name) {
    var value = style.getPropertyValue(name);
    var priority = style.getPropertyPriority(name);

    return name + ': ' + value + (priority ? ' !important' : '') + ';';
  }).join(' ');
}

function getPseudoElementStyle(className, pseudo, style) {
  var selector = '.' + className + ':' + pseudo;
  var cssText = style.cssText ? formatCssText(style) : formatCssProperties(style);

  return document.createTextNode(selector + '{' + cssText + '}');
}

function clonePseudoElement(nativeNode, clonedNode, pseudo) {
  var style = window.getComputedStyle(nativeNode, pseudo);
  var content = style.getPropertyValue('content');

  if (content === '' || content === 'none') {
    return;
  }

  var className = uuid();
  var styleElement = document.createElement('style');

  styleElement.appendChild(getPseudoElementStyle(className, pseudo, style));

  clonedNode.className = clonedNode.className + ' ' + className;
  clonedNode.appendChild(styleElement);
}

export default function clonePseudoElements(nativeNode, clonedNode) {
  [':before', ':after'].forEach(function (pseudo) {
    return clonePseudoElement(nativeNode, clonedNode, pseudo);
  });
}