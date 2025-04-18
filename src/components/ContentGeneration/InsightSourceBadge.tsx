
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Link as LinkIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface InsightSourceBadgeProps {
  insightId: string;
  elementText: string;
}

const InsightSourceBadge = ({ insightId, elementText }: InsightSourceBadgeProps) => {
  const shortText = elementText.length > 30 ? elementText.substring(0, 30) + "..." : elementText;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link to={`/analytics?insightId=${insightId}`} className="no-underline">
            <Badge variant="outline" className="flex items-center gap-1 border-purple-300 text-purple-700 hover:bg-purple-50">
              <LinkIcon className="h-3 w-3" />
              <span>Variation of Insight</span>
            </Badge>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p>Based on winning element: "{shortText}"</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default InsightSourceBadge;
