
import { db } from '../db';
import { contractsTable, erc20PropertiesTable, nftPropertiesTable } from '../db/schema';
import { type GetContractInput, type ContractWithProperties } from '../schema';
import { eq } from 'drizzle-orm';

export async function getContract(input: GetContractInput): Promise<ContractWithProperties | null> {
  try {
    // Query contract with left joins to get associated properties
    const results = await db.select()
      .from(contractsTable)
      .leftJoin(erc20PropertiesTable, eq(contractsTable.id, erc20PropertiesTable.contract_id))
      .leftJoin(nftPropertiesTable, eq(contractsTable.id, nftPropertiesTable.contract_id))
      .where(eq(contractsTable.id, input.id))
      .execute();

    // Return null if no contract found
    if (results.length === 0) {
      return null;
    }

    const result = results[0];
    
    // Build the response object with contract data and associated properties
    return {
      id: result.contracts.id,
      name: result.contracts.name,
      symbol: result.contracts.symbol,
      contract_type: result.contracts.contract_type,
      created_at: result.contracts.created_at,
      updated_at: result.contracts.updated_at,
      erc20_properties: result.erc20_properties ? {
        id: result.erc20_properties.id,
        contract_id: result.erc20_properties.contract_id,
        total_supply: result.erc20_properties.total_supply,
        decimals: result.erc20_properties.decimals,
        created_at: result.erc20_properties.created_at,
        updated_at: result.erc20_properties.updated_at
      } : null,
      nft_properties: result.nft_properties ? {
        id: result.nft_properties.id,
        contract_id: result.nft_properties.contract_id,
        base_uri: result.nft_properties.base_uri,
        maximum_supply: result.nft_properties.maximum_supply,
        created_at: result.nft_properties.created_at,
        updated_at: result.nft_properties.updated_at
      } : null
    };
  } catch (error) {
    console.error('Get contract failed:', error);
    throw error;
  }
}
