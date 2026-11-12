# Benchmark — antes e depois das melhorias

Ambiente: Node v24.16.0, Linux x64, Intel Core Ultra 7 165U. Mediana de 7
amostras por cenário após aquecimento; cada amostra executa o cenário 100.000
vezes (1.000 nos cenários de entrada longa). Executar com `npm run benchmark`.

| Cenário | Antes (ns/chamada) | Depois | Variação |
| --- | ---: | ---: | ---: |
| `cpfValidator` — CPF válido | 329 | 277 | −16% |
| `documentValidator` — CPF válido | 489 | 217 | −56% |
| `cnpjValidator` — CNPJ válido | 1.384 | 204 | −85% |
| `documentValidator` — CNPJ válido | 1.340 | 358 | −73% |
| `cnpjValidator` — DV inválido | 693 | 134 | −81% |
| `documentValidator` — formato inválido | 103 | 49 | −52% |
| `cnpjValidator` — entrada de 100 mil chars | 122.866 | 6 | −99,99% |
| `documentValidator` — entrada de 100 mil chars | 9.480 | 18 | −99,8% |

Motivos principais: verificação de comprimento antes de qualquer normalização
(elimina varrer strings longas inválidas), normalização única por chamada
(`documentValidator` não refaz o trabalho do validador específico) e laço único
computando os dois somatórios de uma vez. Valores medidos em uma máquina;
executar `npm run benchmark` no seu ambiente para números próprios.
