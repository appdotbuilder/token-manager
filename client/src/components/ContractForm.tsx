
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/utils/trpc';
import { useState } from 'react';
// Type-only imports with correct relative path
import type { 
  CreateERC20Input, 
  CreateNFTInput, 
  ContractWithProperties 
} from '../../../server/src/schema';

interface ContractFormProps {
  onSuccess: (contract: ContractWithProperties) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function ContractForm({ onSuccess, isLoading, setIsLoading }: ContractFormProps) {
  const [activeContractType, setActiveContractType] = useState<'ERC20' | 'NFT'>('ERC20');
  
  // ERC20 form state with proper typing
  const [erc20FormData, setErc20FormData] = useState<CreateERC20Input>({
    name: '',
    symbol: '',
    total_supply: '',
    decimals: 18
  });

  // NFT form state with proper typing
  const [nftFormData, setNftFormData] = useState<CreateNFTInput>({
    name: '',
    symbol: '',
    base_uri: '',
    maximum_supply: null
  });

  const handleERC20Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await trpc.createERC20.mutate(erc20FormData);
      onSuccess(response);
      // Reset form
      setErc20FormData({
        name: '',
        symbol: '',
        total_supply: '',
        decimals: 18
      });
    } catch (error) {
      console.error('Failed to create ERC20 contract:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNFTSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await trpc.createNFT.mutate(nftFormData);
      onSuccess(response);
      // Reset form
      setNftFormData({
        name: '',
        symbol: '',
        base_uri: '',
        maximum_supply: null
      });
    } catch (error) {
      console.error('Failed to create NFT contract:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Tabs value={activeContractType} onValueChange={(value) => setActiveContractType(value as 'ERC20' | 'NFT')}>
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="ERC20" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
          🪙 ERC20 Token
        </TabsTrigger>
        <TabsTrigger value="NFT" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
          🎨 NFT Collection
        </TabsTrigger>
      </TabsList>

      <TabsContent value="ERC20">
        <Card className="border-green-200 bg-green-50/30">
          <CardHeader>
            <CardTitle className="text-green-700 flex items-center gap-2">
              🪙 ERC20 Token Configuration
            </CardTitle>
            <CardDescription>
              Define the properties of your fungible token
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleERC20Submit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="erc20-name">Token Name *</Label>
                  <Input
                    id="erc20-name"
                    placeholder="e.g., My Awesome Token"
                    value={erc20FormData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setErc20FormData((prev: CreateERC20Input) => ({ ...prev, name: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="erc20-symbol">Symbol *</Label>
                  <Input
                    id="erc20-symbol"
                    placeholder="e.g., MAT"
                    value={erc20FormData.symbol}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setErc20FormData((prev: CreateERC20Input) => ({ ...prev, symbol: e.target.value }))
                    }
                    maxLength={10}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="erc20-supply">Total Supply *</Label>
                  <Input
                    id="erc20-supply"
                    placeholder="e.g., 1000000"
                    value={erc20FormData.total_supply}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setErc20FormData((prev: CreateERC20Input) => ({ ...prev, total_supply: e.target.value }))
                    }
                    pattern="^\d+$"
                    title="Must be a valid number"
                    required
                  />
                  <p className="text-xs text-gray-500">Enter the total number of tokens</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="erc20-decimals">Decimals *</Label>
                  <Input
                    id="erc20-decimals"
                    type="number"
                    min="0"
                    max="18"
                    value={erc20FormData.decimals}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setErc20FormData((prev: CreateERC20Input) => ({ ...prev, decimals: parseInt(e.target.value) || 18 }))
                    }
                    required
                  />
                  <p className="text-xs text-gray-500">Typically 18 for most tokens</p>
                </div>
              </div>
              
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                {isLoading ? 'Creating ERC20...' : '🪙 Create ERC20 Token'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="NFT">
        <Card className="border-purple-200 bg-purple-50/30">
          <CardHeader>
            <CardTitle className="text-purple-700 flex items-center gap-2">
              🎨 NFT Collection Configuration
            </CardTitle>
            <CardDescription>
              Define the properties of your non-fungible token collection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleNFTSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nft-name">Collection Name *</Label>
                  <Input
                    id="nft-name"
                    placeholder="e.g., Awesome Art Collection"
                    value={nftFormData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNftFormData((prev: CreateNFTInput) => ({ ...prev, name: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nft-symbol">Symbol *</Label>
                  <Input
                    id="nft-symbol"
                    placeholder="e.g., AAC"
                    value={nftFormData.symbol}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setNftFormData((prev: CreateNFTInput) => ({ ...prev, symbol: e.target.value }))
                    }
                    maxLength={10}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nft-base-uri">Base URI *</Label>
                <Input
                  id="nft-base-uri"
                  type="url"
                  placeholder="e.g., https://api.example.com/metadata/"
                  value={nftFormData.base_uri}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNftFormData((prev: CreateNFTInput) => ({ ...prev, base_uri: e.target.value }))
                  }
                  required
                />
                <p className="text-xs text-gray-500">Base URL for token metadata</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="nft-max-supply">Maximum Supply</Label>
                <Input
                  id="nft-max-supply"
                  placeholder="e.g., 10000 (leave empty for unlimited)"
                  value={nftFormData.maximum_supply || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNftFormData((prev: CreateNFTInput) => ({
                      ...prev,
                      maximum_supply: e.target.value || null
                    }))
                  }
                  pattern="^\d+$"
                  title="Must be a valid number"
                />
                <p className="text-xs text-gray-500">Optional: Leave empty for unlimited supply</p>
              </div>
              
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isLoading ? 'Creating NFT...' : '🎨 Create NFT Collection'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
