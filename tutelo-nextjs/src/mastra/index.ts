import { Mastra } from '@mastra/core';
import { routerAgent } from './agents/router';
import { preventiviAgent } from './agents/preventivi';
import { documentaleAgent } from './agents/documentale';

export const mastra = new Mastra({
  agents: {
    router: routerAgent,
    preventivi: preventiviAgent,
    documentale: documentaleAgent,
  },
});
