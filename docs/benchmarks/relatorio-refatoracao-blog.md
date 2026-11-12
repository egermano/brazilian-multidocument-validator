# Relatório técnico — Refatoração e otimização do br-doc-validator

> Documento de referência para a escrita de um blog post. Inclui contexto,
> metodologia de teste e benchmark, resultados e cálculo das melhorias.
> Dados coletados em 12/11/2026 na branch `feat/alphanumeric-cnpj`.

## 1. Contexto

O [br-doc-validator](https://github.com/egermano/brazilian-multidocument-validator)
é uma biblioteca Node.js/TypeScript para validação de CPF e CNPJ. Em novembro de
2026 recebeu suporte ao novo **CNPJ alfanumérico** da Receita Federal (vigente a
partir de julho de 2026 para novas inscrições).

Após a entrega da feature, uma revisão completa do projeto apontou oportunidades
em três eixos, priorizadas nesta ordem:

1. **Correção de comportamento** — um bug real de validação.
2. **Redução de complexidade** — código legado de difícil leitura.
3. **Performance** — trabalho redundante no caminho crítico.

O diferencial desta refatoração: cada mudança de comportamento foi guiada por
testes (TDD) e cada alegação de performance foi **medida, não presumida** — com
baseline capturado antes de tocar no código.

## 2. O que foi implementado

### 2.1 Correção: CPF com dígitos excedentes

**Bug encontrado (reproduzido executando o código):**

```ts
cpfValidator("77325121890123"); // retornava true (!)
```

A implementação antiga extraía os caracteres numéricos, ignorava qualquer
excedente e validava apenas os 11 primeiros dígitos. Uma string de 14 dígitos
cujo prefixo é um CPF válido passava como CPF.

**Correção:** rejeitar entradas com mais de 11 dígitos após a limpeza.

```ts
if (cpf.length > 11) {
  return false;
}
```

Processo TDD: primeiro o teste de regressão (vermelho), depois a menor mudança
possível para verde — sem tocar em mais nada.

### 2.2 Redução de complexidade

A função de CPF antiga usava variáveis chamadas `a`, `b`, `c`, `x`, `y`,
reescrevia um array durante o cálculo e mantinha um boolean intermediário
desnecessário. A de CNPJ fazia até quatro varreduras/normalizações da mesma
string por chamada.

A refatoração consolidou o módulo em torno de três decisões de design:

1. **Checar comprimento antes de qualquer processamento.** Entrada de CNPJ só
   pode ter 14 (sem máscara) ou 18 caracteres (com máscara). Uma string de
   100 mil caracteres é rejeitada em teste O(1) — sem regex, sem cópias.
2. **Normalizar uma vez.** No fluxo antigo, `documentValidator` convertia
   caixa, testava formato e chamava `cnpjValidator`, que repetia tudo. Agora a
   normalização ocorre uma única vez e o resultado atravessa o fluxo.
3. **Um laço, dois somatórios.** Os dígitos verificadores de CPF e CNPJ são
   calculados em módulo 11 com dois pesos deslocados. Em vez de dois laços
   (ou `Array.from().reduce()` duplo, que aloca um array intermediário), um
   único `for` acumula as duas somas; o primeiro DV alimenta o segundo com
   `dv1 * 2`.

Nomes legíveis (`firstSum`, `secondDigit`, `verifierDigit`) substituíram as
variáveis de letra única, e o cálculo usa `charCodeAt(i) - 48` em vez de
`parseInt(charAt(i))`, evitando conversão string→número do motor JS.

Deliberadamente **não** foi criada uma abstração genérica de "documento" para
duas funções pequenas — complexidade de design também é custo.

### 2.3 Contratos preservados (compatibilidade)

A refatoração manteve comportamentos legados cobertos por testes, incluindo o
preenchimento de CPF curto com zeros (`"353"` → válido) e a diferença
histórica entre `cpfValidator` (remove caracteres não numéricos) e
`documentValidator` (mais rígido). Essas diferenças estão agora documentadas no
README e no CHANGELOG, com tabela de formatos aceitos.

### 2.4 Melhorias de pacote e CI (fora do hot path, mas medidas de qualidade)

- TypeScript removido de `peerDependencies` — a biblioteca publica JS compilado
  e declarações de tipos; o compilador não precisa ser instalado pelo
  consumidor.
- `npm run test:package` — empacota com `npm pack`, instala o tarball em
  diretório temporário limpo e valida: import ESM em JS puro, tipos com
  `tsc --strict` (incluindo `@ts-expect-error` para assinaturas) e ausência
  do TypeScript nas dependências do consumidor.
- CI: `pull_request`, cache de npm, actions atualizadas, Node 18/20/22/24,
  build duplicado removido (o script `prepare` do `npm ci` já compila).
- Cobertura deixou de rodar por padrão (usar `npm run test:coverage`),
  acelerando o feedback loop de `npm test`.

## 3. Como foi testado

Estratégia em três camadas:

1. **Testes de comportamento (Jest, 109 testes, cobertura 100%)** — todos os
   exports públicos (`documentValidator`, `cpfValidator`, `cnpjValidator`)
   testados diretamente, organizados por grupo: CPF, CNPJ, identificação
   automática. Incluem fixtures oficiais do manual da Receita (exemplo
   `12.ABC.345/01DE-35`), casos-limite do módulo 11 (restos 0 e 1 em ambas as
   etapas), Unicode (ex.: `ſ` não pode virar `S`), entradas de 100 mil
   caracteres e todas as regressões anteriores.
2. **Teste do pacote publicado** — valida o artefato real do npm, não o
   código-fonte: um consumidor JavaScript e um TypeScript conseguem usar o
   pacote instalado.
3. **Benchmark comparativo** — descrito abaixo.

O bug do CPF excedente seguiu TDD estrito: teste novo → falha confirmada pelo
motivo esperado → correção mínima → verde. As demais refatorações foram feitas
com os testes verdes o tempo todo (testes de caracterização protegendo o
comportamento antes de mudar a implementação).

## 4. Como o benchmark foi calculado

### 4.1 Captura do baseline (antes de qualquer mudança)

Antes de refatorar, o build da versão antiga foi compilado e salvo em arquivo
externo:

```sh
npm run build
cp bin/multidocument_validator.js /tmp/opencode/cnpj-before-improvements.mjs
```

Isso garante que **antes e depois rodam no mesmo processo, mesma máquina, mesmo
Node**, como módulos independentes — eliminando variação entre ambientes.

### 4.2 Metodologia

O script (`scripts/benchmark.mjs`, reproduzível com `npm run benchmark`):

- **Aquecimento:** uma rodada completa descartada antes de medir, para o JIT
  estabilizar e evitar medir compilação.
- **Amostragem:** 7 rodadas por cenário; reportada a **mediana** (4º valor),
  robusta contra outliers de GC e ruído do sistema.
- **Iterações:** 100.000 chamadas por rodada nos cenários normais; 1.000 nas
  entradas de 100 mil caracteres. O tempo reportado é `ns por chamada`
  (nanossegundos, 10⁻⁹ s).
- **Checksum:** o resultado de cada chamada é acumulado e impresso. Antes e
  depois produziram checksum idêntico (`3.200.000`) — provando que as duas
  versões retornam os mesmos valores nos cenários medidos (a comparação de
  performance não esconde mudança de comportamento).
- **Cenários:** entradas válidas (CPF e CNPJ, com e sem máscara), dígitos
  verificadores inválidos, formato inválido e entradas longas.

### 4.3 Ambiente

| Item | Valor |
| --- | --- |
| Node | v24.16.0 |
| Plataforma | Linux x64 |
| CPU | Intel Core Ultra 7 165U |

### 4.4 Fórmula de melhoria

Variação percentual por cenário:

```
melhoria = (1 - depois / antes) × 100
```

Exemplo com o CNPJ válido: `1 - 204/1384 = 0,8526` → **−85%** de tempo.

## 5. Resultados

| Cenário | Antes (ns/chamada) | Depois | Melhoria |
| --- | ---: | ---: | ---: |
| `cpfValidator` — CPF válido | 329 | 277 | −16% |
| `documentValidator` — CPF válido | 489 | 217 | −56% |
| `cnpjValidator` — CNPJ válido | 1.384 | 204 | **−85%** |
| `documentValidator` — CNPJ válido | 1.340 | 358 | −73% |
| `cnpjValidator` — DV inválido | 693 | 134 | −81% |
| `documentValidator` — formato inválido | 103 | 49 | −52% |
| `cnpjValidator` — entrada de 100 mil chars | 122.866 | 6 | −99,99% |
| `documentValidator` — entrada de 100 mil chars | 9.480 | 18 | −99,8% |

### Por que cada ganho aconteceu

- **CNPJ −85%:** a versão antiga convertia caixa, removia máscara e testava
  até três regexps sobre a string, alocando cópias intermediárias, antes de
  dois `reduce` com array temporário. A nova verifica comprimento (O(1)) e faz
  um único laço sobre os 14 caracteres.
- **Entrada longa −99,99%:** o caso mais dramático. A antiga aplicava
  `toUpperCase()` + `.replace()` (cópia de 100 KB) antes de qualquer rejeição;
  a nova rejeita pelo `length` sem tocar no conteúdo. Relevância prática:
  impedir que input malicioso ou acidental (ex.: um arquivo colado num campo
  de formulário) consuma CPU e memória em validação.
- **`documentValidator` −56/−73%:** deixou de reprocessar o que o validador
  específico refaria (normalização duplicada).
- **CPF −16%:** menor ganho — a função antiga já era razoável; a melhoria vem
  do laço único e de `charCodeAt` no lugar de `parseInt`.

### Ressalvas honestas (sugerido manter no post)

- Medição em uma máquina, single-run por leitor; rodar `npm run benchmark`
  para números próprios.
- Em ns/chamada, a diferença absoluta diária é pequena — o valor real aparece
  em volume (lotes, ETL, upload de planilhas) e na resistência a inputs
  patológicos.
- O checksum igual demonstra equivalência nos cenários medidos; a mudança de
  comportamento intencional (rejeição de dígitos excedentes e de caracteres
  não numéricos no caminho de CPF do `documentValidator`) está coberta por
  testes e documentada no CHANGELOG.

## 6. Números para o título do post (sugestões)

- "Uma biblioteca de validação de documentos 85% mais rápida — e como medimos isso"
- "De 122 µs para 6 ns: o custo invisível de normalizar strings antes de validá-las"
- "TDD, benchmark e o novo CNPJ alfanumérico: uma refatoração com prova"

## 7. Arquivos de referência

| Arquivo | Conteúdo |
| --- | --- |
| `docs/specs/melhorias-da-biblioteca.md` | Spec aprovada que guiou o trabalho |
| `scripts/benchmark.mjs` | Script de benchmark reproduzível |
| `docs/benchmarks/2026-11-refatoracao.md` | Dados brutos do benchmark |
| `CHANGELOG.md` | Mudanças incl. incompatíveis, por versão |
| `src/multidocument_validator.spec.ts` | 109 testes de comportamento |
| `scripts/check-package.mjs` | Teste do tarball publicado |
