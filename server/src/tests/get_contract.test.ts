
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { contractsTable, erc20PropertiesTable, nftPropertiesTable } from '../db/schema';
import { type GetContractInput } from '../schema';
import { getContract } from '../handlers/get_contract';

describe('getContract', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return null for non-existent contract', async () => {
    const input: GetContractInput = { id: 999 };
    
    const result = await getContract(input);
    
    expect(result).toBeNull();
  });

  it('should return ERC20 contract with properties', async () => {
    // Create ERC20 contract
    const contractResult = await db.insert(contractsTable)
      .values({
        name: 'Test Token',
        symbol: 'TEST',
        contract_type: 'ERC20'
      })
      .returning()
      .execute();

    const contractId = contractResult[0].id;

    // Create ERC20 properties
    await db.insert(erc20PropertiesTable)
      .values({
        contract_id: contractId,
        total_supply: '1000000000000000000000',
        decimals: 18
      })
      .execute();

    const input: GetContractInput = { id: contractId };
    
    const result = await getContract(input);
    
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(contractId);
    expect(result!.name).toEqual('Test Token');
    expect(result!.symbol).toEqual('TEST');
    expect(result!.contract_type).toEqual('ERC20');
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
    
    // Should have ERC20 properties
    expect(result!.erc20_properties).not.toBeNull();
    expect(result!.erc20_properties!.contract_id).toEqual(contractId);
    expect(result!.erc20_properties!.total_supply).toEqual('1000000000000000000000');
    expect(result!.erc20_properties!.decimals).toEqual(18);
    expect(result!.erc20_properties!.created_at).toBeInstanceOf(Date);
    expect(result!.erc20_properties!.updated_at).toBeInstanceOf(Date);
    
    // Should not have NFT properties
    expect(result!.nft_properties).toBeNull();
  });

  it('should return NFT contract with properties', async () => {
    // Create NFT contract
    const contractResult = await db.insert(contractsTable)
      .values({
        name: 'Test NFT',
        symbol: 'TNFT',
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

    const input: GetContractInput = { id: contractId };
    
    const result = await getContract(input);
    
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(contractId);
    expect(result!.name).toEqual('Test NFT');
    expect(result!.symbol).toEqual('TNFT');
    expect(result!.contract_type).toEqual('NFT');
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
    
    // Should have NFT properties
    expect(result!.nft_properties).not.toBeNull();
    expect(result!.nft_properties!.contract_id).toEqual(contractId);
    expect(result!.nft_properties!.base_uri).toEqual('https://example.com/metadata/');
    expect(result!.nft_properties!.maximum_supply).toEqual('10000');
    expect(result!.nft_properties!.created_at).toBeInstanceOf(Date);
    expect(result!.nft_properties!.updated_at).toBeInstanceOf(Date);
    
    // Should not have ERC20 properties
    expect(result!.erc20_properties).toBeNull();
  });

  it('should return NFT contract with null maximum_supply', async () => {
    // Create NFT contract
    const contractResult = await db.insert(contractsTable)
      .values({
        name: 'Unlimited NFT',
        symbol: 'UNLIM',
        contract_type: 'NFT'
      })
      .returning()
      .execute();

    const contractId = contractResult[0].id;

    // Create NFT properties with null maximum_supply
    await db.insert(nftPropertiesTable)
      .values({
        contract_id: contractId,
        base_uri: 'https://example.com/unlimited/',
        maximum_supply: null
      })
      .execute();

    const input: GetContractInput = { id: contractId };
    
    const result = await getContract(input);
    
    expect(result).not.toBeNull();
    expect(result!.nft_properties).not.toBeNull();
    expect(result!.nft_properties!.maximum_supply).toBeNull();
  });

  it('should return contract without properties if none exist', async () => {
    // Create contract without properties
    const contractResult = await db.insert(contractsTable)
      .values({
        name: 'Empty Contract',
        symbol: 'EMPTY',
        contract_type: 'ERC20'
      })
      .returning()
      .execute();

    const contractId = contractResult[0].id;
    const input: GetContractInput = { id: contractId };
    
    const result = await getContract(input);
    
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(contractId);
    expect(result!.name).toEqual('Empty Contract');
    expect(result!.symbol).toEqual('EMPTY');
    expect(result!.contract_type).toEqual('ERC20');
    
    // Both properties should be null
    expect(result!.erc20_properties).toBeNull();
    expect(result!.nft_properties).toBeNull();
  });
});
