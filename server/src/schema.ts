
import { z } from 'zod';

// Contract type enum
export const contractTypeSchema = z.enum(['ERC20', 'NFT']);
export type ContractType = z.infer<typeof contractTypeSchema>;

// Base contract schema
export const contractSchema = z.object({
  id: z.number(),
  name: z.string(),
  symbol: z.string(),
  contract_type: contractTypeSchema,
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Contract = z.infer<typeof contractSchema>;

// ERC20 specific properties schema
export const erc20PropertiesSchema = z.object({
  id: z.number(),
  contract_id: z.number(),
  total_supply: z.string(), // Using string for large numbers
  decimals: z.number().int().min(0).max(18), // Standard ERC20 decimals range
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type ERC20Properties = z.infer<typeof erc20PropertiesSchema>;

// NFT specific properties schema
export const nftPropertiesSchema = z.object({
  id: z.number(),
  contract_id: z.number(),
  base_uri: z.string(),
  maximum_supply: z.string().nullable(), // Nullable for unlimited supply
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type NFTProperties = z.infer<typeof nftPropertiesSchema>;

// Combined contract with properties
export const contractWithPropertiesSchema = z.object({
  id: z.number(),
  name: z.string(),
  symbol: z.string(),
  contract_type: contractTypeSchema,
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
  erc20_properties: erc20PropertiesSchema.nullable(),
  nft_properties: nftPropertiesSchema.nullable()
});

export type ContractWithProperties = z.infer<typeof contractWithPropertiesSchema>;

// Input schemas for creating contracts
export const createERC20InputSchema = z.object({
  name: z.string().min(1),
  symbol: z.string().min(1).max(10),
  total_supply: z.string().regex(/^\d+$/, "Must be a valid number"), // String for large numbers
  decimals: z.number().int().min(0).max(18)
});

export type CreateERC20Input = z.infer<typeof createERC20InputSchema>;

export const createNFTInputSchema = z.object({
  name: z.string().min(1),
  symbol: z.string().min(1).max(10),
  base_uri: z.string().url("Must be a valid URL"),
  maximum_supply: z.string().regex(/^\d+$/, "Must be a valid number").nullable()
});

export type CreateNFTInput = z.infer<typeof createNFTInputSchema>;

// Input schemas for updating contracts
export const updateERC20InputSchema = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  symbol: z.string().min(1).max(10).optional(),
  total_supply: z.string().regex(/^\d+$/, "Must be a valid number").optional(),
  decimals: z.number().int().min(0).max(18).optional()
});

export type UpdateERC20Input = z.infer<typeof updateERC20InputSchema>;

export const updateNFTInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1).optional(),
  symbol: z.string().min(1).max(10).optional(),
  base_uri: z.string().url("Must be a valid URL").optional(),
  maximum_supply: z.string().regex(/^\d+$/, "Must be a valid number").nullable().optional()
});

export type UpdateNFTInput = z.infer<typeof updateNFTInputSchema>;

// Get contract by ID input schema
export const getContractInputSchema = z.object({
  id: z.number()
});

export type GetContractInput = z.infer<typeof getContractInputSchema>;
