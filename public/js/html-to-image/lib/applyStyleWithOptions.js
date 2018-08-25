import _Object$assign from "babel-runtime/core-js/object/assign";
export default function applyStyleWithOptions(clonedNode, options) {
  var style = clonedNode.style;


  if (options.backgroundColor) {
    style.backgroundColor = options.backgroundColor;
  }

  if (options.width) {
    style.width = options.width + "px";
  }

  if (options.height) {
    style.height = options.height + "px";
  }

  if (options.style) {
    _Object$assign(style, options.style);
  }

  return clonedNode;
}