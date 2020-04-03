# Brazilian Document Validator
A Node.js module that validate brazilian documents as CPF and CPNJ.

🇷 Modulo em Node.js para validação de documento CPF e CNPJ.

[![Build Status](https://travis-ci.org/egermano/brazilian-multidocument-validator.svg?branch=master)](https://travis-ci.org/egermano/brazilian-multidocument-validator)
![Node.js](https://github.com/egermano/brazilian-multidocument-validator/workflows/Node.js/badge.svg)

## Installation 
```sh
npm install br-doc-validator --save
yarn add br-doc-validator
```

## Usage

```javascript
const validator = require('br-doc-validator');
const document = '00000000353';
const result = validator.documentValidator(document);

if(result) {
    console.log('valid');
} else {
    console.log('invalid');
}
```
```sh
Output should be 'valid'
```

Async support
```javascript
const validator = require('br-doc-validator');
const document = '00000000353';
validator.documentValidator(document, true).then((result) => {
    console.log('valid');
}, (err) => {
    console.log('invalid');
});
```
```sh
Output should be 'valid'
```

## Test 
```sh
npm run test
yarn test
```
