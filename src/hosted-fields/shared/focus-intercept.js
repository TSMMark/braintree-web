'use strict';

var browserDetection = require('./browser-detection');
var classList = require('@braintree/class-list');
var constants = require('./constants');
var allowedFields = Object.keys(constants.allowedFields);
var directions = constants.navigationDirections;

var focusIntercept = {
  generate: function (type, direction, handler) {
    var input = document.createElement('input');
    var focusInterceptStyles = {
      border: 'none !important',
      display: 'block !important',
      height: '1px !important',
      left: '-1px !important',
      opacity: '0 !important',
      position: 'absolute !important',
      top: '-1px !important',
      width: '1px !important'
    };
    var shouldCreateFocusIntercept = browserDetection.isChromeOS() ||
      browserDetection.isAndroid() ||
      browserDetection.isIos();

    if (!shouldCreateFocusIntercept) { return document.createDocumentFragment(); }

    input.setAttribute('aria-hidden', 'true');
    input.setAttribute('autocomplete', 'off');
    input.setAttribute('data-braintree-direction', direction);
    input.setAttribute('data-braintree-type', type);
    input.setAttribute('id', 'bt-' + type + '-' + direction);
    input.setAttribute('style',
      JSON.stringify(focusInterceptStyles)
        .replace(/[{}"]/g, '')
        .replace(/,/g, ';'));

    classList.add(input, 'focus-intercept');

    input.addEventListener('focus', handler);

    return input;
  },
  destroy: function (idString) {
    var focusInputs;

    if (!idString) {
      focusInputs = document.querySelectorAll('[data-braintree-direction]');
      focusInputs = [].slice.call(focusInputs);
    } else {
      focusInputs = [document.getElementById(idString)];
    }

    focusInputs.forEach(function (node) {
      if (node && node.nodeType === 1 && focusIntercept.matchFocusElement(node.getAttribute('id'))) {
        node.parentNode.removeChild(node);
      }
    });
  },
  matchFocusElement: function (idString) {
    var idComponents, hasBTPrefix, isAllowedType, isValidDirection;

    if (!idString) { return false; }

    idComponents = idString.split('-');

    if (idComponents.length !== 3) { return false; }

    hasBTPrefix = idComponents[0] === 'bt';
    isAllowedType = allowedFields.indexOf(idComponents[1]) > -1;
    isValidDirection = idComponents[2] === directions.BACK || idComponents[2] === directions.FORWARD;

    return Boolean(
      hasBTPrefix &&
      isAllowedType &&
      isValidDirection
    );
  }
};

module.exports = focusIntercept;
