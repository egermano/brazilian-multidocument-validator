# br-doc-validator

Biblioteca Node.js para validação de CPF e CNPJ — incluindo o novo **CNPJ alfanumérico** da Receita Federal.

## Instalação

### npm (recomendado)

```sh
npm add br-doc-validator
# ou
yarn add br-doc-validator
```

### Direto do GitHub

Instalando a partir de uma release específica (o tarball `br-doc-validator-x.y.z.tgz` é anexado a cada release):

```sh
npm add egermano/brazilian-multidocument-validator#v3.0.0
```

Ou baixando o tarball da [página de releases](https://github.com/egermano/brazilian-multidocument-validator/releases):

```sh
npm add ./br-doc-validator-4.0.0.tgz
```

Compatibilidade: Node.js 22 ou superior (versões ativas: 22, 24 e 26), pacote ESM (`import`). A biblioteca publica JavaScript compilado e declarações de tipos — o TypeScript **não** é exigido no projeto consumidor.

## Uso

```javascript
import validate from "br-doc-validator";

validate("773.251.218-90"); // true
validate("12.ABC.345/01DE-35"); // true — CNPJ alfanumérico
validate("00000000000"); // false
```

### Validadores específicos

```javascript
import { cpfValidator, cnpjValidator } from "br-doc-validator";

cpfValidator("77325121890"); // true
cnpjValidator("12abc34501de35"); // true — minúsculas são normalizadas
```

- **`documentValidator(input)` (export default)** — identifica o tipo de documento automaticamente.
- **`cpfValidator(input)`** — valida apenas CPF.
- **`cnpjValidator(input)`** — valida apenas CNPJ, numérico ou alfanumérico.

Todas as funções recebem `string` e retornam `boolean`. Entradas inválidas retornam `false`; nenhuma função lança exceção.

## Formatos aceitos

### CPF

| Formato | Exemplo | `cpfValidator` | `documentValidator` |
| --- | --- | --- | --- |
| 11 dígitos | `77325121890` | ✅ | ✅ |
| Com máscara | `773.251.218-90` | ✅ | ✅ |
| Menos de 11 dígitos (preenchido com zeros) | `353` | ✅ | ✅ |
| Caracteres não numéricos | `texto77325121890` | ✅¹ | ❌ |

¹ O `cpfValidator` mantém o comportamento histórico de remover caracteres não numéricos antes de validar. O `documentValidator` é mais rígido: no caminho de CPF aceita somente dígitos, pontos e hífens. Mais de 11 dígitos é rejeitado por ambas.

### CNPJ

| Formato | Exemplo |
| --- | --- |
| Sem máscara | `12ABC34501DE35` |
| Com máscara | `12.ABC.345/01DE-35` |

Regras do CNPJ:

- A base aceita letras ASCII `A–Z` e dígitos em qualquer posição; minúsculas são normalizadas.
- Os dois dígitos verificadores (finais) são sempre numéricos.
- Máscara incompleta, separadores em posições incorretas, espaços, tabs, quebras de linha e caracteres não ASCII tornam o documento inválido.
- Zeros à esquerda são preservados; a biblioteca nunca completa um CNPJ com zeros.
- As dez sequências numéricas repetidas (`00000000000000` … `99999999999999`) são rejeitadas.

## CNPJ alfanumérico

A partir de julho de 2026, a Receita Federal atribui o CNPJ alfanumérico a novas inscrições; os CNPJs já existentes não mudam. O cálculo dos dígitos verificadores continua em módulo 11, com os mesmos pesos do CNPJ numérico — a diferença é o valor de cada caractere da base: **código ASCII − 48** (`A` = 17, `Z` = 42).

Referências oficiais:

- [CNPJ Alfanumérico — Receita Federal](https://www.gov.br/receitafederal/pt-br/acesso-a-informacao/acoes-e-programas/programas-e-atividades/cnpj-alfanumerico)
- [Manual de Cálculo do DV do CNPJ (PDF) — Receita Federal](https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/documentos-tecnicos/cnpj/manual-dv-cnpj.pdf/view)

## Limites da validação

A biblioteca confere apenas **formato e dígitos verificadores**. Um documento válido matematicamente pode não existir, pertencer a outra pessoa ou estar cancelado/baixado. Para consulta de situação cadastral, use os serviços oficiais da Receita Federal.

## Desenvolvimento

```sh
git clone https://github.com/egermano/brazilian-multidocument-validator.git
cd brazilian-multidocument-validator
npm ci        # instala dependências e compila (script prepare)

npm test                    # testes rápidos
npm run test:coverage       # testes com cobertura
npm run test:package        # instala o tarball em diretório limpo e valida ESM + tipos
npm run benchmark           # mediana de tempo por cenário (veja scripts/benchmark.mjs)
npm run lint
npm run build
```

## Contribuição

Issues e pull requests são bem-vindos em [egermano/brazilian-multidocument-validator](https://github.com/egermano/brazilian-multidocument-validator). Alterações de comportamento devem vir acompanhadas de testes.

### Processo de release (automatizado)

A publicação é acionada a partir do merge em `master` — não há publicação manual:

```text
merge em master
  └─ release-please abre a PR de release
       (bump de versão no package.json + package-lock.json,
        CHANGELOG.md atualizado com os commits desde a última tag)
  └─ aprovar/mergar a PR de release
       └─ tag vX.Y.Z + Release criadas no GitHub
            └─ workflow Publish dispara automaticamente:
                 lint + testes + teste de pacote
                 npm publish (com provenance)
                 tarball anexado à Release do repositório
```

Regras do fluxo:

- **Commits semânticos definem a versão.** `feat:` bumpa minor, `fix:` patch,
  `feat!:`/`BREAKING CHANGE:` major, qualquer outra coisa não gera release.
  Título da PR mergeada também é usado (ex.: `feat!: suporte a CNPJ alfanumérico`).
- **Secret `NPM_TOKEN`** (token npm do tipo *Automation*) é necessário em
  *Settings → Secrets and variables → Actions* para o publish funcionar.
- A seção `[Unreleased]` do `CHANGELOG.md` não é movida automaticamente — se
  houver anotações manuais lá, mova-as para a seção da nova versão dentro da
  PR de release antes do merge.

## Licença

[Apache-2.0](LICENSE)
