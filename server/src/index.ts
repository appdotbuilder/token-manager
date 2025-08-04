
import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import {
  createERC20InputSchema,
  createNFTInputSchema,
  updateERC20InputSchema,
  updateNFTInputSchema,
  getContractInputSchema
} from './schema';

// Import handlers
import { createERC20 } from './handlers/create_erc20';
import { createNFT } from './handlers/create_nft';
import { getContracts } from './handlers/get_contracts';
import { getContract } from './handlers/get_contract';
import { updateERC20 } from './handlers/update_erc20';
import { updateNFT } from './handlers/update_nft';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // ERC20 operations
  createERC20: publicProcedure
    .input(createERC20InputSchema)
    .mutation(({ input }) => createERC20(input)),
  
  updateERC20: publicProcedure
    .input(updateERC20InputSchema)
    .mutation(({ input }) => updateERC20(input)),
  
  // NFT operations
  createNFT: publicProcedure
    .input(createNFTInputSchema)
    .mutation(({ input }) => createNFT(input)),
  
  updateNFT: publicProcedure
    .input(updateNFTInputSchema)
    .mutation(({ input }) => updateNFT(input)),
  
  // Contract retrieval operations
  getContracts: publicProcedure
    .query(() => getContracts()),
  
  getContract: publicProcedure
    .input(getContractInputSchema)
    .query(({ input }) => getContract(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();
