
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "@/components/Layout/MainLayout";
import PageHeader from "@/components/Common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Beaker, AlertTriangle, ArrowLeft, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Experiment } from "@/interfaces/experiment";
import { useExperiments } from "@/hooks/useExperiments";
import ExperimentMetricsPanel from "@/components/Experiments/ExperimentMetricsPanel";
import ExperimentPerformanceChart from "@/components/Experiments/ExperimentPerformanceChart";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ExperimentResults = () => {
  const navigate = useNavigate();
  const { id: experimentId = "" } = useParams<{ id: string }>();
  const [businessId, setBusinessId] = useState<string | null>(null);
  
  // Fetch the experiment details
  const { data: experiment, isLoading: experimentLoading, error: experimentError } = useQuery({
    queryKey: ['experiment', experimentId],
    queryFn: async () => {
      const response = await api.get(`/experiments/${experimentId}`);
      setBusinessId(response.data.businessId); // Set the businessId from the experiment
      return response.data as Experiment;
    }
  });

  const { useGetExperimentResults, updateExperimentStatus } = useExperiments(businessId || "");
  const { 
    data: results, 
    isLoading: resultsLoading, 
    error: resultsError 
  } = useGetExperimentResults(experimentId);

  const handleStopExperiment = () => {
    updateExperimentStatus.mutate(
      { id: experimentId, status: 'completed' },
      {
        onSuccess: () => {
          // Refresh the experiment data
          window.location.reload();
        }
      }
    );
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getStatusBadge = (status?: string) => {
    if (!status) return null;
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

  const isLoading = experimentLoading || resultsLoading || !businessId;
  const hasError = experimentError || resultsError;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-12 flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading experiment data...</p>
        </div>
      </MainLayout>
    );
  }

  if (hasError) {
    return (
      <MainLayout>
        <div className="container mx-auto py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load experiment data. Please try again.
            </AlertDescription>
          </Alert>
          <Button className="mt-4" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-3.5 w-3.5" />
              Back to Experiments
            </Button>
            <div className="mt-2">
              <PageHeader
                title={experiment?.name || "Experiment Results"}
                description={`Started on ${formatDate(experiment?.startDate)}`}
                icon={Beaker}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {getStatusBadge(experiment?.status)}
            {experiment?.status === 'active' && (
              <Button 
                variant="outline" 
                onClick={handleStopExperiment}
                disabled={updateExperimentStatus.isPending}
              >
                {updateExperimentStatus.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <XCircle className="mr-2 h-4 w-4" />
                )}
                Stop Experiment
              </Button>
            )}
          </div>
        </div>

        {results && (
          <ExperimentMetricsPanel results={results} />
        )}

        <div className="grid md:grid-cols-1 gap-6">
          {results && (
            <ExperimentPerformanceChart results={results} />
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Experiment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Duration</dt>
                  <dd>
                    {formatDate(experiment?.startDate)} to {formatDate(experiment?.endDate)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Traffic Split</dt>
                  <dd>{experiment?.split.original}% Original / {experiment?.split.variant}% Variant</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Content IDs</dt>
                  <dd className="break-all">
                    <div className="mb-1">Original: {experiment?.contentIdOriginal}</div>
                    <div>Variant: {experiment?.contentIdVariant}</div>
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistical Significance</CardTitle>
              <CardDescription>
                Confidence level and interpretation of results
              </CardDescription>
            </CardHeader>
            <CardContent>
              {results ? (
                <>
                  <div className="flex items-center gap-2 mb-4">
                    {results.isSignificant ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    )}
                    <span className="font-medium">
                      {results.isSignificant 
                        ? "Statistically Significant Results" 
                        : "Not Yet Statistically Significant"}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">P-Value</div>
                      <div>{results.pValue.toFixed(4)} (95% confidence threshold: 0.05)</div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Interpretation</div>
                      <div className="text-sm">
                        {results.isSignificant ? (
                          <span>
                            There is a {((1 - results.pValue) * 100).toFixed(1)}% chance that the observed difference 
                            between variants is not due to random chance.
                          </span>
                        ) : (
                          <span>
                            More data is needed to determine if the observed difference is statistically significant.
                            {experiment?.status === 'active' && " Continue running the experiment."}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Last Updated</div>
                      <div className="text-sm">{formatDate(results.lastUpdated)}</div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-4 text-center text-muted-foreground">
                  No results data available yet.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default ExperimentResults;
