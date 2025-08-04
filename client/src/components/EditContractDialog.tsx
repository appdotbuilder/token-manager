
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/utils/trpc';
import { useState, useEffect } from 'react';
// Type-only imports with correct relative path
import type { 
  ContractWithProperties, 
  UpdateERC20Input, 
  UpdateNFTInput 
} from '../../../server/src/schema';

interface EditContractDialogProps {
  contract: ContractWithProperties | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (contract: ContractWithProperties) => void;
}

export function EditContractDialog({ contract, isOpen, onClose, onSuccess }: EditContractDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  // ERC20 form state
  const [erc20FormData, setErc20FormData] = useState<Omit<UpdateERC20Input, 'id'>>({
    name: '',
    symbol: '',
    total_supply: '',
    decimals: 18
  });

  // NFT form state
  const [nftFormData, setNftFormData] = useState<Omit<UpdateNFTInput, 'id'>>({
    name: '',
    symbol: '',
    base_uri: '',
    maximum_supply: null
  });

  // Update form data when contract changes
  useEffect(() => {
    if (contract) {
      if (contract.contract_type === 'ERC20' && contract.erc20_properties) {
        setErc20FormData({
          name: contract.name,
          symbol: contract.symbol,
          total_supply: contract.erc20_properties.total_supply,
          decimals: contract.erc20_properties.decimals
        });
      } else if (contract.contract_type === 'NFT' && contract.nft_properties) {
        setNftFormData({
          name: contract.name,
          symbol: contract.symbol,
          base_uri: contract.nft_properties.base_uri,
          maximum_supply: contract.nft_properties.maximum_supply
        });
      }
    }
  }, [contract]);

  const handleERC20Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract) return;
    
    setIsLoading(true);
    try {
      const updateData: UpdateERC20Input = {
        id: contract.id,
        ...erc20FormData
      };
      const response = await trpc.updateERC20.mutate(updateData);
      onSuccess(response);
    } catch (error) {
      console.error('Failed to update ERC20 contract:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNFTSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract) return;
    
    setIsLoading(true);
    try {
      const updateData: UpdateNFTInput = {
        id: contract.id,
        ...nftFormData
      };
      const response = await trpc.updateNFT.mutate(updateData);
      onSuccess(response);
    } catch (error) {
      console.error('Failed to update NFT contract:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!contract) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">
              {contract.contract_type === 'ERC20' ? '🪙' : '🎨'}
            </span>
            Edit {contract.name}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Badge 
              variant="secondary"
              className={
                contract.contract_type === 'ERC20' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-purple-100 text-purple-700'
              }
            >
              {contract.contract_type}
            </Badge>
            <span>•</span>
            <span className="font-mono">{contract.symbol}</span>
          </DialogDescription>
        </DialogHeader>

        {contract.contract_type === 'ERC20' && (
          <form onSubmit={handleERC20Submit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-erc20-name">Token Name</Label>
              <Input
                id="edit-erc20-name"
                value={erc20FormData.name || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setErc20FormData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-erc20-symbol">Symbol</Label>
              <Input
                id="edit-erc20-symbol"
                value={erc20FormData.symbol || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setErc20FormData((prev) => ({ ...prev, symbol: e.target.value }))
                }
                maxLength={10}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-erc20-supply">Total Supply</Label>
              <Input
                id="edit-erc20-supply"
                value={erc20FormData.total_supply || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setErc20FormData((prev) => ({ ...prev, total_supply: e.target.value }))
                }
                pattern="^\d+$"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-erc20-decimals">Decimals</Label>
              <Input
                id="edit-erc20-decimals"
                type="number"
                min="0"
                max="18"
                value={erc20FormData.decimals || 18}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setErc20FormData((prev) => ({ ...prev, decimals: parseInt(e.target.value) || 18 }))
                }
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-green-500 hover:bg-green-600"
              >
                {isLoading ? 'Updating...' : 'Update ERC20'}
              </Button>
            </DialogFooter>
          </form>
        )}

        {contract.contract_type === 'NFT' && (
          <form onSubmit={handleNFTSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nft-name">Collection Name</Label>
              <Input
                id="edit-nft-name"
                value={nftFormData.name || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNftFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-nft-symbol">Symbol</Label>
              <Input
                id="edit-nft-symbol"
                value={nftFormData.symbol || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNftFormData((prev) => ({ ...prev, symbol: e.target.value }))
                }
                maxLength={10}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-nft-base-uri">Base URI</Label>
              <Input
                id="edit-nft-base-uri"
                type="url"
                value={nftFormData.base_uri || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNftFormData((prev) => ({ ...prev, base_uri: e.target.value }))
                }
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-nft-max-supply">Maximum Supply</Label>
              <Input
                id="edit-nft-max-supply"
                value={nftFormData.maximum_supply || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNftFormData((prev) => ({
                    ...prev,
                    maximum_supply: e.target.value || null
                  }))
                }
                pattern="^\d+$"
                placeholder="Leave empty for unlimited"
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-purple-500 hover:bg-purple-600"
              >
                {isLoading ? 'Updating...' : 'Update NFT'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
