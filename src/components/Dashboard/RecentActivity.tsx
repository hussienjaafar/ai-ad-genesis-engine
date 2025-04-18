
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockActivities, mockGeneratedAds } from "@/lib/mockData";
import { 
  MessageSquareTextIcon, 
  ImageIcon, 
  LightbulbIcon,
  VideoIcon,
  AlertCircleIcon,
  LinkIcon
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const RecentActivity = () => {
  const recentActivities = [...mockActivities].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "ad_created":
        return <ImageIcon className="h-5 w-5 text-brand-600" />;
      case "insight_generated":
        return <LightbulbIcon className="h-5 w-5 text-insight-500" />;
      case "platform_connected":
        return <LinkIcon className="h-5 w-5 text-success-600" />;
      default:
        return <AlertCircleIcon className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {recentActivities.map((activity) => (
            <div key={activity.id} className="flex gap-3">
              <div className="flex-shrink-0 rounded-full p-2 bg-muted flex items-center justify-center">
                {getActivityIcon(activity.type)}
              </div>
              <div>
                <p className="font-medium">{activity.description}</p>
                <p className="text-sm text-muted-foreground">
                  {formatTimeAgo(activity.timestamp)}
                </p>
              </div>
            </div>
          ))}

          {recentActivities.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No recent activities to show</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
