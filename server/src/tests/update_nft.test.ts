
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { contractsTable, nftPropertiesTable } from '../db/schema';
import { type UpdateNFTInput } from '../schema';
import { updateNFT } from '../handlers/update_nft';
import { eq } from 'drizzle-orm';

describe('updateNFT', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update NFT contract name and symbol', async () => {
    // Create test NFT contract
    const contractResult = await db.insert(contractsTable)
      .values({
        name: 'Original NFT',
        symbol: 'ORIG',
        contract_type: 'NFT'
      })
      .returning()
      .execute();

    const contractId = contractResult[0].id;

    // Create NFT properties
    await db.insert(nftPropertiesTable)
      .values({
        contract_id: contractId,
        base_uri: 'https://example.com/metadata/',
        maximum_supply: '10000'
      })
      .execute();

    const updateInput: UpdateNFTInput = {
      id: contractId,
      name: 'Updated NFT Name',
      symbol: 'UPDT'
    };

    const result = await updateNFT(updateInput);

    expect(result.name).toEqual('Updated NFT Name');
    expect(result.symbol).toEqual('UPDT');
    expect(result.contract_type).toEqual('NFT');
    expect(result.id).toEqual(contractId);
    expect(result.erc20_properties).toBeNull();
    expect(result.nft_properties).toBeDefined();
    expect(result.nft_properties?.base_uri).toEqual('https://example.com/metadata/');
    expect(result.nft_properties?.maximum_supply).toEqual('10000');
  });

  it('should update NFT properties', async () => {
    // Create test NFT contract
    const contractResult = await db.insert(contractsTable)
      .values({
        name: 'Test NFT',
        symbol: 'TEST',
        contract_type: 'NFT'
      })
      .returning()
      .execute();

    const contractId = contractResult[0].id;

    // Create NFT properties
    await db.insert(nftPropertiesTable)
      .values({
        contract_id: contractId,
        base_uri: 'https://old.com/metadata/',
        maximum_supply: '5000'
      })
      .execute();

    const updateInput: UpdateNFTInput = {
      id: contractId,
      base_uri: 'https://new.com/metadata/',
      maximum_supply: '15000'
    };

    const result = await updateNFT(updateInput);

    expect(result.name).toEqual('Test NFT');
    expect(result.symbol).toEqual('TEST');
    expect(result.nft_properties?.base_uri).toEqual('https://new.com/metadata/');
    expect(result.nft_properties?.maximum_supply).toEqual('15000');
  });

  it('should update both contract and NFT properties', async () => {
    // Create test NFT contract
    const contractResult = await db.insert(contractsTable)
      .values({
        name: 'Original NFT',
        symbol: 'ORIG',
        contract_type: 'NFT'
      })
      .returning()
      .execute();

    const contractId = contractResult[0].id;

    // Create NFT properties
    await db.insert(nftPropertiesTable)
      .values({
        contract_id: contractId,
        base_uri: 'https://old.com/metadata/',
        maximum_supply: '1000'
      })
      .execute();

    const updateInput: UpdateNFTInput = {
      id: contractId,
      name: 'Completely Updated NFT',
      symbol: 'COMP',
      base_uri: 'https://completely-new.com/metadata/',
      maximum_supply: null
    };

    const result = await updateNFT(updateInput);

    expect(result.name).toEqual('Completely Updated NFT');
    expect(result.symbol).toEqual('COMP');
    expect(result.nft_properties?.base_uri).toEqual('https://completely-new.com/metadata/');
    expect(result.nft_properties?.maximum_supply).toBeNull();
  });

  it('should update database records correctly', async () => {
    // Create test NFT contract
    const contractResult = await db.insert(contractsTable)
      .values({
        name: 'Test NFT',
        symbol: 'TEST',
        contract_type: 'NFT'
      })
      .returning()
      .execute();

    const contractId = contractResult[0].id;

    // Create NFT properties
    await db.insert(nftPropertiesTable)
      .values({
        contract_id: contractId,
        base_uri: 'https://test.com/metadata/',
        maximum_supply: '5000'
      })
      .execute();

    const updateInput: UpdateNFTInput = {
      id: contractId,
      name: 'Updated Name',
      base_uri: 'https://updated.com/metadata/'
    };

    await updateNFT(updateInput);

    // Verify contract was updated in database
    const updatedContracts = await db.select()
      .from(contractsTable)
      .where(eq(contractsTable.id, contractId))
      .execute();

    expect(updatedContracts).toHaveLength(1);
    expect(updatedContracts[0].name).toEqual('Updated Name');
    expect(updatedContracts[0].symbol).toEqual('TEST'); // Unchanged

    // Verify NFT properties were updated in database
    const updatedProperties = await db.select()
      .from(nftPropertiesTable)
      .where(eq(nftPropertiesTable.contract_id, contractId))
      .execute();

    expect(updatedProperties).toHaveLength(1);
    expect(updatedProperties[0].base_uri).toEqual('https://updated.com/metadata/');
    expect(updatedProperties[0].maximum_supply).toEqual('5000'); // Unchanged
  });

  it('should throw error when contract not found', async () => {
    const updateInput: UpdateNFTInput = {
      id: 999,
      name: 'Non-existent NFT'
    };

    expect(updateNFT(updateInput)).rejects.toThrow(/contract with id 999 not found/i);
  });

  it('should throw error when contract is not NFT type', async () => {
    // Create ERC20 contract
    const contractResult = await db.insert(contractsTable)
      .values({
        name: 'ERC20 Token',
        symbol: 'ERC20',
        contract_type: 'ERC20'
      })
      .returning()
      .execute();

    const contractId = contractResult[0].id;

    const updateInput: UpdateNFTInput = {
      id: contractId,
      name: 'Try to update as NFT'
    };

    expect(updateNFT(updateInput)).rejects.toThrow(/is not an nft contract/i);
  });

  it('should handle partial updates correctly', async () => {
    // Create test NFT contract
    const contractResult = await db.insert(contractsTable)
      .values({
        name: 'Partial Update NFT',
        symbol: 'PART',
        contract_type: 'NFT'
      })
      .returning()
      .execute();

    const contractId = contractResult[0].id;

    // Create NFT properties
    await db.insert(nftPropertiesTable)
      .values({
        contract_id: contractId,
        base_uri: 'https://partial.com/metadata/',
        maximum_supply: '2000'
      })
      .execute();

    // Update only symbol
    const updateInput: UpdateNFTInput = {
      id: contractId,
      symbol: 'NEWPART'
    };

    const result = await updateNFT(updateInput);

    expect(result.name).toEqual('Partial Update NFT'); // Unchanged
    expect(result.symbol).toEqual('NEWPART'); // Changed
    expect(result.nft_properties?.base_uri).toEqual('https://partial.com/metadata/'); // Unchanged
    expect(result.nft_properties?.maximum_supply).toEqual('2000'); // Unchanged
  });
});
