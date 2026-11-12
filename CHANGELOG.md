# Changelog

## [4.0.0](https://github.com/egermano/brazilian-multidocument-validator/compare/v3.0.0...v4.0.0) (2026-11-12)

### Adicionado

- Suporte ao CNPJ alfanumérico (nova regra da Receita Federal, julho de 2026),
  incluindo máscara `XX.XXX.XXX/XXXX-DD` e normalização de letras minúsculas.
- Automação de release: merge em `master` abre a PR de versão (release-please)
  e a publicação da Release publica no npm com provenance e tarball anexado.
- `npm run test:package` — valida o tarball publicado em um diretório limpo
  (importação ESM, declarações TypeScript e ausência de peer dependencies).
- `npm run benchmark` — medição reproduzível de tempo por cenário.
- Workflow de CI em pull requests, com cache do npm e versões ativas do Node
  (22/24/26).

### Corrigido

- `cpfValidator` não valida mais apenas o prefixo de entradas com mais de 11
  dígitos; anteriormente `cpfValidator("77325121890123")` retornava `true`.

### Alterado

- **BREAKING CHANGE**: `documentValidator` não remove mais silenciosamente letras
  e símbolos no caminho de CPF: entradas como `"texto77325121890"` e
  `"A00000000353"`, antes aceitas como CPF, agora retornam `false`.
- TypeScript deixou de ser `peerDependency`; a biblioteca publica JavaScript
  compilado e não exige o compilador no projeto consumidor.
- Cobertura de testes deixou de ser coletada por padrão (`npm test` é mais
  rápido); use `npm run test:coverage`.
- **BREAKING CHANGE**: Node.js 18 e 20 chegaram ao fim da vida útil e deixaram
  de ser suportados; o requisito mínimo agora é Node 22 (`engines.node: >=22`).

## [3.0.0] e anteriores

Ver histórico de commits.
