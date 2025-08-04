
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { contractsTable, erc20PropertiesTable } from '../db/schema';
import { type UpdateERC20Input } from '../schema';
import { updateERC20 } from '../handlers/update_erc20';
import { eq } from 'drizzle-orm';

describe('updateERC20', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let testContractId: number;

  beforeEach(async () => {
    // Create a test ERC20 contract
    const contractResult = await db.insert(contractsTable)
      .values({
        name: 'Test Token',
        symbol: 'TEST',
        contract_type: 'ERC20'
      })
      .returning()
      .execute();

    testContractId = contractResult[0].id;

    // Create ERC20 properties
    await db.insert(erc20PropertiesTable)
      .values({
        contract_id: testContractId,
        total_supply: '1000000',
        decimals: 18
      })
      .execute();
  });

  it('should update contract name and symbol', async () => {
    const input: UpdateERC20Input = {
      id: testContractId,
      name: 'Updated Token',
      symbol: 'UPD'
    };

    const result = await updateERC20(input);

    expect(result.name).toEqual('Updated Token');
    expect(result.symbol).toEqual('UPD');
    expect(result.contract_type).toEqual('ERC20');
    expect(result.erc20_properties).toBeDefined();
    expect(result.erc20_properties!.total_supply).toEqual('1000000');
    expect(result.erc20_properties!.decimals).toEqual(18);
    expect(result.nft_properties).toBeNull();
  });

  it('should update ERC20 properties', async () => {
    const input: UpdateERC20Input = {
      id: testContractId,
      total_supply: '2000000',
      decimals: 8
    };

    const result = await updateERC20(input);

    expect(result.name).toEqual('Test Token'); // Unchanged
    expect(result.symbol).toEqual('TEST'); // Unchanged
    expect(result.erc20_properties!.total_supply).toEqual('2000000');
    expect(result.erc20_properties!.decimals).toEqual(8);
  });

  it('should update both contract and properties', async () => {
    const input: UpdateERC20Input = {
      id: testContractId,
      name: 'Fully Updated Token',
      symbol: 'FUT',
      total_supply: '5000000',
      decimals: 6
    };

    const result = await updateERC20(input);

    expect(result.name).toEqual('Fully Updated Token');
    expect(result.symbol).toEqual('FUT');
    expect(result.erc20_properties!.total_supply).toEqual('5000000');
    expect(result.erc20_properties!.decimals).toEqual(6);
  });

  it('should update timestamps', async () => {
    // Get original timestamps
    const originalContract = await db.select()
      .from(contractsTable)
      .where(eq(contractsTable.id, testContractId))
      .execute();

    const originalProperties = await db.select()
      .from(erc20PropertiesTable)
      .where(eq(erc20PropertiesTable.contract_id, testContractId))
      .execute();

    const originalContractTime = originalContract[0].updated_at;
    const originalPropertiesTime = originalProperties[0].updated_at;

    // Small delay to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const input: UpdateERC20Input = {
      id: testContractId,
      name: 'Time Test Token',
      decimals: 10
    };

    const result = await updateERC20(input);

    expect(result.updated_at.getTime()).toBeGreaterThan(originalContractTime.getTime());
    expect(result.erc20_properties!.updated_at.getTime()).toBeGreaterThan(originalPropertiesTime.getTime());
  });

  it('should persist changes to database', async () => {
    const input: UpdateERC20Input = {
      id: testContractId,
      name: 'Persisted Token',
      total_supply: '3000000'
    };

    await updateERC20(input);

    // Verify contract table
    const contracts = await db.select()
      .from(contractsTable)
      .where(eq(contractsTable.id, testContractId))
      .execute();

    expect(contracts).toHaveLength(1);
    expect(contracts[0].name).toEqual('Persisted Token');

    // Verify properties table
    const properties = await db.select()
      .from(erc20PropertiesTable)
      .where(eq(erc20PropertiesTable.contract_id, testContractId))
      .execute();

    expect(properties).toHaveLength(1);
    expect(properties[0].total_supply).toEqual('3000000');
  });

  it('should throw error for non-existent contract', async () => {
    const input: UpdateERC20Input = {
      id: 99999,
      name: 'Non-existent'
    };

    expect(updateERC20(input)).rejects.toThrow(/not found/i);
  });

  it('should throw error for non-ERC20 contract', async () => {
    // Create an NFT contract
    const nftResult = await db.insert(contractsTable)
      .values({
        name: 'Test NFT',
        symbol: 'TNFT',
        contract_type: 'NFT'
      })
      .returning()
      .execute();

    const input: UpdateERC20Input = {
      id: nftResult[0].id,
      name: 'Should Fail'
    };

    expect(updateERC20(input)).rejects.toThrow(/not an ERC20 contract/i);
  });

  it('should handle partial updates', async () => {
    const input: UpdateERC20Input = {
      id: testContractId,
      decimals: 12 // Only update decimals
    };

    const result = await updateERC20(input);

    expect(result.name).toEqual('Test Token'); // Unchanged
    expect(result.symbol).toEqual('TEST'); // Unchanged
    expect(result.erc20_properties!.total_supply).toEqual('1000000'); // Unchanged
    expect(result.erc20_properties!.decimals).toEqual(12); // Changed
  });
});
