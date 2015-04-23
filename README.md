# Browserify ngInject

[![NPM](https://nodei.co/npm/browserify-nginject.png)](https://github.com/bholloway/browserify-nginject)

[![dependencies](https://david-dm.org/bholloway/browserify-nginject.svg)](https://github.com/bholloway/browserify-nginject)

Browserify transform where explicit `@ngInject` comment creates pre-minification `$inject` property.

Use following [**babelify**](https://github.com/babel/babelify) where
[**browserify-ngannotate**](https://www.npmjs.com/package/browserify-nginject) is not working or is not giving correct
source-maps.

Creates array-type annotations where `$inject` property is not possible.

Detects the usual `angular.module().*` members implicitly. However does not make any other detections (yet).