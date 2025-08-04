
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
// Type-only import with correct relative path
import type { ContractWithProperties } from '../../../server/src/schema';

interface ContractListProps {
  contracts: ContractWithProperties[];
  onEdit: (contract: ContractWithProperties) => void;
}

export function ContractList({ contracts, onEdit }: ContractListProps) {
  const formatSupply = (supply: string): string => {
    const num = parseInt(supply);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return supply;
  };

  return (
    <div className="grid gap-4">
      {contracts.map((contract: ContractWithProperties) => (
        <Card key={contract.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl">
                  {contract.contract_type === 'ERC20' ? '🪙' : '🎨'}
                </div>
                <div>
                  <CardTitle className="text-lg text-gray-800">{contract.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
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
                    <span className="text-gray-500">•</span>
                    <span className="font-mono text-sm">{contract.symbol}</span>
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(contract)}
                className="hover:bg-blue-50 hover:border-blue-200"
              >
                ✏️ Edit
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            {contract.contract_type === 'ERC20' && contract.erc20_properties && (
              <div className="space-y-3">
                <Separator />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 font-medium">Total Supply</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatSupply(contract.erc20_properties.total_supply)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">Decimals</p>
                    <p className="text-lg font-bold text-green-600">
                      {contract.erc20_properties.decimals}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-gray-500 font-medium">Created</p>
                    <p className="text-sm text-gray-700">
                      {contract.created_at.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {contract.contract_type === 'NFT' && contract.nft_properties && (
              <div className="space-y-3">
                <Separator />
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500 font-medium">Maximum Supply</p>
                      <p className="text-lg font-bold text-purple-600">
                        {contract.nft_properties.maximum_supply 
                          ? formatSupply(contract.nft_properties.maximum_supply)
                          : 'Unlimited ∞'
                        }
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 font-medium">Created</p>
                      <p className="text-sm text-gray-700">
                        {contract.created_at.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium mb-1">Base URI</p>
                    <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded font-mono break-all">
                      {contract.nft_properties.base_uri}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
