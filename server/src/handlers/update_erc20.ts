
import { db } from '../db';
import { contractsTable, erc20PropertiesTable } from '../db/schema';
import { type UpdateERC20Input, type ContractWithProperties } from '../schema';
import { eq, and } from 'drizzle-orm';

export async function updateERC20(input: UpdateERC20Input): Promise<ContractWithProperties> {
  try {
    // First, verify the contract exists and is ERC20 type
    const existingContract = await db.select()
      .from(contractsTable)
      .where(eq(contractsTable.id, input.id))
      .execute();

    if (existingContract.length === 0) {
      throw new Error(`Contract with id ${input.id} not found`);
    }

    if (existingContract[0].contract_type !== 'ERC20') {
      throw new Error(`Contract with id ${input.id} is not an ERC20 contract`);
    }

    // Update contracts table if name or symbol provided
    const contractUpdates: any = {};
    if (input.name !== undefined) {
      contractUpdates.name = input.name;
    }
    if (input.symbol !== undefined) {
      contractUpdates.symbol = input.symbol;
    }

    if (Object.keys(contractUpdates).length > 0) {
      contractUpdates.updated_at = new Date();
      await db.update(contractsTable)
        .set(contractUpdates)
        .where(eq(contractsTable.id, input.id))
        .execute();
    }

    // Update ERC20 properties if provided
    const propertiesUpdates: any = {};
    if (input.total_supply !== undefined) {
      propertiesUpdates.total_supply = input.total_supply;
    }
    if (input.decimals !== undefined) {
      propertiesUpdates.decimals = input.decimals;
    }

    if (Object.keys(propertiesUpdates).length > 0) {
      propertiesUpdates.updated_at = new Date();
      await db.update(erc20PropertiesTable)
        .set(propertiesUpdates)
        .where(eq(erc20PropertiesTable.contract_id, input.id))
        .execute();
    }

    // Fetch and return the updated contract with properties
    const result = await db.select()
      .from(contractsTable)
      .leftJoin(erc20PropertiesTable, eq(contractsTable.id, erc20PropertiesTable.contract_id))
      .where(eq(contractsTable.id, input.id))
      .execute();

    const contractData = result[0];
    
    return {
      id: contractData.contracts.id,
      name: contractData.contracts.name,
      symbol: contractData.contracts.symbol,
      contract_type: contractData.contracts.contract_type,
      created_at: contractData.contracts.created_at,
      updated_at: contractData.contracts.updated_at,
      erc20_properties: contractData.erc20_properties ? {
        id: contractData.erc20_properties.id,
        contract_id: contractData.erc20_properties.contract_id,
        total_supply: contractData.erc20_properties.total_supply,
        decimals: contractData.erc20_properties.decimals,
        created_at: contractData.erc20_properties.created_at,
        updated_at: contractData.erc20_properties.updated_at
      } : null,
      nft_properties: null
    };
  } catch (error) {
    console.error('ERC20 update failed:', error);
    throw error;
  }
}
