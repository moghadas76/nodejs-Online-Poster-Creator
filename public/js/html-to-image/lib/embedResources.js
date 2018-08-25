import _Promise from 'babel-runtime/core-js/promise';
import getBlobFromURL from './getBlobFromURL';
import { isDataUrl, toDataURL, getMimeType } from './utils';

var URL_REGEX = /url\((['"]?)([^'"]+?)\1\)/g;

function resolveUrl(url, baseUrl) {
  if (url.match(/^[a-z]+:\/\//i)) {
    // url is absolute already
    return url;
  } else if (url.match(/^\/\//)) {
    return window.location.protocol + url; // url is absolute already, without protocol
  } else if (url.match(/^[a-z]+:/i)) {
    // dataURI, mailto:, tel:, etc.
    return url;
  }

  var doc = document.implementation.createHTMLDocument();
  var base = doc.createElement('base');
  var a = doc.createElement('a');

  doc.head.appendChild(base);
  doc.body.appendChild(a);

  base.href = baseUrl;
  a.href = url;

  return a.href;
}

function escape(url) {
  return url.replace(/([.*+?^${}()|\[\]\/\\])/g, '\\$1'); // eslint-disable-line
}

function urlToRegex(url) {
  return new RegExp('(url\\([\'"]?)(' + escape(url) + ')([\'"]?\\))', 'g');
}

function parseURLs(str) {
  var result = [];

  str.replace(URL_REGEX, function (raw, quotation, url) {
    result.push(url);
    return raw;
  });

  return result.filter(function (url) {
    return !isDataUrl(url);
  });
}

function embed(cssString, resourceURL, baseURL, options) {
  var resolvedURL = baseURL ? resolveUrl(resourceURL, baseURL) : resourceURL;

  return _Promise.resolve(resolvedURL).then(function (url) {
    return getBlobFromURL(url, options);
  }).then(function (data) {
    return toDataURL(data, getMimeType(resourceURL));
  }).then(function (dataURL) {
    return cssString.replace(urlToRegex(resourceURL), '$1' + dataURL + '$3');
  }).then(function (content) {
    return content;
  }, function () {
    return resolvedURL;
  });
}

export function shouldEmbed(string) {
  return string.search(URL_REGEX) !== -1;
}

export default function embedResources(cssString, baseUrl, options) {
  if (!shouldEmbed(cssString)) {
    return _Promise.resolve(cssString);
  }

  return _Promise.resolve(cssString).then(parseURLs).then(function (urls) {
    return urls.reduce(function (done, url) {
      return done.then(function (ret) {
        return embed(ret, url, baseUrl, options);
      });
    }, _Promise.resolve(cssString));
  });
}