export function cpfValidator(input: string): Boolean {
  let cpf = input.replace(/[^\d]+/g, '');

  while (cpf.length < 11) {
    cpf = `0${cpf}`;
  }

  const expReg = /^0+$|^1+$|^2+$|^3+$|^4+$|^5+$|^6+$|^7+$|^8+$|^9+$/;

  const a: number[] = [];
  let b: number = 0;
  let c: number = 11;
  for (let i = 0; i < 11; i = i + 1) {
    a[i] = parseInt(cpf.charAt(i), 10);
    if (i < 9) {
      c = c - 1;
      b = b + (a[i] * c);
    }
  }

  let x: number = b % 11;

  if (x < 2) {
    a[9] = 0;
  } else {
    a[9] = 11 - x;
  }

  b = 0;
  c = 11;

  for (let y = 0; y < 10; y = y + 1) {
    b = b + (a[y] * c);
    c = c - 1;
  }

  x = b % 11;

  if (x < 2) {
    a[10] = 0;
  } else {
    a[10] = 11 - x;
  }

  let result = true;

  if ((cpf.charAt(9) !== a[9].toString()) || (cpf.charAt(10) !== a[10].toString()) || cpf.match(expReg)) {
    result = false;
  }

  if (result) {
    return true;
  }
  return false;

}

export function cnpjValidator(input: string): Boolean {
  const cnpj = input.replace(/[^\d]+/g, '');

  if (cnpj === '') {
    return false;
  }

  if (cnpj.length !== 14) {
    return false;
  }

  // LINHA 10 - Elimina CNPJs invalidos conhecidos
  if (cnpj === '00000000000000' ||
    cnpj === '11111111111111' ||
    cnpj === '22222222222222' ||
    cnpj === '33333333333333' ||
    cnpj === '44444444444444' ||
    cnpj === '55555555555555' ||
    cnpj === '66666666666666' ||
    cnpj === '77777777777777' ||
    cnpj === '88888888888888' ||
    cnpj === '99999999999999') {
    return false;
  }

  let tamanho: number = cnpj.length - 2;
  let numeros: string = cnpj.substring(0, tamanho);
  const digitos: string = cnpj.substring(tamanho);
  let soma: number = 0;
  let pos: number = tamanho - 7;

  for (let i = tamanho; i >= 1; i = i - 1) {
    soma = soma + (parseInt(numeros.charAt(tamanho - i), 10) * pos);
    pos = pos - 1;

    if (pos < 2) {
      pos = 9;
    }

  }

  let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;

  if (resultado !== parseInt(digitos.charAt(0), 10)) {
    return false;
  }

  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i = i - 1) {
    soma = soma + (parseInt(numeros.charAt(tamanho - i), 10) * pos);
    pos = pos - 1;

    if (pos < 2) {
      pos = 9;
    }
  }

  resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;

  if (resultado !== parseInt(digitos.charAt(1), 10)) {
    return false;
  }

  return true;
}

export function documentValidator(input: string, promise: boolean = false): Boolean | Promise<String> {
  const doc = input.replace(/[^\d]+/g, '');
  if (promise) {
    if (doc.length <= 11) {
      return cpfValidator(doc);
    }
    return cnpjValidator(doc);
  }

  return new Promise((resolve, reject) => {
    if (documentValidator(input)) {
      resolve(input);
    } else {
      reject();
    }
  });

}