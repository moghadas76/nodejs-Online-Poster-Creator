import { svgToDataURL } from './utils';

export default function createSvgDataURL(clonedNode, width, height) {
  var xmlns = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(xmlns, 'svg');
  var foreignObject = document.createElementNS(xmlns, 'foreignObject');

  svg.setAttributeNS(null, 'width', width);
  svg.setAttributeNS(null, 'height', height);

  foreignObject.setAttributeNS(null, 'width', '100%');
  foreignObject.setAttributeNS(null, 'height', '100%');
  foreignObject.setAttributeNS(null, 'x', 0);
  foreignObject.setAttributeNS(null, 'y', 0);
  foreignObject.setAttributeNS(null, 'externalResourcesRequired', 'true');

  svg.appendChild(foreignObject);
  foreignObject.appendChild(clonedNode);

  return svgToDataURL(svg);
}