
import { useState, useEffect } from "react";
import MainLayout from "../components/Layout/MainLayout";
import PageHeader from "../components/Common/PageHeader";
import PlatformConnector from "../components/PlatformIntegration/PlatformConnector";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdPlatform } from "@/interfaces/types";
import { toast } from "sonner";
import { useParams } from "react-router-dom";

const PlatformIntegration = () => {
  // In a real app, this would come from the route params or auth context
  const [businessId, setBusinessId] = useState("123");

  const handlePlatformConnected = (platform: AdPlatform) => {
    toast.success(`${platform.name} connected successfully!`);
  };

  return (
    <MainLayout>
      <PageHeader 
        title="Platform Integration" 
        description="Connect and manage your advertising platforms"
      />
      
      <Tabs defaultValue="platforms" className="space-y-6">
        <TabsList>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="data">Data Settings</TabsTrigger>
          <TabsTrigger value="sync">Sync History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="platforms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Connect Platforms</CardTitle>
              <CardDescription>
                Connect your advertising accounts to analyze performance and generate optimized ads.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PlatformConnector 
                onConnected={handlePlatformConnected} 
                businessId={businessId}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Data Settings</CardTitle>
              <CardDescription>
                Configure how data is imported and processed from your platforms.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                Data settings coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sync">
          <Card>
            <CardHeader>
              <CardTitle>Sync History</CardTitle>
              <CardDescription>
                View the history of data synchronization from your connected platforms.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                No sync history available yet
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
};

export default PlatformIntegration;
