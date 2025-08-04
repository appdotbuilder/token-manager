
import { db } from '../db';
import { contractsTable, nftPropertiesTable } from '../db/schema';
import { type UpdateNFTInput, type ContractWithProperties } from '../schema';
import { eq, and } from 'drizzle-orm';

export async function updateNFT(input: UpdateNFTInput): Promise<ContractWithProperties> {
  try {
    // First, verify the contract exists and is NFT type
    const existingContract = await db.select()
      .from(contractsTable)
      .where(eq(contractsTable.id, input.id))
      .execute();

    if (existingContract.length === 0) {
      throw new Error(`Contract with ID ${input.id} not found`);
    }

    if (existingContract[0].contract_type !== 'NFT') {
      throw new Error(`Contract with ID ${input.id} is not an NFT contract`);
    }

    // Update contracts table if name or symbol provided
    const contractUpdates: Partial<{name: string, symbol: string}> = {};
    if (input.name !== undefined) {
      contractUpdates.name = input.name;
    }
    if (input.symbol !== undefined) {
      contractUpdates.symbol = input.symbol;
    }

    if (Object.keys(contractUpdates).length > 0) {
      await db.update(contractsTable)
        .set({
          ...contractUpdates,
          updated_at: new Date()
        })
        .where(eq(contractsTable.id, input.id))
        .execute();
    }

    // Update NFT properties if any NFT-specific fields provided
    const nftUpdates: Partial<{base_uri: string, maximum_supply: string | null}> = {};
    if (input.base_uri !== undefined) {
      nftUpdates.base_uri = input.base_uri;
    }
    if (input.maximum_supply !== undefined) {
      nftUpdates.maximum_supply = input.maximum_supply;
    }

    if (Object.keys(nftUpdates).length > 0) {
      await db.update(nftPropertiesTable)
        .set({
          ...nftUpdates,
          updated_at: new Date()
        })
        .where(eq(nftPropertiesTable.contract_id, input.id))
        .execute();
    }

    // Fetch and return the updated contract with properties
    const result = await db.select()
      .from(contractsTable)
      .leftJoin(nftPropertiesTable, eq(contractsTable.id, nftPropertiesTable.contract_id))
      .where(eq(contractsTable.id, input.id))
      .execute();

    if (result.length === 0) {
      throw new Error(`Updated contract with ID ${input.id} not found`);
    }

    const contractData = result[0];
    return {
      id: contractData.contracts.id,
      name: contractData.contracts.name,
      symbol: contractData.contracts.symbol,
      contract_type: contractData.contracts.contract_type,
      created_at: contractData.contracts.created_at,
      updated_at: contractData.contracts.updated_at,
      erc20_properties: null,
      nft_properties: contractData.nft_properties
    };
  } catch (error) {
    console.error('NFT update failed:', error);
    throw error;
  }
}
