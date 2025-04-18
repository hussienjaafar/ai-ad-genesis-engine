
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useExperiments } from "@/hooks/useExperiments";
import MainLayout from "@/components/Layout/MainLayout";
import PageHeader from "@/components/Common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Beaker, ArrowUpRight, CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Experiment } from "@/interfaces/experiment";
import CreateExperimentModal from "@/components/Experiments/CreateExperimentModal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";

const ExperimentsPage = () => {
  const { id: businessId = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const { useGetExperiments } = useExperiments(businessId);
  const { data: experiments, isLoading, error } = useGetExperiments();

  const getStatusBadge = (status: Experiment['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Completed</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Paused</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const getStatusIcon = (status: Experiment['status']) => {
    switch (status) {
      case 'active':
        return <Clock className="h-4 w-4 text-green-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'paused':
        return <XCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const daysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const viewResults = (experimentId: string) => {
    navigate(`/experiments/${experimentId}`);
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <PageHeader
            title="A/B Test Experiments"
            description="Create and manage A/B tests to optimize your content performance"
            icon={Beaker}
          />
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Experiment
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Active Experiments</CardTitle>
            <CardDescription>
              Comparing original and variant content performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-8">
                Error loading experiments. Please try again.
              </div>
            ) : experiments && experiments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                    <TableHead className="hidden md:table-cell">Duration</TableHead>
                    <TableHead>Split</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {experiments.map((experiment) => (
                    <TableRow key={experiment._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          {getStatusIcon(experiment.status)}
                          <span className="ml-2">{experiment.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {getStatusBadge(experiment.status)}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div>
                          {formatDate(experiment.startDate)} - {formatDate(experiment.endDate)}
                        </div>
                        {experiment.status === 'active' && (
                          <div className="text-xs text-muted-foreground">
                            {daysRemaining(experiment.endDate)} days remaining
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {experiment.split.original}/{experiment.split.variant}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-8 px-2 lg:px-3"
                          onClick={() => viewResults(experiment._id)}
                        >
                          Results
                          <ArrowUpRight className="ml-2 h-3 w-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No experiments found. Click 'Create Experiment' to get started.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {isCreateModalOpen && (
        <CreateExperimentModal 
          businessId={businessId} 
          onClose={() => setIsCreateModalOpen(false)} 
        />
      )}
    </MainLayout>
  );
};

export default ExperimentsPage;
