import _Promise from 'babel-runtime/core-js/promise';
import { toArray } from './utils';
import embedResources, { shouldEmbed } from './embedResources';

function getCssRules(styleSheets) {
  return styleSheets.reduce(function (memo, sheet) {
    try {
      if (sheet.cssRules) {
        memo.push.apply(memo, toArray(sheet.cssRules));
      }
    } catch (e) {
      // eslint-disable-next-line
      console.log('Error while reading CSS rules from ' + sheet.href, e.toString());
    }

    return memo;
  }, []);
}

function getWebFontRules(cssRules) {
  return cssRules.filter(function (rule) {
    return rule.type === CSSRule.FONT_FACE_RULE;
  }).filter(function (rule) {
    return shouldEmbed(rule.style.getPropertyValue('src'));
  });
}

export function parseWebFontRules(clonedNode) {
  return new _Promise(function (resolve, reject) {
    if (!clonedNode.ownerDocument) {
      reject(new Error('Provided element is not within a Document'));
    }
    resolve(toArray(clonedNode.ownerDocument.styleSheets));
  }).then(getCssRules).then(getWebFontRules);
}

export default function embedWebFonts(clonedNode, options) {
  return parseWebFontRules(clonedNode).then(function (rules) {
    return _Promise.all(rules.map(function (rule) {
      var baseUrl = (rule.parentStyleSheet || {}).href;
      return embedResources(rule.cssText, baseUrl, options);
    }));
  }).then(function (cssStrings) {
    return cssStrings.join('\n');
  }).then(function (cssString) {
    var styleNode = document.createElement('style');
    var sytleContent = document.createTextNode(cssString);

    styleNode.appendChild(sytleContent);

    if (clonedNode.firstChild) {
      clonedNode.insertBefore(styleNode, clonedNode.firstChild);
    } else {
      clonedNode.appendChild(styleNode);
    }

    return clonedNode;
  });
}