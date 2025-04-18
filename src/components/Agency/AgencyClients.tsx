
import React, { useState } from 'react';
import { useAgencies } from '@/hooks/useAgencies';
import { useBusinesses } from '@/hooks/useBusinesses';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Check, PlusIcon, XIcon } from 'lucide-react';
import { Agency } from '@/interfaces/agency';
import { BusinessProfile } from '@/interfaces/types';

interface AgencyClientsProps {
  agency: Agency;
}

const AgencyClients = ({ agency }: AgencyClientsProps) => {
  const { updateAgencyClients } = useAgencies();
  const { useGetAllBusinesses } = useBusinesses();
  const { data: businesses, isLoading } = useGetAllBusinesses();
  
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>('');
  
  const updateClientsMutation = updateAgencyClients(agency._id);
  
  // Filter businesses that are not already in the agency
  const availableBusinesses = businesses?.filter(
    business => !agency.clientBusinessIds.includes(business.id)
  ) || [];
  
  // Get businesses that are in the agency
  const agencyBusinesses = businesses?.filter(
    business => agency.clientBusinessIds.includes(business.id)
  ) || [];
  
  const handleAddClient = () => {
    if (!selectedBusinessId) return;
    
    updateClientsMutation.mutate({
      action: 'add',
      clientBusinessIds: [selectedBusinessId]
    }, {
      onSuccess: () => {
        setIsAddClientModalOpen(false);
        setSelectedBusinessId('');
      }
    });
  };
  
  const handleRemoveClient = (businessId: string) => {
    updateClientsMutation.mutate({
      action: 'remove',
      clientBusinessIds: [businessId]
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Agency Clients</h2>
        <Button onClick={() => setIsAddClientModalOpen(true)} disabled={availableBusinesses.length === 0}>
          <PlusIcon className="mr-2 h-4 w-4" /> Add Client
        </Button>
      </div>
      
      {agencyBusinesses.length === 0 ? (
        <div className="text-center p-8 border rounded-lg bg-muted/50">
          <p className="text-muted-foreground">No clients added to this agency yet</p>
          <Button 
            className="mt-4" 
            onClick={() => setIsAddClientModalOpen(true)}
            disabled={availableBusinesses.length === 0}
          >
            Add Client
          </Button>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business Name</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agencyBusinesses.map((business) => (
                <TableRow key={business.id}>
                  <TableCell className="font-medium">{business.name}</TableCell>
                  <TableCell>{business.industry}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleRemoveClient(business.id)}
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      <Dialog open={isAddClientModalOpen} onOpenChange={setIsAddClientModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Client to Agency</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {availableBusinesses.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No available businesses to add. Create a business first.
              </p>
            ) : (
              <>
                <div className="mb-4">
                  <Select value={selectedBusinessId} onValueChange={setSelectedBusinessId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a business" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableBusinesses.map((business) => (
                        <SelectItem key={business.id} value={business.id}>
                          {business.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddClientModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleAddClient}
              disabled={updateClientsMutation.isPending || !selectedBusinessId || availableBusinesses.length === 0}
            >
              {updateClientsMutation.isPending ? 'Adding...' : 'Add Client'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgencyClients;
