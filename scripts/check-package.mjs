import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile, access } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

// Executar via npm run test:package, após npm ci (prepare) ou npm run build.
const root = process.cwd();
const npmCli = process.env.npm_execpath;
assert.ok(npmCli, "Execute com npm run test:package");
const directory = await mkdtemp(join(tmpdir(), "br-doc-validator-package-"));
const npm = (args, cwd) => execFileSync(process.execPath, [npmCli, ...args], {
  cwd,
  encoding: "utf8",
});

try {
  const [tarball] = JSON.parse(npm([
    "pack", "--ignore-scripts", "--json", "--pack-destination", directory,
  ], root));
  const files = tarball.files.map(({ path }) => path);
  assert.ok(files.includes("bin/multidocument_validator.js"));
  assert.ok(files.includes("bin/multidocument_validator.d.ts"));
  assert.ok(!files.some((file) => /^(src|scripts|docs)\//.test(file)));

  await writeFile(join(directory, "package.json"), JSON.stringify({
    private: true,
    type: "module",
  }));
  npm([
    "install", "--ignore-scripts", "--no-audit", "--no-fund",
    join(directory, tarball.filename),
  ], directory);

  // O consumidor JavaScript não deve precisar do compilador TypeScript.
  await assert.rejects(access(join(directory, "node_modules/typescript")));
  const installed = JSON.parse(await readFile(
    join(directory, "node_modules/br-doc-validator/package.json"), "utf8",
  ));
  assert.equal(installed.peerDependencies?.typescript, undefined);

  await writeFile(join(directory, "consumer.mjs"), `
    import assert from 'node:assert/strict';
    import validate, { cpfValidator, cnpjValidator } from 'br-doc-validator';
    assert.equal(validate('12.ABC.345/01DE-35'), true);
    assert.equal(cnpjValidator('12abc34501de35'), true);
    assert.equal(cpfValidator('773.251.218-90'), true);
    assert.equal(cpfValidator('77325121890123'), false);
    assert.equal(validate('A00000000353'), false);
  `);
  execFileSync(process.execPath, ["consumer.mjs"], { cwd: directory, stdio: "inherit" });

  await writeFile(join(directory, "consumer.ts"), `
    import validate, { cpfValidator, cnpjValidator } from 'br-doc-validator';
    const results: boolean[] = [validate('353'), cpfValidator('353'), cnpjValidator('12ABC34501DE35')];
    // @ts-expect-error A API aceita somente string.
    validate(353);
    // @ts-expect-error O retorno é boolean, não string.
    const invalid: string = cpfValidator('353');
    void results;
    void invalid;
  `);
  execFileSync(process.execPath, [
    resolve(root, "node_modules/typescript/bin/tsc"), "consumer.ts",
    "--noEmit", "--strict", "--module", "NodeNext", "--moduleResolution", "NodeNext",
    "--target", "ES2020",
  ], { cwd: directory, stdio: "inherit" });

  console.log("Pacote verificado: importação ESM, declarações TypeScript e instalação sem peers.");
} finally {
  await rm(directory, { recursive: true, force: true });
}
