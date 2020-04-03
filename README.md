# Brazilian Document Validator
A Node.js module that validate brazilian documents as CPF and CPNJ.

[![Build Status](https://travis-ci.org/egermano/brazilian-multidocument-validator.svg?branch=master)](https://travis-ci.org/egermano/brazilian-multidocument-validator)
![Node.js](https://github.com/egermano/brazilian-multidocument-validator/workflows/Node.js/badge.svg)

## Installation 
```sh
npm install br-doc-validator --save
yarn add br-doc-validator
```

## Usage
### Javascript
```javascript
var validator = require('br-doc-validator');
let document = '00000000353';
validator.documentValidatorProm(document).then((result) => {
    console.log('valid');
}, (err) => {
    console.log('invalid');
});
```
```sh
Output should be 'valid'
```

### TypeScript
```typescript
import { documentValidatorProm as validator } from 'br-doc-validator';
let document = '00000000000353';
validator(document).then((result) => {
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
