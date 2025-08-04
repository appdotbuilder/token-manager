
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import { ContractForm } from '@/components/ContractForm';
import { ContractList } from '@/components/ContractList';
import { EditContractDialog } from '@/components/EditContractDialog';
// Using type-only imports for better TypeScript compliance
import type { ContractWithProperties } from '../../server/src/schema';

function App() {
  // Explicit typing with ContractWithProperties interface
  const [contracts, setContracts] = useState<ContractWithProperties[]>([]);
  const [selectedContract, setSelectedContract] = useState<ContractWithProperties | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'manage'>('create');

  // useCallback to memoize function used in useEffect
  const loadContracts = useCallback(async () => {
    try {
      const result = await trpc.getContracts.query();
      setContracts(result);
    } catch (error) {
      console.error('Failed to load contracts:', error);
    }
  }, []); // Empty deps since trpc is stable

  // useEffect with proper dependencies
  useEffect(() => {
    loadContracts();
  }, [loadContracts]);

  const handleCreateSuccess = useCallback((newContract: ContractWithProperties) => {
    // Update contracts list with explicit typing in setState callback
    setContracts((prev: ContractWithProperties[]) => [...prev, newContract]);
    setActiveTab('manage'); // Switch to manage tab after creation
  }, []);

  const handleEditContract = useCallback((contract: ContractWithProperties) => {
    setSelectedContract(contract);
    setIsEditDialogOpen(true);
  }, []);

  const handleEditSuccess = useCallback((updatedContract: ContractWithProperties) => {
    setContracts((prev: ContractWithProperties[]) =>
      prev.map((contract: ContractWithProperties) =>
        contract.id === updatedContract.id ? updatedContract : contract
      )
    );
    setIsEditDialogOpen(false);
    setSelectedContract(null);
  }, []);

  const handleCloseEditDialog = useCallback(() => {
    setIsEditDialogOpen(false);
    setSelectedContract(null);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            🚀 Smart Contract Manager
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Define and manage properties of ERC20 tokens and NFT collections with ease
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white/60 backdrop-blur-sm border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Contracts</p>
                  <p className="text-2xl font-bold text-blue-600">{contracts.length}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-2xl">📋</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/60 backdrop-blur-sm border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ERC20 Tokens</p>
                  <p className="text-2xl font-bold text-green-600">
                    {contracts.filter((c: ContractWithProperties) => c.contract_type === 'ERC20').length}
                  </p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-2xl">🪙</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/60 backdrop-blur-sm border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">NFT Collections</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {contracts.filter((c: ContractWithProperties) => c.contract_type === 'NFT').length}
                  </p>
                </div>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <span className="text-2xl">🎨</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'create' | 'manage')} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/60 backdrop-blur-sm">
            <TabsTrigger value="create" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              ✨ Create Contract
            </TabsTrigger>
            <TabsTrigger value="manage" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
              📊 Manage Contracts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl text-gray-800">Create New Smart Contract</CardTitle>
                <CardDescription className="text-gray-600">
                  Choose between ERC20 token or NFT collection and define its properties
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContractForm 
                  onSuccess={handleCreateSuccess}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl text-gray-800">Contract Portfolio</CardTitle>
                    <CardDescription className="text-gray-600">
                      View and edit your smart contract definitions
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                    {contracts.length} {contracts.length === 1 ? 'Contract' : 'Contracts'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {contracts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📝</div>
                    <p className="text-xl text-gray-500 mb-2">No contracts created yet</p>
                    <p className="text-gray-400 mb-6">Start by creating your first ERC20 token or NFT collection</p>
                    <Button 
                      onClick={() => setActiveTab('create')}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                      ✨ Create Your First Contract
                    </Button>
                  </div>
                ) : (
                  <ContractList 
                    contracts={contracts}
                    onEdit={handleEditContract}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <EditContractDialog
          contract={selectedContract}
          isOpen={isEditDialogOpen}
          onClose={handleCloseEditDialog}
          onSuccess={handleEditSuccess}
        />

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            💡 Note: This application uses placeholder/stub data for demonstration purposes
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
