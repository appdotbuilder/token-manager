
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { contractsTable, erc20PropertiesTable, nftPropertiesTable } from '../db/schema';
import { getContracts } from '../handlers/get_contracts';

describe('getContracts', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no contracts exist', async () => {
    const result = await getContracts();
    expect(result).toEqual([]);
  });

  it('should return ERC20 contract with properties', async () => {
    // Create ERC20 contract
    const contractResult = await db.insert(contractsTable)
      .values({
        name: 'Test Token',
        symbol: 'TT',
        contract_type: 'ERC20'
      })
      .returning()
      .execute();

    const contract = contractResult[0];

    // Create ERC20 properties
    await db.insert(erc20PropertiesTable)
      .values({
        contract_id: contract.id,
        total_supply: '1000000',
        decimals: 18
      })
      .execute();

    const result = await getContracts();

    expect(result).toHaveLength(1);
    expect(result[0].id).toEqual(contract.id);
    expect(result[0].name).toEqual('Test Token');
    expect(result[0].symbol).toEqual('TT');
    expect(result[0].contract_type).toEqual('ERC20');
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);
    
    expect(result[0].erc20_properties).not.toBeNull();
    expect(result[0].erc20_properties!.contract_id).toEqual(contract.id);
    expect(result[0].erc20_properties!.total_supply).toEqual('1000000');
    expect(result[0].erc20_properties!.decimals).toEqual(18);
    expect(result[0].erc20_properties!.created_at).toBeInstanceOf(Date);
    expect(result[0].erc20_properties!.updated_at).toBeInstanceOf(Date);
    
    expect(result[0].nft_properties).toBeNull();
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

    const contract = contractResult[0];

    // Create NFT properties
    await db.insert(nftPropertiesTable)
      .values({
        contract_id: contract.id,
        base_uri: 'https://example.com/metadata/',
        maximum_supply: '10000'
      })
      .execute();

    const result = await getContracts();

    expect(result).toHaveLength(1);
    expect(result[0].id).toEqual(contract.id);
    expect(result[0].name).toEqual('Test NFT');
    expect(result[0].symbol).toEqual('TNFT');
    expect(result[0].contract_type).toEqual('NFT');
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].updated_at).toBeInstanceOf(Date);
    
    expect(result[0].nft_properties).not.toBeNull();
    expect(result[0].nft_properties!.contract_id).toEqual(contract.id);
    expect(result[0].nft_properties!.base_uri).toEqual('https://example.com/metadata/');
    expect(result[0].nft_properties!.maximum_supply).toEqual('10000');
    expect(result[0].nft_properties!.created_at).toBeInstanceOf(Date);
    expect(result[0].nft_properties!.updated_at).toBeInstanceOf(Date);
    
    expect(result[0].erc20_properties).toBeNull();
  });

  it('should return multiple contracts with mixed types', async () => {
    // Create ERC20 contract
    const erc20ContractResult = await db.insert(contractsTable)
      .values({
        name: 'Token A',
        symbol: 'TA',
        contract_type: 'ERC20'
      })
      .returning()
      .execute();

    await db.insert(erc20PropertiesTable)
      .values({
        contract_id: erc20ContractResult[0].id,
        total_supply: '500000',
        decimals: 6
      })
      .execute();

    // Create NFT contract
    const nftContractResult = await db.insert(contractsTable)
      .values({
        name: 'NFT Collection',
        symbol: 'NC',
        contract_type: 'NFT'
      })
      .returning()
      .execute();

    await db.insert(nftPropertiesTable)
      .values({
        contract_id: nftContractResult[0].id,
        base_uri: 'https://api.example.com/',
        maximum_supply: null // Unlimited supply
      })
      .execute();

    const result = await getContracts();

    expect(result).toHaveLength(2);
    
    // Find contracts by type
    const erc20Contract = result.find(c => c.contract_type === 'ERC20');
    const nftContract = result.find(c => c.contract_type === 'NFT');

    expect(erc20Contract).toBeDefined();
    expect(erc20Contract!.name).toEqual('Token A');
    expect(erc20Contract!.erc20_properties).not.toBeNull();
    expect(erc20Contract!.nft_properties).toBeNull();

    expect(nftContract).toBeDefined();
    expect(nftContract!.name).toEqual('NFT Collection');
    expect(nftContract!.nft_properties).not.toBeNull();
    expect(nftContract!.nft_properties!.maximum_supply).toBeNull();
    expect(nftContract!.erc20_properties).toBeNull();
  });

  it('should handle contract without properties', async () => {
    // Create contract without properties (orphaned contract)
    const contractResult = await db.insert(contractsTable)
      .values({
        name: 'Orphaned Contract',
        symbol: 'OC',
        contract_type: 'ERC20'
      })
      .returning()
      .execute();

    const result = await getContracts();

    expect(result).toHaveLength(1);
    expect(result[0].id).toEqual(contractResult[0].id);
    expect(result[0].name).toEqual('Orphaned Contract');
    expect(result[0].erc20_properties).toBeNull();
    expect(result[0].nft_properties).toBeNull();
  });
});
