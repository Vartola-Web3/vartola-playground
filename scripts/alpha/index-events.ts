import { prisma } from '../../lib/db';
import { indexSorobanEvents } from '../../lib/stellar/indexer';
import { getIndexerState, indexerHealth } from '../../lib/alpha/ops-state';

indexSorobanEvents()
  .then(async (result) => {
    const state = await getIndexerState();
    console.log(JSON.stringify({ ...result, health: indexerHealth(state), state }, null, 2));
  })
  .catch((error) => { console.error(error instanceof Error ? error.message : error); process.exit(1); })
  .finally(() => prisma.$disconnect());
