'use strict';

var esprimaTools = require('browserify-esprima-tools'),
    converter    = require('convert-source-map'),
    defaults     = require('lodash.defaults');

var getUpdater = require('./lib/get-updater');

/**
 * Esprima based explicitly @ngInject annotation with sourcemaps.
 * By default, files must be either transformed (as indicated by an embeded source-map) or <code>js</code>
 * extension. To process other files set an explicit <code>opt.filter</code>.
 * @param {object} opt An options hash
 */
function browserifyNgInject(opt) {
  var options = defaults(opt, {
        filter: defaultFilter  // remove files that cannot be parsed by esprima
      }),
      updater = getUpdater(throwError);
  return esprimaTools.createTransform(updater, options);
}

module.exports = browserifyNgInject;

/**
 * A filter that passes files that have a source-map comment or have <code>.js</code> extension.
 * @param {string} filename The full filename of the file being transformed
 * @param {string} content The incoming text content of the file being transformed
 * @returns {boolean} True for included, else False
 */
function defaultFilter(filename, content) {
  return /\.js$/.test(filename) || !!converter.fromSource(content);
}

/**
 * Error function that throws the message.
 * @param message The error to throw
 */
function throwError(message) {
  throw new Error(message);
}