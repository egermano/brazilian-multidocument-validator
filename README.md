# Brazilian Document Validator

A Node.js module that validate brazilian documents as CPF and CPNJ.

🇧🇷 Modulo em Node.js para validação de documento CPF e CNPJ.

![Node.js](https://github.com/egermano/brazilian-multidocument-validator/workflows/Node.js/badge.svg)

## Installation

```sh
npm add br-doc-validator
# or
yarn add br-doc-validator
```

## Usage

```typescript
import documentValidator from "br-doc-validator";

const document = "00000000353";
const result: boolean = documentValidator(document);

if (result) {
  console.log("valid");
} else {
  console.log("invalid");
}
```

```sh
Output should be 'valid'
```

## Test

```sh
npm run lint
npm run test
```
