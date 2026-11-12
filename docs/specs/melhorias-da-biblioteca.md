# Spec: qualidade, performance e documentação

## Objetivo

Simplificar a biblioteca `br-doc-validator`, corrigir a validação de CPF com
dígitos excedentes e melhorar a experiência de brasileiros e de desenvolvedores
que criam software para o Brasil. Preservar os exports e o suporte a CNPJ
alfanumérico implementado na branch `feat/alphanumeric-cnpj`.

## Contratos de entrada

- Todas as funções recebem `string` e retornam `boolean`. Tipos diferentes não
  fazem parte da API TypeScript; não adicionar coerção implícita.
- `cpfValidator`: preservar a remoção de caracteres não numéricos e o
  preenchimento com zeros à esquerda para entradas curtas. Rejeitar mais de 11
  dígitos; nunca ignorar os dígitos excedentes.
- `cnpjValidator`: aceitar 14 caracteres sem máscara ou a máscara exata
  `XX.XXX.XXX/XXXX-DD`, com base ASCII alfanumérica e dois DVs numéricos.
  Aceitar minúsculas; rejeitar Unicode, espaços, separadores extras e tamanhos
  incorretos. Não completar zeros.
- `documentValidator`: encaminhar CNPJ sem perder a entrada original. No caminho
  de CPF, aceitar somente dígitos, pontos e hífens, preservando o preenchimento
  legado. Não transformar texto ou CNPJ malformado em CPF.
- Manter a rejeição de sequências numéricas repetidas.
- A validação é matemática; não consulta nem comprova cadastro na Receita.

Tornar a máscara de CPF estrita é uma mudança de contrato futura, fora desta
entrega. A diferença entre o CPF específico e o validador automático será
documentada e testada.

## Implementação

1. Adicionar teste de regressão para CPF excedente, observar RED e fazer a menor
   correção até GREEN.
2. Cobrir os contratos diretamente pelos exports públicos e organizar testes em
   grupos de CPF, CNPJ e identificação automática. Reaproveitar as fixtures
   existentes; incluir as selecionadas da referência local.
3. Refatorar somente com testes verdes: normalizar uma vez por chamada, usar
   nomes claros e helpers privados específicos. Validar tamanho/formato antes
   de converter a caixa ou calcular DVs do CNPJ. Eliminar arrays temporários
   desnecessários no cálculo, sem criar uma hierarquia genérica de documentos.
4. Criar benchmark reproduzível por API/categoria, com aquecimento, várias
   amostras e mediana. Comparar a implementação anterior com a nova no mesmo
   ambiente, incluindo entradas válidas, inválidas e longas. Não executar o
   benchmark com cobertura nem usar limites de tempo como testes de CI.
5. Retirar TypeScript de `peerDependencies`, mantendo-o em desenvolvimento;
   sincronizar o lockfile e a declaração Node >=18.
6. Manter `prepare` para gerar os artefatos; evitar build duplicado na CI.
   Separar testes rápidos de cobertura. Adicionar teste do tarball, verificando
   importação ESM e consumo das declarações de tipos fora da árvore do projeto.
7. Atualizar checkout/setup-node, usar cache npm e evento `pull_request`.
   Preservar testes de Node 18/20 e acrescentar versões LTS mais novas.
8. Escrever README em português com exemplos JS, API completa, tabela de
   contratos, compatibilidade ESM/Node/TypeScript e referência oficial.
   Adicionar contribuição e changelog das mudanças ainda não publicadas.
9. Remover configuração obsoleta sem efeito e excluir artefatos gerados do lint.

## Critérios de aceitação

- CPF com 12 ou mais dígitos retorna `false` pelo export específico.
- As fixtures de CPF curto, CPF formatado e CNPJ numérico/alfanumérico mantêm
  seus resultados; cada export tem testes próprios.
- Entradas CNPJ inválidas não lançam exceções nem passam após sanitização.
- Instalação do pacote publicado não exige o compilador TypeScript.
- O tarball contém JavaScript e declarações utilizáveis; um consumidor JS e um
  consumidor TypeScript conseguem importar os três exports.
- `npm test -- --runInBand`, cobertura, lint, build e teste do pacote passam.
- O relatório de benchmark registra ambiente e medianas por cenário; ganhos e
  regressões são apresentados sem extrapolar para todos os ambientes.
- README, contribuição e changelog refletem o comportamento real.

## Verificação e entrega

Trabalhar na branch atual sem descartar as alterações anteriores. Usar ciclos
TDD para correções de comportamento, e testes de caracterização antes de
refatorar. Não publicar pacote nem criar commit automaticamente.
