
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { InsightData } from "@/interfaces/analytics";

interface InsightsPanelProps {
  isLoading: boolean;
  error: any;
  insightsData: InsightData | null;
}

const InsightsPanel = ({ isLoading, error, insightsData }: InsightsPanelProps) => {
  if (isLoading) {
    return (
      <div className="h-40 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-destructive">
            Error loading insights. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!insightsData || !insightsData.patternInsights || insightsData.patternInsights.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            No insights available yet. Run more ads to generate insights.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <div className="space-y-4">
          {insightsData.patternInsights.map((insight: any, index: number) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-lg">{insight.element}</p>
                  <p className="text-sm text-muted-foreground capitalize">{insight.elementType}</p>
                </div>
                <div className="bg-primary/10 text-primary px-2 py-1 rounded">
                  +{(insight.performance.uplift * 100).toFixed(0)}% CTR
                </div>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">With Element</p>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div>
                      <p className="text-sm font-medium">CTR</p>
                      <p>{(insight.performance.withElement.ctr * 100).toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Sample</p>
                      <p>{insight.performance.withElement.sampleSize} ads</p>
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Without Element</p>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div>
                      <p className="text-sm font-medium">CTR</p>
                      <p>{(insight.performance.withoutElement.ctr * 100).toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Sample</p>
                      <p>{insight.performance.withoutElement.sampleSize} ads</p>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {(insight.performance.confidence * 100).toFixed(0)}% confidence level
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default InsightsPanel;
