import { documentValidator } from './multidocument_validator';

describe('CPF/CNPJ validator', () => {
  const CPFS = [
    { document: '00000000000', assert: false },
    { document: '11111111111', assert: false },
    { document: '22222222222', assert: false },
    { document: '33333333333', assert: false },
    { document: '44444444444', assert: false },
    { document: '55555555555', assert: false },
    { document: '66666666666', assert: false },
    { document: '77777777777', assert: false },
    { document: '88888888888', assert: false },
    { document: '99999999999', assert: false },
    { document: '00000000353', assert: true },
    { document: '000.000.003-53', assert: true },
    { document: '77325121890', assert: true },
    { document: '773.251.218-90', assert: true },
    { document: '27149129587', assert: true },
    { document: '271.491.295-87', assert: true },
    { document: '12312312314', assert: false },
  ];

  const CNPJS = [
    { document: '00000000000000', assert: false },
    { document: '11111111111111', assert: false },
    { document: '22222222222222', assert: false },
    { document: '33333333333333', assert: false },
    { document: '44444444444444', assert: false },
    { document: '55555555555555', assert: false },
    { document: '66666666666666', assert: false },
    { document: '77777777777777', assert: false },
    { document: '88888888888888', assert: false },
    { document: '99999999999999', assert: false },
    { document: '00000000000353', assert: true },
    { document: '84311439000125', assert: true },
    { document: '84.311.439/0001-25', assert: true },
    { document: '74.261.126/0001-56', assert: true },
    { document: '98712391290381', assert: false },
    { document: '18297389127365', assert: false },
  ];

  const DOCS = [].concat(CPFS, CNPJS);

  DOCS.forEach((item) => {
    it(`should return \`${item.assert}\` for Document \`${item.document}\` `, async () => {

      try {
        const result = await documentValidator(item.document, true);
        return expect(item.assert).toBe(result);
      } catch (error) {
        return expect(item.assert).toBe(false);
      }
    });
  });

});