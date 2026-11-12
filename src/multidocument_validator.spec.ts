import documentValidator, { cnpjValidator, cpfValidator } from "./multidocument_validator";

describe("CPF validator", () => {
  it.each(["773251218901", "77325121890123", "773.251.218-901", "00000000000191"])(
    "rejects excess digits in %s instead of validating only the prefix", (input) => {
      expect(cpfValidator(input)).toBe(false);
    },
  );

  it.each(["353", "00000000353", "texto77325121890", " 77325121890 "])(
    "preserves legacy normalization for %s", (input) => {
      expect(cpfValidator(input)).toBe(true);
    },
  );

  it.each(["", "abc", "00000000000", "77325121891", "77325121800"])(
    "rejects invalid CPF %s", (input) => {
      expect(cpfValidator(input)).toBe(false);
    },
  );
});

describe("Document identification", () => {
  it.each(["texto77325121890", " 77325121890 ", "77325121890\n", "77325121890\t", "A00000000353", ""])(
    "does not strip unsupported characters from %j", (input) => {
      expect(documentValidator(input)).toBe(false);
    },
  );

  it("preserves legacy short CPF and punctuation handling", () => {
    expect(documentValidator("353")).toBe(true);
    expect(documentValidator("773..25121890")).toBe(true);
  });
});

describe("CNPJ validator", () => {
  it("validates the official alphanumeric CNPJ example", () => {
    expect(cnpjValidator("12ABC34501DE35")).toBe(true);
  });

  it("recognizes the official alphanumeric CNPJ through the document validator", () => {
    expect(documentValidator("12ABC34501DE35")).toBe(true);
  });

  it("validates the official alphanumeric CNPJ with its mask", () => {
    expect(cnpjValidator("12.ABC.345/01DE-35")).toBe(true);
    expect(documentValidator("12.ABC.345/01DE-35")).toBe(true);
  });

  it("normalizes lowercase letters in an alphanumeric CNPJ", () => {
    expect(cnpjValidator("12.aBc.345/01dE-35")).toBe(true);
    expect(documentValidator("12.aBc.345/01dE-35")).toBe(true);
  });

  it("rejects an alphanumeric CNPJ with either verifier digit changed", () => {
    expect(cnpjValidator("12ABC34501DE45")).toBe(false);
    expect(cnpjValidator("12ABC34501DE36")).toBe(false);
    expect(documentValidator("12ABC34501DE45")).toBe(false);
    expect(documentValidator("12ABC34501DE36")).toBe(false);
  });

  it.each([
    "ABCDEFGHIJKL80",
    "1345C3A5000106",
    "R55231B3000757",
    "Z1234567890191",
    "1345c3A5000106",
    "12abc34501de35",
  ])("validates alphanumeric CNPJ fixture %s", (cnpj) => {
    expect(cnpjValidator(cnpj)).toBe(true);
    expect(documentValidator(cnpj)).toBe(true);
  });

  it.each([
    "ABCDEF12000004",
    "ABCDEF12000608",
    "ABCDEF12000780",
    "ABCDEF12001400",
  ])("validates CNPJ fixture %s for modulo 11 boundary remainders", (cnpj) => {
    expect(cnpjValidator(cnpj)).toBe(true);
    expect(documentValidator(cnpj)).toBe(true);
  });

  it.each([
    "90.024.778/000123",
    "12ABC34501DE3A",
    "12.ABC.345/01DE-35\n",
    "A00000000353",
    "0000000000019",
    "000000000001911",
    "0000000000019L",
    "000000000001P1",
    ".12ABC34501DE35",
    "12ABC34501DE35 ",
    " 12ABC34501DE35",
    "12.ABC.345/01DE-35\r\n",
    "12ABC\t34501DE35",
    "12ABC 34501DE35",
    "$12ABC34501DE35",
    "12ABC34501DE35#",
    "12ABC?34501DE35",
    "12ÁBC34501DE35",
    "１２ABC34501DE35",
    "",
  ])("rejects malformed CNPJ input %j without reinterpreting it", (cnpj) => {
    expect(cnpjValidator(cnpj)).toBe(false);
    expect(documentValidator(cnpj)).toBe(false);
  });

  it("rejects CNPJ bases containing only zeros without throwing", () => {
    expect(cnpjValidator("00000000000001")).toBe(false);
    expect(cnpjValidator("00.000.000/0000-01")).toBe(false);
    expect(documentValidator("00000000000001")).toBe(false);
    expect(documentValidator("00.000.000/0000-01")).toBe(false);
  });

  it("rejects non-ASCII characters instead of normalizing them", () => {
    expect(cnpjValidator("S1234567890106")).toBe(true);
    expect(cnpjValidator("ſ1234567890106")).toBe(false);
    expect(documentValidator("ſ1234567890106")).toBe(false);
  });

  it("keeps accepting formatted numeric CNPJ through its named validator", () => {
    expect(cnpjValidator("84.311.439/0001-25")).toBe(true);
  });

  it.each(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"])(
    "rejects repeated numeric CNPJ %s with and without its mask",
    (digit) => {
      const unmaskedCnpj = digit.repeat(14);
      const maskedCnpj = `${digit.repeat(2)}.${digit.repeat(3)}.${digit.repeat(3)}/${digit.repeat(4)}-${digit.repeat(2)}`;

      expect(cnpjValidator(unmaskedCnpj)).toBe(false);
      expect(cnpjValidator(maskedCnpj)).toBe(false);
      expect(documentValidator(maskedCnpj)).toBe(false);
    },
  );

  it.each(["ABCDEFGHIJKL81", "R55231B3000700", "00000000000192"])(
    "rejects reference CNPJ %s with invalid verifier digits", (input) => {
      expect(cnpjValidator(input)).toBe(false);
      expect(documentValidator(input)).toBe(false);
    },
  );

  it("rejects excessively long input", () => {
    const input = "A".repeat(100_000);
    expect(cnpjValidator(input)).toBe(false);
    expect(documentValidator(input)).toBe(false);
  });
});

