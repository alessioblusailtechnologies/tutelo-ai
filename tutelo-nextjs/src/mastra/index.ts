import { Mastra } from '@mastra/core';
import { routerAgent } from './agents/router';
import { preventiviAgent } from './agents/preventivi';
import { documentaleAgent } from './agents/documentale';
import { titlerAgent } from './agents/titler';
import { vistaBuilderAgent } from './agents/vista-builder';

export const mastra = new Mastra({
  agents: {
    router: routerAgent,
    preventivi: preventiviAgent,
    documentale: documentaleAgent,
    titler: titlerAgent,
    vistaBuilder: vistaBuilderAgent,
  },
});
