# Revisão do Sistema do Meu Colega

**Aluno:** Jailson Soares da Silva Junior
**Repositório:** https://github.com/Jailsonsdsj/agent-experiment

---

## O sistema está funcionando com as funcionalidades solicitadas?

Sim, o sistema de Jailson funciona bem. As funcionalidades foram devidamente implementadas. O sistema contempla gestão de provas, geração de PDFs de questões e de gabarito conforme a versão da prova, também está previsto o gerenciamento de questões e correção de provas. Sobre esse ponto, as funcionalidades está clara. Ficou ótimo.

---

## Quais os problemas de qualidade do código e dos testes?

O código está bem dividido. O projeto foi dividido em duas partes, backend e frontend. O frontend está claro e bem legível, mostra que o agente e o aluno soube administrar bem a geração de código. Sobre o backend, eu senti falta de uma arquitetura. O projeto está funcional mas está um pouco acoplado e algumas funções estão com a legibilidade comprometida devido o tamanho e uso de variáveis com caracteres.

---

## Como a funcionalidade e a qualidade desse sistema pode ser comparada com as do seu sistema?

Backend é completamente stateless, o armazenamento está sendo feito no localStorage. Não foi pedido no documento sobre o armazenamento, mas seria interessante coletar os dados e alocar no banco de dados. As apis não possuem autenticação, o que compromete a funcionalidade se precisar de rastreabilidade. Ele também não contempla o gerenciamento de um usuário autenticado para alocar a quem pertence as questões geradas, há também uma lacuna após a validação das questões pois se houver a necessidade de entender as notas sobre os alunos, não há possibilidade de consumo dessas informações armazenadas.

---

## Estratégias de interação utilizada

Sobre a concepção do projeto, acho que poderia ter adicionado as ferramentas no claude.md e evitaria de intervenção do operador (usuário) adicionar manualmente o que quer usar e o que não quer usar. Evita o consumo de token desnecessário caso ele tenha instalado mal. Eu acho interessante criar primeiro o claude para dar um macro do projeto antes de iniciar de fato o desenvolvimento, assim o desenvolvedor vai ter noção do que vai ser implementado no sistema, evitando o "go horse". O desenvolvimento com agentes exige um planejamento prévio das atividades para não precisar ter o retrabalho, pois cada token é importante, se o desenvolvedor usa mal, ele fica sem token e não consegue trabalhar.

---

## Situações em que o agente funcionou melhor ou pior

O agente apresentou melhor desempenho em situações nas quais as tarefas estavam bem definidas e havia contexto suficiente nos prompts. Ele se mostrou eficiente em prompts contínuos ou trabalhar com estruturas já estabelecidas, conseguindo inclusive identificar e corrigir problemas simples automaticamente. Além disso, cenários com menor necessidade de intervenção manual, como ações auto-geradas, contribuíram para respostas mais rápidas e precisas.

Por outro lado, o desempenho foi inferior em situações com falta de contexto ou prompts ambíguos, o que levou a interpretações incorretas ou inconsistentes. Outra contribuição foi pelos dados de entrada mal formatados durante a interação entre contextos, ou até mesmo na ausência de especificações claras sobre os requisitos.

---

## Tipos de problemas observados

Os principais problemas foram código errado ou incompleto, geralmente quando o prompt não estava claro ou faltava contexto. Em alguns casos, o agente não entendeu bem o que era esperado e acabou gerando soluções com erros ou inconsistências.

Também houve dificuldades quando os dados de entrada estavam mal organizados ou quando o contexto da conversa se perdia. Isso fez com que algumas respostas ficassem desconectadas ou menos precisas do que o esperado.

---

## Avaliação geral da utilidade do agente no desenvolvimento

O aluno usou bem o agente. Conseguiu desenvolver a funcionalidade e coloca-la no ar, mostra que ele entendeu bem a atividade e conseguiu desenvolver com o uso de IA agents. Há alguns micro problemas, mas não impacta em nada, até porque o melhor código é aquele que atende o seu objetivo, sendo este o caso.

---

## Comparação com a sua experiência de uso do agente

Eu talvez delegaria algumas coisas a mais para ele. Principalmente na concepção do projeto, que é uma etapa crucial. Com base em skills, qualquer agente vai se sair melhor do que um humano para entender do que o sistema precisa, do que uma infra precisa, salvo as exceções se o usuário operador for um engenheiro de software especialista. Dito isso, o uso da IA foi bem feito, mas eu faria diferente. Talvez buscaria recursos diferentes, o sonnet é bom pra programar, mas talvez uma elicitação de requisitos poderia ter sido feita por outra LLM, ou a arquitetura estrutural.
