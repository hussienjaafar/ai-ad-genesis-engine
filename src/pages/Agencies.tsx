
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import { useAgencies } from '@/hooks/useAgencies';
import { Button } from '@/components/ui/button';
import { PlusIcon, Settings } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

const Agencies = () => {
  const navigate = useNavigate();
  const { useGetAgencies, createAgency } = useAgencies();
  const { data: agencies, isLoading, error } = useGetAgencies();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newAgencyName, setNewAgencyName] = useState('');

  const handleCreateAgency = () => {
    if (!newAgencyName.trim()) return;
    
    createAgency.mutate({ name: newAgencyName }, {
      onSuccess: () => {
        setIsCreateModalOpen(false);
        setNewAgencyName('');
      }
    });
  };

  const handleViewAgency = (agencyId: string) => {
    navigate(`/agencies/${agencyId}/overview`);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Agencies</h1>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <PlusIcon className="mr-2 h-4 w-4" /> Create Agency
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-4 text-center text-destructive">
            Failed to load agencies. Please try again.
          </div>
        ) : agencies?.length === 0 ? (
          <div className="text-center p-8 border rounded-lg bg-muted/50">
            <h3 className="font-medium text-lg mb-2">No agencies found</h3>
            <p className="text-muted-foreground mb-4">Create your first agency to get started</p>
            <Button onClick={() => setIsCreateModalOpen(true)}>Create Agency</Button>
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Clients</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agencies?.map((agency) => (
                  <TableRow key={agency._id}>
                    <TableCell className="font-medium">{agency.name}</TableCell>
                    <TableCell>{format(new Date(agency.createdAt), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{agency.clientBusinessIds.length}</TableCell>
                    <TableCell className="text-right">
                      <div className="space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewAgency(agency._id)}
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/agencies/${agency._id}/manage`)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Agency</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="agency-name">Agency Name</Label>
              <Input
                id="agency-name"
                value={newAgencyName}
                onChange={(e) => setNewAgencyName(e.target.value)}
                placeholder="Enter agency name"
                className="mt-2"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
              <Button 
                onClick={handleCreateAgency}
                disabled={createAgency.isPending || !newAgencyName.trim()}
              >
                {createAgency.isPending ? 'Creating...' : 'Create Agency'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default Agencies;
