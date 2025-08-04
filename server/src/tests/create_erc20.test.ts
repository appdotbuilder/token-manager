
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { contractsTable, erc20PropertiesTable } from '../db/schema';
import { type CreateERC20Input } from '../schema';
import { createERC20 } from '../handlers/create_erc20';
import { eq } from 'drizzle-orm';

// Test input for ERC20 contract
const testInput: CreateERC20Input = {
  name: 'Test Token',
  symbol: 'TEST',
  total_supply: '1000000000000000000000000', // 1 million tokens with 18 decimals
  decimals: 18
};

describe('createERC20', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create an ERC20 contract with properties', async () => {
    const result = await createERC20(testInput);

    // Validate contract fields
    expect(result.name).toEqual('Test Token');
    expect(result.symbol).toEqual('TEST');
    expect(result.contract_type).toEqual('ERC20');
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);

    // Validate ERC20 properties
    expect(result.erc20_properties).toBeDefined();
    expect(result.erc20_properties!.contract_id).toEqual(result.id);
    expect(result.erc20_properties!.total_supply).toEqual('1000000000000000000000000');
    expect(result.erc20_properties!.decimals).toEqual(18);
    expect(result.erc20_properties!.id).toBeDefined();
    expect(result.erc20_properties!.created_at).toBeInstanceOf(Date);
    expect(result.erc20_properties!.updated_at).toBeInstanceOf(Date);

    // Validate NFT properties is null
    expect(result.nft_properties).toBeNull();
  });

  it('should save contract to database', async () => {
    const result = await createERC20(testInput);

    // Query contract from database
    const contracts = await db.select()
      .from(contractsTable)
      .where(eq(contractsTable.id, result.id))
      .execute();

    expect(contracts).toHaveLength(1);
    expect(contracts[0].name).toEqual('Test Token');
    expect(contracts[0].symbol).toEqual('TEST');
    expect(contracts[0].contract_type).toEqual('ERC20');
    expect(contracts[0].created_at).toBeInstanceOf(Date);
  });

  it('should save ERC20 properties to database', async () => {
    const result = await createERC20(testInput);

    // Query ERC20 properties from database
    const properties = await db.select()
      .from(erc20PropertiesTable)
      .where(eq(erc20PropertiesTable.contract_id, result.id))
      .execute();

    expect(properties).toHaveLength(1);
    expect(properties[0].contract_id).toEqual(result.id);
    expect(properties[0].total_supply).toEqual('1000000000000000000000000');
    expect(properties[0].decimals).toEqual(18);
    expect(properties[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle different decimal values correctly', async () => {
    const customInput: CreateERC20Input = {
      name: 'Custom Token',
      symbol: 'CUSTOM',
      total_supply: '5000000',
      decimals: 6
    };

    const result = await createERC20(customInput);

    expect(result.erc20_properties!.decimals).toEqual(6);
    expect(result.erc20_properties!.total_supply).toEqual('5000000');

    // Verify in database
    const properties = await db.select()
      .from(erc20PropertiesTable)
      .where(eq(erc20PropertiesTable.contract_id, result.id))
      .execute();

    expect(properties[0].decimals).toEqual(6);
    expect(properties[0].total_supply).toEqual('5000000');
  });

  it('should handle large supply numbers as strings', async () => {
    const largeSupplyInput: CreateERC20Input = {
      name: 'Large Supply Token',
      symbol: 'LARGE',
      total_supply: '999999999999999999999999999999999999999999',
      decimals: 18
    };

    const result = await createERC20(largeSupplyInput);

    expect(result.erc20_properties!.total_supply).toEqual('999999999999999999999999999999999999999999');

    // Verify in database
    const properties = await db.select()
      .from(erc20PropertiesTable)
      .where(eq(erc20PropertiesTable.contract_id, result.id))
      .execute();

    expect(properties[0].total_supply).toEqual('999999999999999999999999999999999999999999');
  });
});
