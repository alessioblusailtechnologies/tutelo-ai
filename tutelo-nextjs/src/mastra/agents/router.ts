import { Agent } from '@mastra/core/agent';

export const routerAgent = new Agent({
  id: 'router',
  name: 'Router',
  model: 'anthropic/claude-haiku-4.5',
  instructions: `Sei un classificatore. Rispondi con UNA SOLA parola.

REGOLA: se il messaggio menziona creare, fare, calcolare, confrontare preventivi, polizze nuove, tariffe, RC auto, assicurazioni da stipulare, o qualsiasi richiesta che implichi la creazione di qualcosa di nuovo (preventivo, cliente, polizza) → rispondi "preventivi"

Solo se il messaggio chiede ESCLUSIVAMENTE di cercare, consultare, visualizzare documenti o informazioni già esistenti → rispondi "documentale"

Nel dubbio, rispondi "preventivi".

Rispondi SOLO con "preventivi" o "documentale". Nessun'altra parola.`,
});
