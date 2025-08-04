
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { contractsTable, nftPropertiesTable } from '../db/schema';
import { type CreateNFTInput } from '../schema';
import { createNFT } from '../handlers/create_nft';
import { eq } from 'drizzle-orm';

// Test input with maximum supply
const testInputWithMaxSupply: CreateNFTInput = {
  name: 'Test NFT Collection',
  symbol: 'TNFT',
  base_uri: 'https://example.com/metadata/',
  maximum_supply: '10000'
};

// Test input without maximum supply (unlimited)
const testInputUnlimited: CreateNFTInput = {
  name: 'Unlimited NFT',
  symbol: 'UNFT',
  base_uri: 'https://unlimited.com/metadata/',
  maximum_supply: null
};

describe('createNFT', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an NFT contract with maximum supply', async () => {
    const result = await createNFT(testInputWithMaxSupply);

    // Validate contract fields
    expect(result.id).toBeDefined();
    expect(result.name).toEqual('Test NFT Collection');
    expect(result.symbol).toEqual('TNFT');
    expect(result.contract_type).toEqual('NFT');
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);

    // Validate ERC20 properties are null
    expect(result.erc20_properties).toBeNull();

    // Validate NFT properties
    expect(result.nft_properties).toBeDefined();
    expect(result.nft_properties!.id).toBeDefined();
    expect(result.nft_properties!.contract_id).toEqual(result.id);
    expect(result.nft_properties!.base_uri).toEqual('https://example.com/metadata/');
    expect(result.nft_properties!.maximum_supply).toEqual('10000');
    expect(result.nft_properties!.created_at).toBeInstanceOf(Date);
    expect(result.nft_properties!.updated_at).toBeInstanceOf(Date);
  });

  it('should create an NFT contract with unlimited supply', async () => {
    const result = await createNFT(testInputUnlimited);

    // Validate contract fields
    expect(result.name).toEqual('Unlimited NFT');
    expect(result.symbol).toEqual('UNFT');
    expect(result.contract_type).toEqual('NFT');

    // Validate NFT properties with null maximum supply
    expect(result.nft_properties).toBeDefined();
    expect(result.nft_properties!.base_uri).toEqual('https://unlimited.com/metadata/');
    expect(result.nft_properties!.maximum_supply).toBeNull();
  });

  it('should save contract to database', async () => {
    const result = await createNFT(testInputWithMaxSupply);

    // Query contract from database
    const contracts = await db.select()
      .from(contractsTable)
      .where(eq(contractsTable.id, result.id))
      .execute();

    expect(contracts).toHaveLength(1);
    expect(contracts[0].name).toEqual('Test NFT Collection');
    expect(contracts[0].symbol).toEqual('TNFT');
    expect(contracts[0].contract_type).toEqual('NFT');
    expect(contracts[0].created_at).toBeInstanceOf(Date);
  });

  it('should save NFT properties to database', async () => {
    const result = await createNFT(testInputWithMaxSupply);

    // Query NFT properties from database
    const nftProperties = await db.select()
      .from(nftPropertiesTable)
      .where(eq(nftPropertiesTable.contract_id, result.id))
      .execute();

    expect(nftProperties).toHaveLength(1);
    expect(nftProperties[0].contract_id).toEqual(result.id);
    expect(nftProperties[0].base_uri).toEqual('https://example.com/metadata/');
    expect(nftProperties[0].maximum_supply).toEqual('10000');
    expect(nftProperties[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle unlimited supply correctly in database', async () => {
    const result = await createNFT(testInputUnlimited);

    // Query NFT properties from database
    const nftProperties = await db.select()
      .from(nftPropertiesTable)
      .where(eq(nftPropertiesTable.contract_id, result.id))
      .execute();

    expect(nftProperties).toHaveLength(1);
    expect(nftProperties[0].maximum_supply).toBeNull();
  });
});
