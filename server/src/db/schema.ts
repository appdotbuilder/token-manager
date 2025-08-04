
import { serial, text, pgTable, timestamp, integer, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Contract type enum
export const contractTypeEnum = pgEnum('contract_type', ['ERC20', 'NFT']);

// Main contracts table
export const contractsTable = pgTable('contracts', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  symbol: text('symbol').notNull(),
  contract_type: contractTypeEnum('contract_type').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// ERC20 specific properties table
export const erc20PropertiesTable = pgTable('erc20_properties', {
  id: serial('id').primaryKey(),
  contract_id: integer('contract_id').references(() => contractsTable.id).notNull(),
  total_supply: text('total_supply').notNull(), // Using text for large numbers
  decimals: integer('decimals').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// NFT specific properties table
export const nftPropertiesTable = pgTable('nft_properties', {
  id: serial('id').primaryKey(),
  contract_id: integer('contract_id').references(() => contractsTable.id).notNull(),
  base_uri: text('base_uri').notNull(),
  maximum_supply: text('maximum_supply'), // Nullable for unlimited supply, text for large numbers
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Relations
export const contractsRelations = relations(contractsTable, ({ one }) => ({
  erc20_properties: one(erc20PropertiesTable, {
    fields: [contractsTable.id],
    references: [erc20PropertiesTable.contract_id]
  }),
  nft_properties: one(nftPropertiesTable, {
    fields: [contractsTable.id],
    references: [nftPropertiesTable.contract_id]
  })
}));

export const erc20PropertiesRelations = relations(erc20PropertiesTable, ({ one }) => ({
  contract: one(contractsTable, {
    fields: [erc20PropertiesTable.contract_id],
    references: [contractsTable.id]
  })
}));

export const nftPropertiesRelations = relations(nftPropertiesTable, ({ one }) => ({
  contract: one(contractsTable, {
    fields: [nftPropertiesTable.contract_id],
    references: [contractsTable.id]
  })
}));

// TypeScript types for the table schemas
export type Contract = typeof contractsTable.$inferSelect;
export type NewContract = typeof contractsTable.$inferInsert;
export type ERC20Properties = typeof erc20PropertiesTable.$inferSelect;
export type NewERC20Properties = typeof erc20PropertiesTable.$inferInsert;
export type NFTProperties = typeof nftPropertiesTable.$inferSelect;
export type NewNFTProperties = typeof nftPropertiesTable.$inferInsert;

// Export all tables and relations for proper query building
export const tables = { 
  contracts: contractsTable,
  erc20Properties: erc20PropertiesTable,
  nftProperties: nftPropertiesTable
};
