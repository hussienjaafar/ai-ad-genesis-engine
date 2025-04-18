
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import { useAgencies } from '@/hooks/useAgencies';
import KpiCard from '@/components/Analytics/KpiCard';
import AgencyClients from '@/components/Agency/AgencyClients';
import { ChartContainer } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Loader2 } from 'lucide-react';

const AgencyOverview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  const { useAgencyOverview, useGetAgency } = useAgencies();
  
  const { 
    data: agency,
    isLoading: isAgencyLoading
  } = useGetAgency(id || '');
  
  const { 
    data: overview,
    isLoading: isOverviewLoading,
    error: overviewError
  } = useAgencyOverview(id || '');
  
  const isLoading = isAgencyLoading || isOverviewLoading;
  
  const handleSelectBusiness = (businessId: string) => {
    navigate(`/businesses/${businessId}`);
  };
  
  const spendChartData = overview?.clientBreakdown.map(client => ({
    name: client.businessName,
    spend: client.spend,
    impressions: client.impressions,
    clicks: client.clicks
  })) || [];
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate('/agencies')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold">
            {isAgencyLoading ? 'Loading...' : agency?.name}
          </h1>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="clients">Manage Clients</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : overviewError ? (
              <div className="p-6 text-center text-destructive">
                Failed to load agency overview. Please try again.
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <KpiCard
                    title="Total Spend"
                    value={overview?.aggregatedKPIs.totalSpend || 0}
                    change={5} // Placeholder
                    unit="currency"
                    isPositiveGood={false}
                  />
                  <KpiCard
                    title="Average CTR"
                    value={overview?.aggregatedKPIs.avgCTR || 0}
                    change={2.3} // Placeholder
                    unit="percentage"
                    isPositiveGood={true}
                  />
                  <KpiCard
                    title="Total Impressions"
                    value={overview?.aggregatedKPIs.totalImpressions || 0}
                    change={8.1} // Placeholder
                    unit="number"
                    isPositiveGood={true}
                  />
                  <KpiCard
                    title="Total Clicks"
                    value={overview?.aggregatedKPIs.totalClicks || 0}
                    change={10.4} // Placeholder
                    unit="number"
                    isPositiveGood={true}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="col-span-1">
                    <CardHeader>
                      <CardTitle>Spend By Client</CardTitle>
                      <CardDescription>
                        Comparing ad spend across businesses
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ChartContainer config={{
                          spend: { 
                            theme: { light: '#0ea5e9', dark: '#0ea5e9' },
                            label: 'Spend ($)'
                          }
                        }}>
                          <BarChart data={spendChartData}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="spend" fill="var(--color-spend)" />
                          </BarChart>
                        </ChartContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="col-span-1">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Active Experiments</CardTitle>
                        <CardDescription>
                          Current experiments across clients
                        </CardDescription>
                      </div>
                      <Select onValueChange={handleSelectBusiness}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="View business" />
                        </SelectTrigger>
                        <SelectContent>
                          {overview?.clientBreakdown.map(client => (
                            <SelectItem key={client.businessId} value={client.businessId}>
                              {client.businessName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardHeader>
                    <CardContent>
                      {overview?.activeExperiments.length === 0 ? (
                        <div className="text-center p-4 bg-muted/50 rounded-md">
                          <p className="text-muted-foreground">No active experiments</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Business</TableHead>
                                <TableHead>Lift</TableHead>
                                <TableHead>Confidence</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {overview?.activeExperiments.map(exp => (
                                <TableRow key={exp.id} className="cursor-pointer" onClick={() => navigate(`/experiments/${exp.id}`)}>
                                  <TableCell className="font-medium">{exp.name}</TableCell>
                                  <TableCell>{exp.businessName}</TableCell>
                                  <TableCell className={exp.lift > 0 ? 'text-green-600' : 'text-red-600'}>
                                    {exp.lift > 0 ? '+' : ''}{exp.lift.toFixed(2)}%
                                  </TableCell>
                                  <TableCell>{exp.confidence.toFixed(2)}%</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="clients">
            {isAgencyLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              agency && <AgencyClients agency={agency} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AgencyOverview;
