'use strict';

/**
 * Tests whether the given node is a member expression on one of the angular module methods.
 * @param {object} node An esprima AST node
 * @returns {boolean} True on expression, else False
 */
function isModuleExpression(node) {
  var NAMES = [
    'provider', 'factory', 'service', 'value', 'constant', 'animation',
    'filter', 'controller', 'directive', 'config', 'run'
  ];
  // consider: angular.module().config().run()
  //  both the last 2 terms should match, however the run() term is member of config() which is member of module()
  //  we therefore need recursion to match the last term
  return !!node &&
    (node.type === 'MemberExpression') &&
    (node.property.type === 'Identifier') && (NAMES.indexOf(node.property.name) >= 0) &&
    (node.object.type === 'CallExpression') &&
    (isAngularDotModule(node.object.callee) || isModuleExpression(node.object.callee));
}

/**
 * Tests whether the given node is the exact member expression <code>angular.module</code>.
 * @param {object} node An esprima AST node
 * @returns {boolean} True on expression, else False
 */
function isAngularDotModule(node) {
  return !!node &&
    (node.type === 'MemberExpression') &&
    (node.object.type   === 'Identifier') && (node.object.name   === 'angular') &&
    (node.property.type === 'Identifier') && (node.property.name === 'module');
}

/**
 * Tests whether the given node is a function or variable identifier.
 * @param {object} node An esprima AST node
 * @returns {boolean} True on function or identifier, else False
 */
function isFunctionOrIdentifier(node) {
  return !!node && /^(FunctionExpression|Identifier)$/.test(node.type);
}

/**
 * Test whether the given esprima node is a function declaration or expression node.
 * @param {{type:string}} node An esprima AST node to test
 * @returns {boolean} True on match, else False
 */
function isFunction(node) {
  return !!node && /^Function(Declaration|Expression)$/.test(node.type);
}

/**
 * Test whether the given esprima node is a block statement or program.
 * @param {{type:string}} node An esprima AST node to test
 * @returns {boolean} True on match, else False
 */
function isBlockOrProgram(node) {
  return !!node && /^(Program|BlockStatement)$/.test(node.type);
}

module.exports = {
  isModuleExpression    : isModuleExpression,
  isAngularDotModule    : isAngularDotModule,
  isFunctionOrIdentifier: isFunctionOrIdentifier,
  isFunction            : isFunction,
  isBlockOrProgram      : isBlockOrProgram
};
