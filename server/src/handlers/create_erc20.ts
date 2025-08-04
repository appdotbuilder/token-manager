
import { db } from '../db';
import { contractsTable, erc20PropertiesTable } from '../db/schema';
import { type CreateERC20Input, type ContractWithProperties } from '../schema';

export async function createERC20(input: CreateERC20Input): Promise<ContractWithProperties> {
  try {
    // Insert contract record with ERC20 type
    const contractResult = await db.insert(contractsTable)
      .values({
        name: input.name,
        symbol: input.symbol,
        contract_type: 'ERC20'
      })
      .returning()
      .execute();

    const contract = contractResult[0];

    // Insert ERC20 properties record
    const erc20Result = await db.insert(erc20PropertiesTable)
      .values({
        contract_id: contract.id,
        total_supply: input.total_supply,
        decimals: input.decimals
      })
      .returning()
      .execute();

    const erc20Properties = erc20Result[0];

    // Return combined contract with properties
    return {
      id: contract.id,
      name: contract.name,
      symbol: contract.symbol,
      contract_type: contract.contract_type,
      created_at: contract.created_at,
      updated_at: contract.updated_at,
      erc20_properties: {
        id: erc20Properties.id,
        contract_id: erc20Properties.contract_id,
        total_supply: erc20Properties.total_supply,
        decimals: erc20Properties.decimals,
        created_at: erc20Properties.created_at,
        updated_at: erc20Properties.updated_at
      },
      nft_properties: null
    };
  } catch (error) {
    console.error('ERC20 contract creation failed:', error);
    throw error;
  }
}
