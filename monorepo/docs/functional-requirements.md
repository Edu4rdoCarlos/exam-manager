# Requisitos Funcionais — Exam Manager

## RF-AUTH — Autenticação

| ID | Requisito |
|---|---|
| RF-AUTH-01 | O sistema deve permitir que um usuário autenticado faça login com e-mail e senha, recebendo um JWT de acesso. |
| RF-AUTH-02 | O sistema deve rejeitar credenciais inválidas com erro genérico (não deve distinguir se o e-mail ou a senha está errado). |

---

## RF-USR — Usuários (Professores)

| ID | Requisito |
|---|---|
| RF-USR-01 | O sistema deve permitir o cadastro de um usuário com nome, e-mail e senha. |
| RF-USR-02 | O sistema deve impedir o cadastro de dois usuários com o mesmo e-mail. |
| RF-USR-03 | O sistema deve permitir a consulta de um usuário pelo seu ID. |

---

## RF-STD — Alunos

| ID | Requisito |
|---|---|
| RF-STD-01 | O sistema deve permitir o cadastro de um aluno com nome e CPF. |
| RF-STD-02 | O sistema deve impedir o cadastro de dois alunos com o mesmo CPF. |
| RF-STD-03 | O sistema deve permitir a consulta de um aluno pelo seu ID. |

---

## RF-QST — Questões

| ID | Requisito |
|---|---|
| RF-QST-01 | O sistema deve permitir a criação de uma questão com enunciado e uma lista de alternativas. |
| RF-QST-02 | Cada alternativa deve indicar se é a correta (`isCorrect`). |
| RF-QST-03 | O sistema deve permitir a consulta de uma questão pelo seu ID, retornando enunciado e alternativas. |
| RF-QST-04 | O sistema deve permitir a listagem de todas as questões cadastradas. |

---

## RF-EXM — Provas

| ID | Requisito |
|---|---|
| RF-EXM-01 | O sistema deve permitir que um professor crie uma prova com título, disciplina, data e formato de resposta (`letters` ou `powers_of_two`). |
| RF-EXM-02 | O sistema deve permitir a associação de questões a uma prova, cada uma com uma posição ordinal. |
| RF-EXM-03 | O sistema deve permitir a consulta de uma prova pelo seu ID. |

---

## RF-VER — Versões de Prova

| ID | Requisito |
|---|---|
| RF-VER-01 | O sistema deve permitir a criação de versões de uma prova. Cada versão reordena as questões e embaralha as alternativas. |
| RF-VER-02 | Cada alternativa em uma versão recebe um rótulo (`label`) que pode ser uma letra (`A`, `B`, `C`…) ou uma potência de dois (`1`, `2`, `4`…), conforme o formato de resposta da prova. |
| RF-VER-03 | O sistema deve permitir a consulta de uma versão pelo seu ID, retornando questões e alternativas na ordem da versão. |
| RF-VER-04 | O sistema deve permitir a listagem de todas as versões de uma prova. |

---

## RF-GAB — Gabarito

| ID | Requisito |
|---|---|
| RF-GAB-01 | O sistema deve permitir o cadastro do gabarito de uma versão, associando cada questão da versão à resposta correta esperada. |
| RF-GAB-02 | O sistema deve permitir a consulta do gabarito de uma versão pelo ID da versão. |

---

## RF-RSP — Respostas dos Alunos

| ID | Requisito |
|---|---|
| RF-RSP-01 | O sistema deve permitir o registro das respostas de um aluno para uma versão de prova, uma resposta por questão. |
| RF-RSP-02 | A resposta é um valor textual livre que representa as letras marcadas ou a soma informada pelo aluno. |

---

## RF-COR — Correção

| ID | Requisito |
|---|---|
| RF-COR-01 | O sistema deve permitir a criação de uma correção para uma prova, com modo `strict` ou `lenient`. |
| RF-COR-02 | No modo `strict`, a resposta do aluno deve ser exatamente igual ao gabarito para ser considerada correta. |
| RF-COR-03 | No modo `lenient`, respostas parcialmente corretas (subconjunto válido das alternativas marcadas) são aceitas. |
| RF-COR-04 | O sistema deve calcular e persistir a nota de cada aluno ao aplicar uma correção. |

---

## RF-NOT — Notas

| ID | Requisito |
|---|---|
| RF-NOT-01 | O sistema deve permitir a consulta das notas de todos os alunos de uma versão de prova. |
| RF-NOT-02 | O sistema deve associar cada nota a uma correção específica, permitindo que a mesma prova tenha correções em modos diferentes. |

---

## Observações Transversais

- Todas as rotas que manipulam dados de prova, questão e correção devem exigir autenticação (JWT).
- IDs são UUIDs gerados pelo sistema — nunca fornecidos pelo cliente.
- O formato de resposta (`letters` / `powers_of_two`) definido na prova determina os rótulos gerados em todas as versões.
