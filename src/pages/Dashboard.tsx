
import { useState } from "react";
import MainLayout from "../components/Layout/MainLayout";
import PageHeader from "../components/Common/PageHeader";
import DashboardOverview from "../components/Dashboard/DashboardOverview";
import PerformanceMetrics from "../components/Dashboard/PerformanceMetrics";
import RecentActivity from "../components/Dashboard/RecentActivity";
import { Button } from "@/components/ui/button";
import { CalendarIcon, RefreshCcwIcon, ZapIcon } from "lucide-react";

const Dashboard = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <MainLayout>
      <PageHeader 
        title="Dashboard" 
        description="Overview of your advertising performance"
        actions={
          <>
            <Button variant="outline" size="sm" className="hidden md:flex">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Last 30 days
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCcwIcon className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button size="sm">
              <ZapIcon className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </>
        }
      />
      
      <div className="space-y-8">
        <DashboardOverview />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <PerformanceMetrics />
          </div>
          
          <div>
            <RecentActivity />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
