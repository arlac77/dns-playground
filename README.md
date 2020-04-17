[![npm](https://img.shields.io/npm/v/dns-playground.svg)](https://www.npmjs.com/package/dns-playground)
[![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)
[![minified size](https://badgen.net/bundlephobia/min/dns-playground)](https://bundlephobia.com/result?p=dns-playground)
[![downloads](http://img.shields.io/npm/dm/dns-playground.svg?style=flat-square)](https://npmjs.org/package/dns-playground)
[![Build Status](https://travis-ci.com/arlac77/dns-playground.svg?branch=master)](https://travis-ci.com/arlac77/dns-playground)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/arlac77/dns-playground)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Known Vulnerabilities](https://snyk.io/test/github/arlac77/dns-playground/badge.svg)](https://snyk.io/test/github/arlac77/dns-playground)
[![codecov.io](http://codecov.io/github/arlac77/dns-playground/coverage.svg?branch=master)](http://codecov.io/github/arlac77/dns-playground?branch=master)
[![Coverage Status](https://coveralls.io/repos/arlac77/dns-playground/badge.svg)](https://coveralls.io/r/arlac77/dns-playground)

# dns-playground

playing around with dns & Symatem

# API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### Table of Contents

-   [setMetaTriple](#setmetatriple)
    -   [Parameters](#parameters)
-   [registerDataSymbol](#registerdatasymbol)
    -   [Parameters](#parameters-1)
-   [attributes](#attributes)
    -   [Parameters](#parameters-2)

## setMetaTriple

Links symbol to a triple

### Parameters

-   `symbol` **[Symbol](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Symbol)** 
-   `triple` **[Array](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[Symbol](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Symbol)>** 
-   `writer`  

## registerDataSymbol

Creates a symbol with associated data

### Parameters

-   `backend`  
-   `writer`  
-   `ns`  
-   `attribute`  tripple attribute
-   `value`  tripple value
-   `data`  associated to the entity symbol
-   `cb`  called only when symbol was not already present

## attributes

iterate over all attributes

### Parameters

-   `owner`  root of the definition to traverse

# install

With [npm](http://npmjs.org) do:

```shell
npm install dns-playground
```

# license

BSD-2-Clause
