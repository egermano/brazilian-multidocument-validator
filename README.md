# Brazilian Document Validator
A Node.js module that validate Brazilians documents as CPF and CPNJ.

[![Build Status](https://travis-ci.org/egermano/brazilian-multidocument-validator.svg?branch=master)](https://travis-ci.org/egermano/brazilian-multidocument-validator)

## Installation 
```sh
npm install br-doc-validator --save
yarn add mypluralize
```

## Usage
### Javascript
```javascript
var validator = require('br-doc-validator');
let document = '00000000353';
validator(document).then((result) => {
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
import { multidocumentValidatorHelper as validator } from 'br-doc-validator';
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
```