describe("CPF regression fixtures", () => {
  const CPFS = [
    { document: "00000000000", assert: false },
    { document: "11111111111", assert: false },
    { document: "22222222222", assert: false },
    { document: "33333333333", assert: false },
    { document: "44444444444", assert: false },
    { document: "55555555555", assert: false },
    { document: "66666666666", assert: false },
    { document: "77777777777", assert: false },
    { document: "88888888888", assert: false },
    { document: "99999999999", assert: false },
    { document: "00000000353", assert: true },
    { document: "000.000.003-53", assert: true },
    { document: "77325121890", assert: true },
    { document: "773.251.218-90", assert: true },
    { document: "27149129587", assert: true },
    { document: "271.491.295-87", assert: true },
    { document: "12312312314", assert: false },
    { document: "12.345.678-90", assert: true },
  ];

  it.each(CPFS)("returns $assert for CPF $document", ({ document, assert }) => {
    expect(cpfValidator(document)).toBe(assert);
    expect(documentValidator(document)).toBe(assert);
  });
});

describe("Numeric CNPJ regression fixtures", () => {
  const CNPJS = [
    { document: "00000000000000", assert: false },
    { document: "11111111111111", assert: false },
    { document: "22222222222222", assert: false },
    { document: "33333333333333", assert: false },
    { document: "44444444444444", assert: false },
    { document: "55555555555555", assert: false },
    { document: "66666666666666", assert: false },
    { document: "77777777777777", assert: false },
    { document: "88888888888888", assert: false },
    { document: "99999999999999", assert: false },
    { document: "00000000000353", assert: true },
    { document: "84311439000125", assert: true },
    { document: "84.311.439/0001-25", assert: true },
    { document: "74.261.126/0001-56", assert: true },
    { document: "98712391290381", assert: false },
    { document: "18297389127365", assert: false },
    { document: "00000000000191", assert: true },
    { document: "90.025.255/0001-00", assert: true },
    { document: "04.740.714/0001-97", assert: true },
  ];

  it.each(CNPJS)("returns $assert for CNPJ $document", ({ document, assert }) => {
    expect(cnpjValidator(document)).toBe(assert);
    expect(documentValidator(document)).toBe(assert);
  });
});
