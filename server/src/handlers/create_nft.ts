
import { db } from '../db';
import { contractsTable, nftPropertiesTable } from '../db/schema';
import { type CreateNFTInput, type ContractWithProperties } from '../schema';

export async function createNFT(input: CreateNFTInput): Promise<ContractWithProperties> {
  try {
    // Insert contract record with NFT type
    const contractResult = await db.insert(contractsTable)
      .values({
        name: input.name,
        symbol: input.symbol,
        contract_type: 'NFT'
      })
      .returning()
      .execute();

    const contract = contractResult[0];

    // Insert NFT properties record
    const nftPropertiesResult = await db.insert(nftPropertiesTable)
      .values({
        contract_id: contract.id,
        base_uri: input.base_uri,
        maximum_supply: input.maximum_supply
      })
      .returning()
      .execute();

    const nftProperties = nftPropertiesResult[0];

    // Return combined contract with properties
    return {
      id: contract.id,
      name: contract.name,
      symbol: contract.symbol,
      contract_type: contract.contract_type,
      created_at: contract.created_at,
      updated_at: contract.updated_at,
      erc20_properties: null,
      nft_properties: {
        id: nftProperties.id,
        contract_id: nftProperties.contract_id,
        base_uri: nftProperties.base_uri,
        maximum_supply: nftProperties.maximum_supply,
        created_at: nftProperties.created_at,
        updated_at: nftProperties.updated_at
      }
    };
  } catch (error) {
    console.error('NFT contract creation failed:', error);
    throw error;
  }
}
