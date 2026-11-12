import { performance } from "node:perf_hooks";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { cpus } from "node:os";

// Um módulo alternativo permite comparar versões compiladas no mesmo ambiente.
const modulePath = resolve(process.argv[2] ?? "bin/multidocument_validator.js");
const { default: documentValidator, cpfValidator, cnpjValidator } = await import(
  pathToFileURL(modulePath).href
);

const scenarios = [
  ["CPF específico", cpfValidator, ["77325121890", "271.491.295-87", "353"]],
  ["CPF automático", documentValidator, ["77325121890", "271.491.295-87", "353"]],
  ["CNPJ específico", cnpjValidator, ["84311439000125", "12.ABC.345/01DE-35", "12abc34501de35"]],
  ["CNPJ automático", documentValidator, ["84311439000125", "12.ABC.345/01DE-35", "12abc34501de35"]],
  ["DV inválido", cnpjValidator, ["12ABC34501DE36", "12ABC34501DE45", "18297389127365"]],
  ["Formato inválido", documentValidator, ["A00000000353", "90.024.778/000123", ""]],
  ["CNPJ longo (100 mil)", cnpjValidator, ["A".repeat(100_000)], 1_000],
  ["Automático longo (100 mil)", documentValidator, ["A".repeat(100_000)], 1_000],
];

console.log(JSON.stringify({
  node: process.version,
  platform: `${process.platform}/${process.arch}`,
  cpu: cpus()[0]?.model,
  module: modulePath,
  samples: 7,
}));

let checksum = 0;
for (const [scenario, validate, inputs, iterations = 100_000] of scenarios) {
  const run = () => {
    const start = performance.now();
    for (let index = 0; index < iterations; index++) {
      checksum += Number(validate(inputs[index % inputs.length]));
    }
    return (performance.now() - start) * 1_000_000 / iterations;
  };
  run(); // Aquecimento excluído da mediana.
  const samples = Array.from({ length: 7 }, run).sort((a, b) => a - b);
  console.log(JSON.stringify({ scenario, iterations, medianNs: Math.round(samples[3]) }));
}
console.log(JSON.stringify({ checksum }));
