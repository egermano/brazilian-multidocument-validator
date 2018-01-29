export function cpfValidator(val: string): Boolean { 
    val = val.replace(/[^\d]+/g, '');

    let cpf = val;

    while (cpf.length < 11) {
        cpf = "0" + cpf;
    }

    const expReg = /^0+$|^1+$|^2+$|^3+$|^4+$|^5+$|^6+$|^7+$|^8+$|^9+$/;

    let a = [];
    let b = 0;
    let c = 11;
    for (let i = 0; i < 11; i++) {
        a[i] = cpf.charAt(i);
        if (i < 9) {
            b += (a[i] * --c);
        }
    }

    let x = b % 11;

    if (x < 2) {
        a[9] = 0
    } else {
        a[9] = 11 - x
    }

    b = 0;
    c = 11;

    for (let y = 0; y < 10; y++) {
        b += (a[y] * c--);
    }

    x = b % 11

    if (x < 2) {
        a[10] = 0;
    } else {
        a[10] = 11 - x;
    }

    let result = true;

    if ((cpf.charAt(9) != a[9]) || (cpf.charAt(10) != a[10]) || cpf.match(expReg)) {
        result = false
    };

    if (result) {
        return true;
    } else {
        return false;
    }
}

export function cnpjValidator(val: string): Boolean {
    val = val.replace(/[^\d]+/g, '');

    let cnpj = val;

    if (cnpj == '') {
        return false
    }

    if (cnpj.length != 14) {
        return false
    }

    // LINHA 10 - Elimina CNPJs invalidos conhecidos
    if (cnpj == "00000000000000" ||
        cnpj == "11111111111111" ||
        cnpj == "22222222222222" ||
        cnpj == "33333333333333" ||
        cnpj == "44444444444444" ||
        cnpj == "55555555555555" ||
        cnpj == "66666666666666" ||
        cnpj == "77777777777777" ||
        cnpj == "88888888888888" ||
        cnpj == "99999999999999") {
        return false;
    }

    let tamanho = cnpj.length - 2,
        numeros = cnpj.substring(0, tamanho),
        digitos = cnpj.substring(tamanho),
        soma = 0,
        pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
        soma += parseInt(numeros.charAt(tamanho - i)) * pos--;

        if (pos < 2) {
            pos = 9;
        }

    }

    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;

    if (resultado != parseInt(digitos.charAt(0))) {
        return false;
    }

    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {

        soma += parseInt(numeros.charAt(tamanho - i)) * pos--;

        if (pos < 2) {
            pos = 9;
        }
    }

    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;

    if (resultado != parseInt(digitos.charAt(1))) {
        return false;
    }

    return true;
}

export function documentValidator(val: string): Boolean {
    val = val.replace(/[^\d]+/g, '');

    if (val.length <= 11) {
        return cpfValidator(val);
    } else {
        return cnpjValidator(val);
    }
}


export function documentValidatorProm(val: string): Promise<String> {
    return new Promise((resolve, reject) => {
      if (documentValidator(val)) {
        resolve(val);
      } else {
        reject();
      }
    });
}