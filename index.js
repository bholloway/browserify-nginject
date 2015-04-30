'use strict';

var esprimaTools = require('browserify-esprima-tools'),
    converter    = require('convert-source-map'),
    merge        = require('lodash.merge');

var testNode     = require('./lib/ast-tests'),
    inferAngular = require('./lib/infer-angular'),
    processNode  = require('./lib/process-node');

/**
 * Esprima based explicity @ngInject annotation with sourcemaps.
 * To be processed, files must be either transformed (as indicated by an embeded source-map) or <code>js</code>
 * extension.
 * @param {object} opt An options hash
 */
function browserifyNgInject(opt) {
  var options = merge({ filter: filter }, opt);
  return esprimaTools.createTransform(updater, opt);  // json files cannot be parsed by esprima
}

module.exports = browserifyNgInject;

/**
 * Filter method for <code>browserify-esprima-tools</code> that allows js files or files with embedded source-map.
 * @param {string} file The full filename of the file being transformed
 * @param {string} content The initial text content of the file being transformed
 * @returns {boolean} True for included, else False
 */
function filter(file, content) {
  return /\.js$/.test(file) || !!converter.fromSource(content);
}

/**
 * The updater function for the esprima transform
 * @param {string} file The filename for the Browserify transform
 * @param {object} ast The esprima syntax tree
 * @returns {object} The transformed esprima syntax tree
 */
function updater(file, ast) {
  if (ast.comments) {
    ast.comments
      .filter(testDocTag)
      .map(getAnnotatedNode)
      .concat(inferAngular(ast))    // find the items that are not explicitly annotated
      .filter(testFirstOccurrence)  // ensure unique values
      .forEach(processNode);
  } else {
    throw new Error('Esprima AST is required to have top-level comments array');
  }
  return ast;
}

/**
 * Test the comment content for the <code>@ngInject</code> doctag.
 * @param {object} comment The comment node
 */
function testDocTag(comment) {
  return /@ngInject/i.test(comment.value);
}

/**
 * Get the node that is annotated by the comment or throw if not present.
 * @throws {Error} Where comment does not annotate a node
 * @param {object} comment The comment node
 */
function getAnnotatedNode(comment) {

  // find the first function declaration or expression following the annotation
  var result;
  if (comment.annotates) {
    var candidateTrees;

    // consider the context the block is in (i.e. what is its parent)
    var parent = comment.annotates.parent;

    // if comment is in a block then we can consider the 2 statements following the comment
    if (testNode.isBlockOrProgram(parent)) {
      var index = parent.body.indexOf(comment.annotates);
      candidateTrees = parent.body.slice(index, index + 2);
    }
    // otherwise we can only consider the given node
    else {
      candidateTrees = [comment.annotates];
    }

    // try the nodes
    while (!result && candidateTrees.length) {
      result = esprimaTools
        .orderNodes(candidateTrees.shift())
        .filter(testNode.isFunction)
        .shift();
    }
  }

  // throw where not valid
  if (result) {
    return result;
  } else {
    throw new Error('Doc-tag @ngInject does not annotate anything');
  }
}

/**
 * Test whether the given value is the first occurance in the array.
 * @param {*} value The value to test
 * @param {number} i The index of the value in the array
 * @param {Array} array The array the value is within at the given index
 */
function testFirstOccurrence(value, i, array) {
  return (array.indexOf(value) === i);
}
