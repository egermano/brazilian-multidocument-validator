const unmaskedCnpjPattern = /^[A-Za-z\d]{12}\d{2}$/;
const maskedCnpjPattern = /^[A-Za-z\d]{2}\.[A-Za-z\d]{3}\.[A-Za-z\d]{3}\/[A-Za-z\d]{4}-\d{2}$/;
const invalidCpfCharacters = /[^\d.-]/;
const repeatedDigitsPattern = /^(\d)\1+$/;
const firstCnpjDigitWeights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const secondCnpjDigitWeights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const asciiZero = 48;

const verifierDigit = (sum: number): number => {
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
};

const validateCpfDigits = (digits: string): boolean => {
  if (digits.length > 11) {
    return false;
  }

  const cpf = digits.padStart(11, "0");
  if (repeatedDigitsPattern.test(cpf)) {
    return false;
  }

  let firstSum = 0;
  let secondSum = 0;
  for (let index = 0; index < 9; index++) {
    const digit = cpf.charCodeAt(index) - asciiZero;
    firstSum += digit * (10 - index);
    secondSum += digit * (11 - index);
  }

  const firstDigit = verifierDigit(firstSum);
  const secondDigit = verifierDigit(secondSum + firstDigit * 2);
  return cpf.charCodeAt(9) - asciiZero === firstDigit &&
    cpf.charCodeAt(10) - asciiZero === secondDigit;
};

// O tamanho exato também impede aceitar uma quebra de linha após a máscara.
// Validar ASCII antes de toUpperCase evita converter caracteres como ſ em S.
const normalizeCnpj = (input: string): string | undefined => {
  if (input.length === 14 && unmaskedCnpjPattern.test(input)) {
    return input.toUpperCase();
  }
  if (input.length === 18 && maskedCnpjPattern.test(input)) {
    return input.replace(/[./-]/g, "").toUpperCase();
  }
  return undefined;
};

const validateCnpjCharacters = (cnpj: string): boolean => {
  if (repeatedDigitsPattern.test(cnpj)) {
    return false;
  }

  let firstSum = 0;
  let secondSum = 0;
  for (let index = 0; index < 12; index++) {
    // SERPRO: ASCII - 48; A vale 17 e Z vale 42 (não é base 36).
    const value = cnpj.charCodeAt(index) - asciiZero;
    firstSum += value * firstCnpjDigitWeights[index];
    secondSum += value * secondCnpjDigitWeights[index];
  }

  const firstDigit = verifierDigit(firstSum);
  const secondDigit = verifierDigit(secondSum + firstDigit * 2);
  return cnpj.charCodeAt(12) - asciiZero === firstDigit &&
    cnpj.charCodeAt(13) - asciiZero === secondDigit;
};

/** Valida CPF; remove caracteres não numéricos e completa zeros à esquerda. */
export function cpfValidator(input: string): boolean {
  return validateCpfDigits(input.replace(/[^\d]+/g, ""));
}

/** Valida CNPJ numérico ou alfanumérico, sem máscara ou com máscara exata. */
export function cnpjValidator(input: string): boolean {
  const cnpj = normalizeCnpj(input);
  return cnpj !== undefined && validateCnpjCharacters(cnpj);
}

/** Identifica CPF/CNPJ; no caminho de CPF, aceita somente dígitos, pontos e hífens. */
export default function documentValidator(input: string): boolean {
  const cnpj = normalizeCnpj(input);
  if (cnpj !== undefined) {
    return validateCnpjCharacters(cnpj);
  }

  if (invalidCpfCharacters.test(input)) {
    return false;
  }
  return validateCpfDigits(input.replace(/[.-]/g, ""));
}
