# Changelog

## [Não publicado]

### Adicionado

- Suporte ao CNPJ alfanumérico (nova regra da Receita Federal, julho de 2026),
  incluindo máscara `XX.XXX.XXX/XXXX-DD` e normalização de letras minúsculas.
- `npm run test:package` — valida o tarball publicado em um diretório limpo
  (importação ESM, declarações TypeScript e ausência de peer dependencies).
- `npm run benchmark` — medição reproduzível de tempo por cenário.
- Workflow de CI em pull requests, com cache do npm e Node 18/20/22/24.

### Corrigido

- `cpfValidator` não valida mais apenas o prefixo de entradas com mais de 11
  dígitos; anteriormente `cpfValidator("77325121890123")` retornava `true`.

### Alterado

- `documentValidator` não remove mais silenciosamente letras e símbolos no
  caminho de CPF: entradas como `"texto77325121890"` e `"A00000000353"`, antes
  aceitas como CPF, agora retornam `false`.
- TypeScript deixou de ser `peerDependency`; a biblioteca publica JavaScript
  compilado e não exige o compilador no projeto consumidor.
- Cobertura de testes deixou de ser coletada por padrão (`npm test` é mais
  rápido); use `npm run test:coverage`.

## [3.0.0] e anteriores

Ver histórico de commits.
