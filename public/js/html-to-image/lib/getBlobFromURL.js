import _Promise from 'babel-runtime/core-js/promise';
import { getDataURLContent } from './utils';

var TIMEOUT = 30000;

// KNOWN ISSUE
// -----------
// Can not handle redirect-url, such as when access 'http://something.com/avatar.png'
// will redirect to 'http://something.com/65fc2ffcc8aea7ba65a1d1feda173540'


export default function getBlobFromURL(url, options) {
  // cache bypass so we dont have CORS issues with cached images
  // ref: https://developer.mozilla.org/en/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest#Bypassing_the_cache
  if (options.cacheBust) {
    url += (/\?/.test(url) ? '&' : '?') + new Date().getTime(); // eslint-disable-line
  }

  var failed = function failed(err) {
    var placeholder = '';
    if (options.imagePlaceholder) {
      var split = options.imagePlaceholder.split(/,/);
      if (split && split[1]) {
        placeholder = split[1]; // eslint-disable-line
      }
    }

    var msg = 'Failed to fetch resource: ' + url;

    if (err) {
      msg = typeof err === 'string' ? err : err.message;
    }

    if (msg) {
      console.error(msg); // eslint-disable-line
    }

    return placeholder;
  };

  var deferred = window.fetch
  // fetch
  ? window.fetch(url).then(function (response) {
    return response.blob();
  }).then(function (blob) {
    return new _Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onloadend = function () {
        return resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }).then(getDataURLContent).catch(function () {
    return new _Promise(function (resolve, reject) {
      reject();
    });
  })

  // xhr
  : new _Promise(function (resolve, reject) {
    var req = new XMLHttpRequest();

    var timeout = function timeout() {
      reject(new Error('Timeout of ' + TIMEOUT + 'ms occured while fetching resource: ' + url));
    };

    var done = function done() {
      if (req.readyState !== 4) {
        return;
      }

      if (req.status !== 200) {
        reject(new Error('Failed to fetch resource: ' + url + ', status: ' + req.status));
        return;
      }

      var encoder = new FileReader();
      encoder.onloadend = function () {
        resolve(getDataURLContent(encoder.result));
      };
      encoder.readAsDataURL(req.response);
    };

    req.onreadystatechange = done;
    req.ontimeout = timeout;
    req.responseType = 'blob';
    req.timeout = TIMEOUT;
    req.open('GET', url, true);
    req.send();
  });

  return deferred.catch(failed);
}